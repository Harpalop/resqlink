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
  fileUrl?: string
  fileName?: string
  fileType?: string
  latitude?: number
  longitude?: number
  messageType?: 'TEXT' | 'FILE' | 'LOCATION' | 'EMERGENCY'
  status?: 'SENDING' | 'SENT' | 'DELIVERED' | 'READ'
  createdAt: string
}

export interface ChatUser {
  id: string
  fullName: string
  email: string
  role: string
  profilePictureUrl?: string
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
  sendMessage: async (
    roomId: string,
    payload: {
      content: string
      fileUrl?: string
      fileName?: string
      fileType?: string
      latitude?: number
      longitude?: number
      messageType?: string
    }
  ) => (await api.post<ChatMessage>(`/chat/rooms/${roomId}/messages`, payload)).data,
  sendTyping: async (roomId: string) =>
    (await api.post(`/chat/rooms/${roomId}/typing`)).data,
  uploadFile: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return (await api.post<{ fileUrl: string; fileName: string; fileType: string }>('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })).data
  },
  updateProfilePicture: async (url: string) =>
    (await api.put<ChatUser>('/users/me/profile-picture', { profilePictureUrl: url })).data
}
