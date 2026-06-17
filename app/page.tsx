import { format } from 'date-fns'
import { getAllLogs } from '@/lib/supabase'
import ObjectiveCard from '@/components/ObjectiveCard'
import HeatmapGrid from '@/components/HeatmapGrid'
import TodayPanel from '@/components/TodayPanel'
import RecentFeed from '@/components/RecentFeed'
import Countdown from '@/components/Countdown'

export const revalidate = 0

export default async function Home() {
  const logs    = await getAllLogs()
  const today   = format(new Date(), 'yyyy-MM-dd')
  const todayLog = logs.find(l => l.log_date === today) ?? null

  const days = ['DOM','LUN','MAR','MIÉ','JUE','VIE','SÁB']
  const now  = new Date()
  const dateLabel = `${days[now.getDay()]} ${format(now, 'd MMM yyyy').toUpperCase()}`

  return (
    <main className="page">

      {/* Header */}
      <header className="header">
        <div className="header-left">
          <h1>SIRI / VERANO 2026</h1>
          <p>IA · Alimentación · Deporte</p>
        </div>
        <div className="header-right">
          <div className="header-date">{dateLabel}</div>
          <Countdown />
        </div>
      </header>

      {/* Objective Cards */}
      <div className="cards-grid">
        <ObjectiveCard type="ia"    logs={logs} />
        <ObjectiveCard type="food"  logs={logs} />
        <ObjectiveCard type="sport" logs={logs} />
      </div>

      {/* Today */}
      <div className="section">
        <span className="section-title">Hoy</span>
        <div className="section-line" />
      </div>
      <TodayPanel log={todayLog} today={today} />

      {/* Heatmap */}
      <div className="section">
        <span className="section-title">Summer Map</span>
        <div className="section-line" />
      </div>
      <HeatmapGrid logs={logs} />

      {/* Recent */}
      <div className="section">
        <span className="section-title">Historial</span>
        <div className="section-line" />
      </div>
      <RecentFeed logs={logs} />

    </main>
  )
}
