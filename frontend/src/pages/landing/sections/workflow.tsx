import { motion } from 'framer-motion'
import { BellRing, HeartPulse, Radar, ShieldCheck, type LucideIcon } from 'lucide-react'
import { SectionHeading } from '@/components/ui/section-heading'
import { EASE, fadeUp, staggerContainer } from '@/lib/motion'

interface Step {
  icon: LucideIcon
  step: string
  title: string
  description: string
  gradient: string
}

const STEPS: Step[] = [
  {
    icon: BellRing,
    step: '01',
    title: 'Alert',
    description: 'SOS triggered with GPS location, medical ID and emergency type — in one tap.',
    gradient: 'from-rose-500 to-red-600',
  },
  {
    icon: Radar,
    step: '02',
    title: 'Response',
    description: 'Nearest responders, ambulances and emergency contacts are notified instantly.',
    gradient: 'from-blue-500 to-cyan-400',
  },
  {
    icon: HeartPulse,
    step: '03',
    title: 'Assistance',
    description: 'Live tracking, telemedicine and the blood network mobilize around you.',
    gradient: 'from-violet-500 to-fuchsia-500',
  },
  {
    icon: ShieldCheck,
    step: '04',
    title: 'Recovery',
    description: 'Follow-ups, medical reports and community support after the emergency.',
    gradient: 'from-emerald-500 to-teal-500',
  },
]

export function Workflow() {
  return (
    <section id="workflow" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="How it works"
          title={
            <>
              From alert to recovery. <span className="text-gradient">In four steps.</span>
            </>
          }
          description="A coordinated emergency workflow that keeps everyone — family, responders, and hospitals — on the same page."
        />

        <div className="relative">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1.4, ease: EASE }}
            className="absolute top-[52px] right-[12%] left-[12%] hidden h-px origin-left bg-gradient-to-r from-rose-500/50 via-violet-500/50 to-emerald-500/50 lg:block"
          />

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {STEPS.map(({ icon: Icon, step, title, description, gradient }) => (
              <motion.div
                key={step}
                variants={fadeUp}
                className="glass-panel group relative rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1.5"
              >
                <span className="font-display absolute top-4 right-5 text-3xl font-bold text-foreground/10">
                  {step}
                </span>
                <div
                  className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
