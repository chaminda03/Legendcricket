import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchAllTeams, updateTeam, deleteTeam } from '../../lib/db'
import { useFormat } from '../../context/FormatContext'
import { CURRENT_SEASON } from '../../data/seasons'

export default function AdminTeams() {
  const { format } = useFormat()
  const GROUPS = format.groups
  const GROUP_LIMIT = format.perGroup

  const [teams, setTeams] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState(null)

  const load = async () => {
    try { setTeams(await fetchAllTeams(CURRENT_SEASON)); setStatus('ready') }
    catch (err) { setStatus('error'); setError(err.message) }
  }
  useEffect(() => { load() }, [])

  const patch = async (id, changes) => {
    const prev = teams
    setTeams(teams.map((t) => (t.id === id ? { ...t, ...changes } : t)))
    setSavingId(id)
    try { await updateTeam(id, changes) }
    catch (err) { setTeams(prev); setError(err.message) }
    finally { setSavingId(null) }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this team registration permanently?')) return
    const prev = teams
    setTeams(teams.filter((t) => t.id !== id))
    try { await deleteTeam(id) } catch (err) { setTeams(prev); setError(err.message) }
  }

  const approved = teams.filter((t) => t.status === 'approved')
  const pending = teams.filter((t) => t.status === 'pending')
  const groupCount = (g) => approved.filter((t) => t.grp === g).length

  if (status === 'loading') return <div className="empty">Loading teams…</div>
  if (status === 'error') return <div className="alert error">⚠️ {error}</div>

  return (
    <>
      {error && <div className="alert error">⚠️ {error} <button className="linklike" onClick={() => setError('')}>dismiss</button></div>}

      <div className="admin-stats">
        <div className="admin-stat"><div className="n">{teams.length}</div><div className="l">Registered</div></div>
        <div className="admin-stat"><div className="n" style={{ color: 'var(--gold)' }}>{pending.length}</div><div className="l">Pending</div></div>
        <div className="admin-stat"><div className="n" style={{ color: 'var(--primary)' }}>{approved.length}/{format.size}</div><div className="l">Approved</div></div>
        {GROUPS.map((g) => (
          <div key={g} className="admin-stat">
            <div className="n" style={{ color: groupCount(g) > GROUP_LIMIT ? 'var(--secondary)' : 'var(--text)' }}>{groupCount(g)}/{GROUP_LIMIT}</div>
            <div className="l">Group {g}</div>
          </div>
        ))}
      </div>

      {teams.length === 0 ? (
        <div className="empty">No registrations yet. Share the <Link to="/register" style={{ color: 'var(--primary)' }}>registration link</Link> to get teams signed up! 🏏</div>
      ) : (
        <div className="table-wrap">
          <table className="reg-table admin-table">
            <thead>
              <tr>
                <th>Team</th><th>Captain / Vice</th><th>Contact</th><th>Squad</th><th>Status</th><th>Group</th><th></th>
              </tr>
            </thead>
            <tbody>
              {teams.map((t) => (
                <tr key={t.id} className={savingId === t.id ? 'saving' : ''}>
                  <td className="team">
                    {t.name}
                    <input className="mini-input" value={t.short || ''} maxLength={4} placeholder="CODE"
                      onChange={(e) => patch(t.id, { short: e.target.value.toUpperCase() })} />
                  </td>
                  <td>{t.captain_name || '—'}<br /><span className="muted">V: {t.vice_captain_name || '—'}</span></td>
                  <td>{t.captain_email}<br /><span className="muted">{t.captain_phone}</span></td>
                  <td style={{ maxWidth: 200 }}><span className="muted" style={{ whiteSpace: 'pre-line', fontSize: '0.82rem' }}>{t.players || '—'}</span></td>
                  <td>
                    <select className="mini-select" value={t.status} onChange={(e) => patch(t.id, { status: e.target.value })}>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                  <td>
                    <select className="mini-select" value={t.grp || ''} disabled={t.status !== 'approved'}
                      onChange={(e) => patch(t.id, { grp: e.target.value || null })}>
                      <option value="">—</option>
                      {GROUPS.map((g) => <option key={g} value={g}>Group {g}</option>)}
                    </select>
                  </td>
                  <td><button className="linklike danger" onClick={() => remove(t.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="muted" style={{ marginTop: 14, fontSize: '0.88rem' }}>
        Mark a team <strong>Approved</strong> before assigning its group. Each group takes {GROUP_LIMIT} teams. When the draw is done, head to
        {' '}<Link to="/admin/matches" style={{ color: 'var(--primary)' }}>Fixtures &amp; Scores</Link> to generate the schedule.
      </p>
    </>
  )
}
