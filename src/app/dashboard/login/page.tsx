import type { Metadata } from 'next'
import Link from 'next/link'
import { LogoMark } from '@/components/atoms/Logo/Logo'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = {
  title: 'Acesso',
  robots: { index: false, follow: false }, // painel não vai pra busca
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams

  return (
    <main className="min-h-screen bg-gradient-hero flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center gap-3 mb-8">
          <LogoMark size={48} />
          <div>
            <h1 className="font-display text-display-md text-charcoal-900">
              Studio Íra
            </h1>
            <p className="font-accent text-label uppercase tracking-widest text-charcoal-700/60 mt-1">
              Painel de Gestão
            </p>
          </div>
        </div>

        <div className="rounded-card bg-ivory-100/80 backdrop-blur border border-ivory-300 shadow-card-rest p-6 sm:p-8">
          <LoginForm next={next} />
        </div>

        <p className="text-center mt-6">
          <Link
            href="/"
            className="font-body text-body-sm text-charcoal-700/60 hover:text-gold-600 transition-colors"
          >
            ← Voltar ao site
          </Link>
        </p>
      </div>
    </main>
  )
}
