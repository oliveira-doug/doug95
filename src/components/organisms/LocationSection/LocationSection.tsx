import { MapPin, Clock, CalendarCheck } from 'lucide-react'
import { WhatsAppIcon } from '@/components/atoms/WhatsAppIcon/WhatsAppIcon'
import { WhatsAppLink } from '@/components/atoms/WhatsAppLink/WhatsAppLink'
import { SectionHeading } from '@/components/molecules/SectionHeading/SectionHeading'
import { Reveal } from '@/components/atoms/Reveal/Reveal'
import { ADDRESS, CONTACT } from '@/config/site'

const LOCAL_WA_MESSAGE =
  'Olá! Vim pelo site e tenho uma dúvida sobre o Studio Ira Oliveira. 💛'

function MapOrPlaceholder() {
  if (ADDRESS.mapEmbedSrc) {
    return (
      <iframe
        src={ADDRESS.mapEmbedSrc}
        title="Localização do Studio Ira Oliveira"
        className="w-full h-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    )
  }

  /* Placeholder enquanto o link do Maps não é configurado */
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-ivory-100">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <path d="M20 4C14.48 4 10 8.48 10 14c0 8.25 10 22 10 22s10-13.75 10-22c0-5.52-4.48-10-10-10z"
              stroke="#c49a2a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="20" cy="14" r="3" stroke="#c49a2a" strokeWidth="1.5"/>
      </svg>
      <div className="text-center">
        <p className="font-accent text-body-sm text-charcoal-700 font-medium">
          Mapa será exibido aqui
        </p>
        <p className="font-body text-body-sm text-charcoal-700/60 mt-1 text-[11px]">
          Configure o <code>ADDRESS.mapEmbedSrc</code> em src/config/site.ts
        </p>
      </div>
    </div>
  )
}

export function LocationSection() {
  return (
    <section id="localizacao" aria-label="Localização do Studio Ira Oliveira"
             className="relative w-full bg-ivory-100 py-section-md overflow-hidden">

      {/* Glow blush sutil — atmosfera de fundo */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute bottom-[-15%] left-[-8%] w-[440px] h-[440px] rounded-full blur-[140px]"
          style={{ background: 'radial-gradient(circle, rgba(212,179,170,0.16) 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative max-w-content mx-auto px-6 lg:px-8">

        {/* Header centralizado */}
        <Reveal>
          <SectionHeading
            className="mb-12"
            eyebrow="Como Chegar"
            title="Venha nos visitar"
            description="Estamos em Montes Claros, no coração do bairro Funcionários. Fácil acesso e estacionamento próximo."
          />
        </Reveal>

        {/* Grid: Info + Mapa */}
        <Reveal delay={100} className="grid lg:grid-cols-2 gap-8 items-start">

          {/* Informações de contato */}
          <div className="flex flex-col gap-6">

            {/* Endereço */}
            <address className="not-italic flex flex-col gap-1">
              <div className="flex items-start gap-3">
                <div className="mt-1 w-9 h-9 rounded-full bg-gold-100 border border-gold-200 flex-shrink-0 flex items-center justify-center text-gold-500">
                  <MapPin size={16} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-accent text-body-md text-charcoal-900 font-semibold">
                    {ADDRESS.street}
                  </p>
                  <p className="font-body text-body-sm text-charcoal-700">
                    {ADDRESS.neighborhood} · {ADDRESS.city}
                  </p>
                </div>
              </div>
            </address>

            {/* Horários */}
            <div className="flex items-start gap-3">
              <div className="mt-1 w-9 h-9 rounded-full bg-gold-100 border border-gold-200 flex-shrink-0 flex items-center justify-center text-gold-500">
                <Clock size={16} strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-accent text-body-md text-charcoal-900 font-semibold">Horário de Atendimento</p>
                <p className="font-body text-body-sm text-charcoal-700">Seg–Sex: 9h às 19h</p>
                <p className="font-body text-body-sm text-charcoal-700">Sáb: 9h às 17h</p>
                <p className="font-body text-body-sm text-charcoal-700/60">Dom: Fechado</p>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 pt-2">
              <a href="#agendar"
                 className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-badge
                            bg-gradient-gold text-ivory-50
                            font-accent text-body-sm font-medium tracking-wide
                            shadow-card-rest hover:shadow-card-hover hover:brightness-110
                            transition-all duration-300 ease-smooth"
                 aria-label="Agendar online">
                <CalendarCheck size={17} strokeWidth={1.5} />
                Agendar online
              </a>

              <WhatsAppLink
                 source="localizacao"
                 message={LOCAL_WA_MESSAGE}
                 className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-badge
                            border border-gold-500 text-gold-600 bg-transparent
                            font-accent text-body-sm font-medium tracking-wide
                            hover:bg-gold-50 transition-all duration-300 ease-smooth"
                 ariaLabel="Tirar dúvidas no WhatsApp">
                <WhatsAppIcon size={17} />
                Tirar dúvidas
              </WhatsAppLink>

              <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-badge
                            border border-gold-500 text-gold-600 bg-transparent
                            font-accent text-body-sm font-medium tracking-wide
                            hover:bg-gold-50 transition-all duration-300 ease-smooth"
                 aria-label="Seguir no Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
                </svg>
                @ira_studio
              </a>
            </div>
          </div>

          {/* Mapa */}
          <div className="w-full h-72 lg:h-96 rounded-card overflow-hidden shadow-card-rest border border-ivory-300">
            <MapOrPlaceholder />
          </div>

        </Reveal>
      </div>
    </section>
  )
}
