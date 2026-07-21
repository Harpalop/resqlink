import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Check, HeartHandshake, Loader2, Pill, ShieldCheck, UserRound } from 'lucide-react'
import { GlassCard } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/input'
import { TextareaField } from '@/components/ui/textarea'
import { SelectField } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { profileApi } from '@/features/profile/api'
import { BLOOD_GROUPS, type Profile, type ProfilePayload } from '@/features/profile/types'
import { getApiErrorMessage } from '@/lib/api'
import { EASE } from '@/lib/motion'

const profileSchema = z.object({
  bloodGroup: z.string(),
  dateOfBirth: z.string(),
  gender: z.string(),
  heightCm: z.string().regex(/^\d*$/, 'Numbers only'),
  weightKg: z.string().regex(/^\d*$/, 'Numbers only'),
  allergies: z.string().max(2000),
  medicalConditions: z.string().max(2000),
  medications: z.string().max(2000),
  insuranceProvider: z.string().max(120),
  insurancePolicyNumber: z.string().max(60),
  emergencyNotes: z.string().max(2000),
})

type ProfileForm = z.infer<typeof profileSchema>

function toForm(profile: Profile): ProfileForm {
  return {
    bloodGroup: profile.bloodGroup ?? '',
    dateOfBirth: profile.dateOfBirth ?? '',
    gender: profile.gender ?? '',
    heightCm: profile.heightCm?.toString() ?? '',
    weightKg: profile.weightKg?.toString() ?? '',
    allergies: profile.allergies ?? '',
    medicalConditions: profile.medicalConditions ?? '',
    medications: profile.medications ?? '',
    insuranceProvider: profile.insuranceProvider ?? '',
    insurancePolicyNumber: profile.insurancePolicyNumber ?? '',
    emergencyNotes: profile.emergencyNotes ?? '',
  }
}

function toPayload(form: ProfileForm, organDonor: boolean, medicalIdEnabled: boolean): ProfilePayload {
  const text = (value: string) => (value.trim() === '' ? null : value.trim())
  const num = (value: string) => (value.trim() === '' ? null : parseInt(value, 10))
  return {
    bloodGroup: text(form.bloodGroup),
    dateOfBirth: text(form.dateOfBirth),
    gender: text(form.gender),
    heightCm: num(form.heightCm),
    weightKg: num(form.weightKg),
    allergies: text(form.allergies),
    medicalConditions: text(form.medicalConditions),
    medications: text(form.medications),
    insuranceProvider: text(form.insuranceProvider),
    insurancePolicyNumber: text(form.insurancePolicyNumber),
    emergencyNotes: text(form.emergencyNotes),
    organDonor,
    medicalIdEnabled,
  }
}

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof UserRound
  title: string
  children: React.ReactNode
}) {
  return (
    <GlassCard className="p-6">
      <div className="mb-5 flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
          <Icon className="h-4 w-4 text-primary" />
        </span>
        <h2 className="font-semibold">{title}</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </GlassCard>
  )
}

