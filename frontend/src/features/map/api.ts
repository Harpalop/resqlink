import { api } from '@/lib/api'

export interface FacilityPin {
  id: string
  name: string
  city: string
  phone: string | null
  type: 'HOSPITAL' | 'POLICE_STATION' | 'FIRE_STATION' | 'AMBULANCE_SERVICE'
  emergencyDept: boolean
  bloodBank: boolean
  open24x7: boolean
  rating: number
  latitude: number
  longitude: number
}

export interface EmergencyPin {
  id: string
  reference: string
  type: string
  latitude: number
  longitude: number
  createdAt: string
  mine: boolean
}

export interface MapOverview {
  facilities: FacilityPin[]
  emergencies: EmergencyPin[]
}

export const mapApi = {
  getOverview: async () => (await api.get<MapOverview>('/map/overview')).data,
}
