'use client'

import { useState } from 'react'
import { Badge } from '@/components/atoms/Badge/Badge'

// ─── Dados reais do Studio Íra Oliveira ──────────────────────────────────────

const WHATSAPP = 'https://wa.me/5538988085086'

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

/* Ícones de linha — traço fino, acabamento premium */
const Icon = {
  scissors: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" />
      <path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12" />
    </svg>
  ),
  color: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a7 7 0 0 1 7 7c0 4-3 6.5-5 8.5a2 2 0 0 1-4 0C8 15.5 5 13 5 9a7 7 0 0 1 7-7z" />
      <path d="M12 6v6m-2-3 2 3 2-3" />
    </svg>
  ),
  drop: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3s6 5.5 6 10a6 6 0 0 1-12 0c0-4.5 6-10 6-10z" />
      <path d="M9 14a3 3 0 0 0 3 3" />
    </svg>
  ),
  iron: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7c4-2 8-2 12 0M5 12c4-1.5 8-1.5 12 0M6 17c3.5-1 7-1 10 0" />
      <path d="M19 5v14" />
    </svg>
  ),
  highlights: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v3m0 12v3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1M3 12h3m12 0h3M5.6 18.4l2.1-2.1m8.6-8.6 2.1-2.1" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  sparkle: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6z" />
    </svg>
  ),
}

const SERVICES: Service[] = [
  {
    name: 'Corte Feminino',
    description: 'Corte personalizado segundo o formato do rosto e o seu estilo, com técnica de visagismo.',
    categories: ['Cabelo', 'Visagismo'],
    icon: Icon.scissors,
  },
  {
    name: 'Coloração',
    description: 'Cores sob medida, do natural ao ousado, preservando a saúde e o brilho dos fios.',
    categories: ['Coloração'],
    featured: true,
    icon: Icon.color,
  },
  {
    name: 'Mechas / Luzes',
    description: 'Mechas, luzes e loiros iluminados com técnica refinada — a nossa especialidade.',
    categories: ['Coloração'],
    featured: true,
    icon: Icon.highlights,
  },
  {
    name: 'Hidratação',
    description: 'Reposição profunda de nutrientes e brilho, para fios macios, leves e saudáveis.',
    categories: ['Tratamentos'],
    icon: Icon.drop,
  },
  {
    name: 'Progressiva',
    description: 'Redução de volume e alinhamento dos fios com acabamento natural e duradouro.',
    categories: ['Cabelo', 'Tratamentos'],
    icon: Icon.iron,
  },
  {
    name: 'Outros',
    description: 'Penteados, finalização e cuidados especiais sob medida. Fale conosco para uma avaliação.',
    categories: ['Cabelo', 'Tratamentos', 'Visagismo'],
    icon: Icon.sparkle,
  },
]

// ─── Card de serviço ──────────────────────────────────────────────────────────

function ServiceCard({ service }: { service: Service }) {
  return (
    <article
      className="group relative flex flex-col gap-4 h-full p-7 rounded-card
                 bg-ivory-50 border border-ivory-300
                 shadow-card-rest hover:shadow-card-hover hover:-translate-y-1
                 transition-all duration-300 ease-smooth"
    >
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
      className="w-full bg-ivory-100 py-section-md"
    >
      <div className="max-w-content mx-auto px-6 lg:px-8">

        {/* Cabeçalho da seção */}
        <div className="flex flex-col items-center text-center gap-4 mb-10 animate-fade-up">
          <Badge variant="gold">
            <span aria-hidden="true">✦</span>
            Nossos Serviços
          </Badge>
          <h2 className="font-display text-display-xl text-charcoal-900 tracking-tight text-balance max-w-[18ch]">
            Especialistas em <span className="text-gradient-gold italic">loiros</span> e transformações
          </h2>
          <p className="font-body text-body-md text-charcoal-700 max-w-[46ch]">
            Cada procedimento é pensado para realçar a sua beleza natural com
            técnica, cuidado e produtos de alta performance. Valores sob consulta,
            de acordo com o seu cabelo.
          </p>
        </div>

        {/* Filtro por categoria */}
        <div
          role="tablist"
          aria-label="Filtrar serviços por categoria"
          className="flex flex-wrap justify-center gap-2.5 mb-10 animate-fade-up animate-delay-100"
        >
          {FILTERS.map((filter) => {
            const isActive = filter === active
            return (
              <button
                key={filter}
                role="tab"
                aria-selected={isActive}
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
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-badge
                       bg-gradient-gold text-ivory-50 font-accent text-body-lg font-medium tracking-wide
                       shadow-card-rest hover:shadow-card-hover hover:brightness-110 active:scale-[0.97]
                       transition-all duration-300 ease-smooth
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2"
            aria-label="Consultar valores pelo WhatsApp"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Consultar Valores no WhatsApp
          </a>
        </div>

      </div>
    </section>
  )
}
