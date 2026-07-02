import type { Metadata } from 'next'
import { getAllLogs, getAiProgress } from '@/lib/supabase'
import ObjectiveDetail from '@/components/ObjectiveDetail'
import AiRoadmap from '@/components/AiRoadmap'

export const revalidate = 0
export const metadata: Metadata = { title: 'IA' }

export default async function IaPage() {
  const [logs, progress] = await Promise.all([getAllLogs(), getAiProgress()])
  return (
    <>
      <ObjectiveDetail type="ia" logs={logs} />
      <AiRoadmap items={progress} />
      <div className="foot-wrap"><div className="footer">SIRI · VERANO 2026 — 18 JUN → 1 SEP · datos en vivo desde Supabase</div></div>
    </>
  )
}
