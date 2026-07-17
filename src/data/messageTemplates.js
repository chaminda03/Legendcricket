// ============================================================================
//  Default SMS templates (merged Tier 1 + Tier 2). These seed the editable
//  `message_templates` table on first load; the committee can then tweak the
//  wording in the admin Messaging tab. Placeholders in {curly braces} are filled
//  per recipient — see src/lib/messaging.js for which vars each template gets.
// ============================================================================

export const DEFAULT_TEMPLATES = [
  { key: 'registration_ack', label: 'Registration received', tier: 1, sort: 5,
    vars: ['name', 'team', 'edition', 'url'],
    body: `Hi {name}, we've received {team}'s registration for the {edition} VA Legends Cricket Carnival. Our committee will confirm your group & fixtures soon. Details: {url}` },

  { key: 'onboarding', label: 'Approved + group draw', tier: 1, sort: 10,
    vars: ['captain', 'team', 'group', 'edition', 'url'],
    body: `Hi {captain}, {team} is confirmed for the {edition} VA Legends Cricket Carnival — you're in Group {group}. Report by 8 AM. Fixtures: {url}` },

  { key: 'reminder', label: 'Day-before reminder', tier: 1, sort: 20,
    vars: ['captain', 'team', 'edition'],
    body: `Reminder: the {edition} VA Legends Carnival is tomorrow. Report by 8 AM, captains' meeting at 8, bring your squad of 6. Good luck, {team}!` },

  { key: 'up_next', label: 'Up next (broadcast)', tier: 1, sort: 30,
    vars: ['team', 'detail'],
    body: `{team}: your next match is coming up{detail}. Toss is 15 min before start — please be ready.` },

  { key: 'result', label: 'Match result', tier: 2, sort: 40,
    vars: ['team', 'outcome', 'opponent', 'score', 'points', 'url'],
    body: `{team} {outcome} vs {opponent}: {score}. {points} Table: {url}/points-table` },

  { key: 'qualified', label: 'Qualified for Super 8', tier: 1, sort: 50,
    vars: ['team', 'seed', 'opponent', 'url'],
    body: `Congrats {team} — you've qualified for the Super 8 as seed #{seed}! Quarter-final vs {opponent}. Bracket: {url}/knockouts` },

  { key: 'eliminated', label: 'Group-stage exit', tier: 1, sort: 60,
    vars: ['team', 'url'],
    body: `{team}, your run ends in the group stage — thank you for a great carnival! Final table: {url}/points-table` },

  { key: 'knockout_next', label: 'Knockout — next match', tier: 1, sort: 70,
    vars: ['team', 'outcome', 'round', 'opponent', 'url'],
    body: `{team} {outcome}! Next up: {round} vs {opponent}. Bracket: {url}/knockouts` },

  { key: 'umpire', label: 'Umpire-duty reminder', tier: 2, sort: 80,
    vars: ['team'],
    body: `Reminder to {team}: each team must umpire at least 3 games or incur a $30 fee. Please check in with the Marshal.` },

  { key: 'ceremony', label: 'Awards ceremony', tier: 2, sort: 90,
    vars: [],
    body: `The awards ceremony is starting at the main tent. Congratulations to every team — see you there!` },

  { key: 'broadcast', label: 'Custom broadcast', tier: 1, sort: 100,
    vars: ['message'],
    body: `{message}` },
]

// Fill {placeholders} from a vars object; unknown/blank placeholders collapse away.
export function renderTemplate(body, vars = {}) {
  return (body || '')
    .replace(/\{(\w+)\}/g, (_, k) => (vars[k] == null ? '' : String(vars[k])))
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export const templateByKey = (list) => Object.fromEntries(list.map((t) => [t.key, t]))
