# Runbook — Claude Code · Studio Ira Oliveira

> **Como usar:** salve este arquivo na raiz do projeto (ex.: `IMPLEMENTACAO_HERO.md`) e diga ao Claude Code:
> *"Leia o IMPLEMENTACAO_HERO.md e execute o BLOCO 1. Depois pare e me mostre o resultado. Não execute o BLOCO 2 sem eu pedir."*

---

## Contexto e regras (NÃO violar)

- Projeto **Next.js 16** (App Router) + React 19 + **Tailwind CSS v4** + Supabase. Arquitetura **atomic design** (`atoms` / `molecules` / `organisms`).
- ⚠️ **Antes de usar qualquer API nova do Next, leia `node_modules/next/dist/docs/`** — esta versão tem breaking changes (vide `AGENTS.md`). As mudanças deste runbook usam APIs já presentes no projeto, então não inventar padrões novos.
- **Tailwind v4:** tokens vivem em `@theme` dentro de `src/app/globals.css`. **Não** existe `tailwind.config.js` — não criar.
- **NÃO alterar** a lógica do Supabase nem as props de `BookingSection` (`profissionais`, `servicos`, `diasAtendidos`). O trabalho é só de **design/UI**.
- Preservar textos e dados reais (endereço, WhatsApp, Instagram, números).
- Ao final de cada bloco: rodar `npm run lint` e `npm run dev`, e reportar.

---

## Pré-requisito manual (VOCÊ, não o Claude Code)

O Claude Code **não gera o binário de vídeo**. Copie os dois arquivos recebidos para dentro do projeto **antes** do BLOCO 1:

- `hero.mp4`  →  `public/videos/hero.mp4`
- `hero-poster.jpg`  →  `public/videos/hero-poster.jpg`

(O vídeo já vem sem áudio, com `faststart`, 720p, ~2,2 MB.)

---

# BLOCO 1 — Vídeo cinematográfico no hero (obrigatório)

**Objetivo:** vídeo de fundo no hero em loop, sem áudio, sem nenhum controle/botão, não interativo; texto adaptado para fundo escuro; respeitar `prefers-reduced-motion` (pausa no poster).

## 1.1 Comandos

```bash
mkdir -p public/videos
ls -la public/videos/hero.mp4 public/videos/hero-poster.jpg
```

## 1.2 Substituir `src/components/organisms/HeroSection/HeroSection.tsx`

Sobrescreva o arquivo inteiro com:

```tsx
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
```

## 1.3 Substituir `src/components/molecules/StatItem/StatItem.tsx`

Sobrescreva o arquivo inteiro com (adiciona a prop `tone`; default `'light'` não afeta outros usos e corrige o contraste AA do número):

```tsx
import { cn } from '@/lib/utils'

interface StatItemProps {
  value:     string
  label:     string
  /** 'light' = sobre fundo claro (marfim) · 'dark' = sobre fundo escuro/vídeo. */
  tone?:     'light' | 'dark'
  className?: string
}

export function StatItem({ value, label, tone = 'light', className }: StatItemProps) {
  const isDark = tone === 'dark'
  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <span className={cn(
        'font-display text-display-md leading-none tabular-nums',
        // gold-700 no claro garante contraste AA; gold-300 brilha no escuro
        isDark ? 'text-gold-300' : 'text-gold-700',
      )}>
        {value}
      </span>
      <span className={cn(
        'font-accent text-label uppercase tracking-widest',
        isDark ? 'text-ivory-100/70' : 'text-charcoal-700',
      )}>
        {label}
      </span>
    </div>
  )
}
```

## 1.4 Substituir `src/components/molecules/SpecialtyCard/SpecialtyCard.tsx`

Sobrescreva o arquivo inteiro com (adiciona a prop `tone`):

```tsx
import { cn } from '@/lib/utils'

interface SpecialtyCardProps {
  icon:      React.ReactNode
  title:     string
  /** 'light' = fundo claro (marfim) · 'dark' = sobre vídeo/fundo escuro. */
  tone?:     'light' | 'dark'
  className?: string
}

export function SpecialtyCard({ icon, title, tone = 'light', className }: SpecialtyCardProps) {
  const isDark = tone === 'dark'
  return (
    <div className={cn(
      'flex flex-col items-center gap-3 px-6 py-5 rounded-card transition-all duration-300 ease-smooth',
      isDark
        ? 'bg-charcoal-800/40 backdrop-blur-sm border border-ivory-100/15 hover:bg-charcoal-800/60 hover:border-gold-300/40'
        : 'bg-ivory-100 border border-ivory-200 hover:border-gold-200 hover:bg-ivory-50 hover:shadow-card-rest',
      className,
    )}>
      <div className={cn(
        'w-11 h-11 rounded-full flex items-center justify-center',
        isDark
          ? 'bg-gold-300/15 border border-gold-300/30 text-gold-300'
          : 'bg-gold-100 border border-gold-200 text-gold-600',
      )}>
        {icon}
      </div>
      <p className={cn(
        'font-accent text-body-sm font-medium leading-snug text-center',
        isDark ? 'text-ivory-100' : 'text-charcoal-800',
      )}>
        {title}
      </p>
    </div>
  )
}
```

