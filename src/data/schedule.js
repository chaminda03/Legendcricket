// ============================================================================
//  Match-day schedule: which field a game is played on, and when.
//
//  The carnival runs on several fields at once — one match per field per slot,
//  so every field's game starts together. Times are stored on `matches` as
//  'HH:MM' 24-hour strings (`start_time`) alongside `field` (1..N); both are
//  null until the committee schedules the game.
// ============================================================================

export const DEFAULT_FIELDS = 4
export const DEFAULT_START = '09:00'
export const DEFAULT_SLOT_MINUTES = 45

// Knockout slots in playing order. These have no match row until a score is
// entered, so the schedule editor creates a placeholder when one is timed.
export const KNOCKOUT_CODES = ['QF1', 'QF2', 'QF3', 'QF4', 'SF1', 'SF2', 'FINAL']

// ---- Time helpers ('HH:MM', 24-hour) ---------------------------------------

export function toMinutes(hhmm) {
  const [h, m] = String(hhmm || '').split(':').map(Number)
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : null
}

export function toHHMM(mins) {
  const t = ((mins % 1440) + 1440) % 1440
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`
}

export const addMinutes = (hhmm, mins) => toHHMM((toMinutes(hhmm) ?? 0) + mins)

// '09:00' -> '9:00 AM'
export function formatTime(hhmm) {
  const mins = toMinutes(hhmm)
  if (mins == null) return ''
  const h24 = Math.floor(mins / 60)
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  return `${h12}:${String(mins % 60).padStart(2, '0')} ${h24 < 12 ? 'AM' : 'PM'}`
}

// ---- Reading the schedule off match rows ------------------------------------

export const isScheduled = (m) => Boolean(m.start_time) && m.field != null
export const isGroupMatch = (m) => m.stage !== 'knockout' && Boolean(m.grp)

// 'A2' before 'A10' — codes are letter + number, so compare numerically.
export const byCode = (a, b) =>
  String(a.code || '').localeCompare(String(b.code || ''), undefined, { numeric: true })

// Sort key for the day: kick-off time, then field.
const bySlot = (a, b) =>
  toMinutes(a.start_time) - toMinutes(b.start_time) || a.field - b.field

// Turn match rows into a timetable: one row per kick-off, one column per field.
// Fields come from the data itself, so a 5-group draw renders 5 columns.
export function buildTimetable(matches) {
  const scheduled = matches.filter(isScheduled).sort(bySlot)
  const fields = [...new Set(scheduled.map((m) => Number(m.field)))].sort((a, b) => a - b)
  const times = [...new Set(scheduled.map((m) => m.start_time))]
    .sort((a, b) => toMinutes(a) - toMinutes(b))

  const rows = times.map((time) => ({
    time,
    cells: fields.map((f) =>
      scheduled.filter((m) => m.start_time === time && Number(m.field) === f)),
  }))
  return { fields, rows }
}

// ---- Auto-scheduler ---------------------------------------------------------

// A group owns one field, so its matches are played back to back — and the draw
// generator emits them in pair order (1v2, 1v3, 1v4, …), which would make team 1
// play three in a row. Greedily pick the next match that shares no team with the
// one before it, falling back to code order when nothing else is left.
function restOrder(matches) {
  const pool = matches.slice().sort(byCode)
  const rested = (m, prev) =>
    m.home_team !== prev.home_team && m.home_team !== prev.away_team &&
    m.away_team !== prev.home_team && m.away_team !== prev.away_team

  const out = []
  let prev = null
  while (pool.length > 0) {
    let i = prev ? pool.findIndex((m) => rested(m, prev)) : 0
    if (i === -1) i = 0 // every remaining match involves a team that just played
    prev = pool[i]
    out.push(prev)
    pool.splice(i, 1)
  }
  return out
}

// Lay the group stage out across the fields: each group gets a field of its own
// (cycling if there are more groups than fields) and plays its matches back to
// back in `slotMinutes` slots. With 4 groups on 4 fields that means every field
// kicks off together, which is how the carnival is run.
//
// Returns [{ id, field, start_time }] — ready to save.
export function planGroupSchedule(matches, opts = {}) {
  const {
    start = DEFAULT_START,
    slotMinutes = DEFAULT_SLOT_MINUTES,
    fields = DEFAULT_FIELDS,
  } = opts

  const groupMatches = matches.filter(isGroupMatch)
  const groups = [...new Set(groupMatches.map((m) => m.grp))].sort()

  const nextSlot = {} // field -> next free slot index
  const plan = []
  groups.forEach((g, i) => {
    const field = (i % fields) + 1
    restOrder(groupMatches.filter((m) => m.grp === g))
      .forEach((m) => {
        const slot = nextSlot[field] || 0
        nextSlot[field] = slot + 1
        plan.push({ id: m.id, field, start_time: addMinutes(start, slot * slotMinutes) })
      })
  })
  return plan
}

// When the last group game finishes — the natural start for the knockouts.
export function endOfGroupStage(plan, slotMinutes = DEFAULT_SLOT_MINUTES) {
  if (plan.length === 0) return DEFAULT_START
  const last = Math.max(...plan.map((p) => toMinutes(p.start_time) ?? 0))
  return toHHMM(last + slotMinutes)
}

// The knockouts, round by round: all four quarterfinals together, then the two
// semis, then the final. A round wider than the available fields splits over
// consecutive slots rather than double-booking a field.
//
// Returns [{ code, field, start_time }] — keyed by code, since knockout rows
// don't exist until they're scheduled or scored.
export function planKnockoutSchedule(opts = {}) {
  const {
    start = DEFAULT_START,
    slotMinutes = DEFAULT_SLOT_MINUTES,
    fields = DEFAULT_FIELDS,
  } = opts

  const rounds = [['QF1', 'QF2', 'QF3', 'QF4'], ['SF1', 'SF2'], ['FINAL']]
  const plan = []
  let time = start
  rounds.forEach((codes) => {
    for (let i = 0; i < codes.length; i += fields) {
      codes.slice(i, i + fields).forEach((code, j) => {
        plan.push({ code, field: j + 1, start_time: time })
      })
      time = addMinutes(time, slotMinutes)
    }
  })
  return plan
}
