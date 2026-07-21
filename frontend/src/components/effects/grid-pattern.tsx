import { cn } from '@/lib/utils'

export function GridPattern({ className }: { className?: string }) {
  return (
    <div
      className={cn('pointer-events-none absolute inset-0 bg-grid mask-fade-edges', className)}
      aria-hidden
    />
  )
}
