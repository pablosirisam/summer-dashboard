import { Target, CalendarRange, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { getAllLogs } from '@/lib/supabase'
import {
  getDaysRemaining, getDaysElapsed, TOTAL_DAYS, spainToday,
} from '@/lib/utils'
import CinematicHero from '@/components/CinematicHero'
import ObjectiveCard from '@/components/ObjectiveCard'
import HeatmapGrid from '@/components/HeatmapGrid'

export const revalidate = 0

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const WDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export default async function Home() {
  const logs = await getAllLogs()

  const today = spainToday()
  const [y, m, d] = today.split('-').map(Number)
  const wd = WDAYS[new Date(today + 'T00:00:00').getDay()]
  const dateLabel = `${wd} ${d} ${MONTHS[m - 1]} ${y}`

  const remaining = getDaysRemaining()
  const elapsed = getDaysElapsed()

  return (
    <>
      <CinematicHero remaining={remaining} elapsed={elapsed} total={TOTAL_DAYS} dateLabel={dateLabel} />

      <div className="overview">
        <main className="page">
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
