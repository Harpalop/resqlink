import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { fadeUp, staggerContainer } from '@/lib/motion'
import { cn } from '@/lib/utils'

interface SectionHeadingProps {
  eyebrow: string
  title: ReactNode
  description?: string
  align?: 'center' | 'left'
  className?: string
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  className,
}: SectionHeadingProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      className={cn(
        'mb-14 flex flex-col gap-4',
        align === 'center' && 'items-center text-center',
        className,
      )}
    >
      <motion.div variants={fadeUp}>
        <Badge variant="primary" className="uppercase tracking-widest">
          {eyebrow}
        </Badge>
      </motion.div>
      <motion.h2
        variants={fadeUp}
        className="font-display max-w-2xl text-3xl font-bold tracking-tight text-balance md:text-5xl"
      >
        {title}
      </motion.h2>
      {description && (
        <motion.p variants={fadeUp} className="max-w-2xl text-base text-muted-foreground md:text-lg">
          {description}
        </motion.p>
      )}
    </motion.div>
  )
}
