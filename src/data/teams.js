// The 16 tournament teams, split into four groups of four.
// These mirror the real Virginia Legends 6-a-side tournament line-up.
// `color` drives each team's accent throughout the UI.
export const TEAMS = [
  // Group A
  { id: 'jolly-boys-yellow', name: 'Jolly Boys Yellow', short: 'JBY', group: 'A', color: '#EAB308' },
  { id: 'kurumba-b',         name: 'Kurumba B',         short: 'KUB', group: 'A', color: '#0D9488' },
  { id: 'matrix',            name: 'Matrix',            short: 'MTX', group: 'A', color: '#22C55E' },
  { id: 'lanka-lions-blue',  name: 'Lanka Lions Blue',  short: 'LLB', group: 'A', color: '#2563EB' },

  // Group B
  { id: 'lanka-lions-gold',  name: 'Lanka Lions Gold',  short: 'LLG', group: 'B', color: '#CA8A04' },
  { id: 'challengers-green', name: 'Challengers Green', short: 'CHG', group: 'B', color: '#16A34A' },
  { id: 'jolly-boys-red',    name: 'Jolly Boys Red',    short: 'JBR', group: 'B', color: '#DC2626' },
  { id: 'strikers',          name: 'Strikers',          short: 'STR', group: 'B', color: '#F97316' },

  // Group C
  { id: 'ceylon-smashers',   name: 'Ceylon Smashers',   short: 'CSM', group: 'C', color: '#7C3AED' },
  { id: 'gladiators',        name: 'Gladiators',        short: 'GLD', group: 'C', color: '#991B1B' },
  { id: 'titans-blue',       name: 'Titans Blue',       short: 'TTB', group: 'C', color: '#1D4ED8' },
  { id: 'va-legends-red',    name: 'VA Legends Red',    short: 'VLR', group: 'C', color: '#E11D48' },

  // Group D
  { id: 'va-legends-blue',   name: 'VA Legends Blue',   short: 'VLB', group: 'D', color: '#1E40AF' },
  { id: 'titans-gray',       name: 'Titans Gray',       short: 'TTG', group: 'D', color: '#64748B' },
  { id: 'challengers-maroon',name: 'Challengers Maroon',short: 'CHM', group: 'D', color: '#9F1239' },
  { id: 'kurumba-a',         name: 'Kurumba A',         short: 'KUA', group: 'D', color: '#0891B2' },
]

export const GROUPS = ['A', 'B', 'C', 'D']

export const teamsByGroup = (group) => TEAMS.filter((t) => t.group === group)
export const getTeam = (id) => TEAMS.find((t) => t.id === id)
