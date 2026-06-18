// ── Perfil físico de Siri — fuente de verdad para las metas nutricionales ──
// Plan: Fase 1 = definición (perder ~7 kg de grasa, 70 → 63 kg). Fase 2 = ganar músculo.
// Actualiza estos valores según evolucione el cuerpo (o cambia `phase` al pasar a volumen).

export type Sex = 'male' | 'female'
export type Phase = 'cut' | 'bulk' | 'maintain' | 'recomp'

export interface Profile {
  sex: Sex
  age: number
  heightCm: number
  weightKg: number
  goalWeightKg: number
  activityFactor: number   // multiplicador de actividad (Mifflin-St Jeor)
  phase: Phase
}

export const PROFILE: Profile = {
  sex: 'male',
  age: 19,
  heightCm: 175,
  weightKg: 70,
  goalWeightKg: 63,        // ~ −7 kg de grasa (estimación de Siri)
  activityFactor: 1.2,     // sedentario
  phase: 'cut',            // fase actual: definición
}

export const PHASE_LABEL: Record<Phase, string> = {
  cut: 'Definición', bulk: 'Volumen', maintain: 'Mantenimiento', recomp: 'Recomposición',
}

/** Metabolismo basal (kcal/día) — Mifflin-St Jeor. */
export function bmr(p: Profile = PROFILE): number {
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age
  return Math.round(base + (p.sex === 'male' ? 5 : -161))
}

/** Gasto energético total diario (kcal de mantenimiento). */
export function tdee(p: Profile = PROFILE): number {
  return Math.round(bmr(p) * p.activityFactor)
}

/** Índice de masa corporal. */
export function bmi(p: Profile = PROFILE): number {
  const m = p.heightCm / 100
  return Math.round((p.weightKg / (m * m)) * 10) / 10
}

export interface NutrientTarget { value: number; kind: 'target' | 'limit' }
export interface Targets {
  kcal: number
  protein: NutrientTarget
  carbs: NutrientTarget
  fat: NutrientTarget
  fiber: NutrientTarget
  sugar: NutrientTarget
  satFat: NutrientTarget
  salt: NutrientTarget
}

/** Metas diarias derivadas del perfil + fase actual. */
export function targets(p: Profile = PROFILE): Targets {
  const maint = tdee(p)
  const kcal = p.phase === 'cut' ? maint - 500 : p.phase === 'bulk' ? maint + 350 : maint
  // proteína por kg según fase (en déficit es donde más hace falta, para conservar músculo)
  const gPerKg = p.phase === 'cut' ? 2.1 : p.phase === 'bulk' ? 1.8 : 2.0
  const protein = Math.round(p.weightKg * gPerKg)
  const fat = Math.round(p.weightKg * 0.8)                                   // mínimo saludable
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4))  // el resto
  return {
    kcal: Math.round(kcal),
    protein: { value: protein, kind: 'target' },
    carbs: { value: carbs, kind: 'target' },
    fat: { value: fat, kind: 'target' },
    fiber: { value: 30, kind: 'target' },
    sugar: { value: 50, kind: 'limit' },
    satFat: { value: 20, kind: 'limit' },
    salt: { value: 6, kind: 'limit' },
  }
}
