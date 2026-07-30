# 🏏 Virginia Legends Cricket Club — Tournament Website

A modern, Big Bash–inspired website for the annual Virginia Legends **6-a-side** Championship.
16 teams · 4 groups · **5 overs a side** · live points table · knockout bracket · team registration.

Built with **React + Vite**, with registrations + a committee admin panel on **Supabase**.

---

## ✨ Features

| Page | What it does |
|------|--------------|
| **Home** | Bold hero, tournament stats, feature highlights, Group A preview, latest results, CTA |
| **Points Table** | Live standings for all 4 groups — points, Net Run Rate, form guide, qualification zone. Computed automatically from match results |
| **Knockouts** | Qualified-team seeding + full quarterfinal → semifinal → grand-final bracket |
| **Schedule** | Match-day timetable — one row per kick-off, one column per field, so you can see every simultaneous game at a glance |
| **Fixtures** | Full round-robin schedule with scorelines; filter by group / results |
| **Teams** | All 16 teams grouped A–D with colours |
| **Register** | 8-player squad registration form → saved to Supabase (as a pending team) |
| **Admin** (`/admin`) | Login-protected committee panel: approve teams + run the group draw |

---

## 🧮 How the tournament works (the logic, in code)

This is a **6-a-side, 5-over** format. All of it is data-driven and computed live —
edit a result and the tables + bracket update themselves.

**Points** (`src/data/standings.js`): Win = **2**, Tie / No Result = **1**, Loss = **0**.

**Net Run Rate (NRR)** — computed across all of a team's matches:

```
NRR = (total runs scored ÷ total overs faced)
    − (total runs conceded ÷ total overs bowled)
```

- Overs use cricket notation: `2.1` = 2 overs + 1 ball = `2 + 1/6` overs.
- A side that wins chasing is credited with the **overs it actually faced**.
- A side that is **bowled out** (5 wickets in 6-a-side) is credited with the **full 5-over quota**.

> ✅ This reproduces the club's historical results *exactly* — verified against
> the previous season's numbers for all 16 teams.

**Advancing through the knockouts** (`src/data/knockout.js`):

1. **Top 2 of each group** qualify (ordered by Points, then NRR) → 8 teams.
2. All 8 are **re-seeded 1–8** by Points, then NRR.
3. **Quarterfinals:** QF1 `1 v 8` · QF2 `2 v 7` · QF3 `3 v 6` · QF4 `4 v 5`.
4. **Semifinals:** SF1 = QF1 winner v QF4 winner · SF2 = QF2 winner v QF3 winner.
5. **Final:** SF1 winner v SF2 winner.

To run a live bracket, blank out the winners in a season's `knockoutResults`
(in `src/data/seasons.js`) — undecided matches show as *TBD* and each round fills
in automatically as you record winners.

---

## 📅 Seasons (year dropdown)

The Points Table, Knockouts and Fixtures pages have a **season dropdown**
(`src/data/seasons.js`). `2025` holds the completed championship; `2026` is the
current season (registration open — pages show a "coming soon" state until it has
fixtures). The dropdown defaults to the current season.

**To open a new season** (e.g. when 2027 comes around), add an entry to `SEASONS`:

```js
2027: {
  year: 2027, status: 'upcoming', tagline: 'Registration Open',
  fixtures: [], knockoutResults: {}, champion: null,
},
```

then add `2027` to `SEASON_YEARS` (newest first) and set `CURRENT_SEASON = 2027`.
As matches are played, fill in that season's `fixtures` (same `M(...)` shape as
`src/data/fixtures.js`) and the standings/bracket compute themselves.

---

## 🚀 Run it locally

```bash
npm install
npm run dev
```

The site opens at **http://localhost:5173**. It works immediately — the only
part that needs setup is **registrations + the admin panel**, which use Supabase (below).

---

## 🗄️ Connect Supabase (registrations + admin panel) — ~10 minutes

Registrations are saved to a free Supabase database, and the committee manages
everything from a login-protected admin panel.

1. **Create a project** at [supabase.com](https://supabase.com) → *New project*
   (any name / region). Wait for it to finish provisioning.
2. **Create the tables** — in the project: **SQL Editor → New query**, paste the
   contents of [`supabase-schema.sql`](./supabase-schema.sql), and click **Run**.
   Re-run this same file after pulling updates: it is written to be safe to run
   again and adds any columns newer releases need (e.g. the schedule's `field`
   and `start_time`).
3. **Get your keys** — **Project Settings → API**, copy the *Project URL* and the
   *anon / public* key.
4. **Add them to the app** — copy `.env.example` to `.env` and fill in:
   ```
   VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
5. **Create a committee login** — **Authentication → Users → Add user**, enter an
   email + password and tick **Auto Confirm User**. Add one per committee member.
6. **Restart** the dev server (`npm run dev`).
   - Submit a test team on `/register`.
   - Log in at **`/admin/login`** with the user from step 5.
   - On **`/admin`** you'll see the team — approve it and assign a group. 🎉

> Until you connect Supabase, the registration form and admin panel show a
> friendly "not connected" note; the rest of the site works normally.

**Security:** Row Level Security is enabled in the schema. The public (anon key)
can only *submit* a registration and *read approved* teams; only logged-in
committee members can approve teams, run the draw, and edit results.

---

## 🛠️ The admin panel (`/admin`)

- **Login** at `/admin/login` (Supabase Auth — committee accounts only).
- **Teams & Draw** — see every registration, approve/reject, and assign each
  approved team to Group A–D. The draw drives the public points table & bracket.
- **Fixtures & Scores** — generate the group fixtures from the draw, then enter
  scores; standings and the Super 8 bracket update live.
- **Schedule** — set each game's kick-off time and field. *Auto-build* gives every
  group a field of its own and runs its matches back to back, so all fields kick
  off together, then lays the quarterfinals, semis and final out after them. Any
  game can be moved by hand afterwards. Feeds the public **Schedule** page.

---

## 🎨 Customising

Everything is data-driven — no need to touch the layout code:

- **Teams / groups / colours** → `src/data/teams.js`
- **Fixtures & match results** → `src/data/fixtures.js`
  (add an `M(...)` entry with the two innings and the points table updates itself)
- **Knockout winners / bracket** → `src/data/knockout.js`
- **Points rules & Net Run Rate** → `src/data/standings.js`
- **Brand colours, fonts, spacing** → CSS variables at the top of `src/index.css`
- **Club name, contact, footer** → `src/components/Navbar.jsx` & `Footer.jsx`

---

## 📦 Build & deploy

```bash
npm run build     # outputs to /dist
```

Deploy the `dist` folder to any static host — **Netlify**, **Vercel**, **GitHub
Pages**, or **Cloudflare Pages**. On Netlify/Vercel, set the `VITE_SUPABASE_URL`
and `VITE_SUPABASE_ANON_KEY` environment variables in the dashboard so
registrations + the admin panel work in production.

Because the app uses client-side routing, add a redirect so deep links work:

- **Netlify** — create a `public/_redirects` file with: `/*  /index.html  200`
- **Vercel** — handled automatically for Vite SPAs.

---

Made for the love of the game. 🏏
