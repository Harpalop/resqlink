import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Hash,
  Loader2,
  MessageCircle,
  Plus,
  Send,
  Users,
} from 'lucide-react'
import { GlassCard } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/features/auth/auth-context'
import { chatApi, type ChatRoom } from '@/features/chat/api'
import { subscribeWs } from '@/lib/websocket'
import { cn } from '@/lib/utils'

export default function ChatPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const [input, setInput] = useState('')
  const [creating, setCreating] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const roomsQuery = useQuery({
    queryKey: ['chat', 'rooms'],
    queryFn: chatApi.getRooms,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'rooms'] })
      setCreating(false)
      setNewRoomName('')
    },
  })

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
  const messages = messagesQuery.data ?? []

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Sidebar — rooms list */}
      <div className="w-72 shrink-0 lg:w-80">
        <GlassCard className="flex h-full flex-col p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Chats</h2>
            <Button variant="ghost" size="icon" onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {creating && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-3 overflow-hidden">
              <div className="flex gap-2">
                <input
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Room name..."
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
            </motion.div>
          )}

          <div className="flex-1 space-y-1 overflow-y-auto">
            {roomsQuery.isPending ? (
              <>{[1, 2, 3].map((n) => <Skeleton key={n} className="h-12" />)}</>
            ) : rooms.length === 0 ? (
              <p className="p-4 text-center text-xs text-muted-foreground">No rooms yet. Create one!</p>
            ) : (
              rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors',
                    selectedRoom?.id === room.id
                      ? 'bg-primary/10 text-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <Hash className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{room.name}</p>
                    {room.description && (
                      <p className="truncate text-xs text-muted-foreground">{room.description}</p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      {/* Main — messages */}
      <div className="flex-1">
        <GlassCard className="flex h-full flex-col p-0">
          {selectedRoom ? (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 border-b border-border px-5 py-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Hash className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-semibold">{selectedRoom.name}</h3>
                  {selectedRoom.description && <p className="text-xs text-muted-foreground">{selectedRoom.description}</p>}
                </div>
                <Badge variant="success" className="ml-auto">
                  <Users className="mr-1 h-3 w-3" /> Live
                </Badge>
              </div>

              {/* Messages */}
              <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
                {messagesQuery.isPending ? (
                  <>{[1, 2, 3, 4].map((n) => <Skeleton key={n} className="h-16" />)}</>
                ) : messages.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
                    <MessageCircle className="h-8 w-8 opacity-30" />
                    <p className="text-sm">No messages yet. Say hello!</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {messages.map((msg) => {
                      const isMe = msg.senderId === user?.id
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 12, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          className={cn('flex', isMe ? 'justify-end' : 'justify-start')}
                        >
                          <div
                            className={cn(
                              'max-w-[70%] rounded-2xl px-4 py-2.5',
                              isMe
                                ? 'rounded-br-md bg-primary text-primary-foreground'
                                : 'rounded-bl-md border border-border bg-background',
                            )}
                          >
                            {!isMe && (
                              <p className="mb-0.5 text-[10px] font-semibold text-primary">
                                {msg.senderName}
                              </p>
                            )}
                            <p className="text-sm">{msg.content}</p>
                            <p className={cn('mt-1 text-[10px]', isMe ? 'text-primary-foreground/60' : 'text-muted-foreground')}>
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

              {/* Input */}
              <div className="border-t border-border px-5 py-3">
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
                    placeholder="Type a message..."
                    className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm transition-colors focus:border-primary/60 focus:ring-2 focus:ring-ring/40 focus:outline-none"
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
              <p className="text-sm">Select a chat room to start messaging</p>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  )
}
