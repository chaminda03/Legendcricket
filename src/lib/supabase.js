import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// The app runs without Supabase configured — registration and the admin panel
// show a friendly "not connected" message instead of crashing.
export const isSupabaseConfigured = Boolean(url && anonKey && !url.includes('YOUR-PROJECT'))

export const supabase = isSupabaseConfigured ? createClient(url, anonKey) : null
