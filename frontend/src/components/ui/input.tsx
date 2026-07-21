import { useId, type ComponentPropsWithRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Input({ className, ...props }: ComponentPropsWithRef<'input'>) {
  return (
    <input
      className={cn(
        'h-11 w-full rounded-xl border border-input bg-background/50 px-4 text-sm text-foreground placeholder:text-muted-foreground/70 transition-all duration-200',
        'focus:border-primary/60 focus:ring-2 focus:ring-ring/40 focus:outline-none',
        'aria-invalid:border-emergency/60 aria-invalid:ring-emergency/20',
        className,
      )}
      {...props}
    />
  )
}

interface FormFieldProps extends ComponentPropsWithRef<'input'> {
  label: string
  error?: string
  trailing?: ReactNode
}

export function FormField({ label, error, trailing, id, className, ...props }: FormFieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="text-sm font-medium text-foreground/90">
        {label}
      </label>
      <div className="relative">
        <Input
          id={fieldId}
          aria-invalid={error ? true : undefined}
          className={cn(trailing && 'pr-11', className)}
          {...props}
        />
        {trailing && (
          <div className="absolute inset-y-0 right-3 flex items-center">{trailing}</div>
        )}
      </div>
      {error && <p className="text-xs text-emergency">{error}</p>}
    </div>
  )
}
