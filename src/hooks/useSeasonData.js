import { useState, useEffect } from 'react'
import { TEAMS } from '../data/teams'
import { getSeason, CURRENT_SEASON } from '../data/seasons'
import { fetchPublicTeams, fetchMatches } from '../lib/db'
import { isSupabaseConfigured } from '../lib/supabase'

// Normalises a season into a shared shape: { teams, matches } where both static
// (2025 seed) and live (2026 Supabase) data use the SAME flat match fields, so
// every public page renders them identically.

function staticData(year) {
  const season = getSeason(year)
  const teams = TEAMS.map((t) => ({ id: t.id, name: t.name, short: t.short, color: t.color, grp: t.group }))
  const matches = season.fixtures.map((f) => ({
    id: f.id, grp: f.group, code: f.id, stage: 'group', status: f.status,
    date: f.date, venue: f.venue,
    home_team: f.home, away_team: f.away,
    home_runs: f.result?.home.runs, home_wkts: f.result?.home.wickets, home_overs: f.result?.home.overs,
    away_runs: f.result?.away.runs, away_wkts: f.result?.away.wickets, away_overs: f.result?.away.overs,
  }))
  return { teams, matches }
}

export function useSeasonData(year) {
  // The current season is managed live in Supabase; past seasons are static seed.
  const live = year === CURRENT_SEASON && isSupabaseConfigured

  const [state, setState] = useState(() =>
    live
      ? { teams: [], matches: [], loading: true, error: '', live: true }
      : { ...staticData(year), loading: false, error: '', live: false }
  )

  useEffect(() => {
    let active = true
    if (!live) {
      setState({ ...staticData(year), loading: false, error: '', live: false })
      return
    }
    setState((s) => ({ ...s, loading: true }))
    Promise.all([fetchPublicTeams(year), fetchMatches(year)])
      .then(([teams, matches]) => { if (active) setState({ teams, matches, loading: false, error: '', live: true }) })
      .catch((err) => { if (active) setState({ teams: [], matches: [], loading: false, error: err.message, live: true }) })
    return () => { active = false }
  }, [year, live])

  return state
}
