import { api } from '@/lib/api'
import type { Emergency, TriggerPayload } from '@/features/sos/types'

export const sosApi = {
  trigger: async (payload: TriggerPayload) => {
    const { data } = await api.post<Emergency>('/emergencies', payload)
    return data
  },
  getActive: async (): Promise<Emergency | null> => {
    const response = await api.get<Emergency>('/emergencies/active', {
      validateStatus: (status) => status === 200 || status === 204,
    })
    return response.status === 204 ? null : response.data
  },
  getHistory: async () => {
    const { data } = await api.get<Emergency[]>('/emergencies')
    return data
  },
  resolve: async (id: string) => {
    const { data } = await api.post<Emergency>(`/emergencies/${id}/resolve`)
    return data
  },
  cancel: async (id: string) => {
    const { data } = await api.post<Emergency>(`/emergencies/${id}/cancel`)
    return data
  },
}

export interface GeoResult {
  latitude?: number
  longitude?: number
  accuracyMeters?: number
}

/** Resolves with coordinates, or an empty object if permission is denied/times out. */
export function getCurrentPosition(timeoutMs = 6000): Promise<GeoResult> {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) {
      resolve({})
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracyMeters: position.coords.accuracy,
        }),
      () => resolve({}),
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 30_000 },
    )
  })
}
