import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { tokenStorage } from '@/lib/storage'

export const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

interface RetriableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableRequest | undefined
    const refreshToken = tokenStorage.getRefreshToken()

    const isAuthEndpoint = original?.url?.startsWith('/auth/')
    if (error.response?.status === 401 && original && !original._retry && refreshToken && !isAuthEndpoint) {
      original._retry = true
      try {
        const { data } = await axios.post<{ accessToken: string; refreshToken: string }>(
          '/api/v1/auth/refresh',
          { refreshToken },
        )
        tokenStorage.setTokens(data.accessToken, data.refreshToken)
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return api(original)
      } catch {
        tokenStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.') {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; errors?: Record<string, string> } | undefined
    if (data?.errors) {
      const first = Object.values(data.errors)[0]
      if (first) return first
    }
    if (data?.message) return data.message
    if (error.code === 'ERR_NETWORK') return 'Cannot reach the ResQLink server. Is the backend running?'
  }
  return fallback
}
