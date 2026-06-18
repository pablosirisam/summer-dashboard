'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import type { SeriesPoint } from '@/lib/utils'

interface Props {
  data: SeriesPoint[]
  accent: string       // hex
  glow: string         // "r,g,b"
  unit: string         // "h" | "★" | "min"
  yMax?: number        // optional fixed max (e.g. 5 for ratings)
}

const W = 760
const H = 230
const PAD = { t: 22, r: 16, b: 30, l: 30 }

export default function EvolutionChart({ data, accent, glow, unit, yMax }: Props) {
  const [hover, setHover] = useState<number | null>(null)

  const { pts, area, line, max, gx } = useMemo(() => {
    const n = data.length
    const innerW = W - PAD.l - PAD.r
    const innerH = H - PAD.t - PAD.b
    const max = yMax ?? Math.max(1, ...data.map(d => d.value)) * 1.12
    const x = (i: number) => PAD.l + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW)
    const y = (v: number) => PAD.t + innerH - (Math.min(v, max) / max) * innerH
    const pts = data.map((d, i) => ({ ...d, cx: x(i), cy: y(d.value), i }))
    const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.cx.toFixed(1)} ${p.cy.toFixed(1)}`).join(' ')
    const area = pts.length
      ? `${line} L ${pts[pts.length - 1].cx.toFixed(1)} ${PAD.t + innerH} L ${pts[0].cx.toFixed(1)} ${PAD.t + innerH} Z`
      : ''
    // gridlines
    const niceStep = (mx: number) => {
      const raw = mx / 4
      const pow = Math.pow(10, Math.floor(Math.log10(raw || 1)))
      const n = raw / pow
      const step = (n >= 5 ? 5 : n >= 2 ? 2 : n >= 1 ? 1 : 0.5) * pow
      return step || 1
    }
    const step = niceStep(max)
    const lines = Math.floor(max / step + 0.001) + 1
    const gx = Array.from({ length: lines }, (_, i) => {
      const v = i * step
      return { y: PAD.t + innerH - (v / max) * innerH, v: Math.round(v * 10) / 10 }
    })
    return { pts, area, line, max, gx }
  }, [data, yMax])

  if (!data.length) {
    return <div className="empty-state">Aún no hay datos para graficar.</div>
  }

  const id = `grad-${glow.replace(/[^0-9]/g, '')}`
  const hp = hover != null ? pts[hover] : null

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" preserveAspectRatio="none"
        onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.42" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </linearGradient>
        </defs>

        {gx.map((g, i) => (
          <g key={i}>
            <line x1={PAD.l} x2={W - PAD.r} y1={g.y} y2={g.y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <text x={PAD.l - 6} y={g.y + 3} textAnchor="end" className="chart-axis">{g.v}</text>
          </g>
        ))}

        <motion.path d={area} fill={`url(#${id})`}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }} />
        <motion.path d={line} fill="none" stroke={accent} strokeWidth="2.4"
          strokeLinejoin="round" strokeLinecap="round"
          style={{ filter: `drop-shadow(0 4px 10px rgba(${glow},0.5))` }}
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} />

        {pts.map((p) => (
          <g key={p.i}>
            <rect
              x={p.cx - (W - PAD.l - PAD.r) / Math.max(1, data.length) / 2}
              y={PAD.t} width={(W - PAD.l - PAD.r) / Math.max(1, data.length)} height={H - PAD.t - PAD.b}
              fill="transparent" onMouseEnter={() => setHover(p.i)} />
            <motion.circle
              cx={p.cx} cy={p.cy} r={hover === p.i ? 5.5 : 3}
              fill={p.completed ? accent : '#0a0c1a'}
              stroke={accent} strokeWidth="2"
              style={{ filter: hover === p.i ? `drop-shadow(0 0 8px rgba(${glow},0.9))` : 'none' }}
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 + p.i * 0.02 }} />
          </g>
        ))}

        {hp && (
          <line x1={hp.cx} x2={hp.cx} y1={PAD.t} y2={H - PAD.b}
            stroke={accent} strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
        )}
      </svg>

      {hp && (
        <div className="chart-tip" style={{
          left: `${(hp.cx / W) * 100}%`,
          ['--c' as string]: accent,
        }}>
          <b>{hp.value}{unit}</b>
          <i>{fmt(hp.date)}</i>
        </div>
      )}
    </div>
  )
}

function fmt(d: string) {
  const [, m, day] = d.split('-').map(Number)
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  return `${day} ${months[m - 1]}`
}
