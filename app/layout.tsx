import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import SmoothScroll from '@/components/SmoothScroll'
import NavBar from '@/components/NavBar'

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

export const metadata: Metadata = {
  title: 'Siri · Verano 2026',
  description: 'Cuenta atrás del verano · IA, Alimentación y Deporte · datos en vivo',
}

export const viewport: Viewport = {
  themeColor: '#05060f',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${mono.variable}`}>
      <body>
        <SmoothScroll />
        <div className="aurora"><div className="aurora-blob" /></div>
        <div className="grid-overlay" />
        <NavBar />
        {children}
      </body>
    </html>
  )
}
