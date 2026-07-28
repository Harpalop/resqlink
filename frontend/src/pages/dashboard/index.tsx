import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ArrowRight,
  Bot,
  Droplets,
  HeartHandshake,
  ScanLine,
  Siren,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import { useAuth } from '@/features/auth/auth-context'
import { dashboardApi, type AnalyticsData } from '@/features/dashboard/api'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import DoctorDashboard from './roles/doctor'
import ResponderDashboard from './roles/responder'
import HospitalAdminDashboard from './roles/hospital-admin'

/* ─── Animated stagger container ──────────────────────────────── */
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const } },
}

/* ─── Stat tile ────────────────────────────────────────────────── */
interface StatTileProps {
  icon: LucideIcon
  label: string
  value: number
  suffix?: string
  gradient: string
  to?: string
}

function StatTile({ icon: Icon, label, value, suffix = '', gradient, to }: StatTileProps) {
  const body = (
    <GlassCard className="group relative h-full p-6 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/20">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative z-10 flex items-start justify-between">
        <span
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3',
            gradient,
          )}
        >
          <Icon className="h-6 w-6" />
        </span>
        {to && <ArrowRight className="h-5 w-5 text-muted-foreground/30 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-primary" />}
      </div>
      <p className="relative z-10 mt-6 font-display text-4xl font-bold tracking-tight">
        <AnimatedCounter to={value} suffix={suffix} duration={1.5} />
      </p>
      <p className="relative z-10 mt-1 text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">{label}</p>
    </GlassCard>
  )
  return to ? <Link to={to} className="block h-full">{body}</Link> : body
}

/* ─── Chart theme colors ────────────────────────────────────── */
function useChartColors() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isLight = mounted && resolvedTheme === 'light'
  return {
    text: isLight ? '#333' : '#ccc',
    grid: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)',
    gradient1: isLight ? '#6366f1' : '#818cf8',
    gradient2: isLight ? '#ec4899' : '#f472b6',
    gradient3: isLight ? '#f97316' : '#fb923c',
    gradient4: isLight ? '#10b981' : '#34d399',
    gradient5: isLight ? '#06b6d4' : '#22d3ee',
  }
}

/* ─── Custom tooltip ──────────────────────────────────────────── */
function ChartTooltip({ active, payload, label }: {
  active?: boolean; payload?: Array<{ value: number; name?: string }>; label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-panel rounded-xl border border-border/50 px-4 py-3 text-xs shadow-xl backdrop-blur-md">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-muted-foreground">
          <span className="font-semibold text-foreground">{p.value}</span> {p.name ?? ''}
        </p>
      ))}
    </div>
  )
}

/* ─── Emergency trend (area chart) ────────────────────────────── */
function TrendChart({ data }: { data: AnalyticsData['trend'] }) {
  const colors = useChartColors()
  const chartData = data.map((d) => ({
    ...d,
    date: d.date.slice(5), // MM-DD
  }))
  return (
    <motion.div variants={fadeUp}>
      <GlassCard className="p-6">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-semibold">Emergency Trends</h2>
          <Badge variant="primary" className="text-[10px]">30 days</Badge>
        </div>
        <p className="mb-4 text-xs text-muted-foreground">Daily SOS triggers over the last month</p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -26, bottom: 0 }}>
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.gradient1} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={colors.gradient1} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={colors.grid} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: colors.text }}
                interval="preserveStartEnd"
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: colors.text }}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke={colors.gradient1}
                strokeWidth={2.5}
                fill="url(#trendGradient)"
                dot={false}
                activeDot={{ r: 5, stroke: colors.gradient1, strokeWidth: 2, fill: 'white' }}
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </motion.div>
  )
}

