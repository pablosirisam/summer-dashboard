import type { DailyLog } from '@/types'
import { SUMMER_START, SUMMER_END, cellColor } from '@/lib/utils'
import { format, startOfWeek, endOfWeek, eachWeekOfInterval, addDays, isBefore, isAfter } from 'date-fns'

interface Props { logs: DailyLog[] }

const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const LEGEND = [
  { color: '#14141f', label: 'Sin reg.' },
  { color: '#064e3b', label: '1/3' },
  { color: '#047857', label: '2/3' },
  { color: '#059669', label: '3/3' },
]

export default function HeatmapGrid({ logs }: Props) {
  const map = new Map(logs.map(l => [l.log_date, l]))
  const today = new Date()

  const calStart = startOfWeek(SUMMER_START, { weekStartsOn: 1 })
  const calEnd   = endOfWeek(SUMMER_END,   { weekStartsOn: 1 })
  const weeks    = eachWeekOfInterval({ start: calStart, end: calEnd }, { weekStartsOn: 1 })

  const grid = weeks.map(ws =>
    Array.from({ length: 7 }, (_, i) => addDays(ws, i))
  )

  return (
    <div className="heatmap-wrap">
      <div className="heatmap-inner">
        <div className="day-labels">
          {DAY_LABELS.map(d => <div key={d} className="day-lbl">{d}</div>)}
        </div>
        <div className="heatmap-cols">
          {grid.map((week, wi) => (
            <div key={wi} className="heatmap-col">
              {week.map((day, di) => {
                const inRange = !isBefore(day, SUMMER_START) && !isAfter(day, new Date(2026, 7, 31))
                if (!inRange) return <div key={di} className="hcell empty" />
                const dateStr  = format(day, 'yyyy-MM-dd')
                const isFuture = isAfter(day, today)
                const log      = map.get(dateStr)
                const bg       = cellColor(log, isFuture)
                const n        = log ? [log.ia_completed, log.food_completed, log.sport_completed].filter(Boolean).length : 0
                const title    = `${format(day, 'd MMM')}${log ? ` — ${n}/3` : isFuture ? '' : ' — sin registro'}`
                return (
                  <div
                    key={di}
                    className={`hcell${isFuture ? ' future' : ''}`}
                    style={{ background: bg }}
                    title={title}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="heatmap-legend">
        {LEGEND.map(l => (
          <div key={l.label} className="legend-item">
            <div className="legend-dot" style={{ background: l.color }} />
            <span>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
