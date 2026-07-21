import { api } from '@/lib/api'
import type { DashboardStats } from '@/features/dashboard/types'

export const dashboardApi = {
  getStats: async () => {
    const { data } = await api.get<DashboardStats>('/dashboard/stats')
    return data
  },
}
