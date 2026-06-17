import type { DailyLog } from '@/types'
import { formatLogDate } from '@/lib/utils'

interface Props { logs: DailyLog[] }

export default function RecentFeed({ logs }: Props) {
  const recent = logs.slice(0, 14)

  if (!recent.length) {
    return (
      <div className="feed-wrap">
        <p className="feed-empty">El historial aparecerá aquí cuando empieces a reportar.</p>
      </div>
    )
  }

  return (
    <div className="feed-wrap">
      {recent.map(log => {
        const score = [log.ia_completed, log.food_completed, log.sport_completed].filter(Boolean).length
        return (
          <div key={log.id} className="feed-row">
            <span className="feed-date">{formatLogDate(log.log_date)}</span>
            <div className="feed-pills">
              <Pill emoji="🧠" done={log.ia_completed}
                text={log.ia_entry?.slice(0, 55) ?? '—'}
                extra={log.ia_hours ? `${log.ia_hours}h` : ''} />
              <Pill emoji="🥗" done={log.food_completed}
                text={log.food_entry?.slice(0, 40) ?? '—'}
                extra={log.food_rating ? `${log.food_rating}★` : ''} />
              <Pill emoji="🏃" done={log.sport_completed}
                text={log.sport_entry?.slice(0, 40) ?? '—'}
                extra={log.sport_minutes ? `${log.sport_minutes}min` : ''} />
            </div>
            <span className={`feed-score s${score}`}>{score}/3</span>
          </div>
        )
      })}
    </div>
  )
}

function Pill({ emoji, done, text, extra }: {
  emoji: string; done: boolean; text: string; extra: string
}) {
  return (
    <div className={`pill${done ? ' done' : ''}`}>
      <span className="pill-e">{emoji}</span>
      <span className="pill-t">{text}</span>
      {extra && <span className="pill-x">{extra}</span>}
    </div>
  )
}
