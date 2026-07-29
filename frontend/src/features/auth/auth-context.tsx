import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { authApi } from '@/features/auth/api'
import type { AuthResponse, User } from '@/features/auth/types'
import { tokenStorage } from '@/lib/storage'

type AuthStatus = 'loading' | 'authenticated' | 'guest'

interface AuthContextValue {
  user: User | null
  status: AuthStatus
  applyAuth: (response: AuthResponse) => void
  updateUser: (user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  useEffect(() => {
    let cancelled = false

    const bootstrap = async () => {
      if (!tokenStorage.getAccessToken()) {
        setStatus('guest')
        return
      }
      try {
        const profile = await authApi.me()
        if (!cancelled) {
          setUser(profile)
          setStatus('authenticated')
        }
      } catch {
        if (!cancelled) {
          tokenStorage.clear()
          setStatus('guest')
        }
      }
    }

    void bootstrap()
    return () => {
      cancelled = true
    }
  }, [])

  const applyAuth = useCallback((response: AuthResponse) => {
    tokenStorage.setTokens(response.accessToken, response.refreshToken)
    setUser(response.user)
    setStatus('authenticated')
  }, [])

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser)
  }, [])

  const logout = useCallback(() => {
    tokenStorage.clear()
    setUser(null)
    setStatus('guest')
  }, [])

  const value = useMemo(
    () => ({ user, status, applyAuth, updateUser, logout }),
    [user, status, applyAuth, updateUser, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
