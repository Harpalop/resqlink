import { api } from '@/lib/api'

export const DISASTER_TYPES = ['FLOOD', 'EARTHQUAKE', 'CYCLONE', 'HEATWAVE', 'STORM'] as const
export const DISASTER_SEVERITIES = ['WATCH', 'WARNING', 'SEVERE'] as const

export type DisasterType = (typeof DISASTER_TYPES)[number]
export type DisasterSeverity = (typeof DISASTER_SEVERITIES)[number]

export interface DisasterAlert {
  id: string
  type: DisasterType
  severity: DisasterSeverity
  title: string
  advice: string
  region: string
  active: boolean
  createdAt: string
}

export interface AlertPayload {
  type: DisasterType
  severity: DisasterSeverity
  title: string
  advice: string
  region: string
}

export const disasterApi = {
  /** Public feed — only active alerts. */
  getActive: async () => (await api.get<DisasterAlert[]>('/disasters/alerts')).data,
  /** Admin view — every alert, including deactivated ones. */
  getAll: async () => (await api.get<DisasterAlert[]>('/disasters/alerts/all')).data,
  create: async (payload: AlertPayload) =>
    (await api.post<DisasterAlert>('/disasters/alerts', payload)).data,
  update: async (id: string, payload: AlertPayload) =>
    (await api.put<DisasterAlert>(`/disasters/alerts/${id}`, payload)).data,
  deactivate: async (id: string) =>
    (await api.post<DisasterAlert>(`/disasters/alerts/${id}/deactivate`)).data,
  activate: async (id: string) =>
    (await api.post<DisasterAlert>(`/disasters/alerts/${id}/activate`)).data,
}
