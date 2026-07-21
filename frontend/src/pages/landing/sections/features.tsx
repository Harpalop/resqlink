import { motion } from 'framer-motion'
import {
  Droplets,
  MapPinned,
  RadioTower,
  ScanLine,
  Siren,
  Video,
  type LucideIcon,
} from 'lucide-react'
import { SectionHeading } from '@/components/ui/section-heading'
import { SpotlightCard } from '@/components/effects/spotlight-card'
import { fadeUp, staggerContainer } from '@/lib/motion'
import { cn } from '@/lib/utils'

interface Feature {
  icon: LucideIcon
  title: string
  description: string
  gradient: string
  glow: string
}

const FEATURES: Feature[] = [
  {
    icon: Siren,
    title: 'Smart SOS',
    description:
      'One tap. GPS locked. The nearest responders are alerted with a live emergency timeline.',
    gradient: 'from-rose-500 to-red-600',
    glow: 'group-hover:shadow-rose-500/25',
  },
  {
    icon: ScanLine,
    title: 'Smart Medical ID',
    description:
      'A QR-powered digital identity that speaks for you when you can’t — blood group, allergies, medications.',
    gradient: 'from-blue-500 to-cyan-400',
    glow: 'group-hover:shadow-blue-500/25',
  },
  {
    icon: Droplets,
    title: 'Blood Donation Network',
    description:
      'Find matching donors nearby in minutes, not hours. Requests, camps, and donor achievements.',
    gradient: 'from-rose-500 to-pink-500',
    glow: 'group-hover:shadow-pink-500/25',
  },
  {
    icon: Video,
    title: 'Telemedicine',
    description:
      'HD video consultations, digital prescriptions, and emergency doctors available on demand.',
    gradient: 'from-violet-500 to-fuchsia-500',
    glow: 'group-hover:shadow-violet-500/25',
  },
  {
    icon: RadioTower,
    title: 'LoRa Offline Mesh',
    description:
      'ESP32 + LoRa hardware keeps SOS alive when mobile networks die. Built for disasters.',
    gradient: 'from-cyan-500 to-teal-400',
    glow: 'group-hover:shadow-cyan-500/25',
  },
  {
    icon: MapPinned,
    title: 'Family Safety',
    description:
      'Real-time location sharing, safe check-ins, and instant alerts for the people you love.',
    gradient: 'from-emerald-500 to-teal-500',
    glow: 'group-hover:shadow-emerald-500/25',
  },
]

export function Features() {
  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="The Platform"
          title={
            <>
              Everything an emergency demands. <span className="text-gradient">In one place.</span>
            </>
          }
          description="Twenty-four integrated modules covering the full emergency lifecycle — from prevention to recovery."
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map(({ icon: Icon, title, description, gradient, glow }) => (
            <motion.div key={title} variants={fadeUp}>
              <SpotlightCard
                className={cn(
                  'group h-full p-6 shadow-lg transition-all duration-300',
                  'hover:-translate-y-1.5 hover:border-foreground/15 hover:shadow-xl',
                  glow,
                )}
              >
                <div
                  className={cn(
                    'mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3',
                    gradient,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
              </SpotlightCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
