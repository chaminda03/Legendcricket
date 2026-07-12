import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { isSupabaseConfigured } from '../../lib/supabase'

export default function AdminLogin() {
  const { signIn, session } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (session) { navigate('/admin', { replace: true }) }

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setBusy(true)
    try {
      await signIn(email, password)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed.')
      setBusy(false)
    }
  }

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 460 }}>
        <div className="section-head" style={{ textAlign: 'center' }}>
          <span className="eyebrow">Committee Only</span>
          <h2>Admin Login</h2>
        </div>

        {!isSupabaseConfigured && (
          <div className="alert info">ℹ️ Connect Supabase in <code>.env</code> first. See the README.</div>
        )}
        {error && <div className="alert error">⚠️ {error}</div>}

        <form className="form-card" onSubmit={submit}>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@club.com" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={busy || !isSupabaseConfigured} style={{ width: '100%', justifyContent: 'center' }}>
            {busy ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>
      </div>
    </section>
  )
}
