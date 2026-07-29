import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  Activity,
  Bed,
  Droplets,
  Heart,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { GlassCard } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import { fadeUp, staggerContainer } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'

function StatCard({ icon: Icon, label, value, gradient, suffix }: {
  icon: LucideIcon; label: string; value: number; gradient: string; suffix?: string
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
        {suffix && <span className="ml-1 text-sm text-muted-foreground">{suffix}</span>}
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </GlassCard>
  )
}

export default function HospitalAdminDashboard() {
  const statsQuery = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => (await api.get('/dashboard/stats')).data,
  })

  const stats = statsQuery.data as Record<string, number> | undefined

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="font-display text-3xl font-bold tracking-tight">Hospital Dashboard</h1>
        <p className="mt-1.5 text-muted-foreground">Monitor capacity, blood bank levels, and staff status.</p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={fadeUp}>
          <StatCard icon={Bed} label="Bed Occupancy" value={12} suffix="/ 20" gradient="from-blue-500 to-cyan-500" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard icon={Droplets} label="Blood Units Available" value={stats?.availableDonors ?? 0} gradient="from-rose-500 to-pink-500" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard icon={Users} label="Staff On Duty" value={0} gradient="from-violet-500 to-fuchsia-500" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard icon={Heart} label="Active Emergencies" value={stats?.activeEmergencies ?? 0} gradient="from-rose-500 to-red-600" />
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={fadeUp}>
          <GlassCard className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Bed Capacity</h2>
              <Badge variant="primary">Live</Badge>
            </div>
            <div className="space-y-3">
              {[
                { label: 'ICU', total: 6, used: 3, color: 'bg-rose-500' },
                { label: 'General', total: 8, used: 5, color: 'bg-blue-500' },
                { label: 'Emergency', total: 6, used: 4, color: 'bg-amber-500' },
              ].map((ward) => (
                <div key={ward.label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-medium">{ward.label}</span>
                    <span className="text-muted-foreground">{ward.used} / {ward.total}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(ward.used / ward.total) * 100}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className={cn('h-full rounded-full', ward.color)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={fadeUp}>
          <GlassCard className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Blood Bank Stock</h2>
              <Badge variant="success">Good</Badge>
            </div>
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              Blood bank stock levels — coming soon
            </div>
          </GlassCard>
        </motion.div>
      </div>

      <motion.div variants={fadeUp}>
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15">
                <Activity className="h-5 w-5 text-emerald-500" />
              </span>
              <div>
                <p className="font-semibold">Hospital Status</p>
                <p className="text-xs text-muted-foreground">All departments operational</p>
              </div>
            </div>
            <Badge variant="success">OPERATIONAL</Badge>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}
