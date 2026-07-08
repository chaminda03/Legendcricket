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
export const LAST_COMPLETED_SEASON = 2025

export const getSeason = (year) => SEASONS[year] || SEASONS[CURRENT_SEASON]
export const hasResults = (year) => getSeason(year).fixtures.length > 0

export const fixturesForSeason = (year) => getSeason(year).fixtures
export const completedFixtures = (year) => fixturesForSeason(year).filter((f) => f.status === 'completed')
export const upcomingFixtures = (year) => fixturesForSeason(year).filter((f) => f.status === 'upcoming')
export const fixturesByGroup = (year, g) => fixturesForSeason(year).filter((f) => f.group === g)
