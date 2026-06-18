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

export interface Meal {
  id: string
  meal_date: string        // yyyy-MM-dd
  meal_time: string        // ISO timestamp
  description: string
  kcal: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  rating: number | null    // 1-5
  comment: string | null
  photo_url: string | null
  nutri_score: string | null   // Open Food Facts grade 'a'..'e' (packaged items)
  nova_group: number | null    // NOVA processing 1..4 (4 = ultra-processed)
  fiber_g: number | null
  sugar_g: number | null
  sat_fat_g: number | null
  salt_g: number | null
  created_at: string
}
