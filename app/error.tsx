'use client'

import { useEffect } from 'react'
import { WifiOff } from 'lucide-react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <main className="detail">
      <div className="sys-panel">
        <div className="sys-icon"><WifiOff size={22} strokeWidth={2} /></div>
        <div className="sys-code">ERROR · SIN CONEXIÓN CON EL PARTE</div>
        <h1 className="sys-title">Los datos no responden</h1>
        <p className="sys-sub">
          No se pudo cargar el registro desde Supabase. Tus datos siguen ahí —
          es solo la conexión.
        </p>
        <button className="sys-btn" onClick={reset}>[ REINTENTAR ]</button>
      </div>
    </main>
  )
}
