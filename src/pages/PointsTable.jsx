import { useMemo, useState } from 'react'
import StandingsTable from '../components/StandingsTable'
import SeasonSelect from '../components/SeasonSelect'
import SeasonEmpty from '../components/SeasonEmpty'
import { useSeason } from '../context/SeasonContext'
import { useFormat } from '../context/FormatContext'
import { useSeasonData } from '../hooks/useSeasonData'
import {
  standingsByGroup, indexById, projectedSuper8, overallStandings,
  groupMatchesPlayed, groupMatchesRemaining,
} from '../data/compute'
import { CURRENT_SEASON, getSeason } from '../data/seasons'
import { getFormat, qualifyDescription } from '../data/formats'

// "Nothing is settled until N more matches are played." Keeps the projection
// honestly labelled as a projection.
const matchesLeft = (matches) => {
  const left = groupMatchesRemaining(matches)
  if (left === 0) return 'The group stage is complete — these are the final qualifiers.'
  return `Nothing is settled: ${left} group ${left === 1 ? 'match' : 'matches'} still to play.`
}

export default function PointsTable() {
  const { season } = useSeason()
  const { format: adminFormat } = useFormat()
  const { teams, matches, loading } = useSeasonData(season)
  const [group, setGroup] = useState('overall')

  // Live season uses the committee's selected format; past seasons use the one
  // they were played under (default 16-team).
  const format = season === CURRENT_SEASON ? adminFormat : getFormat(getSeason(season).format || 16)

  const standings = standingsByGroup(teams, matches)
  const teamsById = indexById(teams)
  const groupsAvail = Object.keys(standings).sort()
  const tabs = groupsAvail.length > 0 ? ['overall', ...groupsAvail] : []
  const active = tabs.includes(group) ? group : tabs[0]
  const photos = getSeason(season).photos || []

  // Every team ranked 1..N across the tournament, so a side can see where it
  // sits overall and not just inside its own group.
  const overall = useMemo(() => overallStandings(teams, matches), [teams, matches])

  // Who would go through on today's table — the projection, not the settled
  // bracket, so the zone is meaningful while the group stage is still running.
  // Withheld until something has actually been played: with every team on zero
  // the ranking is arbitrary and highlighting eight of them would be a lie.
  const played = groupMatchesPlayed(matches)
  const qualifiedIds = useMemo(
    () => new Set(played > 0 ? projectedSuper8(teams, matches, format).map((q) => q.teamId) : []),
    [teams, matches, format, played],
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
              <button className={`tab ${active === 'overall' ? 'active' : ''}`} onClick={() => setGroup('overall')}>
                All Teams
              </button>
              {groupsAvail.map((g) => (
                <button key={g} className={`tab ${active === g ? 'active' : ''}`} onClick={() => setGroup(g)}>
                  Group {g}
                </button>
              ))}
            </div>

            {active === 'overall' ? (
              <>
                <StandingsTable rows={overall} teamsById={teamsById} qualifiedIds={qualifiedIds} showGroup />
                <p className="table-note">
                  {played === 0 ? (
                    <>No matches played yet — the table fills in as results come through, and the
                    Super 8 zone lights up once there is something to rank.</>
                  ) : format.qualify === 'pure-pool' ? (
                    <>Highlighted teams are the top {8} overall and would make the Super 8 on today’s
                    table. {matchesLeft(matches)}</>
                  ) : (
                    <>Highlighted teams would make the Super 8 on today’s table. Because every group
                    winner qualifies automatically, a side can go through from a lower overall rank
                    than one that misses out — the <strong>Grp</strong> column shows each team’s group
                    and its position in it. {matchesLeft(matches)}</>
                  )}
                </p>
              </>
            ) : (
              <StandingsTable rows={standings[active] || []} teamsById={teamsById} qualifiedIds={qualifiedIds} />
            )}

            <div className="legend">
              <span className="k"><span className="swatch" style={{ background: 'var(--primary)' }} /> Currently qualifying for the Super 8</span>
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
