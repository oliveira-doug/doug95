'use client'

import { Scissors, Palette, Droplets, ArrowRight } from 'lucide-react'
import { Badge }         from '@/components/atoms/Badge/Badge'
import { Button }        from '@/components/atoms/Button/Button'
import { StatItem }      from '@/components/molecules/StatItem/StatItem'
import { SpecialtyCard } from '@/components/molecules/SpecialtyCard/SpecialtyCard'
import { CONTACT }       from '@/config/site'

// ─── Dados reais do Studio Íra Oliveira ──────────────────────────────────────

const STATS = [
  { value: '2.400+', label: 'Clientes Atendidas' },
  { value: '8 anos', label: 'De Excelência'       },
  { value: '4.9 ★',  label: 'Avaliação Média'     },
] as const

const SPECIALTIES = [
  { title: 'Hair Stylist',          icon: <Scissors size={20} strokeWidth={1.5} /> },
  { title: 'Visagista / Colorista', icon: <Palette size={20} strokeWidth={1.5} /> },
  { title: 'Terapeuta Capilar',     icon: <Droplets size={20} strokeWidth={1.5} /> },
] as const

// ─── Helpers ─────────────────────────────────────────────────────────────────

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

// ─── Sub-componentes ─────────────────────────────────────────────────────────

function BackgroundOrbs() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Orb topo esquerdo */}
      <div className="absolute -top-32 -left-20 w-[600px] h-[600px] rounded-full blur-[160px]"
           style={{ background: 'radial-gradient(circle, rgba(228,192,110,0.22) 0%, transparent 70%)' }} />
      {/* Orb baixo direito */}
      <div className="absolute -bottom-24 -right-16 w-[500px] h-[500px] rounded-full blur-[140px]"
           style={{ background: 'radial-gradient(circle, rgba(212,179,170,0.18) 0%, transparent 70%)' }} />
      {/* Linha vertical esquerda */}
      <div className="absolute top-0 h-full w-px"
           style={{ left: 'max(2rem, calc(50% - 600px))', background: 'linear-gradient(to bottom, transparent, rgba(228,192,110,0.25), transparent)' }} />
      {/* Linha vertical direita */}
      <div className="absolute top-0 h-full w-px"
           style={{ right: 'max(2rem, calc(50% - 600px))', background: 'linear-gradient(to bottom, transparent, rgba(228,192,110,0.25), transparent)' }} />
    </div>
  )
}

/* Divisor ornamental dourado */
function GoldDivider() {
  return (
    <div aria-hidden="true" className="flex items-center gap-3 w-full max-w-[280px]">
      <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, #e4c06e)' }} />
      <span className="text-gold-400 text-xs leading-none select-none">✦</span>
      <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, #e4c06e)' }} />
    </div>
  )
}

/* Underline SVG ornamental da headline */
function GoldUnderline() {
  return (
    <svg aria-hidden="true" viewBox="0 0 300 10" fill="none" preserveAspectRatio="none"
         className="absolute -bottom-1 left-0 w-full h-auto opacity-70">
      <path d="M2 7C60 3 120 2 150 4C180 6 240 7 298 4"
            stroke="url(#gold-line)" strokeWidth="2.5" strokeLinecap="round" />
      <defs>
        <linearGradient id="gold-line" x1="0" y1="0" x2="300" y2="0">
          <stop offset="0%"   stopColor="#e4c06e" />
          <stop offset="100%" stopColor="#c49a2a" />
        </linearGradient>
      </defs>
    </svg>
  )
}

/* Botão Instagram */
function InstagramButton() {
  return (
    <a href={CONTACT.instagram}
       target="_blank" rel="noopener noreferrer"
       className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-badge
                  border border-charcoal-700/40 text-charcoal-700 bg-transparent
                  font-accent text-body-lg font-medium tracking-wide
                  hover:border-gold-500 hover:text-gold-600
                  transition-all duration-300 ease-smooth"
       aria-label="Seguir o Studio Íra Oliveira no Instagram">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
      </svg>
      {CONTACT.instagramHandle}
    </a>
  )
}

