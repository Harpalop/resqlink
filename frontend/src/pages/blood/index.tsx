import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  Award,
  CheckCircle2,
  Droplets,
  HeartHandshake,
  Loader2,
  MapPin,
  Phone,
  Plus,
  Search,
  UserRound,
  X,
} from 'lucide-react'
import { GlassCard } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FormField } from '@/components/ui/input'
import { SelectField } from '@/components/ui/select'
import { TextareaField } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { bloodApi } from '@/features/blood/api'
import { URGENCY_META, type Urgency } from '@/features/blood/types'
import { BLOOD_GROUPS } from '@/features/profile/types'
import { getApiErrorMessage } from '@/lib/api'
import { cn, getInitials } from '@/lib/utils'

type Tab = 'find' | 'requests' | 'donor'

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'find', label: 'Find Donors' },
  { id: 'requests', label: 'Blood Requests' },
  { id: 'donor', label: 'My Donor Card' },
]

function BloodGroupBadge({ group, size = 'md' }: { group: string; size?: 'md' | 'lg' }) {
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-600 font-display font-bold text-white shadow-md shadow-rose-500/25',
        size === 'lg' ? 'h-14 w-14 text-xl' : 'h-11 w-11 text-sm',
      )}
    >
      {group}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Tab 1 — Find Donors                                                 */
/* ------------------------------------------------------------------ */

