import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Clock,
  History,
  Loader2,
  MapPin,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import { GlassCard } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { SosButton } from '@/features/sos/sos-button'
import { getCurrentPosition, sosApi } from '@/features/sos/api'
import { EMERGENCY_TYPES, type Emergency, type EmergencyType } from '@/features/sos/types'
import { getApiErrorMessage } from '@/lib/api'
import { EASE } from '@/lib/motion'
import { cn } from '@/lib/utils'

function typeMeta(type: EmergencyType) {
  return EMERGENCY_TYPES.find((meta) => meta.value === type) ?? EMERGENCY_TYPES[5]!
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })
}

const STATUS_BADGE = {
  ACTIVE: { variant: 'emergency' as const, label: 'ACTIVE' },
  RESOLVED: { variant: 'success' as const, label: 'RESOLVED' },
  CANCELLED: { variant: 'default' as const, label: 'CANCELLED' },
}

function ActiveEmergency({ emergency }: { emergency: Emergency }) {
  const queryClient = useQueryClient()
  const meta = typeMeta(emergency.type)
  const Icon = meta.icon

  const closeMutation = useMutation({
    mutationFn: ({ resolved }: { resolved: boolean }) =>
      resolved ? sosApi.resolve(emergency.id) : sosApi.cancel(emergency.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['sos'] })
    },
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="space-y-5"
    >
      <div className="overflow-hidden rounded-2xl border border-emergency/40">
        <div className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-red-600 px-5 py-2.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
          </span>
          <p className="text-sm font-bold tracking-widest text-white uppercase">
            Emergency in progress
          </p>
        </div>

        <GlassCard className="rounded-none border-0 p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg',
                  meta.gradient,
                )}
              >
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <p className="font-display text-lg font-bold">
                  {meta.label} Emergency · {emergency.reference}
                </p>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Started {formatTime(emergency.createdAt)}
                  {emergency.latitude !== null && (
                    <>
                      <span>·</span>
                      <MapPin className="h-3.5 w-3.5" />
                      {emergency.latitude.toFixed(4)}, {emergency.longitude?.toFixed(4)}
                    </>
                  )}
                </p>
              </div>
            </div>
            <Badge variant="emergency">CRITICAL</Badge>
          </div>

          {/* Timeline */}
          <div className="relative space-y-0 pl-1">
            {emergency.events.map((event, index) => {
              const isLast = index === emergency.events.length - 1
              return (
                <motion.div
                  key={`${event.label}-${event.createdAt}`}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.12, duration: 0.5, ease: EASE }}
                  className="relative flex gap-4 pb-6 last:pb-0"
                >
                  {!isLast && (
                    <span className="absolute top-6 left-[9px] h-full w-px bg-gradient-to-b from-emergency/50 to-border" />
                  )}
                  <span
                    className={cn(
                      'relative mt-1 flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full border-2',
                      isLast
                        ? 'border-emergency bg-emergency/20'
                        : 'border-success bg-success/20',
                    )}
                  >
                    {isLast ? (
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emergency" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{event.label}</p>
                    {event.detail && (
                      <p className="text-sm text-muted-foreground">{event.detail}</p>
                    )}
                    <p className="mt-0.5 text-xs text-muted-foreground/70">
                      {formatTime(event.createdAt)}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button
              variant="primary"
              size="lg"
              className="flex-1 bg-success shadow-success/30 hover:shadow-success/50"
              disabled={closeMutation.isPending}
              onClick={() => closeMutation.mutate({ resolved: true })}
            >
              {closeMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              I'm safe now
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              disabled={closeMutation.isPending}
              onClick={() => {
                if (window.confirm('Cancel this SOS? Responders will be notified it was a false alarm.')) {
                  closeMutation.mutate({ resolved: false })
                }
              }}
            >
              <XCircle className="h-4 w-4" /> Cancel SOS
            </Button>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  )
}

function HistorySection() {
  const [open, setOpen] = useState(false)
  const historyQuery = useQuery({
    queryKey: ['sos', 'history'],
    queryFn: sosApi.getHistory,
    enabled: open,
  })

  return (
    <GlassCard className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-muted/50"
      >
        <span className="flex items-center gap-2.5 font-semibold">
          <History className="h-4 w-4 text-primary" /> Emergency history
        </span>
        <ChevronDown
          className={cn('h-4 w-4 text-muted-foreground transition-transform', open && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-2.5 border-t border-border p-5">
              {historyQuery.isPending ? (
                <>
                  <Skeleton className="h-14" />
                  <Skeleton className="h-14" />
                </>
              ) : !historyQuery.data || historyQuery.data.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No emergencies yet — and hopefully never.
                </p>
              ) : (
                historyQuery.data.map((emergency) => {
                  const meta = typeMeta(emergency.type)
                  const Icon = meta.icon
                  const badge = STATUS_BADGE[emergency.status]
                  return (
                    <div
                      key={emergency.id}
                      className="flex items-center gap-3.5 rounded-xl border border-border p-3.5"
                    >
                      <span
                        className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white',
                          meta.gradient,
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">
                          {meta.label} · {emergency.reference}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(emergency.createdAt)} at {formatTime(emergency.createdAt)}
                        </p>
                      </div>
                      <Badge variant={badge.variant} className="shrink-0">
                        {badge.label}
                      </Badge>
                    </div>
                  )
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  )
}

export default function SosPage() {
  const queryClient = useQueryClient()
  const [selectedType, setSelectedType] = useState<EmergencyType>('MEDICAL')
  const [locating, setLocating] = useState(false)

  const activeQuery = useQuery({
    queryKey: ['sos', 'active'],
    queryFn: sosApi.getActive,
    refetchInterval: 15_000,
  })

  const triggerMutation = useMutation({
    mutationFn: async (type: EmergencyType) => {
      setLocating(true)
      const position = await getCurrentPosition()
      setLocating(false)
      return sosApi.trigger({ type, ...position })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['sos'] })
    },
    onError: () => setLocating(false),
  })

  if (activeQuery.isPending) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-24" />
        <Skeleton className="h-72" />
      </div>
    )
  }

  const active = activeQuery.data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Smart SOS</h1>
        <p className="mt-1.5 text-muted-foreground">
          One tap alerts your emergency network with your live location and Medical ID.
        </p>
      </div>

      {triggerMutation.isError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-emergency/30 bg-emergency/10 px-4 py-3 text-sm text-emergency">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {getApiErrorMessage(triggerMutation.error, 'Could not trigger the SOS. Try again.')}
        </div>
      )}

      {active ? (
        <ActiveEmergency emergency={active} />
      ) : (
        <GlassCard className="p-7 md:p-10">
          <div className="mx-auto max-w-xl space-y-9">
            {/* Type selector */}
            <div>
              <p className="mb-3.5 text-center text-sm font-medium text-muted-foreground">
                What kind of emergency?
              </p>
              <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
                {EMERGENCY_TYPES.map(({ value, label, icon: Icon, gradient }) => {
                  const selected = selectedType === value
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setSelectedType(value)}
                      className={cn(
                        'flex flex-col items-center gap-2 rounded-xl border p-3 transition-all duration-200',
                        selected
                          ? 'border-emergency/50 bg-emergency/10 shadow-md'
                          : 'border-border hover:border-foreground/25',
                      )}
                      aria-pressed={selected}
                    >
                      <span
                        className={cn(
                          'flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br text-white transition-transform',
                          gradient,
                          selected && 'scale-110',
                        )}
                      >
                        <Icon className="h-4.5 w-4.5" />
                      </span>
                      <span className="text-xs font-medium">{label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <SosButton
              onActivate={() => triggerMutation.mutate(selectedType)}
              disabled={triggerMutation.isPending}
            />

            {(triggerMutation.isPending || locating) && (
              <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {locating ? 'Getting your location…' : 'Alerting the network…'}
              </p>
            )}

            <div className="flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-xs text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
              In a real life-threatening situation always call 112 (India) or your local emergency
              number first.
            </div>
          </div>
        </GlassCard>
      )}

      <HistorySection />
    </div>
  )
}
