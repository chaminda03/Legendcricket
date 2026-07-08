import { Link } from 'react-router-dom'
import StandingsTable from '../components/StandingsTable'
import Carousel from '../components/Carousel'
import { completedFixtures, LAST_COMPLETED_SEASON } from '../data/seasons'
import { getTeam } from '../data/teams'
import { SLIDES, VALUES, GALLERY, ABOUT_IMAGE } from '../data/home'

const features = [
  { ic: '🏆', title: 'Live Points Table', text: 'Four groups, real-time standings with Net Run Rate, form guide and qualification tracking.', to: '/points-table' },
  { ic: '📋', title: 'Team Registration', text: 'Enter your 8-player squad in minutes and lock your spot in the championship.', to: '/register' },
  { ic: '🥊', title: 'Knockout Bracket', text: 'Top two per group advance — follow the road through quarters, semis and the grand final.', to: '/knockouts' },
  { ic: '🛡️', title: '16 Legendary Teams', text: 'Sixteen clubs battle it out 6-a-side over five thrilling overs for the Legends trophy.', to: '/teams' },
]

export default function Home() {
  const recent = completedFixtures(LAST_COMPLETED_SEASON).slice(-3).reverse()

  return (
    <>
      {/* CAROUSEL */}
      <Carousel slides={SLIDES} />

      {/* STATS BAND */}
      <section className="stats-band">
        <div className="container hero-stats" style={{ justifyContent: 'space-around', marginTop: 0 }}>
          <div className="stat"><div className="n">16</div><div className="l">Teams</div></div>
          <div className="stat"><div className="n">4</div><div className="l">Groups</div></div>
          <div className="stat"><div className="n">6</div><div className="l">A Side</div></div>
          <div className="stat"><div className="n">5</div><div className="l">Overs</div></div>
          <div className="stat"><div className="n">1</div><div className="l">Trophy</div></div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="section">
        <div className="container">
          <div className="about-grid">
            <div>
              <span className="eyebrow" style={{ color: 'var(--primary)', fontFamily: 'var(--head)', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', fontSize: '0.9rem' }}>Our Story · Since 2008</span>
              <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', margin: '10px 0 16px' }}>About Virginia Legends</h2>
              <div className="fact-chips">
                <span className="fact-chip">🗓️ Founded 2008</span>
                <span className="fact-chip">🎪 15th Annual Cricket Carnival</span>
                <span className="fact-chip">📍 Open to VA · MD · DC</span>
              </div>
              <p>Founded in 2008, Virginia Legends Cricket Club was born from a simple love of the game and a group of friends who wanted to bring the community together on the pitch. What started as weekend games has grown into the region's most anticipated cricket weekend — and this year we celebrate our <strong>15th Annual Cricket Carnival</strong>.</p>
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
          <StandingsTable year={LAST_COMPLETED_SEASON} group="A" />
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
              const h = getTeam(m.home), a = getTeam(m.away)
              const homeWon = m.result.home.runs > m.result.away.runs
              return (
                <div key={m.id} className="card" style={{ padding: 16 }}>
                  <div className="match-meta">
                    <span className="tag grp">Group {m.group}</span>
                    <span className="tag done">Result</span>
                  </div>
                  <div className="match" style={{ border: 0, padding: 0, background: 'transparent' }}>
                    <div className="side">
                      <span className="tb-sm" style={{ background: h.color }}>{h.short}</span>
                      <div>
                        <div className={`name ${homeWon ? 'won' : ''}`}>{h.name}</div>
                        <div className="score">{m.result.home.runs}/{m.result.home.wickets} ({m.result.home.overs})</div>
                      </div>
                    </div>
                    <div className="mid"><span className="vs">—</span></div>
                    <div className="side away">
                      <span className="tb-sm" style={{ background: a.color }}>{a.short}</span>
                      <div>
                        <div className={`name ${!homeWon ? 'won' : ''}`}>{a.name}</div>
                        <div className="score">{m.result.away.runs}/{m.result.away.wickets} ({m.result.away.overs})</div>
                      </div>
                    </div>
                  </div>
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

      {/* CTA */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-band">
            <h2>Your team belongs on this stage</h2>
            <p>Registration for Season 2026 is officially open. Secure your place before the brackets fill up.</p>
            <Link to="/register" className="btn btn-primary btn-lg">Register Your Team</Link>
          </div>
        </div>
      </section>
    </>
  )
}