function FindDonorsTab() {
  const [bloodGroup, setBloodGroup] = useState('O+')
  const [city, setCity] = useState('')
  const [searched, setSearched] = useState(false)

  const searchQuery = useQuery({
    queryKey: ['blood', 'donors', bloodGroup, city],
    queryFn: () => bloodApi.searchDonors(bloodGroup, city),
    enabled: searched,
  })

  return (
    <div className="space-y-5">
      <GlassCard className="p-5">
        <div className="grid gap-3 sm:grid-cols-[160px_1fr_auto]">
          <SelectField
            label="Blood group needed"
            options={BLOOD_GROUPS.map((group) => ({ value: group, label: group }))}
            value={bloodGroup}
            onChange={(event) => setBloodGroup(event.target.value)}
          />
          <FormField
            label="City (optional)"
            placeholder="e.g. Pune"
            value={city}
            onChange={(event) => setCity(event.target.value)}
          />
          <div className="flex items-end">
            <Button
              variant="gradient"
              size="md"
              className="w-full sm:w-auto"
              onClick={() => {
                setSearched(true)
                void searchQuery.refetch()
              }}
            >
              <Search className="h-4 w-4" /> Search
            </Button>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Results include all compatible donor groups — e.g. searching A+ also shows O+, O− and A−
          donors.
        </p>
      </GlassCard>

      {!searched ? (
        <GlassCard className="flex flex-col items-center gap-4 p-10 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/15">
            <Droplets className="h-7 w-7 text-rose-500" />
          </span>
          <div>
            <h3 className="font-semibold">Find a matching donor in seconds</h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              Pick the blood group you need and search the donor network.
            </p>
          </div>
        </GlassCard>
      ) : searchQuery.isFetching ? (
        <div className="space-y-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : !searchQuery.data || searchQuery.data.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <p className="font-medium">No available donors found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try widening your search — leave the city empty, or post a blood request so donors can
            find you.
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {searchQuery.data.length} compatible donor(s) found
          </p>
          {searchQuery.data.map((donor, index) => (
            <motion.div
              key={donor.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
            >
              <GlassCard className="flex items-center gap-4 p-4">
                <BloodGroupBadge group={donor.bloodGroup} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{donor.name}</p>
                    {donor.eligibleToDonate ? (
                      <Badge variant="success" className="px-2 py-0 text-[10px]">
                        Eligible now
                      </Badge>
                    ) : (
                      <Badge className="px-2 py-0 text-[10px]">Recently donated</Badge>
                    )}
                  </div>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {donor.city}
                    <span>·</span>
                    <Award className="h-3.5 w-3.5" /> {donor.donationCount} donation(s)
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Tab 2 — Blood Requests                                              */
/* ------------------------------------------------------------------ */

const requestSchema = z.object({
  bloodGroup: z.string().min(1, 'Required'),
  units: z.string().regex(/^([1-9]|1[0-9]|20)$/, '1–20 units'),
  urgency: z.string().min(1, 'Required'),
  hospitalName: z.string().min(2, 'Hospital is required').max(120),
  city: z.string().min(2, 'City is required').max(80),
  patientName: z.string().max(120),
  contactPhone: z
    .string()
    .regex(/^[+0-9 ()-]{7,20}$/, 'Enter a valid phone number')
    .or(z.literal('')),
  note: z.string().max(1000),
})

type RequestForm = z.infer<typeof requestSchema>

function RequestsTab() {
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)

  const requestsQuery = useQuery({
    queryKey: ['blood', 'requests'],
    queryFn: bloodApi.getOpenRequests,
    refetchInterval: 30_000,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      bloodGroup: 'O+',
      units: '1',
      urgency: 'URGENT',
      hospitalName: '',
      city: '',
      patientName: '',
      contactPhone: '',
      note: '',
    },
  })

  const createMutation = useMutation({
    mutationFn: (values: RequestForm) =>
      bloodApi.createRequest({
        bloodGroup: values.bloodGroup,
        units: parseInt(values.units, 10),
        urgency: values.urgency as Urgency,
        hospitalName: values.hospitalName,
        city: values.city,
        patientName: values.patientName || undefined,
        contactPhone: values.contactPhone || undefined,
        note: values.note || undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['blood', 'requests'] })
      setFormOpen(false)
      reset()
    },
  })

  const closeMutation = useMutation({
    mutationFn: ({ id, fulfilled }: { id: string; fulfilled: boolean }) =>
      fulfilled ? bloodApi.fulfillRequest(id) : bloodApi.closeRequest(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['blood', 'requests'] }),
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Open requests refresh automatically every 30 seconds.
        </p>
        {!formOpen && (
          <Button variant="gradient" size="sm" onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" /> Request blood
          </Button>
        )}
      </div>

      {createMutation.isError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-emergency/30 bg-emergency/10 px-4 py-3 text-sm text-emergency">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {getApiErrorMessage(createMutation.error, 'Could not create the request.')}
        </div>
      )}

      <AnimatePresence>
        {formOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <GlassCard className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-semibold">New blood request</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setFormOpen(false)}
                  aria-label="Close form"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <form
                onSubmit={handleSubmit((values) => createMutation.mutate(values))}
                className="grid gap-4 sm:grid-cols-2"
              >
                <SelectField
                  label="Blood group"
                  options={BLOOD_GROUPS.map((group) => ({ value: group, label: group }))}
                  error={errors.bloodGroup?.message}
                  {...register('bloodGroup')}
                />
                <FormField
                  label="Units needed"
                  inputMode="numeric"
                  placeholder="1–20"
                  error={errors.units?.message}
                  {...register('units')}
                />
                <SelectField
                  label="Urgency"
                  options={[
                    { value: 'CRITICAL', label: 'Critical — needed now' },
                    { value: 'URGENT', label: 'Urgent — within 24h' },
                    { value: 'NORMAL', label: 'Normal — planned' },
                  ]}
                  error={errors.urgency?.message}
                  {...register('urgency')}
                />
                <FormField
                  label="Contact phone (optional)"
                  type="tel"
                  placeholder="+91 98765 43210"
                  error={errors.contactPhone?.message}
                  {...register('contactPhone')}
                />
                <FormField
                  label="Hospital"
                  placeholder="e.g. City Care Hospital"
                  error={errors.hospitalName?.message}
                  {...register('hospitalName')}
                />
                <FormField
                  label="City"
                  placeholder="e.g. Pune"
                  error={errors.city?.message}
                  {...register('city')}
                />
                <FormField
                  label="Patient name (optional)"
                  placeholder="Who is this for?"
                  error={errors.patientName?.message}
                  {...register('patientName')}
                />
                <div className="sm:col-span-2">
                  <TextareaField
                    label="Note (optional)"
                    placeholder="Ward number, doctor's name, any extra details…"
                    error={errors.note?.message}
                    {...register('note')}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" variant="gradient" disabled={createMutation.isPending}>
                    {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    Post request
                  </Button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {requestsQuery.isPending ? (
        <div className="space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : !requestsQuery.data || requestsQuery.data.length === 0 ? (
        <GlassCard className="flex flex-col items-center gap-3 p-10 text-center">
          <CheckCircle2 className="h-8 w-8 text-success" />
          <p className="font-medium">No open blood requests right now</p>
          <p className="text-sm text-muted-foreground">That's a good thing.</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {requestsQuery.data.map((request, index) => {
            const urgency = URGENCY_META[request.urgency]
            return (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard
                  className={cn(
                    'p-5',
                    request.urgency === 'CRITICAL' && 'border-emergency/40',
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <BloodGroupBadge group={request.bloodGroup} size="lg" />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">
                            {request.units} unit(s) · {request.hospitalName}
                          </p>
                          <Badge variant={urgency.badge}>{urgency.label.toUpperCase()}</Badge>
                          {request.mine && (
                            <Badge variant="primary" className="px-2 py-0 text-[10px]">
                              Your request
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" /> {request.city}
                          </span>
                          <span className="flex items-center gap-1">
                            <UserRound className="h-3.5 w-3.5" />
                            {request.patientName || request.requesterName}
                          </span>
                          <span>
                            {new Date(request.createdAt).toLocaleString([], {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </p>
                        {request.note && (
                          <p className="mt-2 text-sm text-muted-foreground">{request.note}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      {request.contactPhone && (
                        <a
                          href={`tel:${request.contactPhone}`}
                          className="flex h-10 items-center gap-2 rounded-xl bg-success px-4 text-sm font-medium text-white shadow-md shadow-success/25 transition-transform hover:scale-[1.03]"
                        >
                          <Phone className="h-4 w-4" /> Call
                        </a>
                      )}
                      {request.mine && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-10"
                          disabled={closeMutation.isPending}
                          onClick={() => closeMutation.mutate({ id: request.id, fulfilled: true })}
                        >
                          Mark fulfilled
                        </Button>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Tab 3 — My Donor Card                                               */
/* ------------------------------------------------------------------ */

const donorSchema = z.object({
  bloodGroup: z.string().min(1, 'Required'),
  city: z.string().min(2, 'City is required').max(80),
  lastDonationDate: z.string(),
})

type DonorForm = z.infer<typeof donorSchema>

function DonorTab() {
  const queryClient = useQueryClient()
  const [available, setAvailable] = useState(true)

  const donorQuery = useQuery({
    queryKey: ['blood', 'donor', 'me'],
    queryFn: bloodApi.getMyDonorProfile,
  })

  const donor = donorQuery.data

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DonorForm>({
    resolver: zodResolver(donorSchema),
    values: donor
      ? {
          bloodGroup: donor.bloodGroup,
          city: donor.city,
          lastDonationDate: donor.lastDonationDate ?? '',
        }
      : undefined,
    defaultValues: { bloodGroup: 'O+', city: '', lastDonationDate: '' },
  })

  const saveMutation = useMutation({
    mutationFn: (values: DonorForm) =>
      bloodApi.saveDonorProfile({
        bloodGroup: values.bloodGroup,
        city: values.city,
        available: donor ? available : true,
        lastDonationDate: values.lastDonationDate || null,
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(['blood', 'donor', 'me'], data)
      setAvailable(data.available)
    },
  })

  const donateMutation = useMutation({
    mutationFn: bloodApi.recordDonation,
    onSuccess: (data) => queryClient.setQueryData(['blood', 'donor', 'me'], data),
  })

  if (donorQuery.isPending) {
    return <Skeleton className="h-72" />
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <GlassCard className="p-6">
        <div className="mb-5 flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/15">
            <HeartHandshake className="h-4 w-4 text-rose-500" />
          </span>
          <h2 className="font-semibold">{donor ? 'Update donor profile' : 'Become a donor'}</h2>
        </div>

        {saveMutation.isError && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-emergency/30 bg-emergency/10 px-4 py-3 text-sm text-emergency">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {getApiErrorMessage(saveMutation.error, 'Could not save your donor profile.')}
          </div>
        )}

        <form
          onSubmit={handleSubmit((values) => saveMutation.mutate(values))}
          className="space-y-4"
        >
          <SelectField
            label="Your blood group"
            options={BLOOD_GROUPS.map((group) => ({ value: group, label: group }))}
            error={errors.bloodGroup?.message}
            {...register('bloodGroup')}
          />
          <FormField
            label="City"
            placeholder="Where can you donate?"
            error={errors.city?.message}
            {...register('city')}
          />
          <FormField
            label="Last donation date (optional)"
            type="date"
            error={errors.lastDonationDate?.message}
            {...register('lastDonationDate')}
          />
          {donor && (
            <Switch
              checked={available}
              onChange={setAvailable}
              label="Available for donation"
              description="Turn off to hide yourself from donor searches."
            />
          )}
          <Button type="submit" variant="gradient" disabled={saveMutation.isPending}>
            {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {donor ? 'Save changes' : 'Join the donor network'}
          </Button>
        </form>
      </GlassCard>

      {donor ? (
        <div className="space-y-5">
          <div className="rounded-3xl bg-gradient-to-br from-rose-500 via-red-500 to-rose-600 p-[1.5px] shadow-xl shadow-rose-500/20">
            <div className="rounded-3xl bg-background/95 p-7">
              <div className="mb-5 flex items-center justify-between">
                <p className="text-[10px] font-semibold tracking-[0.25em] text-muted-foreground uppercase">
                  ResQLink Donor Card
                </p>
                {donor.available ? (
                  <Badge variant="success">AVAILABLE</Badge>
                ) : (
                  <Badge>PAUSED</Badge>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-red-600 text-lg font-bold text-white">
                  {getInitials(donor.name)}
                </div>
                <div>
                  <p className="font-display text-lg font-bold">{donor.name}</p>
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {donor.city}
                  </p>
                </div>
                <span className="font-display ml-auto text-4xl font-bold text-rose-500">
                  {donor.bloodGroup}
                </span>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border p-3.5 text-center">
                  <p className="font-display text-2xl font-bold text-gradient">
                    {donor.donationCount}
                  </p>
                  <p className="text-xs text-muted-foreground">Donations</p>
                </div>
                <div className="rounded-xl border border-border p-3.5 text-center">
                  <p className="font-display text-2xl font-bold">
                    {donor.eligibleToDonate ? 'Now' : '< 90 days'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {donor.eligibleToDonate ? 'Eligible to donate' : 'Next eligibility'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <GlassCard className="flex items-center justify-between gap-4 p-5">
            <div>
              <p className="font-medium">Just donated blood?</p>
              <p className="text-sm text-muted-foreground">
                Log it to update your streak and eligibility.
              </p>
            </div>
            <Button
              variant="outline"
              disabled={donateMutation.isPending}
              onClick={() => donateMutation.mutate()}
            >
              {donateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Droplets className="h-4 w-4 text-rose-500" />
              )}
              Log donation
            </Button>
          </GlassCard>
        </div>
      ) : (
        <GlassCard className="flex flex-col items-center justify-center gap-4 p-10 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/15">
            <Droplets className="h-7 w-7 text-rose-500" />
          </span>
          <div>
            <h3 className="font-semibold">One donation saves up to three lives</h3>
            <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
              Register on the left and your donor card appears here — you'll be visible to people
              searching for your blood group.
            </p>
          </div>
        </GlassCard>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function BloodPage() {
  const [tab, setTab] = useState<Tab>('find')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Blood Network</h1>
        <p className="mt-1.5 text-muted-foreground">
          Find compatible donors in minutes, post requests, and track your own donations.
        </p>
      </div>

      <div className="glass-panel inline-flex rounded-xl p-1">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              'relative rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              tab === id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab === id && (
              <motion.span
                layoutId="blood-tab"
                className="absolute inset-0 rounded-lg bg-background shadow-sm dark:bg-muted"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative">{label}</span>
          </button>
        ))}
      </div>

      {tab === 'find' && <FindDonorsTab />}
      {tab === 'requests' && <RequestsTab />}
      {tab === 'donor' && <DonorTab />}
    </div>
  )
}
