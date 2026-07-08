import { useEffect, useState } from 'react'
import { fetchRegistrations, isRegistrationConfigured } from '../lib/registration'

export default function Admin() {
  const [rows, setRows] = useState([])
  const [status, setStatus] = useState('loading') // loading | ready | error | unconfigured
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isRegistrationConfigured) { setStatus('unconfigured'); return }
    ;(async () => {
      try {
        const data = await fetchRegistrations()
        setRows(data)
        setStatus('ready')
      } catch (err) {
        setStatus('error')
        setError(err.message)
      }
    })()
  }, [])

  const exportCsv = () => {
    const cols = ['created_at', 'team_name', 'captain_name', 'captain_phone', 'captain_email', 'vice_captain_name', 'vice_captain_phone', 'players', 'notes']
    const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const csv = [cols.join(','), ...rows.map((r) => cols.map((c) => escape(r[c])).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'registrations.csv'
    a.click()
  }

  return (
    <section className="section">
      <div className="container">
        <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <span className="eyebrow">Committee Only</span>
            <h2>Team Registrations</h2>
            <p>{status === 'ready' ? `${rows.length} team${rows.length === 1 ? '' : 's'} registered so far.` : 'Live submissions from the registration form.'}</p>
          </div>
          {status === 'ready' && rows.length > 0 && (
            <button className="btn btn-ghost" onClick={exportCsv}>⬇ Export CSV</button>
          )}
        </div>

        {status === 'unconfigured' && (
          <div className="alert info">ℹ️ Connect your Google Sheet (add <code>VITE_SHEETS_ENDPOINT</code> to <code>.env</code>) to view registrations here. The data also lives directly in your Google Sheet. See the README for the 5-minute setup.</div>
        )}
        {status === 'loading' && <div className="empty">Loading registrations…</div>}
        {status === 'error' && <div className="alert error">⚠️ {error}</div>}

        {status === 'ready' && (
          rows.length === 0 ? (
            <div className="empty">No registrations yet. Share the registration link to get teams signed up! 🏏</div>
          ) : (
            <div className="table-wrap">
              <table className="reg-table">
                <thead>
                  <tr>
                    <th>Team</th>
                    <th>Captain</th>
                    <th>Vice-Captain</th>
                    <th>Email</th>
                    <th>Players</th>
                    <th>Received</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={r.id || i}>
                      <td className="team">{r.team_name}</td>
                      <td>{r.captain_name}<br /><span style={{ color: 'var(--muted)' }}>{r.captain_phone}</span></td>
                      <td>{r.vice_captain_name || '—'}<br /><span style={{ color: 'var(--muted)' }}>{r.vice_captain_phone}</span></td>
                      <td>{r.captain_email}</td>
                      <td style={{ whiteSpace: 'pre-line', maxWidth: 220, color: 'var(--muted)' }}>{r.players || '—'}</td>
                      <td style={{ color: 'var(--muted)' }}>{r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </section>
  )
}
