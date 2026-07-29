import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { GlassCard } from '@/components/ui/card'
import { useAuth } from '@/features/auth/auth-context'
import { chatApi, type ChatRoom } from '@/features/chat/api'
import { ChatSidebar } from './components/ChatSidebar'
import { ChatArea } from './components/ChatArea'

export default function ChatPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'rooms' | 'direct'>('rooms')
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const [typingUser, setTypingUser] = useState<string | null>(null)

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
    mutationFn: ({ roomId, payload }: { roomId: string; payload: any }) =>
      chatApi.sendMessage(roomId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages', selectedRoom?.id] })
    },
  })

  const createMutation = useMutation({
    mutationFn: (name: string) => chatApi.createRoom(name),
    onSuccess: (newRoom) => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'rooms'] })
      setSelectedRoom(newRoom)
    },
  })

  const directChatMutation = useMutation({
    mutationFn: (targetUserId: string) => chatApi.startDirectChat(targetUserId),
    onSuccess: (room) => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'rooms'] })
      setSelectedRoom(room)
      setActiveTab('direct') // switch to direct tab on creation
    },
  })

  // Auto-select first room on load if none selected
  useEffect(() => {
    if (!selectedRoom && roomsQuery.data && roomsQuery.data.length > 0) {
      const initialRooms = roomsQuery.data.filter(r => r.type !== 'DIRECT')
      if (initialRooms.length > 0) {
        setSelectedRoom(initialRooms[0])
      }
    }
  }, [selectedRoom, roomsQuery.data])

  // Track the active room in localStorage for the GlobalChatListener
  useEffect(() => {
    if (selectedRoom) {
      localStorage.setItem('last_active_chat_room', selectedRoom.id)
    } else {
      localStorage.removeItem('last_active_chat_room')
    }
    
    // When unmounting, we should clear it so global notifications resume for this room
    return () => {
      localStorage.removeItem('last_active_chat_room')
    }
  }, [selectedRoom])

  // Listen to events from GlobalChatListener to update UI state
  useEffect(() => {
    let typingTimer: ReturnType<typeof setTimeout>
    
    const onTyping = (e: any) => {
      const payload = e.detail
      if (selectedRoom?.id === payload.roomId && payload.userId !== user?.id) {
        setTypingUser(payload.username)
        clearTimeout(typingTimer)
        typingTimer = setTimeout(() => setTypingUser(null), 3000)
      }
    }

    const onMessage = (e: any) => {
      if (selectedRoom?.id === e.detail.roomId) {
        setTypingUser(null)
      }
    }

    window.addEventListener('chat_typing_received', onTyping)
    window.addEventListener('chat_message_received', onMessage)

    return () => {
      window.removeEventListener('chat_typing_received', onTyping)
      window.removeEventListener('chat_message_received', onMessage)
      clearTimeout(typingTimer)
      setTypingUser(null)
    }
  }, [selectedRoom?.id, user?.id])

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6 p-4 pt-0">
      {/* Sidebar — Navigation & List */}
      <div className="w-80 shrink-0">
        <GlassCard className="h-full p-4 bg-[#0B1220]/50 border-white/[0.08]">
          <ChatSidebar
            currentUserId={user?.id}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            selectedRoom={selectedRoom}
            setSelectedRoom={setSelectedRoom}
            roomsQuery={roomsQuery}
            usersQuery={usersQuery}
            createMutation={createMutation}
            directChatMutation={directChatMutation}
          />
        </GlassCard>
      </div>

      {/* Main — Message Panel */}
      <div className="flex-1">
        <GlassCard className="h-full overflow-hidden p-0 shadow-lg shadow-blue-500/5 border-white/[0.08] bg-[#050816]">
          <ChatArea
            selectedRoom={selectedRoom}
            user={user}
            messagesQuery={messagesQuery}
            users={usersQuery.data ?? []}
            sendMutation={sendMutation}
            typingUser={typingUser}
          />
        </GlassCard>
      </div>
    </div>
  )
}
