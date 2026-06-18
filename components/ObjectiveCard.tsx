'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Flame, ArrowUpRight } from 'lucide-react'
import type { DailyLog, ObjectiveType } from '@/types'
import {
  getStreak, getBestStreak, getCompletionCount, getConsistency,
  getTotalIaHours, getTotalSportMinutes, getAvgFoodRating,
} from '@/lib/utils'
import { OBJECTIVES } from '@/lib/objectives'

interface Props { type: ObjectiveType; logs: DailyLog[]; index: number }

export default function ObjectiveCard({ type, logs, index }: Props) {
  const c = OBJECTIVES[type]
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
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={c.route}
        className="ocard"
        style={{ ['--accent' as string]: c.accent, ['--accent-2' as string]: c.accent2, ['--accent-glow' as string]: c.glow }}
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
            animate={{ width: `${consist}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.3 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        <div className="oc-foot">
          <div className="oc-stat"><span className="v">{done}</span><span className="k">días ✓</span></div>
          <div className="oc-stat"><span className="v">{streak}</span><span className="k">racha</span></div>
          <div className="oc-stat"><span className="v">{best}</span><span className="k">mejor</span></div>
        </div>

        <span className="oc-cta">Ver detalle <ArrowUpRight size={14} strokeWidth={2.4} /></span>
      </Link>
    </motion.div>
  )
}
