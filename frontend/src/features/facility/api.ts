import { api } from '@/lib/api'

export const FACILITY_TYPES = [
  'HOSPITAL', 'POLICE_STATION', 'FIRE_STATION', 'AMBULANCE_SERVICE',
] as const

export type FacilityType = (typeof FACILITY_TYPES)[number]

export interface EmergencyFacility {
  id: string
  type: FacilityType
  name: string
  city: string
  address: string
  phone: string | null
  latitude: number
  longitude: number
  rating: number
  emergencyDept: boolean
  bloodBank: boolean
  open24x7: boolean
  services: string | null
  website: string | null
}

export const FACILITY_META: Record<FacilityType, {
  label: string; color: string; iconBg: string; dotColor: string
}> = {
  HOSPITAL: { label: 'Hospital', color: 'bg-blue-500', iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500', dotColor: 'bg-blue-500' },
  POLICE_STATION: { label: 'Police Station', color: 'bg-emerald-600', iconBg: 'bg-gradient-to-br from-emerald-500 to-green-600', dotColor: 'bg-emerald-500' },
  FIRE_STATION: { label: 'Fire Station', color: 'bg-red-600', iconBg: 'bg-gradient-to-br from-red-500 to-orange-600', dotColor: 'bg-red-500' },
  AMBULANCE_SERVICE: { label: 'Ambulance', color: 'bg-orange-500', iconBg: 'bg-gradient-to-br from-orange-400 to-red-500', dotColor: 'bg-orange-500' },
}

export const facilityApi = {
  search: async (params: { q?: string; types?: string }) =>
    (await api.get<EmergencyFacility[]>('/facilities', { params })).data,
  getById: async (id: string) =>
    (await api.get<EmergencyFacility>(`/facilities/${id}`)).data,
}
