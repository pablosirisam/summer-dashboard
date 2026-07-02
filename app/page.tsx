import { preload } from 'react-dom'
import { Target, CalendarRange, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { getAllLogs } from '@/lib/supabase'
import {
  getDaysRemaining, getDaysElapsed, getSummerProgress, TOTAL_DAYS, spainToday,
  weekdayShort, MONTHS_ES,
} from '@/lib/utils'
import CinematicHero from '@/components/CinematicHero'
import Countdown from '@/components/Countdown'
import ObjectiveCard from '@/components/ObjectiveCard'
import HeatmapGrid from '@/components/HeatmapGrid'

export const revalidate = 0

export default async function Home() {
  // La foto del hero es el LCP: que empiece a bajar con el HTML, no tras el CSS.
  preload('/hero/summit.jpg', { as: 'image', fetchPriority: 'high' })

  const logs = await getAllLogs()

  const today = spainToday()
  const [y, m, d] = today.split('-').map(Number)
  const dateLabel = `${weekdayShort(today)} ${d} ${MONTHS_ES[m - 1]} ${y}`

  const remaining = getDaysRemaining()
  const elapsed = getDaysElapsed()
  const progress = getSummerProgress()
  const todayLog = logs.find(l => l.log_date === today) ?? null

  return (
    <>
      <CinematicHero remaining={remaining} elapsed={elapsed} total={TOTAL_DAYS} dateLabel={dateLabel} />

      <div className="overview">
        <main className="page">
          <Countdown remaining={remaining} progress={progress} todayLog={todayLog} />

          <div className="sec-head">
            <span className="sec-title"><span className="ic"><Target size={15} /></span>Objetivos del verano</span>
            <span className="sec-line" />
          </div>
          <div className="cards">
            <ObjectiveCard type="ia" logs={logs} index={0} />
            <ObjectiveCard type="food" logs={logs} index={1} />
            <ObjectiveCard type="sport" logs={logs} index={2} />
          </div>

          <div className="sec-head">
            <span className="sec-title"><span className="ic"><CalendarRange size={15} /></span>Mapa del verano</span>
            <span className="sec-line" />
          </div>
          <HeatmapGrid logs={logs} interactive />

          <Link href="/historial" className="big-link">
            <span>Ver el registro diario completo</span>
            <ArrowRight size={17} strokeWidth={2.2} />
          </Link>

          <div className="footer">SIRI · VERANO 2026 — 18 JUN → 1 SEP · datos en vivo desde Supabase</div>
        </main>
      </div>
    </>
  )
}
