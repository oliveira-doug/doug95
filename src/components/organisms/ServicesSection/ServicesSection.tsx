'use client'

import { useState } from 'react'
import { Scissors, Palette, Sparkles, Droplets, Wand2, Sparkle } from 'lucide-react'
import { Badge } from '@/components/atoms/Badge/Badge'
import { WhatsAppIcon } from '@/components/atoms/WhatsAppIcon/WhatsAppIcon'
import { WhatsAppLink } from '@/components/atoms/WhatsAppLink/WhatsAppLink'
import { SectionHeading } from '@/components/molecules/SectionHeading/SectionHeading'
import { Reveal } from '@/components/atoms/Reveal/Reveal'

const SERVICOS_WA_MESSAGE =
  'Olá! Vim pelo site e gostaria de uma avaliação e os valores dos serviços do Studio Íra. 💛'

// ─── Dados reais do Studio Íra Oliveira ──────────────────────────────────────

type Category = 'Cabelo' | 'Coloração' | 'Tratamentos' | 'Visagismo'

const FILTERS = ['Todos', 'Cabelo', 'Coloração', 'Tratamentos', 'Visagismo'] as const
type Filter = (typeof FILTERS)[number]

interface Service {
  name: string
  description: string
  categories: Category[]
  featured?: boolean // especialidade da casa (loiros)
  icon: React.ReactNode
}

/* Ícones Lucide — traço fino (1.5), tamanho consistente (22) */
const ICON_SIZE = 22
const ICON_STROKE = 1.5

const SERVICES: Service[] = [
  {
    name: 'Corte Feminino',
    description: 'Corte personalizado segundo o formato do rosto e o seu estilo, com técnica de visagismo.',
    categories: ['Cabelo', 'Visagismo'],
    icon: <Scissors size={ICON_SIZE} strokeWidth={ICON_STROKE} />,
  },
  {
    name: 'Coloração',
    description: 'Cores sob medida, do natural ao ousado, preservando a saúde e o brilho dos fios.',
    categories: ['Coloração'],
    featured: true,
    icon: <Palette size={ICON_SIZE} strokeWidth={ICON_STROKE} />,
  },
  {
    name: 'Mechas / Luzes',
    description: 'Mechas, luzes e loiros iluminados com técnica refinada — a nossa especialidade.',
    categories: ['Coloração'],
    featured: true,
    icon: <Sparkles size={ICON_SIZE} strokeWidth={ICON_STROKE} />,
  },
  {
    name: 'Hidratação',
    description: 'Reposição profunda de nutrientes e brilho, para fios macios, leves e saudáveis.',
    categories: ['Tratamentos'],
    icon: <Droplets size={ICON_SIZE} strokeWidth={ICON_STROKE} />,
  },
  {
    name: 'Progressiva',
    description: 'Redução de volume e alinhamento dos fios com acabamento natural e duradouro.',
    categories: ['Cabelo', 'Tratamentos'],
    icon: <Wand2 size={ICON_SIZE} strokeWidth={ICON_STROKE} />,
  },
  {
    name: 'Outros',
    description: 'Penteados, finalização e cuidados especiais sob medida. Fale conosco para uma avaliação.',
    categories: ['Cabelo', 'Tratamentos', 'Visagismo'],
    icon: <Sparkle size={ICON_SIZE} strokeWidth={ICON_STROKE} />,
  },
]

// ─── Card de serviço ──────────────────────────────────────────────────────────

