// Home-page content. To use a real photo, drop it in `public/images/` and set
// `image` to its path, e.g. image: '/images/match-day.jpg'. Leave it null to
// show the branded gradient placeholder.

export const SLIDES = [
  {
    id: 'welcome',
    eyebrow: 'Virginia Legends Cricket Club · Est. 2008',
    title: 'Where the DMV Comes to Play',
    text: 'A community of cricketers bringing competitive, fast-paced cricket to Virginia, Maryland and DC — one big weekend a year.',
    cta: null,
    image: '/images/legends-winners-enhanced.jpg',
    focus: 'center 38%', // pull the crop up slightly so heads aren't cut off
    gradient: 'g1',
  },
  {
    id: 'format',
    eyebrow: '15th Annual Cricket Carnival',
    title: '16 Teams · 4 Groups · 6-a-Side',
    text: 'Five overs of pure chaos. Round-robin groups, knockout brackets, and one team lifting the Legends trophy.',
    cta: null,
    image: '/images/va-legends-team-enhanced.jpg',
    gradient: 'g2',
  },
  {
    id: 'season',
    eyebrow: 'Season 2026',
    title: 'Registration Is Now Open',
    text: 'Gather your squad of eight and claim your place at the biggest cricket carnival in the DMV.',
    cta: null,
    image: '/images/va-legends-squad.jpg',
    focus: 'center 68%', // players sit low in this frame — crop down onto them
    gradient: 'g3',
  },
]

// Photo used in the "About" section.
export const ABOUT_IMAGE = '/images/va-legends-team-enhanced.jpg'

export const VALUES = [
  { ic: '🤝', title: 'Community', text: 'Bringing players and families together around the game we love.' },
  { ic: '🔥', title: 'Competition', text: 'Fierce, fair and fast — cricket at its most electric.' },
  { ic: '🏅', title: 'Sportsmanship', text: 'Win or lose, we play the game the right way.' },
  { ic: '🌱', title: 'Growth', text: 'Growing cricket across Virginia, one season at a time.' },
]

export const GALLERY = [
  { label: 'Team VA Legends', image: '/images/va-legends-squad.jpg', gradient: 'g2' },
  { label: 'VA Legends Winners', image: '/images/va-legends-winners.jpg', gradient: 'g3' },
  { label: 'The Champions', image: '/images/legends-winners-enhanced.jpg', gradient: 'g3' },
  { label: 'On the Field', image: '/images/va-legends-team-enhanced.jpg', gradient: 'g2' },
]
