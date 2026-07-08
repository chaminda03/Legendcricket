# 🏏 Virginia Legends Cricket Club — Tournament Website

A modern, Big Bash–inspired website for the annual Virginia Legends **6-a-side** Championship.
16 teams · 4 groups · **5 overs a side** · live points table · knockout bracket · team registration.

Built with **React + Vite**, with team registrations saved to **Google Sheets**.

---

## ✨ Features

| Page | What it does |
|------|--------------|
| **Home** | Bold hero, tournament stats, feature highlights, Group A preview, latest results, CTA |
| **Points Table** | Live standings for all 4 groups — points, Net Run Rate, form guide, qualification zone. Computed automatically from match results |
| **Knockouts** | Qualified-team seeding + full quarterfinal → semifinal → grand-final bracket |
| **Fixtures** | Full round-robin schedule with scorelines; filter by group / results |
| **Teams** | All 16 teams grouped A–D with colours |
| **Register** | 8-player squad registration form → saved to your Google Sheet |
| **Admin** (`/admin`) | Committee view of all registrations + CSV export (also live in the Sheet) |

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
part that needs setup is **saving registrations**, which uses Google Sheets (below).

---

## 🗄️ Connect registrations to Google Sheets — ~5 minutes

Team registrations land as rows in a Google Sheet you own. The site's branded
form posts to a tiny Google Apps Script; the committee just watches entries
arrive in the spreadsheet.

1. **Create a Google Sheet** — go to [sheet.new](https://sheet.new) (any name).
2. **Open the script editor** — in that sheet: **Extensions → Apps Script**.
3. **Paste the script** — delete the sample code, paste all of
   [`google-apps-script.gs`](./google-apps-script.gs), and **Save**.
4. **Deploy** — **Deploy → New deployment → Web app**:
   - *Execute as:* **Me**
   - *Who has access:* **Anyone**

   Click **Deploy**, then **Authorize access**. Copy the **Web app URL** (ends in `/exec`).
5. **Add it to the app** — copy `.env.example` to `.env` and paste:
   ```
   VITE_SHEETS_ENDPOINT=https://script.google.com/macros/s/XXXX/exec
   ```
6. **Restart** the dev server. Submit a test team on `/register` — it appears in
   your Google Sheet, and on the `/admin` page. 🎉

> Until you do this, the form shows a friendly "not connected" note and the rest
> of the site works normally. The `google-apps-script.gs` file has the same steps
> in its header comment.

---

## 🔒 A note on privacy

The web app is deployed as **Anyone** so the public form can submit without a
login. The `/admin` page reads the same endpoint, so treat its URL as semi-public.
For a club tournament that's usually fine. To lock it down, you can remove the
`doGet` function from the script (then manage entries **only** in the Google Sheet,
which stays private to your Google account) — the form will still work.

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
Pages**, or **Cloudflare Pages**. On Netlify/Vercel, set the `VITE_SHEETS_ENDPOINT`
environment variable in the dashboard so registrations work in production.

Because the app uses client-side routing, add a redirect so deep links work:

- **Netlify** — create a `public/_redirects` file with: `/*  /index.html  200`
- **Vercel** — handled automatically for Vite SPAs.

---

Made for the love of the game. 🏏
