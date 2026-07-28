import { type ComponentPropsWithRef, type MouseEvent } from 'react'
import { cn } from '@/lib/utils'

export function GlassCard({ className, ...props }: ComponentPropsWithRef<'div'>) {
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    e.currentTarget.style.setProperty('--spot-x', `${x}px`)
    e.currentTarget.style.setProperty('--spot-y', `${y}px`)
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      className={cn('glass-panel spotlight-card rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/25 transition-all duration-300', className)}
      {...props}
    />
  )
}
