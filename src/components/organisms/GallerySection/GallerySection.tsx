// ── Vitrine de Transformações ──────────────────────────────────────────────
// Caminhos LOCAIS estritos. Para adicionar/trocar fotos, basta substituir os
// arquivos em: public/images/transformacoes/foto1.jpg ... foto4.jpg
// A <div> marfim atrás de cada <img> serve como skeleton elegante caso a
// foto ainda não exista na pasta — evitando ícone de imagem quebrada.

import { SectionHeading } from '@/components/molecules/SectionHeading/SectionHeading'
import { CONTACT } from '@/config/site'

const GALLERY = [
  { src: '/images/transformacoes/foto1.jpg', alt: 'Transformação capilar no Studio Íra Oliveira — penteado especial' },
  { src: '/images/transformacoes/foto2.jpg', alt: 'Transformação capilar no Studio Íra Oliveira — loiro ondulado' },
  { src: '/images/transformacoes/foto3.jpg', alt: 'Transformação capilar no Studio Íra Oliveira — coloração e brilho' },
  { src: '/images/transformacoes/foto4.jpg', alt: 'Transformação capilar no Studio Íra Oliveira — cachos definidos' },
] as const

/* ── Organismo: GallerySection ── */
export function GallerySection() {
  return (
    <section id="galeria" aria-label="Vitrine de transformações do Studio Íra Oliveira"
             className="w-full bg-charcoal-900 py-section-md overflow-hidden">

      {/* Header */}
      <div className="max-w-content mx-auto px-6 lg:px-8">
        <SectionHeading
          className="mb-10"
          tone="dark"
          eyebrow="Transformações Reais"
          title="Resultados que falam por si"
          description="Cada transformação é uma história. Veja o trabalho de quem cuida com técnica, amor e atenção aos detalhes."
        />
      </div>

      {/* Grid Premium — 2 colunas mobile, 4 colunas desktop */}
      <div className="max-w-content mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {GALLERY.map((photo) => (
            <div key={photo.src}
                 className="relative aspect-[3/4] rounded-xl overflow-hidden group
                            bg-[#f4f1eb] shadow-card-rest">
              {/* Skeleton/placeholder marfim fica visível enquanto a foto não carrega */}
              <div aria-hidden="true"
                   className="absolute inset-0 flex items-center justify-center bg-[#f4f1eb]">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="opacity-30">
                  <rect x="4" y="6" width="24" height="20" rx="3" stroke="#c49a2a" strokeWidth="1.4"/>
                  <circle cx="11" cy="14" r="2.5" stroke="#c49a2a" strokeWidth="1.4"/>
                  <path d="M4 22l7-6 5 5 4-4 8 7" stroke="#c49a2a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              {/* Imagem real (caminho local) por cima do placeholder */}
              <img
                src={photo.src}
                alt={photo.alt}
                loading="lazy"
                className="relative z-10 w-full h-full object-cover object-top
                           transition-transform duration-700 group-hover:scale-105"
              />

              {/* Overlay no hover com legenda */}
              <div className="absolute inset-0 z-20 bg-charcoal-900/55 opacity-0 group-hover:opacity-100
                              transition-opacity duration-300 flex items-end p-3">
                <p className="font-body text-body-sm text-ivory-100 leading-snug line-clamp-2">
                  {photo.alt}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Instagram */}
      <div className="mt-10 flex justify-center">
        <a href={CONTACT.instagram}
           target="_blank" rel="noopener noreferrer"
           className="inline-flex items-center gap-2 px-6 py-3 rounded-badge
                      border border-gold-600 text-gold-300
                      font-accent text-body-sm font-medium tracking-wide
                      hover:bg-gold-900/30 transition-all duration-300 ease-smooth"
           aria-label="Ver mais transformações no Instagram do Studio Íra Oliveira">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5"/>
            <circle cx="12" cy="12" r="4"/>
            <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
          </svg>
          Ver mais no {CONTACT.instagramHandle}
        </a>
      </div>
    </section>
  )
}
