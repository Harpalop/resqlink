import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { ScrollProgress } from '@/components/effects/scroll-progress'
import { Hero } from '@/pages/landing/sections/hero'
import { Ecosystem } from '@/pages/landing/sections/ecosystem'
import { Features } from '@/pages/landing/sections/features'
import { Technology } from '@/pages/landing/sections/technology'
import { Workflow } from '@/pages/landing/sections/workflow'
import { Testimonials } from '@/pages/landing/sections/testimonials'
import { FinalCta } from '@/pages/landing/sections/cta'

export default function LandingPage() {
  return (
    <div className="noise-overlay relative min-h-screen">
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <Ecosystem />
        <Features />
        <Technology />
        <Workflow />
        <Testimonials />
        <FinalCta />
      </main>
      <Footer />
    </div>
  )
}
