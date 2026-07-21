import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  CalendarClock,
  Loader2,
  Search,
  Star,
  Stethoscope,
  Video,
  X,
  Phone,
  Siren,
} from 'lucide-react'
import { GlassCard } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FormField, Input } from '@/components/ui/input'
import { SelectField } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { api, getApiErrorMessage } from '@/lib/api'
import { cn } from '@/lib/utils'

interface Doctor {
  id: string
  name: string
  speciality: string
  city: string
  experienceYears: number
  consultationFee: number
  rating: number
  availableForEmergency: boolean
}

interface Appointment {
  id: string
  doctorName: string
  speciality: string
  mode: 'VIDEO' | 'AUDIO' | 'EMERGENCY'
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED'
  scheduledAt: string
  reason: string | null
}

const teleApi = {
  searchDoctors: async (q: string) =>
    (await api.get<Doctor[]>('/telemedicine/doctors', { params: { q: q || undefined } })).data,
  myAppointments: async () =>
    (await api.get<Appointment[]>('/telemedicine/appointments')).data,
  book: async (payload: { doctorId: string; mode: string; scheduledAt: string; reason?: string }) =>
    (await api.post<Appointment>('/telemedicine/appointments', payload)).data,
  cancel: async (id: string) =>
    (await api.post<Appointment>(`/telemedicine/appointments/${id}/cancel`)).data,
}

const MODE_META = {
  VIDEO: { label: 'Video', icon: Video, badge: 'primary' as const },
  AUDIO: { label: 'Audio', icon: Phone, badge: 'default' as const },
  EMERGENCY: { label: 'Emergency', icon: Siren, badge: 'emergency' as const },
}

function BookingForm({ doctor, onClose }: { doctor: Doctor; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [mode, setMode] = useState('VIDEO')
  const [when, setWhen] = useState('')
  const [reason, setReason] = useState('')

  const bookMutation = useMutation({
    mutationFn: () =>
      teleApi.book({
        doctorId: doctor.id,
        mode,
        scheduledAt: new Date(when).toISOString(),
        reason: reason || undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['telemedicine'] })
      onClose()
    },
  })

  return (
    <GlassCard className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-semibold">Book with {doctor.name}</h2>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close booking form">
          <X className="h-4 w-4" />
        </Button>
      </div>
      {bookMutation.isError && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-emergency/30 bg-emergency/10 px-4 py-3 text-sm text-emergency">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {getApiErrorMessage(bookMutation.error, 'Could not book the appointment.')}
        </div>
      )}
      <form
        onSubmit={(event) => {
          event.preventDefault()
          if (when) bookMutation.mutate()
        }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <SelectField
          label="Consultation type"
          options={[
            { value: 'VIDEO', label: 'HD Video consultation' },
            { value: 'AUDIO', label: 'Audio consultation' },
            { value: 'EMERGENCY', label: 'Emergency consultation' },
          ]}
          value={mode}
          onChange={(event) => setMode(event.target.value)}
        />
        <FormField
          label="Date & time"
          type="datetime-local"
          value={when}
          onChange={(event) => setWhen(event.target.value)}
          required
        />
        <div className="sm:col-span-2">
          <FormField
            label="Reason (optional)"
            placeholder="e.g. persistent cough for 2 weeks"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" variant="gradient" disabled={bookMutation.isPending || !when}>
            {bookMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirm booking · ₹{doctor.consultationFee}
          </Button>
        </div>
      </form>
    </GlassCard>
  )
}

export default function TelemedicinePage() {
  const queryClient = useQueryClient()
  const [query, setQuery] = useState('')
  const [booking, setBooking] = useState<Doctor | null>(null)

  const doctorsQuery = useQuery({
    queryKey: ['telemedicine', 'doctors', query],
    queryFn: () => teleApi.searchDoctors(query),
  })
  const appointmentsQuery = useQuery({
    queryKey: ['telemedicine', 'appointments'],
    queryFn: teleApi.myAppointments,
  })

  const cancelMutation = useMutation({
    mutationFn: teleApi.cancel,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['telemedicine'] }),
  })

  const upcoming = (appointmentsQuery.data ?? []).filter((a) => a.status === 'UPCOMING')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Telemedicine</h1>
        <p className="mt-1.5 text-muted-foreground">
          Consult verified doctors by video or audio — including emergency consultations.
        </p>
      </div>

      {upcoming.length > 0 && (
        <div className="space-y-3">
          <h2 className="flex items-center gap-2 font-semibold">
            <CalendarClock className="h-4 w-4 text-primary" /> Your upcoming consultations
          </h2>
          {upcoming.map((appointment) => {
            const meta = MODE_META[appointment.mode]
            const Icon = meta.icon
            return (
              <GlassCard key={appointment.id} className="flex flex-wrap items-center gap-4 p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15">
                  <Icon className="h-5 w-5 text-violet-500" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                    {appointment.doctorName}
                    <Badge variant={meta.badge} className="px-2 py-0 text-[10px]">
                      {meta.label.toUpperCase()}
                    </Badge>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {appointment.speciality} ·{' '}
                    {new Date(appointment.scheduledAt).toLocaleString([], {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={cancelMutation.isPending}
                  onClick={() => {
                    if (window.confirm('Cancel this consultation?'))
                      cancelMutation.mutate(appointment.id)
                  }}
                >
                  Cancel
                </Button>
              </GlassCard>
            )
          })}
        </div>
      )}

      <AnimatePresence>
        {booking && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <BookingForm doctor={booking} onClose={() => setBooking(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative max-w-md">
        <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by doctor, speciality or city…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="pl-10"
        />
      </div>

      {doctorsQuery.isPending ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-36" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {(doctorsQuery.data ?? []).map((doctor, index) => (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.05, 0.4) }}
            >
              <GlassCard className="flex h-full flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-md">
                      <Stethoscope className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-semibold">{doctor.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {doctor.speciality} · {doctor.city}
                      </p>
                    </div>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 rounded-lg bg-amber-500/15 px-2 py-1 text-sm font-semibold text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-current" /> {doctor.rating.toFixed(1)}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{doctor.experienceYears} yrs experience</span>
                  <span>·</span>
                  <span>₹{doctor.consultationFee} per consultation</span>
                  {doctor.availableForEmergency && (
                    <Badge variant="emergency" className="px-2 py-0 text-[9px]">
                      EMERGENCY AVAILABLE
                    </Badge>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="gradient"
                    size="sm"
                    className={cn('flex-1', booking?.id === doctor.id && 'opacity-60')}
                    onClick={() => setBooking(doctor)}
                  >
                    <Video className="h-4 w-4" /> Book consultation
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