/* ─── Hourly distribution (bar chart) ──────────────────────────── */
function HourlyChart({ data }: { data: AnalyticsData['hourly'] }) {
  const colors = useChartColors()
  return (
    <motion.div variants={fadeUp}>
      <GlassCard className="p-6">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-semibold">Hourly Distribution</h2>
          <Badge className="text-[10px]">Peak hours</Badge>
        </div>
        <p className="mb-4 text-xs text-muted-foreground">When emergencies happen most</p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, left: -26, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={colors.grid} />
              <XAxis
                dataKey="hour"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: colors.text }}
                tickFormatter={(v) => `${v}:00`}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: colors.text }}
              />
              <Tooltip
                cursor={{ fill: 'currentColor', opacity: 0.06 }}
                content={<ChartTooltip />}
              />
              <Bar dataKey="count" name="Emergencies" radius={[4, 4, 0, 0]} maxBarSize={20} animationDuration={1200}>
                {data.map((entry, index) => {
                  const max = Math.max(...data.map((d) => d.count), 1)
                  const ratio = entry.count / max
                  return (
                    <Cell
                      key={index}
                      fill={ratio > 0.8 ? colors.gradient3 : ratio > 0.4 ? colors.gradient2 : colors.gradient1}
                    />
                  )
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </motion.div>
  )
}

/* ─── SOS type breakdown (pie chart) ──────────────────────────── */
const PIE_COLORS = ['#6366f1', '#ec4899', '#f97316', '#10b981', '#06b6d4', '#8b5cf6']

function TypePieChart({ data }: { data: AnalyticsData['typeBreakdown'] }) {
  const filtered = data.filter((d) => d.count > 0)
  return (
    <motion.div variants={fadeUp}>
      <GlassCard className="p-6">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-semibold">SOS Types</h2>
          <Badge variant="emergency" className="text-[10px]">Breakdown</Badge>
        </div>
        <p className="mb-4 text-xs text-muted-foreground">Emergency categories in the last 30 days</p>
        {filtered.length === 0 ? (
          <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
            No emergency data yet
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 lg:flex-row">
            <div className="h-56 w-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={filtered}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="count"
                    nameKey="type"
                    paddingAngle={3}
                    animationDuration={1200}
                    animationBegin={300}
                  >
                    {filtered.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-2">
              {filtered.map((item, i) => (
                <div key={item.type} className="flex items-center gap-2 text-sm">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  <span className="text-muted-foreground">{item.type}</span>
                  <span className="font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </GlassCard>
    </motion.div>
  )
}

/* ─── Donors bar chart ────────────────────────────────────────── */
function DonorsChart({ stats }: { stats: { donorsByBloodGroup: Array<{ group: string; count: number }> } }) {
  const colors = useChartColors()
  return (
    <motion.div variants={fadeUp}>
      <GlassCard className="p-6">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-semibold">Donor Network</h2>
          <Badge variant="success" className="text-[10px]">Live</Badge>
        </div>
        <p className="mb-4 text-xs text-muted-foreground">Registered donors by blood group</p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.donorsByBloodGroup} margin={{ top: 4, right: 4, left: -26, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={colors.grid} />
              <XAxis
                dataKey="group"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: colors.text }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: colors.text }}
              />
              <Tooltip
                cursor={{ fill: 'currentColor', opacity: 0.06 }}
                content={<ChartTooltip />}
              />
              <Bar dataKey="count" name="Donors" radius={[4, 4, 0, 0]} maxBarSize={34} animationDuration={1200}>
                {stats.donorsByBloodGroup.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </motion.div>
  )
}

/* ─── API health status ────────────────────────────────────────── */
function ApiStatus() {
  const healthQuery = useQuery({
    queryKey: ['health'],
    queryFn: async () => (await api.get<{ status: string }>('/health')).data,
    refetchInterval: 30_000,
    retry: 1,
  })
  const state = healthQuery.isPending ? 'checking' : healthQuery.isError ? 'offline' : 'online'
  const cfg = {
    checking: { dot: 'bg-amber-500 animate-pulse', text: 'Checking systems…' },
    online: { dot: 'bg-emerald-500', text: 'All systems operational' },
    offline: { dot: 'bg-rose-500', text: 'API offline — start the backend' },
  }[state]
  return (
    <span className="glass-panel flex items-center gap-2.5 rounded-full px-4 py-2 text-sm text-muted-foreground">
      <span className="relative flex h-2 w-2">
        {state === 'online' && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
        )}
        <span className={cn('relative inline-flex h-2 w-2 rounded-full', cfg.dot)} />
      </span>
      {cfg.text}
    </span>
  )
}

function CitizenDashboard() {
  const { user } = useAuth()
  const firstName = user?.fullName.split(' ')[0] ?? 'there'

  const statsQuery = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardApi.getStats,
    refetchInterval: 300_000,
  })
  const analyticsQuery = useQuery({
    queryKey: ['dashboard', 'analytics'],
    queryFn: dashboardApi.getAnalytics,
    refetchInterval: 300_000,
  })

  const stats = statsQuery.data
  const analytics = analyticsQuery.data

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8 pb-12">
      {/* Hero Header */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-[2rem] bg-card p-8 sm:p-12 border border-border/50 shadow-xl shadow-black/5 dark:shadow-black/20 bg-grid">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 opacity-40 animate-pulse-slow pointer-events-none">
           <div className="w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
        </div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 opacity-30 animate-pulse-slow pointer-events-none" style={{ animationDelay: '1s' }}>
           <div className="w-72 h-72 bg-emerald-500/20 rounded-full blur-[80px]" />
        </div>
        
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Welcome back, <span className="text-aurora">{firstName}</span>
            </h1>
            <p className="mt-5 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl">
              Your comprehensive emergency response network is active. Keep an eye on local alerts, manage your medical profile, and respond to SOS requests nearby.
            </p>
          </div>
          <div className="flex-shrink-0">
            <ApiStatus />
          </div>
        </div>
      </motion.div>

      {/* Quick Actions (Bento Grid Style) */}
      <motion.div variants={fadeUp}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Emergency SOS', to: '/sos', gradient: 'from-rose-500 to-red-600', icon: Siren, borderGlow: 'hover:border-rose-500/50 hover:shadow-rose-500/20', sub: 'Trigger immediate help' },
            { label: 'AI Assistant', to: '/assistant', gradient: 'from-violet-500 to-fuchsia-500', icon: Bot, borderGlow: 'hover:border-violet-500/50 hover:shadow-violet-500/20', sub: 'Ask medical queries' },
            { label: 'Medical ID', to: '/medical-id', gradient: 'from-blue-500 to-cyan-400', icon: ScanLine, borderGlow: 'hover:border-cyan-500/50 hover:shadow-cyan-500/20', sub: 'Manage health data' },
            { label: 'Blood Network', to: '/blood', gradient: 'from-rose-500 to-pink-500', icon: Droplets, borderGlow: 'hover:border-pink-500/50 hover:shadow-pink-500/20', sub: 'Donate or request blood' },
          ].map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className={cn(
                "group relative overflow-hidden flex flex-col gap-4 rounded-[1.5rem] border border-border/60 bg-card p-6 transition-all duration-500 hover:-translate-y-1.5 shadow-lg shadow-black/5 dark:shadow-black/20 btn-shine",
                action.borderGlow
              )}
            >
              <div className="flex items-start justify-between">
                <span className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3', action.gradient)}>
                  <action.icon className="h-7 w-7" />
                </span>
                <div className="rounded-full bg-muted/50 p-2 text-muted-foreground/50 transition-colors duration-300 group-hover:bg-foreground/5 group-hover:text-foreground">
                  <ArrowRight className="h-5 w-5 -rotate-45 transition-transform duration-300 group-hover:rotate-0" />
                </div>
              </div>
              <div className="mt-2">
                <h3 className="font-semibold text-xl tracking-tight">{action.label}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{action.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Network Overview Stats */}
      <motion.div variants={fadeUp}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Network Overview</h2>
          <Badge variant="outline" className="text-xs backdrop-blur-md">Live Updates</Badge>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatTile icon={Users} label="Network Users" value={stats?.networkUsers ?? 0} gradient="from-blue-500 to-cyan-400" />
          <StatTile icon={Siren} label="Your SOS" value={stats?.myEmergencies ?? 0} gradient="from-rose-500 to-red-600" to="/sos" />
          <StatTile icon={HeartHandshake} label="Blood Donors" value={stats?.availableDonors ?? 0} gradient="from-rose-500 to-pink-500" to="/blood" />
          <StatTile icon={Droplets} label="Blood Requests" value={stats?.openBloodRequests ?? 0} gradient="from-violet-500 to-fuchsia-500" to="/blood" />
          <StatTile icon={ScanLine} label="Active SOS" value={stats?.myActiveEmergencies ?? 0} suffix=" active" gradient="from-emerald-500 to-teal-400" to="/sos" />
        </div>
      </motion.div>

      {/* Charts row 1: Trend + Type Pie */}
      {analytics ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <TrendChart data={analytics.trend} />
          <TypePieChart data={analytics.typeBreakdown} />
        </div>
      ) : analyticsQuery.isPending ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-[340px] rounded-[2rem]" />
          <Skeleton className="h-[340px] rounded-[2rem]" />
        </div>
      ) : null}

      {/* Charts row 2: Hourly + Donors */}
      <div className="grid gap-6 lg:grid-cols-2">
        {analytics ? <HourlyChart data={analytics.hourly} /> : <Skeleton className="h-[340px] rounded-[2rem]" />}
        {stats ? <DonorsChart stats={stats} /> : <Skeleton className="h-[340px] rounded-[2rem]" />}
      </div>
    </motion.div>
  )
}

/* ─── Main dashboard ──────────────────────────────────────────── */
export default function DashboardPage() {
  const { user } = useAuth()
  const role = user?.role as string

  // Route to role-specific dashboards
  if (role === 'DOCTOR' || role === 'NURSE') return <DoctorDashboard />
  if (role === 'POLICE' || role === 'FIREFIGHTER' || role === 'RESCUE_TEAM' || role === 'AMBULANCE_OPERATOR') return <ResponderDashboard />
  if (role === 'HOSPITAL_ADMIN') return <HospitalAdminDashboard />

  return <CitizenDashboard />
}
