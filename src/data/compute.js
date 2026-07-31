import { OVERS_PER_INNINGS } from './fixtures'

// ============================================================================
//  Pure standings engine for LIVE data (Supabase teams + matches).
//  Mirrors the NRR / points rules in standings.js, but operates on plain
//  arrays so the admin panel and public 2026 pages can share it.
//    teams:   [{ id, name, short, color, grp }]
//    matches: DB rows (see normalizeMatch)
// ============================================================================

const WIN_POINTS = 2
const TIE_POINTS = 1
const WICKETS_ALL_OUT = 5

function oversToDecimal(overs) {
  const o = Number(overs) || 0
  const whole = Math.floor(o)
  const balls = Math.round((o - whole) * 10)
  return whole + balls / 6
}

// Overs credited for NRR: actual overs faced, unless bowled out (full quota).
function creditedOvers(runs, wickets, overs) {
  if (Number(wickets) >= WICKETS_ALL_OUT) return OVERS_PER_INNINGS
  return oversToDecimal(overs)
}

// A match row is "played" only when both innings have run totals recorded.
export function isPlayed(m) {
  return m.status === 'completed' && m.home_runs != null && m.away_runs != null
}

// Who won a completed match — { winnerId, tied, margin } — or null while it is
// still unplayed. `margin` is the plain run difference: the DB doesn't record
// which side batted first, so the "won by N wickets" convention can't be derived.
export function matchOutcome(m) {
  if (!isPlayed(m)) return null
  if (m.home_runs === m.away_runs) return { winnerId: null, tied: true, margin: 0 }
  const homeWon = m.home_runs > m.away_runs
  return {
    winnerId: homeWon ? m.home_team : m.away_team,
    tied: false,
    margin: Math.abs(m.home_runs - m.away_runs),
  }
}

export function normalizeMatch(m) {
  return {
    id: m.id,
    grp: m.grp,
    code: m.code,
    stage: m.stage,
    homeId: m.home_team,
    awayId: m.away_team,
    status: m.status,
    home: { runs: m.home_runs, wickets: m.home_wkts, overs: m.home_overs },
    away: { runs: m.away_runs, wickets: m.away_wkts, overs: m.away_overs },
  }
}

function blankRow(team) {
  return {
    teamId: team.id, grp: team.grp,
    played: 0, won: 0, lost: 0, tied: 0, points: 0,
    runsFor: 0, oversFor: 0, runsAgainst: 0, oversAgainst: 0,
    nrr: 0, wicketsLost: 0, arpw: 0, form: [],
  }
}

// Returns { [teamId]: row } computed from completed matches.
export function computeRows(teams, matches) {
  const rows = {}
  teams.forEach((t) => (rows[t.id] = blankRow(t)))

  matches.filter(isPlayed).forEach((m) => {
    const h = rows[m.home_team]
    const a = rows[m.away_team]
    if (!h || !a) return // team not in the provided list (e.g. not approved)

    const hOv = creditedOvers(m.home_runs, m.home_wkts, m.home_overs)
    const aOv = creditedOvers(m.away_runs, m.away_wkts, m.away_overs)

    h.played++; a.played++
    h.runsFor += m.home_runs; h.oversFor += hOv; h.wicketsLost += Number(m.home_wkts) || 0
    h.runsAgainst += m.away_runs; h.oversAgainst += aOv
    a.runsFor += m.away_runs; a.oversFor += aOv; a.wicketsLost += Number(m.away_wkts) || 0
    a.runsAgainst += m.home_runs; a.oversAgainst += hOv

    if (m.home_runs > m.away_runs) {
      h.won++; h.points += WIN_POINTS; h.form.push('W'); a.lost++; a.form.push('L')
    } else if (m.away_runs > m.home_runs) {
      a.won++; a.points += WIN_POINTS; a.form.push('W'); h.lost++; h.form.push('L')
    } else {
      h.tied++; h.points += TIE_POINTS; h.form.push('T')
      a.tied++; a.points += TIE_POINTS; a.form.push('T')
    }
  })

  Object.values(rows).forEach((r) => {
    const rrFor = r.oversFor > 0 ? r.runsFor / r.oversFor : 0
    const rrAgainst = r.oversAgainst > 0 ? r.runsAgainst / r.oversAgainst : 0
    r.nrr = rrFor - rrAgainst
    // ARPW: a side that never lost a wicket has no meaningful average, so its
    // total runs stand in. Mirrors averageRunsPerWicket() in standings.js.
    r.arpw = r.wicketsLost > 0 ? r.runsFor / r.wicketsLost : r.runsFor
  })
  return rows
}

export const indexById = (teams) => Object.fromEntries(teams.map((t) => [t.id, t]))

// Group standings must ignore knockout matches (they carry no group).
const isGroupMatch = (m) => m.grp != null && m.stage !== 'knockout'

// Group matches still to be played. Until this hits zero the standings are
// provisional: with nothing played every team is level on 0 points, so a naive
// "top two per group" would seed the bracket with real names before a ball is
// bowled. Also drives the "N still to play" copy on the bracket pages.
export function groupMatchesRemaining(matches) {
  return matches.filter(isGroupMatch).filter((m) => !isPlayed(m)).length
}

