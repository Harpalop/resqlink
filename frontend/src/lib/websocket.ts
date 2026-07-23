import { Client, type IMessage } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { tokenStorage } from '@/lib/storage'

let stompClient: Client | null = null

export type WsConnectionState = 'connecting' | 'connected' | 'disconnected'

type WsCallbacks = {
  onConnect: () => void
  onDisconnect: () => void
  onError: (error: unknown) => void
}

/**
 * Establish a STOMP-over-SockJS connection to the backend's WebSocket
 * endpoint. Passes the current JWT as an `Authorization` header during
 * the STOMP CONNECT handshake — the server validates it and sets the
 * authenticated principal for the session.
 *
 * The client auto-reconnects via `reconnectDelay` when the connection drops.
 * To force a reconnect (e.g. after token refresh), call `disconnectWs()`
 * followed by `connectWs(callbacks)`.
 */
export function connectWs(callbacks: WsCallbacks): Client {
  disconnectWs()

  const token = tokenStorage.getAccessToken()

  stompClient = new Client({
    webSocketFactory: () => new SockJS('/api/ws'),
    connectHeaders: token
      ? { Authorization: `Bearer ${token}` }
      : {},
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    onConnect: () => callbacks.onConnect(),
    onDisconnect: () => callbacks.onDisconnect(),
    onStompError: (frame) => callbacks.onError(frame),
    onWebSocketClose: () => callbacks.onDisconnect(),
  })

  stompClient.activate()
  return stompClient
}

/**
 * Gracefully disconnect the WebSocket. Safe to call multiple times.
 */
export function disconnectWs(): void {
  if (stompClient) {
    try {
      stompClient.deactivate()
    } catch {
      // ignore — client may already be disconnected
    }
    stompClient = null
  }
}

/**
 * Subscribe to a STOMP destination. Returns the subscription object
 * (call `.unsubscribe()` to remove it), or `null` if not connected.
 */
export function subscribeWs(
  destination: string,
  callback: (message: IMessage) => void,
) {
  if (stompClient?.connected) {
    return stompClient.subscribe(destination, callback)
  }
  return null
}

/**
 * Returns the STOMP client's current connection status.
 */
export function getWsState(): WsConnectionState {
  if (!stompClient) return 'disconnected'
  if (stompClient.connected) return 'connected'
  return 'connecting'
}
