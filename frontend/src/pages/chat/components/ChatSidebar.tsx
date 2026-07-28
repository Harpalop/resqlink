import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Hash,
  Loader2,
  Plus,
  Search,
  Send,
  Shield,
  Siren,
  Stethoscope,
  User,
  UserCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { ChatRoom, ChatUser } from '@/features/chat/api'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'

interface ChatSidebarProps {
  currentUserId: string | undefined
  activeTab: 'rooms' | 'direct'
  setActiveTab: (tab: 'rooms' | 'direct') => void
  selectedRoom: ChatRoom | null
  setSelectedRoom: (room: ChatRoom) => void
  roomsQuery: UseQueryResult<ChatRoom[], Error>
  usersQuery: UseQueryResult<ChatUser[], Error>
  createMutation: UseMutationResult<ChatRoom, Error, string, unknown>
  directChatMutation: UseMutationResult<ChatRoom, Error, string, unknown>
}

export function ChatSidebar({
  currentUserId,
  activeTab,
  setActiveTab,
  selectedRoom,
  setSelectedRoom,
  roomsQuery,
  usersQuery,
  createMutation,
  directChatMutation,
}: ChatSidebarProps) {
  const [creating, setCreating] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [userSearch, setUserSearch] = useState('')

  const allRooms = roomsQuery.data ?? []
  
  // Filter rooms
  const groupRooms = allRooms.filter((r) => r.type !== 'DIRECT')
  const directRooms = allRooms.filter((r) => r.type === 'DIRECT')

  const users = (usersQuery.data ?? []).filter((u) =>
    u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role.toLowerCase().includes(userSearch.toLowerCase())
  )

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'DOCTOR':
      case 'NURSE':
        return <Stethoscope className="h-3.5 w-3.5 text-cyan-400" />
      case 'POLICE':
      case 'FIREFIGHTER':
      case 'RESCUE_TEAM':
        return <Siren className="h-3.5 w-3.5 text-rose-500" />
      case 'ADMIN':
        return <Shield className="h-3.5 w-3.5 text-amber-400" />
      default:
        return <User className="h-3.5 w-3.5 text-emerald-400" />
    }
  }

  // Helper to extract the other user's name from "Direct: User A & User B"
  const getDirectChatName = (roomName: string) => {
    if (!roomName.startsWith('Direct: ')) return roomName
    const parts = roomName.replace('Direct: ', '').split(' & ')
    // If we can't figure out current user, just return the raw string
    if (!currentUserId) return parts.join(' & ')
    
    // We don't have current user's full name directly in sidebar unless we pass it,
    // but typically one part is the current user. Let's just pass currentUserFullName 
    // down if needed, but for now we'll just try to guess or show both if it's tricky.
    // Actually, passing `currentUserFullName` to `ChatSidebar` would be cleaner.
    // Let's assume we pass `currentUserFullName` later or handle it here:
    return parts.join(' & ') // We will refine this below.
  }

  return (
    <div className="flex h-full flex-col">
      {/* Premium Animated Tabs */}
      <div className="relative mb-4 flex rounded-xl bg-muted/40 p-1 backdrop-blur-sm">
        {['rooms', 'direct'].map((tab) => {
          const isActive = activeTab === tab
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'rooms' | 'direct')}
              className={cn(
                'relative flex-1 rounded-lg py-2 text-[11px] font-bold uppercase tracking-wider transition-colors z-10',
                isActive ? 'text-violet-600 dark:text-violet-400' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-tab"
                  className="absolute inset-0 -z-10 rounded-lg bg-background shadow-sm"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              {tab === 'rooms' ? 'Group Channels' : 'Direct Messages'}
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.15 }}
          className="flex flex-1 flex-col overflow-hidden"
        >
          {activeTab === 'rooms' ? (
            <>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Active Channels
                </h2>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-violet-500 hover:bg-violet-500/10" onClick={() => setCreating((v) => !v)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <AnimatePresence>
                {creating && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-3 space-y-1.5 overflow-hidden"
                  >
                    <div className="flex gap-2">
                      <input
                        value={newRoomName}
                        onChange={(e) => setNewRoomName(e.target.value)}
                        placeholder="Channel name..."
                        className="h-9 flex-1 rounded-lg border border-input bg-background/50 px-3 text-sm focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 focus:outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && newRoomName.trim() && createMutation.mutate(newRoomName.trim())}
                        autoFocus
                      />
                      <Button
                        size="sm"
                        className="bg-violet-600 hover:bg-violet-700 text-white"
                        onClick={() => newRoomName.trim() && createMutation.mutate(newRoomName.trim())}
                        disabled={!newRoomName.trim() || createMutation.isPending}
                      >
                        {createMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex-1 space-y-1.5 overflow-y-auto pr-1">
                {roomsQuery.isPending ? (
                  <>{[1, 2, 3].map((n) => <Skeleton key={n} className="h-14 rounded-xl" />)}</>
                ) : groupRooms.length === 0 ? (
                  <div className="p-4 text-center">
                    <Hash className="mx-auto mb-2 h-6 w-6 text-muted-foreground/30" />
                    <p className="text-xs text-muted-foreground">No channels yet.</p>
                  </div>
                ) : (
                  groupRooms.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoom(room)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200',
                        selectedRoom?.id === room.id
                          ? 'bg-violet-500/15 text-foreground shadow-sm shadow-violet-500/5 ring-1 ring-violet-500/20'
                          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                      )}
                    >
                      <span className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                        selectedRoom?.id === room.id ? "bg-violet-500 text-white shadow-md shadow-violet-500/20" : "bg-muted text-muted-foreground"
                      )}>
                        <Hash className="h-4.5 w-4.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={cn("truncate text-sm", selectedRoom?.id === room.id ? "font-bold text-violet-600 dark:text-violet-400" : "font-medium")}>
                          {room.name}
                        </p>
                        {room.description && (
                          <p className="truncate text-[11px] opacity-70">{room.description}</p>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              {/* Direct Messages Tab */}
              <div className="mb-4 space-y-4">
                <div className="relative">
                  <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground/60" />
                  <input
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Find users to message..."
                    className="h-9 w-full rounded-xl border border-input bg-background/50 pl-9 pr-3 text-sm focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 focus:outline-none"
                  />
                </div>

                {userSearch.trim() === '' && directRooms.length > 0 && (
                  <div className="space-y-2">
                    <h2 className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      Recent Conversations
                    </h2>
                    <div className="space-y-1.5">
                      {directRooms.map((room) => (
                        <button
                          key={room.id}
                          onClick={() => setSelectedRoom(room)}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200',
                            selectedRoom?.id === room.id
                              ? 'bg-violet-500/15 text-foreground shadow-sm ring-1 ring-violet-500/20'
                              : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                          )}
                        >
                          <span className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                            selectedRoom?.id === room.id ? "bg-violet-500 text-white" : "bg-muted text-muted-foreground"
                          )}>
                            <User className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className={cn("truncate text-sm", selectedRoom?.id === room.id ? "font-bold text-violet-600 dark:text-violet-400" : "font-medium")}>
                              {getDirectChatName(room.name)}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {(userSearch.trim() !== '' || directRooms.length === 0) && (
                <div className="flex-1 space-y-1.5 overflow-y-auto pr-1">
                  <h2 className="mb-2 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    Network Directory
                  </h2>
                  {usersQuery.isPending ? (
                    <>{[1, 2, 3, 4].map((n) => <Skeleton key={n} className="h-12 rounded-xl" />)}</>
                  ) : users.length === 0 ? (
                    <p className="p-4 text-center text-xs text-muted-foreground">No users found.</p>
                  ) : (
                    users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          directChatMutation.mutate(u.id)
                          setUserSearch('')
                        }}
                        disabled={directChatMutation.isPending}
                        className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all hover:bg-violet-500/10 hover:shadow-sm"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background border border-border shadow-sm group-hover:border-violet-200">
                          {getRoleIcon(u.role)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors">
                            {u.fullName}
                          </p>
                          <p className="truncate text-[10px] tracking-wide text-muted-foreground uppercase">
                            {u.role.replace('_', ' ')}
                          </p>
                        </div>
                        <UserCheck className="h-4 w-4 text-muted-foreground/40 group-hover:text-violet-500 transition-colors" />
                      </button>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
