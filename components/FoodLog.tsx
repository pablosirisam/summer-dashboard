'use client'

import { motion } from 'framer-motion'
import {
  Salad, Flame, Star, Camera, Clock, Utensils, TrendingUp,
} from 'lucide-react'
import type { Meal } from '@/types'
import { formatLogDateFull, weekdayShort } from '@/lib/utils'

const EASE = [0.16, 1, 0.3, 1] as const

function addDays(iso: string, n: number) {
  const d = new Date(iso + 'T12:00:00Z')
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

function fmtTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString('es-ES', {
      hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid',
    })
  } catch { return '' }
}

interface Totals { kcal: number; p: number; c: number; f: number }
function sum(meals: Meal[]): Totals {
  return meals.reduce<Totals>((t, m) => ({
    kcal: t.kcal + (m.kcal ?? 0),
    p: t.p + (m.protein_g ?? 0),
    c: t.c + (m.carbs_g ?? 0),
    f: t.f + (m.fat_g ?? 0),
  }), { kcal: 0, p: 0, c: 0, f: 0 })
}

const r0 = (n: number) => Math.round(n)

function Stars({ value, size = 13 }: { value: number | null; size?: number }) {
  const v = value ?? 0
  return (
    <span className="fl-stars" aria-label={`${v} de 5`}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={size} strokeWidth={2.4}
          className={i <= v ? 'on' : ''}
          fill={i <= v ? 'currentColor' : 'none'} />
      ))}
    </span>
  )
}

function MacroBar({ t }: { t: Totals }) {
  const pc = t.p * 4, cc = t.c * 4, fc = t.f * 9
  const tot = pc + cc + fc || 1
  return (
    <div className="fl-macrobar" role="img" aria-label={`Proteína ${r0(t.p)}g, carbohidratos ${r0(t.c)}g, grasa ${r0(t.f)}g`}>
      <span className="seg p" style={{ width: `${(pc / tot) * 100}%` }} />
      <span className="seg c" style={{ width: `${(cc / tot) * 100}%` }} />
      <span className="seg f" style={{ width: `${(fc / tot) * 100}%` }} />
    </div>
  )
}

function MacroReadout({ t }: { t: Totals }) {
  return (
    <div className="fl-macros">
      <div className="fl-macro p"><b>{r0(t.p)}<i>g</i></b><span>proteína</span></div>
      <div className="fl-macro c"><b>{r0(t.c)}<i>g</i></b><span>carbos</span></div>
      <div className="fl-macro f"><b>{r0(t.f)}<i>g</i></b><span>grasa</span></div>
    </div>
  )
}

// ── Open Food Facts nutrition badges ──────────────────────────────
const NS_COLORS: Record<string, string> = { a: '#038141', b: '#85bb2f', c: '#fecb02', d: '#ee8100', e: '#e63e11' }

function NutriScore({ grade }: { grade: string | null }) {
  const g = (grade ?? '').toLowerCase()
  if (!NS_COLORS[g]) return null
  return (
    <div className="ns" title={`Nutri-Score ${g.toUpperCase()}`}>
      <span className="ns-label">Nutri-Score</span>
      <span className="ns-scale">
        {['a', 'b', 'c', 'd', 'e'].map(l => (
          <span key={l} className={`ns-l${l === g ? ' on' : ''}`} style={l === g ? { background: NS_COLORS[l] } : undefined}>
            {l.toUpperCase()}
          </span>
        ))}
      </span>
    </div>
  )
}

const NOVA: Record<number, { c: string; t: string }> = {
  1: { c: '#10d98b', t: 'sin procesar' },
  2: { c: '#9bcf3a', t: 'proc. culinario' },
  3: { c: '#fb923c', t: 'procesado' },
  4: { c: '#e63e11', t: 'ultraprocesado' },
}

function NovaBadge({ group }: { group: number | null }) {
  if (!group || !NOVA[group]) return null
  const n = NOVA[group]
  return (
    <span className="nova" style={{ ['--nv' as string]: n.c }} title={`NOVA ${group} · ${n.t}`}>
      NOVA {group} · {n.t}
    </span>
  )
}

