import { getMeals } from '@/lib/supabase'
import FoodLog from '@/components/FoodLog'

export const revalidate = 0

export default async function AlimentacionPage() {
  const meals = await getMeals()
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Madrid' }) // yyyy-MM-dd
  return <FoodLog meals={meals} today={today} />
}
