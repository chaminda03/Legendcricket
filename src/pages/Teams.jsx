import SeasonSelect from '../components/SeasonSelect'
import SeasonEmpty from '../components/SeasonEmpty'
import { useSeason } from '../context/SeasonContext'
import { useSeasonData } from '../hooks/useSeasonData'

// Fallback short code from a team name if the committee hasn't set one.
const initials = (name = '') =>
  name.split(/\s+/).filter(Boolean).slice(0, 3).map((w) => w[0]).join('').toUpperCase() || '—'

// Squads are stored as one name per line on the team row.
const squadOf = (t) =>
  String(t.players || '').split('\n').map((n) => n.trim()).filter(Boolean)

export default function Teams() {
  const { season } = useSeason()
  const { teams, loading } = useSeasonData(season)

  // Sections are derived from the actual draw, so any number of groups (A–E…)
  // renders correctly; ungrouped teams fall under "Awaiting Draw".
  const byGroup = {}
  teams.forEach((t) => { const g = t.grp || 'TBD'; (byGroup[g] ||= []).push(t) })
  const groupKeys = Object.keys(byGroup).filter((g) => g !== 'TBD').sort()
  const sections = [...groupKeys, ...(byGroup.TBD ? ['TBD'] : [])]

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">The Contenders</span>
          <h2>Teams &amp; Groups</h2>
          <p>Meet the clubs battling for the Virginia Legends trophy, and the squads they’re fielding.</p>
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
                  const squad = squadOf(t)
                  return (
                    <div key={t.id} className="team-card">
                      <div className="accent" style={{ background: color }} />
                      <div className="team-badge" style={{ background: color }}>{t.short || initials(t.name)}</div>
                      <h3>{t.name}</h3>
                      <span className="group-pill">{g === 'TBD' ? 'Awaiting draw' : `Group ${g}`}</span>
                      {squad.length > 0 && (
                        <div className="squad">
                          <div className="squad-head">Squad · {squad.length}</div>
                          <ol className="squad-list">
                            {squad.map((p, i) => <li key={i}>{p}</li>)}
                          </ol>
                        </div>
                      )}
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
