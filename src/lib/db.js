import { supabase } from './supabase'
import { CURRENT_SEASON } from '../data/seasons'
import { DEFAULT_TEMPLATES } from '../data/messageTemplates'

// ---- Registrations / teams -------------------------------------------------

// Public: submit a team registration (lands as a 'pending' team).
// Maps the form fields to the actual `teams` columns (form uses team_name -> name).
export async function submitRegistration(form) {
  const row = {
    name: form.team_name,
    captain_name: form.captain_name,
    captain_phone: form.captain_phone,
    captain_email: form.captain_email,
    vice_captain_name: form.vice_captain_name,
    vice_captain_phone: form.vice_captain_phone,
    players: form.players,
    notes: form.notes,
    status: 'pending',
    season: CURRENT_SEASON,
  }
  const { error } = await supabase.from('teams').insert([row])
  if (error) throw new Error(error.message)
}

// Committee: every team for a season (any status).
export async function fetchAllTeams(season = CURRENT_SEASON) {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('season', season)
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return data || []
}

// Public: only approved teams for a season.
export async function fetchApprovedTeams(season = CURRENT_SEASON) {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('season', season)
    .eq('status', 'approved')
    .order('grp', { ascending: true })
  if (error) throw new Error(error.message)
  return data || []
}

// Committee: patch a team (approve/reject, assign group, set short/colour...).
export async function updateTeam(id, patch) {
  const { error } = await supabase.from('teams').update(patch).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteTeam(id) {
  const { error } = await supabase.from('teams').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ---- Matches / fixtures / scores ------------------------------------------

export async function fetchMatches(season = CURRENT_SEASON) {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('season', season)
    .order('code', { ascending: true })
  if (error) throw new Error(error.message)
  return data || []
}

// Build the [home, away] pairings for one group.
//   matchesPerTeam 'all' -> full round-robin (every pair once)
//   matchesPerTeam  N    -> each team plays exactly N, via the circle method:
//     fix the first team, rotate the rest; each round is a set of disjoint
//     pairings, so the first N rounds give every team N distinct opponents.
//     (e.g. 6 teams x 3 rounds = 9 matches, everyone plays 3.)
function groupPairings(gt, matchesPerTeam) {
  const n = gt.length
  const full = matchesPerTeam === 'all' || matchesPerTeam == null || matchesPerTeam >= n - 1
  if (full) {
    const pairs = []
    for (let i = 0; i < n; i++)
      for (let j = i + 1; j < n; j++) pairs.push([gt[i], gt[j]])
    return pairs
  }
  const arr = gt.slice()
  if (arr.length % 2 === 1) arr.push(null) // odd count -> rotating bye
  const m = arr.length
  const pairs = []
  for (let r = 0; r < matchesPerTeam; r++) {
    for (let i = 0; i < m / 2; i++) {
      const a = arr[i], b = arr[m - 1 - i]
      if (a && b) pairs.push([a, b]) // skip the bye
    }
    arr.splice(1, 0, arr.pop()) // rotate everything except the fixed first team
  }
  return pairs
}

// Generate the group-stage fixtures from the approved+grouped teams.
// `matchesPerTeam` controls the schedule ('all' round-robin, or a fixed count per
// team). Returns the inserted match rows. Does nothing for groups with < 2 teams.
export async function generateGroupFixtures(season, teams, matchesPerTeam = 'all') {
  const byGroup = {}
  teams.filter((t) => t.grp).forEach((t) => { (byGroup[t.grp] ||= []).push(t) })

  const rows = []
  Object.keys(byGroup).sort().forEach((g) => {
    groupPairings(byGroup[g], matchesPerTeam).forEach(([home, away], i) => {
      rows.push({
        season, stage: 'group', grp: g, code: `${g}${i + 1}`,
        home_team: home.id, away_team: away.id, status: 'scheduled',
      })
    })
  })
  if (rows.length === 0) return []
  const { data, error } = await supabase.from('matches').insert(rows).select()
  if (error) throw new Error(error.message)
  return data || []
}

// Save a match result (marks it completed).
export async function saveMatchScore(id, score) {
  const { error } = await supabase.from('matches').update({
    home_runs: score.home_runs, home_wkts: score.home_wkts, home_overs: score.home_overs,
    away_runs: score.away_runs, away_wkts: score.away_wkts, away_overs: score.away_overs,
    status: 'completed',
  }).eq('id', id)
  if (error) throw new Error(error.message)
}

// Remove all group-stage matches for a season (to redo the draw / fixtures).
export async function clearGroupFixtures(season = CURRENT_SEASON) {
  const { error } = await supabase.from('matches').delete().eq('season', season).eq('stage', 'group')
  if (error) throw new Error(error.message)
}

// ---- Knockouts -------------------------------------------------------------

// Save a knockout result (QF/SF/FINAL). Knockout rows aren't pre-generated — the
// bracket is computed live from the seeding, so each row is written when its
// score is entered (upsert by season+code). `winner` is stored so ties can be
// resolved explicitly if ever needed.
export async function saveKnockoutScore(season, code, homeId, awayId, score) {
  const winner =
    score.home_runs > score.away_runs ? homeId
    : score.away_runs > score.home_runs ? awayId
    : null
  const row = {
    season, stage: 'knockout', grp: null, code,
    home_team: homeId, away_team: awayId,
    home_runs: score.home_runs, home_wkts: score.home_wkts, home_overs: score.home_overs,
    away_runs: score.away_runs, away_wkts: score.away_wkts, away_overs: score.away_overs,
    winner, status: 'completed',
  }
  const { data: existing, error: selErr } = await supabase
    .from('matches').select('id')
    .eq('season', season).eq('stage', 'knockout').eq('code', code)
    .maybeSingle()
  if (selErr) throw new Error(selErr.message)

  const q = existing
    ? supabase.from('matches').update(row).eq('id', existing.id)
    : supabase.from('matches').insert([row])
  const { error } = await q
  if (error) throw new Error(error.message)
}

// Remove all knockout matches for a season (to reset the bracket).
export async function clearKnockouts(season = CURRENT_SEASON) {
  const { error } = await supabase.from('matches').delete().eq('season', season).eq('stage', 'knockout')
  if (error) throw new Error(error.message)
}

// ---- Messaging (SMS) -------------------------------------------------------

export async function fetchMessagingSettings() {
  const { data, error } = await supabase.from('messaging_settings').select('*').eq('id', 1).maybeSingle()
  if (error) throw new Error(error.message)
  return data || { id: 1, enabled: false, test_mode: true, test_number: '' }
}

export async function updateMessagingSettings(patch) {
  const { error } = await supabase.from('messaging_settings').update(patch).eq('id', 1)
  if (error) throw new Error(error.message)
}

// Fetch templates, seeding the table from the app defaults on first use and
// backfilling any default keys added in later releases (the table seeds once, so
// new defaults wouldn't otherwise appear for existing tournaments).
export async function fetchTemplates() {
  const asRow = ({ key, label, body, sort }) => ({ key, label, body, sort, enabled: true })
  let { data, error } = await supabase.from('message_templates').select('*').order('sort', { ascending: true })
  if (error) throw new Error(error.message)

  const existing = new Set((data || []).map((t) => t.key))
  const missing = DEFAULT_TEMPLATES.filter((t) => !existing.has(t.key)).map(asRow)
  if (missing.length > 0) {
    const { error: seedErr } = await supabase.from('message_templates').insert(missing)
    if (seedErr) throw new Error(seedErr.message)
    ;({ data, error } = await supabase.from('message_templates').select('*').order('sort', { ascending: true }))
    if (error) throw new Error(error.message)
  }
  return data || []
}

export async function updateTemplate(key, patch) {
  const { error } = await supabase.from('message_templates').update(patch).eq('key', key)
  if (error) throw new Error(error.message)
}

export async function fetchMessageLog(limit = 50) {
  const { data, error } = await supabase
    .from('message_log').select('*')
    .order('created_at', { ascending: false }).limit(limit)
  if (error) throw new Error(error.message)
  return data || []
}

// Invoke the send-sms Edge Function. Returns { sent, failed, skipped, redirected, results }.
export async function sendSms({ test = false, season = CURRENT_SEASON, messages }) {
  const { data, error } = await supabase.functions.invoke('send-sms', { body: { test, season, messages } })
  if (error) throw new Error(error.message)
  return data
}
