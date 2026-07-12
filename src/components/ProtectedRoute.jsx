import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'

// Gate for committee-only pages. Redirects to the login page when logged out.
export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()

  if (!isSupabaseConfigured) {
    return (
      <section className="section"><div className="container">
        <div className="alert info">ℹ️ Connect Supabase (add your keys to <code>.env</code>) to use the committee admin panel. See the README.</div>
      </div></section>
    )
  }
  if (loading) return <div className="empty">Loading…</div>
  if (!session) return <Navigate to="/admin/login" replace />
  return children
}
