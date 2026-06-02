import Link from 'next/link'
import { CalendarDays, ClipboardList, Wallet, Home } from 'lucide-react'
import { LogoMark } from '@/components/atoms/Logo/Logo'
import { requireAuth } from '@/lib/auth'
import { signOut } from '../login/actions'

// Itens de navegação. Cada um abre numa sub-entrega seguinte (2.1 → 2.4).
const NAV = [
  { href: '/dashboard', label: 'Início', icon: Home },
  { href: '/dashboard/agenda', label: 'Agenda', icon: CalendarDays },
  { href: '/dashboard/comanda', label: 'Comanda', icon: ClipboardList },
  { href: '/dashboard/financeiro', label: 'Financeiro', icon: Wallet },
] as const

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Barreira de auth no servidor (além do proxy e do RLS — defesa em profundidade).
  const profile = await requireAuth()

  return (
    <div className="min-h-screen bg-ivory-100 flex flex-col">
      {/* Barra superior */}
      <header className="sticky top-0 z-30 bg-ivory-50/90 backdrop-blur border-b border-ivory-300">
        <div className="max-w-content mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <LogoMark size={32} />
            <span className="font-display text-display-md text-charcoal-900 leading-none">
              Studio Ira
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="font-accent text-body-sm font-medium text-charcoal-900 leading-tight">
                {profile.nome}
              </p>
              <p className="font-body text-[11px] uppercase tracking-wide text-charcoal-700/60">
                {profile.papel}
              </p>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="h-9 px-4 rounded-badge border border-ivory-300 bg-transparent
                           font-accent text-body-sm font-medium text-charcoal-700
                           hover:border-gold-400 hover:text-gold-600
                           transition-all duration-300 ease-smooth cursor-pointer"
              >
                Sair
              </button>
            </form>
          </div>
        </div>

        {/* Navegação */}
        <nav className="max-w-content mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 px-3 py-2.5 -mb-px border-b-2 border-transparent
                         font-accent text-body-sm font-medium text-charcoal-700/70
                         hover:text-gold-600 hover:border-gold-300 transition-colors whitespace-nowrap"
            >
              <Icon size={16} strokeWidth={1.5} />
              {label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="flex-1 max-w-content mx-auto w-full px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  )
}
