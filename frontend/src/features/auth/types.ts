export type Role =
  | 'CITIZEN'
  | 'DOCTOR'
  | 'NURSE'
  | 'HOSPITAL_ADMIN'
  | 'AMBULANCE_OPERATOR'
  | 'POLICE'
  | 'FIREFIGHTER'
  | 'NGO'
  | 'VOLUNTEER'
  | 'RESCUE_TEAM'
  | 'ADMIN'

export const SELF_REGISTER_ROLES: Role[] = [
  'CITIZEN',
  'DOCTOR',
  'NURSE',
  'VOLUNTEER',
  'NGO',
]

export const ROLE_META: Record<
  Role,
  { label: string; description: string; icon: string; gradient: string }
> = {
  CITIZEN: {
    label: 'Citizen',
    description: 'Access all public features, report hazards, and donate blood',
    icon: '👤',
    gradient: 'from-blue-500 to-cyan-500',
  },
  DOCTOR: {
    label: 'Doctor',
    description: 'Manage patient queues and telemedicine consultations',
    icon: '🩺',
    gradient: 'from-emerald-500 to-teal-500',
  },
  NURSE: {
    label: 'Nurse',
    description: 'Support patient care and medical record management',
    icon: '💊',
    gradient: 'from-pink-500 to-rose-500',
  },
  VOLUNTEER: {
    label: 'Volunteer',
    description: 'Join disaster relief and community safety initiatives',
    icon: '🤝',
    gradient: 'from-violet-500 to-purple-500',
  },
  NGO: {
    label: 'NGO',
    description: 'Organize and coordinate relief operations',
    icon: '🏛️',
    gradient: 'from-amber-500 to-orange-500',
  },
  HOSPITAL_ADMIN: {
    label: 'Hospital Admin',
    description: 'Manage hospital capacity and resources',
    icon: '🏥',
    gradient: 'from-red-500 to-rose-500',
  },
  AMBULANCE_OPERATOR: {
    label: 'Ambulance',
    description: 'Dispatch and track emergency vehicles',
    icon: '🚑',
    gradient: 'from-orange-500 to-red-500',
  },
  POLICE: {
    label: 'Police',
    description: 'Respond to emergencies and manage incidents',
    icon: '👮',
    gradient: 'from-indigo-500 to-blue-600',
  },
  FIREFIGHTER: {
    label: 'Firefighter',
    description: 'Fire response and rescue operations',
    icon: '🧑‍🚒',
    gradient: 'from-red-600 to-orange-500',
  },
  RESCUE_TEAM: {
    label: 'Rescue Team',
    description: 'Search and rescue mission coordination',
    icon: '🚨',
    gradient: 'from-red-500 to-pink-500',
  },
  ADMIN: {
    label: 'Admin',
    description: 'Full platform administration access',
    icon: '⚙️',
    gradient: 'from-slate-600 to-slate-800',
  },
}

export interface User {
  id: string
  fullName: string
  email: string
  phone: string | null
  role: Role
  createdAt: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  user: User
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  fullName: string
  email: string
  phone?: string
  password: string
  role?: Role
}
