'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { LayoutGrid, Brain, Salad, Dumbbell, type LucideIcon } from 'lucide-react'
import type { DailyLog, ObjectiveType } from '@/types'
import {
  summerDates, spainToday, completedCountForLog,
  getBestStreak, getCompletionCount, getStreak, getConsistency,
  getActiveDays, getMetricAvg, getMetricTotal, getBestDay,
} from '@/lib/utils'
import { OBJECTIVES } from '@/lib/objectives'

interface Props { logs: DailyLog[]; type?: ObjectiveType; interactive?: boolean }

const WD = ['Lun', '', 'Mié', '', 'Vie', '', 'Dom']
const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const METRIC: Record<ObjectiveType, keyof DailyLog> = { ia: 'ia_hours', food: 'food_rating', sport: 'sport_minutes' }

/** Intensity bucket (i1<i2<i3) for a 'progress' objective. Food uses the 1-5 rating; IA scales by max. */
function intensityLevel(view: ObjectiveType, v: number, maxV: number): string {
  if (v <= 0) return ''
  if (view === 'food') return v >= 4 ? 'i3' : v >= 3 ? 'i2' : 'i1'
  const r = v / maxV
  return r > 0.66 ? 'i3' : r > 0.33 ? 'i2' : 'i1'
}

type FilterKey = ObjectiveType | 'all'
interface FilterOpt { key: FilterKey; label: string; icon: LucideIcon; accent: string; glow: string }
const FILTERS: FilterOpt[] = [
  { key: 'all',   label: 'Todos',   icon: LayoutGrid, accent: '#aab0cc', glow: '170,176,204' },
  { key: 'ia',    label: 'IA',      icon: Brain,      accent: '#818cf8', glow: '99,102,241' },
  { key: 'food',  label: 'Comida',  icon: Salad,      accent: '#34e6a0', glow: '16,217,139' },
  { key: 'sport', label: 'Deporte', icon: Dumbbell,   accent: '#fbbf24', glow: '251,146,60' },
]

interface Cell {
  date: string | null
  log?: DailyLog
  cls: string
  n: number
}

