'use client'

// Barra de navegação inferior (mobile-first), fixa, estilo HUD.

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ListChecks, Menu, Sparkles, Store, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const ITENS = [
  { href: '/sistema', label: 'Status', icone: User },
  { href: '/sistema/quests', label: 'Quests', icone: ListChecks },
  { href: '/sistema/habilidades', label: 'Skills', icone: Sparkles },
  { href: '/sistema/loja', label: 'Loja', icone: Store },
  { href: '/sistema/mais', label: 'Mais', icone: Menu },
]

export function SystemNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 border-t border-system-800
                 bg-system-950/90 backdrop-blur-md
                 pb-[env(safe-area-inset-bottom)]"
      aria-label="Navegação do Sistema"
    >
      <div className="max-w-lg mx-auto grid grid-cols-5">
        {ITENS.map(({ href, label, icone: Icone }) => {
          const ativo =
            href === '/sistema' ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 py-2.5 font-system-display text-[0.55rem] uppercase tracking-[0.15em] transition-colors',
                ativo
                  ? 'text-system-300 [text-shadow:0_0_8px_rgba(0,207,255,0.8)]'
                  : 'text-system-700 hover:text-system-400',
              )}
            >
              <Icone size={20} strokeWidth={ativo ? 2.5 : 2} />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
