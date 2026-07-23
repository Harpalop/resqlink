import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  CloudLightning,
  CloudRain,
  Eye,
  EyeOff,
  Loader2,
  Mountain,
  Pencil,
  Plus,
  ShieldCheck,
  Sun,
  Wind,
  X,
  type LucideIcon,
} from 'lucide-react'
import { GlassCard } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/input'
import { SelectField } from '@/components/ui/select'
import { TextareaField } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/features/auth/auth-context'
import {
  DISASTER_SEVERITIES,
  DISASTER_TYPES,
  disasterApi,
  type DisasterAlert,
} from '@/features/disaster/api'
import { getApiErrorMessage } from '@/lib/api'
import { cn } from '@/lib/utils'

const TYPE_META: Record<DisasterAlert['type'], { icon: LucideIcon; gradient: string }> = {
  FLOOD: { icon: CloudRain, gradient: 'from-blue-500 to-cyan-500' },
  EARTHQUAKE: { icon: Mountain, gradient: 'from-amber-600 to-orange-700' },
  CYCLONE: { icon: Wind, gradient: 'from-cyan-500 to-teal-500' },
  HEATWAVE: { icon: Sun, gradient: 'from-amber-400 to-orange-500' },
  STORM: { icon: CloudLightning, gradient: 'from-violet-500 to-indigo-600' },
}

const SEVERITY_META = {
  WATCH: { badge: 'default' as const, ring: '' },
  WARNING: { badge: 'primary' as const, ring: 'border-amber-500/40' },
  SEVERE: { badge: 'emergency' as const, ring: 'border-emergency/50' },
}

const alertSchema = z.object({
  type: z.enum(DISASTER_TYPES),
  severity: z.enum(DISASTER_SEVERITIES),
  title: z.string().min(4, 'Give the alert a clear title').max(120),
  region: z.string().min(2, 'Name the affected region').max(120),
  advice: z.string().min(10, 'Add safety advice for people in the area').max(500),
})

type AlertForm = z.infer<typeof alertSchema>

const EMPTY_FORM: AlertForm = {
  type: 'FLOOD',
  severity: 'WARNING',
  title: '',
  region: '',
  advice: '',
}

const titleCase = (value: string) => value.charAt(0) + value.slice(1).toLowerCase()

