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
drop policy if exists "anon can register a team" on public.teams;
create policy "anon can register a team"
  on public.teams for insert to anon
  with check (status = 'pending');

-- ...and can READ teams the committee has approved.
drop policy if exists "public can read approved teams" on public.teams;
create policy "public can read approved teams"
  on public.teams for select to anon
  using (status = 'approved');

-- Public can READ all matches (fixtures + results).
drop policy if exists "public can read matches" on public.matches;
create policy "public can read matches"
  on public.matches for select to anon
  using (true);

-- Logged-in committee members can do EVERYTHING.
drop policy if exists "committee full access to teams" on public.teams;
create policy "committee full access to teams"
  on public.teams for all to authenticated
  using (true) with check (true);

drop policy if exists "committee full access to matches" on public.matches;
create policy "committee full access to matches"
  on public.matches for all to authenticated
  using (true) with check (true);

-- ---------- MESSAGING (SMS to captains) ------------------------------------
-- Single-row settings for the SMS system. The Edge Function reads this before
-- sending, so the master switch is enforced server-side (not just in the UI).
create table if not exists public.messaging_settings (
  id               int  primary key default 1,
  enabled          boolean not null default false,   -- master ON/OFF
  test_mode        boolean not null default true,     -- route all sends to test_number
  test_number      text,                              -- E.164, e.g. +15715551234
  updated_at       timestamptz not null default now(),
  constraint messaging_single_row check (id = 1)
);
insert into public.messaging_settings (id) values (1) on conflict do nothing;

-- Editable message templates (seeded from the app; the committee can tweak text).
create table if not exists public.message_templates (
  key        text primary key,          -- 'result', 'qualified', ...
  label      text not null,
  enabled    boolean not null default true,
  body       text not null,             -- with {placeholders}
  sort       int  not null default 0,
  updated_at timestamptz not null default now()
);

-- Audit log of every send attempt.
create table if not exists public.message_log (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  season      int,
  template_key text,
  to_name     text,
  to_number   text,
  body        text,
  status      text,                     -- sent | failed | skipped
  error       text,
  twilio_sid  text
);

alter table public.messaging_settings enable row level security;
alter table public.message_templates  enable row level security;
alter table public.message_log         enable row level security;

-- Only the committee can see/manage messaging. (The Edge Function uses the
-- service-role key, which bypasses RLS, to read settings and write the log.)
drop policy if exists "committee manages messaging settings" on public.messaging_settings;
create policy "committee manages messaging settings"
  on public.messaging_settings for all to authenticated using (true) with check (true);
drop policy if exists "committee manages message templates" on public.message_templates;
create policy "committee manages message templates"
  on public.message_templates for all to authenticated using (true) with check (true);
drop policy if exists "committee reads message log" on public.message_log;
create policy "committee reads message log"
  on public.message_log for all to authenticated using (true) with check (true);

-- ============================================================================
--  CREATE YOUR COMMITTEE LOGIN
--  Dashboard -> Authentication -> Users -> "Add user" -> enter an email +
--  password (tick "Auto Confirm User"). Use those to log in at /admin/login.
--  Add one user per committee member. Anyone with an account is a committee
--  member with full access.
-- ============================================================================
