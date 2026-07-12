import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  fetchApprovedTeams, fetchMatches,
  generateGroupFixtures, saveMatchScore, clearGroupFixtures,
  saveKnockoutScore, clearKnockouts,
} from '../../lib/db'
import { standingsByGroup, seededSuper8, buildBracketFrom, knockoutResultsFromMatches } from '../../data/compute'
import { formatNRR } from '../../data/standings'
import { CURRENT_SEASON } from '../../data/seasons'
import { useFormat } from '../../context/FormatContext'
import { matchesLabel, qualifyLabel } from '../../data/formats'

const emptyDraft = { home_runs: '', home_wkts: '', home_overs: '', away_runs: '', away_wkts: '', away_overs: '' }

export default function AdminMatches() {
  const { format } = useFormat()
  const [teams, setTeams] = useState([])
  const [matches, setMatches] = useState([])
  const [drafts, setDrafts] = useState({})
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [savingId, setSavingId] = useState(null)
  const [koDrafts, setKoDrafts] = useState({})
  const [koSavingCode, setKoSavingCode] = useState(null)

  const scoreDraft = (m) => ({
    home_runs: m.home_runs ?? '', home_wkts: m.home_wkts ?? '', home_overs: m.home_overs ?? '',
    away_runs: m.away_runs ?? '', away_wkts: m.away_wkts ?? '', away_overs: m.away_overs ?? '',
  })

  const load = async () => {
    try {
      const [ts, ms] = await Promise.all([fetchApprovedTeams(CURRENT_SEASON), fetchMatches(CURRENT_SEASON)])
      setTeams(ts); setMatches(ms)
      const d = {}, kd = {}
      ms.forEach((m) => {
        if (m.stage === 'knockout') kd[m.code] = scoreDraft(m)
        else d[m.id] = scoreDraft(m)
      })
      setDrafts(d); setKoDrafts(kd)
      setStatus('ready')
    } catch (err) { setStatus('error'); setError(err.message) }
  }
  useEffect(() => { load() }, [])

  const teamsById = useMemo(() => Object.fromEntries(teams.map((t) => [t.id, t])), [teams])
  const name = (id) => teamsById[id]?.name || 'Unknown'
  const short = (id) => teamsById[id]?.short || '—'
  const color = (id) => teamsById[id]?.color || '#334155'

  const standings = useMemo(() => standingsByGroup(teams, matches), [teams, matches])
  const groupedTeamCount = teams.filter((t) => t.grp).length
  // Show whatever groups actually have fixtures, so the view is correct for any
  // format (4 or 5 groups) regardless of the admin's current format selection.
  const activeGroups = useMemo(
    () => [...new Set(matches.map((m) => m.grp))].filter(Boolean).sort(),
    [matches],
  )

  const setDraft = (id, field, val) => setDrafts((d) => ({ ...d, [id]: { ...(d[id] || emptyDraft), [field]: val } }))

  const num = (v) => (v === '' || v == null ? null : Number(v))

  const generate = async () => {
    if (!window.confirm(`Generate fixtures for every group from the current draw (${matchesLabel(format)})?`)) return
    setBusy(true); setError('')
    try { await generateGroupFixtures(CURRENT_SEASON, teams, format.matchesPerTeam); await load() }
    catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  const clearAll = async () => {
    if (!window.confirm('Delete ALL group fixtures and their scores? This cannot be undone.')) return
    setBusy(true); setError('')
    try { await clearGroupFixtures(CURRENT_SEASON); await load() }
    catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  const save = async (m) => {
    const d = drafts[m.id] || emptyDraft
    if (d.home_runs === '' || d.away_runs === '') { setError('Enter runs for both teams before saving.'); return }
    setSavingId(m.id); setError('')
    const score = {
      home_runs: num(d.home_runs), home_wkts: num(d.home_wkts) ?? 0, home_overs: num(d.home_overs) ?? 0,
      away_runs: num(d.away_runs), away_wkts: num(d.away_wkts) ?? 0, away_overs: num(d.away_overs) ?? 0,
    }
    try {
      await saveMatchScore(m.id, score)
      setMatches((prev) => prev.map((x) => (x.id === m.id ? { ...x, ...score, status: 'completed' } : x)))
    } catch (err) { setError(err.message) } finally { setSavingId(null) }
  }

  // ---- Knockout stage: computed live from the group standings + format rule ----
  const seeds = useMemo(() => seededSuper8(teams, matches, format), [teams, matches, format])
  const koResults = useMemo(() => knockoutResultsFromMatches(matches), [matches])
  const bracket = useMemo(() => buildBracketFrom(seeds, koResults), [seeds, koResults])
  const koReady = seeds.length === 8
  const koMatches = [...bracket.quarterfinals, ...bracket.semifinals, bracket.final]

  const setKoDraft = (code, field, val) =>
    setKoDrafts((d) => ({ ...d, [code]: { ...(d[code] || emptyDraft), [field]: val } }))

  const saveKo = async (bm) => {
    const d = koDrafts[bm.code] || emptyDraft
    if (d.home_runs === '' || d.away_runs === '') { setError('Enter runs for both teams before saving.'); return }
    setKoSavingCode(bm.code); setError('')
    const score = {
      home_runs: num(d.home_runs), home_wkts: num(d.home_wkts) ?? 0, home_overs: num(d.home_overs) ?? 0,
      away_runs: num(d.away_runs), away_wkts: num(d.away_wkts) ?? 0, away_overs: num(d.away_overs) ?? 0,
    }
    try { await saveKnockoutScore(CURRENT_SEASON, bm.code, bm.a, bm.b, score); await load() }
    catch (err) { setError(err.message) } finally { setKoSavingCode(null) }
  }

  const clearKo = async () => {
    if (!window.confirm('Delete all knockout results? This cannot be undone.')) return
    setBusy(true); setError('')
    try { await clearKnockouts(CURRENT_SEASON); await load() }
    catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  if (status === 'loading') return <div className="empty">Loading fixtures…</div>
  if (status === 'error') return <div className="alert error">⚠️ {error}</div>

  return (
    <>
      {error && <div className="alert error">⚠️ {error} <button className="linklike" onClick={() => setError('')}>dismiss</button></div>}

      {/* Controls */}
      <div className="admin-toolbar">
        {matches.length === 0 ? (
          <>
            <button className="btn btn-primary" disabled={busy || groupedTeamCount < 2} onClick={generate}>
              {busy ? 'Generating…' : '⚙️ Generate Group Fixtures'}
            </button>
            <span className="muted">
              {groupedTeamCount < 2
                ? <>Assign teams to groups on the <Link to="/admin" style={{ color: 'var(--primary)' }}>Teams &amp; Draw</Link> tab first.</>
                : `${groupedTeamCount} teams drawn into groups — ${matchesLabel(format)} per group.`}
            </span>
          </>
        ) : (
          <>
            <span className="muted">{matches.length} matches · {matches.filter((m) => m.status === 'completed').length} played</span>
            <button className="btn btn-ghost" disabled={busy} onClick={clearAll}>Clear all fixtures</button>
          </>
        )}
      </div>

      {/* Per-group fixtures + standings */}
      {activeGroups.map((g) => {
        const gm = matches.filter((m) => m.grp === g)
        if (gm.length === 0) return null
        const table = standings[g] || []
        return (
          <div key={g} className="admin-group">
            <h3 className="admin-group-title">Group {g}</h3>

            <div className="admin-matches">
              {gm.map((m) => {
                const d = drafts[m.id] || emptyDraft
                const done = m.status === 'completed'
                return (
                  <div key={m.id} className={`score-row ${done ? 'done' : ''}`}>
                    <span className="score-code">{m.code}</span>
                    <div className="score-side">
                      <span className="tb-xs" style={{ background: color(m.home_team) }}>{short(m.home_team)}</span>
                      <span className="score-name">{name(m.home_team)}</span>
                    </div>
                    <div className="score-inputs">
                      <input className="mini-input sc" type="number" min="0" placeholder="R" value={d.home_runs} onChange={(e) => setDraft(m.id, 'home_runs', e.target.value)} />
                      <input className="mini-input sc" type="number" min="0" max="5" placeholder="W" value={d.home_wkts} onChange={(e) => setDraft(m.id, 'home_wkts', e.target.value)} />
                      <input className="mini-input sc" type="number" min="0" max="5" step="0.1" placeholder="Ov" value={d.home_overs} onChange={(e) => setDraft(m.id, 'home_overs', e.target.value)} />
                    </div>
                    <span className="score-vs">vs</span>
                    <div className="score-inputs">
                      <input className="mini-input sc" type="number" min="0" placeholder="R" value={d.away_runs} onChange={(e) => setDraft(m.id, 'away_runs', e.target.value)} />
                      <input className="mini-input sc" type="number" min="0" max="5" placeholder="W" value={d.away_wkts} onChange={(e) => setDraft(m.id, 'away_wkts', e.target.value)} />
                      <input className="mini-input sc" type="number" min="0" max="5" step="0.1" placeholder="Ov" value={d.away_overs} onChange={(e) => setDraft(m.id, 'away_overs', e.target.value)} />
                    </div>
                    <div className="score-side away">
                      <span className="score-name">{name(m.away_team)}</span>
                      <span className="tb-xs" style={{ background: color(m.away_team) }}>{short(m.away_team)}</span>
                    </div>
                    <button className="btn btn-primary btn-sm" disabled={savingId === m.id} onClick={() => save(m)}>
                      {savingId === m.id ? '…' : done ? 'Update' : 'Save'}
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Live standings preview */}
            <div className="table-wrap" style={{ marginTop: 14 }}>
              <table className="ladder">
                <thead><tr><th>#</th><th className="team-col">Team</th><th>P</th><th>W</th><th>L</th><th>T</th><th>NRR</th><th>Pts</th></tr></thead>
                <tbody>
                  {table.map((r, i) => (
                    <tr key={r.teamId} className={i < 2 ? 'qualify' : ''}>
                      <td className="pos">{i + 1}</td>
                      <td className="team-col"><span className="team-cell"><span className="tb" style={{ background: color(r.teamId) }}>{short(r.teamId)}</span><span className="tn">{name(r.teamId)}</span></span></td>
                      <td>{r.played}</td><td>{r.won}</td><td>{r.lost}</td><td>{r.tied}</td>
                      <td>{formatNRR(r.nrr)}</td><td className="pts">{r.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}

      {/* Knockout stage */}
      <div className="admin-group">
        <h3 className="admin-group-title">Knockout Stage · Super 8</h3>
        <p className="muted" style={{ marginTop: -6, marginBottom: 12 }}>{qualifyLabel(format)}</p>
        {!koReady ? (
          <p className="muted">The bracket unlocks once the group stage decides 8 qualifiers — {seeds.length}/8 seeded so far.</p>
        ) : (
          <>
            <div className="admin-toolbar">
              <span className="muted">Seeds: {seeds.map((s) => `#${s.seed} ${short(s.teamId)}`).join(' · ')}</span>
              <button className="btn btn-ghost" disabled={busy} onClick={clearKo}>Clear knockout results</button>
            </div>
            <div className="admin-matches">
              {koMatches.map((bm) => {
                const known = bm.a && bm.b
                const d = koDrafts[bm.code] || emptyDraft
                return (
                  <div key={bm.code} className={`score-row ${bm.winner ? 'done' : ''}`}>
                    <span className="score-code">{bm.code}</span>
                    {known ? (
                      <>
                        <div className="score-side">
                          <span className="tb-xs" style={{ background: color(bm.a) }}>{short(bm.a)}</span>
                          <span className="score-name">{name(bm.a)}</span>
                        </div>
                        <div className="score-inputs">
                          <input className="mini-input sc" type="number" min="0" placeholder="R" value={d.home_runs} onChange={(e) => setKoDraft(bm.code, 'home_runs', e.target.value)} />
                          <input className="mini-input sc" type="number" min="0" max="5" placeholder="W" value={d.home_wkts} onChange={(e) => setKoDraft(bm.code, 'home_wkts', e.target.value)} />
                          <input className="mini-input sc" type="number" min="0" max="5" step="0.1" placeholder="Ov" value={d.home_overs} onChange={(e) => setKoDraft(bm.code, 'home_overs', e.target.value)} />
                        </div>
                        <span className="score-vs">vs</span>
                        <div className="score-inputs">
                          <input className="mini-input sc" type="number" min="0" placeholder="R" value={d.away_runs} onChange={(e) => setKoDraft(bm.code, 'away_runs', e.target.value)} />
                          <input className="mini-input sc" type="number" min="0" max="5" placeholder="W" value={d.away_wkts} onChange={(e) => setKoDraft(bm.code, 'away_wkts', e.target.value)} />
                          <input className="mini-input sc" type="number" min="0" max="5" step="0.1" placeholder="Ov" value={d.away_overs} onChange={(e) => setKoDraft(bm.code, 'away_overs', e.target.value)} />
                        </div>
                        <div className="score-side away">
                          <span className="score-name">{name(bm.b)}</span>
                          <span className="tb-xs" style={{ background: color(bm.b) }}>{short(bm.b)}</span>
                        </div>
                        <button className="btn btn-primary btn-sm" disabled={koSavingCode === bm.code} onClick={() => saveKo(bm)}>
                          {koSavingCode === bm.code ? '…' : bm.winner ? 'Update' : 'Save'}
                        </button>
                      </>
                    ) : (
                      <span className="muted" style={{ gridColumn: '2 / -1' }}>Awaiting earlier results…</span>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </>
  )
}