export default function AlertsPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const queryClient = useQueryClient()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<DisasterAlert | null>(null)

  // Admins see every alert (including deactivated ones) so they can manage them;
  // everyone else sees only the active public feed.
  const alertsQuery = useQuery({
    queryKey: ['disasters', isAdmin ? 'all' : 'active'],
    queryFn: isAdmin ? disasterApi.getAll : disasterApi.getActive,
    refetchInterval: 60_000,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AlertForm>({ resolver: zodResolver(alertSchema), defaultValues: EMPTY_FORM })

  const closeForm = () => {
    setFormOpen(false)
    setEditing(null)
    reset(EMPTY_FORM)
  }

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['disasters'] })

  const saveMutation = useMutation({
    mutationFn: (values: AlertForm) =>
      editing ? disasterApi.update(editing.id, values) : disasterApi.create(values),
    onSuccess: () => {
      void invalidate()
      closeForm()
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      active ? disasterApi.deactivate(id) : disasterApi.activate(id),
    onSuccess: () => void invalidate(),
  })

  const openCreate = () => {
    setEditing(null)
    reset(EMPTY_FORM)
    setFormOpen(true)
  }

  const startEdit = (alert: DisasterAlert) => {
    setEditing(alert)
    reset({
      type: alert.type,
      severity: alert.severity,
      title: alert.title,
      region: alert.region,
      advice: alert.advice,
    })
    setFormOpen(true)
  }

  const alerts = alertsQuery.data ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Disaster Alerts</h1>
          <p className="mt-1.5 text-muted-foreground">
            Active warnings for floods, earthquakes, cyclones, heatwaves and storms.
          </p>
        </div>
        {isAdmin && !formOpen && (
          <Button variant="gradient" onClick={openCreate}>
            <Plus className="h-4 w-4" /> New alert
          </Button>
        )}
      </div>

      {saveMutation.isError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-emergency/30 bg-emergency/10 px-4 py-3 text-sm text-emergency">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {getApiErrorMessage(saveMutation.error, 'Could not save the alert.')}
        </div>
      )}

      {isAdmin && (
        <AnimatePresence>
          {formOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <GlassCard className="p-6">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="font-semibold">{editing ? 'Edit alert' : 'New alert'}</h2>
                  <Button variant="ghost" size="icon" onClick={closeForm} aria-label="Close form">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <form
                  onSubmit={handleSubmit((values) => saveMutation.mutate(values))}
                  className="grid gap-4 sm:grid-cols-2"
                >
                  <SelectField
                    label="Type"
                    options={DISASTER_TYPES.map((type) => ({ value: type, label: titleCase(type) }))}
                    error={errors.type?.message}
                    {...register('type')}
                  />
                  <SelectField
                    label="Severity"
                    options={DISASTER_SEVERITIES.map((severity) => ({
                      value: severity,
                      label: titleCase(severity),
                    }))}
                    error={errors.severity?.message}
                    {...register('severity')}
                  />
                  <FormField
                    label="Title"
                    placeholder="e.g. Heavy flooding expected in coastal districts"
                    error={errors.title?.message}
                    {...register('title')}
                  />
                  <FormField
                    label="Region"
                    placeholder="e.g. Kerala"
                    error={errors.region?.message}
                    {...register('region')}
                  />
                  <div className="sm:col-span-2">
                    <TextareaField
                      label="Safety advice"
                      hint="What should people in the area do right now?"
                      placeholder="Move to higher ground, avoid flooded roads, keep emergency kit ready…"
                      error={errors.advice?.message}
                      {...register('advice')}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Button type="submit" variant="gradient" disabled={saveMutation.isPending}>
                      {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                      {editing ? 'Update alert' : 'Publish alert'}
                    </Button>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {alertsQuery.isPending ? (
        <div className="space-y-4">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
      ) : alerts.length === 0 ? (
        <GlassCard className="flex flex-col items-center gap-4 p-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success/15">
            <ShieldCheck className="h-7 w-7 text-success" />
          </span>
          <div>
            <h3 className="font-semibold">No active alerts</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Your region is currently clear. Alerts appear here the moment authorities issue them.
            </p>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {alerts.map((alert, index) => {
              const typeMeta = TYPE_META[alert.type]
              const severityMeta = SEVERITY_META[alert.severity]
              const Icon = typeMeta.icon
              return (
                <motion.div
                  key={alert.id}
                  layout
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassCard
                    className={cn('p-6', severityMeta.ring, !alert.active && 'opacity-60')}
                  >
                    <div className="flex flex-wrap items-start gap-4">
                      <span
                        className={cn(
                          'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg',
                          typeMeta.gradient,
                        )}
                      >
                        <Icon className="h-6 w-6" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{alert.title}</h3>
                          <Badge variant={severityMeta.badge}>{alert.severity}</Badge>
                          {isAdmin && !alert.active && (
                            <Badge className="px-2 py-0 text-[10px]">INACTIVE</Badge>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {alert.region} ·{' '}
                          {new Date(alert.createdAt).toLocaleString([], {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                          {alert.advice}
                        </p>
                      </div>
                      {isAdmin && (
                        <div className="flex shrink-0 items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEdit(alert)}
                            aria-label={`Edit ${alert.title}`}
                            className="h-9 w-9"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={statusMutation.isPending}
                            onClick={() =>
                              statusMutation.mutate({ id: alert.id, active: alert.active })
                            }
                            aria-label={alert.active ? `Deactivate ${alert.title}` : `Reactivate ${alert.title}`}
                            className={cn(
                              'h-9 w-9',
                              alert.active
                                ? 'text-emergency hover:bg-emergency/10'
                                : 'text-success hover:bg-success/10',
                            )}
                          >
                            {alert.active ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </GlassCard>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
