import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X } from 'lucide-react'
import { useAuth } from '@/features/auth/auth-context'
import { pushApi } from '@/features/push/api'
import { Button } from './button'
import { GlassCard } from './card'

/** Utility to convert Base64URL to Uint8Array required by pushManager */
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function PushPrompt() {
  const { user } = useAuth()
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if we should prompt the user
    if (!user || !('serviceWorker' in navigator) || !('PushManager' in window)) return

    if (Notification.permission === 'default') {
      // Delay showing the prompt slightly to not overwhelm on login
      const timer = setTimeout(() => setShow(true), 3000)
      return () => clearTimeout(timer)
    } else if (Notification.permission === 'granted') {
      // If already granted, ensure we are subscribed silently
      subscribeToPush(true)
    }
  }, [user])

  const subscribeToPush = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      if (!silent) {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
          setShow(false)
          return
        }
      }

      const registration = await navigator.serviceWorker.ready
      let subscription = await registration.pushManager.getSubscription()

      if (!subscription) {
        const publicKey = await pushApi.getPublicKey()
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        })
      }

      await pushApi.subscribe(subscription)
      setShow(false)
    } catch (err) {
      console.error('Failed to subscribe to push notifications:', err)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="fixed bottom-6 left-6 right-6 z-50 mx-auto max-w-sm sm:left-auto sm:right-6"
        >
          <GlassCard className="relative overflow-hidden border-primary/20 bg-card/80 p-5 shadow-2xl backdrop-blur-xl">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
            <button
              onClick={() => setShow(false)}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-lg">
                <Bell className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold tracking-tight">Enable Notifications</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  Never miss critical SOS alerts and disaster warnings even when the app is closed.
                </p>
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    className="w-full bg-primary/10 text-primary hover:bg-primary/20"
                    onClick={() => subscribeToPush(false)}
                    disabled={loading}
                  >
                    {loading ? 'Enabling...' : 'Enable Now'}
                  </Button>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
