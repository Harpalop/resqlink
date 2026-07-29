import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Hash,
  MessageCircle,
  MapPin,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'
import type { ChatRoom, ChatMessage, ChatUser } from '@/features/chat/api'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import type { User as AuthUser } from '@/features/auth/types'
import { cn } from '@/lib/utils'

interface ChatAreaProps {
  selectedRoom: ChatRoom | null
  user: AuthUser | null
  messagesQuery: UseQueryResult<ChatMessage[], Error>
  users: ChatUser[]
  sendMutation: UseMutationResult<ChatMessage, Error, { roomId: string; payload: any }, unknown>
  typingUser: string | null
}

export function ChatArea({
  selectedRoom,
  user,
  messagesQuery,
  users,
  sendMutation,
  typingUser
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const messages = messagesQuery.data ?? []

  // Auto-scroll to bottom smoothly
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, typingUser])

  const handleLocationShare = () => {
    if (!selectedRoom) return
    
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        sendMutation.mutate({
          roomId: selectedRoom.id,
          payload: {
            content: '',
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            messageType: 'LOCATION'
          }
        })
      },
      (error) => {
        console.error('Error getting location', error)
        alert('Could not get your location. Please check permissions.')
      }
    )
  }

  const getDirectChatName = (roomName: string) => {
    if (!roomName.startsWith('Direct: ')) return roomName
    const parts = roomName.replace('Direct: ', '').split(' & ')
    if (!user) return parts.join(' & ')
    return parts.find(p => p !== user.fullName) || parts[0]
  }

  // Get user role for avatars
  const getSenderRole = (senderId: string) => {
    if (senderId === user?.id) return user?.role
    const u = users.find(u => u.id === senderId)
    return u?.role || 'CITIZEN'
  }

  if (!selectedRoom) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-[#050816] text-[#94A3B8]">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[#111827] border border-white/[0.08]">
          <MessageCircle className="h-10 w-10 opacity-40 text-[#3B82F6]" />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute inset-0 rounded-full border-2 border-[#3B82F6]/30"
          />
        </div>
        <p className="text-sm font-medium tracking-wide">Select a conversation to begin</p>
      </div>
    )
  }

  const roomDisplayName = selectedRoom.type === 'DIRECT' ? getDirectChatName(selectedRoom.name) : selectedRoom.name

  return (
    <div className="flex h-full flex-col bg-[#050816] relative">
      {/* Premium Header */}
      <div className="flex items-center gap-4 border-b border-white/[0.08] bg-[#111827]/80 px-6 py-4 backdrop-blur-xl z-20 sticky top-0">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#050816] border border-white/[0.12] shadow-inner text-[#3B82F6]">
          {selectedRoom.type === 'DIRECT' ? <User className="h-5 w-5" /> : <Hash className="h-5 w-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-bold tracking-tight text-white">{roomDisplayName}</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
            </span>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#10B981]">
              Online
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={handleLocationShare} className="h-8 w-8 text-[#94A3B8] hover:text-white hover:bg-white/[0.08]">
             <MapPin className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Message History */}
      <div className="flex-1 space-y-2 overflow-y-auto p-6 scroll-smooth pb-32">
        {messagesQuery.isPending ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className={`flex ${n % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                <Skeleton className={cn(`h-16 w-2/3 rounded-3xl bg-[#111827]`, n % 2 === 0 ? 'rounded-br-sm' : 'rounded-bl-sm')} />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-[#94A3B8]/60">
            <MessageCircle className="h-12 w-12 opacity-30" />
            <p className="text-sm font-semibold tracking-wide text-white">Start the conversation</p>
            <p className="text-[11px] uppercase tracking-wider opacity-60">
              End-to-End Real-Time Connection
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => {
              const prevMsg = messages[index - 1]
              const nextMsg = messages[index + 1]
              const msgTime = new Date(msg.createdAt).getTime()

              let isFirstInGroup = true
              if (prevMsg && prevMsg.senderId === msg.senderId) {
                const prevTime = new Date(prevMsg.createdAt).getTime()
                if (msgTime - prevTime < 5 * 60 * 1000) isFirstInGroup = false
              }

              let isLastInGroup = true
              if (nextMsg && nextMsg.senderId === msg.senderId) {
                const nextTime = new Date(nextMsg.createdAt).getTime()
                if (nextTime - msgTime < 5 * 60 * 1000) isLastInGroup = false
              }

              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isMe={msg.senderId === user?.id}
                  isFirstInGroup={isFirstInGroup}
                  isLastInGroup={isLastInGroup}
                  senderRole={getSenderRole(msg.senderId)}
                />
              )
            })}
          </AnimatePresence>
        )}
        
        {/* Animated Typing Indicator */}
        <AnimatePresence>
          {typingUser && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
              className="flex items-end gap-2 mt-2 w-full max-w-[70%]"
            >
              <div className="w-8 shrink-0"></div>
              <div className="bg-[#111827] border border-white/[0.12] rounded-3xl rounded-bl-md px-4 py-3 flex items-center gap-1 shadow-md">
                <span className="text-[10px] text-[#94A3B8] font-bold mr-1">{typingUser}</span>
                <motion.div
                  className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div ref={messagesEndRef} className="h-4" />
      </div>

      <ChatInput selectedRoom={selectedRoom} sendMutation={sendMutation} />
    </div>
  )
}
