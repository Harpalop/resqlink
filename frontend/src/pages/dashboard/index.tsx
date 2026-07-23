import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ArrowRight,
  Droplets,
  HeartHandshake,
  ScanLine,
  Siren,
  Users,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import { useAuth } from '@/features/auth/auth-context'
import { dashboardApi } from '@/features/dashboard/api'
import { CHART_COLORS, type DashboardStats } from '@/features/dashboard/types'
import { api } from '@/lib/api'
import { fadeUp, staggerContainer } from '@/lib/motion'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/* Stat tiles                                                          */
/* ------------------------------------------------------------------ */

interface StatTileProps {
  icon: LucideIcon
  label: string
  value: number
  suffix?: string
  hint?: string
  gradient: string
  to?: string
}

function StatTile({ icon: Icon, label, value, suffix = '', hint, gradient, to }: StatTileProps) {
  const body = (
    <GlassCard
      className={cn(
        'group h-full p-5 transition-all duration-300',
        to && 'hover:-translate-y-1 hover:border-primary/30',
      )}
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md transition-transform duration-300 group-hover:scale-110',
            gradient,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        {to && (
          <ArrowRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
        )}
      </div>
      <p className="font-display mt-4 text-3xl font-bold">
        <AnimatedCounter to={value} suffix={suffix} duration={1.2} />
      </p>
      <p className="mt-0.5 text-sm font-medium">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </GlassCard>
  )
  return to ? <Link to={to}>{body}</Link> : body
}

/* ------------------------------------------------------------------ */
/* Charts (colors validated with the dataviz palette validator)        */
/* ------------------------------------------------------------------ */

function useChartColors() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const mode = mounted && resolvedTheme === 'light' ? 'light' : 'dark'
  return CHART_COLORS[mode]
}

function ChartTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
  unit: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-panel rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="font-medium">{label}</p>
      <p className="text-muted-foreground">
        {payload[0]!.value} {unit}
      </p>
    </div>
  )
}

