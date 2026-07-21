import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'
import { SectionHeading } from '@/components/ui/section-heading'
import { SpotlightCard } from '@/components/effects/spotlight-card'
import { fadeUp, staggerContainer } from '@/lib/motion'
import { cn } from '@/lib/utils'

interface Testimonial {
  quote: string
  name: string
  role: string
  gradient: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'During the floods, mobile networks were down for two days. The LoRa mesh was the only channel our rescue unit had. This is the future of disaster response.',
    name: 'Capt. R. Deshmukh',
    role: 'District Rescue Coordinator',
    gradient: 'from-cyan-500 to-teal-400',
  },
  {
    quote:
      'A patient arrived unconscious after a highway accident. Scanning their Medical ID gave us blood group and allergies in seconds — that changed the outcome.',
    name: 'Dr. Ananya Iyer',
    role: 'Emergency Medicine, City Care Hospital',
    gradient: 'from-blue-500 to-violet-500',
  },
  {
    quote:
      'My father triggered one SOS. I saw the ambulance moving on the map in real time, the hospital was pre-notified, and I got every update. Nothing else works like this.',
    name: 'Arjun Mehta',
    role: 'Family Safety user',
    gradient: 'from-rose-500 to-pink-500',
  },
]

export function Testimonials() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Field Stories"
          title={
            <>
              Trusted where it matters — <span className="text-gradient">the field.</span>
            </>
          }
          description="Responders, doctors and families rely on ResQLink in the moments that count."
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="grid gap-5 md:grid-cols-3"
        >
          {TESTIMONIALS.map(({ quote, name, role, gradient }) => (
            <motion.div key={name} variants={fadeUp}>
              <SpotlightCard className="flex h-full flex-col p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-foreground/15">
                <Quote className="mb-5 h-7 w-7 text-primary/50" />
                <p className="flex-1 text-[15px] leading-relaxed text-foreground/90">
                  “{quote}”
                </p>
                <div className="mt-7 flex items-center gap-3 border-t border-border pt-5">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-sm font-semibold text-white',
                      gradient,
                    )}
                  >
                    {name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{name}</p>
                    <p className="text-xs text-muted-foreground">{role}</p>
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
