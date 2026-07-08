import { buildBracket } from '../data/knockout'
import { getTeam } from '../data/teams'
import { formatNRR } from '../data/standings'
import SeasonSelect from '../components/SeasonSelect'
import SeasonEmpty from '../components/SeasonEmpty'
import { useSeason } from '../context/SeasonContext'
import { hasResults } from '../data/seasons'

function TeamRow({ teamId, isWinner }) {
  const team = teamId ? getTeam(teamId) : null
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

function Match({ m, isFinal }) {
  return (
    <div className={`bmatch ${isFinal ? 'final-match' : ''}`}>
      <div className="bcode">{m.code}</div>
      <TeamRow teamId={m.a} isWinner={m.winner && m.winner === m.a} />
      <TeamRow teamId={m.b} isWinner={m.winner && m.winner === m.b} />
    </div>
  )
}

export default function Knockouts() {
  const { season } = useSeason()

  if (!hasResults(season)) {
    return (
      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">The Road to Glory</span>
            <h2>Knockout Stage</h2>
            <p>The top two from each group qualify, are re-seeded 1–8 by points and Net Run Rate, then battle through quarterfinals, semifinals and the grand final.</p>
          </div>
          <SeasonSelect />
          <SeasonEmpty year={season} what="The knockout bracket" />
        </div>
      </section>
    )
  }

  const { seeds, quarterfinals, semifinals, final, champion } = buildBracket(season)
  const championTeam = champion ? getTeam(champion) : null

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">The Road to Glory</span>
          <h2>Knockout Stage</h2>
          <p>The top two from each group qualify, are re-seeded 1–8 by points and Net Run Rate, then battle through quarterfinals, semifinals and the grand final.</p>
        </div>

        <SeasonSelect />

        {/* Bracket */}
        <div className="bracket" style={{ marginBottom: 44 }}>
          <div className="bracket-col">
            <h3>⚡ Quarterfinals</h3>
            {quarterfinals.map((m) => <Match key={m.code} m={m} />)}
          </div>
          <div className="bracket-col center">
            <h3>🔥 Semifinals</h3>
            {semifinals.map((m) => <Match key={m.code} m={m} />)}
          </div>
          <div className="bracket-col right">
            <h3>👑 Grand Final</h3>
            <Match m={final} isFinal />
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
                const team = getTeam(q.teamId)
                return (
                  <tr key={q.teamId}>
                    <td className="pos">{q.seed}</td>
                    <td className="team-col">
                      <span className="team-cell">
                        <span className="tb" style={{ background: team.color }}>{team.short}</span>
                        <span className="tn">{team.name}</span>
                      </span>
                    </td>
                    <td>{q.group}{q.groupPos === 1 ? ' · Winner' : ' · Runner-up'}</td>
                    <td className="pts" style={{ color: 'var(--text)' }}>{q.points}</td>
                    <td>{formatNRR(q.nrr)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
