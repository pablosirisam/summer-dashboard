'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles, Home, Brain, Salad, Dumbbell, CalendarRange, type LucideIcon } from 'lucide-react'

interface NavItem { href: string; label: string; icon: LucideIcon; lk: string }

const ITEMS: NavItem[] = [
  { href: '/',             label: 'Inicio',       icon: Home,         lk: '#f0c26a' },
  { href: '/ia',           label: 'IA',           icon: Brain,        lk: '#f0c26a' },
  { href: '/alimentacion', label: 'Alimentación', icon: Salad,        lk: '#9dc587' },
  { href: '/deporte',      label: 'Deporte',      icon: Dumbbell,     lk: '#e68463' },
  { href: '/historial',    label: 'Historial',    icon: CalendarRange, lk: '#f0c26a' },
]

export default function NavBar() {
  const pathname = usePathname()

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="nav-brand" aria-label="Inicio">
          <span className="nav-mark"><Sparkles size={17} strokeWidth={2.2} /></span>
          <span className="nav-brand-txt">
            <b>SIRI · VERANO</b>
            <i>IA · COMIDA · DEPORTE</i>
          </span>
        </Link>

        <div className="nav-links">
          {ITEMS.map(({ href, label, icon: Icon, lk }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`nav-link${active ? ' active' : ''}`}
                style={{ ['--lk' as string]: lk }}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="nav-pill"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <Icon size={15} strokeWidth={2.1} />
                <span>{label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
