import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

// Versión PNG del icon.svg (la línea de cumbre) para el icono de iOS.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#060710',
        }}
      >
        <svg width="132" height="132" viewBox="0 0 32 32">
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#919bff" />
              <stop offset="1" stopColor="#38e6a6" />
            </linearGradient>
          </defs>
          <path
            d="M8 21 L14 12 L19 17 L24 9"
            fill="none"
            stroke="url(#g)"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="24" cy="9" r="2.2" fill="#38e6a6" />
        </svg>
      </div>
    ),
    size
  )
}
