import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
  disabled?: boolean
}

export function Switch({ checked, onChange, label, description, disabled }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'flex w-full items-center justify-between gap-4 rounded-xl border border-border px-4 py-3.5 text-left transition-colors',
        'hover:border-foreground/20 disabled:opacity-50',
        checked && 'border-primary/40 bg-primary/5',
      )}
    >
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {description && (
          <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>
        )}
      </span>
      <span
        className={cn(
          'relative flex h-6 w-11 shrink-0 items-center rounded-full px-0.5 transition-colors duration-300',
          checked ? 'justify-end bg-primary' : 'justify-start bg-muted',
        )}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 32 }}
          className="h-5 w-5 rounded-full bg-white shadow-md"
        />
      </span>
    </button>
  )
}
