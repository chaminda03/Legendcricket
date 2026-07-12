-- ============================================================================
--  Virginia Legends Cricket Carnival — database schema
--  Run in your Supabase project: Dashboard -> SQL Editor -> New query -> Run.
-- ============================================================================

-- ---------- TEAMS (registrations + the committee's draw) --------------------
create table if not exists public.teams (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  season             int  not null default 2026,
  name               text not null,
  short              text,                    -- team code e.g. "VLR" (committee sets)
  color              text default '#3B82F6',  -- accent colour (committee sets)
  grp                text,                    -- 'A' | 'B' | 'C' | 'D'  (the draw; null until assigned)
  captain_name       text,
  captain_phone      text,
  captain_email      text,
  vice_captain_name  text,
  vice_captain_phone text,
  players            text,                    -- 8 names, newline-separated
  notes              text,
  status             text not null default 'pending'  -- pending | approved | rejected
);

-- ---------- MATCHES (fixtures + scores; used from Phase 2) ------------------
create table if not exists public.matches (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  season      int  not null default 2026,
  stage       text not null default 'group',   -- group | QF | SF | final
  grp         text,                             -- group for group-stage matches
  code        text,                             -- e.g. 'A1', 'QF1'
  home_team   uuid references public.teams(id) on delete set null,
  away_team   uuid references public.teams(id) on delete set null,
  home_runs   int, home_wkts int, home_overs numeric(4,1),
  away_runs   int, away_wkts int, away_overs numeric(4,1),
  winner      uuid references public.teams(id) on delete set null,  -- knockouts
  status      text not null default 'scheduled' -- scheduled | completed
);

-- ---------- Row Level Security ---------------------------------------------
alter table public.teams   enable row level security;
alter table public.matches enable row level security;

-- Public (anon key) can SUBMIT a registration...
create policy "anon can register a team"
  on public.teams for insert to anon
  with check (status = 'pending');

-- ...and can READ teams the committee has approved.
create policy "public can read approved teams"
  on public.teams for select to anon
  using (status = 'approved');

-- Public can READ all matches (fixtures + results).
create policy "public can read matches"
  on public.matches for select to anon
  using (true);

-- Logged-in committee members can do EVERYTHING.
create policy "committee full access to teams"
  on public.teams for all to authenticated
  using (true) with check (true);

create policy "committee full access to matches"
  on public.matches for all to authenticated
  using (true) with check (true);

-- ============================================================================
--  CREATE YOUR COMMITTEE LOGIN
--  Dashboard -> Authentication -> Users -> "Add user" -> enter an email +
--  password (tick "Auto Confirm User"). Use those to log in at /admin/login.
--  Add one user per committee member. Anyone with an account is a committee
--  member with full access.
-- ============================================================================
