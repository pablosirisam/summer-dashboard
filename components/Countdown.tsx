'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Salad, Dumbbell } from 'lucide-react'
import type { DailyLog } from '@/types'

interface Props {
  remaining: number
  progress: number
  todayLog: DailyLog | null
}

function useCountUp(target: number, ms = 1400) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let raf = 0
    let startTs: number | null = null
    const tick = (ts: number) => {
      if (startTs === null) startTs = ts
      const p = Math.min(1, (ts - startTs) / ms)
      // easeOutExpo
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p)
      setVal(Math.round(eased * target))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, ms])
  return val
}

export default function Countdown({ remaining, progress, todayLog }: Props) {
  const num = useCountUp(remaining)
  const pct = useCountUp(Math.round(progress), 1600)

  // El parte de hoy, legible sin ir al ticker: responde «¿cómo voy?» en el primer scroll.
  const pills = [
    { Icon: Brain,    k: 'IA',      v: todayLog?.ia_hours ? `${todayLog.ia_hours}h` : '—',            on: !!todayLog?.ia_completed },
    { Icon: Salad,    k: 'COMIDA',  v: todayLog?.food_rating ? `${todayLog.food_rating}★` : '—',      on: !!todayLog?.food_completed },
    { Icon: Dumbbell, k: 'DEPORTE', v: todayLog?.sport_minutes ? `${todayLog.sport_minutes}min` : '—', on: !!todayLog?.sport_completed },
  ]

  return (
    <section className="hero">
      <div className="hero-beam" />
      <p className="hero-eyebrow">VERANO 2026 · <b>cuenta atrás hasta la uni</b></p>

      <div className="count-wrap">
        <motion.div
          className="count-num"
          initial={{ opacity: 0, scale: 0.92, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {num}
        </motion.div>
        <motion.p
          className="count-label"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          días de verano <b>antes de septiembre</b>
        </motion.p>
      </div>

      <motion.div
        className="today-pills"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="tp-tag">EL PARTE DE HOY</span>
        {todayLog ? (
          pills.map(({ Icon, k, v, on }) => (
            <span key={k} className={`tp-pill${on ? ' on' : ''}`}>
              <Icon size={13} strokeWidth={2.2} />
              <i>{k}</i>
              <b>{v}</b>
              <span className="tp-mark">{on ? '▲' : '·'}</span>
            </span>
          ))
        ) : (
          <span className="tp-empty">sin parte aún — el día es tuyo</span>
        )}
      </motion.div>

      <div className="hero-progress">
        <div className="hp-track">
          <motion.div
            className="hp-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          />
        </div>
        <div className="hp-labels">
          <span>18 JUN</span>
          <span>{pct}% transcurrido</span>
          <span>1 SEP</span>
        </div>
      </div>
    </section>
  )
}
