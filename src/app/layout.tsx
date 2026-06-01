import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans, Jost } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const jost = Jost({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jost',
  display: 'swap',
})

export const metadata: Metadata = {
  // Em produção, defina NEXT_PUBLIC_SITE_URL (ex.: https://studioira.com.br)
  // para que a OG image e os links sociais resolvam com URL absoluta correta.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Studio Íra Oliveira — Salão de Beleza em Montes Claros',
    template: '%s | Studio Íra Oliveira',
  },
  description:
    'Especialistas em loiros, coloração e tratamentos capilares em Montes Claros-MG. Do diagnóstico ao resultado final, com técnica, cuidado e acabamento premium.',
  keywords: [
    'salão de beleza',
    'Montes Claros',
    'loiros',
    'coloração',
    'mechas e luzes',
    'tratamento capilar',
    'Studio Íra Oliveira',
  ],
  openGraph: {
    title: 'Studio Íra Oliveira — Salão de Beleza em Montes Claros',
    description:
      'Especialistas em loiros, coloração e tratamentos capilares. Realce a sua beleza natural.',
    locale: 'pt_BR',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${cormorant.variable} ${dmSans.variable} ${jost.variable}`}
    >
      <body>
        {children}
        {/* Textura de grão sobre toda a página — profundidade sutil */}
        <div className="grain-overlay" aria-hidden="true" />
      </body>
    </html>
  )
}
