import { Brain, Salad, Dumbbell, type LucideIcon } from 'lucide-react'
import type { DailyLog, ObjectiveType } from '@/types'
import type { CompletedField } from '@/lib/utils'

/**
 * How an objective is judged:
 *  · 'progress' — IA & comida: no es hecho/no hecho, sino seguimiento para mejorar
 *    (tendencia, media, calidad). Lidera la métrica, no la racha.
 *  · 'streak'   — deporte: binario. Lo hiciste o no. Lidera racha y constancia.
 */
export type ObjMode = 'progress' | 'streak'

export interface ObjConfig {
  type: ObjectiveType
  route: string
  label: string
  short: string
  sub: string
  tagline: string
  icon: LucideIcon
  accent: string
  accent2: string
  glow: string
  mode: ObjMode
  field: CompletedField
  entry: keyof DailyLog
  /** big-stat formatter for this objective */
  big: (logs: DailyLog[]) => { value: string; unit: string; cap: string }
}

export const OBJECTIVES: Record<ObjectiveType, ObjConfig> = {
  ia: {
    type: 'ia', route: '/ia', label: 'Inteligencia Artificial', short: 'IA',
    sub: 'horas de trabajo real', tagline: 'Construir, aprender y enviar — todos los días.',
    icon: Brain, accent: '#6366f1', accent2: '#818cf8', glow: '99,102,241',
    mode: 'progress', field: 'ia_completed', entry: 'ia_entry',
    big: () => ({ value: '', unit: '', cap: '' }),
  },
  food: {
    type: 'food', route: '/alimentacion', label: 'Alimentación', short: 'Comida',
    sub: 'calidad de la dieta', tagline: 'Comer mejor, sentirte mejor.',
    icon: Salad, accent: '#10d98b', accent2: '#34e6a0', glow: '16,217,139',
    mode: 'progress', field: 'food_completed', entry: 'food_entry',
    big: () => ({ value: '', unit: '', cap: '' }),
  },
  sport: {
    type: 'sport', route: '/deporte', label: 'Deporte', short: 'Deporte',
    sub: 'minutos en movimiento', tagline: 'Moverte cada día, sin excusas.',
    icon: Dumbbell, accent: '#fb923c', accent2: '#fbbf24', glow: '251,146,60',
    mode: 'streak', field: 'sport_completed', entry: 'sport_entry',
    big: () => ({ value: '', unit: '', cap: '' }),
  },
}

export const ROUTE_TO_TYPE: Record<string, ObjectiveType> = {
  '/ia': 'ia',
  '/alimentacion': 'food',
  '/deporte': 'sport',
}

export const OBJ_ORDER: ObjectiveType[] = ['ia', 'food', 'sport']
