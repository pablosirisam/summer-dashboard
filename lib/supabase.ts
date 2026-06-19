import { createClient } from '@supabase/supabase-js'
import type { DailyLog, Meal, AiProgress } from '@/types'

export function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function getAllLogs(): Promise<DailyLog[]> {
  const { data } = await getSupabase()
    .from('daily_logs')
    .select('*')
    .order('log_date', { ascending: false })
  return (data ?? []) as DailyLog[]
}

export async function getMeals(): Promise<Meal[]> {
  const { data } = await getSupabase()
    .from('meals')
    .select('*')
    .order('meal_time', { ascending: false })
  return (data ?? []) as Meal[]
}

export async function getAiProgress(): Promise<AiProgress[]> {
  const { data } = await getSupabase()
    .from('ai_progress')
    .select('*')
    .order('learned_on', { ascending: true })
    .order('sort_order', { ascending: true })
  return (data ?? []) as AiProgress[]
}
