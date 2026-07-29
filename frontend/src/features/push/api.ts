import { api } from '@/lib/api'

export const pushApi = {
  getPublicKey: async () => {
    const { data } = await api.get<{ publicKey: string }>('/push/vapid-public-key')
    return data.publicKey
  },
  subscribe: async (subscription: PushSubscription) => {
    const sub = subscription.toJSON()
    await api.post('/push/subscribe', {
      endpoint: sub.endpoint,
      p256dh: sub.keys?.p256dh,
      auth: sub.keys?.auth,
    })
  },
}
