import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Award, Lock, Trophy } from 'lucide-react'
import { GlassCard } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import { api } from '@/lib/api'
import { EASE, fadeUp, staggerContainer } from '@/lib/motion'
import { cn } from '@/lib/utils'

interface Achievement {
  id: string
  title: string
  description: string
  unlocked: boolean
  points: number
}

interface AchievementSummary {
  totalPoints: number
  level: number
  levelName: string
  unlockedCount: number
  achievements: Achievement[]
}

export default function AchievementsPage() {
  const achievementsQuery = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => (await api.get<AchievementSummary>('/achievements')).data,
  })

  const data = achievementsQuery.data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Achievements</h1>
        <p className="mt-1.5 text-muted-foreground">
          Earn badges by making yourself — and your community — safer.
        </p>
      </div>

      {achievementsQuery.isPending || !data ? (
        <>
          <Skeleton className="h-36" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <Skeleton key={n} className="h-32" />
            ))}
          </div>
        </>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-6">
          <motion.div variants={fadeUp}>
            <GlassCard className="relative overflow-hidden p-7">
              <div className="absolute -top-16 right-0 h-48 w-48 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 blur-3xl" />
              <div className="relative flex flex-wrap items-center gap-6">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30">
                  <Trophy className="h-8 w-8 text-white" />
                </span>
                <div className="min-w-40">
                  <p className="text-xs tracking-widest text-muted-foreground uppercase">
                    Level {data.level}
                  </p>
                  <p className="font-display text-gradient text-3xl font-bold">{data.levelName}</p>
                </div>
                <div className="ml-auto flex gap-8 text-center">
                  <div>
                    <p className="font-display text-3xl font-bold">
                      <AnimatedCounter to={data.totalPoints} />
                    </p>
                    <p className="text-xs text-muted-foreground">Points</p>
                  </div>
                  <div>
                    <p className="font-display text-3xl font-bold">
                      {data.unlockedCount}/{data.achievements.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Badges</p>
                  </div>
                </div>
              </div>
              <div className="relative mt-6 h-2 overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(100, ((data.totalPoints % 60) / 60) * 100)}%`,
                  }}
                  transition={{ duration: 1.2, ease: EASE }}
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                />
              </div>
              <p className="relative mt-2 text-xs text-muted-foreground">
                {60 - (data.totalPoints % 60)} points to the next level
              </p>
            </GlassCard>
          </motion.div>

          <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.achievements.map((achievement) => (
              <GlassCard
                key={achievement.id}
                className={cn(
                  'flex gap-4 p-5 transition-all duration-300',
                  achievement.unlocked
                    ? 'hover:-translate-y-0.5'
                    : 'opacity-60 grayscale-[0.4]',
                )}
              >
                <span
                  className={cn(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-md',
                    achievement.unlocked
                      ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {achievement.unlocked ? (
                    <Award className="h-5 w-5" />
                  ) : (
                    <Lock className="h-5 w-5" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-semibold">
                    {achievement.title}
                    <Badge
                      variant={achievement.unlocked ? 'success' : 'default'}
                      className="px-2 py-0 text-[9px]"
                    >
                      +{achievement.points} pts
                    </Badge>
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{achievement.description}</p>
                </div>
              </GlassCard>
            ))}
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
