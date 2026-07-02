'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dumbbell, Activity, Timer, Flame, ChevronRight, X, Check,
} from 'lucide-react'
import type { DailyLog } from '@/types'
import { getStreak, weekdayShort, formatLogDateFull, formatLogDateLong } from '@/lib/utils'
import { useDialog } from './useDialog'

const EASE = [0.16, 1, 0.3, 1] as const

function fmtMin(t: number) {
  const h = Math.floor(t / 60), m = t % 60
  return h ? `${h}h ${m ? `${m}m` : ''}`.trim() : `${m} min`
}

export default function SportRoadmap({ logs }: { logs: DailyLog[] }) {
  const [open, setOpen] = useState<string | null>(null)
  useDialog(open !== null, () => setOpen(null))

  const days = logs
    .filter(l => (l.sport_entry && l.sport_entry.trim()) || l.sport_minutes > 0)
    .sort((a, b) => (a.log_date < b.log_date ? 1 : -1))

  // Nunca una página en negro: sin sesiones, la bitácora se presenta igualmente.
  if (!days.length) {
    return (
      <section className="air is-sport">
        <div className="air-head">
          <span className="air-kicker"><Dumbbell size={13} /> Bitácora de entreno</span>
          <h2 className="air-title">Cada sesión, <em>registrada</em>.</h2>
          <p className="air-sub">Todo el movimiento del verano, día a día.</p>
        </div>
        <div className="empty-state">
          Todavía no hay sesiones registradas. Cuéntame tu próximo entreno y aparecerá aquí. 🏋️
        </div>
      </section>
    )
  }

  const sessions = days.length
  const totalMin = days.reduce((s, l) => s + (l.sport_minutes || 0), 0)
  const avgMin = sessions ? Math.round(totalMin / sessions) : 0
  const streak = getStreak(logs, 'sport_completed')

  const openLog = open ? days.find(d => d.log_date === open) ?? null : null

  const stats = [
    { icon: Activity, v: String(sessions), k: sessions === 1 ? 'sesión' : 'sesiones' },
    { icon: Timer, v: fmtMin(totalMin), k: 'en total' },
    { icon: Dumbbell, v: String(avgMin), k: 'min/sesión' },
    { icon: Flame, v: String(streak), k: 'racha' },
  ]

  return (
    <section className="air is-sport">
      <div className="air-head">
        <span className="air-kicker"><Dumbbell size={13} /> Bitácora de entreno</span>
        <h2 className="air-title">Cada sesión, <em>registrada</em>.</h2>
        <p className="air-sub">Todo el movimiento del verano, día a día. Toca un día para ver el detalle.</p>
      </div>

      <div className="air-stats air-stats-4">
        {stats.map(({ icon: Icon, v, k }) => (
          <div key={k} className="air-stat">
            <Icon size={16} />
            <b>{v}</b>
            <span>{k}</span>
          </div>
        ))}
      </div>

      <div className="air-track">
        {days.map((l, i) => (
          <motion.button
            key={l.log_date}
            type="button"
            className="air-node aird-day"
            onClick={() => setOpen(l.log_date)}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, delay: Math.min(i * 0.04, 0.3), ease: EASE }}
          >
            <span className="air-dot"><Dumbbell size={11} /></span>
            <div className="aird-day-card">
              <div className="aird-day-top">
                <span className="aird-day-date">{formatLogDateFull(l.log_date)}</span>
                <span className="aird-day-go">Ver detalle <ChevronRight size={14} /></span>
              </div>
              <div className="aird-chips">
                <span className="aird-chip">{l.sport_entry || 'Sesión registrada'}</span>
              </div>
              <div className="aird-day-meta">
                {l.sport_minutes > 0 ? `${l.sport_minutes} min` : 'sin minutos'}
                {l.sport_completed ? ' · ✓ hecho' : ''}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {open && openLog && (
          <motion.div
            className="aird-overlay"
            onClick={() => setOpen(null)}
            role="dialog" aria-modal="true" aria-label={`Sesión de deporte · ${formatLogDateLong(open)}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="aird-modal"
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, y: 26, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.38, ease: EASE }}
            >
              <button className="aird-close" onClick={() => setOpen(null)} aria-label="Cerrar"><X size={18} /></button>
              <span className="air-kicker"><Dumbbell size={13} /> Sesión de deporte</span>
              <h3 className="aird-modal-title">{formatLogDateLong(open)}</h3>
              <p className="aird-modal-sub">{weekdayShort(open)}</p>
              <div className="aird-modal-list">
                <article className="air-card">
                  <header className="air-card-top">
                    <div className="air-tags">
                      <span className={`air-status ${openLog.sport_completed ? 'ok' : 'no'}`}>
                        {openLog.sport_completed ? <><Check size={12} /> Completado</> : 'Sin completar'}
                      </span>
                    </div>
                    {openLog.sport_minutes > 0 && (
                      <span className="air-score smid">{openLog.sport_minutes}<i>min</i></span>
                    )}
                  </header>
                  <h3 className="air-topic">{openLog.sport_entry || 'Sesión de deporte'}</h3>
                  {openLog.notes && <p className="air-summary">{openLog.notes}</p>}
                </article>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
