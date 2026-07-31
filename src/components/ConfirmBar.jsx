// An inline stand-in for window.confirm(). The native dialog blocks the main
// thread for as long as it sits open and Chrome bills that whole span to the
// click that opened it, which showed up as multi-second INP stalls across the
// admin panel. This renders in the page instead, so nothing blocks.
export default function ConfirmBar({ children, confirmLabel = 'Yes, do it', onConfirm, onCancel, busy, danger }) {
  return (
    <div className={`admin-toolbar confirm-bar ${danger ? 'danger' : ''}`}>
      <span>{children}</span>
      <button className="btn btn-primary btn-sm" disabled={busy} onClick={onConfirm}>{confirmLabel}</button>
      <button className="btn btn-ghost btn-sm" disabled={busy} onClick={onCancel}>Cancel</button>
    </div>
  )
}
