import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono, Fraunces } from 'next/font/google'
import './globals.css'
import SmoothScroll from '@/components/SmoothScroll'
import NavBar from '@/components/NavBar'
import Ticker, { type TickerSnap } from '@/components/Ticker'
import { getAllLogs } from '@/lib/supabase'
import { spainToday, getStreak, weekdayShort, formatLogDate } from '@/lib/utils'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

// Editorial display serif — the aspirational voice against the cold data.
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  axes: ['opsz', 'SOFT', 'WONK'],
})

export const metadata: Metadata = {
  title: 'Siri · Verano 2026',
  description: 'El parte del verano · IA, Alimentación y Deporte · datos en vivo',
}

export const viewport: Viewport = {
  themeColor: '#060710',
  width: 'device-width',
  initialScale: 1,
}

async function buildSnap(): Promise<TickerSnap | null> {
  let logs
  try {
    logs = await getAllLogs()
  } catch {
    return null // sin credenciales en build: el tape simplemente no aparece
  }
  if (!logs.length) return null
  const today = spainToday()
  const log = logs.find(l => l.log_date === today) ?? logs[0]
  const isToday = log.log_date === today
  const done =
    Number(log.ia_completed) + Number(log.food_completed) + Number(log.sport_completed)
  const streak = Math.max(
    getStreak(logs, 'ia_completed'),
    getStreak(logs, 'food_completed'),
    getStreak(logs, 'sport_completed'),
  )
  return {
    dateLabel: `${weekdayShort(log.log_date)} ${formatLogDate(log.log_date)}`,
    isToday,
    ia: { v: log.ia_hours ? `${log.ia_hours}h` : '', on: !!log.ia_completed },
    food: { v: log.food_rating ? `${log.food_rating}★` : '', on: !!log.food_completed },
    sport: { v: log.sport_minutes ? `${log.sport_minutes}min` : '', on: !!log.sport_completed },
    streak,
    done,
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const snap = await buildSnap()
  return (
    <html lang="es" className={`${inter.variable} ${mono.variable} ${fraunces.variable}`}>
      <body>
        <SmoothScroll />
        <div className="aurora"><div className="aurora-blob" /></div>
        <div className="grid-overlay" />
        <NavBar />
        <Ticker snap={snap} />
        {children}
      </body>
    </html>
  )
}
