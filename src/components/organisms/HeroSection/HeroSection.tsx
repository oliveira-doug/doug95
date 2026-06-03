'use client'

import { useEffect, useRef } from 'react'
import { Scissors, Palette, Droplets, ArrowRight } from 'lucide-react'
import { Badge }         from '@/components/atoms/Badge/Badge'
import { Button }        from '@/components/atoms/Button/Button'
import { StatItem }      from '@/components/molecules/StatItem/StatItem'
import { SpecialtyCard } from '@/components/molecules/SpecialtyCard/SpecialtyCard'
import { CONTACT }       from '@/config/site'

// ─── Dados reais do Studio Ira Oliveira ──────────────────────────────────────

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

// ─── Vídeo de fundo cinematográfico ───────────────────────────────────────────
// Loop, sem áudio, sem controles, não interativo. Respeita prefers-reduced-motion
// (pausa e mostra o poster). Arquivos em: public/videos/hero.mp4 + hero-poster.jpg

function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    // Garante mudo mesmo onde o React não reflete o atributo na propriedade DOM.
    v.muted = true
    v.defaultMuted = true

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      v.pause()            // usuário pediu menos movimento → fica no poster
      return
    }
    v.play().catch(() => {}) // autoplay mudo é permitido; ignora rejeição rara
  }, [])

  return (
    <video
      ref={videoRef}
      aria-hidden="true"
      tabIndex={-1}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      disablePictureInPicture
      poster="/videos/hero-poster.jpg"
      className="absolute inset-0 z-0 w-full h-full object-cover object-center
                 pointer-events-none select-none"
    >
      <source src="/videos/hero.mp4" type="video/mp4" />
    </video>
  )
}

// ─── Sub-componentes ─────────────────────────────────────────────────────────

/* Divisor ornamental dourado */
function GoldDivider() {
  return (
    <div aria-hidden="true" className="flex items-center gap-3 w-full max-w-[280px]">
      <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, #e4c06e)' }} />
      <span className="text-gold-300 text-xs leading-none select-none">✦</span>
      <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, #e4c06e)' }} />
    </div>
  )
}

/* Underline SVG ornamental da headline */
function GoldUnderline() {
  return (
    <svg aria-hidden="true" viewBox="0 0 300 10" fill="none" preserveAspectRatio="none"
         className="absolute -bottom-1 left-0 w-full h-auto opacity-80">
      <path d="M2 7C60 3 120 2 150 4C180 6 240 7 298 4"
            stroke="url(#gold-line)" strokeWidth="2.5" strokeLinecap="round" />
      <defs>
        <linearGradient id="gold-line" x1="0" y1="0" x2="300" y2="0">
          <stop offset="0%"   stopColor="#e4c06e" />
          <stop offset="100%" stopColor="#d4a843" />
        </linearGradient>
      </defs>
    </svg>
  )
}

/* Botão Instagram — versão clara para fundo escuro */
function InstagramButton() {
  return (
    <a href={CONTACT.instagram}
       target="_blank" rel="noopener noreferrer"
       className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-badge
                  border border-ivory-100/40 text-ivory-50 bg-ivory-50/5 backdrop-blur-sm
                  font-accent text-body-lg font-medium tracking-wide
                  hover:border-gold-300 hover:text-gold-300
                  transition-all duration-300 ease-smooth"
       aria-label="Seguir o Studio Ira Oliveira no Instagram">
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

/* Indicador de scroll — versão clara */
function ScrollIndicator() {
  return (
    <button onClick={() => scrollTo('galeria')}
            aria-label="Rolar para ver as transformações"
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10
                       flex flex-col items-center gap-2 opacity-60 hover:opacity-90
                       transition-opacity duration-300 bg-transparent border-none cursor-pointer
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300">
      <span className="font-accent text-label text-ivory-100 uppercase tracking-widest">Deslize</span>
      <div className="w-px h-10 animate-pulse-soft"
           style={{ background: 'linear-gradient(to bottom, #e4c06e, transparent)' }} />
    </button>
  )
}

// ─── Organismo: HeroSection ───────────────────────────────────────────────────

export function HeroSection() {
  return (
    <section id="inicio" aria-label="Apresentação do Studio Ira Oliveira"
             className="relative min-h-screen bg-charcoal-900 flex items-center justify-center overflow-hidden">

      {/* Camada 0 — vídeo de fundo */}
      <HeroVideo />

      {/* Camada 1 — scrim para legibilidade (mais forte no topo e na base) */}
      <div aria-hidden="true" className="absolute inset-0 z-[1]"
           style={{ background: 'linear-gradient(180deg, rgba(15,13,11,0.62) 0%, rgba(15,13,11,0.34) 38%, rgba(15,13,11,0.70) 100%)' }} />

      {/* Camada 10 — conteúdo */}
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

        {/* 2. Divisor ornamental */}
        <div className="animate-fade-up animate-delay-100">
          <GoldDivider />
        </div>

        {/* 3. Headline principal — texto claro sobre o vídeo */}
        <div className="flex flex-col items-center gap-6 animate-fade-up animate-delay-200">
          <h1 className="font-display font-light text-ivory-50
                         text-[clamp(2.5rem,9vw,6.5rem)]
                         leading-[1.02] tracking-[-0.025em]
                         text-balance text-center max-w-[14ch] px-2
                         [text-shadow:0_2px_30px_rgba(0,0,0,0.35)]">
            Realce a sua{' '}
            <span className="relative inline-block">
              <span className="relative z-10 text-gradient-gold italic">beleza natural</span>
              <GoldUnderline />
            </span>
          </h1>

          <p className="font-body text-body-lg text-ivory-100/85 text-balance leading-relaxed max-w-[46ch]">
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
                        border-t border-ivory-100/20 animate-fade-up animate-delay-500"
             aria-label="Números do studio" role="list">
          {STATS.map((stat, i) => (
            <div key={stat.label} role="listitem" className="flex items-center gap-10">
              <StatItem value={stat.value} label={stat.label} tone="dark" />
              {i < STATS.length - 1 && (
                <div aria-hidden="true" className="hidden sm:block w-px h-8 bg-ivory-100/20" />
              )}
            </div>
          ))}
        </div>

        {/* 6. Grid de especialidades */}
        <div className="w-full animate-fade-up animate-delay-700">
          <p className="font-accent text-label text-ivory-100/70 uppercase tracking-widest mb-5">
            Especialidades
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {SPECIALTIES.map((spec) => (
              <SpecialtyCard key={spec.title} icon={spec.icon} title={spec.title} tone="dark" />
            ))}
          </div>
        </div>

      </div>

      <ScrollIndicator />
    </section>
  )
}
