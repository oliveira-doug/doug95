import { CalendarDays, ClipboardList, Wallet } from 'lucide-react'
import { requireAuth } from '@/lib/auth'

export default async function DashboardHome() {
  const profile = await requireAuth()

  const primeiroNome = profile.nome.split(' ')[0]

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-display-lg text-charcoal-900">
          Olá, {primeiroNome} 👋
        </h1>
        <p className="font-body text-body-md text-charcoal-700/70 mt-1">
          {profile.papel === 'admin'
            ? 'Visão geral do salão — agenda, atendimentos e financeiro.'
            : 'Sua agenda e seus atendimentos.'}
        </p>
      </div>

      {/* Próximas sub-entregas — placeholders que viram telas reais em seguida */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            icon: CalendarDays,
            titulo: 'Agenda',
            desc: 'Horários por profissional, com proteção contra conflito.',
            tag: 'Sub-entrega 2.1',
          },
          {
            icon: ClipboardList,
            titulo: 'Comanda',
            desc: 'Lançar procedimentos realizados e valores (vários por atendimento).',
            tag: 'Sub-entrega 2.3',
          },
          {
            icon: Wallet,
            titulo: 'Financeiro',
            desc: 'Acompanhamento por profissional e período, recibo e cobrança.',
            tag: 'Sub-entregas 2.4–2.5',
          },
        ].map(({ icon: Icon, titulo, desc, tag }) => (
          <div
            key={titulo}
            className="rounded-card bg-ivory-50 border border-ivory-300 p-5 flex flex-col gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-gold-100 border border-gold-200 flex items-center justify-center text-gold-500">
              <Icon size={18} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="font-accent text-body-lg font-semibold text-charcoal-900">
                {titulo}
              </h2>
              <p className="font-body text-body-sm text-charcoal-700/70 mt-1">
                {desc}
              </p>
            </div>
            <span className="mt-auto inline-block w-fit px-2.5 py-1 rounded-badge bg-ivory-100 border border-ivory-300 font-accent text-[11px] uppercase tracking-wide text-charcoal-700/60">
              {tag}
            </span>
          </div>
        ))}
      </div>

      <p className="font-body text-body-sm text-charcoal-700/50">
        Fundação no ar: login, papéis e banco de dados prontos. As telas acima
        chegam nas próximas sub-entregas.
      </p>
    </div>
  )
}
