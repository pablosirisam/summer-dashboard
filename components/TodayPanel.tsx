import type { DailyLog } from '@/types'

interface Props { log: DailyLog | null; today: string }

export default function TodayPanel({ log, today }: Props) {
  const [y, m, d] = today.split('-').map(Number)
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep']
  const label = `${d} ${months[m - 1]} ${y}`

  return (
    <div className="today-wrap">
      <div className="today-date-label">{label}</div>
      {!log ? (
        <div className="today-empty">
          <span className="today-pending">Sin registrar</span>
          <span className="today-hint">Dile a Borja qué has hecho hoy y lo guardará aquí automáticamente.</span>
        </div>
      ) : (
        <div className="today-grid">
          <TodayEntry
            emoji="🧠" label="IA"
            done={log.ia_completed}
            text={log.ia_entry}
            extra={log.ia_hours ? `${log.ia_hours}h` : null}
          />
          <TodayEntry
            emoji="🥗" label="Alimentación"
            done={log.food_completed}
            text={log.food_entry}
            extra={log.food_rating ? '★'.repeat(log.food_rating) + '☆'.repeat(5 - log.food_rating) : null}
          />
          <TodayEntry
            emoji="🏃" label="Deporte"
            done={log.sport_completed}
            text={log.sport_entry}
            extra={log.sport_minutes ? `${log.sport_minutes} min` : null}
          />
        </div>
      )}
      {log?.notes && <p className="today-notes">{log.notes}</p>}
    </div>
  )
}

function TodayEntry({ emoji, label, done, text, extra }: {
  emoji: string; label: string; done: boolean; text: string | null; extra: string | null
}) {
  return (
    <div className={`t-entry${done ? ' done' : ''}`}>
      <div className="t-head">
        <span className="t-emoji">{emoji}</span>
        <span className="t-label">{label}</span>
        {done && <span className="t-check">✓</span>}
      </div>
      {text ? <p className="t-text">{text}</p> : <p className="t-text muted">—</p>}
      {extra && <span className="t-extra">{extra}</span>}
    </div>
  )
}
