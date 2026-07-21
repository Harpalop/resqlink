import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Ban,
  CheckCircle2,
  Droplets,
  Hospital,
  ShieldAlert,
  Siren,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { GlassCard } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import { useAuth } from '@/features/auth/auth-context'
import { api } from '@/lib/api'
import { fadeUp, staggerContainer } from '@/lib/motion'
import { cn, getInitials } from '@/lib/utils'

interface PlatformStats {
  users: number
  emergencies: number
  donors: number
  openBloodRequests: number
  hospitals: number
}

interface AdminUser {
  id: string
  fullName: string
  email: string
  role: string
  enabled: boolean
  createdAt: string
}

const adminApi = {
  getStats: async () => (await api.get<PlatformStats>('/admin/stats')).data,
  getUsers: async () => (await api.get<AdminUser[]>('/admin/users')).data,
  toggleEnabled: async (userId: string) =>
    (await api.post<AdminUser>(`/admin/users/${userId}/toggle-enabled`)).data,
}

const STAT_META: Array<{ key: keyof PlatformStats; label: string; icon: LucideIcon; gradient: string }> = [
  { key: 'users', label: 'Total users', icon: Users, gradient: 'from-blue-500 to-cyan-400' },
  { key: 'emergencies', label: 'SOS alerts (all time)', icon: Siren, gradient: 'from-rose-500 to-red-600' },
  { key: 'donors', label: 'Registered donors', icon: Droplets, gradient: 'from-rose-500 to-pink-500' },
  { key: 'openBloodRequests', label: 'Open blood requests', icon: Droplets, gradient: 'from-amber-500 to-orange-500' },
  { key: 'hospitals', label: 'Hospitals listed', icon: Hospital, gradient: 'from-violet-500 to-fuchsia-500' },
]

export default function AdminPage() {
  const { user: currentUser } = useAuth()
  const queryClient = useQueryClient()

  const isAdmin = currentUser?.role === 'ADMIN'

  const statsQuery = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: adminApi.getStats,
    enabled: isAdmin,
  })
  const usersQuery = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: adminApi.getUsers,
    enabled: isAdmin,
  })

  const toggleMutation = useMutation({
    mutationFn: adminApi.toggleEnabled,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <span className="glass-panel flex h-16 w-16 items-center justify-center rounded-2xl">
          <ShieldAlert className="h-8 w-8 text-emergency" />
        </span>
        <h1 className="font-display text-2xl font-bold">Admins only</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          This area requires the ADMIN role. Sign in with an administrator account (default dev
          admin: admin@resqlink.dev).
        </p>
      </div>
    )
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="font-display text-3xl font-bold tracking-tight">Admin Panel</h1>
        <p className="mt-1.5 text-muted-foreground">
          Platform overview and user management.
        </p>
      </motion.div>

      {statsQuery.isPending ? (
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((n) => (
            <Skeleton key={n} className="h-28" />
          ))}
        </div>
      ) : statsQuery.data ? (
        <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {STAT_META.map(({ key, label, icon: Icon, gradient }) => (
            <GlassCard key={key} className="p-4">
              <span
                className={cn(
                  'mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br text-white',
                  gradient,
                )}
              >
                <Icon className="h-4.5 w-4.5" />
              </span>
              <p className="font-display text-2xl font-bold">
                <AnimatedCounter to={statsQuery.data[key]} duration={1} />
              </p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </GlassCard>
          ))}
        </motion.div>
      ) : null}

      <motion.div variants={fadeUp}>
        <GlassCard className="overflow-hidden">
          <div className="border-b border-border px-6 py-4">
            <h2 className="font-semibold">Users</h2>
            <p className="text-xs text-muted-foreground">Latest 100 accounts</p>
          </div>
          {usersQuery.isPending ? (
            <div className="space-y-3 p-6">
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {(usersQuery.data ?? []).map((user) => (
                <div key={user.id} className="flex items-center gap-4 px-6 py-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-xs font-semibold text-white">
                    {getInitials(user.fullName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                      {user.fullName}
                      <Badge
                        variant={user.role === 'ADMIN' ? 'primary' : 'default'}
                        className="px-1.5 py-0 text-[9px]"
                      >
                        {user.role}
                      </Badge>
                      {!user.enabled && (
                        <Badge variant="emergency" className="px-1.5 py-0 text-[9px]">
                          DISABLED
                        </Badge>
                      )}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <p className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                    {new Date(user.createdAt).toLocaleDateString([], {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                  {user.id !== currentUser?.id && (
                    <Button
                      variant={user.enabled ? 'outline' : 'primary'}
                      size="sm"
                      className={cn('h-8 shrink-0', !user.enabled && 'bg-success shadow-success/25')}
                      disabled={toggleMutation.isPending}
                      onClick={() => {
                        const action = user.enabled ? 'Disable' : 'Enable'
                        if (window.confirm(`${action} ${user.fullName}'s account?`)) {
                          toggleMutation.mutate(user.id)
                        }
                      }}
                    >
                      {user.enabled ? (
                        <>
                          <Ban className="h-3.5 w-3.5" /> Disable
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" /> Enable
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}
