import { differenceInDays, format, subDays } from 'date-fns'
import type { DailyLog } from '@/types'

export const SUMMER_START = new Date(2026, 5, 18)   // Jun 18
export const SUMMER_END   = new Date(2026, 8, 1)    // Sep 1
export const TOTAL_DAYS   = differenceInDays(SUMMER_END, SUMMER_START) // 75

export function getDaysElapsed(): number {
  const d = differenceInDays(new Date(), SUMMER_START) + 1
  return Math.max(1, Math.min(d, TOTAL_DAYS))
}

export function getDaysRemaining(): number {
  return Math.max(0, differenceInDays(SUMMER_END, new Date()))
}

export function getSummerProgress(): number {
  return (getDaysElapsed() / TOTAL_DAYS) * 100
}

export function getStreak(
  logs: DailyLog[],
  field: 'ia_completed' | 'food_completed' | 'sport_completed'
): number {
  const map = new Map(logs.map(l => [l.log_date, l]))
  const today = format(new Date(), 'yyyy-MM-dd')
  let streak = 0
  let start = map.has(today) ? 0 : 1  // grace: today not logged yet → start from yesterday

  for (let i = start; i < TOTAL_DAYS; i++) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd')
    const log = map.get(date)
    if (!log || !log[field]) break
    streak++
  }
  return streak
}

export function getBestStreak(
  logs: DailyLog[],
  field: 'ia_completed' | 'food_completed' | 'sport_completed'
): number {
  const sorted = [...logs].sort((a, b) => a.log_date.localeCompare(b.log_date))
  let best = 0, cur = 0
  for (const log of sorted) {
    if (log[field]) { cur++; best = Math.max(best, cur) } else cur = 0
  }
  return best
}

export function getCompletionCount(
  logs: DailyLog[],
  field: 'ia_completed' | 'food_completed' | 'sport_completed'
): number {
  return logs.filter(l => l[field]).length
}

export function getTotalIaHours(logs: DailyLog[]): number {
  return logs.reduce((s, l) => s + (l.ia_hours || 0), 0)
}

export function getTotalSportMinutes(logs: DailyLog[]): number {
  return logs.reduce((s, l) => s + (l.sport_minutes || 0), 0)
}

export function formatLogDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  return `${d} ${months[m - 1]}`
}

export function cellColor(log: DailyLog | undefined, isFuture: boolean): string {
  if (isFuture) return 'transparent'
  if (!log) return '#14141f'
  const n = [log.ia_completed, log.food_completed, log.sport_completed].filter(Boolean).length
  if (n === 3) return '#059669'
  if (n === 2) return '#047857'
  if (n === 1) return '#064e3b'
  return '#1e1e2f'
}
