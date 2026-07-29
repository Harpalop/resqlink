import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell, BellOff } from 'lucide-react'
import { useAuth } from '@/features/auth/auth-context'
import { chatApi } from '@/features/chat/api'
import { subscribeWs } from '@/lib/websocket'
import { Button } from '@/components/ui/button'

// A small store/event-emitter for the toggle state across components if needed,
// but we'll just handle it internally and expose a toggle button component.
let globalNotificationsEnabled = localStorage.getItem('chat_notifications') !== 'false'

export function ChatNotificationToggle() {
  const [enabled, setEnabled] = useState(globalNotificationsEnabled)

  const toggle = () => {
    const next = !enabled
    globalNotificationsEnabled = next
    localStorage.setItem('chat_notifications', String(next))
    setEnabled(next)
    // Dispatch a custom event so the listener picks it up
    window.dispatchEvent(new Event('chat_notifications_changed'))
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggle}
      className="text-muted-foreground hover:bg-muted hover:text-foreground relative h-10 w-10 rounded-xl"
      title={enabled ? "Mute chat notifications" : "Enable chat notifications"}
    >
      {enabled ? <Bell className="h-[18px] w-[18px] text-blue-500" /> : <BellOff className="h-[18px] w-[18px] opacity-50" />}
      {enabled && (
        <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-blue-500" />
      )}
    </Button>
  )
}

export function GlobalChatListener() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [liveNotification, setLiveNotification] = useState<{ senderName: string, content: string } | null>(null)

  useEffect(() => {
    const handleToggle = () => {} // State is managed in globalNotificationsEnabled var
    window.addEventListener('chat_notifications_changed', handleToggle)
    return () => window.removeEventListener('chat_notifications_changed', handleToggle)
  }, [])

  const playPremiumNotificationSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const now = ctx.currentTime
      
      const playDiscordPluck = (freq: number, startTime: number, vol: number) => {
        const osc = ctx.createOscillator()
        const filter = ctx.createBiquadFilter()
        const gain = ctx.createGain()
        
        osc.type = 'triangle' // Triangle wave provides that distinct hollow synth-pluck sound
        osc.frequency.setValueAtTime(freq, startTime)
        
        // Lowpass filter envelope (starts bright, closes rapidly)
        filter.type = 'lowpass'
        filter.Q.setValueAtTime(1, startTime)
        filter.frequency.setValueAtTime(freq * 4, startTime)
        filter.frequency.exponentialRampToValueAtTime(freq, startTime + 0.1)
        
        // Amplitude envelope (extremely fast attack and decay like Discord)
        gain.gain.setValueAtTime(0, startTime)
        gain.gain.linearRampToValueAtTime(vol, startTime + 0.002)
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25)
        
        osc.connect(filter)
        filter.connect(gain)
        gain.connect(ctx.destination)
        
        osc.start(startTime)
        osc.stop(startTime + 0.3)
      }

      // Exact Discord-style timing and interval (approx D5 -> A5)
      playDiscordPluck(587.33, now, 0.4)          // D5
      playDiscordPluck(880.00, now + 0.09, 0.5)   // A5
    } catch (e) {
      // Audio context might be suspended
    }
  }

  const roomsQuery = useQuery({
    queryKey: ['chat', 'rooms'],
    queryFn: chatApi.getRooms,
    enabled: !!user,
  })

  // We need to know which room is currently ACTIVE in the UI to suppress toasts if we are looking at it.
  // We can check the URL!
  const isLookingAtChatRoom = (roomId: string) => {
    return window.location.pathname === '/chat' && localStorage.getItem('last_active_chat_room') === roomId
  }

  useEffect(() => {
    if (!roomsQuery.data || !user) return
    let toastTimer: ReturnType<typeof setTimeout>

    const subs = roomsQuery.data.map(room => {
      return subscribeWs(`/topic/chat/${room.id}`, (msg: any) => {
        try {
          const payload = JSON.parse(msg.body)
          
          if (payload.eventType !== 'TYPING') {
            // Invalidate queries so chat UI stays updated
            queryClient.invalidateQueries({ queryKey: ['chat', 'messages', room.id] })
            queryClient.invalidateQueries({ queryKey: ['chat', 'rooms'] })

            // Dispatch global event for chat/index.tsx to clear its own typing indicators
            window.dispatchEvent(new CustomEvent('chat_message_received', { detail: { roomId: room.id } }))

            // Only notify if it's not our own message and notifications are ON
            if (payload.senderId !== user.id && globalNotificationsEnabled) {
              // And only if we are NOT actively looking at this exact chat room in the UI right now
              if (!isLookingAtChatRoom(room.id) || document.hidden) {
                setLiveNotification({ senderName: payload.senderName, content: payload.content })
                playPremiumNotificationSound()
                
                clearTimeout(toastTimer)
                toastTimer = setTimeout(() => setLiveNotification(null), 4000)
              }
            }
          } else {
             // Dispatch global event for chat/index.tsx to show typing indicator
             window.dispatchEvent(new CustomEvent('chat_typing_received', { detail: payload }))
          }
        } catch (e) {}
      })
    })

    return () => {
      subs.forEach(sub => sub?.unsubscribe())
      clearTimeout(toastTimer)
    }
  }, [roomsQuery.data, queryClient, user])

  return (
    <AnimatePresence>
      {liveNotification && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="fixed top-6 right-6 z-[100] flex max-w-sm items-center gap-3 rounded-2xl bg-[#111827]/90 p-4 shadow-[0_8px_30px_rgba(37,99,235,0.3)] backdrop-blur-xl border border-[#2563EB]/50"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-white">
            <span className="text-sm font-bold text-white uppercase">{liveNotification.senderName.substring(0, 2)}</span>
          </div>
          <div className="flex-1 min-w-0 pr-2">
            <p className="text-sm font-semibold text-white">{liveNotification.senderName}</p>
            <p className="truncate text-xs text-[#94A3B8]">{liveNotification.content}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
