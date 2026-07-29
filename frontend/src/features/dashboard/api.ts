import { api } from '@/lib/api'
import type { DashboardStats } from '@/features/dashboard/types'

export interface TrendPoint {
  date: string
  count: number
}

export interface HourlyPoint {
  hour: number
  count: number
}

export interface TypePoint {
  type: string
  count: number
}

export interface AnalyticsSummary {
  users: number
  emergencies: number
  active: number
  resolved: number
  cancelled: number
}

export interface AnalyticsData {
  trend: TrendPoint[]
  hourly: HourlyPoint[]
  typeBreakdown: TypePoint[]
  summary: AnalyticsSummary
}

export const dashboardApi = {
  getStats: async () => {
    const { data } = await api.get<DashboardStats>('/dashboard/stats')
    return data
  },
  getAnalytics: async () => {
    const { data } = await api.get<AnalyticsData>('/dashboard/analytics')
    return data
  },
}
