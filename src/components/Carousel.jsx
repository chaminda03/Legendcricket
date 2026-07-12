import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'

// Auto-advancing image carousel. Slides can carry a real photo (`image`) or fall
// back to a branded gradient (`gradient`). Pauses on hover; arrows + dots + keys.
export default function Carousel({ slides, interval = 6000 }) {
  const [index, setIndex] = useState(0)
  const paused = useRef(false)
  const count = slides.length

  const go = useCallback((n) => setIndex((n + count) % count), [count])
  const next = useCallback(() => go(index + 1), [go, index])
  const prev = useCallback(() => go(index - 1), [go, index])

  useEffect(() => {
    const t = setInterval(() => { if (!paused.current) setIndex((i) => (i + 1) % count) }, interval)
    return () => clearInterval(t)
  }, [count, interval])

  return (
    <section
      className="carousel"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
      aria-roledescription="carousel"
    >
      {slides.map((s, i) => (
        <div key={s.id} className={`carousel-slide ${i === index ? 'active' : ''}`} aria-hidden={i !== index}>
          {s.image
            ? <img className="carousel-img" src={s.image} alt={s.title} style={s.focus ? { objectPosition: s.focus } : undefined} />
            : <div className={`carousel-ph ph-${s.gradient}`} />}
          <div className="carousel-overlay" />
          <div className="container carousel-content">
            <span className="carousel-eyebrow">{s.eyebrow}</span>
            <h1>{s.title}</h1>
            <p>{s.text}</p>
            {s.cta && <Link to={s.cta.to} className="btn btn-primary btn-lg">{s.cta.label} →</Link>}
          </div>
        </div>
      ))}

      <button className="carousel-arrow prev" onClick={prev} aria-label="Previous slide">‹</button>
      <button className="carousel-arrow next" onClick={next} aria-label="Next slide">›</button>

      <div className="carousel-dots">
        {slides.map((s, i) => (
          <button
            key={s.id}
            className={`carousel-dot ${i === index ? 'active' : ''}`}
            onClick={() => go(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
