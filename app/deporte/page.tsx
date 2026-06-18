import { getAllLogs } from '@/lib/supabase'
import ObjectiveDetail from '@/components/ObjectiveDetail'

export const revalidate = 0

export default async function DeportePage() {
  const logs = await getAllLogs()
  return <ObjectiveDetail type="sport" logs={logs} />
}