function EmergenciesChart({ stats }: { stats: DashboardStats }) {
  const colors = useChartColors()
  return (
    <GlassCard className="p-6">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="font-semibold">Your SOS activity</h2>
        <Badge className="text-[10px]">Last 7 days</Badge>
      </div>
      <p className="mb-5 text-xs text-muted-foreground">Emergencies you triggered per day</p>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats.emergenciesLast7Days} margin={{ top: 4, right: 4, left: -26, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="currentColor" className="text-foreground/8" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
            />
            <Tooltip
              cursor={{ fill: 'currentColor', opacity: 0.06 }}
              content={<ChartTooltip unit="emergencies" />}
            />
            <Bar
              dataKey="count"
              fill={colors.blue}
              radius={[4, 4, 0, 0]}
              maxBarSize={34}
              name="Emergencies"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  )
}

function DonorsChart({ stats }: { stats: DashboardStats }) {
  const colors = useChartColors()
  return (
    <GlassCard className="p-6">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="font-semibold">Donor network</h2>
        <Badge className="text-[10px]">Live</Badge>
      </div>
      <p className="mb-5 text-xs text-muted-foreground">Available donors by blood group</p>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats.donorsByBloodGroup} margin={{ top: 4, right: 4, left: -26, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="currentColor" className="text-foreground/8" />
            <XAxis
              dataKey="group"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
            />
            <Tooltip
              cursor={{ fill: 'currentColor', opacity: 0.06 }}
              content={<ChartTooltip unit="donors" />}
            />
            <Bar
              dataKey="count"
              fill={colors.magenta}
              radius={[4, 4, 0, 0]}
              maxBarSize={34}
              name="Donors"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  )
}

/* ------------------------------------------------------------------ */
/* Status + quick actions                                              */
/* ------------------------------------------------------------------ */

function ApiStatus() {
  const healthQuery = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const { data } = await api.get<{ status: string }>('/health')
      return data
    },
    refetchInterval: 30_000,
    retry: 1,
  })

  const state = healthQuery.isPending ? 'checking' : healthQuery.isError ? 'offline' : 'online'
  const config = {
    checking: { dot: 'bg-amber-500', text: 'Checking system status…' },
    online: { dot: 'bg-success', text: 'All systems operational' },
    offline: { dot: 'bg-emergency', text: 'API offline — start the backend' },
  }[state]

  return (
    <span className="glass-panel flex items-center gap-2.5 rounded-full px-4 py-2 text-sm text-muted-foreground">
      <span className="relative flex h-2 w-2">
        {state === 'online' && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
        )}
        <span className={cn('relative inline-flex h-2 w-2 rounded-full', config.dot)} />
      </span>
      {config.text}
    </span>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const firstName = user?.fullName.split(' ')[0] ?? 'there'

  const statsQuery = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardApi.getStats,
    refetchInterval: 300_000,
  })

  const stats = statsQuery.data

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-6">
      <motion.div
        variants={fadeUp}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Good to see you, <span className="text-gradient">{firstName}</span>
          </h1>
          <p className="mt-2 text-muted-foreground">Your emergency command center.</p>
        </div>
        <ApiStatus />
      </motion.div>

      {stats?.myActiveEmergencies ? (
        <motion.div variants={fadeUp}>
          <Link to="/sos">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-emergency/40 bg-emergency/10 px-5 py-4 transition-colors hover:bg-emergency/15">
              <p className="flex items-center gap-2.5 font-medium text-emergency">
                <Siren className="h-5 w-5 animate-pulse" />
                You have an active emergency — tap to view the live timeline
              </p>
              <ArrowRight className="h-4 w-4 text-emergency" />
            </div>
          </Link>
        </motion.div>
      ) : null}

      {statsQuery.isPending ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-40" />
          ))}
        </div>
      ) : stats ? (
        <>
          <motion.div variants={fadeUp} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              icon={UserRound}
              label="Profile completion"
              value={stats.profileCompletionPercent}
              suffix="%"
              hint={stats.profileCompletionPercent < 100 ? 'Complete it — it saves lives' : 'Fully ready for emergencies'}
              gradient="from-violet-500 to-fuchsia-500"
              to="/profile"
            />
            <StatTile
              icon={Users}
              label="Emergency contacts"
              value={stats.emergencyContacts}
              hint={stats.emergencyContacts === 0 ? 'Add people to alert' : 'People in your safety net'}
              gradient="from-blue-500 to-cyan-400"
              to="/contacts"
            />
            <StatTile
              icon={Siren}
              label="SOS alerts raised"
              value={stats.myEmergencies}
              hint={stats.myActiveEmergencies > 0 ? `${stats.myActiveEmergencies} active now` : 'All resolved'}
              gradient="from-rose-500 to-red-600"
              to="/sos"
            />
            <StatTile
              icon={Droplets}
              label={stats.isDonor ? 'Your donations' : 'Become a donor'}
              value={stats.isDonor ? stats.myDonations : stats.availableDonors}
              hint={stats.isDonor ? 'Each one saves up to 3 lives' : 'donors are already registered'}
              gradient="from-rose-500 to-pink-500"
              to="/blood"
            />
          </motion.div>

          <motion.div variants={fadeUp} className="grid gap-5 lg:grid-cols-2">
            <EmergenciesChart stats={stats} />
            <DonorsChart stats={stats} />
          </motion.div>

          <motion.div variants={fadeUp} className="grid gap-5 sm:grid-cols-3">
            <GlassCard className="flex items-center gap-4 p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15">
                <Users className="h-5 w-5 text-primary" />
              </span>
              <div>
                <p className="font-display text-xl font-bold">
                  <AnimatedCounter to={stats.networkUsers} />
                </p>
                <p className="text-xs text-muted-foreground">People on the network</p>
              </div>
            </GlassCard>
            <GlassCard className="flex items-center gap-4 p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-500/15">
                <HeartHandshake className="h-5 w-5 text-rose-500" />
              </span>
              <div>
                <p className="font-display text-xl font-bold">
                  <AnimatedCounter to={stats.availableDonors} />
                </p>
                <p className="text-xs text-muted-foreground">Donors available right now</p>
              </div>
            </GlassCard>
            <Link to="/blood">
              <GlassCard className="group flex h-full items-center gap-4 p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15">
                  <Droplets className="h-5 w-5 text-amber-500" />
                </span>
                <div>
                  <p className="font-display text-xl font-bold">
                    <AnimatedCounter to={stats.openBloodRequests} />
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Open blood requests — can you help?
                  </p>
                </div>
              </GlassCard>
            </Link>
          </motion.div>
        </>
      ) : null}

      <motion.div variants={fadeUp}>
        <GlassCard className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
              <ScanLine className="h-5 w-5 text-primary" />
            </span>
            <div>
              <p className="font-medium">Carry your Smart Medical ID</p>
              <p className="text-sm text-muted-foreground">
                Print the QR and keep it in your wallet — it speaks when you can't.
              </p>
            </div>
          </div>
          <Link
            to="/medical-id"
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            Open Medical ID <ArrowRight className="h-4 w-4" />
          </Link>
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}
