import type { Metadata } from 'next'
import { getMeals } from '@/lib/supabase'
import { spainToday } from '@/lib/utils'
import FoodLog from '@/components/FoodLog'

export const revalidate = 0
export const metadata: Metadata = { title: 'Alimentación' }

export default async function AlimentacionPage() {
  const meals = await getMeals()
  return <FoodLog meals={meals} today={spainToday()} />
}
