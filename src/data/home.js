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
    // eyebrow (carnival edition) + title (team/group counts) are injected in
    // Home.jsx from the season + active format, so they advance automatically.
    eyebrow: 'Annual Cricket Carnival',
    title: 'Six-a-Side Championship',
    text: 'Five overs of pure chaos. Round-robin groups, knockout brackets, and one team lifting the Legends trophy.',
    cta: null,
    image: '/images/va-legends-team-enhanced.jpg',
    gradient: 'g2',
  },
  {
    id: 'season',
    eyebrow: 'Season 2026 · Champions',
    title: 'Kurumba Cricket Club',
    text: 'Kurumba lift the Legends trophy at the 2026 carnival. Relive the road to the final in the points table and knockout bracket.',
    cta: null,
    image: '/images/2026-champions-kurumba.jpg',
    focus: 'center 40%', // team + trophy sit mid-frame in this wide shot
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
  { label: '2026 Champions — Kurumba', image: '/images/2026-champions-kurumba.jpg', gradient: 'g3' },
  { label: 'Team VA Legends', image: '/images/va-legends-squad.jpg', gradient: 'g2' },
  { label: 'VA Legends Winners', image: '/images/va-legends-winners.jpg', gradient: 'g3' },
  { label: 'On the Field', image: '/images/va-legends-team-enhanced.jpg', gradient: 'g2' },
]

// Tournament sponsors, newest season first. `image` is the thank-you card; the
// contact block below it is rendered from these fields, so anything left out
// (e.g. `org`) is simply skipped rather than showing an empty line.
export const SPONSORS = [
  {
    name: 'Marshall Wickramaratne',
    org: 'Samson Properties',
    image: '/images/2026-sponsor-marshall.jpg',
    address: '14291 Park Meadow Dr, Chantilly, VA 20151',
    phone: '(703) 727-8649',
    email: 'marshallw@dilhome.com',
    link: 'https://www.dilhome.com/',
    linkLabel: 'dilhome.com',
  },
  {
    name: 'Madusha Peiris',
    org: null,
    image: '/images/2026-sponsor-madusha.jpg',
    address: '10411 Motor City Dr, Ste 402, Bethesda, MD 20817',
    phone: '(240) 893-6910',
    email: 'tjmadusha@gmail.com',
    link: 'https://www.facebook.com/MPeirisRealtor/',
    linkLabel: 'Facebook',
  },
]
