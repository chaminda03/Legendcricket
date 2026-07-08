import { useState } from 'react'
import StandingsTable from '../components/StandingsTable'
import SeasonSelect from '../components/SeasonSelect'
import SeasonEmpty from '../components/SeasonEmpty'
import { GROUPS } from '../data/teams'
import { useSeason } from '../context/SeasonContext'
import { hasResults, getSeason } from '../data/seasons'

export default function PointsTable() {
  const [group, setGroup] = useState('A')
  const { season } = useSeason()

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Live Standings</span>
          <h2>Tournament Points Table</h2>
          <p>Top two teams from each group advance to the quarterfinals. Ties are broken by Net Run Rate.</p>
        </div>

        <SeasonSelect />

        {!hasResults(season) ? (
          <SeasonEmpty year={season} what="The points table" />
        ) : (
          <>
            <div className="tabs">
              {GROUPS.map((g) => (
                <button key={g} className={`tab ${group === g ? 'active' : ''}`} onClick={() => setGroup(g)}>
                  Group {g}
                </button>
              ))}
            </div>

            <StandingsTable year={season} group={group} />

            <div className="legend">
              <span className="k"><span className="swatch" style={{ background: 'var(--primary)' }} /> Qualification zone (Top 2)</span>
              <span className="k"><span className="swatch" style={{ background: 'var(--primary)' }} /> W</span>
              <span className="k"><span className="swatch" style={{ background: 'var(--gold)' }} /> Tie</span>
              <span className="k"><span className="swatch" style={{ background: '#47517f' }} /> L</span>
              <span className="k">P Played · W Won · L Lost · T Tied · NRR Net Run Rate · Pts Points</span>
            </div>

            {getSeason(season).photos?.length > 0 && (
              <div className="season-photos">
                <div className="section-head" style={{ marginTop: 44, marginBottom: 18 }}>
                  <span className="eyebrow">{season} Cricket Carnival</span>
                  <h2 style={{ fontSize: '1.8rem' }}>Champions &amp; Finalists</h2>
                </div>
                <div className="season-photos-grid">
                  {getSeason(season).photos.map((p) => (
                    <figure key={p.src} className={`photo-card ${p.champion ? 'champion' : ''}`}>
                      <img src={p.src} alt={p.label} />
                      <figcaption className="cap">{p.champion ? '🏆 ' : ''}{p.label}</figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