function ServiceCard({ service }: { service: Service }) {
  return (
    <article
      className="group relative flex flex-col gap-4 h-full p-7 rounded-card overflow-hidden
                 bg-ivory-50 border border-ivory-300
                 shadow-card-rest hover:shadow-card-hover hover:-translate-y-1
                 transition-all duration-300 ease-smooth"
    >
      {/* Filete dourado que cresce no hover — detalhe editorial */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[3px] bg-gradient-gold
                   origin-left scale-x-0 group-hover:scale-x-100
                   transition-transform duration-500 ease-smooth"
      />

      {/* Selo de especialidade (loiros) */}
      {service.featured && (
        <Badge
          variant="gold"
          className="absolute top-5 right-5 !px-2.5 !py-0.5 text-[10px] tracking-wide"
        >
          <span aria-hidden="true">✦</span>
          Loiros
        </Badge>
      )}

      {/* Ícone */}
      <div className="w-12 h-12 rounded-full bg-gold-100 border border-gold-200
                      flex items-center justify-center text-gold-600
                      group-hover:bg-gradient-gold group-hover:text-ivory-50
                      group-hover:border-transparent transition-all duration-300">
        {service.icon}
      </div>

      {/* Nome */}
      <h3 className="font-display text-display-md text-charcoal-900 leading-tight">
        {service.name}
      </h3>

      {/* Descrição */}
      <p className="font-body text-body-sm text-charcoal-700 leading-relaxed flex-1">
        {service.description}
      </p>

      {/* Rodapé do card — preço */}
      <div className="flex items-center justify-between pt-4 border-t border-ivory-300">
        <span className="font-accent text-label uppercase tracking-widest text-charcoal-700/60">
          Investimento
        </span>
        <span className="font-display italic text-body-lg text-gold-600">
          Sob consulta
        </span>
      </div>
    </article>
  )
}

// ─── Organismo: ServicesSection ───────────────────────────────────────────────

export function ServicesSection() {
  const [active, setActive] = useState<Filter>('Todos')

  const visible =
    active === 'Todos'
      ? SERVICES
      : SERVICES.filter((s) => s.categories.includes(active as Category))

  return (
    <section
      id="servicos"
      aria-label="Serviços do Studio Íra Oliveira"
      className="relative w-full bg-ivory-100 py-section-md overflow-hidden"
    >
      {/* Glow dourado sutil — atmosfera de fundo */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-24 right-[-10%] w-[480px] h-[480px] rounded-full blur-[150px]"
          style={{ background: 'radial-gradient(circle, rgba(228,192,110,0.18) 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative max-w-content mx-auto px-6 lg:px-8">

        {/* Cabeçalho da seção */}
        <Reveal>
        <SectionHeading
          className="mb-10"
          eyebrow="Nossos Serviços"
          titleClassName="max-w-[18ch]"
          title={
            <>
              Especialistas em <span className="text-gradient-gold italic">loiros</span> e transformações
            </>
          }
          description="Cada procedimento é pensado para realçar a sua beleza natural com técnica, cuidado e produtos de alta performance. Valores sob consulta, de acordo com o seu cabelo."
        />
        </Reveal>

        {/* Filtro por categoria */}
        <div
          role="group"
          aria-label="Filtrar serviços por categoria"
          className="flex flex-wrap justify-center gap-2.5 mb-10 animate-fade-up animate-delay-100"
        >
          {FILTERS.map((filter) => {
            const isActive = filter === active
            return (
              <button
                key={filter}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActive(filter)}
                className={[
                  'h-10 px-5 rounded-badge font-accent text-body-sm font-medium tracking-wide',
                  'transition-all duration-300 ease-smooth cursor-pointer select-none',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2',
                  isActive
                    ? 'bg-gradient-gold text-ivory-50 shadow-card-rest'
                    : 'bg-ivory-50 text-charcoal-700 border border-ivory-300 hover:border-gold-400 hover:text-gold-600',
                ].join(' ')}
              >
                {filter}
              </button>
            )
          })}
        </div>

        {/* Grid de serviços */}
        <div
          key={active}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-up"
        >
          {visible.map((service) => (
            <ServiceCard key={service.name} service={service} />
          ))}
        </div>

        {/* CTA — preços sob consulta → WhatsApp */}
        <div className="flex flex-col items-center gap-4 mt-12 text-center animate-fade-up animate-delay-200">
          <p className="font-body text-body-sm text-charcoal-700/70 max-w-[40ch]">
            Quer saber o valor ideal para o seu cabelo? Faça uma avaliação sem compromisso.
          </p>
          <WhatsAppLink
            source="servicos"
            message={SERVICOS_WA_MESSAGE}
            className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-badge
                       bg-gradient-gold text-ivory-50 font-accent text-body-lg font-medium tracking-wide
                       shadow-card-rest hover:shadow-card-hover hover:brightness-110 active:scale-[0.97]
                       transition-all duration-300 ease-smooth
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2"
            ariaLabel="Consultar valores pelo WhatsApp"
          >
            <WhatsAppIcon size={20} />
            Consultar Valores no WhatsApp
          </WhatsAppLink>
        </div>

      </div>
    </section>
  )
}
