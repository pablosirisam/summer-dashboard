import { getAllLogs } from '@/lib/supabase'
import ObjectiveDetail from '@/components/ObjectiveDetail'

export const revalidate = 0

export default async function AlimentacionPage() {
  const logs = await getAllLogs()
  return <ObjectiveDetail type="food" logs={logs} />
}