export function groupMatchesPlayed(matches) {
  return matches.filter(isGroupMatch).filter(isPlayed).length
}

export function groupStageComplete(matches) {
  const group = matches.filter(isGroupMatch)
  return group.length > 0 && group.every(isPlayed)
}

// { A: [sortedRows], B: [...], ... } — only teams that have a group.
export function standingsByGroup(teams, matches) {
  const rows = computeRows(teams, matches.filter(isGroupMatch))
  const out = {}
  teams.filter((t) => t.grp).forEach((t) => {
    ;(out[t.grp] ||= []).push(rows[t.id])
  })
  Object.keys(out).forEach((g) => {
    out[g].sort(bySeedRank)
  })
  return out
}

// ---- Super 8 / knockout bracket (LIVE data) --------------------------------
//  Mirrors src/data/knockout.js but operates on the flat live rows so the public
//  Knockouts page and the admin panel can build the bracket from Supabase data.

const SUPER8_SIZE = 8
// Points -> NRR -> ARPW, per the official tie-breakers (Wins is a final
// fallback so the sort stays deterministic when even ARPW is level).
const bySeedRank = (a, b) =>
  b.points - a.points || b.nrr - a.nrr || b.arpw - a.arpw || b.won - a.won

// The 8 qualifiers, seeded 1..8, per the format's `qualify` rule.
//   'pure-pool'          -> top 8 overall by Points -> NRR -> ARPW
//   'winners-runnersup'  -> every group winner + best runners-up
// Every team ranked across the whole tournament, 1..N, by the official
// tie-breakers. Each row carries its group and position within it, because the
// Super 8 rule can promote a group winner ahead of a higher-ranked team from a
// stronger group — the overall rank alone doesn't tell you who goes through.
export function overallStandings(teams, matches) {
  const byGroup = standingsByGroup(teams, matches)
  const rows = []
  Object.keys(byGroup).forEach((g) => {
    byGroup[g].forEach((row, i) => rows.push({ ...row, group: g, groupPos: i + 1 }))
  })
  return rows.sort(bySeedRank).map((r, i) => ({ ...r, rank: i + 1 }))
}

// Who would go through on the table as it stands. Provisional: valid mid-stage,
// which is what the public points table wants for its qualification highlight.
export function projectedSuper8(teams, matches, format) {
  // A side that hasn't taken the field yet can't be shown as qualifying: on zero
  // points it ranks by nothing but array order. Early on this means fewer than
  // eight are highlighted, which is the honest answer.
  const rows = overallStandings(teams, matches).filter((r) => r.played > 0)
  let qualifiers
  if (format?.qualify === 'pure-pool') {
    qualifiers = rows.slice(0, SUPER8_SIZE)
  } else {
    const winners = rows.filter((r) => r.groupPos === 1)
    const runnersUp = rows.filter((r) => r.groupPos === 2)
    const remaining = Math.max(0, SUPER8_SIZE - winners.length)
    qualifiers = [...winners, ...runnersUp.slice(0, remaining)]
  }
  return qualifiers.sort(bySeedRank).map((q, i) => ({ ...q, seed: i + 1 }))
}

// The settled Super 8 — nothing until every group game is in the book, since a
// half-played table can't decide who goes through. This is what the bracket and
// the schedule's knockout slots seed from.
export function seededSuper8(teams, matches, format) {
  if (!groupStageComplete(matches)) return []
  return projectedSuper8(teams, matches, format)
}

// Winner of a knockout match: prefer the explicit `winner` column, else derive
// from runs. Returns null while unplayed or tied.
export function knockoutWinner(m) {
  if (m.winner) return m.winner
  if (!isPlayed(m)) return null
  if (m.home_runs > m.away_runs) return m.home_team
  if (m.away_runs > m.home_runs) return m.away_team
  return null
}

// { QF1: winnerId, SF1: winnerId, ... } from the stored knockout match rows.
export function knockoutResultsFromMatches(matches) {
  const out = {}
  matches.filter((m) => m.stage === 'knockout').forEach((m) => {
    const w = knockoutWinner(m)
    if (w) out[m.code] = w
  })
  return out
}

// Pure bracket assembly from seeds + a { code: winnerId } map. Shared shape with
// the static buildBracket so one set of components renders either.
export function buildBracketFrom(seeds, results = {}) {
  const id = (i) => (seeds[i] ? seeds[i].teamId : null)
  const win = (c) => results[c] || null

  const quarterfinals = [
    { code: 'QF1', a: id(0), b: id(7), winner: win('QF1') },
    { code: 'QF2', a: id(1), b: id(6), winner: win('QF2') },
    { code: 'QF3', a: id(2), b: id(5), winner: win('QF3') },
    { code: 'QF4', a: id(3), b: id(4), winner: win('QF4') },
  ]
  const semifinals = [
    { code: 'SF1', a: quarterfinals[0].winner, b: quarterfinals[3].winner, winner: win('SF1') },
    { code: 'SF2', a: quarterfinals[1].winner, b: quarterfinals[2].winner, winner: win('SF2') },
  ]
  const final = { code: 'FINAL', a: semifinals[0].winner, b: semifinals[1].winner, winner: win('FINAL') }

  return { seeds, quarterfinals, semifinals, final, champion: final.winner }
}