export default function ProfilePage() {
  const queryClient = useQueryClient()
  const [organDonor, setOrganDonor] = useState(false)
  const [medicalIdEnabled, setMedicalIdEnabled] = useState(true)
  const [saved, setSaved] = useState(false)

  const profileQuery = useQuery({ queryKey: ['profile'], queryFn: profileApi.getProfile })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: profileQuery.data ? toForm(profileQuery.data) : undefined,
  })

  useEffect(() => {
    if (profileQuery.data) {
      setOrganDonor(profileQuery.data.organDonor)
      setMedicalIdEnabled(profileQuery.data.medicalIdEnabled)
    }
  }, [profileQuery.data])

  const saveMutation = useMutation({
    mutationFn: profileApi.updateProfile,
    onSuccess: (profile) => {
      queryClient.setQueryData(['profile'], profile)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    },
  })

  const completion = profileQuery.data?.completionPercent ?? 0

  if (profileQuery.isPending) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-24" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Your Profile</h1>
        <p className="mt-1.5 text-muted-foreground">
          This information powers your Smart Medical ID — it can save your life.
        </p>
      </div>

      <GlassCard className="p-5">
        <div className="mb-2.5 flex items-center justify-between text-sm">
          <span className="font-medium">Profile completion</span>
          <span className="text-gradient font-display font-bold">{completion}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completion}%` }}
            transition={{ duration: 1, ease: EASE }}
            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-fuchsia-500"
          />
        </div>
        {completion < 100 && (
          <p className="mt-2.5 text-xs text-muted-foreground">
            The more you complete, the more responders can help you in an emergency.
          </p>
        )}
      </GlassCard>

      {saveMutation.isError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-emergency/30 bg-emergency/10 px-4 py-3 text-sm text-emergency">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {getApiErrorMessage(saveMutation.error, 'Could not save your profile.')}
        </div>
      )}

      <form
        onSubmit={handleSubmit((values) =>
          saveMutation.mutate(toPayload(values, organDonor, medicalIdEnabled)),
        )}
        className="space-y-5"
      >
        <SectionCard icon={UserRound} title="Personal">
          <FormField
            label="Date of birth"
            type="date"
            error={errors.dateOfBirth?.message}
            {...register('dateOfBirth')}
          />
          <SelectField
            label="Gender"
            placeholder="Select gender"
            options={[
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' },
              { value: 'Other', label: 'Other' },
              { value: 'Prefer not to say', label: 'Prefer not to say' },
            ]}
            error={errors.gender?.message}
            {...register('gender')}
          />
          <FormField
            label="Height (cm)"
            placeholder="e.g. 172"
            inputMode="numeric"
            error={errors.heightCm?.message}
            {...register('heightCm')}
          />
          <FormField
            label="Weight (kg)"
            placeholder="e.g. 68"
            inputMode="numeric"
            error={errors.weightKg?.message}
            {...register('weightKg')}
          />
        </SectionCard>

        <SectionCard icon={Pill} title="Medical">
          <SelectField
            label="Blood group"
            placeholder="Select blood group"
            options={BLOOD_GROUPS.map((group) => ({ value: group, label: group }))}
            error={errors.bloodGroup?.message}
            {...register('bloodGroup')}
          />
          <div className="sm:col-span-1" />
          <div className="sm:col-span-2">
            <TextareaField
              label="Allergies"
              placeholder="e.g. Penicillin, peanuts, latex…"
              hint="Separate multiple entries with commas."
              error={errors.allergies?.message}
              {...register('allergies')}
            />
          </div>
          <div className="sm:col-span-2">
            <TextareaField
              label="Medical conditions"
              placeholder="e.g. Diabetes type 2, hypertension, asthma…"
              error={errors.medicalConditions?.message}
              {...register('medicalConditions')}
            />
          </div>
          <div className="sm:col-span-2">
            <TextareaField
              label="Current medications"
              placeholder="e.g. Metformin 500mg twice daily…"
              error={errors.medications?.message}
              {...register('medications')}
            />
          </div>
        </SectionCard>

        <SectionCard icon={ShieldCheck} title="Insurance">
          <FormField
            label="Insurance provider"
            placeholder="e.g. Star Health"
            error={errors.insuranceProvider?.message}
            {...register('insuranceProvider')}
          />
          <FormField
            label="Policy number"
            placeholder="e.g. SH-2026-XXXXXX"
            error={errors.insurancePolicyNumber?.message}
            {...register('insurancePolicyNumber')}
          />
        </SectionCard>

        <SectionCard icon={HeartHandshake} title="Emergency preferences">
          <div className="space-y-3 sm:col-span-2">
            <Switch
              checked={organDonor}
              onChange={setOrganDonor}
              label="Registered organ donor"
              description="Shown to responders on your Medical ID."
            />
            <Switch
              checked={medicalIdEnabled}
              onChange={setMedicalIdEnabled}
              label="Smart Medical ID enabled"
              description="When off, your QR code stops working entirely."
            />
            <TextareaField
              label="Emergency notes"
              placeholder="Anything responders must know — e.g. pacemaker fitted, epilepsy protocol…"
              error={errors.emergencyNotes?.message}
              {...register('emergencyNotes')}
            />
          </div>
        </SectionCard>

        <div className="flex items-center gap-4">
          <Button
            type="submit"
            variant="gradient"
            size="lg"
            disabled={saveMutation.isPending}
            className="min-w-40"
          >
            {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {saveMutation.isPending ? 'Saving…' : 'Save profile'}
          </Button>
          <AnimatePresence>
            {saved && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-sm font-medium text-success"
              >
                <Check className="h-4 w-4" /> Saved
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </form>
    </div>
  )
}
