import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Siri · Verano 2026',
  description: 'Dashboard personal — IA · Alimentación · Deporte',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
