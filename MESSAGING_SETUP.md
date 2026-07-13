# SMS Messaging — Setup Guide

Send score/status texts to team captains via Twilio. One-time setup ≈ 20 minutes.
The whole tournament costs ~$2–3 (usually covered by Twilio's free signup credit).

---

## What you'll end up with

Admin → **Messaging** tab, where you flip a master **ON/OFF** switch, edit message
templates, and send updates. Texts are delivered by a Supabase Edge Function that
holds the Twilio password (never exposed in the website).

```
Admin dashboard → Supabase Edge Function (send-sms) → Twilio → captains
```

---

## Step 1 — Add the messaging tables (2 min)

1. Open your project at **app.supabase.com**.
2. Left sidebar → **SQL Editor** → **New query**.
3. Open `supabase-schema.sql` from this repo, copy **the whole file**, paste, click **Run**.
   - Safe to re-run — tables use `if not exists` and every policy is `drop … if exists`
     then `create`, so existing objects won't error.
   - This adds three tables: `messaging_settings`, `message_templates`, `message_log`.

---

## Step 2 — Create a Twilio account & number (7 min)

1. Sign up at **twilio.com/try-twilio** (free; you get ~$15 trial credit).
2. On the **Twilio Console** home page (console.twilio.com), copy these two values from
   the **Account Info** panel — you'll need them in Step 4:
   - **Account SID** (starts with `AC…`)
   - **Auth Token** (click to reveal)
3. Get a phone number: left menu → **Phone Numbers → Manage → Buy a number**.
   - Filter: **Country = United States**, capability **SMS** ✓. Buy it (≈ $1.15/mo).
   - Copy the number in the form `+15715551234` — this is your **TWILIO_FROM**.

> **Trial-account note:** while on the free trial, Twilio can only text **verified**
> numbers, and adds an "sent from a trial account" prefix. To text real captains you
> must **upgrade** (Console → **Upgrade**, add a card). Your $15 credit still applies,
> so the tournament is effectively free — you just have to add a card once.

---

## Step 3 — Deploy the Edge Function (5 min)

You need the **Supabase CLI**. In a terminal at the project root:

```bash
# 1. Install (once) — or use `npx supabase ...` for every command
npm install -g supabase

# 2. Log in (opens a browser)
supabase login

# 3. Link this repo to your project.
#    Find <project-ref> in Supabase → Project Settings → General → "Reference ID"
supabase link --project-ref <project-ref>

# 4. Deploy the function
supabase functions deploy send-sms
```

---

## Step 4 — Give the function your Twilio keys (2 min)

Paste the three values from Step 2:

```bash
supabase secrets set \
  TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx \
  TWILIO_AUTH_TOKEN=your_auth_token \
  TWILIO_FROM=+15715551234
```

> `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically by
> Supabase — **do not** set those yourself.

---

## Step 5 — Test it (3 min)

1. Log in to the site's admin panel → **Messaging** tab.
2. Leave **Test mode ON**. Enter **your own** mobile in the test-number box
   (format `+15715551234`). If your Twilio is still a trial, first verify that number
   under Twilio Console → **Phone Numbers → Verified Caller IDs**.
3. Click **Send test**. You should get "VA Legends SMS test ✅" within a few seconds.
4. Check the **Recent messages** log at the bottom — it should show `sent`.

If it says `failed`, see Troubleshooting below.

---

## Step 6 — Go live on match day

1. In the **Messaging** tab, turn **Test mode OFF** (texts now go to captains).
2. Turn the master switch **Messaging ON**.
3. Send updates with the buttons:
   - **Approved + group draw** / **Day-before reminder** — before the day
   - **Text result** (per completed match) — after saving a score
   - **Qualification results** — once the group stage finishes
   - **Umpire reminder**, **Awards ceremony**, **Up next**, **Custom broadcast** — as needed
4. Every send shows a **recipient count + cost** and asks for confirmation first.

**When the tournament ends,** flip **Messaging OFF** so nothing can go out by accident.

---

## Editing message wording

Messaging tab → **Templates**. Edit any message; text in `{curly braces}` is filled
in per team automatically (e.g. `{team}`, `{opponent}`, `{score}`, `{url}`). Toggle a
template off to disable that message type entirely.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Test says **"Not sent — Messaging is switched off"** | Expected only for real sends; "Send test" ignores the switch. If you see it on a test, you didn't click *Send test*. |
| Log shows **failed: "... is not a valid phone number"** | The captain's number isn't E.164. It auto-formats US 10-digit numbers; fix odd entries on the Teams tab. |
| Log shows **failed: "... unverified"** | Trial account texting a non-verified number → verify it, or upgrade Twilio (Step 2 note). |
| **"Twilio is not configured"** | Secrets missing/typo'd — re-run Step 4, then `supabase functions deploy send-sms` again. |
| Nothing happens / network error | Confirm the function deployed: Supabase → **Edge Functions** should list `send-sms`. |

---

## Costs

- **Texts:** ~$0.0083 each. A full 16-team tournament (~200 texts) ≈ **$1.66**.
- **Phone number:** ~$1.15/month.
- **Trial credit:** ~$15 — covers several tournaments before you pay anything.
