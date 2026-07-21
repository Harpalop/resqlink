import {
  Ambulance,
  CloudLightning,
  Flame,
  HeartPulse,
  ShieldAlert,
  Siren,
  type LucideIcon,
} from 'lucide-react'

export type EmergencyType =
  | 'MEDICAL'
  | 'ACCIDENT'
  | 'FIRE'
  | 'CRIME'
  | 'NATURAL_DISASTER'
  | 'OTHER'

export type EmergencyStatus = 'ACTIVE' | 'RESOLVED' | 'CANCELLED'

export interface EmergencyEvent {
  label: string
  detail: string | null
  createdAt: string
}

export interface Emergency {
  id: string
  reference: string
  type: EmergencyType
  status: EmergencyStatus
  latitude: number | null
  longitude: number | null
  accuracyMeters: number | null
  note: string | null
  events: EmergencyEvent[]
  createdAt: string
  closedAt: string | null
}

export interface TriggerPayload {
  type: EmergencyType
  latitude?: number
  longitude?: number
  accuracyMeters?: number
  note?: string
}

export interface EmergencyTypeMeta {
  value: EmergencyType
  label: string
  icon: LucideIcon
  gradient: string
}

export const EMERGENCY_TYPES: EmergencyTypeMeta[] = [
  { value: 'MEDICAL', label: 'Medical', icon: HeartPulse, gradient: 'from-rose-500 to-red-600' },
  { value: 'ACCIDENT', label: 'Accident', icon: Ambulance, gradient: 'from-amber-500 to-orange-600' },
  { value: 'FIRE', label: 'Fire', icon: Flame, gradient: 'from-orange-500 to-red-600' },
  { value: 'CRIME', label: 'Crime', icon: ShieldAlert, gradient: 'from-blue-500 to-indigo-600' },
  {
    value: 'NATURAL_DISASTER',
    label: 'Disaster',
    icon: CloudLightning,
    gradient: 'from-cyan-500 to-blue-600',
  },
  { value: 'OTHER', label: 'Other', icon: Siren, gradient: 'from-violet-500 to-fuchsia-600' },
]
