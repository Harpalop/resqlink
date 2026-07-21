import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  CloudLightning,
  CloudRain,
  Mountain,
  ShieldCheck,
  Sun,
  Wind,
  type LucideIcon,
} from 'lucide-react'
import { GlassCard } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

interface DisasterAlert {
  id: string
  type: 'FLOOD' | 'EARTHQUAKE' | 'CYCLONE' | 'HEATWAVE' | 'STORM'
  severity: 'WATCH' | 'WARNING' | 'SEVERE'
  title: string
  advice: string
  region: string
  createdAt: string
}

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

export default function AlertsPage() {
  const alertsQuery = useQuery({
    queryKey: ['disasters'],
    queryFn: async () => (await api.get<DisasterAlert[]>('/disasters/alerts')).data,
    refetchInterval: 60_000,
  })

  const alerts = alertsQuery.data ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Disaster Alerts</h1>
        <p className="mt-1.5 text-muted-foreground">
          Active warnings for floods, earthquakes, cyclones, heatwaves and storms.
        </p>
      </div>

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
          {alerts.map((alert, index) => {
            const typeMeta = TYPE_META[alert.type]
            const severityMeta = SEVERITY_META[alert.severity]
            const Icon = typeMeta.icon
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <GlassCard className={cn('p-6', severityMeta.ring)}>
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
                  </div>
                </GlassCard>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
