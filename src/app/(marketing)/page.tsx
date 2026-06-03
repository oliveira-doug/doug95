import { Header }         from '@/components/organisms/Header/Header'
import { HeroSection }     from '@/components/organisms/HeroSection/HeroSection'
import { GallerySection }  from '@/components/organisms/GallerySection/GallerySection'
import { ServicesSection } from '@/components/organisms/ServicesSection/ServicesSection'
import { BookingSection }  from '@/components/organisms/BookingSection/BookingSection'
import { LocationSection } from '@/components/organisms/LocationSection/LocationSection'
import { Footer }          from '@/components/organisms/Footer/Footer'
import { createClient }    from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  const [profissionais, servicos, horarios] = await Promise.all([
    supabase.from('profissionais').select('*').eq('ativo', true).order('ordem'),
    supabase.from('servicos').select('*').eq('ativo', true).order('ordem'),
    supabase.from('horarios').select('profissional_id, dia_semana'),
  ])

  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <GallerySection />

        {/* Faixa marquee — manifesto cinético (decorativo) */}
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

        <ServicesSection />
        <BookingSection
          profissionais={profissionais.data ?? []}
          servicos={servicos.data ?? []}
          diasAtendidos={horarios.data ?? []}
        />
        <LocationSection />
        {/* SocialProofSection — Entrega 4 */}
      </main>
      <Footer />
    </>
  )
}
