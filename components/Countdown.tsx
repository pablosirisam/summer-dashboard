'use client'

import { useEffect, useState } from 'react'
import { differenceInDays } from 'date-fns'

const SUMMER_START = new Date(2026, 5, 18)
const SUMMER_END   = new Date(2026, 8, 1)
const TOTAL        = 75

export default function Countdown() {
  const [state, setState] = useState<{ remaining: number; elapsed: number; pct: number } | null>(null)

  useEffect(() => {
    const compute = () => {
      const now = new Date()
      const remaining = Math.max(0, differenceInDays(SUMMER_END, now))
      const elapsed   = Math.min(TOTAL, Math.max(1, differenceInDays(now, SUMMER_START) + 1))
      setState({ remaining, elapsed, pct: (elapsed / TOTAL) * 100 })
    }
    compute()
    const t = setInterval(compute, 60_000)
    return () => clearInterval(t)
  }, [])

  if (!state) return null

  return (
    <div className="countdown">
      <div className="countdown-top">
        <span className="countdown-num">{state.remaining}</span>
        <span className="countdown-label">días restantes</span>
      </div>
      <div className="countdown-sub">Día {state.elapsed} de {TOTAL} · {state.pct.toFixed(1)}%</div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${state.pct}%` }} />
      </div>
    </div>
  )
}
