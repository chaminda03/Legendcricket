import { GROUPS, teamsByGroup } from '../data/teams'

export default function Teams() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">The Contenders</span>
          <h2>16 Teams · 4 Groups</h2>
          <p>Meet the clubs battling for the Virginia Legends trophy this season.</p>
        </div>

        {GROUPS.map((g) => (
          <div key={g} style={{ marginBottom: 40 }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: 16, color: 'var(--primary)' }}>Group {g}</h3>
            <div className="grid grid-4">
              {teamsByGroup(g).map((t) => (
                <div key={t.id} className="team-card">
                  <div className="accent" style={{ background: t.color }} />
                  <div className="team-badge" style={{ background: t.color }}>{t.short}</div>
                  <h3>{t.name}</h3>
                  <span className="group-pill">Group {t.group}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
