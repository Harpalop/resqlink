import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Hash,
  Loader2,
  MessageCircle,
  Send,
  User,
  Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { MessageBubble } from './MessageBubble'
import type { ChatRoom, ChatMessage } from '@/features/chat/api'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import type { User as AuthUser } from '@/features/auth/types'

interface ChatAreaProps {
  selectedRoom: ChatRoom | null
  user: AuthUser | null
  messagesQuery: UseQueryResult<ChatMessage[], Error>
  sendMutation: UseMutationResult<ChatMessage, Error, { roomId: string; content: string }, unknown>
}

export function ChatArea({
  selectedRoom,
  user,
  messagesQuery,
  sendMutation,
}: ChatAreaProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const messages = messagesQuery.data ?? []

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSend = () => {
    if (!input.trim() || !selectedRoom || sendMutation.isPending) return
    sendMutation.mutate({ roomId: selectedRoom.id, content: input.trim() })
    setInput('')
  }

  // Helper to extract the other user's name from "Direct: User A & User B"
  const getDirectChatName = (roomName: string) => {
    if (!roomName.startsWith('Direct: ')) return roomName
    const parts = roomName.replace('Direct: ', '').split(' & ')
    if (!user) return parts.join(' & ')
    return parts.find(p => p !== user.fullName) || parts[0]
  }

  if (!selectedRoom) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground/60">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-muted/30">
          <MessageCircle className="h-10 w-10 opacity-40" />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 rounded-full border-2 border-violet-500/20"
          />
        </div>
        <p className="text-sm font-medium tracking-wide">Select a conversation to begin</p>
      </div>
    )
  }

  const roomDisplayName = selectedRoom.type === 'DIRECT' ? getDirectChatName(selectedRoom.name) : selectedRoom.name

  return (
    <div className="flex h-full flex-col">
      {/* Room Header - Glassmorphic */}
      <div className="flex items-center gap-4 border-b border-border/40 bg-background/40 px-6 py-4 backdrop-blur-md">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 text-violet-600 shadow-inner">
          {selectedRoom.type === 'DIRECT' ? <User className="h-5 w-5" /> : <Hash className="h-5 w-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold tracking-tight">{roomDisplayName}</h3>
          <p className="truncate text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
            {selectedRoom.type === 'DIRECT' ? 'Direct Message' : selectedRoom.description || 'Group Channel'}
          </p>
        </div>
        <Badge variant="success" className="ml-auto animate-pulse bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25">
          <Users className="mr-1.5 h-3.5 w-3.5" /> Live
        </Badge>
      </div>

      {/* Message History */}
      <div className="flex-1 space-y-4 overflow-y-auto p-6 scroll-smooth">
        {messagesQuery.isPending ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className={`flex ${n % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                <Skeleton className={`h-16 w-2/3 rounded-2xl ${n % 2 === 0 ? 'rounded-br-sm' : 'rounded-bl-sm'}`} />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground/50">
            <MessageCircle className="h-12 w-12 opacity-30" />
            <p className="text-sm font-semibold tracking-wide">It's quiet here...</p>
            <p className="text-[11px] uppercase tracking-wider opacity-60">
              Send a message to break the ice!
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isMe={msg.senderId === user?.id}
              />
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Message Input Form */}
      <div className="border-t border-border/40 bg-background/40 p-4 backdrop-blur-md">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex items-end gap-3"
        >
          <div className="relative flex-1">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Message ${roomDisplayName}...`}
              className="w-full rounded-2xl border-0 bg-muted/50 px-5 py-3.5 text-sm shadow-inner ring-1 ring-inset ring-border/50 transition-all focus:bg-background focus:ring-2 focus:ring-violet-500/50 focus:outline-none"
              autoFocus
            />
          </div>
          <Button 
            type="submit" 
            disabled={!input.trim() || sendMutation.isPending}
            className="h-12 w-12 shrink-0 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 hover:shadow-indigo-500/40 disabled:opacity-50 disabled:hover:scale-100"
          >
            {sendMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5 translate-x-[-1px] translate-y-[1px]" />
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
