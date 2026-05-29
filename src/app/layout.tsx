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
  title: {
    default: 'Salão da Íra — Beleza com Sofisticação',
    template: '%s | Salão da Íra',
  },
  description:
    'Procedimentos exclusivos com profissionais certificadas. Cabelo, unhas, estética e muito mais em um ambiente pensado para você.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${cormorant.variable} ${dmSans.variable} ${jost.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
