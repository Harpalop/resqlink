import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Hash,
  Loader2,
  MessageCircle,
  Plus,
  Send,
  User,
  Users,
  UserCheck,
  Shield,
  Stethoscope,
  Siren,
  Search,
} from 'lucide-react'
import { GlassCard } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/features/auth/auth-context'
import { chatApi, type ChatRoom, type ChatUser } from '@/features/chat/api'
import { subscribeWs } from '@/lib/websocket'
import { cn } from '@/lib/utils'

export default function ChatPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'rooms' | 'direct'>('rooms')
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const [input, setInput] = useState('')
  const [creating, setCreating] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const roomsQuery = useQuery({
    queryKey: ['chat', 'rooms'],
    queryFn: chatApi.getRooms,
  })

  const usersQuery = useQuery({
    queryKey: ['chat', 'users'],
    queryFn: chatApi.getUsers,
  })

  const messagesQuery = useQuery({
    queryKey: ['chat', 'messages', selectedRoom?.id],
    queryFn: () => chatApi.getMessages(selectedRoom!.id),
    enabled: !!selectedRoom,
  })

  const sendMutation = useMutation({
    mutationFn: ({ roomId, content }: { roomId: string; content: string }) =>
      chatApi.sendMessage(roomId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages', selectedRoom?.id] })
    },
  })

  const createMutation = useMutation({
    mutationFn: (name: string) => chatApi.createRoom(name),
    onSuccess: (newRoom) => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'rooms'] })
      setSelectedRoom(newRoom)
      setCreating(false)
      setNewRoomName('')
    },
  })

  const directChatMutation = useMutation({
    mutationFn: (targetUserId: string) => chatApi.startDirectChat(targetUserId),
    onSuccess: (room) => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'rooms'] })
      setSelectedRoom(room)
    },
  })

  // Auto-select first room on load if none selected
  useEffect(() => {
    if (!selectedRoom && roomsQuery.data && roomsQuery.data.length > 0) {
      setSelectedRoom(roomsQuery.data[0])
    }
  }, [selectedRoom, roomsQuery.data])

  // Subscribe to the active room via WebSocket
  useEffect(() => {
    if (!selectedRoom) return
    const sub = subscribeWs(`/topic/chat/${selectedRoom.id}`, () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages', selectedRoom.id] })
    })
    return () => sub?.unsubscribe()
  }, [selectedRoom, queryClient])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messagesQuery.data?.length])

  const handleSend = () => {
    if (!input.trim() || !selectedRoom || sendMutation.isPending) return
    sendMutation.mutate({ roomId: selectedRoom.id, content: input.trim() })
    setInput('')
  }

  const rooms = roomsQuery.data ?? []
  const users = (usersQuery.data ?? []).filter((u) =>
    u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role.toLowerCase().includes(userSearch.toLowerCase())
  )
  const messages = messagesQuery.data ?? []

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

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Sidebar — Navigation & List */}
      <div className="w-80 shrink-0">
        <GlassCard className="flex h-full flex-col p-4">
          {/* Tabs */}
          <div className="mb-4 flex rounded-xl bg-muted/50 p-1">
            <button
              onClick={() => setActiveTab('rooms')}
              className={cn(
                'flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all',
                activeTab === 'rooms'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Group Channels
            </button>
            <button
              onClick={() => setActiveTab('direct')}
              className={cn(
                'flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all',
                activeTab === 'direct'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Direct Messages
            </button>
          </div>

          {activeTab === 'rooms' ? (
            <>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Channels</h2>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCreating((v) => !v)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {creating && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-3 space-y-1.5 overflow-hidden">
                  <div className="flex gap-2">
                    <input
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      placeholder="Channel name..."
                      className="h-9 flex-1 rounded-lg border border-input bg-background px-3 text-sm"
                      onKeyDown={(e) => e.key === 'Enter' && newRoomName.trim() && createMutation.mutate(newRoomName.trim())}
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={() => newRoomName.trim() && createMutation.mutate(newRoomName.trim())}
                      disabled={!newRoomName.trim() || createMutation.isPending}
                    >
                      {createMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                  {createMutation.isError && (
                    <p className="text-[11px] text-destructive">Failed to create room. Ensure you are logged in.</p>
                  )}
                </motion.div>
              )}

              <div className="flex-1 space-y-1 overflow-y-auto">
                {roomsQuery.isPending ? (
                  <>{[1, 2, 3].map((n) => <Skeleton key={n} className="h-12" />)}</>
                ) : rooms.length === 0 ? (
                  <p className="p-4 text-center text-xs text-muted-foreground">No channels yet. Create one!</p>
                ) : (
                  rooms.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoom(room)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                        selectedRoom?.id === room.id
                          ? 'bg-primary/15 text-foreground font-semibold'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      )}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                        <Hash className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm">{room.name}</p>
                        {room.description && (
                          <p className="truncate text-xs text-muted-foreground">{room.description}</p>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              <div className="relative mb-3">
                <Search className="absolute top-2.5 left-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search network users..."
                  className="h-8.5 w-full rounded-lg border border-input bg-background/50 pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex-1 space-y-1 overflow-y-auto">
                {usersQuery.isPending ? (
                  <>{[1, 2, 3, 4].map((n) => <Skeleton key={n} className="h-12" />)}</>
                ) : users.length === 0 ? (
                  <p className="p-4 text-center text-xs text-muted-foreground">No users found.</p>
                ) : (
                  users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => directChatMutation.mutate(u.id)}
                      disabled={directChatMutation.isPending}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-primary/10"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted border border-border">
                        {getRoleIcon(u.role)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{u.fullName}</p>
                        <p className="truncate text-[11px] text-muted-foreground">{u.role}</p>
                      </div>
                      <UserCheck className="h-3.5 w-3.5 text-muted-foreground/60" />
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </GlassCard>
      </div>

      {/* Main — Message Panel */}
      <div className="flex-1">
        <GlassCard className="flex h-full flex-col p-0">
          {selectedRoom ? (
            <>
              {/* Room Header */}
              <div className="flex items-center gap-3 border-b border-border/80 px-5 py-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  {selectedRoom.type === 'DIRECT' ? <User className="h-5 w-5" /> : <Hash className="h-5 w-5" />}
                </span>
                <div>
                  <h3 className="font-semibold">{selectedRoom.name}</h3>
                  {selectedRoom.description && <p className="text-xs text-muted-foreground">{selectedRoom.description}</p>}
                </div>
                <Badge variant="success" className="ml-auto">
                  <Users className="mr-1 h-3 w-3" /> Live
                </Badge>
              </div>

              {/* Message History */}
              <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
                {messagesQuery.isPending ? (
                  <>{[1, 2, 3, 4].map((n) => <Skeleton key={n} className="h-16" />)}</>
                ) : messages.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
                    <MessageCircle className="h-10 w-10 opacity-30" />
                    <p className="text-sm font-medium">No messages yet in {selectedRoom.name}</p>
                    <p className="text-xs">Type a message below to start the conversation!</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {messages.map((msg) => {
                      const isMe = msg.senderId === user?.id
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.2 }}
                          className={cn('flex', isMe ? 'justify-end' : 'justify-start')}
                        >
                          <div
                            className={cn(
                              'max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm',
                              isMe
                                ? 'rounded-br-xs bg-primary text-primary-foreground'
                                : 'rounded-bl-xs border border-border/80 bg-background/80',
                            )}
                          >
                            {!isMe && (
                              <p className="mb-0.5 text-[11px] font-semibold text-primary">
                                {msg.senderName}
                              </p>
                            )}
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                            <p className={cn('mt-1 text-[10px]', isMe ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Form */}
              <div className="border-t border-border/80 px-5 py-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSend()
                  }}
                  className="flex items-center gap-3"
                >
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Message ${selectedRoom.name}...`}
                    className="flex-1 rounded-xl border border-input bg-background/60 px-4 py-2.5 text-sm transition-colors focus:border-primary/60 focus:ring-2 focus:ring-ring/40 focus:outline-none"
                    autoFocus
                  />
                  <Button type="submit" variant="gradient" size="icon" disabled={!input.trim() || sendMutation.isPending}>
                    {sendMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
              <MessageCircle className="h-12 w-12 opacity-20" />
              <p className="text-sm">Select a channel or start a 1-on-1 direct chat to begin messaging</p>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  )
}
