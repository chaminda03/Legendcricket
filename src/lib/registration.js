// Registration storage via a Google Apps Script Web App that writes to a Google
// Sheet. See google-apps-script.gs (project root) for the script + setup steps.

const ENDPOINT = import.meta.env.VITE_SHEETS_ENDPOINT

export const isRegistrationConfigured = Boolean(ENDPOINT && ENDPOINT.startsWith('https://'))

// Submit a registration. We send a plain-text JSON body (not application/json)
// so the browser treats it as a "simple" request and skips the CORS preflight,
// which Google Apps Script does not answer.
export async function submitRegistration(payload) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.ok === false) {
    throw new Error(data.error || 'Submission failed. Please try again.')
  }
  return data
}

// Read all registrations back (for the /admin view).
export async function fetchRegistrations() {
  const res = await fetch(ENDPOINT)
  const data = await res.json()
  if (!data.ok) throw new Error(data.error || 'Could not load registrations.')
  return data.rows || []
}
