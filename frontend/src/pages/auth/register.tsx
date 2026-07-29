import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { ArrowRight, Camera, Check, ChevronRight, Eye, EyeOff, Loader2 } from 'lucide-react'
import { AuthLayout } from '@/pages/auth/auth-layout'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/input'
import { ImageCropperModal } from '@/components/ui/image-cropper-modal'
import { authApi } from '@/features/auth/api'
import { chatApi } from '@/features/chat/api'
import { useAuth } from '@/features/auth/auth-context'
import { SELF_REGISTER_ROLES, ROLE_META, type Role } from '@/features/auth/types'
import { getApiErrorMessage } from '@/lib/api'
import { cn } from '@/lib/utils'

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Enter your full name').max(80, 'Name is too long'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
    phone: z
      .string()
      .regex(/^[+0-9 ()-]{7,20}$/, 'Enter a valid phone number')
      .optional()
      .or(z.literal('')),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password is too long'),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const { applyAuth, updateUser, user } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role>('CITIZEN')
  
  // Multi-step flow
  const [step, setStep] = useState<1 | 2>(1)
  
  // Cropper state
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (response) => {
      applyAuth(response)
      setStep(2)
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      setImageToCrop(reader.result?.toString() || null)
      setCropModalOpen(true)
    })
    reader.readAsDataURL(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleCropComplete = async (croppedFile: File) => {
    setCropModalOpen(false)
    setImageToCrop(null)
    setIsUploading(true)
    try {
      const uploadRes = await chatApi.uploadFile(croppedFile)
      const updateRes = await chatApi.updateProfilePicture(uploadRes.fileUrl)
      updateUser(updateRes as any)
    } catch (error) {
      console.error('Failed to upload profile picture', error)
    } finally {
      setIsUploading(false)
    }
  }

  const finishRegistration = () => {
    navigate('/dashboard', { replace: true })
  }

  if (step === 2) {
    return (
      <AuthLayout>
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight">Add a Profile Picture</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Help others recognize you in emergencies.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center space-y-8 py-8">
          <div 
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className="group relative flex h-32 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-primary/50 bg-primary/5 transition-all hover:border-primary hover:bg-primary/10 shadow-xl"
          >
            <input 
              type="file" 
              ref={fileInputRef}
              accept="image/*" 
              onChange={handleFileChange} 
              className="hidden"
            />
            {user?.profilePictureUrl ? (
              <img src={user.profilePictureUrl} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <Camera className="h-10 w-10 text-primary/50 group-hover:text-primary transition-colors" />
            )}
            
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {isUploading ? (
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              ) : (
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {user?.profilePictureUrl ? 'Change' : 'Upload'}
                </span>
              )}
            </div>
          </div>

          <div className="w-full flex flex-col gap-3">
            <Button 
              size="lg" 
              className="w-full"
              variant="gradient"
              onClick={finishRegistration}
            >
              Continue to Dashboard <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            {!user?.profilePictureUrl && (
              <Button 
                variant="ghost" 
                size="sm"
                className="text-muted-foreground"
                onClick={finishRegistration}
              >
                Skip for now
              </Button>
            )}
          </div>
        </div>

        {imageToCrop && (
          <ImageCropperModal
            isOpen={cropModalOpen}
            imageSrc={imageToCrop}
            onClose={() => {
              setCropModalOpen(false)
              setImageToCrop(null)
            }}
            onCropComplete={handleCropComplete}
          />
        )}
      </AuthLayout>
    )
  }

  const onSubmit = (values: RegisterForm) => {
    registerMutation.mutate({
      fullName: values.fullName,
      email: values.email,
      phone: values.phone || undefined,
      password: values.password,
      role: selectedRole,
    })
  }

  return (
    <AuthLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">Create your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Join the network that saves lives — choose your role to get started.
        </p>
      </div>

      {registerMutation.isError && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-emergency/30 bg-emergency/10 px-4 py-3 text-sm text-emergency">
          {getApiErrorMessage(registerMutation.error, 'Unable to create account. Please try again.')}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* ─── Role Picker ────────────────────────────── */}
        <div>
          <p className="mb-3 text-sm font-medium text-foreground">I am a</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {SELF_REGISTER_ROLES.map((role) => {
              const meta = ROLE_META[role]
              const active = selectedRole === role
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={cn(
                    'group relative flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all duration-300',
                    active
                      ? 'border-primary/50 bg-primary/10 shadow-md shadow-primary/10'
                      : 'border-border/60 bg-background/40 hover:border-border hover:bg-background/60',
                  )}
                >
                  <span className="text-2xl">{meta.icon}</span>
                  <span className="text-sm font-semibold">{meta.label}</span>
                  {active && (
                    <motion.span
                      layoutId="role-badge"
                      className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      <Check className="h-3 w-3" />
                    </motion.span>
                  )}
                </button>
              )
            })}
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={selectedRole}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-3 text-xs text-muted-foreground"
            >
              {ROLE_META[selectedRole]?.description}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* ─── Form Fields ──────────────────────────── */}
        <FormField
          label="Full name"
          placeholder="Aarav Sharma"
          autoComplete="name"
          error={errors.fullName?.message}
          {...register('fullName')}
        />
        <FormField
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <FormField
          label="Phone (optional)"
          type="tel"
          placeholder="+91 98765 43210"
          autoComplete="tel"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <FormField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="At least 8 characters"
          autoComplete="new-password"
          error={errors.password?.message}
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          {...register('password')}
        />
        <FormField
          label="Confirm password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Repeat your password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button
          type="submit"
          variant="gradient"
          size="lg"
          className="w-full"
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {registerMutation.isPending ? 'Creating account…' : 'Create account'}
          {!registerMutation.isPending && <ArrowRight className="h-4 w-4" />}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
