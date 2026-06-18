import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono, Bricolage_Grotesque } from 'next/font/google'
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

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'El Parte · Verano 2026 de Siri',
  description: 'El instrumento de tu verano — 75 días, registrados. IA, alimentación y deporte, en vivo.',
}

export const viewport: Viewport = {
  themeColor: '#14110d',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${mono.variable} ${display.variable}`}>
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
