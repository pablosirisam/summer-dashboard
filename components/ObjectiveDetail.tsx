'use client'

import { motion } from 'framer-motion'
import { Brain, Salad, Dumbbell, Flame, Check, Minus, TrendingUp, TrendingDown, Calendar, Award, CalendarRange, type LucideIcon } from 'lucide-react'
import type { DailyLog } from '@/types'
import EvolutionChart from './EvolutionChart'
import HeatmapGrid from './HeatmapGrid'
import {
  type ObjType, getSeries, getMetricTotal, getMetricAvg, getBestDay,
  getStreak, getBestStreak, getCompletionCount, getConsistency,
  getActiveDays, getMetricTrend,
  completedField, formatLogDateFull, weekdayShort,
} from '@/lib/utils'

interface Props { type: ObjType; logs: DailyLog[] }

const EASE = [0.16, 1, 0.3, 1] as const

const CFG: Record<ObjType, {
  label: string; tag: string; icon: LucideIcon
  accent: string; accent2: string; glow: string; unit: string
  yMax?: number
}> = {
  ia:    { label: 'Inteligencia Artificial', tag: 'Horas de trabajo real',  icon: Brain,    accent: '#6366f1', accent2: '#818cf8', glow: '99,102,241',  unit: 'h' },
  food:  { label: 'Alimentación',            tag: 'Calidad de la dieta',    icon: Salad,    accent: '#10d98b', accent2: '#34e6a0', glow: '16,217,139',  unit: '★', yMax: 5 },
  sport: { label: 'Deporte',                 tag: 'Minutos en movimiento',  icon: Dumbbell, accent: '#fb923c', accent2: '#fbbf24', glow: '251,146,60',  unit: 'min' },
}

