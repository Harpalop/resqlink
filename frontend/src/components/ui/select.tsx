import { useId, type ComponentPropsWithRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectFieldProps extends ComponentPropsWithRef<'select'> {
  label: string
  error?: string
  options: Array<{ value: string; label: string }>
  placeholder?: string
}

export function SelectField({
  label,
  error,
  options,
  placeholder,
  id,
  className,
  ...props
}: SelectFieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="text-sm font-medium text-foreground/90">
        {label}
      </label>
      <div className="relative">
        <select
          id={fieldId}
          className={cn(
            'h-11 w-full appearance-none rounded-xl border border-input bg-background/50 px-4 pr-10 text-sm text-foreground transition-all duration-200',
            'focus:border-primary/60 focus:ring-2 focus:ring-ring/40 focus:outline-none',
            className,
          )}
          {...props}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
      {error && <p className="text-xs text-emergency">{error}</p>}
    </div>
  )
}
