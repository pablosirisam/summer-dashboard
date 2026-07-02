'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown } from 'lucide-react'

interface Props {
  remaining: number
  elapsed: number
  total: number
  dateLabel: string
}

const EASE = [0.16, 1, 0.3, 1] as const

export default function CinematicHero({ remaining, elapsed, total, dateLabel }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  // Layered parallax — slow ken-burns zoom + depth offsets
  const skyY      = useTransform(scrollYProgress, [0, 1], ['0%', '22%'])
  const skyScale  = useTransform(scrollYProgress, [0, 1], [1.14, 1.34])
  const ridgeY    = useTransform(scrollYProgress, [0, 1], ['0%', '-16%'])
  const gradeOp   = useTransform(scrollYProgress, [0, 1], [0.6, 0.95])
  const contentY  = useTransform(scrollYProgress, [0, 1], ['0%', '-34%'])
  const contentOp = useTransform(scrollYProgress, [0, 0.55], [1, 0])
  const cueOp     = useTransform(scrollYProgress, [0, 0.15], [1, 0])

  return (
    <section className="cine" ref={ref}>
      <div className="cine-sticky">
        {/* Back layer — summit at first light, slow zoom (the climb) */}
        <motion.div className="cine-layer cine-sky" style={{ y: skyY, scale: skyScale }} />
        {/* Second depth layer — clouds drift */}
        <motion.div className="cine-layer cine-ridge" style={{ y: ridgeY }} />

        {/* Colour grade + cinematic vignette + grain */}
        <motion.div className="cine-grade" style={{ opacity: gradeOp }} />
        <div className="cine-vignette" />
        <div className="cine-grain" />

        {/* Foreground copy */}
        <motion.div className="cine-content" style={{ y: contentY, opacity: contentOp }}>
          <motion.p
            className="cine-eyebrow"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
          >
            <span className="cine-dot" /> {dateLabel} · día {Math.min(elapsed + 1, total)} de {total}
          </motion.p>

          <h1 className="cine-title">
            <motion.span
              initial={{ opacity: 0, y: 36, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.1, ease: EASE, delay: 0.35 }}
            >
              Un verano
            </motion.span>
            <motion.span
              className="cine-hl"
              initial={{ opacity: 0, y: 40, filter: 'blur(12px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.2, ease: EASE, delay: 0.55 }}
            >
              para superarte
            </motion.span>
          </h1>

          <motion.p
            className="cine-sub"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 0.85 }}
          >
            {total} días para invertir en <b>IA</b>, <b>alimentación</b> y <b>deporte</b>.
            El activo más caro es el tiempo — aquí queda contabilizado, día a día.
          </motion.p>

          <motion.div
            className="cine-stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 1.05 }}
          >
            <div className="cine-stat">
              <span className="cine-stat-v">{remaining}</span>
              <span className="cine-stat-k">días por delante</span>
            </div>
            <span className="cine-sep" />
            <div className="cine-stat">
              <span className="cine-stat-v">{elapsed}</span>
              <span className="cine-stat-k">ya invertidos</span>
            </div>
            <span className="cine-sep" />
            <div className="cine-stat">
              <span className="cine-stat-v">{total}</span>
              <span className="cine-stat-k">capital total</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div className="cine-cue" style={{ opacity: cueOp }}>
          <span>El parte</span>
          <motion.span
            className="cine-cue-ic"
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowDown size={16} strokeWidth={2.4} />
          </motion.span>
        </motion.div>
      </div>
    </section>
  )
}
