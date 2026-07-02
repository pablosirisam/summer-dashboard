import type { Metadata } from 'next'
import { CalendarRange, Activity } from 'lucide-react'
import { getAllLogs } from '@/lib/supabase'
import { completedCountForLog } from '@/lib/utils'
import Timeline from '@/components/Timeline'

export const revalidate = 0
export const metadata: Metadata = { title: 'Historial' }

export default async function HistorialPage() {
  const logs = await getAllLogs()

  const logged = logs.length
  const perfect = logs.filter(l => completedCountForLog(l) === 3).length
  const totalCheck = logs.reduce((s, l) => s + completedCountForLog(l), 0)

  return (
    <main className="detail">
      <div className="hist-head">
        <div className="hist-id">
          <div className="hist-icon"><CalendarRange size={26} strokeWidth={2} /></div>
          <div>
            <div className="hist-tag">REGISTRO COMPLETO</div>
            <h1 className="hist-title">Tu verano, día a día</h1>
          </div>
        </div>
        <div className="hist-stats">
          <div className="hist-stat"><b>{logged}</b><span>días registrados</span></div>
          <div className="hist-stat"><b>{perfect}</b><span>días perfectos</span></div>
          <div className="hist-stat"><b>{totalCheck}</b><span>objetivos ✓</span></div>
        </div>
      </div>

      <div className="sec-head">
        <span className="sec-title"><span className="ic"><Activity size={15} /></span>Registro diario</span>
        <span className="sec-line" />
      </div>
      <Timeline logs={logs} />

      <div className="footer">SIRI · VERANO 2026 — 18 JUN → 1 SEP · datos en vivo desde Supabase</div>
    </main>
  )
}
