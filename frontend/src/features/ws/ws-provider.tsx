import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/auth-context'
import { connectWs, disconnectWs, subscribeWs, getWsState, type WsConnectionState } from '@/lib/websocket'

interface WsContextValue {
  status: WsConnectionState
}

const WsContext = createContext<WsContextValue>({ status: 'disconnected' })

/**
 * Subscribes the current user's notification and emergency personal queues,
 * plus shared topics (disaster alerts, admin emergency broadcasts).
 *
 * Renders nothing — it is a side-effect-only component that lives inside
 * the real-time provider so its subscriptions are active for the whole app.
 */
function WsSubscriptions() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'

  useEffect(() => {
    const subs: Array<{ unsubscribe: () => void }> = []

    const n = subscribeWs('/user/queue/notifications', () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] })
    })
    if (n) subs.push(n)

    const e = subscribeWs('/user/queue/emergency', () => {
      queryClient.invalidateQueries({ queryKey: ['sos'] })
    })
    if (e) subs.push(e)

    const d = subscribeWs('/topic/disasters', () => {
      queryClient.invalidateQueries({ queryKey: ['disasters'] })
    })
    if (d) subs.push(d)

    if (isAdmin) {
      const a = subscribeWs('/topic/emergencies', () => {
        queryClient.invalidateQueries({ queryKey: ['sos'] })
        queryClient.invalidateQueries({ queryKey: ['map', 'overview'] })
      })
      if (a) subs.push(a)
    }

    return () => subs.forEach((s) => s.unsubscribe())
  }, [queryClient, isAdmin])

  return null
}

/**
 * Manages the WebSocket STOMP connection lifecycle — connects when the
 * user is authenticated, disconnects on logout, and provides connection
 * status to children.
 *
 * Place this inside <AuthProvider> so useAuth() is available.
 */
export function WsProvider({ children }: { children: React.ReactNode }) {
  const { user, status: authStatus } = useAuth()
  const [wsStatus, setWsStatus] = useState<WsConnectionState>(getWsState())
  const connectedRef = useRef(false)

  const handleConnect = useCallback(() => {
    connectedRef.current = true
    setWsStatus('connected')
  }, [])

  const handleDisconnect = useCallback(() => {
    connectedRef.current = false
    setWsStatus('disconnected')
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
      onConnect: handleConnect,
      onDisconnect: handleDisconnect,
      onError: () => handleDisconnect(),
    })

    return () => {
      disconnectWs()
      connectedRef.current = false
      setWsStatus('disconnected')
    }
  }, [user, authStatus, handleConnect, handleDisconnect])

  return (
    <WsContext.Provider value={{ status: wsStatus }}>
      {children}
      {authStatus === 'authenticated' && <WsSubscriptions />}
    </WsContext.Provider>
  )
}

export function useWsStatus() {
  return useContext(WsContext).status
}
