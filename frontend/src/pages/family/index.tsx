import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  Check,
  Copy,
  DoorOpen,
  Loader2,
  Plus,
  ShieldCheck,
  UserPlus,
  Users,
} from 'lucide-react'
import { GlassCard } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FormField } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { api, getApiErrorMessage } from '@/lib/api'
import { cn, getInitials } from '@/lib/utils'

interface Member {
  userId: string
  name: string
  owner: boolean
  me: boolean
  lastCheckInAt: string | null
  lastCheckInNote: string | null
}

interface Group {
  id: string
  name: string
  inviteCode: string
  owner: boolean
  members: Member[]
  createdAt: string
}

const familyApi = {
  getGroups: async () => (await api.get<Group[]>('/family/groups')).data,
  createGroup: async (name: string) =>
    (await api.post<Group>('/family/groups', { name })).data,
  joinGroup: async (inviteCode: string) =>
    (await api.post<Group>('/family/groups/join', { inviteCode })).data,
  checkIn: async (groupId: string, note?: string) =>
    (await api.post<Group>(`/family/groups/${groupId}/check-in`, { note: note || null })).data,
  leaveGroup: async (groupId: string) => {
    await api.delete(`/family/groups/${groupId}/membership`)
  },
}

function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`
  if (seconds < 86_400) return `${Math.floor(seconds / 3600)} h ago`
  return `${Math.floor(seconds / 86_400)} d ago`
}

function GroupCard({ group }: { group: Group }) {
  const queryClient = useQueryClient()
  const [copied, setCopied] = useState(false)

  const checkInMutation = useMutation({
    mutationFn: () => familyApi.checkIn(group.id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['family'] }),
  })

  const leaveMutation = useMutation({
    mutationFn: () => familyApi.leaveGroup(group.id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['family'] }),
  })

  const copyCode = async () => {
    await navigator.clipboard.writeText(group.inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <GlassCard className="p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md">
            <Users className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-semibold">{group.name}</h2>
            <p className="text-xs text-muted-foreground">{group.members.length} member(s)</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyCode}
            className="glass-panel flex items-center gap-2 rounded-lg px-3 py-1.5 font-mono text-sm font-semibold tracking-widest transition-colors hover:border-primary/40"
            title="Copy invite code"
          >
            {group.inviteCode}
            {copied ? (
              <Check className="h-3.5 w-3.5 text-success" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      <div className="space-y-2.5">
        {group.members.map((member) => {
          const checkedInRecently =
            member.lastCheckInAt &&
            Date.now() - new Date(member.lastCheckInAt).getTime() < 24 * 3600 * 1000
          return (
            <div
              key={member.userId}
              className="flex items-center gap-3 rounded-xl border border-border p-3"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-xs font-semibold text-white">
                {getInitials(member.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
                  {member.name}
                  {member.me && <Badge className="px-1.5 py-0 text-[9px]">YOU</Badge>}
                  {member.owner && (
                    <Badge variant="primary" className="px-1.5 py-0 text-[9px]">
                      OWNER
                    </Badge>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {member.lastCheckInAt
                    ? `Safe · checked in ${timeAgo(member.lastCheckInAt)}`
                    : 'No check-in yet'}
                </p>
              </div>
              <span
                className={cn(
                  'h-2.5 w-2.5 shrink-0 rounded-full',
                  checkedInRecently ? 'bg-success' : 'bg-muted-foreground/30',
                )}
                title={checkedInRecently ? 'Checked in within 24h' : 'No recent check-in'}
              />
            </div>
          )
        })}
      </div>

      <div className="mt-5 flex flex-wrap gap-2.5">
        <Button
          variant="primary"
          size="sm"
          className="bg-success shadow-success/25 hover:shadow-success/40"
          disabled={checkInMutation.isPending}
          onClick={() => checkInMutation.mutate()}
        >
          {checkInMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ShieldCheck className="h-4 w-4" />
          )}
          I'm safe — check in
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          disabled={leaveMutation.isPending}
          onClick={() => {
            if (window.confirm(`Leave "${group.name}"?`)) leaveMutation.mutate()
          }}
        >
          <DoorOpen className="h-4 w-4" /> Leave
        </Button>
      </div>
    </GlassCard>
  )
}

export default function FamilyPage() {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [inviteCode, setInviteCode] = useState('')

  const groupsQuery = useQuery({ queryKey: ['family'], queryFn: familyApi.getGroups })

  const createMutation = useMutation({
    mutationFn: () => familyApi.createGroup(groupName),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['family'] })
      setCreateOpen(false)
      setGroupName('')
    },
  })

  const joinMutation = useMutation({
    mutationFn: () => familyApi.joinGroup(inviteCode),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['family'] })
      setJoinOpen(false)
      setInviteCode('')
    },
  })

  const groups = groupsQuery.data ?? []
  const error = createMutation.error ?? joinMutation.error

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Family Safety</h1>
          <p className="mt-1.5 text-muted-foreground">
            Create a family circle, share the code, and let everyone check in safe.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="glass" size="sm" onClick={() => { setJoinOpen((open) => !open); setCreateOpen(false) }}>
            <UserPlus className="h-4 w-4" /> Join with code
          </Button>
          <Button variant="gradient" size="sm" onClick={() => { setCreateOpen((open) => !open); setJoinOpen(false) }}>
            <Plus className="h-4 w-4" /> New group
          </Button>
        </div>
      </div>

      {error != null && (
        <div className="flex items-start gap-2.5 rounded-xl border border-emergency/30 bg-emergency/10 px-4 py-3 text-sm text-emergency">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {getApiErrorMessage(error, 'Something went wrong.')}
        </div>
      )}

      <AnimatePresence>
        {(createOpen || joinOpen) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <GlassCard className="p-6">
              {createOpen ? (
                <form
                  onSubmit={(event) => {
                    event.preventDefault()
                    if (groupName.trim().length >= 2) createMutation.mutate()
                  }}
                  className="flex flex-wrap items-end gap-3"
                >
                  <div className="min-w-52 flex-1">
                    <FormField
                      label="Group name"
                      placeholder="e.g. Sharma Family"
                      value={groupName}
                      onChange={(event) => setGroupName(event.target.value)}
                    />
                  </div>
                  <Button type="submit" variant="gradient" disabled={createMutation.isPending}>
                    {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    Create
                  </Button>
                </form>
              ) : (
                <form
                  onSubmit={(event) => {
                    event.preventDefault()
                    if (inviteCode.trim().length >= 6) joinMutation.mutate()
                  }}
                  className="flex flex-wrap items-end gap-3"
                >
                  <div className="min-w-52 flex-1">
                    <FormField
                      label="Invite code"
                      placeholder="6-character code, e.g. K7KP2Q"
                      value={inviteCode}
                      onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
                      className="font-mono tracking-widest uppercase"
                      maxLength={6}
                    />
                  </div>
                  <Button type="submit" variant="gradient" disabled={joinMutation.isPending}>
                    {joinMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    Join group
                  </Button>
                </form>
              )}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {groupsQuery.isPending ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      ) : groups.length === 0 ? (
        <GlassCard className="flex flex-col items-center gap-4 p-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15">
            <Users className="h-7 w-7 text-emerald-500" />
          </span>
          <div>
            <h3 className="font-semibold">No family circles yet</h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              Create a group and share the 6-character code with your family — everyone who joins
              can check in safe and see each other's status.
            </p>
          </div>
        </GlassCard>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}
    </div>
  )
}
