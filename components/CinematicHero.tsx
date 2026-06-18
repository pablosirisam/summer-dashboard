'use client'

import { motion } from 'framer-motion'
import { Brain, Salad, Dumbbell } from 'lucide-react'

interface Props {
  remaining: number
  elapsed: number
  total: number
  dateLabel: string
}

const EASE = [0.16, 1, 0.3, 1] as const

export default function CinematicHero({ remaining, elapsed, total, dateLabel }: Props) {
  // The signature: every day of the summer as a tick. Spent / today / left.
  const bars = Array.from({ length: total }, (_, i) => {
    if (i < elapsed) return 'spent'
    if (i === elapsed) return 'today'
    return 'left'
  })
  const pctLeft = Math.round((remaining / total) * 100)

  return (
    <section className="cine">
      <div className="hero-wrap">
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <span className="tick" /> Verano 2026 · 18 jun → 01 sep · <b>el parte</b>
        </motion.p>

        <motion.h1
          className="hero-h1"
          initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
        >
          Un verano que se <em>gasta</em>.
        </motion.h1>

        <motion.p
          className="hero-lead"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.25 }}
        >
          {total} días tuyos antes de la uni. La cuenta corre sola — lo único que decides
          es qué dejas escrito en cada uno: <b>IA</b>, <b>alimentación</b> y <b>deporte</b>.
        </motion.p>

        <motion.div
          className="hero-readout"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <span className="ro-now"><span className="ro-live" /> {dateLabel}</span>
          <span>
            <span className="ro-big">{remaining}</span>
            <span className="ro-big-u">días por delante · {elapsed} ya gastados</span>
          </span>
        </motion.div>

        {/* ── 75-day strip ── */}
        <motion.div
          className="strip"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.5 }}
        >
          <div className="strip-head">
            <span>Mapa del verano · 1 barra = 1 día</span>
            <span><b>{pctLeft}%</b> restante</span>
          </div>
          <div className="strip-bars" aria-hidden>
            {bars.map((cls, i) => (
              <motion.span
                key={i}
                className={`tickbar ${cls}`}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.4, delay: 0.55 + Math.min(i * 0.006, 0.5), ease: EASE }}
              />
            ))}
          </div>
          <div className="strip-foot">
            <span>18 jun · arranque</span>
            <span>01 sep · uni</span>
          </div>
        </motion.div>

        {/* ── three disciplines ── */}
        <motion.div
          className="hero-tri"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
        >
          <div className="tri" style={triVars('217, 164, 65', 'var(--ia-2)')}>
            <span className="tri-k"><Brain size={13} strokeWidth={2.2} /> Inteligencia artificial</span>
            <span className="tri-v">Construir<span>cada día</span></span>
          </div>
          <div className="tri" style={triVars('127, 169, 107', 'var(--food-2)')}>
            <span className="tri-k"><Salad size={13} strokeWidth={2.2} /> Alimentación</span>
            <span className="tri-v">Comer<span>con criterio</span></span>
          </div>
          <div className="tri" style={triVars('210, 98, 74', 'var(--sport-2)')}>
            <span className="tri-k"><Dumbbell size={13} strokeWidth={2.2} /> Deporte</span>
            <span className="tri-v">Moverse<span>sin excusas</span></span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function triVars(glow: string, color: string): React.CSSProperties {
  return { ['--tglow' as string]: glow, ['--tc' as string]: color }
}
