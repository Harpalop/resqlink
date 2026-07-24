import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import LandingPage from '@/pages/landing'
import LoginPage from '@/pages/auth/login'
import RegisterPage from '@/pages/auth/register'
import ForgotPasswordPage from '@/pages/auth/forgot-password'
import DashboardPage from '@/pages/dashboard'
import ProfilePage from '@/pages/profile'
import MedicalIdPage from '@/pages/medical-id'
import PublicMedicalIdPage from '@/pages/medical-id/public'
import ContactsPage from '@/pages/contacts'
import SosPage from '@/pages/sos'
import BloodPage from '@/pages/blood'
import FirstAidPage from '@/pages/first-aid'
import HospitalsPage from '@/pages/hospitals'
import MapPage from '@/pages/map'
import FamilyPage from '@/pages/family'
import TelemedicinePage from '@/pages/telemedicine'
import AssistantPage from '@/pages/assistant'
import NotificationsPage from '@/pages/notifications'
import AlertsPage from '@/pages/alerts'
import AchievementsPage from '@/pages/achievements'
import AdminPage from '@/pages/admin'
import NotFoundPage from '@/pages/not-found'
import { ProtectedRoute } from '@/features/auth/protected-route'
import { AppShell } from '@/components/layout/app-shell'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/m/:token" element={<PublicMedicalIdPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/medical-id" element={<MedicalIdPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/sos" element={<SosPage />} />
            <Route path="/blood" element={<BloodPage />} />
            <Route path="/first-aid" element={<FirstAidPage />} />
            <Route path="/hospitals" element={<HospitalsPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/family" element={<FamilyPage />} />
            <Route path="/telemedicine" element={<TelemedicinePage />} />
            <Route path="/assistant" element={<AssistantPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}
