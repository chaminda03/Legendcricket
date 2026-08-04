import { Link } from 'react-router-dom'
import StandingsTable from '../components/StandingsTable'
import Carousel from '../components/Carousel'
import MatchResultLine from '../components/MatchResultLine'
import { CURRENT_SEASON, LAST_COMPLETED_SEASON, editionForSeason, ordinal } from '../data/seasons'
import { useFormat } from '../context/FormatContext'
import { useSeasonData } from '../hooks/useSeasonData'
import { standingsByGroup, indexById } from '../data/compute'
import { SLIDES, VALUES, GALLERY, ABOUT_IMAGE, SPONSORS } from '../data/home'

const features = [
  { ic: '🏆', title: 'Live Points Table', text: 'Four groups, real-time standings with Net Run Rate, form guide and qualification tracking.', to: '/points-table' },
  { ic: '📅', title: 'Match-Day Schedule', text: 'Every kick-off time by field — four games running at once, all day long.', to: '/schedule' },
  { ic: '🥊', title: 'Knockout Bracket', text: 'Top two per group advance — follow the road through quarters, semis and the grand final.', to: '/knockouts' },
  { ic: '🛡️', title: '16 Legendary Teams', text: 'Sixteen clubs battle it out 6-a-side over five thrilling overs for the Legends trophy.', to: '/teams' },
]

