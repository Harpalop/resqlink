import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell, BellOff } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/auth-context'
import { chatApi } from '@/features/chat/api'
import { subscribeWs } from '@/lib/websocket'
import { Button } from '@/components/ui/button'

let globalNotificationsEnabled = localStorage.getItem('chat_notifications') !== 'false'

export function ChatNotificationToggle() {
  const [enabled, setEnabled] = useState(globalNotificationsEnabled)

  const toggle = () => {
    const next = !enabled
    globalNotificationsEnabled = next
    localStorage.setItem('chat_notifications', String(next))
    setEnabled(next)
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

  useEffect(() => {
    const handleToggle = () => {} 
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
        
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, startTime)
        
        filter.type = 'lowpass'
        filter.Q.setValueAtTime(1, startTime)
        filter.frequency.setValueAtTime(freq * 4, startTime)
        filter.frequency.exponentialRampToValueAtTime(freq, startTime + 0.1)
        
        gain.gain.setValueAtTime(0, startTime)
        gain.gain.linearRampToValueAtTime(vol, startTime + 0.002)
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25)
        
        osc.connect(filter)
        filter.connect(gain)
        gain.connect(ctx.destination)
        
        osc.start(startTime)
        osc.stop(startTime + 0.3)
      }

      playDiscordPluck(587.33, now, 0.4)          
      playDiscordPluck(880.00, now + 0.09, 0.5)   
    } catch (e) {}
  }

  const roomsQuery = useQuery({
    queryKey: ['chat', 'rooms'],
    queryFn: chatApi.getRooms,
    enabled: !!user,
  })

  const isLookingAtChatRoom = (roomId: string) => {
    return window.location.pathname === '/chat' && localStorage.getItem('last_active_chat_room') === roomId
  }

  useEffect(() => {
    if (!roomsQuery.data || !user) return

    const subs = roomsQuery.data.map(room => {
      return subscribeWs(`/topic/chat/${room.id}`, (msg: any) => {
        try {
          const payload = JSON.parse(msg.body)
          
          if (payload.eventType !== 'TYPING') {
            queryClient.invalidateQueries({ queryKey: ['chat', 'messages', room.id] })
            queryClient.invalidateQueries({ queryKey: ['chat', 'rooms'] })
            window.dispatchEvent(new CustomEvent('chat_message_received', { detail: { roomId: room.id } }))

            if (payload.senderId !== user.id && globalNotificationsEnabled) {
              if (!isLookingAtChatRoom(room.id) || document.hidden) {
                
                playPremiumNotificationSound()
                
                // Trigger Sonner premium toast
                toast.custom((t) => (
                  <div className="flex w-[340px] items-center gap-3 rounded-2xl bg-[#111827]/95 p-4 shadow-[0_8px_30px_rgba(37,99,235,0.3)] backdrop-blur-2xl border border-[#2563EB]/50 transition-all cursor-pointer hover:bg-[#1f2937]/95" onClick={() => toast.dismiss(t)}>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-white">
                      <span className="text-sm font-bold text-white uppercase">{payload.senderName.substring(0, 2)}</span>
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="text-sm font-semibold text-white">{payload.senderName}</p>
                      <p className="truncate text-xs text-[#94A3B8]">{payload.content}</p>
                    </div>
                  </div>
                ), { duration: 5000 })
              }
            }
          } else {
             window.dispatchEvent(new CustomEvent('chat_typing_received', { detail: payload }))
          }
        } catch (e) {}
      })
    })

    return () => subs.forEach(sub => sub?.unsubscribe())
  }, [roomsQuery.data, queryClient, user])

  return null
}
