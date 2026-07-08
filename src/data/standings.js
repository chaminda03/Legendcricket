import { TEAMS, teamsByGroup } from './teams'
import { OVERS_PER_INNINGS } from './fixtures'
import { completedFixtures, LAST_COMPLETED_SEASON } from './seasons'

// Points: Win = 2, Tie / No Result = 1, Loss = 0 (standard T20/6-a-side group stage).
const WIN_POINTS = 2
const TIE_POINTS = 1

// 6-a-side: a side is "all out" at 5 wickets down (6 players -> 5 dismissals).
const WICKETS_ALL_OUT = 5

function blankRow(team) {
  return {
    teamId: team.id,
    played: 0,
    won: 0,
    lost: 0,
    tied: 0,
    points: 0,
    // NRR components
    runsFor: 0,
    oversFor: 0,
    runsAgainst: 0,
    oversAgainst: 0,
    nrr: 0,
    form: [], // recent results, newest last: 'W' | 'L' | 'T'
  }
}

// Overs like "2.1" mean 2 overs + 1 ball -> convert to true decimal overs (balls / 6).
function oversToDecimal(overs) {
  const whole = Math.floor(overs)
  const balls = Math.round((overs - whole) * 10)
  return whole + balls / 6
}

// Overs a batting side is CREDITED for NRR: actual overs faced, unless the side
// was bowled out, in which case the full quota of overs is used (ICC rule).
function creditedOvers(side) {
  if (side.wickets >= WICKETS_ALL_OUT) return OVERS_PER_INNINGS
  return oversToDecimal(side.overs)
}

export function computeStandings(year = LAST_COMPLETED_SEASON) {
  const rows = {}
  TEAMS.forEach((t) => (rows[t.id] = blankRow(t)))

  completedFixtures(year).forEach((f) => {
    const h = rows[f.home]
    const a = rows[f.away]
    const hs = f.result.home
    const as = f.result.away
    const hOvers = creditedOvers(hs)
    const aOvers = creditedOvers(as)

    h.played++
    a.played++

    // Home batting is credited against away's bowling, and vice-versa.
    h.runsFor += hs.runs;  h.oversFor += hOvers
    h.runsAgainst += as.runs;  h.oversAgainst += aOvers
    a.runsFor += as.runs;  a.oversFor += aOvers
    a.runsAgainst += hs.runs;  a.oversAgainst += hOvers

    if (hs.runs > as.runs) {
      h.won++; h.points += WIN_POINTS; h.form.push('W')
      a.lost++; a.form.push('L')
    } else if (as.runs > hs.runs) {
      a.won++; a.points += WIN_POINTS; a.form.push('W')
      h.lost++; h.form.push('L')
    } else {
      h.tied++; h.points += TIE_POINTS; h.form.push('T')
      a.tied++; a.points += TIE_POINTS; a.form.push('T')
    }
  })

  Object.values(rows).forEach((r) => {
    const rrFor = r.oversFor > 0 ? r.runsFor / r.oversFor : 0
    const rrAgainst = r.oversAgainst > 0 ? r.runsAgainst / r.oversAgainst : 0
    r.nrr = rrFor - rrAgainst
  })

  return rows
}

// Sorted standings for a group: Points, then NRR, then Wins.
export function groupStandings(year, group) {
  const rows = computeStandings(year)
  return teamsByGroup(group)
    .map((t) => rows[t.id])
    .sort((a, b) => b.points - a.points || b.nrr - a.nrr || b.won - a.won)
}

// NRR shown to 4 decimals so near-identical rates stay distinguishable.
// Sorting always uses the full-precision value (below), so ties are avoided.
export const formatNRR = (nrr) => (nrr >= 0 ? `+${nrr.toFixed(4)}` : nrr.toFixed(4))
