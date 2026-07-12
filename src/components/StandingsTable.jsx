import { formatNRR } from '../data/standings'

// Presentational standings table. Works for any season — pass computed rows and
// a { teamId: {name, short, color} } lookup.
//   qualifiedIds  optional Set of team ids currently in the qualification zone;
//                 when given it drives the highlight (format-aware). Otherwise
//                 falls back to the first `qualify` rows.
export default function StandingsTable({ rows = [], teamsById = {}, qualify = 2, qualifiedIds = null }) {
  const isQualified = (r, i) => (qualifiedIds ? qualifiedIds.has(r.teamId) : i < qualify)
  return (
    <div className="table-wrap ladder-full">
      <table className="ladder">
        <thead>
          <tr>
            <th>#</th>
            <th className="team-col">Team</th>
            <th>P</th><th>W</th><th>L</th><th>T</th><th>NRR</th><th>Form</th><th>Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const team = teamsById[r.teamId] || {}
            return (
              <tr key={r.teamId} className={isQualified(r, i) ? 'qualify' : ''}>
                <td className="pos">{i + 1}</td>
                <td className="team-col">
                  <span className="team-cell">
                    <span className="tb" style={{ background: team.color || '#334155' }}>{team.short || '—'}</span>
                    <span className="tn">{team.name || 'Unknown'}</span>
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
