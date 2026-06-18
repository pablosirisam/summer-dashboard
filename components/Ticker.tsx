'use client'

import { motion } from 'framer-motion'
import { Brain, Salad, Dumbbell, Flame } from 'lucide-react'

export interface TickerSnap {
  dateLabel: string
  isToday: boolean
  ia: { v: string; on: boolean }
  food: { v: string; on: boolean }
  sport: { v: string; on: boolean }
  streak: number
  done: number // 0..3 objetivos cumplidos ese día
}

/**
 * Signature element — the "parte del día": today's book read like a
 * performance terminal tape. Mono, tabular, one live pulse. Quiet by design.
 */
export default function Ticker({ snap }: { snap: TickerSnap | null }) {
  if (!snap) return null

  const items = [
    { Icon: Brain, k: 'IA', ...snap.ia },
    { Icon: Salad, k: 'COMIDA', ...snap.food },
    { Icon: Dumbbell, k: 'DEPORTE', ...snap.sport },
  ]

  return (
    <motion.div
      className="tape"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
    >
      <div className="tape-inner">
        <span className="tape-tag">
          <span className={`tape-live${snap.isToday ? ' on' : ''}`} />
          {snap.isToday ? 'PARTE DE HOY' : `ÚLTIMO PARTE · ${snap.dateLabel.toUpperCase()}`}
        </span>

        <span className="tape-feed">
          {items.map(({ Icon, k, v, on }) => (
            <span key={k} className={`tape-item${on ? ' on' : ''}`}>
              <Icon size={12} strokeWidth={2.2} />
              <i>{k}</i>
              <b>{v || '—'}</b>
              <span className="tape-mark">{on ? '▲' : '·'}</span>
            </span>
          ))}
        </span>

        <span className="tape-streak">
          <Flame size={12} strokeWidth={2.4} />
          <b>{snap.streak}</b>
          <i>RACHA</i>
        </span>
      </div>
    </motion.div>
  )
}
