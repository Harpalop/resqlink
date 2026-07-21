import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GradientOrbsProps {
  className?: string
}

export function GradientOrbs({ className }: GradientOrbsProps) {
  const reduceMotion = useReducedMotion()

  const orbs = [
    {
      className:
        'left-[8%] top-[12%] h-[420px] w-[420px] bg-blue-500/25 dark:bg-blue-500/20',
      animate: { x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.12, 1] },
      duration: 22,
    },
    {
      className:
        'right-[6%] top-[22%] h-[380px] w-[380px] bg-violet-500/25 dark:bg-violet-500/20',
      animate: { x: [0, -50, 0], y: [0, 55, 0], scale: [1, 1.08, 1] },
      duration: 26,
    },
    {
      className:
        'left-[32%] bottom-[4%] h-[360px] w-[360px] bg-rose-500/20 dark:bg-rose-500/15',
      animate: { x: [0, 45, 0], y: [0, -45, 0], scale: [1, 1.15, 1] },
      duration: 24,
    },
  ]

  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden>
      {orbs.map((orb, index) => (
        <motion.div
          key={index}
          className={cn('absolute rounded-full blur-[110px]', orb.className)}
          animate={reduceMotion ? undefined : orb.animate}
          transition={{ duration: orb.duration, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}
