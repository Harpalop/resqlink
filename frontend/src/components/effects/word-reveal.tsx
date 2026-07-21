import { Fragment } from 'react'
import { motion } from 'framer-motion'
import { EASE } from '@/lib/motion'
import { cn } from '@/lib/utils'

interface WordRevealProps {
  text: string
  className?: string
  delay?: number
  highlight?: string[]
  highlightClassName?: string
}

export function WordReveal({
  text,
  className,
  delay = 0,
  highlight = [],
  highlightClassName = 'text-aurora',
}: WordRevealProps) {
  const words = text.split(' ')

  return (
    <span className={className}>
      {words.map((word, index) => {
        const clean = word.replace(/[.,!?]/g, '')
        const isHighlighted = highlight.includes(clean)
        return (
          <Fragment key={`${word}-${index}`}>
            <motion.span
              initial={{ opacity: 0, y: 26, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.65, delay: delay + index * 0.08, ease: EASE }}
              className={cn('inline-block', isHighlighted && highlightClassName)}
            >
              {word}
            </motion.span>{' '}
          </Fragment>
        )
      })}
    </span>
  )
}