function NutriExtra({ m }: { m: Meal }) {
  const items = [
    m.fiber_g != null && { k: 'Fibra', v: `${r0(m.fiber_g)}g`, cls: 'fib' },
    m.sugar_g != null && { k: 'Azúcar', v: `${r0(m.sugar_g)}g`, cls: 'sug' },
    m.sat_fat_g != null && { k: 'Grasa sat.', v: `${r0(m.sat_fat_g)}g`, cls: 'sat' },
    m.salt_g != null && { k: 'Sal', v: `${m.salt_g}g`, cls: 'salt' },
  ].filter(Boolean) as { k: string; v: string; cls: string }[]
  if (!items.length) return null
  return (
    <div className="fl-extra">
      {items.map(i => <span key={i.k} className={`fl-ex ${i.cls}`}>{i.k} <b>{i.v}</b></span>)}
    </div>
  )
}

export default function FoodLog({ meals, today }: { meals: Meal[]; today: string }) {
  // group by date, preserving the desc order coming from the query
  const groups: { date: string; meals: Meal[] }[] = []
  const idx = new Map<string, number>()
  for (const m of meals) {
    if (!idx.has(m.meal_date)) { idx.set(m.meal_date, groups.length); groups.push({ date: m.meal_date, meals: [] }) }
    groups[idx.get(m.meal_date)!].meals.push(m)
  }

  const todayMeals = meals.filter(m => m.meal_date === today)
  const todayTot = sum(todayMeals)

  // streak: consecutive days (ending today, or yesterday if today empty) with >=1 meal
  const daysSet = new Set(meals.map(m => m.meal_date))
  let streak = 0
  let cursor = daysSet.has(today) ? today : addDays(today, -1)
  while (daysSet.has(cursor)) { streak++; cursor = addDays(cursor, -1) }

  const rated = meals.filter(m => m.rating != null)
  const avgRating = rated.length ? rated.reduce((s, m) => s + (m.rating ?? 0), 0) / rated.length : 0
  const avgKcal = groups.length ? Math.round(sum(meals).kcal / groups.length) : 0

  const todayRated = todayMeals.filter(m => m.rating != null)
  const todayRating = todayRated.length ? todayRated.reduce((s, m) => s + (m.rating ?? 0), 0) / todayRated.length : 0
  const verdict =
    todayRating >= 4.5 ? 'Día impecable. Así se construye el físico.'
    : todayRating >= 3.5 ? 'Buen día en general. Mantén el nivel.'
    : todayRating >= 2.5 ? 'Mejorable. Demasiada concesión.'
    : 'Flojo. Hoy la comida no acompaña a tu meta.'

  const stats = [
    { icon: Flame, v: `${streak}`, k: 'racha de días', sub: streak > 0 ? 'registrando sin fallar' : 'empieza hoy' },
    { icon: Camera, v: `${meals.length}`, k: 'comidas en foto', sub: `${groups.length} días` },
    { icon: Star, v: avgRating ? avgRating.toFixed(1) : '—', k: 'media de salud', sub: 'valoración del coach' },
    { icon: TrendingUp, v: avgKcal ? `${avgKcal}` : '—', k: 'kcal media / día', sub: 'según lo fotografiado' },
  ]

  return (
    <main className="detail fl" style={{ ['--accent' as string]: 'var(--food)', ['--accent-2' as string]: 'var(--food-2)', ['--accent-glow' as string]: 'var(--food-glow)' }}>
      {/* Header */}
      <motion.div className="dt-head"
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}>
        <div className="dt-head-glow" />
        <div className="dt-id">
          <div className="dt-icon"><Salad size={26} strokeWidth={2} /></div>
          <div>
            <div className="dt-tag">Diario alimenticio · en fotos</div>
            <h1 className="dt-title">Alimentación</h1>
          </div>
        </div>
        <div className="dt-headline">
          <span className="dt-big">{todayTot.kcal || 0}</span>
          <span className="dt-big-u">kcal hoy</span>
        </div>
      </motion.div>

      {/* Today panel */}
      <motion.section className="fl-today"
        initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.08, ease: EASE }}>
        <div className="fl-today-head">
          <span className="dt-panel-title"><Utensils size={15} /> El parte de hoy</span>
          <span className="fl-today-count">{todayMeals.length} {todayMeals.length === 1 ? 'comida' : 'comidas'}</span>
        </div>
        {todayMeals.length ? (
          <>
            <div className="fl-today-grid">
              <div className="fl-today-kcal">
                <span className="v">{todayTot.kcal}</span>
                <span className="u">kcal</span>
                <div className="fl-today-rate">
                  <Stars value={Math.round(todayRating)} size={14} />
                  <span>{todayRating.toFixed(1)} / 5 · {todayMeals.length} {todayMeals.length === 1 ? 'comida' : 'comidas'}</span>
                </div>
              </div>
              <div className="fl-today-macros">
                <MacroBar t={todayTot} />
                <MacroReadout t={todayTot} />
              </div>
            </div>
            <p className="fl-verdict"><Flame size={13} />{verdict}</p>
          </>
        ) : (
          <p className="fl-today-empty">Aún no has registrado nada hoy. Mándame la foto de tu próxima comida 📸</p>
        )}
      </motion.section>

      {/* Stat grid */}
      <div className="dt-stats">
        {stats.map((s, i) => {
          const SIcon = s.icon
          return (
            <motion.div key={i} className="dt-stat"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.14 + i * 0.07, ease: EASE }}>
              <div className="dt-stat-ic"><SIcon size={16} strokeWidth={2.2} /></div>
              <div className="dt-stat-v">{s.v}</div>
              <div className="dt-stat-k">{s.k}</div>
              <div className="dt-stat-sub">{s.sub}</div>
            </motion.div>
          )
        })}
      </div>

      {/* Gallery */}
      <div className="sec-head">
        <span className="sec-title"><span className="ic"><Camera size={15} /></span>Galería de comidas</span>
        <span className="sec-line" />
      </div>

      {!meals.length && (
        <div className="empty-state">
          Todavía no hay comidas registradas. Mándame una foto de lo que comas por Telegram y la analizo y la guardo aquí. 📸
        </div>
      )}

      <div className="fl-days">
        {groups.map((g, gi) => {
          const t = sum(g.meals)
          return (
            <div key={g.date} className="fl-daygroup">
              <div className="fl-dayhead">
                <div className="fl-daydate">
                  <span className="d">{formatLogDateFull(g.date)}</span>
                  <span className="wd">{weekdayShort(g.date)}{g.date === today ? ' · hoy' : ''}</span>
                </div>
                <div className="fl-daychips">
                  <span className="fl-chip kcal"><Flame size={12} />{t.kcal} kcal</span>
                  <span className="fl-chip p">P {r0(t.p)}g</span>
                  <span className="fl-chip c">C {r0(t.c)}g</span>
                  <span className="fl-chip f">G {r0(t.f)}g</span>
                </div>
              </div>
              <div className="fl-grid">
                {g.meals.map((m, mi) => (
                  <motion.article key={m.id} className="fl-card"
                    initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.5, delay: Math.min(mi * 0.05, 0.3), ease: EASE }}>
                    <div className="fl-photo">
                      {m.photo_url
                        ? <img src={m.photo_url} alt={m.description} loading="lazy" />
                        : <div className="fl-noimg"><Camera size={26} /></div>}
                      {m.rating != null && (
                        <span className={`fl-rate r${m.rating}`}><Stars value={m.rating} size={11} /></span>
                      )}
                      {m.kcal != null && <span className="fl-kcalbadge"><Flame size={11} />{m.kcal}</span>}
                    </div>
                    <div className="fl-body">
                      <div className="fl-time"><Clock size={11} />{fmtTime(m.meal_time)}</div>
                      <h3 className="fl-desc">{m.description}</h3>
                      {(m.protein_g != null || m.carbs_g != null || m.fat_g != null) && (
                        <div className="fl-cardmacros">
                          <span className="m p">P {r0(m.protein_g ?? 0)}</span>
                          <span className="m c">C {r0(m.carbs_g ?? 0)}</span>
                          <span className="m f">G {r0(m.fat_g ?? 0)}</span>
                        </div>
                      )}
                      {(m.nutri_score || m.nova_group != null) && (
                        <div className="fl-nutri">
                          <NutriScore grade={m.nutri_score} />
                          <NovaBadge group={m.nova_group} />
                        </div>
                      )}
                      <NutriExtra m={m} />
                      {m.comment && <p className="fl-comment">“{m.comment}”</p>}
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
