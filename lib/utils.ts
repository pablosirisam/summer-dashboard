import { differenceInDays, format, subDays, addDays } from 'date-fns'
import type { DailyLog } from '@/types'

// ── Summer window ──────────────────────────────────────────────
// Summer = the days you "own" before uni starts again.
// Jun 18 2026 (inclusive) → Aug 31 2026 (inclusive) = 75 days.
// Uni starts Sep 1 2026. differenceInDays(Sep 1, Jun 18) === 75, which MUST
// equal the number of heatmap cells AND the big countdown on day one.
// (Fixes the old 74/75 off-by-one.)
export const SUMMER_START = new Date(2026, 5, 18) // Jun 18 2026
export const UNI_START    = new Date(2026, 8, 1)  // Sep 1 2026
export const TOTAL_DAYS   = differenceInDays(UNI_START, SUMMER_START) // 75

export type CompletedField = 'ia_completed' | 'food_completed' | 'sport_completed'

/** Today in Spain (CEST, UTC+2) as a yyyy-MM-dd string. */
export function spainToday(): string {
  const now = new Date()
  const spain = new Date(now.getTime() + 2 * 60 * 60 * 1000)
  return format(spain, 'yyyy-MM-dd')
}

/** Days left until uni (Sep 1). On Jun 18 → 75. Counts today as a remaining day. */
export function getDaysRemaining(): number {
  const today = new Date(spainToday() + 'T00:00:00')
  return Math.max(0, Math.min(TOTAL_DAYS, differenceInDays(UNI_START, today)))
}

/** Days already gone (0 on the first day). daysRemaining + daysElapsed = TOTAL_DAYS. */
export function getDaysElapsed(): number {
  return TOTAL_DAYS - getDaysRemaining()
}

export function getSummerProgress(): number {
  return (getDaysElapsed() / TOTAL_DAYS) * 100
}

/** Every date of the summer, Jun 18 → Aug 31, as yyyy-MM-dd (length === TOTAL_DAYS). */
export function summerDates(): string[] {
  return Array.from({ length: TOTAL_DAYS }, (_, i) =>
    format(addDays(SUMMER_START, i), 'yyyy-MM-dd')
  )
}

/** Current streak counting back from today (grace: today unlogged doesn't break it). */
export function getStreak(logs: DailyLog[], field: CompletedField): number {
  const map = new Map(logs.map(l => [l.log_date, l]))
  const today = spainToday()
  const start = map.has(today) ? 0 : 1
  let streak = 0
  const base = new Date(today + 'T00:00:00')
  for (let i = start; i < TOTAL_DAYS; i++) {
    const date = format(subDays(base, i), 'yyyy-MM-dd')
    const log = map.get(date)
    if (!log || !log[field]) break
    streak++
  }
  return streak
}

export function getBestStreak(logs: DailyLog[], field: CompletedField): number {
  const sorted = [...logs].sort((a, b) => a.log_date.localeCompare(b.log_date))
  let best = 0, cur = 0
  for (const log of sorted) {
    if (log[field]) { cur++; best = Math.max(best, cur) } else cur = 0
  }
  return best
}

export function getCompletionCount(logs: DailyLog[], field: CompletedField): number {
  return logs.filter(l => l[field]).length
}

/** Consistency = completed days / days actually logged (0..100). */
export function getConsistency(logs: DailyLog[], field: CompletedField): number {
  if (logs.length === 0) return 0
  return (getCompletionCount(logs, field) / logs.length) * 100
}

export function getTotalIaHours(logs: DailyLog[]): number {
  return Math.round(logs.reduce((s, l) => s + (Number(l.ia_hours) || 0), 0) * 10) / 10
}

export function getTotalSportMinutes(logs: DailyLog[]): number {
  return logs.reduce((s, l) => s + (Number(l.sport_minutes) || 0), 0)
}

export function getAvgFoodRating(logs: DailyLog[]): number {
  const rated = logs.filter(l => l.food_rating != null)
  if (rated.length === 0) return 0
  return Math.round((rated.reduce((s, l) => s + (l.food_rating || 0), 0) / rated.length) * 10) / 10
}

export function formatLogDate(dateStr: string): string {
  const [, m, d] = dateStr.split('-').map(Number)
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  return `${d} ${months[m - 1]}`
}

export function weekdayShort(dateStr: string): string {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  return days[new Date(dateStr + 'T00:00:00').getDay()]
}

export function completedCountForLog(log: DailyLog): number {
  return [log.ia_completed, log.food_completed, log.sport_completed].filter(Boolean).length
}

// ── Per-objective config & series (for /ia, /alimentacion, /deporte) ────
export type ObjType = 'ia' | 'food' | 'sport'

export interface SeriesPoint {
  date: string
  value: number      // metric for that day (hours / rating / minutes)
  completed: boolean
  entry: string | null
}

const FIELD: Record<ObjType, { completed: CompletedField; metric: keyof DailyLog; entry: keyof DailyLog }> = {
  ia:    { completed: 'ia_completed',    metric: 'ia_hours',     entry: 'ia_entry' },
  food:  { completed: 'food_completed',  metric: 'food_rating',  entry: 'food_entry' },
  sport: { completed: 'sport_completed', metric: 'sport_minutes', entry: 'sport_entry' },
}

/** Chronological (oldest→newest) series of the objective's metric. */
export function getSeries(logs: DailyLog[], type: ObjType): SeriesPoint[] {
  const f = FIELD[type]
  return [...logs]
    .sort((a, b) => a.log_date.localeCompare(b.log_date))
    .map(l => ({
      date: l.log_date,
      value: Number(l[f.metric]) || 0,
      completed: Boolean(l[f.completed]),
      entry: (l[f.entry] as string | null) ?? null,
    }))
}

export function completedField(type: ObjType): CompletedField {
  return FIELD[type].completed
}

/** Sum of the objective's metric across all logs. */
export function getMetricTotal(logs: DailyLog[], type: ObjType): number {
  const f = FIELD[type]
  const sum = logs.reduce((s, l) => s + (Number(l[f.metric]) || 0), 0)
  return Math.round(sum * 10) / 10
}

/** Average of the metric over days where it's > 0 (or rated, for food). */
export function getMetricAvg(logs: DailyLog[], type: ObjType): number {
  const f = FIELD[type]
  const vals = logs.map(l => Number(l[f.metric]) || 0).filter(v => v > 0)
  if (!vals.length) return 0
  return Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) / 10
}

export function getBestDay(logs: DailyLog[], type: ObjType): SeriesPoint | null {
  const series = getSeries(logs, type)
  if (!series.length) return null
  return series.reduce((best, p) => (p.value > best.value ? p : best), series[0])
}

export function formatLogDateFull(dateStr: string): string {
  const [, m, d] = dateStr.split('-').map(Number)
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  return `${d} ${months[m - 1]}`
}
