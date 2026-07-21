export interface Profile {
  bloodGroup: string | null
  dateOfBirth: string | null
  gender: string | null
  heightCm: number | null
  weightKg: number | null
  allergies: string | null
  medicalConditions: string | null
  medications: string | null
  insuranceProvider: string | null
  insurancePolicyNumber: string | null
  organDonor: boolean
  medicalIdEnabled: boolean
  emergencyNotes: string | null
  publicToken: string
  completionPercent: number
  updatedAt: string
}

export interface ProfilePayload {
  bloodGroup?: string | null
  dateOfBirth?: string | null
  gender?: string | null
  heightCm?: number | null
  weightKg?: number | null
  allergies?: string | null
  medicalConditions?: string | null
  medications?: string | null
  insuranceProvider?: string | null
  insurancePolicyNumber?: string | null
  organDonor?: boolean
  medicalIdEnabled?: boolean
  emergencyNotes?: string | null
}

export interface EmergencyContact {
  id: string
  name: string
  phone: string
  relationship: string | null
  priority: number
}

export interface ContactPayload {
  name: string
  phone: string
  relationship?: string | null
  priority?: number
}

export interface PublicMedicalId {
  fullName: string
  age: number | null
  gender: string | null
  bloodGroup: string | null
  heightCm: number | null
  weightKg: number | null
  allergies: string | null
  medicalConditions: string | null
  medications: string | null
  organDonor: boolean
  emergencyNotes: string | null
  insuranceProvider: string | null
  insurancePolicyNumber: string | null
  emergencyContacts: Array<{
    name: string
    phone: string
    relationship: string | null
    priority: number
  }>
}

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const

export const RELATIONSHIPS = [
  'Parent',
  'Sibling',
  'Spouse',
  'Child',
  'Friend',
  'Relative',
  'Doctor',
  'Neighbor',
  'Other',
] as const
