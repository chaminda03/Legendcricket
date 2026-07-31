import { useEffect, useMemo, useState } from 'react'
import {
  fetchMessagingSettings, updateMessagingSettings,
  fetchTemplates, updateTemplate, fetchMessageLog, sendSms,
  fetchApprovedTeams, fetchMatches,
} from '../../lib/db'
import { CURRENT_SEASON } from '../../data/seasons'
import { useFormat } from '../../context/FormatContext'
import { templateByKey } from '../../data/messageTemplates'
import { indexById, standingsByGroup } from '../../data/compute'
import { broadcastMessages, qualificationMessages, resultMessages, estimateCost, normalizePhone } from '../../lib/messaging'
import ConfirmBar from '../../components/ConfirmBar'

export default function AdminMessaging() {
  const { format } = useFormat()
  const [settings, setSettings] = useState(null)
  const [templates, setTemplates] = useState([])
  const [teams, setTeams] = useState([])
  const [matches, setMatches] = useState([])
  const [log, setLog] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [upNextDetail, setUpNextDetail] = useState('')
  const [customMsg, setCustomMsg] = useState('')
  const [pending, setPending] = useState(null) // send staged for confirmation

  const load = async () => {
    try {
      const [s, t, tm, ms, lg] = await Promise.all([
        fetchMessagingSettings(), fetchTemplates(),
        fetchApprovedTeams(CURRENT_SEASON), fetchMatches(CURRENT_SEASON), fetchMessageLog(),
      ])
      setSettings(s); setTemplates(t); setTeams(tm); setMatches(ms); setLog(lg); setStatus('ready')
    } catch (err) { setStatus('error'); setError(err.message) }
  }
  useEffect(() => { load() }, [])

  const byKey = useMemo(() => templateByKey(templates), [templates])
  const teamsById = useMemo(() => indexById(teams), [teams])
  const standings = useMemo(() => standingsByGroup(teams, matches), [teams, matches])
  const withPhone = teams.filter((t) => t.captain_phone).length
  const completedGroup = matches.filter((m) => m.stage !== 'knockout' && m.grp && m.status === 'completed')

  const refreshLog = async () => setLog(await fetchMessageLog())

  const saveSetting = async (patch) => {
    setSettings((s) => ({ ...s, ...patch })); setError(''); setNotice('')
    try { await updateMessagingSettings(patch) } catch (err) { setError(err.message); load() }
  }

  const saveTemplate = async (key, patch) => {
    setTemplates((ts) => ts.map((t) => (t.key === key ? { ...t, ...patch } : t)))
    try { await updateTemplate(key, patch) } catch (err) { setError(err.message) }
  }

  // Stage the send for confirmation. Held in state rather than shown through
  // window.confirm(), which blocks the main thread for as long as it is open.
  const send = (label, messages, test = false) => {
    setError(''); setNotice('')
    if (!test && messages.length === 0) { setError('No recipients — none of these teams have a phone number saved.'); return }
    setPending({ label, messages, test, cost: estimateCost(messages.length).toFixed(2) })
  }

  // Confirmed: send, report, refresh the log.
  const confirmSend = async () => {
    const p = pending
    setPending(null)
    if (!p) return
    setBusy(true)
    try {
      const res = await sendSms({ messages: p.messages, test: p.test })
      if (res?.skipped) setNotice(`⚠️ Not sent — ${res.reason}. Flip “Messaging” ON to send for real.`)
      else setNotice(`${res.redirected ? '🧪 TEST MODE — ' : ''}Sent ${res.sent}, failed ${res.failed}.`)
      await refreshLog()
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  const sendTest = () => {
    if (!settings?.test_number) { setError('Enter a test number first.'); return }
    send('Send a test message', [{ to: normalizePhone(settings.test_number), name: 'Test', body: 'VA Legends SMS test ✅ — your setup works.', template_key: 'test' }], true)
  }

  const broadcast = (key, extra = {}, opts = {}, label) =>
    send(label || byKey[key]?.label || key, broadcastMessages(byKey[key], teams, extra, opts))

  if (status === 'loading') return <div className="empty">Loading messaging…</div>
  if (status === 'error') return <div className="alert error">⚠️ {error}</div>

  const on = settings?.enabled

  return (
    <>
      {error && <div className="alert error">⚠️ {error} <button className="linklike" onClick={() => setError('')}>dismiss</button></div>}
      {notice && <div className="alert ok">{notice} <button className="linklike" onClick={() => setNotice('')}>dismiss</button></div>}

      {pending && (
        <ConfirmBar danger confirmLabel={`Send ${pending.messages.length}`} busy={busy}
          onConfirm={confirmSend} onCancel={() => setPending(null)}>
          <strong>{pending.label}</strong> — send {pending.messages.length} SMS (~${pending.cost})?
        </ConfirmBar>
      )}

      {/* Master controls */}
      <div className="msg-panel">
        <div className="msg-master">
          <label className="switch-row">
            <input type="checkbox" checked={!!on} onChange={(e) => saveSetting({ enabled: e.target.checked })} />
            <span className={`switch-pill ${on ? 'on' : ''}`}><span className="knob" /></span>
            <span className="switch-label">Messaging is <strong>{on ? 'ON' : 'OFF'}</strong></span>
          </label>
          <p className="muted">{on
            ? 'Live sends are enabled. Every send still asks for confirmation.'
            : 'All real sends are blocked (enforced on the server). “Send test” still works.'}</p>
        </div>

        <div className="msg-test">
          <label className="switch-row">
            <input type="checkbox" checked={!!settings?.test_mode} onChange={(e) => saveSetting({ test_mode: e.target.checked })} />
            <span className={`switch-pill ${settings?.test_mode ? 'on' : ''}`}><span className="knob" /></span>
            <span className="switch-label">Test mode {settings?.test_mode ? '(all texts go to the test number)' : '(off — texts go to captains)'}</span>
          </label>
          <div className="msg-test-row">
            <input className="mini-input" style={{ width: 200 }} placeholder="+1 571 555 1234"
              value={settings?.test_number || ''} onChange={(e) => setSettings((s) => ({ ...s, test_number: e.target.value }))}
              onBlur={(e) => saveSetting({ test_number: e.target.value })} />
            <button className="btn btn-ghost btn-sm" disabled={busy} onClick={sendTest}>Send test</button>
          </div>
        </div>
        <p className="muted" style={{ gridColumn: '1 / -1' }}>
          {withPhone} of {teams.length} approved teams have a captain phone number. Rate ≈ $0.0083/text.
        </p>
      </div>

      {/* Send actions */}
      <div className="admin-group">
        <h3 className="admin-group-title">Send updates</h3>
        <div className="msg-actions">
          <button className="btn btn-primary btn-sm" disabled={busy} onClick={() => broadcast('onboarding', {}, { requireGroup: true })}>Approved + group draw</button>
          <button className="btn btn-primary btn-sm" disabled={busy} onClick={() => broadcast('reminder')}>Day-before reminder</button>
          <button className="btn btn-primary btn-sm" disabled={busy} onClick={() => send('Qualification results', qualificationMessages(byKey, teams, matches, format))}>Qualification results</button>
          <button className="btn btn-primary btn-sm" disabled={busy} onClick={() => broadcast('umpire')}>Umpire reminder</button>
          <button className="btn btn-primary btn-sm" disabled={busy} onClick={() => broadcast('ceremony')}>Awards ceremony</button>
        </div>

        <div className="msg-inline">
          <input className="mini-input" style={{ flex: 1, minWidth: 180 }} placeholder="Up-next detail, e.g. “ at 11:15 on Pitch 2”"
            value={upNextDetail} onChange={(e) => setUpNextDetail(e.target.value)} />
          <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => broadcast('up_next', { detail: upNextDetail })}>Send “up next”</button>
        </div>
        <div className="msg-inline">
          <input className="mini-input" style={{ flex: 1, minWidth: 180 }} placeholder="Custom broadcast message to all captains…"
            value={customMsg} onChange={(e) => setCustomMsg(e.target.value)} />
          <button className="btn btn-ghost btn-sm" disabled={busy || !customMsg.trim()} onClick={() => broadcast('broadcast', { message: customMsg }, {}, 'Custom broadcast')}>Send broadcast</button>
        </div>
      </div>

      {/* Per-match result sends */}
      {completedGroup.length > 0 && (
        <div className="admin-group">
          <h3 className="admin-group-title">Match results ({completedGroup.length} completed)</h3>
          <div className="admin-matches">
            {completedGroup.map((m) => {
              const h = teamsById[m.home_team] || {}, a = teamsById[m.away_team] || {}
              return (
                <div key={m.id} className="score-row done">
                  <span className="score-code">{m.code}</span>
                  <span className="score-name" style={{ flex: 1 }}>{h.name} {m.home_runs}–{m.away_runs} {a.name}</span>
                  <button className="btn btn-primary btn-sm" disabled={busy}
                    onClick={() => send(`Result: ${m.code}`, resultMessages(byKey.result, m, teamsById, standings))}>Text result</button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Templates */}
      <div className="admin-group">
        <h3 className="admin-group-title">Templates</h3>
        <p className="muted">Edit wording freely. Text in {'{curly braces}'} is filled in per team when sent.</p>
        {templates.map((t) => (
          <div key={t.key} className="msg-template">
            <div className="msg-template-head">
              <label className="switch-row sm">
                <input type="checkbox" checked={t.enabled} onChange={(e) => saveTemplate(t.key, { enabled: e.target.checked })} />
                <span className={`switch-pill sm ${t.enabled ? 'on' : ''}`}><span className="knob" /></span>
                <strong>{t.label}</strong>
              </label>
              <span className="muted tier-tag">{t.key}</span>
            </div>
            <textarea className="msg-textarea" rows={2} defaultValue={t.body}
              onBlur={(e) => e.target.value !== t.body && saveTemplate(t.key, { body: e.target.value })} />
          </div>
        ))}
      </div>

      {/* Log */}
      <div className="admin-group">
        <h3 className="admin-group-title">Recent messages</h3>
        {log.length === 0 ? <p className="muted">Nothing sent yet.</p> : (
          <div className="table-wrap">
            <table className="ladder">
              <thead><tr><th>When</th><th>To</th><th>Type</th><th>Status</th><th className="team-col">Message</th></tr></thead>
              <tbody>
                {log.map((r) => (
                  <tr key={r.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(r.created_at).toLocaleTimeString()}</td>
                    <td>{r.to_name || r.to_number}</td>
                    <td>{r.template_key}</td>
                    <td><span className={`tag ${r.status === 'sent' ? 'done' : r.status === 'failed' ? '' : 'soon'}`}>{r.status}</span>{r.error ? ` · ${r.error}` : ''}</td>
                    <td className="team-col"><span className="muted" style={{ fontSize: '0.82rem' }}>{r.body}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
