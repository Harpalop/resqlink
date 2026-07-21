import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Siren } from 'lucide-react'
import { cn } from '@/lib/utils'

type SosPhase = 'idle' | 'countdown'

interface SosButtonProps {
  onActivate: () => void
  disabled?: boolean
  countdownSeconds?: number
}

/**
 * The core SOS trigger. Click starts a cancellable countdown; when it hits
 * zero the emergency fires. Clicking again during countdown aborts it.
 */
export function SosButton({ onActivate, disabled, countdownSeconds = 5 }: SosButtonProps) {
  const [phase, setPhase] = useState<SosPhase>('idle')
  const [remaining, setRemaining] = useState(countdownSeconds)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clear = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  useEffect(() => clear, [])

  const start = () => {
    setPhase('countdown')
    setRemaining(countdownSeconds)
    intervalRef.current = setInterval(() => {
      // Side effects must stay OUT of the setState updater — React StrictMode
      // double-invokes updaters, which would fire the SOS twice.
      setRemaining((seconds) => Math.max(0, seconds - 1))
    }, 1000)
  }

  // Fire exactly once when the countdown reaches zero.
  useEffect(() => {
    if (phase === 'countdown' && remaining === 0) {
      clear()
      setPhase('idle')
      setRemaining(countdownSeconds)
      onActivate()
    }
  }, [phase, remaining, countdownSeconds, onActivate])

  const abort = () => {
    clear()
    setPhase('idle')
    setRemaining(countdownSeconds)
  }

  const isCounting = phase === 'countdown'
  const progress = (countdownSeconds - remaining) / countdownSeconds

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative flex h-64 w-64 items-center justify-center">
        {/* Idle radar pulses */}
        {!isCounting &&
          !disabled &&
          [0, 1.1, 2.2].map((delay) => (
            <motion.span
              key={delay}
              initial={{ opacity: 0.45, scale: 0.72 }}
              animate={{ opacity: 0, scale: 1.28 }}
              transition={{ duration: 3.2, repeat: Infinity, delay, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full border-2 border-emergency/50"
            />
          ))}

        {/* Countdown progress ring */}
        {isCounting && (
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="47"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-emergency/20"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="47"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="text-emergency"
              strokeDasharray={2 * Math.PI * 47}
              initial={{ strokeDashoffset: 2 * Math.PI * 47 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 47 * (1 - progress) }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </svg>
        )}

        <motion.button
          type="button"
          disabled={disabled}
          onClick={isCounting ? abort : start}
          whileTap={{ scale: 0.94 }}
          animate={
            isCounting
              ? { scale: [1, 1.04, 1], transition: { duration: 1, repeat: Infinity } }
              : {}
          }
          aria-label={isCounting ? 'Cancel SOS countdown' : 'Trigger SOS'}
          className={cn(
            'relative flex h-52 w-52 flex-col items-center justify-center gap-1.5 rounded-full text-white select-none',
            'bg-gradient-to-br from-rose-500 via-red-600 to-rose-700',
            'shadow-[0_0_80px_-12px] shadow-emergency/60 transition-shadow',
            'disabled:opacity-40 disabled:shadow-none',
            !disabled && 'hover:shadow-[0_0_110px_-8px] hover:shadow-emergency/70',
          )}
        >
          <AnimatePresence mode="wait">
            {isCounting ? (
              <motion.div
                key="countdown"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                className="flex flex-col items-center"
              >
                <span className="font-display text-7xl font-bold tabular-nums">{remaining}</span>
                <span className="text-xs font-medium tracking-widest uppercase opacity-90">
                  Tap to cancel
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                className="flex flex-col items-center gap-2"
              >
                <Siren className="h-14 w-14" strokeWidth={1.8} />
                <span className="font-display text-3xl font-bold tracking-wider">SOS</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <p className="max-w-xs text-center text-sm text-muted-foreground">
        {isCounting
          ? 'Alerting emergency network when the countdown ends…'
          : disabled
            ? 'Resolve your active emergency before triggering a new one.'
            : 'Tap the button — you get a 5-second window to cancel accidental triggers.'}
      </p>
    </div>
  )
}
