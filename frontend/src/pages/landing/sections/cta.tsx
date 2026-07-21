import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Magnetic } from '@/components/effects/magnetic'
import { GridPattern } from '@/components/effects/grid-pattern'
import { Reveal } from '@/components/effects/reveal'
import { cn } from '@/lib/utils'

export function FinalCta() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-5 md:px-8">
        <Reveal>
          <div className="glass-panel relative overflow-hidden rounded-3xl px-6 py-16 text-center md:px-16 md:py-20">
            <div className="absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500/30 via-violet-500/30 to-rose-500/30 blur-[100px]" />
            <GridPattern />

            <div className="relative">
              <h2 className="font-display text-3xl font-bold tracking-tight text-balance md:text-5xl">
                Every second counts.{' '}
                <span className="text-gradient-emergency">Make yours matter.</span>
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
                Join ResQLink today and become part of an emergency network built to protect you,
                your family, and your community.
              </p>

              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Magnetic strength={0.2}>
                  <Link
                    to="/register"
                    className={cn(buttonVariants({ variant: 'gradient', size: 'xl' }), 'btn-shine')}
                  >
                    Create your free account
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Magnetic>
                <Link to="/login" className={buttonVariants({ variant: 'glass', size: 'xl' })}>
                  Sign in
                </Link>
              </div>

              <p className="mt-6 text-xs text-muted-foreground">
                Free for citizens · Open hardware · Built to save lives
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
