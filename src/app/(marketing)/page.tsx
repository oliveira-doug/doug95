import { Header }         from '@/components/organisms/Header/Header'
import { HeroSection }     from '@/components/organisms/HeroSection/HeroSection'
import { GallerySection }  from '@/components/organisms/GallerySection/GallerySection'
import { ServicesSection } from '@/components/organisms/ServicesSection/ServicesSection'
import { LocationSection } from '@/components/organisms/LocationSection/LocationSection'
import { Footer }          from '@/components/organisms/Footer/Footer'

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <GallerySection />
        <ServicesSection />
        <LocationSection />
        {/* SocialProofSection — Entrega 4 */}
        {/* BookingSection (Typebot) — Entrega 5 */}
      </main>
      <Footer />
    </>
  )
}
