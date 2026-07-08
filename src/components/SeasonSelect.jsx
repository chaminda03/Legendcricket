import { useSeason } from '../context/SeasonContext'
import { SEASON_YEARS, getSeason } from '../data/seasons'

// Compact season picker. Sits at the top of the results pages so visitors can
// flip between this year and past championships.
export default function SeasonSelect() {
  const { season, setSeason } = useSeason()
  const meta = getSeason(season)

  return (
    <div className="season-select">
      <label htmlFor="season">Season</label>
      <div className="season-select-control">
        <select id="season" value={season} onChange={(e) => setSeason(Number(e.target.value))}>
          {SEASON_YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <span className={`season-badge ${meta.status}`}>{meta.tagline}</span>
      </div>
    </div>
  )
}
