import { api } from '@/lib/api'
import type {
  BloodRequest,
  BloodRequestPayload,
  Donor,
  DonorPayload,
} from '@/features/blood/types'

export const bloodApi = {
  getMyDonorProfile: async (): Promise<Donor | null> => {
    const response = await api.get<Donor>('/blood/donor/me', {
      validateStatus: (status) => status === 200 || status === 204,
    })
    return response.status === 204 ? null : response.data
  },
  saveDonorProfile: async (payload: DonorPayload) => {
    const { data } = await api.put<Donor>('/blood/donor/me', payload)
    return data
  },
  recordDonation: async () => {
    const { data } = await api.post<Donor>('/blood/donor/me/donations')
    return data
  },
  searchDonors: async (bloodGroup: string, city?: string) => {
    const { data } = await api.get<Donor[]>('/blood/donors', {
      params: { bloodGroup, city: city || undefined },
    })
    return data
  },
  getOpenRequests: async () => {
    const { data } = await api.get<BloodRequest[]>('/blood/requests')
    return data
  },
  createRequest: async (payload: BloodRequestPayload) => {
    const { data } = await api.post<BloodRequest>('/blood/requests', payload)
    return data
  },
  fulfillRequest: async (id: string) => {
    const { data } = await api.post<BloodRequest>(`/blood/requests/${id}/fulfill`)
    return data
  },
  closeRequest: async (id: string) => {
    const { data } = await api.post<BloodRequest>(`/blood/requests/${id}/close`)
    return data
  },
}
