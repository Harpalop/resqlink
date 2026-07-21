import { useRef, type ComponentPropsWithRef, type MouseEvent } from 'react'
import { cn } from '@/lib/utils'

export function SpotlightCard({ className, children, ...props }: ComponentPropsWithRef<'div'>) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const element = ref.current
    if (!element) return
    const rect = element.getBoundingClientRect()
    element.style.setProperty('--spot-x', `${event.clientX - rect.left}px`)
    element.style.setProperty('--spot-y', `${event.clientY - rect.top}px`)
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={cn('spotlight-card glass-panel rounded-2xl', className)}
      {...props}
    >
      {children}
    </div>
  )
}
