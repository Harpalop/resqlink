import { Link } from 'react-router-dom'
import { HeartPulse } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  iconOnly?: boolean
}

export function Logo({ className, iconOnly = false }: LogoProps) {
  return (
    <Link to="/" className={cn('group inline-flex items-center gap-2.5', className)}>
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-violet-500 to-rose-500 shadow-lg shadow-violet-500/30 transition-transform duration-300 group-hover:scale-105">
        <HeartPulse className="h-5 w-5 text-white" strokeWidth={2.4} />
        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emergency">
          <span className="absolute inset-0 animate-ping rounded-full bg-emergency/80" />
        </span>
      </span>
      {!iconOnly && (
        <span className="font-display text-xl font-bold tracking-tight">
          ResQ<span className="text-gradient">Link</span>
        </span>
      )}
    </Link>
  )
}
