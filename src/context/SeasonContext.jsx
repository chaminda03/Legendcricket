import { createContext, useContext, useState } from 'react'
import { CURRENT_SEASON } from '../data/seasons'

const SeasonContext = createContext(null)

export function SeasonProvider({ children }) {
  const [season, setSeason] = useState(CURRENT_SEASON)
  return (
    <SeasonContext.Provider value={{ season, setSeason }}>
      {children}
    </SeasonContext.Provider>
  )
}

export function useSeason() {
  const ctx = useContext(SeasonContext)
  if (!ctx) throw new Error('useSeason must be used within a SeasonProvider')
  return ctx
}
