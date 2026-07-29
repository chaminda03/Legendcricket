import { matchOutcome } from '../data/compute'

// The "who won" line under a completed match card. Renders nothing while the
// match is still unplayed, so callers can drop it in unconditionally.
export default function MatchResultLine({ m, teamsById }) {
  const outcome = matchOutcome(m)
  if (!outcome) return null

  if (outcome.tied) return <div className="result-line tied">🤝 Match tied</div>

  const w = teamsById[outcome.winnerId] || {}
  return (
    <div className="result-line">
      <span className="tb-xs" style={{ background: w.color || '#334155' }}>{w.short || '—'}</span>
      <span><strong>{w.name || 'Winner'}</strong> won</span>
    </div>
  )
}
