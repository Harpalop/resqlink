import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  Bell,
  Bot,
  CloudLightning,
  Cross,
  Droplets,
  LayoutDashboard,
  LogOut,
  Map,
  MapPin,
  Menu,
  MessageCircle,
  ScanLine,
  ShieldCheck,
  Siren,
  Trophy,
  UserRound,
  Users,
  Video,
  X,
  type LucideIcon,
} from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { GradientOrbs } from '@/components/effects/gradient-orbs'
import { useAuth } from '@/features/auth/auth-context'
import type { Role } from '@/features/auth/types'
import { api } from '@/lib/api'
import { cn, getInitials } from '@/lib/utils'
import { GlobalChatListener, ChatNotificationToggle } from '@/components/layout/global-chat-listener'
import { UserSettingsModal } from '@/components/ui/user-settings-modal'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  soon?: boolean
  roles?: Role[]
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/sos', label: 'Smart SOS', icon: Siren },
  { to: '/assistant', label: 'AI Assistant', icon: Bot },
  { to: '/medical-id', label: 'Medical ID', icon: ScanLine },
  { to: '/profile', label: 'Profile', icon: UserRound },
  { to: '/contacts', label: 'Contacts', icon: Users },
  { to: '/blood', label: 'Blood Network', icon: Droplets, roles: ['CITIZEN', 'VOLUNTEER', 'NGO'] },
  { to: '/telemedicine', label: 'Telemedicine', icon: Video, roles: ['DOCTOR', 'NURSE', 'CITIZEN'] },
  { to: '/first-aid', label: 'First Aid', icon: Cross },
  { to: '/facilities', label: 'Emergency Services', icon: Cross },
  { to: '/map', label: 'Live Map', icon: Map },
  { to: '/hazards', label: 'Hazard Reports', icon: MapPin },
  { to: '/family', label: 'Family Safety', icon: ShieldCheck, roles: ['CITIZEN'] },
  { to: '/alerts', label: 'Disaster Alerts', icon: CloudLightning },
  { to: '/chat', label: 'Chat', icon: MessageCircle },
  { to: '/achievements', label: 'Achievements', icon: Trophy },
  { to: '/admin', label: 'Admin', icon: ShieldCheck, roles: ['ADMIN'] },
]

function NotificationBell() {
  const unreadQuery = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: async () => (await api.get<{ unread: number }>('/notifications/unread-count')).data,
    retry: 1,
  })
  const unread = unreadQuery.data?.unread ?? 0

  return (
    <Link
      to="/notifications"
      aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ''}`}
      className="relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-muted"
    >
      <Bell className="h-[18px] w-[18px]" />
      {unread > 0 && (
        <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emergency px-1 text-[9px] font-bold text-white">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </Link>
  )
}

function NavLinks({ onNavigate, user }: { onNavigate?: () => void; user: { role: string } | null }) {
  const role = user?.role as import('@/features/auth/types').Role | undefined
  const items = NAV_ITEMS.filter((item) => !item.roles || (role && item.roles.includes(role)))
  return (
    <nav className="flex flex-col gap-1">
      {items.map(({ to, label, icon: Icon, soon }) =>
        soon ? (
          <span
            key={to}
            className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted-foreground/50"
          >
            <Icon className="h-[18px] w-[18px]" />
            {label}
            <Badge className="ml-auto px-2 py-0 text-[9px]">SOON</Badge>
          </span>
        ) : (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-xl border border-primary/25 bg-primary/10"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon className={cn('relative h-[18px] w-[18px]', isActive && 'text-primary')} />
                <span className="relative">{label}</span>
              </>
            )}
          </NavLink>
        ),
      )}
    </nav>
  )
}



export function AppShell() {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  // Role-based nav filtering is handled inside NavLinks via item.roles

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="relative min-h-screen">
      <GradientOrbs className="opacity-50" />
      <GlobalChatListener />

      {/* Desktop sidebar */}
      <aside className="glass-panel fixed inset-y-0 left-0 z-40 hidden w-64 flex-col overflow-y-auto border-y-0 border-l-0 p-5 lg:flex">
        <Logo className="mb-8 px-1" />
        <NavLinks user={user} />
        <div className="mt-auto space-y-3">
          <div 
            onClick={() => setSettingsModalOpen(true)}
            className="glass-panel flex items-center gap-3 rounded-xl p-3 cursor-pointer hover:bg-white/[0.05] transition-colors"
          >
            <div className="relative h-9 w-9 shrink-0 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-violet-500 border border-white/10 shadow-sm">
              {user?.profilePictureUrl ? (
                <img src={user.profilePictureUrl} alt={user.fullName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-white">
                  {user ? getInitials(user.fullName) : '?'}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user?.fullName}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <ChatNotificationToggle />
              <NotificationBell />
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-muted-foreground">
              <LogOut className="h-4 w-4" /> Log out
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="glass-panel sticky top-0 z-40 flex h-16 items-center justify-between border-x-0 border-t-0 px-5 lg:hidden">
        <Logo />
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <ChatNotificationToggle />
          <NotificationBell />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-panel fixed inset-x-0 top-16 z-40 overflow-hidden border-x-0 lg:hidden"
          >
            <div className="space-y-3 p-4">
              <NavLinks onNavigate={() => setMobileOpen(false)} user={user} />
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full gap-2"
              >
                <LogOut className="h-4 w-4" /> Log out
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative px-5 py-8 md:px-8 lg:ml-64 lg:py-10">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>

      <UserSettingsModal 
        isOpen={settingsModalOpen} 
        onClose={() => setSettingsModalOpen(false)} 
        user={user} 
        updateUser={updateUser}
        onLogout={handleLogout}
      />
    </div>
  )
}
