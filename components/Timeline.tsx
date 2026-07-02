'use client'

import { motion } from 'framer-motion'
import { StickyNote } from 'lucide-react'
import { differenceInDays } from 'date-fns'
import type { DailyLog, ObjectiveType } from '@/types'
import { OBJECTIVES, OBJ_ORDER } from '@/lib/objectives'
import {
  SUMMER_START, formatLogDate, formatLogDateFull, weekdayShort,
  completedCountForLog, getTotalIaHours, getAvgFoodRating,
} from '@/lib/utils'

interface Props { logs: DailyLog[] }

const TAGS: Record<ObjectiveType, (l: DailyLog) => string> = {
  ia:    l => (l.ia_hours ? `${l.ia_hours}h` : ''),
  food:  l => (l.food_rating ? `${l.food_rating}★` : ''),
  sport: l => (l.sport_minutes ? `${l.sport_minutes}min` : ''),
}

const ROWS = OBJ_ORDER.map(t => ({
  key: t,
  icon: OBJECTIVES[t].icon,
  color: OBJECTIVES[t].accent2,
  glow: OBJECTIVES[t].glow,
  entry: OBJECTIVES[t].entry,
  done: OBJECTIVES[t].field,
  tag: TAGS[t],
}))

/** Semana del verano (1-based, bloques de 7 días desde el 18 jun). */
function summerWeek(dateStr: string): number {
  return Math.floor(differenceInDays(new Date(dateStr + 'T00:00:00'), SUMMER_START) / 7) + 1
}

function weekSummary(weekLogs: DailyLog[]): string {
  const perfect = weekLogs.filter(l => completedCountForLog(l) === 3).length
  const ia = getTotalIaHours(weekLogs)
  const sport = weekLogs.filter(l => l.sport_completed).length
  const food = getAvgFoodRating(weekLogs)
  const parts = [
    perfect ? `${perfect} perfecto${perfect === 1 ? '' : 's'}` : null,
    ia ? `${ia}h IA` : null,
    sport ? `${sport} entreno${sport === 1 ? '' : 's'}` : null,
    food ? `${food}★ media` : null,
  ].filter(Boolean)
  return parts.length ? parts.join(' · ') : 'semana sin registros completos'
}

export default function Timeline({ logs }: Props) {
  const items = [...logs].sort((a, b) => b.log_date.localeCompare(a.log_date))

  if (!items.length) {
    return <div className="empty-state">El registro diario aparecerá aquí en cuanto empieces a reportar tus días.</div>
  }

  // Agrupar por semana del verano, la más reciente primero.
  const weeks: { n: number; logs: DailyLog[] }[] = []
  for (const log of items) {
    const n = summerWeek(log.log_date)
    const last = weeks[weeks.length - 1]
    if (last && last.n === n) last.logs.push(log)
    else weeks.push({ n, logs: [log] })
  }
  const currentWeek = summerWeek(items[0].log_date)

  return (
    <div className="tl-weeks">
      {weeks.map(week => {
        const first = week.logs[week.logs.length - 1]
        const last = week.logs[0]
        const range = first.log_date === last.log_date
          ? formatLogDateFull(first.log_date)
          : `${formatLogDateFull(first.log_date)} – ${formatLogDateFull(last.log_date)}`
        return (
          <div key={week.n} className="tl-week">
            <div className="tl-week-head">
              <span className="tl-week-title">
                Semana {week.n}
                {week.n === currentWeek && <em> · en curso</em>}
              </span>
              <span className="tl-week-range">{range}</span>
              <span className="sec-line" />
              <span className="tl-week-sum">{weekSummary(week.logs)}</span>
            </div>
            <div className="timeline">
              {week.logs.map((log, i) => {
                const n = completedCountForLog(log)
                const node = n >= 3 ? OBJECTIVES.food.accent2 : n === 2 ? OBJECTIVES.sport.accent2 : n === 1 ? OBJECTIVES.ia.accent2 : '#697089'
                const nodeGlow = n >= 3 ? OBJECTIVES.food.glow : n === 2 ? OBJECTIVES.sport.glow : n === 1 ? OBJECTIVES.ia.glow : '105,112,137'
                return (
                  <motion.div
                    key={log.id ?? log.log_date}
                    id={log.log_date}
                    className="tl-item"
                    initial={{ opacity: 0, x: -18 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.45, delay: Math.min(i * 0.04, 0.4), ease: [0.16, 1, 0.3, 1] }}
                  >
                    <span className="tl-node" style={{ ['--node' as string]: node, ['--node-glow' as string]: nodeGlow }} />
                    <div className="tl-card">
                      <div className="tl-top">
                        <div className="tl-date">
                          <span className="tl-day">{formatLogDate(log.log_date)}</span>
                          <span className="tl-wd">{weekdayShort(log.log_date)}</span>
                        </div>
                        <div className="tl-score">
                          <div className="tl-dots">
                            <span className={`tl-dot ia${log.ia_completed ? ' on' : ''}`} />
                            <span className={`tl-dot food${log.food_completed ? ' on' : ''}`} />
                            <span className={`tl-dot sport${log.sport_completed ? ' on' : ''}`} />
                          </div>
                          <span className="tl-frac">{n}/3</span>
                        </div>
                      </div>

                      <div className="tl-rows">
                        {ROWS.map((r, ri) => {
                          const Icon = r.icon
                          const text = (log[r.entry] as string | null) ?? '—'
                          const on = Boolean(log[r.done])
                          const tag = r.tag(log)
                          return (
                            <div key={ri} className="tl-row" style={{ ['--rc' as string]: r.color, ['--rc-glow' as string]: r.glow }}>
                              <span className="tl-ic"><Icon size={15} strokeWidth={2} /></span>
                              <span className={`tl-txt${on ? '' : ' off'}`}>{text}</span>
                              {tag && <span className="tl-tag">{tag}</span>}
                            </div>
                          )
                        })}
                      </div>

                      {log.notes && (
                        <div className="tl-notes"><StickyNote size={13} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />{log.notes}</div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
