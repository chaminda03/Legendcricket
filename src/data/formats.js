// ============================================================================
//  Tournament formats. The committee picks one in the admin dashboard; it drives
//  how many groups the draw offers, how fixtures are generated, and which Super 8
//  qualification rule applies.
//
//  The PUBLIC standings/fixtures pages are data-driven — they render whatever
//  groups teams are actually assigned to — so the format mainly configures the
//  admin authoring surface and the fixture generator. Every format feeds the
//  same 8-team knockout.
//
//  Per-format rules:
//    perGroup       teams in a full group
//    matchesPerTeam 'all' = full round-robin; a number = each team plays exactly
//                   that many (balanced schedule, no repeated opponents)
//    qualify        'winners-runnersup' = every group winner + best runners-up
//                   'pure-pool'         = top 8 overall by Points -> NRR -> Wins
// ============================================================================

export const FORMATS = {
  16: {
    size: 16, groups: ['A', 'B', 'C', 'D'], perGroup: 4,
    matchesPerTeam: 'all', qualify: 'winners-runnersup',
    label: '16 Teams', sub: '4 groups of 4',
  },
  18: {
    size: 18, groups: ['A', 'B', 'C'], perGroup: 6,
    matchesPerTeam: 3, qualify: 'pure-pool',
    label: '18 Teams', sub: '3 groups of 6',
  },
  20: {
    size: 20, groups: ['A', 'B', 'C', 'D', 'E'], perGroup: 4,
    matchesPerTeam: 'all', qualify: 'winners-runnersup',
    label: '20 Teams', sub: '5 groups of 4',
  },
}

export const FORMAT_SIZES = [16, 18, 20]
export const DEFAULT_FORMAT = 16

export const getFormat = (size) => FORMATS[size] || FORMATS[DEFAULT_FORMAT]

// Human-readable summaries used in the admin dashboard.
export const matchesLabel = (f) =>
  f.matchesPerTeam === 'all' ? 'full round-robin' : `${f.matchesPerTeam} matches each`

export const qualifyLabel = (f) =>
  f.qualify === 'pure-pool'
    ? 'Super 8: top 8 overall (pure pool)'
    : 'Super 8: group winners + best runners-up'

// Full sentence for public captions.
export const qualifyDescription = (f) =>
  f.qualify === 'pure-pool'
    ? 'The top eight teams overall — across every group — advance to the Super 8 knockouts.'
    : 'Every group winner plus the best runners-up advance to the Super 8 knockouts.'
