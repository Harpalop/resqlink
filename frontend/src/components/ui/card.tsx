import type { ComponentPropsWithRef } from 'react'
import { cn } from '@/lib/utils'

export function GlassCard({ className, ...props }: ComponentPropsWithRef<'div'>) {
  return (
    <div
      className={cn('glass-panel rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/25', className)}
      {...props}
    />
  )
}
