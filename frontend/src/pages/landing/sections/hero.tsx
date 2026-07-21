import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Activity,
  Ambulance,
  ArrowRight,
  Droplets,
  Hospital,
  MapPin,
  Radio,
  Siren,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/ui/card'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import { Magnetic } from '@/components/effects/magnetic'
import { GradientOrbs } from '@/components/effects/gradient-orbs'
import { GridPattern } from '@/components/effects/grid-pattern'
import { Particles } from '@/components/effects/particles'
import { WordReveal } from '@/components/effects/word-reveal'
import { EASE, fadeUp, staggerContainer } from '@/lib/motion'
import { cn } from '@/lib/utils'

const STATS = [
  { value: 4.2, decimals: 1, suffix: ' min', label: 'Avg. response time' },
  { value: 12000, suffix: '+', label: 'Lives connected' },
  { value: 520, suffix: '+', label: 'Partner hospitals' },
  { value: 99.9, decimals: 1, suffix: '%', label: 'Network uptime' },
]

const FLOATING_CHIPS = [
  {
    icon: Droplets,
    text: 'Donor match found · O+ · 1.2 km',
    className: '-left-6 top-16 xl:-left-20',
    delay: 0.2,
    iconClass: 'text-rose-500',
  },
  {
    icon: Ambulance,
    text: 'AMB-07 en route · ETA 3 min',
    className: '-right-6 top-36 xl:-right-24',
    delay: 0.5,
    iconClass: 'text-blue-500',
  },
  {
    icon: Hospital,
    text: 'City Care Hospital notified',
    className: '-left-2 bottom-10 xl:-left-16',
    delay: 0.8,
    iconClass: 'text-violet-500',
  },
]

const RESPONSE_BARS = [42, 65, 50, 80, 62, 92, 74]

function DashboardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, rotateX: 12 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 1, delay: 0.5, ease: EASE }}
      className="relative mx-auto mt-20 max-w-4xl [perspective:1200px]"
    >
      {FLOATING_CHIPS.map(({ icon: Icon, text, className, delay, iconClass }) => (
        <motion.div
          key={text}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 + delay, duration: 0.5, ease: EASE }}
          className={cn('absolute z-20 hidden md:block', className)}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5 + delay, repeat: Infinity, ease: 'easeInOut' }}
            className="glass-panel flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium shadow-lg"
          >
            <Icon className={cn('h-3.5 w-3.5', iconClass)} />
            {text}
          </motion.div>
        </motion.div>
      ))}

      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      >
        <GlassCard className="overflow-hidden p-0 glow-primary">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                ResQLink Command Center
              </span>
            </div>
            <Badge variant="success" className="gap-1.5 px-2.5 py-0.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
              </span>
              LIVE
            </Badge>
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-3">
            <div className="glass-panel rounded-xl p-4 sm:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-emergency/15">
                    <Siren className="h-4 w-4 text-emergency" />
                    <span className="absolute inset-0 animate-ping rounded-lg bg-emergency/20" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">Active Emergency · Cardiac</p>
                    <p className="text-xs text-muted-foreground">#RQ-4821 · Sector 12, Pune</p>
                  </div>
                </div>
                <Badge variant="emergency" className="hidden px-2.5 py-0.5 sm:inline-flex">
                  CRITICAL
                </Badge>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: '10%' }}
                  animate={{ width: '72%' }}
                  transition={{ duration: 2.4, delay: 1.4, ease: EASE }}
                  className="h-full rounded-full bg-gradient-to-r from-emergency to-rose-400"
                />
              </div>
              <p className="mt-2.5 text-xs text-muted-foreground">
                Ambulance AMB-07 dispatched · Medical ID shared with responders
              </p>
            </div>

            <div className="glass-panel rounded-xl p-4">
              <p className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Activity className="h-3.5 w-3.5 text-primary" /> Medical ID
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Blood group</span>
                  <span className="font-semibold text-emergency">O+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Allergy</span>
                  <span className="font-medium">Penicillin</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Condition</span>
                  <span className="font-medium">Hypertension</span>
                </div>
              </div>
            </div>

            <div className="glass-panel relative overflow-hidden rounded-xl p-4 sm:col-span-2">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-violet-500/10" />
              <div className="bg-grid absolute inset-0 opacity-60" />
              <p className="relative mb-6 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary" /> Live tracking
              </p>
              <div className="relative flex h-16 items-center justify-around">
                {[0, 0.6, 1.2].map((delay, index) => (
                  <span key={index} className="relative flex h-3 w-3">
                    <span
                      className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60"
                      style={{ animationDelay: `${delay}s` }}
                    />
                    <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-background bg-primary" />
                  </span>
                ))}
                <svg className="absolute inset-x-8 top-1/2 h-px w-auto" aria-hidden>
                  <line
                    x1="0"
                    y1="0"
                    x2="100%"
                    y2="0"
                    stroke="currentColor"
                    strokeDasharray="6 6"
                    className="animate-dash-flow text-primary/50"
                  />
                </svg>
              </div>
            </div>

            <div className="glass-panel rounded-xl p-4">
              <p className="mb-3 text-xs font-medium text-muted-foreground">Response time ↓18%</p>
              <div className="flex h-16 items-end gap-1.5">
                {RESPONSE_BARS.map((height, index) => (
                  <motion.div
                    key={index}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.8, delay: 1.2 + index * 0.08, ease: EASE }}
                    className="flex-1 rounded-t bg-gradient-to-t from-blue-500/60 to-violet-500/80"
                  />
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-36 pb-24 md:pt-44">
      <GradientOrbs />
      <GridPattern />
      <Particles quantity={60} />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="mx-auto flex max-w-4xl flex-col items-center text-center"
        >
          <motion.div variants={fadeUp}>
            <Badge variant="glass" className="mb-6 py-1.5 pr-4 pl-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500">
                <Radio className="h-3 w-3 text-white" />
              </span>
              Now with offline LoRa emergency mesh
              <ArrowRight className="h-3 w-3" />
            </Badge>
          </motion.div>

          <h1 className="font-display text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-6xl md:text-7xl">
            <WordReveal
              text="When every second counts, help finds you first."
              delay={0.25}
              highlight={['help', 'finds', 'you', 'first']}
            />
          </h1>

          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg"
          >
            ResQLink unites citizens, hospitals, ambulances, blood donors and rescue teams on one
            real-time emergency network — before, during, and after every crisis. One tap, and the
            right people already know.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Magnetic strength={0.2}>
              <Link
                to="/register"
                className={cn(buttonVariants({ variant: 'gradient', size: 'xl' }), 'btn-shine')}
              >
                Get Protected — It's Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Magnetic>
            <Magnetic strength={0.15}>
              <a href="#features" className={buttonVariants({ variant: 'glass', size: 'xl' })}>
                See the Platform
              </a>
            </Magnetic>
          </motion.div>

          <motion.p variants={fadeUp} className="mt-5 text-xs text-muted-foreground/80">
            No credit card · Works offline via LoRa mesh · Trusted by 520+ hospitals
          </motion.p>

          <motion.div variants={fadeUp} className="mt-16 w-full">
            <div className="glass-panel grid grid-cols-2 divide-border rounded-2xl py-6 md:grid-cols-4 md:divide-x">
              {STATS.map((stat) => (
                <div key={stat.label} className="flex flex-col items-center gap-1 px-4 py-2">
                  <AnimatedCounter
                    to={stat.value}
                    decimals={stat.decimals ?? 0}
                    suffix={stat.suffix}
                    className="font-display text-gradient text-2xl font-bold md:text-3xl"
                  />
                  <span className="text-xs text-muted-foreground md:text-sm">{stat.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <DashboardPreview />
      </div>
    </section>
  )
}
