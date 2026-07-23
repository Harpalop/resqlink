import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QRCodeSVG } from 'qrcode.react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  Check,
  Copy,
  ExternalLink,
  HeartPulse,
  RefreshCw,
  ScanLine,
  ShieldCheck,
} from 'lucide-react'
import { GlassCard } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { profileApi } from '@/features/profile/api'
import { useAuth } from '@/features/auth/auth-context'
import { EASE } from '@/lib/motion'

const VISIBLE_ITEMS = [
  'Full name, age and gender',
  'Blood group — shown first, in red',
  'Allergies and medical conditions',
  'Current medications',
  'Organ donor status',
  'Insurance details',
  'Emergency contacts with one-tap calling',
]

export default function MedicalIdPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [copied, setCopied] = useState(false)

  const profileQuery = useQuery({ queryKey: ['profile'], queryFn: profileApi.getProfile })

  const regenerateMutation = useMutation({
    mutationFn: profileApi.regenerateToken,
    onSuccess: (profile) => queryClient.setQueryData(['profile'], profile),
  })

  if (profileQuery.isPending) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-[430px]" />
        <Skeleton className="h-[430px]" />
      </div>
    )
  }

  const profile = profileQuery.data
  if (!profile) return null

  // Where the QR code should point. In production this is your deployed
  // domain (VITE_PUBLIC_APP_URL). Locally it falls back to whatever host the
  // app is served from — so if you open the app on your phone via your PC's
  // LAN IP (e.g. http://192.168.1.5:5173), the QR encodes that same IP and
  // scanning it from another phone on the same WiFi just works.
  const appOrigin = import.meta.env.VITE_PUBLIC_APP_URL ?? window.location.origin
  const publicUrl = `${appOrigin}/m/${profile.publicToken}`

  const copyLink = async () => {
    await navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const regenerate = () => {
    if (
      window.confirm(
        'Regenerate your Medical ID link? Any printed QR codes will stop working.',
      )
    ) {
      regenerateMutation.mutate()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Smart Medical ID</h1>
        <p className="mt-1.5 text-muted-foreground">
          A QR code that speaks for you when you can't. Print it, stick it on your helmet, wallet
          or phone case.
        </p>
      </div>

      {profile.completionPercent < 50 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3.5 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <p>
            Your profile is only <b>{profile.completionPercent}% complete</b> — responders will see
            very little.{' '}
            <Link to="/profile" className="font-medium text-primary hover:underline">
              Complete your profile →
            </Link>
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* The card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <div className="rounded-3xl bg-gradient-to-br from-blue-500 via-violet-500 to-rose-500 p-[1.5px] shadow-xl shadow-violet-500/20">
            <div className="rounded-3xl bg-background/95 p-7 backdrop-blur-xl">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-violet-500 to-rose-500">
                    <HeartPulse className="h-5 w-5 text-white" />
                  </span>
                  <div>
                    <p className="font-display text-sm font-bold tracking-tight">
                      ResQ<span className="text-gradient">Link</span>
                    </p>
                    <p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                      Smart Medical ID
                    </p>
                  </div>
                </div>
                {profile.medicalIdEnabled ? (
                  <Badge variant="success">ACTIVE</Badge>
                ) : (
                  <Badge variant="emergency">DISABLED</Badge>
                )}
              </div>

              <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                <div className="rounded-2xl bg-white p-3.5 shadow-lg">
                  <QRCodeSVG value={publicUrl} size={168} level="M" marginSize={0} />
                </div>
                <div className="flex-1 space-y-3 text-center sm:text-left">
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="font-semibold">{user?.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Blood group</p>
                    <p className="font-display text-2xl font-bold text-emergency">
                      {profile.bloodGroup ?? '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">ID</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {profile.publicToken.slice(0, 12)}…
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-6 text-center text-xs text-muted-foreground">
                Scan with any phone camera — no app required
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2.5">
            <Button variant="glass" size="md" onClick={copyLink} className="flex-1">
              {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy link'}
            </Button>
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className={`${buttonVariants({ variant: 'glass', size: 'md' })} flex-1`}
            >
              <ExternalLink className="h-4 w-4" /> Preview
            </a>
            <Button
              variant="outline"
              size="md"
              onClick={regenerate}
              disabled={regenerateMutation.isPending}
              className="flex-1"
            >
              <RefreshCw
                className={`h-4 w-4 ${regenerateMutation.isPending ? 'animate-spin' : ''}`}
              />
              New link
            </Button>
          </div>
        </motion.div>

        {/* What responders see */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
          className="space-y-5"
        >
          <GlassCard className="p-6">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
                <ScanLine className="h-4 w-4 text-primary" />
              </span>
              <h2 className="font-semibold">What responders see</h2>
            </div>
            <ul className="space-y-2.5">
              {VISIBLE_ITEMS.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  {item}
                </li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="mb-3 flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/15">
                <ShieldCheck className="h-4 w-4 text-success" />
              </span>
              <h2 className="font-semibold">Privacy, by design</h2>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Your Medical ID is only reachable through this unguessable link — it never appears in
              search results. You can disable it any time from your profile, or generate a new link
              to instantly invalidate the old one.
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}
