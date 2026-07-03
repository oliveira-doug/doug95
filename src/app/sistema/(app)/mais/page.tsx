import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Award,
  ChevronRight,
  Crown,
  History,
  Settings,
  Sword,
  TrendingUp,
} from 'lucide-react'
import { SystemHeading } from '@/components/sistema/atoms/SystemHeading'
import { requirePlayer } from '../../_lib/auth'

export const metadata: Metadata = { title: 'Mais' }

const LINKS = [
  { href: '/sistema/atributos', label: 'Atributos', icone: TrendingUp },
  { href: '/sistema/classe', label: 'Classe', icone: Sword },
  { href: '/sistema/titulos', label: 'Títulos', icone: Crown },
  { href: '/sistema/conquistas', label: 'Conquistas', icone: Award },
  { href: '/sistema/historico', label: 'Histórico', icone: History },
  { href: '/sistema/config', label: 'Configurações', icone: Settings },
]

export default async function MaisPage() {
  await requirePlayer()

  return (
    <main>
      <SystemHeading kicker="⚠ Menu" title="Mais" />
      <div className="space-y-3">
        {LINKS.map(({ href, label, icone: Icone }) => (
          <Link
            key={href}
            href={href}
            className="holo-panel p-4 flex items-center gap-3 hover:shadow-glow-system transition-all"
          >
            <Icone size={20} className="text-system-500" />
            <span className="font-system-body text-base font-semibold tracking-wide text-system-100 flex-1">
              {label}
            </span>
            <ChevronRight size={18} className="text-system-700" />
          </Link>
        ))}
      </div>
    </main>
  )
}
