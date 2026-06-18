'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Salad, Flame, Star, Camera, Clock, Utensils, TrendingUp, X,
} from 'lucide-react'
import type { Meal } from '@/types'
import { formatLogDateFull, weekdayShort } from '@/lib/utils'
import { targets, PROFILE, bmi, PHASE_LABEL } from '@/lib/profile'

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

// ── Meal detail modal — "nutrition label" pro view ────────────────
const NS_DESC: Record<string, string> = {
  a: 'Calidad nutricional muy alta', b: 'Buena calidad nutricional', c: 'Calidad media',
  d: 'Calidad baja — a moderar', e: 'Calidad muy baja — ocasional',
}
const NOVA_DESC: Record<number, string> = {
  1: 'Sin procesar o mínimamente procesado', 2: 'Ingrediente culinario procesado',
  3: 'Alimento procesado', 4: 'Ultraprocesado — como capricho, no como hábito',
}
function GoalBar({ label, value, target, unit }: { label: string; value: number; target: number; unit: string }) {
  const pct = Math.round((value / target) * 100)
  return (
    <div className="fl-goal">
      <div className="fl-goal-top">
        <span className="fl-goal-k">{label}</span>
        <span className="fl-goal-v"><b>{Math.round(value)}</b> / {target} {unit} <i>{pct}%</i></span>
      </div>
      <div className="fl-goal-bar"><span style={{ width: `${Math.min(100, pct)}%` }} /></div>
    </div>
  )
}

function MacroDonut({ p, c, f }: { p: number; c: number; f: number }) {
  const pc = p * 4, cc = c * 4, fc = f * 9
  const tot = pc + cc + fc || 1
  const segs = [
    { v: pc / tot, color: '#34e6a6' },
    { v: cc / tot, color: '#818cf8' },
    { v: fc / tot, color: '#fbbf24' },
  ]
  const R = 54, SW = 13, CIRC = 2 * Math.PI * R
  let acc = 0
  return (
    <svg viewBox="0 0 140 140" className="md-donut" aria-hidden>
      <circle cx="70" cy="70" r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={SW} />
      {segs.map((s, i) => {
        const len = s.v * CIRC
        const off = -acc
        acc += len
        return (
          <circle key={i} cx="70" cy="70" r={R} fill="none" stroke={s.color} strokeWidth={SW}
            strokeDasharray={`${len} ${CIRC - len}`} strokeDashoffset={off} transform="rotate(-90 70 70)" />
        )
      })}
    </svg>
  )
}

function Fact({ label, value, unit, ri, accent, sub }: {
  label: string; value: number | null; unit: string; ri: number; accent: string; sub?: boolean
}) {
  if (value == null) return null
  const pct = Math.round((value / ri) * 100)
  const disp = value >= 10 ? Math.round(value) : Math.round(value * 10) / 10
  return (
    <div className={`md-fact${sub ? ' sub' : ''}`}>
      <div className="md-fact-top">
        <span className="md-fact-k">{label}</span>
        <span className="md-fact-v">{disp}{unit} <i>{pct}%</i></span>
      </div>
      <div className="md-fact-bar"><span style={{ width: `${Math.min(100, pct)}%`, background: accent }} /></div>
    </div>
  )
}