export default function HeatmapGrid({ logs, type, interactive }: Props) {
  const [active, setActive] = useState<FilterKey>('all')
  // `view` is the objective currently shown: fixed by `type` on detail pages,
  // or driven by the interactive filter chips on the homepage.
  const view: ObjectiveType | null = interactive
    ? (active === 'all' ? null : active)
    : (type ?? null)
  const cfg = view ? OBJECTIVES[view] : null
  const mode = cfg?.mode ?? null
  const metricKey: keyof DailyLog | null = view ? METRIC[view] : null
  const maxV = metricKey ? Math.max(1, ...logs.map(l => Number(l[metricKey]) || 0)) : 1
  const map = new Map(logs.map(l => [l.log_date, l]))
  const today = spainToday()
  const dates = summerDates()

  // Build week columns (Mon-first). Pad the first column with leading voids.
  const firstWeekday = (new Date(dates[0] + 'T00:00:00').getDay() + 6) % 7 // Mon=0..Sun=6
  const flat: Cell[] = []
  for (let i = 0; i < firstWeekday; i++) flat.push({ date: null, cls: 'void', n: 0 })
  for (const date of dates) {
    const log = map.get(date)
    let cls = ''
    let n = 0
    if (cfg && mode === 'progress') {
      // progress objective (IA/comida): intensity by metric magnitude
      const v = log ? Number(log[metricKey!]) || 0 : 0
      n = v
      if (log) cls = intensityLevel(view!, v, maxV) || 'off'
      else if (date < today) cls = 'empty'
      else if (date === today) cls = 'empty today'
      else cls = 'future'
    } else if (cfg) {
      // streak objective (deporte): binary completed / not
      const done = log ? Boolean(log[cfg.field]) : false
      n = done ? 1 : 0
      if (log) cls = done ? 'on' : 'off'
      else if (date < today) cls = 'empty'
      else if (date === today) cls = 'empty today'
      else cls = 'future'
    } else {
      n = log ? completedCountForLog(log) : 0
      if (log) cls = n >= 3 ? 'l3' : n === 2 ? 'l2' : n === 1 ? 'l1' : 'empty'
      else if (date < today) cls = 'empty'
      else if (date === today) cls = 'empty today'
      else cls = 'future'
    }
    if (date === today && cls.indexOf('today') === -1) cls += ' today'
    flat.push({ date, log, cls, n })
  }
  while (flat.length % 7 !== 0) flat.push({ date: null, cls: 'void', n: 0 })

  const cols: Cell[][] = []
  for (let i = 0; i < flat.length; i += 7) cols.push(flat.slice(i, i + 7))

  // Month label per column (first real day's month, shown when it changes)
  let lastMonth = -1
  const monthLabels = cols.map(col => {
    const firstReal = col.find(c => c.date)
    if (!firstReal) return ''
    const m = Number(firstReal.date!.split('-')[1]) - 1
    if (m !== lastMonth) { lastMonth = m; return MONTHS[m] }
    return ''
  })

  const [hover, setHover] = useState<{ c: Cell; x: number; y: number } | null>(null)

  // ── Side stats ──────────────────────────────────────────────
  const logged = logs.length
  let sideStats: { v: string; u?: string; k: string; cls?: string }[]
  if (cfg && mode === 'streak') {
    const done = getCompletionCount(logs, cfg.field)
    const streak = getStreak(logs, cfg.field)
    const best = getBestStreak(logs, cfg.field)
    const consist = Math.round(getConsistency(logs, cfg.field))
    sideStats = [
      { v: String(done), u: ' / 75', k: 'días cumplidos', cls: 'accent' },
      { v: String(streak), k: 'racha actual', cls: 'accent' },
      { v: String(best), k: 'mejor racha' },
      { v: String(consist), u: '%', k: 'consistencia' },
    ]
  } else if (cfg) {
    const activeDays = getActiveDays(logs, view!)
    const avg = getMetricAvg(logs, view!)
    const bestDay = getBestDay(logs, view!)
    const unit = view === 'food' ? '★' : view === 'ia' ? 'h' : 'min'
    sideStats = [
      { v: String(activeDays), u: ' / 75', k: 'días activos', cls: 'accent' },
      { v: String(avg), k: view === 'food' ? 'nota media' : `media ${unit}/día`, cls: 'accent' },
      { v: bestDay ? String(bestDay.value) : '—', k: 'mejor día' },
      view === 'food'
        ? { v: String(logs.filter(l => (l.food_rating ?? 0) >= 4).length), k: 'días ≥4★' }
        : { v: String(getMetricTotal(logs, view!)), k: 'horas totales' },
    ]
  } else {
    const perfect = logs.filter(l => completedCountForLog(l) === 3).length
    const bestStreak = Math.max(
      getBestStreak(logs, 'ia_completed'),
      getBestStreak(logs, 'food_completed'),
      getBestStreak(logs, 'sport_completed'),
    )
    const totalCompletions =
      getCompletionCount(logs, 'ia_completed') +
      getCompletionCount(logs, 'food_completed') +
      getCompletionCount(logs, 'sport_completed')
    const consistAvg = logged > 0 ? Math.round((totalCompletions / (logged * 3)) * 100) : 0
    sideStats = [
      { v: String(logged), u: ' / 75', k: 'días registrados', cls: 'indigo' },
      { v: String(perfect), k: 'días perfectos (3/3)', cls: 'green' },
      { v: String(bestStreak), k: 'mejor racha', cls: 'amber' },
      { v: String(consistAvg), u: '%', k: 'consistencia media' },
    ]
  }

  const accentVars = cfg
    ? ({ ['--heat-accent' as string]: cfg.accent2, ['--heat-glow' as string]: cfg.glow } as React.CSSProperties)
    : undefined

  return (
    <div className="heat-panel" style={accentVars}>
      <div className="heat-main">
        {interactive && (
          <div className="heat-filters" role="tablist" aria-label="Filtrar por objetivo">
            {FILTERS.map(f => {
              const FIcon = f.icon
              const on = active === f.key
              return (
                <button
                  key={f.key}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  className={`heat-chip${on ? ' on' : ''}`}
                  style={{ ['--chip' as string]: f.accent, ['--chip-glow' as string]: f.glow }}
                  onClick={() => setActive(f.key)}
                >
                  {on && (
                    <motion.span
                      layoutId="heat-chip-pill"
                      className="heat-chip-pill"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <FIcon size={14} strokeWidth={2.2} />
                  <span>{f.label}</span>
                </button>
              )
            })}
          </div>
        )}
        <div className="heat-months" style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0,1fr))` }}>
          {monthLabels.map((m, i) => (
            <span key={i} className="heat-month">{m}</span>
          ))}
        </div>
        <div className="heat-body">
          <div className="heat-wdays">
            {WD.map((d, i) => <span key={i} className="wd">{d}</span>)}
          </div>
          <div className="heat-grid" style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0,1fr))`, aspectRatio: `${cols.length} / 7` }}>
            {flat.map((cell, i) => (
              <motion.div
                key={i}
                className={`cell ${cell.cls}`}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.004, 0.6) }}
                onMouseEnter={e => cell.date && setHover({ c: cell, x: e.clientX, y: e.clientY })}
                onMouseMove={e => cell.date && setHover(h => h && { ...h, x: e.clientX, y: e.clientY })}
                onMouseLeave={() => setHover(null)}
              />
            ))}
          </div>
        </div>
        <div className="heat-legend">
          {!cfg ? (
            <>
              <span>Menos</span>
              <div className="lg-cells">
                <span className="lg cell empty" />
                <span className="lg cell l1" />
                <span className="lg cell l2" />
                <span className="lg cell l3" />
              </div>
              <span>Más · color = objetivos cumplidos ese día</span>
            </>
          ) : mode === 'streak' ? (
            <>
              <span>Sin cumplir</span>
              <div className="lg-cells">
                <span className="lg cell off" />
                <span className="lg cell on" />
              </div>
              <span>Cumplido · {cfg.label.toLowerCase()}</span>
            </>
          ) : (
            <>
              <span>Menos</span>
              <div className="lg-cells">
                <span className="lg cell empty" />
                <span className="lg cell i1" />
                <span className="lg cell i2" />
                <span className="lg cell i3" />
              </div>
              <span>Más · {view === 'food' ? 'mejor nota del día' : 'más horas'}</span>
            </>
          )}
        </div>
      </div>

      <div className="heat-side">
        {sideStats.map((s, i) => (
          <div key={i} className="hs-stat">
            <div className={`hs-v ${s.cls ?? ''}`}>{s.v}{s.u && <span className="u">{s.u}</span>}</div>
            <div className="hs-k">{s.k}</div>
          </div>
        ))}
      </div>

      {hover && hover.c.date && (
        <div
          style={{
            position: 'fixed', left: hover.x + 14, top: hover.y - 8, zIndex: 50,
            pointerEvents: 'none', maxWidth: 260,
            background: 'rgba(10,12,24,0.96)', border: '1px solid rgba(255,255,255,0.16)',
            borderRadius: 12, padding: '10px 12px', backdropFilter: 'blur(10px)',
            boxShadow: '0 20px 50px -20px rgba(0,0,0,0.9)',
          }}
        >
          <Tooltip cell={hover.c} type={view ?? undefined} />
        </div>
      )}
    </div>
  )
}

