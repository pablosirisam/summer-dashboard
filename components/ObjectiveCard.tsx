'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Flame, ArrowUpRight, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { DailyLog, ObjectiveType } from '@/types'
import {
  getStreak, getBestStreak, getCompletionCount, getConsistency,
  getTotalIaHours, getTotalSportMinutes, getAvgFoodRating,
  getSeries, getMetricAvg, getBestDay, getActiveDays, getMetricTrend,
  type ObjType,
} from '@/lib/utils'
import { OBJECTIVES } from '@/lib/objectives'

interface Props { type: ObjectiveType; logs: DailyLog[]; index: number }

const EASE = [0.16, 1, 0.3, 1] as const

/** Tiny inline trajectory of the last active days — the shape of the climb. */
function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return <div className="oc-spark-empty">Aún sin tendencia</div>
  const W = 120, H = 32
  const max = Math.max(...values), min = Math.min(...values)
  const span = max - min || 1
  const xy = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W
    const y = H - ((v - min) / span) * (H - 5) - 2.5
    return [x, y] as const
  })
  const line = xy.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const [lx, ly] = xy[xy.length - 1]
  return (
    <svg className="oc-spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden>
      <polyline points={line} fill="none" stroke={color} strokeWidth="2"
        strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <circle cx={lx} cy={ly} r="2.7" fill={color} />
    </svg>
  )
}

export default function ObjectiveCard({ type, logs, index }: Props) {
  const c = OBJECTIVES[type]
  const Icon = c.icon
  const ot = type as ObjType

  const streak = getStreak(logs, c.field)

  // Headline metric per objective
  let big = '0', unit = '', cap = ''
  if (type === 'ia') {
    big = String(getTotalIaHours(logs)); unit = 'h'; cap = 'horas de trabajo real este verano'
  } else if (type === 'food') {
    const avg = getAvgFoodRating(logs)
    big = avg ? avg.toFixed(1) : '—'; unit = '/ 5'; cap = 'calidad media de tu dieta'
  } else {
    const m = getTotalSportMinutes(logs)
    big = `${Math.floor(m / 60)}h ${m % 60}`; unit = 'min'; cap = 'tiempo total en movimiento'
  }

  // Mode-specific stats
  const activeDays = getActiveDays(logs, ot)
  const avgMetric = getMetricAvg(logs, ot)
  const bestDay = getBestDay(logs, ot)
  const trend = getMetricTrend(logs, ot)
  const sparkVals = getSeries(logs, ot).filter(p => p.value > 0).map(p => p.value).slice(-16)

  let foot: { v: string; k: string; record?: boolean }[]
  if (type === 'ia') {
    foot = [
      { v: `${avgMetric}h`, k: 'media/día' },
      { v: String(activeDays), k: 'días activos' },
      { v: bestDay ? `${bestDay.value}h` : '—', k: 'mejor', record: !!bestDay },
    ]
  } else if (type === 'food') {
    const goodDays = logs.filter(l => (l.food_rating ?? 0) >= 4).length
    foot = [
      { v: String(activeDays), k: 'días valorados' },
      { v: String(goodDays), k: 'días ≥4★' },
      { v: bestDay ? `${bestDay.value}★` : '—', k: 'mejor', record: !!bestDay },
    ]
  } else {
    const bestStreak = getBestStreak(logs, c.field)
    foot = [
      { v: String(getCompletionCount(logs, c.field)), k: 'días ✓' },
      { v: String(streak), k: 'racha' },
      { v: String(bestStreak), k: 'mejor', record: bestStreak > 0 },
    ]
  }

  const consist = Math.round(getConsistency(logs, c.field))
  const TrendIcon = trend?.dir === 'up' ? TrendingUp : trend?.dir === 'down' ? TrendingDown : Minus

  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: EASE }}
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
          {c.mode === 'streak' ? (
            <div className={`streak${streak > 0 ? ' on' : ''}`}>
              <Flame size={13} strokeWidth={2.4} />{streak}
            </div>
          ) : trend ? (
            <div className={`oc-trend ${trend.dir}`} title="últimos 7 días vs anteriores">
              <TrendIcon size={13} strokeWidth={2.6} />{trend.pct > 0 ? '+' : ''}{trend.pct}%
            </div>
          ) : null}
        </div>

        <div className="oc-metric">
          <span className="oc-big">{big}</span>
          <span className="oc-unit">{unit}</span>
        </div>
        <div className="oc-cap">{cap}</div>

        {c.mode === 'streak' ? (
          <>
            <div className="bar-row">
              <span>Constancia</span>
              <span><b>{consist}%</b></span>
            </div>
            <div className="bar-track">
              <motion.div
                className="bar-fill"
                initial={{ width: 0 }}
                whileInView={{ width: `${consist}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.3 + index * 0.1, ease: EASE }}
              />
            </div>
          </>
        ) : (
          <>
            <div className="bar-row">
              <span>Evolución</span>
              <span>{activeDays} {activeDays === 1 ? 'día' : 'días'}</span>
            </div>
            <Sparkline values={sparkVals} color={c.accent2} />
          </>
        )}

        <div className="oc-foot">
          {foot.map((s, i) => (
            <div key={i} className="oc-stat"><span className={`v${s.record ? ' record' : ''}`}>{s.v}</span><span className="k">{s.k}</span></div>
          ))}
        </div>

        <span className="oc-cta">Ver detalle <ArrowUpRight size={14} strokeWidth={2.4} /></span>
      </Link>
    </motion.div>
  )
}
