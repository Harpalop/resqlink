import { api } from '@/lib/api'
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '@/features/auth/types'

export const authApi = {
  register: async (payload: RegisterPayload) => {
    const { data } = await api.post<AuthResponse>('/auth/register', payload)
    return data
  },
  login: async (payload: LoginPayload) => {
    const { data } = await api.post<AuthResponse>('/auth/login', payload)
    return data
  },
  me: async () => {
    const { data } = await api.get<User>('/users/me')
    return data
  },
}
