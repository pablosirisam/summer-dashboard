'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { LayoutGrid, ArrowUpRight, type LucideIcon } from 'lucide-react'
import type { DailyLog, ObjectiveType } from '@/types'
import {
  summerDates, spainToday, completedCountForLog, TOTAL_DAYS,
  getBestStreak, getCompletionCount, getStreak, getConsistency,
  getActiveDays, getMetricAvg, getMetricTotal, getBestDay,
  MONTHS_ES, WEEKDAYS_ES,
} from '@/lib/utils'
import { OBJECTIVES, OBJ_ORDER } from '@/lib/objectives'

interface Props { logs: DailyLog[]; type?: ObjectiveType; interactive?: boolean }

const WD = ['Lun', '', 'Mié', '', 'Vie', '', 'Dom']

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
  { key: 'all', label: 'Todos', icon: LayoutGrid, accent: '#aab0cc', glow: '170,176,204' },
  ...OBJ_ORDER.map(t => ({
    key: t as FilterKey,
    label: OBJECTIVES[t].short,
    icon: OBJECTIVES[t].icon,
    accent: OBJECTIVES[t].accent2,
    glow: OBJECTIVES[t].glow,
  })),
]

interface Cell {
  date: string | null
  log?: DailyLog
  cls: string
  n: number
}

const TIP_W = 268

export default function HeatmapGrid({ logs, type, interactive }: Props) {
  const [active, setActive] = useState<FilterKey>('all')
  // `view` is the objective currently shown: fixed by `type` on detail pages,
  // or driven by the interactive filter chips on the homepage.
  const view: ObjectiveType | null = interactive
    ? (active === 'all' ? null : active)
    : (type ?? null)
  const cfg = view ? OBJECTIVES[view] : null
  const mode = cfg?.mode ?? null

  const today = spainToday()

  // Todo el cálculo pesado, una vez por (logs, view) — no en cada movimiento del ratón.
  const { flat, cols, monthLabels, sideStats } = useMemo(() => {
    const metricKey: keyof DailyLog | null = view ? METRIC[view] : null
    const maxV = metricKey ? Math.max(1, ...logs.map(l => Number(l[metricKey]) || 0)) : 1
    const map = new Map(logs.map(l => [l.log_date, l]))
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
      if (m !== lastMonth) { lastMonth = m; return MONTHS_ES[m] }
      return ''
    })

    // ── Side stats ──────────────────────────────────────────────
    const logged = logs.length
    let sideStats: { v: string; u?: string; k: string; cls?: string }[]
    if (cfg && mode === 'streak') {
      const done = getCompletionCount(logs, cfg.field)
      const streak = getStreak(logs, cfg.field)
      const best = getBestStreak(logs, cfg.field)
      const consist = Math.round(getConsistency(logs, cfg.field))
      sideStats = [
        { v: String(done), u: ` / ${TOTAL_DAYS}`, k: 'días cumplidos', cls: 'accent' },
        { v: String(streak), k: 'racha actual', cls: 'accent' },
        { v: String(best), k: 'mejor racha', cls: best > 0 ? 'gold' : undefined },
        { v: String(consist), u: '%', k: 'consistencia' },
      ]
    } else if (cfg) {
      const activeDays = getActiveDays(logs, view!)
      const avg = getMetricAvg(logs, view!)
      const bestDay = getBestDay(logs, view!)
      const unit = view === 'food' ? '★' : view === 'ia' ? 'h' : 'min'
      sideStats = [
        { v: String(activeDays), u: ` / ${TOTAL_DAYS}`, k: 'días activos', cls: 'accent' },
        { v: String(avg), k: view === 'food' ? 'nota media' : `media ${unit}/día`, cls: 'accent' },
        { v: bestDay ? String(bestDay.value) : '—', k: 'mejor día', cls: bestDay ? 'gold' : undefined },
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
        { v: String(logged), u: ` / ${TOTAL_DAYS}`, k: 'días registrados', cls: 'indigo' },
        { v: String(perfect), k: 'días perfectos (3/3)', cls: 'red' },
        { v: String(bestStreak), k: 'mejor racha', cls: bestStreak > 0 ? 'gold' : 'amber' },
        { v: String(consistAvg), u: '%', k: 'consistencia media' },
      ]
    }
    return { flat, cols, monthLabels, sideStats }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logs, view, today])

  // ── Tooltip: una sola celda activa en estado; posición imperativa (sin re-render) ──
  const [activeCell, setActiveCell] = useState<Cell | null>(null)
  const [pinned, setPinned] = useState(false)
  const tipRef = useRef<HTMLDivElement>(null)
  const lastIdx = useRef<number>(-1)
  const pinnedRef = useRef(false)
  pinnedRef.current = pinned

  const moveTip = (x: number, y: number) => {
    const el = tipRef.current
    if (!el) return
    const tx = Math.min(x + 14, window.innerWidth - TIP_W)
    const ty = Math.min(Math.max(y - 8, 76), window.innerHeight - 150)
    el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`
  }

  const cellFromEvent = (e: React.MouseEvent): { cell: Cell; idx: number } | null => {
    const t = (e.target as HTMLElement).closest('[data-i]') as HTMLElement | null
    if (!t) return null
    const idx = Number(t.dataset.i)
    const cell = flat[idx]
    return cell?.date ? { cell, idx } : null
  }

  const onGridMove = (e: React.MouseEvent) => {
    if (pinnedRef.current) return
    const hit = cellFromEvent(e)
    if (!hit) {
      if (lastIdx.current !== -1) { lastIdx.current = -1; setActiveCell(null) }
      return
    }
    moveTip(e.clientX, e.clientY)
    if (hit.idx !== lastIdx.current) { lastIdx.current = hit.idx; setActiveCell(hit.cell) }
  }

  const onGridLeave = () => {
    if (pinnedRef.current) return
    lastIdx.current = -1
    setActiveCell(null)
  }

  const onGridClick = (e: React.MouseEvent) => {
    const hit = cellFromEvent(e)
    if (!hit) return
    e.stopPropagation()
    moveTip(e.clientX, e.clientY)
    lastIdx.current = hit.idx
    setActiveCell(hit.cell)
    setPinned(true)
  }

  // Fijado: se cierra tocando fuera o con Escape.
  useEffect(() => {
    if (!pinned) return
    const close = (e: Event) => {
      if (tipRef.current?.contains(e.target as Node)) return
      setPinned(false)
      setActiveCell(null)
      lastIdx.current = -1
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(e) }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', onKey)
    }
  }, [pinned])

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
          <div
            className="heat-grid"
            style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0,1fr))`, aspectRatio: `${cols.length} / 7` }}
            onMouseMove={onGridMove}
            onMouseLeave={onGridLeave}
            onClick={onGridClick}
          >
            {flat.map((cell, i) => (
              <motion.div
                key={i}
                data-i={cell.date ? i : undefined}
                className={`cell ${cell.cls}`}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.004, 0.6) }}
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

      <div
        ref={tipRef}
        className={`heat-tip${activeCell ? ' show' : ''}${pinned ? ' pinned' : ''}`}
        onPointerDown={e => e.stopPropagation()}
      >
        {activeCell?.date && <Tooltip cell={activeCell} type={view ?? undefined} today={today} pinned={pinned} />}
      </div>
    </div>
  )
}

