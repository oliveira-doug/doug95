import { SectionHeading } from '@/components/molecules/SectionHeading/SectionHeading'
import { Reveal } from '@/components/atoms/Reveal/Reveal'
import { BookingFlow } from '@/app/(marketing)/agendar/BookingFlow'
import type { Profissional, Servico } from '@/lib/supabase/types'

type DiaAtendido = { profissional_id: string; dia_semana: number }

type Props = {
  profissionais: Profissional[]
  servicos: Servico[]
  diasAtendidos: DiaAtendido[]
}

/* Seção de agendamento na home: cliente vê os horários livres e pré-agenda
   ali mesmo. O salão confirma no painel e avisa pelo WhatsApp. */
export function BookingSection({ profissionais, servicos, diasAtendidos }: Props) {
  return (
    <section
      id="agendar"
      aria-label="Agendar horário"
      className="relative w-full bg-gradient-hero py-section-md overflow-hidden"
    >
      {/* Glow dourado de fundo */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-[-10%] right-[-8%] w-[440px] h-[440px] rounded-full blur-[140px]"
          style={{ background: 'radial-gradient(circle, rgba(228,192,110,0.18) 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative max-w-2xl mx-auto px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            className="mb-10"
            eyebrow="Agende Online"
            title="Reserve o seu horário"
            description="Escolha o profissional, o dia e a hora. Você recebe a confirmação pelo WhatsApp — rápido e sem compromisso."
          />
        </Reveal>

        <Reveal delay={100}>
          {profissionais.length === 0 ? (
            <p className="text-center font-body text-body-md text-charcoal-700/60">
              Agendamento online em breve. Fale com a gente pelo WhatsApp. 💛
            </p>
          ) : (
            <BookingFlow
              profissionais={profissionais}
              servicos={servicos}
              diasAtendidos={diasAtendidos}
            />
          )}
        </Reveal>
      </div>
    </section>
  )
}
