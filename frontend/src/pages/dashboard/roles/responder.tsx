import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  AlertTriangle,
  Clock,
  Shield,
  Siren,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import { GlassCard } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import { fadeUp, staggerContainer } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'

function StatCard({ icon: Icon, label, value, gradient }: {
  icon: LucideIcon; label: string; value: number; gradient: string
}) {
  return (
    <GlassCard className="p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md', gradient)}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="font-display mt-3 text-2xl font-bold">
        <AnimatedCounter to={value} duration={1.2} />
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </GlassCard>
  )
}

export default function ResponderDashboard() {
  const statsQuery = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => (await api.get('/dashboard/stats')).data,
  })

  const stats = statsQuery.data as Record<string, number> | undefined

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="font-display text-3xl font-bold tracking-tight">Responder Dashboard</h1>
        <p className="mt-1.5 text-muted-foreground">Active emergencies and dispatch queue.</p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={fadeUp}>
          <StatCard icon={Siren} label="Active Emergencies" value={stats?.activeEmergencies ?? 0} gradient="from-rose-500 to-red-600" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard icon={Shield} label="Pending Dispatch" value={0} gradient="from-amber-500 to-orange-500" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard icon={Clock} label="Avg Response Time" value={0} gradient="from-blue-500 to-cyan-500" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard icon={TrendingUp} label="Resolved Today" value={0} gradient="from-emerald-500 to-teal-500" />
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={fadeUp}>
          <GlassCard className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Dispatch Queue</h2>
              <Badge variant="emergency">0 pending</Badge>
            </div>
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              No dispatch requests at this time
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={fadeUp}>
          <GlassCard className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Recent Incidents</h2>
            </div>
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              No recent incidents — stay ready
            </div>
          </GlassCard>
        </motion.div>
      </div>

      <motion.div variants={fadeUp}>
        <GlassCard className="p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </span>
            <div>
              <p className="font-semibold">On Duty Status</p>
              <p className="text-xs text-muted-foreground">You are currently marked as available for dispatch</p>
            </div>
            <Badge variant="success" className="ml-auto">ON DUTY</Badge>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}
