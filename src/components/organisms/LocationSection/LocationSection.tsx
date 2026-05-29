const MAP_SRC = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3820.783061663292!2d-43.87777632706916!3d-16.737672746884513!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xab5367bd02e551%3A0xa2f6d268be726731!2sR.%20Ari%20Colen%2C%2047%20-%20Funcion%C3%A1rios%2C%20Montes%20Claros%20-%20MG%2C%2039401-032!5e0!3m2!1spt-BR!2sbr!4v1780025982296!5m2!1spt-BR!2sbr'

const ADDRESS = {
  street: 'Rua Ary Colen, 47-A',
  neighborhood: 'Funcionários',
  city: 'Montes Claros — MG',
  whatsapp: 'https://wa.me/5538988085086',
  instagram: 'https://www.instagram.com/ira_studio/',
}

function MapOrPlaceholder() {
  if (MAP_SRC) {
    return (
      <iframe
        src={MAP_SRC}
        title="Localização do Studio Íra Oliveira"
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
          Configure o <code>MAP_SRC</code> em LocationSection.tsx
        </p>
      </div>
    </div>
  )
}

export function LocationSection() {
  return (
    <section id="localizacao" aria-label="Localização do Studio Íra Oliveira"
             className="w-full bg-ivory-100 py-section-md">

      <div className="max-w-content mx-auto px-6 lg:px-8">

        {/* Header centralizado */}
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-badge
                           bg-gold-100 text-gold-700 border border-gold-200
                           font-accent text-label font-semibold uppercase tracking-widest">
            <span aria-hidden="true">✦</span>
            Como Chegar
          </span>
          <h2 className="font-display text-display-xl text-charcoal-900 tracking-tight">
            Venha nos visitar
          </h2>
          <p className="font-body text-body-md text-charcoal-700 max-w-[38ch]">
            Estamos em Montes Claros, no coração do bairro Funcionários. Fácil acesso e estacionamento próximo.
          </p>
        </div>

        {/* Grid: Info + Mapa */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">

          {/* Informações de contato */}
          <div className="flex flex-col gap-6">

            {/* Endereço */}
            <address className="not-italic flex flex-col gap-1">
              <div className="flex items-start gap-3">
                <div className="mt-1 w-9 h-9 rounded-full bg-gold-100 border border-gold-200 flex-shrink-0 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c49a2a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                    <circle cx="12" cy="9" r="2.5"/>
                  </svg>
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
              <div className="mt-1 w-9 h-9 rounded-full bg-gold-100 border border-gold-200 flex-shrink-0 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c49a2a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9"/>
                  <path d="M12 7v5l3 3"/>
                </svg>
              </div>
              <div>
                <p className="font-accent text-body-md text-charcoal-900 font-semibold">Horário de Atendimento</p>
                <p className="font-body text-body-sm text-charcoal-700">Seg–Sex: 9h às 19h</p>
                <p className="font-body text-body-sm text-charcoal-700">Sáb: 9h às 17h</p>
                <p className="font-body text-body-sm text-charcoal-700/60">Dom: Fechado</p>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a href={ADDRESS.whatsapp} target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-badge
                            bg-gradient-gold text-ivory-50
                            font-accent text-body-sm font-medium tracking-wide
                            shadow-card-rest hover:shadow-card-hover hover:brightness-110
                            transition-all duration-300 ease-smooth"
                 aria-label="Agendar via WhatsApp">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Agendar pelo WhatsApp
              </a>

              <a href={ADDRESS.instagram} target="_blank" rel="noopener noreferrer"
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

        </div>
      </div>
    </section>
  )
}
