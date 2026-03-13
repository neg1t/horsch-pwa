const pushPayloadSearchParam = 'pushPayload'
const notificationClickMessageType = 'onesignal-notification-click'

function parsePushPayload(candidate) {
  if (!candidate || typeof candidate !== 'object') {
    return null
  }

  if (
    typeof candidate.type === 'string' &&
    candidate.type.length > 0 &&
    typeof candidate.entityId === 'string' &&
    candidate.entityId.length > 0
  ) {
    return {
      type: candidate.type,
      entityId: candidate.entityId,
    }
  }

  const nestedCandidates = [
    candidate.additionalData,
    candidate.data,
    candidate.custom,
    candidate.a,
  ]

  for (const nestedCandidate of nestedCandidates) {
    const payload = parsePushPayload(nestedCandidate)

    if (payload) {
      return payload
    }
  }

  return null
}

function resolveNotificationTargetUrl(notification) {
  const candidates = [
    notification?.launchURL,
    notification?.data?.launchURL,
    notification?.data?.url,
    notification?.data?.custom?.u,
    notification?.data?.custom?.a?.url,
  ]

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.length > 0) {
      return candidate
    }
  }

  return '/'
}

self.addEventListener('notificationclick', (event) => {
  const payload = parsePushPayload(event.notification)

  if (!payload) {
    return
  }

  event.stopImmediatePropagation()
  event.notification.close()
  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      })

      if (clientList.length > 0) {
        for (const client of clientList) {
          client.postMessage({
            type: notificationClickMessageType,
            payload,
          })
        }

        await clientList[0].focus()

        return
      }

      const targetUrl = new URL(
        resolveNotificationTargetUrl(event.notification),
        self.location.origin,
      )

      targetUrl.searchParams.set(
        pushPayloadSearchParam,
        JSON.stringify(payload),
      )

      await self.clients.openWindow(targetUrl.toString())
    })(),
  )
})

importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js')