/* Indicador de scroll */
function ScrollIndicator() {
  return (
    <button onClick={() => scrollTo('galeria')}
            aria-label="Rolar para ver as transformações"
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10
                       flex flex-col items-center gap-2 opacity-40 hover:opacity-70
                       transition-opacity duration-300 bg-transparent border-none cursor-pointer
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500">
      <span className="font-accent text-label text-charcoal-700 uppercase tracking-widest">Deslize</span>
      <div className="w-px h-10 animate-pulse-soft"
           style={{ background: 'linear-gradient(to bottom, #d4a843, transparent)' }} />
    </button>
  )
}

// ─── Organismo: HeroSection ───────────────────────────────────────────────────

export function HeroSection() {
  return (
    <section id="inicio" aria-label="Apresentação do Studio Íra Oliveira"
             className="relative min-h-screen bg-gradient-hero flex items-center justify-center overflow-hidden">

      <BackgroundOrbs />

      {/* Bloco central — tudo alinhado ao centro (topo mais próximo do header) */}
      <div className="relative z-10 w-full max-w-content-sm mx-auto px-6 lg:px-8
                      pt-16 md:pt-20 pb-32 md:pb-40
                      flex flex-col items-center text-center gap-8">

        {/* 1. Badge de localização */}
        <div className="animate-fade-up">
          <Badge variant="gold">
            <span aria-hidden="true" className="text-gold-400">✦</span>
            Salão Premium · Montes Claros
          </Badge>
        </div>

        {/* 2. Divisor ornamental — transição elegante (nome do salão fica no Header) */}
        <div className="animate-fade-up animate-delay-100">
          <GoldDivider />
        </div>

        {/* 3. Headline principal — GANCHO visual de luxo */}
        <div className="flex flex-col items-center gap-6 animate-fade-up animate-delay-200">
          <h1 className="font-display font-light text-charcoal-900
                         text-[clamp(2.5rem,9vw,6.5rem)]
                         leading-[1.02] tracking-[-0.025em]
                         text-balance text-center max-w-[14ch] px-2">
            Realce a sua{' '}
            <span className="relative inline-block">
              <span className="relative z-10 text-gradient-gold italic">beleza natural</span>
              <GoldUnderline />
            </span>
          </h1>

          <p className="font-body text-body-lg text-charcoal-700 text-balance leading-relaxed max-w-[46ch]">
            Procedimentos exclusivos com quem entende de cabelo de verdade. Do
            diagnóstico capilar ao resultado final — técnica, cuidado e amor em
            cada atendimento.
          </p>
        </div>

        {/* 4. CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-up animate-delay-300">
          <Button size="lg" variant="primary"
                  onClick={() => scrollTo('agendar')}
                  aria-label="Ir para o agendamento online">
            Agendar Meu Horário
            <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
          </Button>
          <InstagramButton />
        </div>

        {/* 5. Barra de estatísticas */}
        <div className="flex flex-wrap justify-center gap-x-10 gap-y-6 pt-4 w-full max-w-sm
                        border-t border-ivory-300 animate-fade-up animate-delay-500"
             aria-label="Números do studio" role="list">
          {STATS.map((stat, i) => (
            <div key={stat.label} role="listitem" className="flex items-center gap-10">
              <StatItem value={stat.value} label={stat.label} />
              {/* Separador vertical entre stats */}
              {i < STATS.length - 1 && (
                <div aria-hidden="true" className="hidden sm:block w-px h-8 bg-ivory-300" />
              )}
            </div>
          ))}
        </div>

        {/* 6. Grid de especialidades */}
        <div className="w-full animate-fade-up animate-delay-700">
          <p className="font-accent text-label text-charcoal-700 uppercase tracking-widest mb-5">
            Especialidades
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {SPECIALTIES.map((spec) => (
              <SpecialtyCard key={spec.title} icon={spec.icon} title={spec.title} />
            ))}
          </div>
        </div>

      </div>

      <ScrollIndicator />
    </section>
  )
}