function Tooltip({ cell, type, today, pinned }: { cell: Cell; type?: ObjectiveType; today: string; pinned: boolean }) {
  const date = cell.date!
  const [, m, d] = date.split('-').map(Number)
  const wd = WEEKDAYS_ES[new Date(date + 'T00:00:00').getDay()]
  const log = cell.log
  const lines = OBJ_ORDER
    .map(t => ({
      key: t,
      on: Boolean(log?.[OBJECTIVES[t].field]),
      c: OBJECTIVES[t].accent2,
      k: OBJECTIVES[t].short,
      v: log ? TAG_FMT[t](log) : '',
    }))
    .filter(l => !type || l.key === type)

  return (
    <div className="ht-inner">
      <div className="ht-date">{wd} {d} {MONTHS_ES[m - 1]}</div>
      {!log ? (
        <div className="ht-empty">{date > today ? 'Día futuro' : 'Sin registro'}</div>
      ) : (
        <div className="ht-lines">
          {lines.map(l => (
            <div key={l.k} className={`ht-line${l.on ? ' on' : ''}`} style={{ ['--hl' as string]: l.c }}>
              <span className="ht-dot" />
              <span className="ht-k">{l.k}</span>
              <span className="ht-v">{l.on ? '✓' : '·'} {l.v}</span>
            </div>
          ))}
        </div>
      )}
      {pinned && log && (
        <Link href={`/historial#${date}`} className="ht-go">
          Ver día <ArrowUpRight size={12} strokeWidth={2.4} />
        </Link>
      )}
    </div>
  )
}

const TAG_FMT: Record<ObjectiveType, (l: DailyLog) => string> = {
  ia:    l => (l.ia_hours ? `${l.ia_hours}h` : ''),
  food:  l => (l.food_rating ? `${l.food_rating}★` : ''),
  sport: l => (l.sport_minutes ? `${l.sport_minutes}min` : ''),
}
