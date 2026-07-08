import { GROUPS } from './teams'
import { groupStandings } from './standings'
import { getSeason, LAST_COMPLETED_SEASON } from './seasons'

// ============================================================================
//  Knockout progression — mirrors the original tournament's bracket logic.
//
//  1. Top 2 of every group qualify (already sorted by Points, then NRR).
//  2. All 8 qualifiers are re-seeded 1..8 by Points, then NRR.
//  3. Quarterfinals:  QF1 1v8 · QF2 2v7 · QF3 3v6 · QF4 4v5
//  4. Semifinals:     SF1 = QF1 winner v QF4 winner
//                     SF2 = QF2 winner v QF3 winner
//  5. Final:          SF1 winner v SF2 winner
// ============================================================================

const QUALIFY_PER_GROUP = 2

// Returns the 8 qualified teams for a season, seeded 1..8.
export function getSeededQualifiers(year = LAST_COMPLETED_SEASON) {
  const qualifiers = []
  GROUPS.forEach((g) => {
    const table = groupStandings(year, g)
    table.slice(0, QUALIFY_PER_GROUP).forEach((row, i) => {
      qualifiers.push({ ...row, group: g, groupPos: i + 1 })
    })
  })
  // Re-seed across all groups: Points, then NRR, then Wins.
  qualifiers.sort((a, b) => b.points - a.points || b.nrr - a.nrr || b.won - a.won)
  return qualifiers.map((q, i) => ({ ...q, seed: i + 1 }))
}

// Builds the full bracket for a season. Each match: { code, a, b, winner } where
// a/b are team ids (or null if not yet decided). Winners cascade to later rounds.
// Recorded winners live in seasons.js (knockoutResults); blank them for a live bracket.
export function buildBracket(year = LAST_COMPLETED_SEASON) {
  const results = getSeason(year).knockoutResults || {}
  const s = getSeededQualifiers(year)
  const id = (seedIndex) => (s[seedIndex] ? s[seedIndex].teamId : null)
  const win = (code) => results[code] || null

  const quarterfinals = [
    { code: 'QF1', a: id(0), b: id(7), winner: win('QF1') },
    { code: 'QF2', a: id(1), b: id(6), winner: win('QF2') },
    { code: 'QF3', a: id(2), b: id(5), winner: win('QF3') },
    { code: 'QF4', a: id(3), b: id(4), winner: win('QF4') },
  ]

  const semifinals = [
    { code: 'SF1', a: quarterfinals[0].winner, b: quarterfinals[3].winner, winner: win('SF1') },
    { code: 'SF2', a: quarterfinals[1].winner, b: quarterfinals[2].winner, winner: win('SF2') },
  ]

  const final = {
    code: 'FINAL',
    a: semifinals[0].winner,
    b: semifinals[1].winner,
    winner: win('FINAL'),
  }

  return { seeds: s, quarterfinals, semifinals, final, champion: final.winner }
}
