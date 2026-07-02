import Link from 'next/link'
import { Compass } from 'lucide-react'

export const metadata = { title: 'Página no encontrada' }

export default function NotFound() {
  return (
    <main className="detail">
      <div className="sys-panel">
        <div className="sys-icon"><Compass size={22} strokeWidth={2} /></div>
        <div className="sys-code">404 · FUERA DE RUTA</div>
        <h1 className="sys-title">Esta cima no está en el mapa</h1>
        <p className="sys-sub">La página que buscas no existe. El verano sigue en el inicio.</p>
        <Link href="/" className="sys-btn">[ VOLVER AL PARTE ]</Link>
      </div>
    </main>
  )
}
