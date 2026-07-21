import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, ArrowLeft, Phone, Search, ShieldAlert } from 'lucide-react'
import { GlassCard } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FIRST_AID_GUIDES, type FirstAidGuide } from '@/features/first-aid/guides'
import { EASE, fadeUp, staggerContainer } from '@/lib/motion'
import { cn } from '@/lib/utils'

function GuideDetail({ guide, onBack }: { guide: FirstAidGuide; onBack: () => void }) {
  const Icon = guide.icon
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="space-y-5"
    >
      <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2 gap-1.5">
        <ArrowLeft className="h-4 w-4" /> All guides
      </Button>

      <div className="flex items-center gap-4">
        <span
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg',
            guide.gradient,
          )}
        >
          <Icon className="h-7 w-7" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
            {guide.title}
          </h1>
          <p className="text-sm text-muted-foreground">{guide.subtitle}</p>
        </div>
      </div>

      {guide.callFirst && (
        <a
          href="tel:112"
          className="flex items-center justify-between gap-3 rounded-2xl border border-emergency/40 bg-emergency/10 px-5 py-4 transition-colors hover:bg-emergency/15"
        >
          <p className="flex items-center gap-2.5 font-semibold text-emergency">
            <Phone className="h-5 w-5" /> Call 112 FIRST — then follow these steps
          </p>
          <Badge variant="emergency">TAP TO CALL</Badge>
        </a>
      )}

      <div className="space-y-3">
        {guide.steps.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.45, ease: EASE }}
          >
            <GlassCard className="flex gap-4 p-5">
              <span
                className={cn(
                  'font-display flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white',
                  guide.gradient,
                )}
              >
                {index + 1}
              </span>
              <div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.detail}</p>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <GlassCard className="border-amber-500/30 bg-amber-500/5 p-5">
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-500">
          <ShieldAlert className="h-4 w-4" /> Never do this
        </p>
        <ul className="space-y-2">
          {guide.doNot.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
              {item}
            </li>
          ))}
        </ul>
      </GlassCard>
    </motion.div>
  )
}

export default function FirstAidPage() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<FirstAidGuide | null>(null)

  const filtered = FIRST_AID_GUIDES.filter(
    (guide) =>
      guide.title.toLowerCase().includes(query.toLowerCase()) ||
      guide.subtitle.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {selected ? (
          <GuideDetail key={selected.id} guide={selected} onBack={() => setSelected(null)} />
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight">First Aid Center</h1>
              <p className="mt-1.5 text-muted-foreground">
                Step-by-step guidance for the most critical emergencies. Read them before you need
                them.
              </p>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl border border-border px-4 py-3 text-xs text-muted-foreground">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              These guides support — never replace — professional medical help. In a real emergency
              always call 112 first.
            </div>

            <div className="relative max-w-md">
              <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search: choking, burns, CPR…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="pl-10"
              />
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filtered.map((guide) => {
                const Icon = guide.icon
                return (
                  <motion.button
                    key={guide.id}
                    variants={fadeUp}
                    type="button"
                    onClick={() => setSelected(guide)}
                    className="group text-left"
                  >
                    <GlassCard className="h-full p-5 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/30">
                      <div className="flex items-start justify-between">
                        <span
                          className={cn(
                            'flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md transition-transform duration-300 group-hover:scale-110',
                            guide.gradient,
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        {guide.callFirst && (
                          <Badge variant="emergency" className="px-2 py-0 text-[9px]">
                            CALL 112 FIRST
                          </Badge>
                        )}
                      </div>
                      <h3 className="mt-4 font-semibold">{guide.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{guide.subtitle}</p>
                      <p className="mt-3 text-xs font-medium text-primary">
                        {guide.steps.length} steps →
                      </p>
                    </GlassCard>
                  </motion.button>
                )
              })}
            </motion.div>

            {filtered.length === 0 && (
              <GlassCard className="p-8 text-center text-sm text-muted-foreground">
                No guide matches "{query}" — try "CPR", "burns" or "choking".
              </GlassCard>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
