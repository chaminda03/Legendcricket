import { FIXTURES } from './fixtures'

// ============================================================================
//  Seasons registry. Each season carries its own fixtures + knockout results,
//  so the site can show any year's standings / bracket from the dropdown.
//
//  2025 = the completed championship (real data, champion: Challengers Green).
//  2026 = the upcoming season — registration is open, fixtures TBA.
// ============================================================================

export const SEASONS = {
  2026: {
    year: 2026,
    status: 'upcoming', // registration open, not started yet
    tagline: 'Registration Open',
    fixtures: [],
    knockoutResults: {},
    champion: null,
  },
  2025: {
    year: 2025,
    status: 'completed',
    tagline: 'Champions · Challengers Green',
    format: 16, // played as 16 teams / 4 groups — drives the knockout seeding
    fixtures: FIXTURES,
    knockoutResults: {
      QF1: 'va-legends-red', QF2: 'jolly-boys-red',
      QF3: 'challengers-green', QF4: 'titans-gray',
      SF1: 'titans-gray', SF2: 'challengers-green',
      FINAL: 'challengers-green',
    },
    champion: 'challengers-green',
    photos: [
      { src: '/images/2025-champions.jpg', label: 'Champions — Challengers', champion: true },
      { src: '/images/2025-finalists.jpg', label: 'The Two Finalists' },
    ],
  },
}

// Newest first — drives the dropdown order.
export const SEASON_YEARS = [2026, 2025]
export const CURRENT_SEASON = 2026

// The home page showcases the last COMPLETED season. This rolls over on its own:
// the 2026 carnival is played Aug 1 2026, so from Aug 2 2026 the site treats 2026
// as complete and the home page's standings/results switch from 2025 to 2026 with
// no redeploy. Add future rollovers here as new seasons are added.
const SEASON_ROLLOVERS = [
  { from: '2026-08-02T00:00:00', season: 2026 },
]
function computeLastCompletedSeason() {
  const now = new Date()
  let latest = 2025 // the most recent season already completed today
  for (const r of SEASON_ROLLOVERS) {
    if (now >= new Date(r.from)) latest = r.season
  }
  return latest
}
export const LAST_COMPLETED_SEASON = computeLastCompletedSeason()

// Annual carnival edition. The 2026 (CURRENT_SEASON) carnival is the 15th; the
// number advances automatically with the season, so nothing is hardcoded in the UI.
export const CURRENT_EDITION = 15
export const editionForSeason = (year) => CURRENT_EDITION + (year - CURRENT_SEASON)

// "15th", "21st", "22nd", "23rd" …
export const ordinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`
}

export const getSeason = (year) => SEASONS[year] || SEASONS[CURRENT_SEASON]
export const hasResults = (year) => getSeason(year).fixtures.length > 0

export const fixturesForSeason = (year) => getSeason(year).fixtures
export const completedFixtures = (year) => fixturesForSeason(year).filter((f) => f.status === 'completed')
export const upcomingFixtures = (year) => fixturesForSeason(year).filter((f) => f.status === 'upcoming')
export const fixturesByGroup = (year, g) => fixturesForSeason(year).filter((f) => f.group === g)
