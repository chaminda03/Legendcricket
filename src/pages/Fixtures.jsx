import { useState } from 'react'
import SeasonSelect from '../components/SeasonSelect'
import SeasonEmpty from '../components/SeasonEmpty'
import MatchResultLine from '../components/MatchResultLine'
import { useSeason } from '../context/SeasonContext'
import { useSeasonData } from '../hooks/useSeasonData'
import { indexById } from '../data/compute'

function MatchCard({ m, teamsById }) {
  const h = teamsById[m.home_team] || {}
  const a = teamsById[m.away_team] || {}
  const done = m.status === 'completed' && m.home_runs != null
  const homeWon = done && m.home_runs > m.away_runs
  const awayWon = done && m.away_runs > m.home_runs

  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="match-meta">
        <span className="tag grp">Group {m.grp}</span>
        <span className={`tag ${done ? 'done' : 'soon'}`}>{done ? 'Result' : 'Upcoming'}</span>
      </div>
      <div className="match" style={{ border: 0, padding: 0, background: 'transparent' }}>
        <div className="side">
          <span className="tb-sm" style={{ background: h.color || '#334155' }}>{h.short || '—'}</span>
          <div>
            <div className={`name ${homeWon ? 'won' : ''}`}>{h.name || 'TBD'}</div>
            {done && <div className="score">{m.home_runs}/{m.home_wkts} ({m.home_overs})</div>}
          </div>
        </div>
        <div className="mid"><span className="vs">{done ? '—' : 'VS'}</span></div>
        <div className="side away">
          <span className="tb-sm" style={{ background: a.color || '#334155' }}>{a.short || '—'}</span>
          <div>
            <div className={`name ${awayWon ? 'won' : ''}`}>{a.name || 'TBD'}</div>
            {done && <div className="score">{m.away_runs}/{m.away_wkts} ({m.away_overs})</div>}
          </div>
        </div>
      </div>
      <MatchResultLine m={m} teamsById={teamsById} />
      {(m.date || m.venue) && (
        <div className="match-meta" style={{ marginTop: 12, marginBottom: 0 }}>
          {m.date && <span>🏏 {m.date}</span>}
          {m.venue && <span>📍 {m.venue}</span>}
        </div>
      )}
    </div>
  )
}

export default function Fixtures() {
  const [filter, setFilter] = useState('all')
  const { season } = useSeason()
  const { matches, teams, loading } = useSeasonData(season)
  const teamsById = indexById(teams)

  // Group-stage only — knockout matches are shown on the Knockouts bracket page.
  // Group tabs are derived from the draw so any number of groups renders.
  const groupMatches = matches.filter((m) => m.stage !== 'knockout' && m.grp)
  const groups = [...new Set(groupMatches.map((m) => m.grp))].sort()

  const filtered = groupMatches.filter((m) => {
    if (filter === 'all') return true
    if (filter === 'completed') return m.status === 'completed'
    return m.grp === filter
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

        {loading ? (
          <div className="empty">Loading fixtures…</div>
        ) : groupMatches.length === 0 ? (
          <SeasonEmpty year={season} what="The full fixture list" />
        ) : (
          <>
            <div className="tabs">
              <button className={`tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
              <button className={`tab ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>Results</button>
              {groups.map((g) => (
                <button key={g} className={`tab ${filter === g ? 'active' : ''}`} onClick={() => setFilter(g)}>Grp {g}</button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="empty">No matches to show here yet. 🏏</div>
            ) : (
              <div className="grid grid-2" style={{ alignItems: 'start' }}>
                {filtered.map((m) => <MatchCard key={m.id} m={m} teamsById={teamsById} />)}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
