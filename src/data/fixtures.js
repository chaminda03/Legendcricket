// Real group-stage results from the Virginia Legends 6-a-side tournament.
// 6 players a side, 5 overs an innings. Overs are cricket notation:
// "2.1" = 2 overs + 1 ball. Every group plays a single round-robin (6 matches).
//
// Each match: home/away team id + { runs, wickets, overs } for each innings.
// The points table and Net Run Rate are computed from these in standings.js.

const M = (id, group, home, hs, away, as, meta = {}) => ({
  id,
  group,
  home,
  away,
  date: meta.date || 'Group Stage',
  venue: meta.venue || 'Lake Fairfax Park, Reston, VA',
  status: 'completed',
  result: { home: hs, away: as },
})

const s = (runs, wickets, overs) => ({ runs, wickets, overs })

export const FIXTURES = [
  // ---- Group A ----
  M('A1', 'A', 'jolly-boys-yellow', s(71, 1, 5.0), 'kurumba-b',         s(52, 4, 5.0)),
  M('A2', 'A', 'matrix',            s(13, 1, 1.1), 'kurumba-b',         s(9, 3, 5.0)),
  M('A3', 'A', 'lanka-lions-blue',  s(58, 4, 5.0), 'matrix',            s(39, 4, 5.0)),
  M('A4', 'A', 'lanka-lions-blue',  s(42, 1, 2.1), 'jolly-boys-yellow', s(41, 1, 5.0)),
  M('A5', 'A', 'lanka-lions-blue',  s(47, 1, 3.2), 'kurumba-b',         s(46, 3, 5.0)),
  M('A6', 'A', 'matrix',            s(91, 1, 5.0), 'jolly-boys-yellow', s(47, 5, 5.0)),

  // ---- Group B ----
  M('B1', 'B', 'lanka-lions-gold',  s(41, 2, 5.0), 'challengers-green', s(45, 1, 4.0)),
  M('B2', 'B', 'lanka-lions-gold',  s(56, 2, 5.0), 'jolly-boys-red',    s(57, 1, 3.3)),
  M('B3', 'B', 'strikers',          s(65, 4, 5.0), 'jolly-boys-red',    s(90, 2, 5.0)),
  M('B4', 'B', 'strikers',          s(32, 5, 5.0), 'challengers-green', s(72, 2, 5.0)),
  M('B5', 'B', 'jolly-boys-red',    s(56, 2, 5.0), 'challengers-green', s(80, 2, 5.0)),
  M('B6', 'B', 'strikers',          s(64, 2, 5.0), 'lanka-lions-gold',  s(66, 1, 4.1)),

  // ---- Group C ----
  M('C1', 'C', 'ceylon-smashers',   s(71, 0, 3.2), 'gladiators',        s(70, 3, 5.0)),
  M('C2', 'C', 'titans-blue',       s(39, 2, 3.2), 'gladiators',        s(33, 3, 5.0)),
  M('C3', 'C', 'titans-blue',       s(29, 5, 5.0), 'va-legends-red',    s(57, 4, 5.0)),
  M('C4', 'C', 'ceylon-smashers',   s(36, 5, 5.0), 'va-legends-red',    s(74, 3, 5.0)),
  M('C5', 'C', 'va-legends-red',    s(92, 1, 5.0), 'gladiators',        s(47, 1, 5.0)),
  M('C6', 'C', 'titans-blue',       s(72, 3, 5.0), 'ceylon-smashers',   s(73, 0, 4.1)),

  // ---- Group D ----
  M('D1', 'D', 'va-legends-blue',   s(34, 5, 5.0), 'titans-gray',       s(45, 4, 5.0)),
  M('D2', 'D', 'va-legends-blue',   s(62, 3, 5.0), 'challengers-maroon',s(53, 4, 5.0)),
  M('D3', 'D', 'challengers-maroon',s(38, 1, 5.0), 'kurumba-a',         s(40, 0, 2.2)),
  M('D4', 'D', 'kurumba-a',         s(28, 5, 5.0), 'titans-gray',       s(57, 4, 5.0)),
  M('D5', 'D', 'va-legends-blue',   s(21, 5, 5.0), 'kurumba-a',         s(23, 0, 1.0)),
  M('D6', 'D', 'challengers-maroon',s(56, 3, 5.0), 'titans-gray',       s(72, 4, 5.0)),
]

// Tournament format constants (6-a-side, 5 overs).
export const OVERS_PER_INNINGS = 5
export const PLAYERS_ON_FIELD = 6
export const SQUAD_SIZE = 8
