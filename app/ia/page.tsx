import { getAllLogs } from '@/lib/supabase'
import ObjectiveDetail from '@/components/ObjectiveDetail'

export const revalidate = 0

export default async function IaPage() {
  const logs = await getAllLogs()
  return <ObjectiveDetail type="ia" logs={logs} />
}
