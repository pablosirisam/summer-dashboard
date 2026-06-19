import { getAllLogs, getAiProgress } from '@/lib/supabase'
import ObjectiveDetail from '@/components/ObjectiveDetail'
import AiRoadmap from '@/components/AiRoadmap'

export const revalidate = 0

export default async function IaPage() {
  const [logs, progress] = await Promise.all([getAllLogs(), getAiProgress()])
  return (
    <>
      <ObjectiveDetail type="ia" logs={logs} />
      <AiRoadmap items={progress} />
    </>
  )
}
