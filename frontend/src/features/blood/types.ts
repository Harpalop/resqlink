export type Urgency = 'CRITICAL' | 'URGENT' | 'NORMAL'
export type RequestStatus = 'OPEN' | 'FULFILLED' | 'CLOSED'

export interface Donor {
  id: string
  name: string
  bloodGroup: string
  city: string
  available: boolean
  lastDonationDate: string | null
  donationCount: number
  eligibleToDonate: boolean
}

export interface DonorPayload {
  bloodGroup: string
  city: string
  available?: boolean
  lastDonationDate?: string | null
}

export interface BloodRequest {
  id: string
  bloodGroup: string
  units: number
  urgency: Urgency
  status: RequestStatus
  hospitalName: string
  city: string
  patientName: string | null
  contactPhone: string | null
  note: string | null
  requesterName: string
  mine: boolean
  createdAt: string
}

export interface BloodRequestPayload {
  bloodGroup: string
  units: number
  urgency: Urgency
  hospitalName: string
  city: string
  patientName?: string
  contactPhone?: string
  note?: string
}

export const URGENCY_META: Record<Urgency, { label: string; badge: 'emergency' | 'primary' | 'default' }> = {
  CRITICAL: { label: 'Critical', badge: 'emergency' },
  URGENT: { label: 'Urgent', badge: 'primary' },
  NORMAL: { label: 'Normal', badge: 'default' },
}