function MealDetail({ meal: m, onClose }: { meal: Meal; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [onClose])

  const T = targets()
  const g = (m.nutri_score ?? '').toLowerCase()
  const p = m.protein_g ?? 0, c = m.carbs_g ?? 0, f = m.fat_g ?? 0
  const etot = p * 4 + c * 4 + f * 9 || 1
  const legend = [
    { k: 'Proteínas', g: p, pct: Math.round((p * 4 / etot) * 100), color: '#34e6a6' },
    { k: 'Carbohidratos', g: c, pct: Math.round((c * 4 / etot) * 100), color: '#818cf8' },
    { k: 'Grasas', g: f, pct: Math.round((f * 9 / etot) * 100), color: '#fbbf24' },
  ]

  return (
    <motion.div className="md-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={m.description}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
      <motion.div className="md-panel" onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }} transition={{ duration: 0.4, ease: EASE }}>
        <button className="md-close" onClick={onClose} aria-label="Cerrar"><X size={18} strokeWidth={2.4} /></button>

        <div className="md-hero">
          {m.photo_url
            ? <img src={m.photo_url} alt={m.description} />
            : <div className="fl-noimg"><Camera size={34} /></div>}
          {m.photo_url?.includes('unsplash') && <span className="fl-stock">ilustración</span>}
          <div className="md-hero-grad" />
          <div className="md-hero-info">
            <div className="md-time"><Clock size={12} />{fmtTime(m.meal_time)} · {formatLogDateFull(m.meal_date)}</div>
            <h2 className="md-title">{m.description}</h2>
            {m.rating != null && (
              <div className="md-rating"><Stars value={m.rating} size={16} /><span>{m.rating} / 5</span></div>
            )}
          </div>
        </div>

        <div className="md-content">
          {(NS_COLORS[g] || (m.nova_group != null && NOVA[m.nova_group])) && (
            <div className="md-scores">
              {NS_COLORS[g] && (
                <div className="md-score-card">
                  <NutriScore grade={m.nutri_score} />
                  <span className="md-score-desc">{NS_DESC[g]}</span>
                </div>
              )}
              {m.nova_group != null && NOVA[m.nova_group] && (
                <div className="md-score-card">
                  <NovaBadge group={m.nova_group} />
                  <span className="md-score-desc">{NOVA_DESC[m.nova_group]}</span>
                </div>
              )}
            </div>
          )}

          {(m.kcal != null || p || c || f) && (
            <div className="md-block">
              <div className="md-block-h">Reparto energético</div>
              <div className="md-macro-wrap">
                <div className="md-donut-wrap">
                  <MacroDonut p={p} c={c} f={f} />
                  <div className="md-donut-c"><b>{m.kcal ?? 0}</b><span>KCAL</span></div>
                </div>
                <div className="md-macro-legend">
                  {legend.map(ml => (
                    <div key={ml.k} className="md-ml">
                      <span className="md-ml-dot" style={{ background: ml.color }} />
                      <span className="md-ml-k">{ml.k}</span>
                      <span className="md-ml-g">{r0(ml.g)}g</span>
                      <span className="md-ml-pct">{ml.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="md-block">
            <div className="md-block-h">Información nutricional <i>· % de tu objetivo diario ({PROFILE.weightKg} kg · {PHASE_LABEL[PROFILE.phase].toLowerCase()})</i></div>
            <div className="md-facts">
              <Fact label="Energía" value={m.kcal} unit=" kcal" ri={T.kcal} accent="var(--food-2)" />
              <Fact label="Proteínas" value={m.protein_g} unit="g" ri={T.protein.value} accent="#34e6a6" />
              <Fact label="Hidratos de carbono" value={m.carbs_g} unit="g" ri={T.carbs.value} accent="#818cf8" />
              <Fact label="de los cuales azúcares" value={m.sugar_g} unit="g" ri={T.sugar.value} accent="#f0a8d0" sub />
              <Fact label="Grasas" value={m.fat_g} unit="g" ri={T.fat.value} accent="#fbbf24" />
              <Fact label="de las cuales saturadas" value={m.sat_fat_g} unit="g" ri={T.satFat.value} accent="#fb923c" sub />
              <Fact label="Fibra" value={m.fiber_g} unit="g" ri={T.fiber.value} accent="#34e6a6" />
              <Fact label="Sal" value={m.salt_g} unit="g" ri={T.salt.value} accent="#fbbf24" />
            </div>
          </div>

          {m.comment && (
            <div className="md-verdict">
              <div className="md-verdict-h"><Flame size={13} /> Veredicto del coach</div>
              <p>{m.comment}</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function FoodLog({ meals, today }: { meals: Meal[]; today: string }) {
  const [selected, setSelected] = useState<Meal | null>(null)
  const T = targets()

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

  // Nota de salud PONDERADA POR CANTIDAD: kcal como proxy de "cuánto comiste".
  // Σ(rating×kcal) / Σ(kcal) → 1kg de chuches pesa mucho más que 1 fruta.
  // Comida sin kcal → peso por defecto 400 (ración media) para no descartarla.
  const wRating = (ms: Meal[]) => {
    const rated = ms.filter(m => m.rating != null)
    if (!rated.length) return 0
    const w = (m: Meal) => (m.kcal != null && m.kcal > 0 ? m.kcal : 400)
    const num = rated.reduce((s, m) => s + (m.rating ?? 0) * w(m), 0)
    const den = rated.reduce((s, m) => s + w(m), 0)
    return den ? num / den : 0
  }
  const avgRating = wRating(meals)
  const avgKcal = groups.length ? Math.round(sum(meals).kcal / groups.length) : 0

  const todayRating = wRating(todayMeals)
  const verdict =
    todayRating >= 4.5 ? 'Día impecable. Así se construye el físico.'
    : todayRating >= 3.5 ? 'Buen día en general. Mantén el nivel.'
    : todayRating >= 2.5 ? 'Mejorable. Demasiada concesión.'
    : 'Flojo. Hoy la comida no acompaña a tu meta.'

  const stats = [
    { icon: Flame, v: `${streak}`, k: 'racha de días', sub: streak > 0 ? 'registrando sin fallar' : 'empieza hoy' },
    { icon: Camera, v: `${meals.length}`, k: 'comidas en foto', sub: `${groups.length} días` },
    { icon: Star, v: avgRating ? avgRating.toFixed(1) : '—', k: 'media de salud', sub: 'ponderada por cuánto comes' },
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
          <span className="dt-big-u">/ {T.kcal} kcal hoy</span>
        </div>
      </motion.div>

      {/* Perfil + metas */}
      <motion.div className="fl-profile"
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease: EASE }}>
        <div className="flp-item"><span className="flp-k">Fase</span><span className="flp-v">{PHASE_LABEL[PROFILE.phase]}</span></div>
        <div className="flp-item"><span className="flp-k">Meta diaria</span><span className="flp-v">{T.kcal} kcal · {T.protein.value}g prot</span></div>
        <div className="flp-item"><span className="flp-k">Peso</span><span className="flp-v">{PROFILE.weightKg} → {PROFILE.goalWeightKg} kg</span></div>
        <div className="flp-item"><span className="flp-k">IMC</span><span className="flp-v">{bmi()}</span></div>
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
            <div className="fl-goals">
              <GoalBar label="Calorías" value={todayTot.kcal} target={T.kcal} unit="kcal" />
              <GoalBar label="Proteína" value={todayTot.p} target={T.protein.value} unit="g" />
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
                    onClick={() => setSelected(m)}
                    role="button" tabIndex={0} aria-label={`Ver detalle de ${m.description}`}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(m) } }}
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
                      {m.photo_url?.includes('unsplash') && <span className="fl-stock">ilustración</span>}
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

      <AnimatePresence>
        {selected && <MealDetail meal={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </main>
  )
}
