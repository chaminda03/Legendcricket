import { NavLink, Outlet, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useFormat } from '../../context/FormatContext'
import { CURRENT_SEASON } from '../../data/seasons'
import { FORMAT_SIZES, FORMATS, matchesLabel, qualifyLabel } from '../../data/formats'

export default function AdminLayout() {
  const { user, signOut } = useAuth()
  const { size, setSize, format } = useFormat()
  return (
    <section className="section">
      <div className="container">
        <div className="admin-bar">
          <div>
            <span className="eyebrow">Committee · {CURRENT_SEASON} Season</span>
            <h2>Admin Panel</h2>
          </div>
          <div className="admin-bar-actions">
            <span className="admin-user">{user?.email}</span>
            <Link to="/" className="btn btn-ghost">View Site</Link>
            <button className="btn btn-ghost" onClick={signOut}>Sign Out</button>
          </div>
        </div>

        <div className="admin-format">
          <div className="admin-format-label">
            <span className="eyebrow">Tournament Format</span>
            <span className="muted">{format.sub} · {matchesLabel(format)} · {qualifyLabel(format)}</span>
          </div>
          <div className="format-switch" role="group" aria-label="Tournament format">
            {FORMAT_SIZES.map((s) => (
              <button
                key={s}
                type="button"
                className={`fmt-btn ${size === s ? 'active' : ''}`}
                aria-pressed={size === s}
                onClick={() => setSize(s)}
              >
                {FORMATS[s].label}
              </button>
            ))}
          </div>
        </div>

        <div className="admin-nav">
          <NavLink end to="/admin">Teams &amp; Draw</NavLink>
          <NavLink to="/admin/matches">Fixtures &amp; Scores</NavLink>
        </div>

        <Outlet />
      </div>
    </section>
  )
}
