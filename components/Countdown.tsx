'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

interface Props {
  remaining: number
  total: number
  elapsed: number
  progress: number
}

function useCountUp(target: number, run: boolean, ms = 1400) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!run) return
    let raf = 0
    let startTs: number | null = null
    const tick = (ts: number) => {
      if (startTs === null) startTs = ts
      const p = Math.min(1, (ts - startTs) / ms)
      // easeOutExpo
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p)
      setVal(Math.round(eased * target))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, run, ms])
  return val
}

export default function Countdown({ remaining, total, elapsed, progress }: Props) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const num = useCountUp(remaining, true)
  const pct = useCountUp(Math.round(progress), true, 1600)

  return (
    <section className="hero" ref={ref}>
      <div className="hero-beam" />
      <p className="hero-eyebrow">VERANO 2026 · <b>cuenta atrás hasta la uni</b></p>

      <div className="count-wrap">
        <motion.div
          className="count-num"
          initial={{ opacity: 0, scale: 0.92, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {num}
        </motion.div>
        <motion.p
          className="count-label"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          días de verano <b>antes de septiembre</b>
        </motion.p>
      </div>

      <div className="hero-meta">
        <span><b>{elapsed}</b> vividos</span>
        <span className="dot" />
        <span><b>{remaining}</b> por delante</span>
        <span className="dot" />
        <span><b>{total}</b> días totales</span>
      </div>

      <div className="hero-progress">
        <div className="hp-track">
          <motion.div
            className="hp-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          />
        </div>
        <div className="hp-labels">
          <span>18 JUN</span>
          <span>{pct}% transcurrido</span>
          <span>1 SEP</span>
        </div>
      </div>
    </section>
  )
}
