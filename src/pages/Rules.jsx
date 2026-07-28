import { PREAMBLE, RULES_SECTIONS, DISCLAIMER } from '../data/rules'
import { FORMAT_SIZES, FORMATS, matchesPerTeamCount, super8Rule } from '../data/formats'
import { OVERS_PER_INNINGS } from '../data/fixtures'
import { WICKETS_ALL_OUT, formatNRR } from '../data/standings'

// Worked NRR example — the runs are illustrative, but the rates are computed
// with the real quota so the numbers can never drift from the calculator.
const EX_FOR = 62
const EX_AGAINST = 48
const exRateFor = EX_FOR / OVERS_PER_INNINGS
const exRateAgainst = EX_AGAINST / OVERS_PER_INNINGS

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

        {/* How NRR is worked out — mirrors the calculation in data/standings.js
            so the published method matches the numbers in the tables. */}
        <div className="rules-section">
          <h3>How Net Run-Rate Is Calculated</h3>
          <p className="muted">
            Net Run-Rate (NRR) is the first tie-breaker whenever teams finish level on points. It
            measures how much faster a team scores than it concedes, across the whole group stage.
          </p>

          <div className="nrr-formula">
            <span className="nrr-eq">NRR</span>
            <span className="nrr-op">=</span>
            <span className="nrr-frac">
              <em>Total runs scored</em>
              <em>Total overs faced</em>
            </span>
            <span className="nrr-op">&minus;</span>
            <span className="nrr-frac">
              <em>Total runs conceded</em>
              <em>Total overs bowled</em>
            </span>
          </div>

          <ol className="rule-list" style={{ listStyleType: 'lower-alpha' }}>
            <li>
              Runs and overs are <strong>totalled across all group matches first</strong>, then
              divided once. NRR is not the average of a team&apos;s per-match run-rates.
            </li>
            <li>
              Part-overs are read as balls, not decimals: an innings of <strong>4.3 overs</strong> is
              4 overs and 3 balls, which counts as 4<sup>3</sup>&frasl;<sub>6</sub> = 4.5 overs.
            </li>
            <li>
              <strong>All-out rule.</strong> If a side is bowled out (all {WICKETS_ALL_OUT} wickets
              down in a 6-a-side innings), it is credited with the full quota of{' '}
              {OVERS_PER_INNINGS} overs regardless of how few it actually faced. The same full quota
              is charged to the bowling side as overs bowled.
            </li>
            <li>
              Every match contributes to <strong>both</strong> teams: one side&apos;s runs and overs
              are the other side&apos;s runs conceded and overs bowled.
            </li>
            <li>
              <strong>Super Over runs and overs are excluded</strong> from NRR. A match decided by a
              Super Over counts, for NRR purposes, with the scores as they stood at the tie.
            </li>
            <li>
              NRR is published to <strong>four decimal places</strong> with a leading sign (for
              example {formatNRR(exRateFor - exRateAgainst)}), so near-identical rates stay
              separable.
            </li>
            <li>
              Standings are ordered by <strong>Points</strong>, then <strong>NRR</strong>, then{' '}
              <strong>Average Runs Scored Per Wicket</strong> (total runs scored &divide; total
              wickets lost, again aggregated across the group stage). A side that has not lost a
              wicket is ranked on its total runs.
            </li>
          </ol>

          <div className="nrr-example">
            <h4>Worked example</h4>
            <p>
              A team posts <strong>{EX_FOR}</strong> in its {OVERS_PER_INNINGS} overs, then bowls the
              opposition out for <strong>{EX_AGAINST}</strong> inside {OVERS_PER_INNINGS} overs.
            </p>
            <ul>
              <li>
                Run-rate for: {EX_FOR} &divide; {OVERS_PER_INNINGS} ={' '}
                <strong>{exRateFor.toFixed(4)}</strong>
              </li>
              <li>
                Run-rate against: the opposition was bowled out, so the full {OVERS_PER_INNINGS}{' '}
                overs are used &mdash; {EX_AGAINST} &divide; {OVERS_PER_INNINGS} ={' '}
                <strong>{exRateAgainst.toFixed(4)}</strong>
              </li>
              <li>
                NRR for the match: {exRateFor.toFixed(4)} &minus; {exRateAgainst.toFixed(4)} ={' '}
                <strong>{formatNRR(exRateFor - exRateAgainst)}</strong>
              </li>
            </ul>
            <p className="rule-note">
              Had the opposition survived all {OVERS_PER_INNINGS} overs for the same {EX_AGAINST},
              the result would be identical &mdash; the all-out rule only bites when a side is
              dismissed early, and it deliberately removes the reward for bowling a team out quickly
              in fewer overs.
            </p>
          </div>
        </div>

        <p className="rules-disclaimer"><strong>Disclaimer.</strong> {DISCLAIMER}</p>
      </div>
    </section>
  )
}