## 1.5 Verificação do BLOCO 1

```bash
npm run lint
npm run dev
```

Conferir no hero:
- [ ] vídeo em **loop**, **sem som**
- [ ] **nenhum** botão de play/pause, sem menu de contexto, não clicável
- [ ] poster aparece instantaneamente antes de carregar
- [ ] texto legível sobre o vídeo
- [ ] "movimento reduzido" no SO → vídeo pausado no poster, sem controles
- [ ] nada quebrou em outras seções (StatItem/SpecialtyCard sem `tone` continuam claros)

**Pare aqui e reporte.** Só siga para o BLOCO 2 se solicitado.

---

# BLOCO 2 — Refino premium (opcional)

> Aplicar só se pedido. Um commit por item. Justificativas completas em `Studio_Ira_Oliveira_ChangeSet_PR_v4.md`.

## 2.1 Anexar utilities ao FINAL de `src/app/globals.css` (não substituir nada)

```css
/* ════════════════════════════════════════════════════════════════════════
   REFINO PREMIUM v3 — ADIÇÕES AO globals.css
   Cole este bloco NO FIM do seu src/app/globals.css (append-only).
   Estende o sistema "Ouro Envelhecido sobre Marfim" — não substitui nada.
   Mantém o padrão @utility / @keyframes / @layer que o arquivo já usa.
   ════════════════════════════════════════════════════════════════════════ */


/* ─── MOVIMENTO 1 · Ritmo claro/escuro (drama editorial estilo OBSIDIAN) ────
   Use para ancorar 1–2 seções (ex.: Gallery ou Location) em campo escuro.
   Sobre o charcoal, o ouro vira luz de verdade. */
@utility bg-section-dark {
  background-color: var(--color-charcoal-900);
  color: var(--color-ivory-100);
}
@utility text-on-dark-muted {
  color: color-mix(in srgb, var(--color-ivory-100) 65%, transparent);
}


/* ─── MOVIMENTO 2 · Marquee cinético (faixa de manifesto — estilo Couture) ──
   Markup: <div class="marquee-mask"><div class="marquee-track">…grupo…grupo…</div></div>
   Duplique o grupo de texto para o loop ficar contínuo.
   Pausa no hover; o seu @media (prefers-reduced-motion) já congela a animação. */
@layer utilities {
  .marquee-mask  { overflow: hidden; }
  .marquee-track {
    display: flex;
    width: max-content;
    gap: 3rem;
    animation: marquee 32s linear infinite;
  }
  .marquee-track:hover { animation-play-state: paused; }
}
@keyframes marquee {
  to { transform: translateX(-50%); }
}


/* ─── MOVIMENTO 3 · Tipografia empilhada sobre retrato (palavra como imagem) ─
   Ex.: LOIROS · COR · TEXTURA · BRILHO, uma palavra por card de especialidade.
   Aplicar branco sobre overlay escuro da foto. */
@utility text-stack {
  font-family: var(--font-accent);
  text-transform: uppercase;
  line-height: 0.9;
  letter-spacing: 0.01em;
  font-size: clamp(2.5rem, 8vw, 6rem);
}


/* ─── MOVIMENTO 4 · Kicker único padronizado ───────────────────────────────
   Substitui o ornamento ✦ repetido. Um filete dourado curto + label.
   Markup: <span class="kicker">Transformações Reais</span> */
@utility kicker {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-family: var(--font-accent);
  font-size: 0.75rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-gold-700);   /* ouro legível: ver regra de contraste abaixo */
}
@utility kicker::before {
  content: "";
  width: 1.75rem;
  height: 1px;
  background-color: var(--color-gold-400);
}


/* ════════════════════════════════════════════════════════════════════════
   REGRAS DE USO (não geram CSS — disciplina que separa luxo seguro de $10K)
   ────────────────────────────────────────────────────────────────────────
   • text-gradient-gold ....... no MÁXIMO 1×/tela (um número OU uma palavra).
                                Hierarquia vem de escala + peso, não de cor.
   • ouro como TEXTO .......... apenas gold-700 / gold-800 (AA). gold-300/400/500
                                ficam só para filetes, ícones, bordas, decoração.
                                Texto de leitura: charcoal-800 / charcoal-900.
   • --animate-float / pulse-soft (infinitos) ... manter em no máx. 1 detalhe.
                                Movimento que sussurra, não que flutua o tempo todo.
   • --shadow-glow-gold ....... reservar para 1 momento (CTA principal).
   • acento de drama .......... promover blush-300 (ou vinho discreto) para marcar
                                1 palavra-chave por título grande (contraste OBSIDIAN).
   ════════════════════════════════════════════════════════════════════════ */
```

