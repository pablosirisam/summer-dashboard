import { Brain, Salad, Dumbbell, type LucideIcon } from 'lucide-react'
import type { DailyLog, ObjectiveType } from '@/types'
import type { CompletedField } from '@/lib/utils'

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
  field: CompletedField
  entry: keyof DailyLog
  /** big-stat formatter for this objective */
  big: (logs: DailyLog[]) => { value: string; unit: string; cap: string }
}

export const OBJECTIVES: Record<ObjectiveType, ObjConfig> = {
  ia: {
    type: 'ia', route: '/ia', label: 'Inteligencia Artificial', short: 'IA',
    sub: 'horas de trabajo real', tagline: 'Construir, aprender y enviar — todos los días.',
    icon: Brain, accent: '#d9a441', accent2: '#f0c26a', glow: '217,164,65',
    field: 'ia_completed', entry: 'ia_entry',
    big: () => ({ value: '', unit: '', cap: '' }),
  },
  food: {
    type: 'food', route: '/alimentacion', label: 'Alimentación', short: 'Comida',
    sub: 'calidad de la dieta', tagline: 'Comer mejor, sentirte mejor.',
    icon: Salad, accent: '#7fa96b', accent2: '#9dc587', glow: '127,169,107',
    field: 'food_completed', entry: 'food_entry',
    big: () => ({ value: '', unit: '', cap: '' }),
  },
  sport: {
    type: 'sport', route: '/deporte', label: 'Deporte', short: 'Deporte',
    sub: 'minutos en movimiento', tagline: 'Moverte cada día, sin excusas.',
    icon: Dumbbell, accent: '#d2624a', accent2: '#e68463', glow: '210,98,74',
    field: 'sport_completed', entry: 'sport_entry',
    big: () => ({ value: '', unit: '', cap: '' }),
  },
}

export const ROUTE_TO_TYPE: Record<string, ObjectiveType> = {
  '/ia': 'ia',
  '/alimentacion': 'food',
  '/deporte': 'sport',
}

export const OBJ_ORDER: ObjectiveType[] = ['ia', 'food', 'sport']
