import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  Activity,
  CalendarClock,
  Stethoscope,
  TrendingUp,
  UserCheck,
  type LucideIcon,
} from 'lucide-react'
import { GlassCard } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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

export default function DoctorDashboard() {
  const statsQuery = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => (await api.get('/dashboard/stats')).data,
  })

  const stats = statsQuery.data as Record<string, number> | undefined

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="font-display text-3xl font-bold tracking-tight">Doctor Dashboard</h1>
        <p className="mt-1.5 text-muted-foreground">Manage your patients and telemedicine consultations.</p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={fadeUp}>
          <StatCard icon={Stethoscope} label="Active Consultations" value={stats?.myActiveEmergencies ?? 0} gradient="from-emerald-500 to-teal-500" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard icon={CalendarClock} label="Upcoming Appointments" value={0} gradient="from-violet-500 to-fuchsia-500" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard icon={UserCheck} label="Patients Seen Today" value={0} gradient="from-blue-500 to-cyan-500" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard icon={TrendingUp} label="Avg Response Time" value={0} gradient="from-amber-500 to-orange-500" />
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={fadeUp}>
          <GlassCard className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Patient Queue</h2>
              <Badge variant="success">0 pending</Badge>
            </div>
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              No patients in queue right now
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={fadeUp}>
          <GlassCard className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Recent Consultations</h2>
            </div>
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              No consultations yet — accept a patient to begin
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
                <p className="font-semibold">Your Availability</p>
                <p className="text-xs text-muted-foreground">Control when patients can book consultations</p>
              </div>
            </div>
            <Button variant="primary" size="sm">Go Online</Button>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}
