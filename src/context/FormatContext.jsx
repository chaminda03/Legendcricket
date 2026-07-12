import { createContext, useContext, useEffect, useState } from 'react'
import { DEFAULT_FORMAT, FORMATS, getFormat } from '../data/formats'

// Holds the committee's chosen tournament format (16 or 20 teams). Persisted to
// localStorage so a refresh keeps the admin's selection. This is a per-browser
// authoring preference; the stored draw (teams + their groups in Supabase) is
// the real source of truth for the public site.
const FormatContext = createContext(null)
const STORAGE_KEY = 'vl-tournament-format'

function readStored() {
  try {
    const v = Number(localStorage.getItem(STORAGE_KEY))
    return FORMATS[v] ? v : DEFAULT_FORMAT
  } catch {
    return DEFAULT_FORMAT
  }
}

export function FormatProvider({ children }) {
  const [size, setSize] = useState(readStored)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, String(size)) } catch { /* storage unavailable */ }
  }, [size])

  return (
    <FormatContext.Provider value={{ size, setSize, format: getFormat(size) }}>
      {children}
    </FormatContext.Provider>
  )
}

export function useFormat() {
  const ctx = useContext(FormatContext)
  if (!ctx) throw new Error('useFormat must be used within a FormatProvider')
  return ctx
}
