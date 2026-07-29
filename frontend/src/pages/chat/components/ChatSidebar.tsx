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
        return <Stethoscope className="h-3.5 w-3.5 text-[#10B981]" />
      case 'POLICE':
      case 'FIREFIGHTER':
      case 'RESCUE_TEAM':
        return <Siren className="h-3.5 w-3.5 text-[#F97316]" />
      case 'ADMIN':
        return <Shield className="h-3.5 w-3.5 text-[#9333EA]" />
      default:
        return <User className="h-3.5 w-3.5 text-[#3B82F6]" />
    }
  }

  const getDirectChatName = (roomName: string) => {
    if (!roomName.startsWith('Direct: ')) return roomName
    const parts = roomName.replace('Direct: ', '').split(' & ')
    if (!currentUserId) return parts.join(' & ')
    return parts.join(' & ')
  }

  return (
    <div className="flex h-full flex-col bg-[#0B1220] text-[#F8FAFC]">
      {/* Premium Animated Tabs */}
      <div className="relative mb-4 flex rounded-xl bg-[#111827] p-1 backdrop-blur-md border border-white/[0.08]">
        {['rooms', 'direct'].map((tab) => {
          const isActive = activeTab === tab
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'rooms' | 'direct')}
              className={cn(
                'relative flex-1 rounded-lg py-2 text-[11px] font-bold uppercase tracking-wider transition-colors z-10',
                isActive ? 'text-white' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-tab"
                  className="absolute inset-0 -z-10 rounded-lg bg-[#2563EB] shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              {tab === 'rooms' ? 'Channels' : 'Direct'}
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
              <div className="mb-3 flex items-center justify-between px-1">
                <h2 className="text-[10px] font-bold tracking-wider text-[#94A3B8] uppercase">
                  Active Channels
                </h2>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-[#3B82F6] hover:bg-[#3B82F6]/10" onClick={() => setCreating((v) => !v)}>
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
                        className="h-9 flex-1 rounded-lg border border-white/[0.12] bg-[#111827] px-3 text-sm focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && newRoomName.trim() && createMutation.mutate(newRoomName.trim())}
                        autoFocus
                      />
                      <Button
                        size="sm"
                        className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-lg shadow-blue-500/20"
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
                  <>{[1, 2, 3].map((n) => <Skeleton key={n} className="h-14 rounded-xl bg-[#111827]" />)}</>
                ) : groupRooms.length === 0 ? (
                  <div className="p-4 text-center">
                    <Hash className="mx-auto mb-2 h-6 w-6 text-[#94A3B8]/30" />
                    <p className="text-xs text-[#94A3B8]">No channels yet.</p>
                  </div>
                ) : (
                  groupRooms.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoom(room)}
                      className={cn(
                        'group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200 border',
                        selectedRoom?.id === room.id
                          ? 'bg-[#111827] border-white/[0.12] text-white shadow-lg'
                          : 'border-transparent text-[#94A3B8] hover:bg-[#111827]/50 hover:text-white',
                      )}
                    >
                      <span className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all",
                        selectedRoom?.id === room.id ? "bg-[#2563EB] text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]" : "bg-[#111827] text-[#94A3B8] border border-white/[0.08]"
                      )}>
                        <Hash className="h-4.5 w-4.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={cn("truncate text-[13px] tracking-wide", selectedRoom?.id === room.id ? "font-bold text-white" : "font-medium")}>
                          {room.name}
                        </p>
                        {room.description && (
                          <p className="truncate text-[10px] text-[#94A3B8] mt-0.5">{room.description}</p>
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
                  <Search className="absolute top-2.5 left-3 h-4 w-4 text-[#94A3B8]" />
                  <input
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Find users to message..."
                    className="h-9 w-full rounded-xl border border-white/[0.12] bg-[#111827] pl-9 pr-3 text-sm focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:outline-none placeholder:text-[#94A3B8]/60"
                  />
                </div>

                {userSearch.trim() === '' && directRooms.length > 0 && (
                  <div className="space-y-2">
                    <h2 className="text-[10px] font-bold tracking-wider text-[#94A3B8] uppercase px-1">
                      Recent
                    </h2>
                    <div className="space-y-1.5">
                      {directRooms.map((room) => (
                        <button
                          key={room.id}
                          onClick={() => setSelectedRoom(room)}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200 border',
                            selectedRoom?.id === room.id
                              ? 'bg-[#111827] border-white/[0.12] text-white shadow-lg'
                              : 'border-transparent text-[#94A3B8] hover:bg-[#111827]/50 hover:text-white',
                          )}
                        >
                          <span className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all",
                            selectedRoom?.id === room.id ? "bg-[#2563EB] text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]" : "bg-[#111827] text-[#94A3B8] border border-white/[0.08]"
                          )}>
                            <User className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className={cn("truncate text-[13px]", selectedRoom?.id === room.id ? "font-bold text-white" : "font-medium")}>
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
                  <h2 className="mb-2 text-[10px] font-bold tracking-wider text-[#94A3B8] uppercase px-1">
                    Directory
                  </h2>
                  {usersQuery.isPending ? (
                    <>{[1, 2, 3, 4].map((n) => <Skeleton key={n} className="h-12 rounded-xl bg-[#111827]" />)}</>
                  ) : users.length === 0 ? (
                    <p className="p-4 text-center text-xs text-[#94A3B8]">No users found.</p>
                  ) : (
                    users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          directChatMutation.mutate(u.id)
                          setUserSearch('')
                        }}
                        disabled={directChatMutation.isPending}
                        className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all hover:bg-[#111827] border border-transparent hover:border-white/[0.08]"
                      >
                        <span className="flex h-8 w-8 shrink-0 overflow-hidden items-center justify-center rounded-full bg-[#050816] border border-white/[0.12] shadow-sm">
                          {u.profilePictureUrl ? (
                            <img src={u.profilePictureUrl} alt={u.fullName} className="h-full w-full object-cover" />
                          ) : (
                            getRoleIcon(u.role)
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-semibold text-white group-hover:text-[#3B82F6] transition-colors">
                            {u.fullName}
                          </p>
                          <p className="truncate text-[10px] tracking-wide text-[#94A3B8] uppercase mt-0.5">
                            {u.role.replace('_', ' ')}
                          </p>
                        </div>
                        <UserCheck className="h-4 w-4 text-[#94A3B8]/40 group-hover:text-[#3B82F6] transition-colors" />
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
