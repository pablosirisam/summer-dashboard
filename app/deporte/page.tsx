import { getAllLogs } from '@/lib/supabase'
import SportRoadmap from '@/components/SportRoadmap'

export const revalidate = 0

export default async function DeportePage() {
  const logs = await getAllLogs()
  return <SportRoadmap logs={logs} />
}
