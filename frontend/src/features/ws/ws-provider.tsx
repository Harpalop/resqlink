import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/auth-context'
import { connectWs, disconnectWs, subscribeWs, getWsState, type WsConnectionState } from '@/lib/websocket'
import type { StompSubscription } from '@stomp/stompjs'

interface WsContextValue {
  status: WsConnectionState
}

const WsContext = createContext<WsContextValue>({ status: 'disconnected' })

/**
 * Manages the WebSocket STOMP connection lifecycle — connects when the
 * user is authenticated, subscribes after the STOMP handshake completes,
 * disconnects on logout, and provides connection status to children.
 */
export function WsProvider({ children }: { children: React.ReactNode }) {
  const { user, status: authStatus } = useAuth()
  const queryClient = useQueryClient()
  const [wsStatus, setWsStatus] = useState<WsConnectionState>(getWsState())
  const connectedRef = useRef(false)
  const subsRef = useRef<StompSubscription[]>([])

  const isAdmin = user?.role === 'ADMIN'

  // Clean up all subscriptions
  const cleanupSubs = useCallback(() => {
    subsRef.current.forEach((s) => {
      try { s.unsubscribe() } catch { /* already unsubscribed */ }
    })
    subsRef.current = []
  }, [])

  useEffect(() => {
    if (authStatus !== 'authenticated' || !user) {
      if (connectedRef.current) {
        disconnectWs()
        connectedRef.current = false
        setWsStatus('disconnected')
      }
      return
    }

    setWsStatus('connecting')
    connectWs({
      // Subscriptions are established AFTER the STOMP handshake completes,
      // not before — otherwise subscribeWs() returns null because the
      // client is not yet connected.
      onConnect: () => {
        connectedRef.current = true
        setWsStatus('connected')
        cleanupSubs()

        const qc = queryClient
        const n = subscribeWs('/user/queue/notifications', () => {
          qc.invalidateQueries({ queryKey: ['notifications'] })
          qc.invalidateQueries({ queryKey: ['notifications', 'unread'] })
        })
        if (n) subsRef.current.push(n)

        const e = subscribeWs('/user/queue/emergency', () => {
          qc.invalidateQueries({ queryKey: ['sos'] })
        })
        if (e) subsRef.current.push(e)

        const d = subscribeWs('/topic/disasters', () => {
          qc.invalidateQueries({ queryKey: ['disasters'] })
        })
        if (d) subsRef.current.push(d)

        if (isAdmin) {
          const a = subscribeWs('/topic/emergencies', () => {
            qc.invalidateQueries({ queryKey: ['sos'] })
            qc.invalidateQueries({ queryKey: ['map', 'overview'] })
          })
          if (a) subsRef.current.push(a)
        }
      },
      onDisconnect: () => {
        connectedRef.current = false
        setWsStatus('disconnected')
        cleanupSubs()
      },
      onError: () => {
        connectedRef.current = false
        setWsStatus('disconnected')
        cleanupSubs()
      },
    })

    return () => {
      cleanupSubs()
      disconnectWs()
      connectedRef.current = false
      setWsStatus('disconnected')
    }
  }, [user, authStatus, queryClient, isAdmin, cleanupSubs])

  return (
    <WsContext.Provider value={{ status: wsStatus }}>
      {children}
    </WsContext.Provider>
  )
}

export function useWsStatus() {
  return useContext(WsContext).status
}
