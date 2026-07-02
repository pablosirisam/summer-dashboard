import type { MetadataRoute } from 'next'

// Con esto "Añadir a pantalla de inicio" en el iPhone abre el dashboard
// como app a pantalla completa, con su icono y su negro de fondo.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Siri · Verano 2026',
    short_name: 'Verano 2026',
    description: 'El parte del verano · IA, Alimentación y Deporte',
    start_url: '/',
    display: 'standalone',
    background_color: '#060710',
    theme_color: '#060710',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  }
}
