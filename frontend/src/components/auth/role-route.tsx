import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/auth-context'
import type { Role } from '@/features/auth/types'

interface RoleRouteProps {
  allowedRoles: Role[]
  children?: React.ReactNode
}

export function RoleRoute({ allowedRoles, children }: RoleRouteProps) {
  const { user, status } = useAuth()

  if (status === 'loading') return null
  if (!user || !allowedRoles.includes(user.role as Role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children ? <>{children}</> : <Outlet />
}
