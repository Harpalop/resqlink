import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LifeBuoy } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { GradientOrbs } from '@/components/effects/gradient-orbs'
import { GridPattern } from '@/components/effects/grid-pattern'
import { EASE } from '@/lib/motion'

export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 text-center">
      <GradientOrbs />
      <GridPattern />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="relative flex flex-col items-center"
      >
        <span className="glass-panel mb-8 flex h-16 w-16 items-center justify-center rounded-2xl">
          <LifeBuoy className="h-8 w-8 text-primary" />
        </span>
        <h1 className="font-display text-gradient text-8xl font-bold">404</h1>
        <h2 className="font-display mt-4 text-2xl font-semibold tracking-tight md:text-3xl">
          This page needs rescuing.
        </h2>
        <p className="mt-3 max-w-md text-muted-foreground">
          The page you're looking for doesn't exist or has been moved to a safer location.
        </p>
        <Link to="/" className={`${buttonVariants({ variant: 'gradient', size: 'lg' })} mt-8`}>
          Return to safety
        </Link>
      </motion.div>
    </div>
  )
}
