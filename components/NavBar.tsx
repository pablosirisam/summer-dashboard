'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles, Home, CalendarRange, type LucideIcon } from 'lucide-react'
import { OBJECTIVES } from '@/lib/objectives'

interface NavItem { href: string; label: string; icon: LucideIcon; lk: string }

const ITEMS: NavItem[] = [
  { href: '/',             label: 'Inicio',       icon: Home,          lk: OBJECTIVES.ia.accent2 },
  { href: '/ia',           label: 'IA',           icon: OBJECTIVES.ia.icon,    lk: OBJECTIVES.ia.accent2 },
  { href: '/alimentacion', label: 'Alimentación', icon: OBJECTIVES.food.icon,  lk: OBJECTIVES.food.accent2 },
  { href: '/deporte',      label: 'Deporte',      icon: OBJECTIVES.sport.icon, lk: OBJECTIVES.sport.accent2 },
  { href: '/historial',    label: 'Historial',    icon: CalendarRange, lk: OBJECTIVES.ia.accent2 },
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
