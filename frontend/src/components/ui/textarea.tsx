import { useId, type ComponentPropsWithRef } from 'react'
import { cn } from '@/lib/utils'

export function Textarea({ className, ...props }: ComponentPropsWithRef<'textarea'>) {
  return (
    <textarea
      className={cn(
        'min-h-[96px] w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 transition-all duration-200',
        'focus:border-primary/60 focus:ring-2 focus:ring-ring/40 focus:outline-none',
        className,
      )}
      {...props}
    />
  )
}

interface TextareaFieldProps extends ComponentPropsWithRef<'textarea'> {
  label: string
  hint?: string
  error?: string
}

export function TextareaField({ label, hint, error, id, ...props }: TextareaFieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="text-sm font-medium text-foreground/90">
        {label}
      </label>
      <Textarea id={fieldId} {...props} />
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-emergency">{error}</p>}
    </div>
  )
}
