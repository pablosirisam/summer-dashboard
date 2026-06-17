import type { DailyLog } from '@/types'
import {
  getStreak, getBestStreak, getCompletionCount,
  getDaysElapsed, getTotalIaHours, getTotalSportMinutes, formatLogDate
} from '@/lib/utils'

interface Props { type: 'ia' | 'food' | 'sport'; logs: DailyLog[] }

const CFG = {
  ia:    { label: 'IA',            emoji: '🧠', field: 'ia_completed'    as const, cls: 'card-ia' },
  food:  { label: 'Alimentación',  emoji: '🥗', field: 'food_completed'  as const, cls: 'card-food' },
  sport: { label: 'Deporte',       emoji: '🏃', field: 'sport_completed' as const, cls: 'card-sport' },
}

export default function ObjectiveCard({ type, logs }: Props) {
  const cfg      = CFG[type]
  const streak   = getStreak(logs, cfg.field)
  const best     = getBestStreak(logs, cfg.field)
  const done     = getCompletionCount(logs, cfg.field)
  const elapsed  = getDaysElapsed()
  const rate     = elapsed > 0 ? Math.round((done / elapsed) * 100) : 0

  const extra =
    type === 'ia'    ? `${getTotalIaHours(logs).toFixed(1)} h totales` :
    type === 'sport' ? `${Math.floor(getTotalSportMinutes(logs) / 60)}h ${getTotalSportMinutes(logs) % 60}min totales` :
                       `${logs.filter(l => (l.food_rating ?? 0) >= 4).length} días 4-5★`

  const lastLog = logs.find(l =>
    type === 'ia'    ? l.ia_entry :
    type === 'food'  ? l.food_entry :
                       l.sport_entry
  )
  const lastText = lastLog
    ? (type === 'ia' ? lastLog.ia_entry : type === 'food' ? lastLog.food_entry : lastLog.sport_entry)
    : null

  return (
    <div className={`card ${cfg.cls}`}>
      <div className="card-header">
        <div className="card-title">
          <span className="card-emoji">{cfg.emoji}</span>
          <span className="card-label">{cfg.label}</span>
        </div>
        <div className={`streak-badge${streak > 0 ? ' active' : ''}`}>
          {streak > 0 ? '🔥' : '·'} {streak}d
        </div>
      </div>

      <div className="card-stats">
        <div className="stat">
          <span className="stat-val">{done}/{elapsed}</span>
          <span className="stat-key">días</span>
        </div>
        <div className="stat">
          <span className="stat-val">{rate}%</span>
          <span className="stat-key">ratio</span>
        </div>
        <div className="stat">
          <span className="stat-val">{best}</span>
          <span className="stat-key">best</span>
        </div>
      </div>

      <div className="card-extra">{extra}</div>

      {lastLog && lastText && (
        <div className="card-last">
          <span className="last-date">{formatLogDate(lastLog.log_date)}</span>
          <span className="last-text">{lastText}</span>
        </div>
      )}
    </div>
  )
}
