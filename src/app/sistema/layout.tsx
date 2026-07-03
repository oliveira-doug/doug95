import type { Metadata, Viewport } from 'next'
import { Orbitron, Rajdhani } from 'next/font/google'
import { RegisterSW } from '@/components/sistema/RegisterSW'

// Fontes exclusivas do Sistema — carregadas aqui (não no root layout) para
// não pesar no site do salão. As variables alimentam --font-system-* no CSS.
const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '900'],
  variable: '--font-orbitron',
  display: 'swap',
})

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-rajdhani',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'O Sistema', template: '%s | O Sistema' },
  description: 'Sistema pessoal de evolução — quests diárias, XP e atributos.',
  manifest: '/sistema/manifest.webmanifest',
  robots: { index: false, follow: false }, // app pessoal não vai pra busca
  icons: { apple: '/sistema/icons/apple-touch-icon.png' },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'O Sistema',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a1220',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function SistemaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className={`${orbitron.variable} ${rajdhani.variable} sistema-root min-h-dvh bg-system-grid`}
    >
      <RegisterSW />
      {children}
    </div>
  )
}
