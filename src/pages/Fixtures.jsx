import { useState } from 'react'
import { getTeam, GROUPS } from '../data/teams'
import SeasonSelect from '../components/SeasonSelect'
import SeasonEmpty from '../components/SeasonEmpty'
import { useSeason } from '../context/SeasonContext'
import { fixturesForSeason, hasResults } from '../data/seasons'

function MatchCard({ m }) {
  const h = getTeam(m.home)
  const a = getTeam(m.away)
  const done = m.status === 'completed'
  const homeWon = done && m.result.home.runs > m.result.away.runs
  const awayWon = done && m.result.away.runs > m.result.home.runs

  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="match-meta">
        <span className="tag grp">Group {m.group}</span>
        <span className={`tag ${done ? 'done' : 'soon'}`}>{done ? 'Result' : 'Upcoming'}</span>
      </div>
      <div className="match" style={{ border: 0, padding: 0, background: 'transparent' }}>
        <div className="side">
          <span className="tb-sm" style={{ background: h.color }}>{h.short}</span>
          <div>
            <div className={`name ${homeWon ? 'won' : ''}`}>{h.name}</div>
            {done && <div className="score">{m.result.home.runs}/{m.result.home.wickets} ({m.result.home.overs})</div>}
          </div>
        </div>
        <div className="mid">
          <span className="vs">{done ? '—' : 'VS'}</span>
        </div>
        <div className="side away">
          <span className="tb-sm" style={{ background: a.color }}>{a.short}</span>
          <div>
            <div className={`name ${awayWon ? 'won' : ''}`}>{a.name}</div>
            {done && <div className="score">{m.result.away.runs}/{m.result.away.wickets} ({m.result.away.overs})</div>}
          </div>
        </div>
      </div>
      <div className="match-meta" style={{ marginTop: 12, marginBottom: 0 }}>
        <span>🏏 {m.date}</span>
        <span>📍 {m.venue}</span>
      </div>
    </div>
  )
}

export default function Fixtures() {
  const [filter, setFilter] = useState('all')
  const { season } = useSeason()
  const fixtures = fixturesForSeason(season)

  const filtered = fixtures.filter((m) => {
    if (filter === 'all') return true
    if (filter === 'completed') return m.status === 'completed'
    if (filter === 'upcoming') return m.status === 'upcoming'
    return m.group === filter
  })

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Schedule</span>
          <h2>Fixtures &amp; Results</h2>
          <p>All group-stage matches across the championship.</p>
        </div>

        <SeasonSelect />

        {!hasResults(season) ? (
          <SeasonEmpty year={season} what="The full fixture list" />
        ) : (
          <>
            <div className="tabs">
              <button className={`tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
              <button className={`tab ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>Results</button>
              {GROUPS.map((g) => (
                <button key={g} className={`tab ${filter === g ? 'active' : ''}`} onClick={() => setFilter(g)}>Grp {g}</button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="empty">No matches to show here yet. 🏏</div>
            ) : (
              <div className="grid grid-2" style={{ alignItems: 'start' }}>
                {filtered.map((m) => <MatchCard key={m.id} m={m} />)}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
