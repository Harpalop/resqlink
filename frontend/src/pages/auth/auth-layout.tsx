import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, HeartPulse, ShieldCheck, Timer, Users } from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { GradientOrbs } from '@/components/effects/gradient-orbs'
import { GridPattern } from '@/components/effects/grid-pattern'
import { Particles } from '@/components/effects/particles'
import { EASE } from '@/lib/motion'

const HIGHLIGHTS = [
  { icon: Timer, text: 'Average emergency response under 5 minutes' },
  { icon: Users, text: '12,000+ citizens, donors and responders connected' },
  { icon: ShieldCheck, text: 'Your medical data stays encrypted and private' },
]

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden border-r border-border lg:flex lg:flex-col lg:justify-between lg:p-10">
        <GradientOrbs />
        <GridPattern />
        <Particles quantity={40} />

        <div className="relative">
          <Logo />
        </div>

        <div className="relative max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-violet-500 to-rose-500 shadow-lg shadow-violet-500/30">
              <HeartPulse className="h-6 w-6 text-white" />
            </div>
            <h2 className="font-display text-3xl leading-tight font-bold tracking-tight">
              Every 60 seconds, someone needs emergency help.
            </h2>
            <p className="mt-4 text-muted-foreground">
              ResQLink makes sure help knows the way — connecting you to responders, hospitals and
              your loved ones when it matters most.
            </p>
          </motion.div>

          <div className="mt-10 space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }, index) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.15, ease: EASE }}
                className="glass-panel flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                  <Icon className="h-4 w-4 text-primary" />
                </span>
                {text}
              </motion.div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-muted-foreground">
          © 2026 ResQLink · Connecting Lives During Emergencies
        </p>
      </div>

      <div className="relative flex flex-col p-6 md:p-10">
        <div className="flex items-center justify-between lg:justify-end">
          <div className="lg:hidden">
            <Logo />
          </div>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="w-full max-w-md"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
