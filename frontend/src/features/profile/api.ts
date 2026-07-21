import { api } from '@/lib/api'
import type {
  ContactPayload,
  EmergencyContact,
  Profile,
  ProfilePayload,
  PublicMedicalId,
} from '@/features/profile/types'

export const profileApi = {
  getProfile: async () => {
    const { data } = await api.get<Profile>('/profile')
    return data
  },
  updateProfile: async (payload: ProfilePayload) => {
    const { data } = await api.put<Profile>('/profile', payload)
    return data
  },
  regenerateToken: async () => {
    const { data } = await api.post<Profile>('/profile/medical-id/regenerate')
    return data
  },
  getPublicMedicalId: async (token: string) => {
    const { data } = await api.get<PublicMedicalId>(`/medical-id/${token}`)
    return data
  },
}

export const contactsApi = {
  getContacts: async () => {
    const { data } = await api.get<EmergencyContact[]>('/contacts')
    return data
  },
  addContact: async (payload: ContactPayload) => {
    const { data } = await api.post<EmergencyContact>('/contacts', payload)
    return data
  },
  updateContact: async (id: string, payload: ContactPayload) => {
    const { data } = await api.put<EmergencyContact>(`/contacts/${id}`, payload)
    return data
  },
  deleteContact: async (id: string) => {
    await api.delete(`/contacts/${id}`)
  },
}
