'use client'

import { motion } from 'framer-motion'
import {
  GraduationCap, Trophy, PlayCircle, Flag, Star, Layers, CalendarDays,
} from 'lucide-react'
import type { AiProgress } from '@/types'

const EASE = [0.16, 1, 0.3, 1] as const

function fmtDate(d: string) {
  const [y, m, day] = d.split('-').map(Number)
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  return `${day} ${months[(m ?? 1) - 1]}`
}

export default function AiRoadmap({ items }: { items: AiProgress[] }) {
  const lessons = items.filter(i => i.kind === 'lesson')
  const milestones = items.filter(i => i.kind === 'milestone')
  const scored = lessons.filter(i => i.score != null)
  const avgScore = scored.length
    ? (scored.reduce((s, i) => s + (i.score ?? 0), 0) / scored.length)
    : 0
  const tiers = Array.from(new Set(lessons.map(i => i.tier).filter(Boolean)))
  const days = new Set(items.map(i => i.learned_on)).size

  const stats = [
    { icon: PlayCircle, v: String(lessons.length), k: 'conceptos' },
    { icon: Trophy, v: String(milestones.length), k: 'hitos' },
    { icon: Star, v: scored.length ? avgScore.toFixed(1) : '—', k: 'nota media' },
    { icon: Layers, v: String(tiers.length), k: 'tiers' },
    { icon: CalendarDays, v: String(days), k: days === 1 ? 'día' : 'días' },
  ]

  if (!items.length) return null

  return (
    <section className="air">
      <div className="air-head">
        <span className="air-kicker"><GraduationCap size={13} /> Ruta de aprendizaje</span>
        <h2 className="air-title">Dominando la IA, <em>construyendo</em>.</h2>
        <p className="air-sub">
          Cada concepto entendido y cada decisión de diseño del proyecto, registrado.
          No vídeos vistos — conceptos <b>demostrados</b>.
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
        {items.map((it, i) => {
          const milestone = it.kind === 'milestone'
          return (
            <motion.article
              key={it.id}
              className={`air-node${milestone ? ' is-milestone' : ''}`}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: Math.min(i * 0.04, 0.3), ease: EASE }}
            >
              <span className="air-dot">
                {milestone ? <Flag size={12} /> : <PlayCircle size={12} />}
              </span>

              <div className="air-card">
                <header className="air-card-top">
                  <div className="air-tags">
                    {it.tier && <span className="air-tier">{it.tier}</span>}
                    {milestone && <span className="air-mile">Hito</span>}
                    <span className="air-date">{fmtDate(it.learned_on)}</span>
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
              </div>
            </motion.article>
          )
        })}
      </div>
    </section>
  )
}
