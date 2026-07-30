import { Link } from 'react-router-dom'

// Shown on results pages when the selected season has no fixtures yet.
export default function SeasonEmpty({ year, what = 'Standings' }) {
  return (
    <div className="season-empty">
      <div className="ic">🏏</div>
      <h3>The {year} season is coming</h3>
      <p>{what} will appear here once the {year} fixtures get under way. Switch the season dropdown to a past year to view completed results.</p>
      <Link to="/schedule" className="btn btn-primary">View the Schedule →</Link>
    </div>
  )
}
