import { useMemo } from 'react'
import SeasonSelect from '../components/SeasonSelect'
import { useSeason } from '../context/SeasonContext'
import { useFormat } from '../context/FormatContext'
import { useSeasonData } from '../hooks/useSeasonData'
import {
  indexById, seededSuper8, buildBracketFrom, knockoutResultsFromMatches,
} from '../data/compute'
import { CURRENT_SEASON, getSeason } from '../data/seasons'
import { getFormat } from '../data/formats'
import { buildTimetable, formatTime, isScheduled, byCode } from '../data/schedule'

// A knockout row is created when it is scheduled, before its teams are known.
// The live bracket fills the names in as earlier results come through.
function Team({ team, label, won }) {
  if (!team) return <span className="sc-team tbd">{label || 'TBD'}</span>
  return (
    <span className={`sc-team ${won ? 'won' : ''}`}>
      <span className="tb-xs" style={{ background: team.color }}>{team.short}</span>
      <span className="sc-team-name">{team.name}</span>
    </span>
  )
}

function SlotCard({ m, teamsById, bracket }) {
  const bm = bracket[m.code]
  const homeId = m.home_team || bm?.a
  const awayId = m.away_team || bm?.b
  const done = m.status === 'completed' && m.home_runs != null
  const isKo = m.stage === 'knockout'

  return (
    <div className={`slot-card ${done ? 'done' : ''}`}>
      <div className="slot-head">
        <span className="slot-code">{m.code}</span>
        <span className={`tag ${isKo ? 'ko' : 'grp'}`}>{isKo ? 'Knockout' : `Group ${m.grp}`}</span>
      </div>
      <div className="slot-teams">
        <Team team={teamsById[homeId]} won={done && m.home_runs > m.away_runs} />
        <span className="slot-vs">v</span>
        <Team team={teamsById[awayId]} won={done && m.away_runs > m.home_runs} />
      </div>
      {done && (
        <div className="slot-score">
          {m.home_runs}/{m.home_wkts} ({m.home_overs}) — {m.away_runs}/{m.away_wkts} ({m.away_overs})
        </div>
      )}
    </div>
  )
}

export default function Schedule() {
  const { season } = useSeason()
  const { format: adminFormat } = useFormat()
  const { teams, matches, loading } = useSeasonData(season)

  const format = season === CURRENT_SEASON ? adminFormat : getFormat(getSeason(season).format || 16)
  const teamsById = useMemo(() => indexById(teams), [teams])

  // Knockout slots can be timed before their teams are decided — resolve them
  // from the live bracket so the timetable shows real names as soon as it can.
  const bracket = useMemo(() => {
    const seeds = seededSuper8(teams, matches, format)
    const b = buildBracketFrom(seeds, knockoutResultsFromMatches(matches))
    return Object.fromEntries(
      [...b.quarterfinals, ...b.semifinals, b.final].map((m) => [m.code, m]),
    )
  }, [teams, matches, format])

  const { fields, rows } = useMemo(() => buildTimetable(matches), [matches])
  const unscheduled = useMemo(
    () => matches.filter((m) => !isScheduled(m) && m.home_team && m.away_team).sort(byCode),
    [matches],
  )

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Match Day</span>
          <h2>Schedule</h2>
          <p>
            Games run on {fields.length || 4} fields at once — every field kicks off together, so
            each row below is one round of simultaneous matches.
          </p>
        </div>

        <SeasonSelect />

        {loading ? (
          <div className="empty">Loading schedule…</div>
        ) : rows.length === 0 ? (
          <div className="empty">
            🏏 The match-day schedule hasn’t been published yet.
            <br /><span className="muted">Kick-off times and field allocations appear here once the committee sets them.</span>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="schedule-table">
              <thead>
                <tr>
                  <th className="time-col">Time</th>
                  {fields.map((f) => <th key={f}>Field {f}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.time}>
                    <td className="time-col"><span className="slot-time">{formatTime(r.time)}</span></td>
                    {r.cells.map((cell, i) => (
                      <td key={fields[i]}>
                        {cell.length === 0
                          ? <span className="slot-free">—</span>
                          : cell.map((m) => (
                              <SlotCard key={m.id || m.code} m={m} teamsById={teamsById} bracket={bracket} />
                            ))}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && unscheduled.length > 0 && (
          <>
            <div className="section-head" style={{ margin: '40px 0 14px' }}>
              <span className="eyebrow">To be confirmed</span>
              <h2 style={{ fontSize: '1.6rem' }}>Not Yet Scheduled</h2>
            </div>
            <div className="unscheduled-list">
              {unscheduled.map((m) => (
                <SlotCard key={m.id || m.code} m={m} teamsById={teamsById} bracket={bracket} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
