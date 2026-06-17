export interface DailyLog {
  id: string
  log_date: string
  ia_entry: string | null
  ia_hours: number
  ia_completed: boolean
  food_entry: string | null
  food_rating: number | null
  food_completed: boolean
  sport_entry: string | null
  sport_minutes: number
  sport_completed: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export type ObjectiveType = 'ia' | 'food' | 'sport'
