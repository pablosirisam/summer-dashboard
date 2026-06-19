'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap, Trophy, PlayCircle, Flag, Star, Layers, CalendarDays,
  ChevronRight, X,
} from 'lucide-react'
import type { AiProgress } from '@/types'

const EASE = [0.16, 1, 0.3, 1] as const
const MON = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const MON_FULL = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

function fmtDate(d: string) {
  const [, m, day] = d.split('-').map(Number)
  return `${day} ${MON[(m ?? 1) - 1]}`
}
function fmtDateFull(d: string) {
  const [y, m, day] = d.split('-').map(Number)
  return `${day} de ${MON_FULL[(m ?? 1) - 1]} de ${y}`
}
function avgOf(rows: AiProgress[]) {
  const s = rows.filter(r => r.score != null)
  return s.length ? s.reduce((a, r) => a + (r.score ?? 0), 0) / s.length : null
}

function ProgressCard({ it }: { it: AiProgress }) {
  const milestone = it.kind === 'milestone'
  return (
    <article className={`air-card${milestone ? ' is-milestone' : ''}`}>
      <header className="air-card-top">
        <div className="air-tags">
          {it.tier && <span className="air-tier">{it.tier}</span>}
          {milestone && <span className="air-mile">Hito</span>}
        </div>
        {it.score != null && (
          <span className={`air-score s${it.score >= 8 ? 'hi' : it.score >= 6 ? 'mid' : 'lo'}`}>
            {it.score}<i>/10</i>
          </span>
        )}
      </header>
      <h3 className="air-topic">{it.topic}</h3>
      {it.summary && <p className="air-summary">{it.summary}</p>}
      {it.resource && (
        it.resource_url
          ? <a className="air-res" href={it.resource_url} target="_blank" rel="noopener noreferrer">
              <PlayCircle size={13} /> {it.resource}
            </a>
          : <span className="air-res air-res-static">{it.resource}</span>
      )}
    </article>
  )
}

export default function AiRoadmap({ items }: { items: AiProgress[] }) {
  const [openDay, setOpenDay] = useState<string | null>(null)

  if (!items.length) return null

  const lessons = items.filter(i => i.kind === 'lesson')
  const milestones = items.filter(i => i.kind === 'milestone')
  const scored = lessons.filter(i => i.score != null)
  const avgScore = scored.length ? (scored.reduce((s, i) => s + (i.score ?? 0), 0) / scored.length) : 0
  const tiers = Array.from(new Set(lessons.map(i => i.tier).filter(Boolean)))

  // group by day, most-recent first
  const byDay = new Map<string, AiProgress[]>()
  for (const it of items) {
    if (!byDay.has(it.learned_on)) byDay.set(it.learned_on, [])
    byDay.get(it.learned_on)!.push(it)
  }
  const days = Array.from(byDay.keys()).sort((a, b) => (a < b ? 1 : -1))
  const openItems = openDay ? (byDay.get(openDay) ?? []) : []

  const stats = [
    { icon: PlayCircle, v: String(lessons.length), k: 'conceptos' },
    { icon: Trophy, v: String(milestones.length), k: 'hitos' },
    { icon: Star, v: scored.length ? avgScore.toFixed(1) : '—', k: 'nota media' },
    { icon: Layers, v: String(tiers.length), k: 'tiers' },
    { icon: CalendarDays, v: String(days.length), k: days.length === 1 ? 'día' : 'días' },
  ]

  return (
    <section className="air">
      <div className="air-head">
        <span className="air-kicker"><GraduationCap size={13} /> Ruta de aprendizaje</span>
        <h2 className="air-title">Dominando la IA, <em>construyendo</em>.</h2>
        <p className="air-sub">
          Cada concepto entendido y cada decisión de diseño, registrado.
          No vídeos vistos — conceptos <b>demostrados</b>. Toca un día para ver el detalle.
        </p>
      </div>

      <div className="air-stats">
        {stats.map(({ icon: Icon, v, k }) => (
          <div key={k} className="air-stat">
            <Icon size={16} />
            <b>{v}</b>
            <span>{k}</span>
          </div>
        ))}
      </div>

      <div className="air-track">
        {days.map((d, i) => {
          const rows = byDay.get(d)!
          const dl = rows.filter(r => r.kind === 'lesson')
          const dm = rows.filter(r => r.kind === 'milestone')
          const dAvg = avgOf(rows)
          const meta = [
            `${dl.length} concepto${dl.length === 1 ? '' : 's'}`,
            dm.length ? `${dm.length} hito${dm.length === 1 ? '' : 's'}` : null,
            dAvg != null ? `nota ${dAvg.toFixed(1)}` : null,
          ].filter(Boolean).join(' · ')

          return (
            <motion.button
              key={d}
              type="button"
              className="air-node aird-day"
              onClick={() => setOpenDay(d)}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: Math.min(i * 0.05, 0.3), ease: EASE }}
            >
              <span className="air-dot"><CalendarDays size={12} /></span>
              <div className="aird-day-card">
                <div className="aird-day-top">
                  <span className="aird-day-date">{fmtDate(d)}</span>
                  <span className="aird-day-go">Ver detalle <ChevronRight size={14} /></span>
                </div>
                <div className="aird-chips">
                  {rows.slice(0, 4).map(r => (
                    <span key={r.id} className={`aird-chip${r.kind === 'milestone' ? ' is-mile' : ''}`}>{r.topic}</span>
                  ))}
                  {rows.length > 4 && <span className="aird-chip aird-more">+{rows.length - 4}</span>}
                </div>
                <div className="aird-day-meta">{meta}</div>
              </div>
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {openDay && (
          <motion.div
            className="aird-overlay"
            onClick={() => setOpenDay(null)}
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
              <button className="aird-close" onClick={() => setOpenDay(null)} aria-label="Cerrar"><X size={18} /></button>
              <span className="air-kicker"><CalendarDays size={13} /> Sesión de IA</span>
              <h3 className="aird-modal-title">{fmtDateFull(openDay)}</h3>
              <p className="aird-modal-sub">{openItems.length} entrada{openItems.length === 1 ? '' : 's'} · lo que se aprendió y se demostró</p>
              <div className="aird-modal-list">
                {openItems.map(it => <ProgressCard key={it.id} it={it} />)}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
