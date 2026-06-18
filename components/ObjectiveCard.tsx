'use client'

import { motion } from 'framer-motion'
import { Brain, Salad, Dumbbell, Flame, type LucideIcon } from 'lucide-react'
import type { DailyLog } from '@/types'
import {
  getStreak, getBestStreak, getCompletionCount, getConsistency,
  getTotalIaHours, getTotalSportMinutes, getAvgFoodRating,
} from '@/lib/utils'

interface Props { type: 'ia' | 'food' | 'sport'; logs: DailyLog[]; index: number }

const CFG: Record<Props['type'], {
  label: string; sub: string; icon: LucideIcon
  accent: string; accent2: string; glow: string
  field: 'ia_completed' | 'food_completed' | 'sport_completed'
}> = {
  ia:    { label: 'Inteligencia Artificial', sub: 'horas de trabajo real', icon: Brain,    accent: '#6366f1', accent2: '#818cf8', glow: '99,102,241',  field: 'ia_completed' },
  food:  { label: 'Alimentación',            sub: 'calidad de la dieta',   icon: Salad,    accent: '#10d98b', accent2: '#34e6a0', glow: '16,217,139',  field: 'food_completed' },
  sport: { label: 'Deporte',                 sub: 'minutos en movimiento', icon: Dumbbell, accent: '#fb923c', accent2: '#fbbf24', glow: '251,146,60',  field: 'sport_completed' },
}

export default function ObjectiveCard({ type, logs, index }: Props) {
  const c = CFG[type]
  const Icon = c.icon
  const streak  = getStreak(logs, c.field)
  const best    = getBestStreak(logs, c.field)
  const done    = getCompletionCount(logs, c.field)
  const consist = Math.round(getConsistency(logs, c.field))

  let big = '0', unit = '', cap = ''
  if (type === 'ia') {
    big = String(getTotalIaHours(logs)); unit = 'h'; cap = 'horas acumuladas en IA este verano'
  } else if (type === 'food') {
    big = getAvgFoodRating(logs).toFixed(1); unit = '/ 5'; cap = 'valoración media de tus comidas'
  } else {
    const m = getTotalSportMinutes(logs)
    big = `${Math.floor(m / 60)}h ${m % 60}`; unit = 'min'; cap = 'tiempo total de actividad física'
  }

  return (
    <motion.div
      className="ocard"
      style={{ ['--accent' as string]: c.accent, ['--accent-2' as string]: c.accent2, ['--accent-glow' as string]: c.glow }}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="ocard-glow" />
      <div className="oc-head">
        <div className="oc-id">
          <div className="oc-icon"><Icon size={20} strokeWidth={2} /></div>
          <div>
            <div className="oc-name">{c.label}</div>
            <div className="oc-sub">{c.sub}</div>
          </div>
        </div>
        <div className={`streak${streak > 0 ? ' on' : ''}`}>
          <Flame size={13} strokeWidth={2.4} />{streak}
        </div>
      </div>

      <div className="oc-metric">
        <span className="oc-big">{big}</span>
        <span className="oc-unit">{unit}</span>
      </div>
      <div className="oc-cap">{cap}</div>

      <div className="bar-row">
        <span>Consistencia</span>
        <span><b>{consist}%</b></span>
      </div>
      <div className="bar-track">
        <motion.div
          className="bar-fill"
          initial={{ width: 0 }}
          whileInView={{ width: `${consist}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.3 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <div className="oc-foot">
        <div className="oc-stat"><span className="v">{done}</span><span className="k">días ✓</span></div>
        <div className="oc-stat"><span className="v">{streak}</span><span className="k">racha</span></div>
        <div className="oc-stat"><span className="v">{best}</span><span className="k">mejor</span></div>
      </div>
    </motion.div>
  )
}
