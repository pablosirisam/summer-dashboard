'use client'

import { MotionConfig } from 'framer-motion'

/** Respeta prefers-reduced-motion también en las animaciones JS de Framer Motion. */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
