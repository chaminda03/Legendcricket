import { useMemo } from 'react'
import SeasonSelect from '../components/SeasonSelect'
import { useSeason } from '../context/SeasonContext'
import { useFormat } from '../context/FormatContext'
import { useSeasonData } from '../hooks/useSeasonData'
import { seededSuper8, buildBracketFrom, knockoutResultsFromMatches, indexById } from '../data/compute'
import { formatNRR } from '../data/standings'
import { CURRENT_SEASON, getSeason } from '../data/seasons'
import { getFormat } from '../data/formats'

function TeamRow({ team, isWinner }) {
  if (!team) {
    return (
      <div className="brow tbd">
        <span className="bt empty">?</span>
        <span>To be decided</span>
      </div>
    )
  }
  return (
    <div className={`brow ${isWinner ? 'win' : ''}`}>
      <span className="bt" style={{ background: team.color }}>{team.short}</span>
      <span>{team.name}</span>
    </div>
  )
}

function Match({ m, isFinal, teamsById }) {
  return (
    <div className={`bmatch ${isFinal ? 'final-match' : ''}`}>
      <div className="bcode">{m.code}</div>
      <TeamRow team={m.a ? teamsById[m.a] : null} isWinner={m.winner && m.winner === m.a} />
      <TeamRow team={m.b ? teamsById[m.b] : null} isWinner={m.winner && m.winner === m.b} />
    </div>
  )
}

const groupTag = (pos) => (pos === 1 ? ' · Winner' : pos === 2 ? ' · Runner-up' : ` · #${pos}`)

const qualifyBlurb = (format) =>
  format.qualify === 'pure-pool'
    ? 'The top eight teams overall qualify for the Super 8.'
    : 'Every group winner plus the best runners-up qualify for the Super 8.'

export default function Knockouts() {
  const { season } = useSeason()
  const { format: adminFormat } = useFormat()
  const { teams, matches, loading } = useSeasonData(season)

  // The live season uses the committee's selected format; past seasons use the
  // fixed format they were played under (default 16-team).
  const format = season === CURRENT_SEASON ? adminFormat : getFormat(getSeason(season).format || 16)

  const teamsById = useMemo(() => indexById(teams), [teams])
  const seeds = useMemo(() => seededSuper8(teams, matches, format), [teams, matches, format])
  const results = useMemo(
    () => (season === CURRENT_SEASON
      ? knockoutResultsFromMatches(matches)
      : getSeason(season).knockoutResults || {}),
    [season, matches],
  )
  const { quarterfinals, semifinals, final, champion } = useMemo(
    () => buildBracketFrom(seeds, results), [seeds, results],
  )
  const championTeam = champion ? teamsById[champion] : null
  const ready = seeds.length === 8

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">The Road to Glory</span>
          <h2>Knockout Stage</h2>
          <p>{qualifyBlurb(format)} The eight qualifiers are re-seeded 1–8 by points and Net Run Rate, then battle through quarterfinals, semifinals and the grand final.</p>
        </div>

        <SeasonSelect />

        {loading ? (
          <div className="empty">Loading bracket…</div>
        ) : !ready ? (
          <div className="empty">
            🏏 The Super 8 bracket unlocks once the group stage decides eight qualifiers.
            <br /><span className="muted">{seeds.length}/8 seeded so far.</span>
          </div>
        ) : (
          <>
            {/* Bracket */}
            <div className="bracket" style={{ marginBottom: 44 }}>
              <div className="bracket-col">
                <h3>⚡ Quarterfinals</h3>
                {quarterfinals.map((m) => <Match key={m.code} m={m} teamsById={teamsById} />)}
              </div>
              <div className="bracket-col center">
                <h3>🔥 Semifinals</h3>
                {semifinals.map((m) => <Match key={m.code} m={m} teamsById={teamsById} />)}
              </div>
              <div className="bracket-col right">
                <h3>👑 Grand Final</h3>
                <Match m={final} teamsById={teamsById} isFinal />
                {championTeam && (
                  <div className="champion-banner">
                    <div className="lbl">🏆 Champions</div>
                    <div className="name">{championTeam.name}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Qualified seeds */}
            <div className="section-head" style={{ marginBottom: 18 }}>
              <span className="eyebrow">Seeding</span>
              <h2 style={{ fontSize: '1.8rem' }}>Qualified Teams</h2>
            </div>
            <div className="table-wrap">
              <table className="ladder">
                <thead>
                  <tr>
                    <th>Seed</th>
                    <th className="team-col">Team</th>
                    <th>Group</th>
                    <th>Pts</th>
                    <th>NRR</th>
                  </tr>
                </thead>
                <tbody>
                  {seeds.map((q) => {
                    const team = teamsById[q.teamId]
                    if (!team) return null
                    return (
                      <tr key={q.teamId}>
                        <td className="pos">{q.seed}</td>
                        <td className="team-col">
                          <span className="team-cell">
                            <span className="tb" style={{ background: team.color }}>{team.short}</span>
                            <span className="tn">{team.name}</span>
                          </span>
                        </td>
                        <td>{q.group}{groupTag(q.groupPos)}</td>
                        <td className="pts" style={{ color: 'var(--text)' }}>{q.points}</td>
                        <td>{formatNRR(q.nrr)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
