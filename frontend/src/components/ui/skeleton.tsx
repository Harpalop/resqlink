import type { ComponentPropsWithRef } from 'react'
import { cn } from '@/lib/utils'

export function Skeleton({ className, ...props }: ComponentPropsWithRef<'div'>) {
  return (
    <div
      className={cn(
        'animate-shimmer rounded-xl bg-gradient-to-r from-muted via-foreground/10 to-muted bg-[length:200%_100%]',
        className,
      )}
      {...props}
    />
  )
}
