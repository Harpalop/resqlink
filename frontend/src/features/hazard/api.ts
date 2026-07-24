import { api } from '@/lib/api'

export const HAZARD_TYPES = [
  'BLOCKED_ROAD', 'FIRE', 'FLOODED', 'STRUCTURAL_DAMAGE',
  'DOWNED_TREE', 'POWER_LINE', 'GAS_LEAK', 'STRANDED_PERSON',
  'VEHICLE_ACCIDENT', 'HAZARDOUS_MATERIAL', 'OTHER',
] as const

export const HAZARD_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const
export const HAZARD_STATUSES = ['ACTIVE', 'RESOLVED', 'DISMISSED'] as const

export type HazardType = (typeof HAZARD_TYPES)[number]
export type HazardSeverity = (typeof HAZARD_SEVERITIES)[number]
export type HazardStatus = (typeof HAZARD_STATUSES)[number]

export interface HazardReport {
  id: string
  reporterName: string
  type: HazardType
  severity: HazardSeverity
  title: string
  description: string | null
  latitude: number
  longitude: number
  status: HazardStatus
  createdAt: string
}

export interface ReportPayload {
  type: HazardType
  severity: HazardSeverity
  title: string
  description?: string | null
  latitude: number
  longitude: number
}

export const hazardApi = {
  getActive: async () => (await api.get<HazardReport[]>('/hazards/active')).data,
  getAll: async () => (await api.get<HazardReport[]>('/hazards/all')).data,
  report: async (payload: ReportPayload) =>
    (await api.post<HazardReport>('/hazards', payload)).data,
  resolve: async (id: string) =>
    (await api.put<HazardReport>(`/hazards/${id}/resolve`)).data,
  dismiss: async (id: string) =>
    (await api.put<HazardReport>(`/hazards/${id}/dismiss`)).data,
}
