import { groupStandings, formatNRR } from '../data/standings'
import { getTeam } from '../data/teams'

// Top 2 of each group qualify for the quarterfinals.
const QUALIFY = 2

export default function StandingsTable({ year, group }) {
  const rows = groupStandings(year, group)

  return (
    <div className="table-wrap">
      <table className="ladder">
        <thead>
          <tr>
            <th>#</th>
            <th className="team-col">Team</th>
            <th>P</th>
            <th>W</th>
            <th>L</th>
            <th>T</th>
            <th>NRR</th>
            <th>Form</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const team = getTeam(r.teamId)
            return (
              <tr key={r.teamId} className={i < QUALIFY ? 'qualify' : ''}>
                <td className="pos">{i + 1}</td>
                <td className="team-col">
                  <span className="team-cell">
                    <span className="tb" style={{ background: team.color }}>{team.short}</span>
                    <span className="tn">{team.name}</span>
                  </span>
                </td>
                <td>{r.played}</td>
                <td>{r.won}</td>
                <td>{r.lost}</td>
                <td>{r.tied}</td>
                <td>{formatNRR(r.nrr)}</td>
                <td>
                  <span className="form-dots">
                    {r.form.length === 0
                      ? <span className="L">–</span>
                      : r.form.slice(-4).map((f, k) => <span key={k} className={f}>{f}</span>)}
                  </span>
                </td>
                <td className="pts">{r.points}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
