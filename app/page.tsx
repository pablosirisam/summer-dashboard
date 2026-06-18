import { Sparkles, Target, CalendarRange, Activity } from 'lucide-react'
import { getAllLogs } from '@/lib/supabase'
import {
  getDaysRemaining, getDaysElapsed, getSummerProgress,
  TOTAL_DAYS, spainToday,
} from '@/lib/utils'
import Countdown from '@/components/Countdown'
import ObjectiveCard from '@/components/ObjectiveCard'
import HeatmapGrid from '@/components/HeatmapGrid'
import Timeline from '@/components/Timeline'

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
  const progress = getSummerProgress()

  return (
    <>
      <div className="aurora"><div className="aurora-blob" /></div>
      <div className="grid-overlay" />

      <main className="page">
        <div className="topbar">
          <div className="brand">
            <div className="brand-mark"><Sparkles size={20} strokeWidth={2.2} /></div>
            <div>
              <div className="brand-name">Siri · Verano</div>
              <div className="brand-sub">IA · Alimentación · Deporte</div>
            </div>
          </div>
          <div className="topdate"><span className="live-dot" />{dateLabel}</div>
        </div>

        <Countdown remaining={remaining} total={TOTAL_DAYS} elapsed={elapsed} progress={progress} />

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
          <span className="sec-title"><span className="ic"><CalendarRange size={15} /></span>Summer Map</span>
          <span className="sec-line" />
        </div>
        <HeatmapGrid logs={logs} />

        <div className="sec-head">
          <span className="sec-title"><span className="ic"><Activity size={15} /></span>Registro diario</span>
          <span className="sec-line" />
        </div>
        <Timeline logs={logs} />

        <div className="footer">SIRI · VERANO 2026 — 18 JUN → 1 SEP · datos en vivo desde Supabase</div>
      </main>
    </>
  )
}
