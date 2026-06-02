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
