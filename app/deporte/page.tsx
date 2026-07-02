import type { Metadata } from 'next'
import { getAllLogs } from '@/lib/supabase'
import SportRoadmap from '@/components/SportRoadmap'

export const revalidate = 0
export const metadata: Metadata = { title: 'Deporte' }

export default async function DeportePage() {
  const logs = await getAllLogs()
  return (
    <>
      <SportRoadmap logs={logs} />
      <div className="foot-wrap"><div className="footer">SIRI · VERANO 2026 — 18 JUN → 1 SEP · datos en vivo desde Supabase</div></div>
    </>
  )
}