function Tooltip({ cell, type }: { cell: Cell; type?: ObjectiveType }) {
  const date = cell.date!
  const [, m, d] = date.split('-').map(Number)
  const wd = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][new Date(date + 'T00:00:00').getDay()]
  const log = cell.log
  const lines = [
    { key: 'ia' as const,    on: !!log?.ia_completed,    c: '#818cf8', k: 'IA',      v: log?.ia_hours ? `${log.ia_hours}h` : '' },
    { key: 'food' as const,  on: !!log?.food_completed,  c: '#34e6a0', k: 'Comida',  v: log?.food_rating ? `${log.food_rating}★` : '' },
    { key: 'sport' as const, on: !!log?.sport_completed, c: '#fbbf24', k: 'Deporte', v: log?.sport_minutes ? `${log.sport_minutes}min` : '' },
  ].filter(l => !type || l.key === type)

  return (
    <div style={{ fontFamily: 'var(--mono)' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#f4f5fb', marginBottom: log ? 7 : 0 }}>
        {wd} {d} {MONTHS[m - 1]}
      </div>
      {!log ? (
        <div style={{ fontSize: 11, color: '#8088a8' }}>
          {date > spainToday() ? 'Día futuro' : 'Sin registro'}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 4, fontSize: 11.5 }}>
          {lines.map(l => <Line key={l.k} on={l.on} c={l.c} k={l.k} v={l.v} />)}
        </div>
      )}
    </div>
  )
}

function Line({ on, c, k, v }: { on: boolean; c: string; k: string; v: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: on ? '#cfd3ea' : '#5a6080' }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: on ? c : '#33384e', boxShadow: on ? `0 0 7px ${c}` : 'none' }} />
      <span style={{ flex: 1 }}>{k}</span>
      <span style={{ color: on ? c : '#5a6080' }}>{on ? '✓' : '·'} {v}</span>
    </div>
  )
}
