import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { GlassCard } from '@/components/ui/card'
import { useAuth } from '@/features/auth/auth-context'
import { chatApi, type ChatRoom } from '@/features/chat/api'
import { subscribeWs } from '@/lib/websocket'
import { ChatSidebar } from './components/ChatSidebar'
import { ChatArea } from './components/ChatArea'

export default function ChatPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'rooms' | 'direct'>('rooms')
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)

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

  // Subscribe to the active room via WebSocket
  useEffect(() => {
    if (!selectedRoom) return
    const sub = subscribeWs(`/topic/chat/${selectedRoom.id}`, () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages', selectedRoom.id] })
    })
    return () => sub?.unsubscribe()
  }, [selectedRoom, queryClient])

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Sidebar — Navigation & List */}
      <div className="w-80 shrink-0">
        <GlassCard className="h-full p-4">
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
        <GlassCard className="h-full overflow-hidden p-0 shadow-lg shadow-violet-500/5 ring-1 ring-border/50">
          <ChatArea
            selectedRoom={selectedRoom}
            user={user}
            messagesQuery={messagesQuery}
            sendMutation={sendMutation}
          />
        </GlassCard>
      </div>
    </div>
  )
}
