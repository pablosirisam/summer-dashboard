'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { DailyLog } from '@/types'
import {
  summerDates, spainToday, completedCountForLog,
  getBestStreak, getCompletionCount,
} from '@/lib/utils'

interface Props { logs: DailyLog[] }

const WD = ['Lun', '', 'Mié', '', 'Vie', '', 'Dom']
const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

interface Cell {
  date: string | null
  log?: DailyLog
  cls: string
  n: number
}

export default function HeatmapGrid({ logs }: Props) {
  const map = new Map(logs.map(l => [l.log_date, l]))
  const today = spainToday()
  const dates = summerDates()

  // Build week columns (Mon-first). Pad the first column with leading voids.
  const firstWeekday = (new Date(dates[0] + 'T00:00:00').getDay() + 6) % 7 // Mon=0..Sun=6
  const flat: Cell[] = []
  for (let i = 0; i < firstWeekday; i++) flat.push({ date: null, cls: 'void', n: 0 })
  for (const date of dates) {
    const log = map.get(date)
    const n = log ? completedCountForLog(log) : 0
    let cls = ''
    if (log) cls = n >= 3 ? 'l3' : n === 2 ? 'l2' : n === 1 ? 'l1' : 'empty'
    else if (date < today) cls = 'empty'
    else if (date === today) cls = 'empty today'
    else cls = 'future'
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

  // Side stats
  const logged = logs.length
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

  return (
    <div className="heat-panel">
      <div className="heat-main">
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
          <span>Menos</span>
          <div className="lg-cells">
            <span className="lg cell empty" />
            <span className="lg cell l1" />
            <span className="lg cell l2" />
            <span className="lg cell l3" />
          </div>
          <span>Más · color = objetivos cumplidos ese día</span>
        </div>
      </div>

      <div className="heat-side">
        <div className="hs-stat"><div className="hs-v indigo">{logged}<span className="u"> / 75</span></div><div className="hs-k">días registrados</div></div>
        <div className="hs-stat"><div className="hs-v green">{perfect}</div><div className="hs-k">días perfectos (3/3)</div></div>
        <div className="hs-stat"><div className="hs-v amber">{bestStreak}</div><div className="hs-k">mejor racha</div></div>
        <div className="hs-stat"><div className="hs-v">{consistAvg}<span className="u">%</span></div><div className="hs-k">consistencia media</div></div>
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
          <Tooltip cell={hover.c} />
        </div>
      )}
    </div>
  )
}

function Tooltip({ cell }: { cell: Cell }) {
  const date = cell.date!
  const [, m, d] = date.split('-').map(Number)
  const wd = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][new Date(date + 'T00:00:00').getDay()]
  const log = cell.log
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
          <Line on={log.ia_completed}    c="#818cf8" k="IA"      v={log.ia_hours ? `${log.ia_hours}h` : ''} />
          <Line on={log.food_completed}  c="#34e6a0" k="Comida"  v={log.food_rating ? `${log.food_rating}★` : ''} />
          <Line on={log.sport_completed} c="#fbbf24" k="Deporte" v={log.sport_minutes ? `${log.sport_minutes}min` : ''} />
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
