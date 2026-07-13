// ============================================================================
//  Client-side helpers that turn live tournament data into ready-to-send SMS
//  batches. Bodies are rendered here from the (editable) templates; the Edge
//  Function just delivers them. Every message is { to, name, body, template_key }.
// ============================================================================

import { renderTemplate } from '../data/messageTemplates'
import { CURRENT_SEASON, editionForSeason, ordinal } from '../data/seasons'
import { indexById, seededSuper8, buildBracketFrom, standingsByGroup } from '../data/compute'

export const SMS_RATE = 0.0083 // USD per segment (Twilio US)
export const estimateCost = (n) => n * SMS_RATE

export const siteUrl = () => (typeof window !== 'undefined' ? window.location.origin : '')

// Best-effort E.164 formatting for US numbers entered any which way.
export function normalizePhone(raw) {
  if (!raw) return ''
  const s = String(raw).trim()
  if (s.startsWith('+')) return '+' + s.slice(1).replace(/\D/g, '')
  const d = s.replace(/\D/g, '')
  if (d.length === 10) return '+1' + d
  if (d.length === 11 && d.startsWith('1')) return '+' + d
  return d ? '+' + d : ''
}

const ctx = () => ({ edition: ordinal(editionForSeason(CURRENT_SEASON)), url: siteUrl() })

// One message per approved team (with a phone). `requireGroup` limits to teams
// that have been drawn into a group. `extraVars` feeds template-specific slots.
export function broadcastMessages(tpl, teams, extraVars = {}, { requireGroup = false } = {}) {
  if (!tpl) return []
  const { edition, url } = ctx()
  return teams
    .filter((t) => t.captain_phone && (!requireGroup || t.grp))
    .map((t) => {
      const vars = { captain: t.captain_name, team: t.name, group: t.grp, edition, url, ...extraVars }
      return { to: normalizePhone(t.captain_phone), name: t.captain_name, body: renderTemplate(tpl.body, vars), template_key: tpl.key }
    })
}

// Qualified teams get their seed + QF opponent; teams that played but missed out
// get the group-stage-exit note.
export function qualificationMessages(byKey, teams, matches, format) {
  const { url } = ctx()
  const teamsById = indexById(teams)
  const seeds = seededSuper8(teams, matches, format)
  const seededIds = new Set(seeds.map((s) => s.teamId))
  const bracket = buildBracketFrom(seeds, {})
  const opponentOf = (id) => {
    for (const m of bracket.quarterfinals) {
      if (m.a === id) return m.b
      if (m.b === id) return m.a
    }
    return null
  }

  const out = []
  const tq = byKey.qualified
  if (tq && tq.enabled !== false) {
    seeds.forEach((s) => {
      const t = teamsById[s.teamId]
      if (!t?.captain_phone) return
      const opp = teamsById[opponentOf(s.teamId)]?.name || 'TBD'
      const body = renderTemplate(tq.body, { team: t.name, seed: s.seed, opponent: opp, url })
      out.push({ to: normalizePhone(t.captain_phone), name: t.captain_name, body, template_key: 'qualified' })
    })
  }
  const te = byKey.eliminated
  if (te && te.enabled !== false) {
    Object.values(standingsByGroup(teams, matches)).flat().forEach((row) => {
      if (row.played === 0 || seededIds.has(row.teamId)) return
      const t = teamsById[row.teamId]
      if (!t?.captain_phone) return
      const body = renderTemplate(te.body, { team: t.name, url })
      out.push({ to: normalizePhone(t.captain_phone), name: t.captain_name, body, template_key: 'eliminated' })
    })
  }
  return out
}

// Two messages (one per captain) for a completed match, each from that team's
// perspective. `standings` (by group) is optional; it adds a live table line.
export function resultMessages(tpl, match, teamsById, standings) {
  if (!tpl) return []
  const { url } = ctx()
  const sides = [
    { me: match.home_team, opp: match.away_team, myR: match.home_runs, myW: match.home_wkts, myO: match.home_overs, opR: match.away_runs, opW: match.away_wkts, opO: match.away_overs },
    { me: match.away_team, opp: match.home_team, myR: match.away_runs, myW: match.away_wkts, myO: match.away_overs, opR: match.home_runs, opW: match.home_wkts, opO: match.home_overs },
  ]
  return sides.map((s) => {
    const t = teamsById[s.me]
    if (!t?.captain_phone) return null
    const outcome = s.myR > s.opR ? 'won' : s.myR < s.opR ? 'lost' : 'tied'
    const score = `${s.myR}/${s.myW} (${s.myO}) – ${s.opR}/${s.opW} (${s.opO})`
    let points = ''
    if (match.grp && standings?.[match.grp]) {
      const idx = standings[match.grp].findIndex((r) => r.teamId === s.me)
      if (idx >= 0) points = `Now ${ordinal(idx + 1)} in Group ${match.grp} on ${standings[match.grp][idx].points} pts.`
    }
    const body = renderTemplate(tpl.body, { team: t.name, outcome, opponent: teamsById[s.opp]?.name || 'opponent', score, points, url })
    return { to: normalizePhone(t.captain_phone), name: t.captain_name, body, template_key: tpl.key }
  }).filter(Boolean)
}
