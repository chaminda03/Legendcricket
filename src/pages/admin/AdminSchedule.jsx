import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  fetchApprovedTeams, fetchMatches, saveSchedule, insertKnockoutSlots, clearSchedule,
} from '../../lib/db'
import { seededSuper8, buildBracketFrom, knockoutResultsFromMatches } from '../../data/compute'
import { CURRENT_SEASON } from '../../data/seasons'
import { useFormat } from '../../context/FormatContext'
import {
  DEFAULT_FIELDS, DEFAULT_START, DEFAULT_SLOT_MINUTES, KNOCKOUT_CODES,
  planGroupSchedule, planKnockoutSchedule, endOfGroupStage,
  formatTime, byCode, isGroupMatch,
} from '../../data/schedule'

const blank = { field: '', start_time: '' }
const same = (a, b) => a.field === b.field && a.start_time === b.start_time
// Draft values are strings (form inputs); the columns are int + text.
const asRow = (d) => ({
  field: d.field === '' ? null : Number(d.field),
  start_time: d.start_time === '' ? null : d.start_time,
})
const toDraft = (m) => ({
  field: m?.field == null ? '' : String(m.field),
  start_time: m?.start_time || '',
})

// Module scope, not a nested component — a re-declared type would remount the
// time inputs on every keystroke and steal focus.
function ScheduleRow({ code, tag, home, away, draft, onChange, done, fieldOptions }) {
  const side = (t) => ({ name: t?.name || 'TBD', short: t?.short || '—', color: t?.color || '#334155' })
  const h = side(home), a = side(away)
  return (
    <div className={`sched-row ${done ? 'done' : ''}`}>
      <span className="score-code">{code}</span>
      <span className="sched-tag">{tag}</span>
      <div className="score-side">
        <span className="tb-xs" style={{ background: h.color }}>{h.short}</span>
        <span className="score-name">{h.name}</span>
      </div>
      <span className="score-vs">v</span>
      <div className="score-side away">
        <span className="score-name">{a.name}</span>
        <span className="tb-xs" style={{ background: a.color }}>{a.short}</span>
      </div>
      <select className="mini-select sched-field" value={draft.field} onChange={(e) => onChange('field', e.target.value)}>
        <option value="">Field —</option>
        {fieldOptions.map((f) => <option key={f} value={f}>Field {f}</option>)}
      </select>
      <input className="mini-input sched-time" type="time" value={draft.start_time}
        onChange={(e) => onChange('start_time', e.target.value)} />
    </div>
  )
}

