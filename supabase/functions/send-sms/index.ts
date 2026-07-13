// ============================================================================
//  send-sms — Supabase Edge Function
//
//  Sends SMS via Twilio to team captains. The Twilio credentials live only here
//  (as function secrets), never in the browser. The master ON/OFF switch and
//  Test Mode are enforced HERE, so the UI cannot send when messaging is off.
//
//  Deploy:   supabase functions deploy send-sms
//  Secrets:  supabase secrets set TWILIO_ACCOUNT_SID=... TWILIO_AUTH_TOKEN=... \
//                                 TWILIO_FROM=+1XXXXXXXXXX
//  (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.)
//
//  Request body:
//    { test?: boolean, season?: number,
//      messages: [{ to: string, body: string, name?: string, template_key?: string }] }
//  - test:true  ignores the master switch and sends only to the configured
//    test_number (for verifying setup).
//  - otherwise, sending requires settings.enabled === true; if test_mode is on,
//    every message is redirected to test_number.
// ============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

const SID = Deno.env.get('TWILIO_ACCOUNT_SID') ?? ''
const TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN') ?? ''
const FROM = Deno.env.get('TWILIO_FROM') ?? ''

const admin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
)

async function sendOne(to: string, body: string) {
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${SID}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${SID}:${TOKEN}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ To: to, From: FROM, Body: body }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.message || `Twilio error ${res.status}`)
  return data?.sid as string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  if (!SID || !TOKEN || !FROM) {
    return json({ error: 'Twilio is not configured. Set TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM.' }, 500)
  }

  let payload
  try { payload = await req.json() } catch { return json({ error: 'Invalid JSON' }, 400) }
  const { test = false, season = null, messages = [] } = payload ?? {}
  if (!Array.isArray(messages) || messages.length === 0) return json({ error: 'No messages provided' }, 400)

  const { data: settings } = await admin.from('messaging_settings').select('*').eq('id', 1).maybeSingle()

  // Master switch (bypassed only for explicit test sends).
  if (!test && !settings?.enabled) {
    return json({ skipped: true, reason: 'Messaging is switched off', sent: 0, failed: 0, results: [] })
  }
  const redirect = test || settings?.test_mode
  const testNumber = settings?.test_number || ''
  if (redirect && !testNumber) {
    return json({ error: 'Test mode is on but no test number is set.' }, 400)
  }

  const results = []
  let sent = 0, failed = 0
  for (const m of messages) {
    const to = redirect ? testNumber : m.to
    let status = 'sent', error: string | null = null, sid: string | null = null
    if (!to) {
      status = 'skipped'; error = 'No phone number'
    } else {
      try { sid = await sendOne(to, m.body) } catch (e) { status = 'failed'; error = String(e?.message || e) }
    }
    if (status === 'sent') sent++; else if (status === 'failed') failed++

    await admin.from('message_log').insert({
      season, template_key: m.template_key ?? null, to_name: m.name ?? null,
      to_number: to ?? null, body: m.body, status, error, twilio_sid: sid,
    })
    results.push({ to: m.name || to, status, error })
  }

  return json({ skipped: false, redirected: redirect, sent, failed, results })
})
