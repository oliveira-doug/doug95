import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LogoMark } from '@/components/atoms/Logo/Logo'
import { BookingFlow } from './BookingFlow'

export const metadata: Metadata = {
  title: 'Agendar horário',
  description:
    'Reserve seu horário no Studio Ira Oliveira. Escolha o profissional, o dia e a hora — rápido e sem compromisso.',
}

export default async function AgendarPage() {
  const supabase = await createClient()

  const [profissionais, servicos, horarios] = await Promise.all([
    supabase.from('profissionais').select('*').eq('ativo', true).order('ordem'),
    supabase.from('servicos').select('*').eq('ativo', true).order('ordem'),
    supabase.from('horarios').select('profissional_id, dia_semana'),
  ])

  return (
    <main className="min-h-screen bg-gradient-hero py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <header className="flex flex-col items-center text-center gap-3 mb-10">
          <Link href="/" aria-label="Voltar ao site">
            <LogoMark size={48} />
          </Link>
          <h1 className="font-display text-display-lg text-charcoal-900">
            Agende seu horário
          </h1>
          <p className="font-body text-body-md text-charcoal-700/70 max-w-md">
            Escolha o profissional, o dia e o horário. Você recebe a confirmação
            pelo WhatsApp — sem compromisso.
          </p>
        </header>

        <BookingFlow
          profissionais={profissionais.data ?? []}
          servicos={servicos.data ?? []}
          diasAtendidos={horarios.data ?? []}
        />

        <p className="text-center mt-8">
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
