import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Bell,
  BellRing,
  CalendarClock,
  CheckCheck,
  CloudLightning,
  Droplets,
  Siren,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { GlassCard } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

interface NotificationRow {
  id: string
  type: 'SOS' | 'BLOOD' | 'APPOINTMENT' | 'FAMILY' | 'DISASTER' | 'SYSTEM'
  title: string
  body: string
  read: boolean
  createdAt: string
}

const TYPE_META: Record<NotificationRow['type'], { icon: LucideIcon; className: string }> = {
  SOS: { icon: Siren, className: 'bg-rose-500/15 text-rose-500' },
  BLOOD: { icon: Droplets, className: 'bg-pink-500/15 text-pink-500' },
  APPOINTMENT: { icon: CalendarClock, className: 'bg-violet-500/15 text-violet-500' },
  FAMILY: { icon: Users, className: 'bg-emerald-500/15 text-emerald-500' },
  DISASTER: { icon: CloudLightning, className: 'bg-cyan-500/15 text-cyan-500' },
  SYSTEM: { icon: Bell, className: 'bg-blue-500/15 text-blue-500' },
}

function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`
  if (seconds < 86_400) return `${Math.floor(seconds / 3600)} h ago`
  return new Date(iso).toLocaleDateString([], { day: 'numeric', month: 'short' })
}

export default function NotificationsPage() {
  const queryClient = useQueryClient()

  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get<NotificationRow[]>('/notifications')).data,
  })

  const markAllMutation = useMutation({
    mutationFn: async () => api.post('/notifications/mark-all-read'),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const notifications = notificationsQuery.data ?? []
  const unread = notifications.filter((notification) => !notification.read).length

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="mt-1.5 text-muted-foreground">
            SOS updates, appointments, family activity and disaster alerts.
          </p>
        </div>
        {unread > 0 && (
          <Button
            variant="glass"
            size="sm"
            disabled={markAllMutation.isPending}
            onClick={() => markAllMutation.mutate()}
          >
            <CheckCheck className="h-4 w-4" /> Mark all read ({unread})
          </Button>
        )}
      </div>

      {notificationsQuery.isPending ? (
        <div className="space-y-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : notifications.length === 0 ? (
        <GlassCard className="flex flex-col items-center gap-4 p-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15">
            <BellRing className="h-7 w-7 text-primary" />
          </span>
          <div>
            <h3 className="font-semibold">All quiet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Notifications appear here when you trigger an SOS, book a consultation, or your
              family checks in.
            </p>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((notification, index) => {
            const meta = TYPE_META[notification.type]
            const Icon = meta.icon
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.04, 0.4) }}
              >
                <GlassCard
                  className={cn(
                    'flex items-start gap-3.5 p-4',
                    !notification.read && 'border-primary/30 bg-primary/[0.04]',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                      meta.className,
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      {notification.title}
                      {!notification.read && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{notification.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground/70">
                      {timeAgo(notification.createdAt)}
                    </p>
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