export default function Home() {
  const { format } = useFormat()
  const { teams, matches } = useSeasonData(LAST_COMPLETED_SEASON)
  const teamsById = indexById(teams)
  const groupA = standingsByGroup(teams, matches)['A'] || []
  const recent = matches.filter((m) => m.status === 'completed').slice(-3).reverse()

  // Carnival edition + format line advance with the season / active format —
  // never hardcoded. Injected into the 'format' carousel slide.
  const edition = editionForSeason(CURRENT_SEASON)
  const carnivalName = `${ordinal(edition)} Annual Cricket Carnival`
  const formatLine = `${format.size} Teams · ${format.groups.length} Groups · 6-a-Side`
  const slides = SLIDES.map((s) =>
    s.id === 'format' ? { ...s, eyebrow: carnivalName, title: formatLine } : s,
  )

  return (
    <>
      {/* CAROUSEL */}
      <Carousel slides={slides} />

      {/* ABOUT */}
      <section className="section">
        <div className="container">
          <div className="about-grid">
            <div>
              <span className="eyebrow" style={{ color: 'var(--primary)', fontFamily: 'var(--head)', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', fontSize: '0.9rem' }}>Our Story · Since 2008</span>
              <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', margin: '10px 0 16px' }}>About Virginia Legends</h2>
              <div className="fact-chips">
                <span className="fact-chip">🗓️ Founded 2008</span>
                <span className="fact-chip">🎪 {carnivalName}</span>
                <span className="fact-chip">📍 Open to VA · MD · DC</span>
              </div>
              <p>Founded in 2008, Virginia Legends Cricket Club was born from a simple love of the game and a group of friends who wanted to bring the community together on the pitch. What started as weekend games has grown into the region's most anticipated cricket weekend — and this year we celebrate our <strong>{carnivalName}</strong>.</p>
              <p>Every year, sixteen teams from across <strong>Virginia, Maryland and DC</strong> go head-to-head in our fast-paced 6-a-side championship — five overs a side, big hitting, and plenty of heart. It's competitive, it's welcoming, and above all, it's a celebration of cricket and the people who play it.</p>
              <p>Whether you're a seasoned all-rounder or picking up a bat for the first time, there's a place for you in the Legends family.</p>
              <Link to="/register" className="btn btn-primary" style={{ marginTop: 8 }}>Join the Legends →</Link>
            </div>
            <div className="about-visual">
              <img src={ABOUT_IMAGE} alt="Virginia Legends Cricket Club" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>

          <div className="values-grid">
            {VALUES.map((v) => (
              <div key={v.title} className="value-card">
                <div className="ic">{v.ic}</div>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Everything you need</span>
            <h2>Follow every ball of the action</h2>
          </div>
          <div className="grid grid-4">
            {features.map((f) => (
              <Link to={f.to} key={f.title} className="card feature-card">
                <div className="ic">{f.ic}</div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* GROUP A PREVIEW */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span className="eyebrow">{LAST_COMPLETED_SEASON} Season</span>
              <h2>Group A — final table</h2>
            </div>
            <Link to="/points-table" className="btn btn-ghost">All Groups →</Link>
          </div>
          <StandingsTable rows={groupA} teamsById={teamsById} />
          <div className="legend">
            <span className="k"><span className="swatch" style={{ background: 'var(--primary)' }} /> Top 2 qualify for Quarterfinals</span>
            <span className="k">P Played · W Won · L Lost · T Tied · NRR Net Run Rate</span>
          </div>
        </div>
      </section>

      {/* RECENT RESULTS */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span className="eyebrow">{LAST_COMPLETED_SEASON} Season</span>
              <h2>Recent results</h2>
            </div>
            <Link to="/fixtures" className="btn btn-ghost">All Fixtures →</Link>
          </div>
          <div className="grid" style={{ gap: 14 }}>
            {recent.map((m) => {
              const h = teamsById[m.home_team] || {}, a = teamsById[m.away_team] || {}
              const homeWon = m.home_runs > m.away_runs
              return (
                <div key={m.id} className="card" style={{ padding: 16 }}>
                  <div className="match-meta">
                    <span className="tag grp">Group {m.grp}</span>
                    <span className="tag done">Result</span>
                  </div>
                  <div className="match" style={{ border: 0, padding: 0, background: 'transparent' }}>
                    <div className="side">
                      <span className="tb-sm" style={{ background: h.color }}>{h.short}</span>
                      <div>
                        <div className={`name ${homeWon ? 'won' : ''}`}>{h.name}</div>
                        <div className="score">{m.home_runs}/{m.home_wkts} ({m.home_overs})</div>
                      </div>
                    </div>
                    <div className="mid"><span className="vs">—</span></div>
                    <div className="side away">
                      <span className="tb-sm" style={{ background: a.color }}>{a.short}</span>
                      <div>
                        <div className={`name ${!homeWon ? 'won' : ''}`}>{a.name}</div>
                        <div className="score">{m.away_runs}/{m.away_wkts} ({m.away_overs})</div>
                      </div>
                    </div>
                  </div>
                  <MatchResultLine m={m} teamsById={teamsById} />
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Moments</span>
            <h2>From the grounds</h2>
          </div>
          <div className="gallery-grid">
            {GALLERY.map((g) => (
              <div key={g.label} className="gallery-tile">
                {g.image
                  ? <img src={g.image} alt={g.label} />
                  : <div className={`gallery-ph ph-${g.gradient}`} />}
                <span className="cap">{g.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SPONSORS */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Thank you</span>
            <h2>Our {CURRENT_SEASON} sponsors</h2>
            <p>The carnival runs on the generosity of the people below. If you're buying or selling in the DMV, give them a call.</p>
          </div>
          <div className="sponsor-grid">
            {SPONSORS.map((s) => (
              <div key={s.name} className="sponsor-card">
                <img src={s.image} alt={`Thank you to ${s.name}`} loading="lazy" />
                <div className="sponsor-body">
                  <h3>{s.name}</h3>
                  {s.org && <div className="org">{s.org}</div>}
                  <ul className="sponsor-contact">
                    {s.address && <li><span aria-hidden="true">📍</span>{s.address}</li>}
                    {s.phone && <li><span aria-hidden="true">📞</span><a href={`tel:${s.phone.replace(/\D/g, '')}`}>{s.phone}</a></li>}
                    {s.email && <li><span aria-hidden="true">✉️</span><a href={`mailto:${s.email}`}>{s.email}</a></li>}
                    {s.link && <li><span aria-hidden="true">🔗</span><a href={s.link} target="_blank" rel="noopener noreferrer">{s.linkLabel || s.link}</a></li>}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-band">
            <h2>Your team belongs on this stage</h2>
            <p>Season {CURRENT_SEASON} is in the books — Kurumba Cricket Club are your champions. Walk back through every group game and the road to the final.</p>
            <Link to="/knockouts" className="btn btn-primary btn-lg">See the Bracket</Link>
          </div>
        </div>
      </section>
    </>
  )
}
