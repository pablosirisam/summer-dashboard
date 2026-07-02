import { cache } from 'react'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { DailyLog, Meal, AiProgress } from '@/types'

let client: SupabaseClient | null = null

export function getSupabase() {
  return (client ??= createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ))
}

// cache() dedupes per request: layout (ticker) + page share one query.
// Errors THROW so the branded error.tsx shows — a Supabase outage must not
// render as an empty summer of zeros.
export const getAllLogs = cache(async (): Promise<DailyLog[]> => {
  const { data, error } = await getSupabase()
    .from('daily_logs')
    .select('*')
    .order('log_date', { ascending: false })
  if (error) throw new Error(`daily_logs: ${error.message}`)
  return (data ?? []) as DailyLog[]
})

export const getMeals = cache(async (): Promise<Meal[]> => {
  const { data, error } = await getSupabase()
    .from('meals')
    .select('*')
    .order('meal_time', { ascending: false })
  if (error) throw new Error(`meals: ${error.message}`)
  return (data ?? []) as Meal[]
})

export const getAiProgress = cache(async (): Promise<AiProgress[]> => {
  const { data, error } = await getSupabase()
    .from('ai_progress')
    .select('*')
    .order('learned_on', { ascending: true })
    .order('sort_order', { ascending: true })
  if (error) throw new Error(`ai_progress: ${error.message}`)
  return (data ?? []) as AiProgress[]
})
