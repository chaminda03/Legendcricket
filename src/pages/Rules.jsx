import { PREAMBLE, RULES_SECTIONS, DISCLAIMER } from '../data/rules'
import { FORMAT_SIZES, FORMATS, matchesPerTeamCount, super8Rule } from '../data/formats'

// Recursively render a (possibly nested) rules list. `list.style` sets the
// marker (lower-alpha / lower-roman / decimal).
function RuleList({ list }) {
  return (
    <ol className="rule-list" style={{ listStyleType: list.style }}>
      {list.items.map((it, i) => {
        if (typeof it === 'string') return <li key={i}>{it}</li>
        return (
          <li key={i}>
            {it.text}
            {it.link && (
              <> <a href={it.link.href} target="_blank" rel="noreferrer">{it.link.label}</a></>
            )}
            {it.note && <p className="rule-note">{it.note}</p>}
            {it.list && <RuleList list={it.list} />}
          </li>
        )
      })}
    </ol>
  )
}

export default function Rules() {
  return (
    <section className="section">
      <div className="container rules-doc">
        <div className="section-head">
          <span className="eyebrow">Virginia Legends Cricket Club</span>
          <h2>Tournament Rules &amp; Regulations</h2>
        </div>

        <p className="rules-preamble">{PREAMBLE}</p>

        {/* Super 8 selection — generated from the format config so it always
            matches how the site actually seeds the bracket. */}
        <div className="rules-section">
          <h3>Super 8 Selection by Format</h3>
          <p className="muted">
            The tournament may be run in one of the following formats. In every format, eight teams
            reach the Super 8 knockouts — how those eight are chosen depends on the format. (This
            year&apos;s tournament uses the 16-team format described in the rules above.)
          </p>
          <div className="super8-cards">
            {FORMAT_SIZES.map((s) => {
              const f = FORMATS[s]
              return (
                <div key={s} className="card super8-card">
                  <h4>{f.label}</h4>
                  <div className="s8-sub">{f.sub}</div>
                  <ul>
                    <li><strong>Group stage:</strong> each team plays {matchesPerTeamCount(f)} matches.</li>
                    <li><strong>Qualification:</strong> {super8Rule(f)}</li>
                    <li><strong>Bracket:</strong> the eight qualifiers are re-seeded 1–8 by points, then Net Run-Rate. Quarter-Finals are 1 v 8, 2 v 7, 3 v 6, 4 v 5.</li>
                  </ul>
                </div>
              )
            })}
          </div>
        </div>

        {RULES_SECTIONS.map((sec) => (
          <div key={sec.title} className="rules-section">
            <h3>{sec.title}</h3>
            {sec.blocks.map((b, i) => <RuleList key={i} list={b.list} />)}
          </div>
        ))}

        <p className="rules-disclaimer"><strong>Disclaimer.</strong> {DISCLAIMER}</p>
      </div>
    </section>
  )
}