export default function ObjectiveDetail({ type, logs }: Props) {
  const c = CFG[type]
  const Icon = c.icon
  const field = completedField(type)

  const isStreak = type === 'sport'
  const series = getSeries(logs, type)
  const done = getCompletionCount(logs, field)
  const streak = getStreak(logs, field)
  const best = getBestStreak(logs, field)
  const consist = Math.round(getConsistency(logs, field))
  const avg = getMetricAvg(logs, type)
  const bestDay = getBestDay(logs, type)
  const activeDays = getActiveDays(logs, type)
  const trend = getMetricTrend(logs, type)

  // Headline metric + stat formatting per objective
  let headline = '', headlineUnit = '', avgLabel = '', bestLabel = ''
  if (type === 'ia') {
    headline = String(getMetricTotal(logs, type)); headlineUnit = 'horas'
    avgLabel = `${avg} h / día activo`
    bestLabel = bestDay ? `${bestDay.value}h` : '—'
  } else if (type === 'food') {
    headline = avg.toFixed(1); headlineUnit = '/ 5 media'
    avgLabel = `${getCompletionCount(logs, 'food_completed')} comidas sanas`
    bestLabel = bestDay ? `${bestDay.value}★` : '—'
  } else {
    const m = getMetricTotal(logs, type)
    headline = `${Math.floor(m / 60)}h ${Math.round(m % 60)}`; headlineUnit = 'min totales'
    avgLabel = `${avg} min / sesión`
    bestLabel = bestDay ? `${bestDay.value}min` : '—'
  }

  const TrendIcon = trend?.dir === 'up' ? TrendingUp : trend?.dir === 'down' ? TrendingDown : Minus
  // Deporte → constancia (binario). IA → evolución (seguimiento para mejorar).
  const stats = isStreak
    ? [
        { icon: Check,      v: `${done}`,     k: 'días completados', sub: `de ${logs.length} registrados` },
        { icon: Flame,      v: `${streak}`,   k: 'racha actual',     sub: streak === best && best > 0 ? '¡tu mejor racha!' : `máxima: ${best}` },
        { icon: TrendingUp, v: `${consist}%`, k: 'constancia',       sub: avgLabel },
        { icon: Award,      v: bestLabel,     k: 'mejor día',        sub: bestDay ? formatLogDateFull(bestDay.date) : '—' },
      ]
    : [
        { icon: Calendar,   v: `${activeDays}`,   k: 'días activos',  sub: `de ${logs.length} registrados` },
        { icon: TrendingUp, v: `${avg}${c.unit}`, k: 'media por día', sub: 'cuando te pones a ello' },
        { icon: TrendIcon,  v: trend ? `${trend.pct > 0 ? '+' : ''}${trend.pct}%` : '—', k: 'tendencia', sub: trend ? 'últimos 7 días vs. previos' : 'aún sin datos' },
        { icon: Award,      v: bestLabel,         k: 'mejor sesión',  sub: bestDay ? formatLogDateFull(bestDay.date) : '—' },
      ]

  const items = [...series].reverse()

  return (
    <main className="detail" style={{ ['--accent' as string]: c.accent, ['--accent-2' as string]: c.accent2, ['--accent-glow' as string]: c.glow }}>
      {/* Header */}
      <motion.div className="dt-head"
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}>
        <div className="dt-head-glow" />
        <div className="dt-id">
          <div className="dt-icon"><Icon size={26} strokeWidth={2} /></div>
          <div>
            <div className="dt-tag">{c.tag}</div>
            <h1 className="dt-title">{c.label}</h1>
          </div>
        </div>
        <div className="dt-headline">
          <span className="dt-big">{headline}</span>
          <span className="dt-big-u">{headlineUnit}</span>
        </div>
      </motion.div>

      {/* Stat grid */}
      <div className="dt-stats">
        {stats.map((s, i) => {
          const SIcon = s.icon
          return (
            <motion.div key={i} className="dt-stat"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.07, ease: EASE }}>
              <div className="dt-stat-ic"><SIcon size={16} strokeWidth={2.2} /></div>
              <div className="dt-stat-v">{s.v}</div>
              <div className="dt-stat-k">{s.k}</div>
              <div className="dt-stat-sub">{s.sub}</div>
            </motion.div>
          )
        })}
      </div>

      {/* Chart */}
      <motion.section className="dt-panel"
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6, ease: EASE }}>
        <div className="dt-panel-head">
          <span className="dt-panel-title"><TrendingUp size={15} /> Evolución</span>
          <span className="dt-panel-note">{series.length} días · {c.tag.toLowerCase()}</span>
        </div>
        <EvolutionChart data={series} accent={c.accent2} glow={c.glow} unit={c.unit === '★' ? '★' : c.unit} yMax={c.yMax} />
      </motion.section>

      {/* Filtered heatmap */}
      <div className="sec-head">
        <span className="sec-title"><span className="ic"><CalendarRange size={15} /></span>{isStreak ? 'Mapa de constancia' : 'Mapa de intensidad'}</span>
        <span className="sec-line" />
      </div>
      <HeatmapGrid logs={logs} type={type} />

      {/* Chronological history — hidden on IA & Deporte (replaced by their roadmaps) */}
      {type !== 'ia' && type !== 'sport' && (
        <>
          <div className="sec-head">
            <span className="sec-title"><span className="ic"><Calendar size={15} /></span>Historial completo</span>
            <span className="sec-line" />
          </div>
          <div className="dt-log">
            {items.map((p, i) => (
              <motion.div key={p.date} className={`dt-row${p.completed ? ' done' : ''}`}
                initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.025, 0.4), ease: EASE }}>
                <div className="dt-row-date">
                  <span className="dt-row-d">{formatLogDateFull(p.date)}</span>
                  <span className="dt-row-wd">{weekdayShort(p.date)}</span>
                </div>
                <div className="dt-row-check">
                  {p.completed ? <Check size={14} strokeWidth={3} /> : <Minus size={14} strokeWidth={3} />}
                </div>
                <div className="dt-row-entry">{p.entry ?? '—'}</div>
                <div className="dt-row-metric">{p.value > 0 ? `${p.value}${c.unit === 'min' ? ' min' : c.unit}` : '—'}</div>
              </motion.div>
            ))}
            {!items.length && <div className="empty-state">Todavía no hay registros para este objetivo.</div>}
          </div>
        </>
      )}
    </main>
  )
}
