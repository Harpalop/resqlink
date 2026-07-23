import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Loader2, Pencil, Phone, Plus, Trash2, Users, X } from 'lucide-react'
import { GlassCard } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FormField } from '@/components/ui/input'
import { SelectField } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { contactsApi } from '@/features/profile/api'
import { RELATIONSHIPS, type EmergencyContact } from '@/features/profile/types'
import { getApiErrorMessage } from '@/lib/api'
import { getInitials } from '@/lib/utils'

const MAX_CONTACTS = 5

const contactSchema = z.object({
  name: z.string().min(2, 'Enter a name').max(80),
  phone: z.string().regex(/^[+0-9 ()-]{7,20}$/, 'Enter a valid phone number'),
  email: z.string().email('Enter a valid email').or(z.literal('')),
  relationship: z.string(),
  priority: z.string(),
})

type ContactForm = z.infer<typeof contactSchema>

const EMPTY_FORM: ContactForm = { name: '', phone: '', email: '', relationship: '', priority: '1' }

export default function ContactsPage() {
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<EmergencyContact | null>(null)

  const contactsQuery = useQuery({ queryKey: ['contacts'], queryFn: contactsApi.getContacts })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactForm>({ resolver: zodResolver(contactSchema), defaultValues: EMPTY_FORM })

  const closeForm = () => {
    setFormOpen(false)
    setEditing(null)
    reset(EMPTY_FORM)
  }

  const saveMutation = useMutation({
    mutationFn: (values: ContactForm) => {
      const payload = {
        name: values.name,
        phone: values.phone,
        email: values.email || null,
        relationship: values.relationship || null,
        priority: parseInt(values.priority, 10),
      }
      return editing
        ? contactsApi.updateContact(editing.id, payload)
        : contactsApi.addContact(payload)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['contacts'] })
      closeForm()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: contactsApi.deleteContact,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['contacts'] }),
  })

  const startEdit = (contact: EmergencyContact) => {
    setEditing(contact)
    setFormOpen(true)
    reset({
      name: contact.name,
      phone: contact.phone,
      email: contact.email ?? '',
      relationship: contact.relationship ?? '',
      priority: contact.priority.toString(),
    })
  }

  const contacts = contactsQuery.data ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Emergency Contacts</h1>
          <p className="mt-1.5 text-muted-foreground">
            The people alerted first when you trigger an SOS. Priority 1 is called first.
          </p>
        </div>
        {!formOpen && contacts.length < MAX_CONTACTS && (
          <Button variant="gradient" onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" /> Add contact
          </Button>
        )}
      </div>

      {saveMutation.isError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-emergency/30 bg-emergency/10 px-4 py-3 text-sm text-emergency">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {getApiErrorMessage(saveMutation.error, 'Could not save the contact.')}
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
                <h2 className="font-semibold">{editing ? 'Edit contact' : 'New contact'}</h2>
                <Button variant="ghost" size="icon" onClick={closeForm} aria-label="Close form">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <form
                onSubmit={handleSubmit((values) => saveMutation.mutate(values))}
                className="grid gap-4 sm:grid-cols-2"
              >
                <FormField
                  label="Name"
                  placeholder="e.g. Priya Sharma"
                  error={errors.name?.message}
                  {...register('name')}
                />
                <FormField
                  label="Phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  error={errors.phone?.message}
                  {...register('phone')}
                />
                <FormField
                  label="Email (for SOS alerts)"
                  type="email"
                  placeholder="priya@example.com"
                  error={errors.email?.message}
                  {...register('email')}
                />
                <SelectField
                  label="Relationship"
                  placeholder="Select relationship"
                  options={RELATIONSHIPS.map((rel) => ({ value: rel, label: rel }))}
                  error={errors.relationship?.message}
                  {...register('relationship')}
                />
                <SelectField
                  label="Priority"
                  options={[1, 2, 3, 4, 5].map((priority) => ({
                    value: priority.toString(),
                    label: `${priority}${priority === 1 ? ' — contacted first' : ''}`,
                  }))}
                  error={errors.priority?.message}
                  {...register('priority')}
                />
                <div className="sm:col-span-2">
                  <Button type="submit" variant="gradient" disabled={saveMutation.isPending}>
                    {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    {editing ? 'Update contact' : 'Add contact'}
                  </Button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {contactsQuery.isPending ? (
        <div className="space-y-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : contacts.length === 0 ? (
        <GlassCard className="flex flex-col items-center gap-4 p-10 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15">
            <Users className="h-7 w-7 text-primary" />
          </span>
          <div>
            <h3 className="font-semibold">No emergency contacts yet</h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              Add the people who should be alerted when something happens to you. They'll also
              appear on your Medical ID.
            </p>
          </div>
          {!formOpen && (
            <Button variant="gradient" onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4" /> Add your first contact
            </Button>
          )}
        </GlassCard>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {contacts.map((contact) => (
              <motion.div
                key={contact.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
              >
                <GlassCard className="flex items-center gap-4 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-sm font-semibold text-white">
                    {getInitials(contact.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{contact.name}</p>
                      {contact.relationship && (
                        <Badge className="px-2 py-0 text-[10px]">{contact.relationship}</Badge>
                      )}
                      <Badge variant="primary" className="px-2 py-0 text-[10px]">
                        Priority {contact.priority}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{contact.phone}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <a
                      href={`tel:${contact.phone}`}
                      aria-label={`Call ${contact.name}`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-success transition-colors hover:bg-success/10"
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEdit(contact)}
                      aria-label={`Edit ${contact.name}`}
                      className="h-9 w-9"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (window.confirm(`Remove ${contact.name} from emergency contacts?`)) {
                          deleteMutation.mutate(contact.id)
                        }
                      }}
                      aria-label={`Delete ${contact.name}`}
                      className="h-9 w-9 text-emergency hover:bg-emergency/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
          <p className="text-xs text-muted-foreground">
            {contacts.length}/{MAX_CONTACTS} contacts used
          </p>
        </div>
      )}
    </div>
  )
}