E adicionar também a variante dourada AA-friendly para texto:

```css
@utility text-gradient-gold-strong {
  background: linear-gradient(135deg, #a67e1e 0%, #7d5e16 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
```

## 2.2 Quebrar a centralização — `SectionHeading`

Em `src/components/molecules/SectionHeading/SectionHeading.tsx`:
- adicionar prop `align?: 'center' | 'left'` (default `'center'`);
- no wrapper, usar `cn('flex flex-col gap-4', align === 'left' ? 'items-start text-left' : 'items-center text-center', className)`;
- trocar o selo `✦`/`<Badge>` pelo `kicker`: `<span className={cn('kicker', isDark && 'text-gold-300')}>{eyebrow}</span>`.

Depois usar `align="left"` em `ServicesSection` e `LocationSection` (Gallery pode seguir centralizada).

## 2.3 Domar os orbs
Em `ServicesSection.tsx` e `LocationSection.tsx`: **remover** o `<div aria-hidden>` com o `radial-gradient` (glow). Manter glow no máximo em 1–2 seções.

## 2.4 Faixa marquee — em `src/app/page.tsx`, entre `<GallerySection />` e `<ServicesSection />`

```tsx
<div className="marquee-mask bg-section-dark py-4 border-y border-gold-800/40" aria-hidden="true">
  <div className="marquee-track font-accent text-label uppercase tracking-[0.18em] text-gold-300">
    {[0, 1].map((g) => (
      <span key={g} className="flex items-center gap-8 pr-8">
        <span>Especialistas em loiros</span><span className="text-gold-600">✦</span>
        <span>Coloração sob medida</span><span className="text-gold-600">✦</span>
        <span>Mechas &amp; luzes</span><span className="text-gold-600">✦</span>
        <span>Montes Claros — MG</span><span className="text-gold-600">✦</span>
      </span>
    ))}
  </div>
</div>
```

## 2.5 `next/image` na galeria — `GallerySection.tsx`
Trocar `<img>` por `next/image` (container já é `relative aspect-[3/4]`):

```tsx
import Image from 'next/image'
<Image src={photo.src} alt={photo.alt} fill
       sizes="(max-width:768px) 50vw, 25vw"
       className="relative z-10 object-cover object-top transition-transform duration-700 group-hover:scale-105" />
```

## 2.6 SEO — JSON-LD `HairSalon` em `src/app/layout.tsx`

```tsx
const salonSchema = {
  '@context': 'https://schema.org', '@type': 'HairSalon',
  name: 'Studio Ira Oliveira',
  address: { '@type': 'PostalAddress', streetAddress: 'Rua Ary Colen, 47-A',
             addressLocality: 'Montes Claros', addressRegion: 'MG',
             postalCode: '39401-032', addressCountry: 'BR' },
  telephone: '+5538988085086', priceRange: '$$',
  openingHours: ['Mo-Fr 09:00-19:00', 'Sa 09:00-17:00'],
  sameAs: ['https://www.instagram.com/ira_studio/'],
  url: process.env.NEXT_PUBLIC_SITE_URL,
}
// <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(salonSchema) }} />
```

## 2.7 Manual (Vercel — fora do código)
Definir **`NEXT_PUBLIC_SITE_URL`** (ex.: `https://studioira.vercel.app`) em *Vercel → Settings → Environment Variables* e **redeploy**. Corrige a OG image que hoje resolve para `localhost`.

## 2.8 Verificação do BLOCO 2
```bash
npm run lint
npm run build
```

---

## Resumo dos arquivos tocados

| Arquivo | Bloco | Ação |
|---|---|---|
| `public/videos/hero.mp4` · `hero-poster.jpg` | 1 | adicionar (manual) |
| `src/components/organisms/HeroSection/HeroSection.tsx` | 1 | substituir |
| `src/components/molecules/StatItem/StatItem.tsx` | 1 | substituir |
| `src/components/molecules/SpecialtyCard/SpecialtyCard.tsx` | 1 | substituir |
| `src/app/globals.css` | 2 | append |
| `src/components/molecules/SectionHeading/SectionHeading.tsx` | 2 | editar |
| `src/components/organisms/ServicesSection/ServicesSection.tsx` | 2 | editar |
| `src/components/organisms/LocationSection/LocationSection.tsx` | 2 | editar |
| `src/components/organisms/GallerySection/GallerySection.tsx` | 2 | editar |
| `src/app/page.tsx` | 2 | editar |
| `src/app/layout.tsx` | 2 | editar |
