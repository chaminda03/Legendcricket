import { useState } from 'react'
import { SQUAD_SIZE } from '../data/fixtures'
import { submitRegistration } from '../lib/db'
import { isSupabaseConfigured } from '../lib/supabase'

const MIN_PLAYERS = 6 // 6 players required; players 7 & 8 are optional substitutes
const emptyPlayers = () => Array.from({ length: SQUAD_SIZE }, () => '')

const EMPTY = {
  team_name: '',
  captain_name: '', captain_phone: '', captain_email: '',
  vice_captain_name: '', vice_captain_phone: '',
  notes: '',
}

export default function Register() {
  const [form, setForm] = useState(EMPTY)
  const [players, setPlayers] = useState(emptyPlayers())
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const [error, setError] = useState('')

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const updatePlayer = (i, value) => {
    const next = [...players]
    next[i] = value
    setPlayers(next)
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')

    // Squad rule: the first 6 players are required; the 2 substitutes are optional.
    const trimmed = players.map((p) => p.trim())
    if (!trimmed.slice(0, MIN_PLAYERS).every(Boolean)) {
      setStatus('error')
      setError(`Please enter your ${MIN_PLAYERS} players. Substitutes are optional.`)
      return
    }

    const payload = { ...form, players: trimmed.filter(Boolean).join('\n') }

    if (!isSupabaseConfigured) {
      setStatus('error')
      setError('The registration database is not connected yet. Add your Supabase keys to the .env file (see README) to start accepting entries.')
      return
    }

    setStatus('submitting')
    try {
      await submitRegistration(payload)
      setStatus('success')
      setForm(EMPTY)
      setPlayers(emptyPlayers())
    } catch (err) {
      setStatus('error')
      setError(err.message || 'Something went wrong. Please try again.')
    }
  }

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Join the Championship</span>
          <h2>Register Your Team</h2>
          <p>This is a <strong>6-a-side</strong> tournament — register your <strong>6 players</strong>, plus up to 2 optional substitutes. Our committee will confirm your group and fixtures.</p>
        </div>

        {status === 'success' && (
          <div className="alert success">
            🎉 <strong>Registration received!</strong> Thank you — your team is in. We'll contact you if we need further information.
          </div>
        )}
        {status === 'error' && <div className="alert error">⚠️ {error}</div>}
        {!isSupabaseConfigured && status === 'idle' && (
          <div className="alert info">
            ℹ️ <strong>Setup note (for admins):</strong> connect Supabase (add your keys to <code>.env</code>) to start collecting live registrations. See the README.
          </div>
        )}

        <form className="form-card" onSubmit={submit}>
          <div className="form-row">
            <div className="field">
              <label>Team Name <span className="req">*</span></label>
              <input name="team_name" value={form.team_name} onChange={update} required placeholder="e.g. VA Legends Red" />
            </div>
            <div className="field">
              <label>Captain's Email <span className="req">*</span></label>
              <input type="email" name="captain_email" value={form.captain_email} onChange={update} required placeholder="captain@email.com" />
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label>Captain's Name <span className="req">*</span></label>
              <input name="captain_name" value={form.captain_name} onChange={update} required placeholder="Full name" />
            </div>
            <div className="field">
              <label>Captain's Phone <span className="req">*</span></label>
              <input type="tel" name="captain_phone" value={form.captain_phone} onChange={update} required placeholder="+1 (804) 555-0100" />
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label>Vice-Captain's Name <span className="req">*</span></label>
              <input name="vice_captain_name" value={form.vice_captain_name} onChange={update} required placeholder="Full name" />
            </div>
            <div className="field">
              <label>Vice-Captain's Phone <span className="req">*</span></label>
              <input type="tel" name="vice_captain_phone" value={form.vice_captain_phone} onChange={update} required placeholder="+1 (804) 555-0100" />
            </div>
          </div>

          <div className="field">
            <label>Squad Players <span className="req">*</span></label>
            <div className="hint" style={{ marginTop: 0, marginBottom: 12 }}>Enter your {MIN_PLAYERS} players. The 2 substitutes are optional. Your captain can also be listed here.</div>
            <div className="grid grid-2" style={{ gap: 12 }}>
              {players.map((p, i) => (
                <input
                  key={i}
                  value={p}
                  onChange={(e) => updatePlayer(i, e.target.value)}
                  placeholder={i < MIN_PLAYERS ? `Player ${i + 1}` : `Substitute ${i - MIN_PLAYERS + 1} (optional)`}
                  required={i < MIN_PLAYERS}
                />
              ))}
            </div>
          </div>

          <div className="field">
            <label>Notes for the Committee</label>
            <textarea name="notes" value={form.notes} onChange={update} placeholder="Anything we should know? Scheduling constraints, sponsorships, etc." />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={status === 'submitting'} style={{ width: '100%', justifyContent: 'center' }}>
            {status === 'submitting' ? 'Submitting…' : 'Submit Registration →'}
          </button>
        </form>
      </div>
    </section>
  )
}
