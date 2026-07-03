import type { Metadata } from 'next'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = {
  title: 'Autenticação',
}

export default async function SistemaLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams

  return (
    <main className="min-h-dvh flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm animate-system-pop">
        <div className="text-center mb-8">
          <p className="font-system-display text-xs uppercase tracking-[0.4em] text-system-500 animate-system-flicker">
            ⚠ Notificação
          </p>
          <h1 className="font-system-display text-3xl font-bold uppercase tracking-[0.15em] text-glow-system mt-3">
            O Sistema
          </h1>
          <p className="font-system-body text-sm text-system-400 mt-2 tracking-wide">
            Você adquiriu as qualificações para se tornar um Jogador.
          </p>
        </div>

        <div className="holo-panel p-6 sm:p-8">
          <LoginForm next={next} />
        </div>

        <p className="text-center mt-6 font-system-body text-xs text-system-700 tracking-wider">
          Acesso restrito · contas são criadas pelo administrador
        </p>
      </div>
    </main>
  )
}
