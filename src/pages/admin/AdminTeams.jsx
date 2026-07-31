import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchAllTeams, updateTeam, deleteTeam } from '../../lib/db'
import { useFormat } from '../../context/FormatContext'
import { CURRENT_SEASON } from '../../data/seasons'
import { SQUAD_SIZE } from '../../data/fixtures'

// Inline editor for the squad blob (one name per line). Edits are kept local
// while typing and committed on blur, so a roster edit is one write, not one
// per keystroke.
function SquadCell({ team, onSave }) {
  const saved = team.players || ''
  const [draft, setDraft] = useState(saved)
  useEffect(() => { setDraft(saved) }, [saved])

  const names = draft.split('\n').map((s) => s.trim()).filter(Boolean)
  const dirty = draft !== saved

  const commit = () => {
    const cleaned = names.join('\n')
    setDraft(cleaned)
    if (cleaned !== saved) onSave(cleaned)
  }

  return (
    <div className="squad-cell">
      <textarea
        className="mini-textarea"
        rows={Math.min(Math.max(names.length + 1, 3), 9)}
        value={draft}
        placeholder="One player per line"
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
      />
      <span className={`squad-count${names.length === SQUAD_SIZE ? ' ok' : ''}`}>
        {names.length}/{SQUAD_SIZE} players{dirty ? ' · unsaved' : ''}
      </span>
    </div>
  )
}

export default function AdminTeams() {
  const { format } = useFormat()
  const GROUPS = format.groups
  const GROUP_LIMIT = format.perGroup

  const [teams, setTeams] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState(null)
  const [filter, setFilter] = useState('all')
  // Two-step delete rather than window.confirm(): the native dialog blocks the
  // main thread while open, and Chrome bills that time to the click.
  const [confirmDelete, setConfirmDelete] = useState(null)

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
    setConfirmDelete(null)
    const prev = teams
    setTeams(teams.filter((t) => t.id !== id))
    try { await deleteTeam(id) } catch (err) { setTeams(prev); setError(err.message) }
  }

  const approved = teams.filter((t) => t.status === 'approved')
  const pending = teams.filter((t) => t.status === 'pending')
  const groupCount = (g) => approved.filter((t) => t.grp === g).length

  const visibleTeams = teams.filter((t) => {
    if (filter === 'all') return true
    if (filter === 'pending') return t.status === 'pending'
    if (filter === 'approved') return t.status === 'approved'
    if (filter.startsWith('group:')) return t.status === 'approved' && t.grp === filter.slice(6)
    return true
  })
  const toggle = (key) => setFilter((f) => (f === key ? 'all' : key))

  if (status === 'loading') return <div className="empty">Loading teams…</div>
  if (status === 'error') return <div className="alert error">⚠️ {error}</div>

  return (
    <>
      {error && <div className="alert error">⚠️ {error} <button className="linklike" onClick={() => setError('')}>dismiss</button></div>}

      <div className="admin-stats">
        <button type="button" className={`admin-stat${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>
          <div className="n">{teams.length}</div><div className="l">Registered</div>
        </button>
        <button type="button" className={`admin-stat${filter === 'pending' ? ' active' : ''}`} onClick={() => toggle('pending')}>
          <div className="n" style={{ color: 'var(--gold)' }}>{pending.length}</div><div className="l">Pending</div>
        </button>
        <button type="button" className={`admin-stat${filter === 'approved' ? ' active' : ''}`} onClick={() => toggle('approved')}>
          <div className="n" style={{ color: 'var(--primary)' }}>{approved.length}/{format.size}</div><div className="l">Approved</div>
        </button>
        {GROUPS.map((g) => (
          <button type="button" key={g} className={`admin-stat${filter === `group:${g}` ? ' active' : ''}`} onClick={() => toggle(`group:${g}`)}>
            <div className="n" style={{ color: groupCount(g) > GROUP_LIMIT ? 'var(--secondary)' : 'var(--text)' }}>{groupCount(g)}/{GROUP_LIMIT}</div>
            <div className="l">Group {g}</div>
          </button>
        ))}
      </div>

      {teams.length === 0 ? (
        <div className="empty">No registrations yet. Share the <Link to="/register" style={{ color: 'var(--primary)' }}>registration link</Link> to get teams signed up! 🏏</div>
      ) : visibleTeams.length === 0 ? (
        <div className="empty">No teams match this filter. <button className="linklike" onClick={() => setFilter('all')}>Show all</button></div>
      ) : (
        <div className="table-wrap">
          {filter !== 'all' && (
            <p className="muted" style={{ margin: '0 0 10px', fontSize: '0.88rem' }}>
              Showing {visibleTeams.length} {filter === 'pending' ? 'pending' : filter === 'approved' ? 'approved' : `Group ${filter.slice(6)}`} {visibleTeams.length === 1 ? 'team' : 'teams'}.
              {' '}<button className="linklike" onClick={() => setFilter('all')}>Clear filter</button>
            </p>
          )}
          <table className="reg-table admin-table">
            <thead>
              <tr>
                <th>Team</th><th>Captain / Vice</th><th>Contact</th><th>Squad</th><th>Status</th><th>Group</th><th></th>
              </tr>
            </thead>
            <tbody>
              {visibleTeams.map((t) => (
                <tr key={t.id} className={savingId === t.id ? 'saving' : ''}>
                  <td className="team">
                    {t.name}
                    <input className="mini-input" value={t.short || ''} maxLength={4} placeholder="CODE"
                      onChange={(e) => patch(t.id, { short: e.target.value.toUpperCase() })} />
                  </td>
                  <td>{t.captain_name || '—'}<br /><span className="muted">V: {t.vice_captain_name || '—'}</span></td>
                  <td>{t.captain_email}<br /><span className="muted">{t.captain_phone}</span></td>
                  <td style={{ minWidth: 190 }}>
                    <SquadCell team={t} onSave={(players) => patch(t.id, { players })} />
                  </td>
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
                  <td>
                    {confirmDelete === t.id ? (
                      <span className="confirm-inline">
                        <button className="linklike danger" onClick={() => remove(t.id)}>Delete for good</button>
                        <button className="linklike" onClick={() => setConfirmDelete(null)}>Cancel</button>
                      </span>
                    ) : (
                      <button className="linklike danger" onClick={() => setConfirmDelete(t.id)}>Delete</button>
                    )}
                  </td>
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
