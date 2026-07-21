import { motion } from 'framer-motion'
import {
  Ambulance,
  BatteryCharging,
  Cpu,
  HeartPulse,
  Home,
  Hospital,
  Radio,
  Satellite,
  Tent,
  User,
  type LucideIcon,
} from 'lucide-react'
import { GlassCard } from '@/components/ui/card'
import { SectionHeading } from '@/components/ui/section-heading'
import { Reveal } from '@/components/effects/reveal'
import { cn } from '@/lib/utils'

const SPECS = [
  { icon: Cpu, label: 'ESP32 dual-core MCU' },
  { icon: Radio, label: 'LoRa SX1278 · 433 MHz' },
  { icon: Satellite, label: 'GPS NEO-6M module' },
  { icon: BatteryCharging, label: '72h battery backup' },
]

interface MeshNode {
  icon: LucideIcon
  label: string
  x: number
  y: number
}

const NODES: MeshNode[] = [
  { icon: Home, label: 'Home node', x: 16, y: 20 },
  { icon: Ambulance, label: 'Ambulance', x: 82, y: 26 },
  { icon: Hospital, label: 'Hospital', x: 86, y: 74 },
  { icon: Tent, label: 'Relief camp', x: 18, y: 78 },
  { icon: User, label: 'Citizen', x: 50, y: 10 },
]

const CENTER = { x: 50, y: 50 }

function MeshVisual() {
  return (
    <GlassCard className="relative aspect-square w-full max-w-lg overflow-hidden p-6">
      <div className="bg-grid absolute inset-0 opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-violet-500/10" />

      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        {NODES.map((node) => (
          <line
            key={node.label}
            x1={CENTER.x}
            y1={CENTER.y}
            x2={node.x}
            y2={node.y}
            stroke="currentColor"
            strokeWidth="0.35"
            strokeDasharray="2 2"
            className="animate-dash-flow text-cyan-500/50"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      {[1, 2, 3].map((ring) => (
        <motion.div
          key={ring}
          initial={{ opacity: 0.5, scale: 0.3 }}
          animate={{ opacity: 0, scale: 1.6 }}
          transition={{ duration: 3.6, repeat: Infinity, delay: ring * 1.2, ease: 'easeOut' }}
          className="absolute top-1/2 left-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-500/40"
        />
      ))}

      <div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${CENTER.x}%`, top: `${CENTER.y}%` }}
      >
        <div className="glow-primary flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-violet-500 to-rose-500 shadow-xl">
          <HeartPulse className="h-7 w-7 text-white" />
        </div>
      </div>

      {NODES.map(({ icon: Icon, label, x, y }) => (
        <div
          key={label}
          className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5"
          style={{ left: `${x}%`, top: `${y}%` }}
        >
          <div className="glass-panel flex h-11 w-11 items-center justify-center rounded-xl shadow-lg">
            <Icon className="h-5 w-5 text-cyan-500" />
          </div>
          <span className="glass-panel rounded-full px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {label}
          </span>
        </div>
      ))}
    </GlassCard>
  )
}

export function Technology() {
  return (
    <section id="technology" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading
              align="left"
              className="mb-8"
              eyebrow="ResQLink Hardware"
              title={
                <>
                  Built to work when <span className="text-gradient">everything else fails.</span>
                </>
              }
              description="When cell towers go down in a flood or earthquake, ResQLink nodes keep talking. Our ESP32 + LoRa SX1278 mesh relays SOS signals across kilometers — no internet, no SIM, no problem."
            />

            <Reveal delay={0.1}>
              <div className="grid gap-3 sm:grid-cols-2">
                {SPECS.map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className={cn(
                      'glass-panel flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium',
                      'transition-colors hover:border-cyan-500/40',
                    )}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15">
                      <Icon className="h-4 w-4 text-cyan-500" />
                    </span>
                    {label}
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="mt-6 text-sm text-muted-foreground">
                Long-range emergency communication · Mesh relay between nodes · Offline SOS queue
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.15} className="flex justify-center">
            <MeshVisual />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
