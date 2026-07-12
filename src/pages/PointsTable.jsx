import { useMemo, useState } from 'react'
import StandingsTable from '../components/StandingsTable'
import SeasonSelect from '../components/SeasonSelect'
import SeasonEmpty from '../components/SeasonEmpty'
import { useSeason } from '../context/SeasonContext'
import { useFormat } from '../context/FormatContext'
import { useSeasonData } from '../hooks/useSeasonData'
import { standingsByGroup, indexById, seededSuper8 } from '../data/compute'
import { CURRENT_SEASON, getSeason } from '../data/seasons'
import { getFormat, qualifyDescription } from '../data/formats'

export default function PointsTable() {
  const { season } = useSeason()
  const { format: adminFormat } = useFormat()
  const { teams, matches, loading } = useSeasonData(season)
  const [group, setGroup] = useState('A')

  // Live season uses the committee's selected format; past seasons use the one
  // they were played under (default 16-team).
  const format = season === CURRENT_SEASON ? adminFormat : getFormat(getSeason(season).format || 16)

  const standings = standingsByGroup(teams, matches)
  const teamsById = indexById(teams)
  const groupsAvail = Object.keys(standings).sort()
  const active = groupsAvail.includes(group) ? group : groupsAvail[0]
  const photos = getSeason(season).photos || []

  // The teams currently in the Super 8 — computed from live standings + the
  // format's qualification rule, so the highlight is never hardcoded.
  const qualifiedIds = useMemo(
    () => new Set(seededSuper8(teams, matches, format).map((q) => q.teamId)),
    [teams, matches, format],
  )

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Live Standings</span>
          <h2>Tournament Points Table</h2>
          <p>{qualifyDescription(format)} Ties are broken by Net Run Rate.</p>
        </div>

        <SeasonSelect />

        {loading ? (
          <div className="empty">Loading standings…</div>
        ) : groupsAvail.length === 0 ? (
          <SeasonEmpty year={season} what="The points table" />
        ) : (
          <>
            <div className="tabs">
              {groupsAvail.map((g) => (
                <button key={g} className={`tab ${active === g ? 'active' : ''}`} onClick={() => setGroup(g)}>
                  Group {g}
                </button>
              ))}
            </div>

            <StandingsTable rows={standings[active] || []} teamsById={teamsById} qualifiedIds={qualifiedIds} />

            <div className="legend">
              <span className="k"><span className="swatch" style={{ background: 'var(--primary)' }} /> Super 8 qualification zone</span>
              <span className="k"><span className="swatch" style={{ background: 'var(--primary)' }} /> W</span>
              <span className="k"><span className="swatch" style={{ background: 'var(--gold)' }} /> Tie</span>
              <span className="k"><span className="swatch" style={{ background: '#47517f' }} /> L</span>
              <span className="k">P Played · W Won · L Lost · T Tied · NRR Net Run Rate · Pts Points</span>
            </div>
          </>
        )}

        {photos.length > 0 && (
          <div className="season-photos">
            <div className="section-head" style={{ marginTop: 44, marginBottom: 18 }}>
              <span className="eyebrow">{season} Cricket Carnival</span>
              <h2 style={{ fontSize: '1.8rem' }}>Champions &amp; Finalists</h2>
            </div>
            <div className="season-photos-grid">
              {photos.map((p) => (
                <figure key={p.src} className={`photo-card ${p.champion ? 'champion' : ''}`}>
                  <img src={p.src} alt={p.label} />
                  <figcaption className="cap">{p.champion ? '🏆 ' : ''}{p.label}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
