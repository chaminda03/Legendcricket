import SeasonSelect from '../components/SeasonSelect'
import SeasonEmpty from '../components/SeasonEmpty'
import { useSeason } from '../context/SeasonContext'
import { useSeasonData } from '../hooks/useSeasonData'
import { GROUPS } from '../data/teams'

// Fallback short code from a team name if the committee hasn't set one.
const initials = (name = '') =>
  name.split(/\s+/).filter(Boolean).slice(0, 3).map((w) => w[0]).join('').toUpperCase() || '—'

export default function Teams() {
  const { season } = useSeason()
  const { teams, loading } = useSeasonData(season)

  const byGroup = {}
  teams.forEach((t) => { const g = t.grp || 'TBD'; (byGroup[g] ||= []).push(t) })
  const sections = [...GROUPS.filter((g) => byGroup[g]), ...(byGroup.TBD ? ['TBD'] : [])]

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">The Contenders</span>
          <h2>Teams &amp; Groups</h2>
          <p>Meet the clubs battling for the Virginia Legends trophy.</p>
        </div>

        <SeasonSelect />

        {loading ? (
          <div className="empty">Loading teams…</div>
        ) : teams.length === 0 ? (
          <SeasonEmpty year={season} what="The team line-up" />
        ) : (
          sections.map((g) => (
            <div key={g} style={{ marginBottom: 40 }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: 16, color: 'var(--primary)' }}>
                {g === 'TBD' ? 'Awaiting Draw' : `Group ${g}`}
              </h3>
              <div className="grid grid-4">
                {byGroup[g].map((t) => {
                  const color = t.color || '#3B82F6'
                  return (
                    <div key={t.id} className="team-card">
                      <div className="accent" style={{ background: color }} />
                      <div className="team-badge" style={{ background: color }}>{t.short || initials(t.name)}</div>
                      <h3>{t.name}</h3>
                      <span className="group-pill">{g === 'TBD' ? 'Awaiting draw' : `Group ${g}`}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
