import { api } from '@/lib/api'

export interface ChatRoom {
  id: string
  name: string
  description: string | null
  type?: 'DIRECT' | 'GROUP' | 'BROADCAST'
  createdBy: string
  createdAt: string
}

export interface ChatMessage {
  id: string
  roomId: string
  senderId: string
  senderName: string
  content: string
  createdAt: string
}

export interface ChatUser {
  id: string
  fullName: string
  email: string
  role: string
}

export const chatApi = {
  getRooms: async () =>
    (await api.get<ChatRoom[]>('/chat/rooms')).data,
  getUsers: async () =>
    (await api.get<ChatUser[]>('/chat/users')).data,
  createRoom: async (name: string, description?: string) =>
    (await api.post<ChatRoom>('/chat/rooms', { name, description })).data,
  startDirectChat: async (targetUserId: string) =>
    (await api.post<ChatRoom>(`/chat/direct/${targetUserId}`)).data,
  getMessages: async (roomId: string) =>
    (await api.get<ChatMessage[]>(`/chat/rooms/${roomId}/messages`)).data,
  sendMessage: async (roomId: string, content: string) =>
    (await api.post<ChatMessage>(`/chat/rooms/${roomId}/messages`, { content })).data,
}