export default function AdminSchedule() {
  const { format } = useFormat()
  const [teams, setTeams] = useState([])
  const [matches, setMatches] = useState([])
  const [drafts, setDrafts] = useState({})     // group matches, keyed by id
  const [koDrafts, setKoDrafts] = useState({}) // knockout slots, keyed by code
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState('')
  // Inline confirmation instead of window.confirm(): a modal dialog blocks the
  // main thread for as long as it is open, which Chrome counts against INP.
  const [confirming, setConfirming] = useState(null) // null | 'build' | 'clear'

  const [start, setStart] = useState(DEFAULT_START)
  const [slotMinutes, setSlotMinutes] = useState(DEFAULT_SLOT_MINUTES)
  const [fields, setFields] = useState(DEFAULT_FIELDS)

  const load = async () => {
    try {
      const [ts, ms] = await Promise.all([fetchApprovedTeams(CURRENT_SEASON), fetchMatches(CURRENT_SEASON)])
      setTeams(ts); setMatches(ms)
      const d = {}, kd = {}
      ms.forEach((m) => {
        if (m.stage === 'knockout') kd[m.code] = toDraft(m)
        else d[m.id] = toDraft(m)
      })
      KNOCKOUT_CODES.forEach((c) => { kd[c] ||= { ...blank } })
      setDrafts(d); setKoDrafts(kd)
      setStatus('ready')
    } catch (err) { setStatus('error'); setError(err.message) }
  }
  useEffect(() => { load() }, [])

  const teamsById = useMemo(() => Object.fromEntries(teams.map((t) => [t.id, t])), [teams])

  const groupMatches = useMemo(() => matches.filter(isGroupMatch).sort(byCode), [matches])
  const koByCode = useMemo(
    () => Object.fromEntries(matches.filter((m) => m.stage === 'knockout').map((m) => [m.code, m])),
    [matches],
  )

  // Knockout slots can be timed before the teams are known — show whoever the
  // live bracket has so far.
  const bracket = useMemo(() => {
    const seeds = seededSuper8(teams, matches, format)
    const b = buildBracketFrom(seeds, knockoutResultsFromMatches(matches))
    return Object.fromEntries([...b.quarterfinals, ...b.semifinals, b.final].map((m) => [m.code, m]))
  }, [teams, matches, format])

  const fieldOptions = Array.from({ length: Math.max(fields, 4) }, (_, i) => i + 1)

  const dirty = useMemo(() => {
    const g = groupMatches.filter((m) => !same(drafts[m.id] || blank, toDraft(m)))
    const k = KNOCKOUT_CODES.filter((c) => !same(koDrafts[c] || blank, toDraft(koByCode[c])))
    return { group: g, ko: k, count: g.length + k.length }
  }, [groupMatches, drafts, koDrafts, koByCode])

  const setDraft = (id, field, val) =>
    setDrafts((d) => ({ ...d, [id]: { ...(d[id] || blank), [field]: val } }))
  const setKoDraft = (code, field, val) =>
    setKoDrafts((d) => ({ ...d, [code]: { ...(d[code] || blank), [field]: val } }))

  // ---- Actions --------------------------------------------------------------

  // Knockout slots that already have a row are patched by id alongside the group
  // matches; only genuinely new ones need an insert. Two requests, not one pair
  // of round trips per slot.
  const splitKo = (slots) => {
    const patch = [], create = []
    slots.forEach((s) => {
      const row = koByCode[s.code]
      if (row) patch.push({ id: row.id, field: s.field, start_time: s.start_time })
      else create.push(s)
    })
    return { patch, create }
  }

  const autoBuild = async () => {
    setConfirming(null)
    if (groupMatches.length === 0) { setError('Generate the group fixtures first.'); return }
    setBusy(true); setError(''); setSaved('')
    try {
      const opts = { start, slotMinutes: Number(slotMinutes), fields: Number(fields) }
      const groupPlan = planGroupSchedule(groupMatches, opts)
      const koPlan = planKnockoutSchedule({ ...opts, start: endOfGroupStage(groupPlan, opts.slotMinutes) })
      const { patch, create } = splitKo(koPlan)
      await Promise.all([
        saveSchedule([...groupPlan, ...patch]),
        insertKnockoutSlots(CURRENT_SEASON, create),
      ])
      await load()
      setSaved(`Scheduled ${groupPlan.length} group matches and ${koPlan.length} knockout slots.`)
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  const saveAll = async () => {
    setBusy(true); setError(''); setSaved('')
    try {
      const groupRows = dirty.group.map((m) => ({ id: m.id, ...asRow(drafts[m.id]) }))
      const koSlots = dirty.ko
        .map((code) => ({ code, ...asRow(koDrafts[code]) }))
        // Nothing to write for a slot that is still blank and has no row yet.
        .filter((s) => koByCode[s.code] || s.field != null || s.start_time != null)
      const { patch, create } = splitKo(koSlots)
      await Promise.all([
        saveSchedule([...groupRows, ...patch]),
        insertKnockoutSlots(CURRENT_SEASON, create),
      ])
      await load()
      setSaved('Schedule saved.')
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  const clearAll = async () => {
    setConfirming(null)
    setBusy(true); setError(''); setSaved('')
    try { await clearSchedule(CURRENT_SEASON); await load(); setSaved('Schedule cleared.') }
    catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  if (status === 'loading') return <div className="empty">Loading schedule…</div>
  if (status === 'error') return <div className="alert error">⚠️ {error}</div>

  return (
    <>
      {error && <div className="alert error">⚠️ {error} <button className="linklike" onClick={() => setError('')}>dismiss</button></div>}
      {saved && <div className="alert ok">✅ {saved}</div>}

      <div className="admin-hint">
        <span className="admin-hint-ico" aria-hidden="true">🗓️</span>
        <div>
          <strong>One match per field per slot.</strong> Auto-build gives each group a field of its
          own and runs its matches back to back, so every field kicks off together — then the
          knockouts follow on. Adjust any single game below and hit Save.
        </div>
      </div>

      {/* Auto-build controls */}
      <div className="admin-toolbar">
        <label className="sched-opt">First kick-off
          <input className="mini-input sched-time" type="time" value={start} onChange={(e) => setStart(e.target.value)} />
        </label>
        <label className="sched-opt">Slot length
          <input className="mini-input sched-num" type="number" min="10" max="180" step="5"
            value={slotMinutes} onChange={(e) => setSlotMinutes(e.target.value)} /> min
        </label>
        <label className="sched-opt">Fields
          <input className="mini-input sched-num" type="number" min="1" max="8"
            value={fields} onChange={(e) => setFields(e.target.value)} />
        </label>
        <button className="btn btn-primary" disabled={busy} onClick={() => setConfirming('build')}>
          {busy ? 'Working…' : '⚙️ Auto-build schedule'}
        </button>
        <button className="btn btn-ghost" disabled={busy} onClick={() => setConfirming('clear')}>Clear schedule</button>
      </div>

      {confirming === 'build' && (
        <div className="admin-toolbar confirm-bar">
          <span>
            Lay out <strong>{groupMatches.length} group matches</strong> across {fields} fields from{' '}
            <strong>{formatTime(start)}</strong>, {slotMinutes} minutes a slot, then the knockouts after?
            Any times already set are overwritten.
          </span>
          <button className="btn btn-primary btn-sm" onClick={autoBuild}>Yes, build it</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setConfirming(null)}>Cancel</button>
        </div>
      )}

      {confirming === 'clear' && (
        <div className="admin-toolbar confirm-bar">
          <span>Clear every kick-off time and field? Scores are not affected.</span>
          <button className="btn btn-primary btn-sm" onClick={clearAll}>Yes, clear it</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setConfirming(null)}>Cancel</button>
        </div>
      )}

      {groupMatches.length === 0 ? (
        <div className="empty">
          No fixtures to schedule yet.
          <br />
          <span className="muted">
            Generate them on the <Link to="/admin/matches" style={{ color: 'var(--primary)' }}>Fixtures &amp; Scores</Link> tab first.
          </span>
        </div>
      ) : (
        <div className="admin-group">
          <h3 className="admin-group-title">Group Stage</h3>
          <div className="admin-matches">
            {groupMatches.map((m) => (
              <ScheduleRow
                key={m.id}
                code={m.code}
                tag={`Grp ${m.grp}`}
                home={teamsById[m.home_team]}
                away={teamsById[m.away_team]}
                draft={drafts[m.id] || blank}
                onChange={(f, v) => setDraft(m.id, f, v)}
                done={m.status === 'completed'}
                fieldOptions={fieldOptions}
              />
            ))}
          </div>
        </div>
      )}

      <div className="admin-group">
        <h3 className="admin-group-title">Knockout Stage</h3>
        <p className="muted" style={{ marginTop: -6, marginBottom: 12 }}>
          Slots can be timed before the qualifiers are known — team names fill in from the bracket
          as group results come through.
        </p>
        <div className="admin-matches">
          {KNOCKOUT_CODES.map((code) => (
            <ScheduleRow
              key={code}
              code={code}
              tag={code === 'FINAL' ? 'Final' : code.startsWith('SF') ? 'Semi' : 'Quarter'}
              home={teamsById[koByCode[code]?.home_team || bracket[code]?.a]}
              away={teamsById[koByCode[code]?.away_team || bracket[code]?.b]}
              draft={koDrafts[code] || blank}
              onChange={(f, v) => setKoDraft(code, f, v)}
              done={koByCode[code]?.status === 'completed'}
              fieldOptions={fieldOptions}
            />
          ))}
        </div>
      </div>

      <div className="admin-toolbar sched-save">
        <button className="btn btn-primary" disabled={busy || dirty.count === 0} onClick={saveAll}>
          {busy ? 'Saving…' : dirty.count === 0 ? 'No changes' : `Save ${dirty.count} change${dirty.count === 1 ? '' : 's'}`}
        </button>
        <span className="muted">Changes are held locally until you save.</span>
      </div>
    </>
  )
}
