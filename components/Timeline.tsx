'use client'

import { motion } from 'framer-motion'
import { Brain, Salad, Dumbbell, StickyNote, type LucideIcon } from 'lucide-react'
import type { DailyLog, ObjectiveType } from '@/types'
import { formatLogDate, weekdayShort, completedCountForLog } from '@/lib/utils'

interface Props { logs: DailyLog[]; type?: ObjectiveType }

interface RowCfg {
  key: ObjectiveType
  icon: LucideIcon; color: string; glow: string
  entry: keyof DailyLog; done: keyof DailyLog
  tag: (l: DailyLog) => string
}

const ROWS: RowCfg[] = [
  { key: 'ia',    icon: Brain,    color: '#818cf8', glow: '99,102,241',  entry: 'ia_entry',    done: 'ia_completed',    tag: l => l.ia_hours ? `${l.ia_hours}h` : '' },
  { key: 'food',  icon: Salad,    color: '#34e6a0', glow: '16,217,139',  entry: 'food_entry',  done: 'food_completed',  tag: l => l.food_rating ? `${l.food_rating}★` : '' },
  { key: 'sport', icon: Dumbbell, color: '#fbbf24', glow: '251,146,60',  entry: 'sport_entry', done: 'sport_completed', tag: l => l.sport_minutes ? `${l.sport_minutes}min` : '' },
]

export default function Timeline({ logs, type }: Props) {
  const rows = type ? ROWS.filter(r => r.key === type) : ROWS
  const single = Boolean(type)

  let items = [...logs].sort((a, b) => b.log_date.localeCompare(a.log_date))
  if (type) {
    const row = ROWS.find(r => r.key === type)!
    items = items.filter(l => (l[row.entry] as string | null) || l[row.done])
  }

  if (!items.length) {
    return <div className="empty-state">El registro {single ? 'de este objetivo' : 'diario'} aparecerá aquí en cuanto empieces a reportar tus días.</div>
  }

  return (
    <div className="timeline">
      {items.map((log, i) => {
        const n = completedCountForLog(log)
        let node: string, nodeGlow: string
        if (single) {
          const r = rows[0]
          const on = Boolean(log[r.done])
          node = on ? r.color : '#697089'
          nodeGlow = on ? r.glow : '105,112,137'
        } else {
          node = n >= 3 ? '#34e6a0' : n === 2 ? '#fbbf24' : n === 1 ? '#818cf8' : '#697089'
          nodeGlow = n >= 3 ? '16,217,139' : n === 2 ? '251,146,60' : n === 1 ? '99,102,241' : '105,112,137'
        }
        return (
          <motion.div
            key={log.id ?? log.log_date}
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
                {single ? (
                  <div className="tl-score">
                    {rows[0].tag(log) && <span className="tl-tag" style={{ ['--rc' as string]: rows[0].color, ['--rc-glow' as string]: rows[0].glow }}>{rows[0].tag(log)}</span>}
                    <span className={`tl-badge${log[rows[0].done] ? ' on' : ''}`} style={{ ['--rc' as string]: rows[0].color, ['--rc-glow' as string]: rows[0].glow }}>
                      {log[rows[0].done] ? '✓ hecho' : 'pendiente'}
                    </span>
                  </div>
                ) : (
                  <div className="tl-score">
                    <div className="tl-dots">
                      <span className={`tl-dot ia${log.ia_completed ? ' on' : ''}`} />
                      <span className={`tl-dot food${log.food_completed ? ' on' : ''}`} />
                      <span className={`tl-dot sport${log.sport_completed ? ' on' : ''}`} />
                    </div>
                    <span className="tl-frac">{n}/3</span>
                  </div>
                )}
              </div>

              <div className="tl-rows">
                {rows.map((r, ri) => {
                  const Icon = r.icon
                  const text = (log[r.entry] as string | null) ?? '—'
                  const on = Boolean(log[r.done])
                  const tag = r.tag(log)
                  return (
                    <div key={ri} className={`tl-row${single ? ' solo' : ''}`} style={{ ['--rc' as string]: r.color, ['--rc-glow' as string]: r.glow }}>
                      <span className="tl-ic"><Icon size={15} strokeWidth={2} /></span>
                      <span className={`tl-txt${on ? '' : ' off'}`}>{text}</span>
                      {!single && tag && <span className="tl-tag">{tag}</span>}
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
  )
}
