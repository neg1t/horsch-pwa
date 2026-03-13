import { type PropsWithChildren, useEffect, useState } from 'react'

import { Modal, Typography } from 'antd'

import {
  type PushClickPayload,
  ensurePushReady,
  parsePushClickPayload,
  parsePushClickPayloadFromSearch,
  stripPushClickPayloadFromSearch,
  subscribeToPushPayloads,
} from 'shared/lib/push'

type PushProviderProps = PropsWithChildren
const oneSignalNotificationClickMessageType = 'onesignal-notification-click'

function readStartupPayload(): PushClickPayload | null {
  if (typeof window === 'undefined') {
    return null
  }

  const payload = parsePushClickPayloadFromSearch(window.location.search)

  if (!payload) {
    return null
  }

  const nextSearch = stripPushClickPayloadFromSearch(window.location.search)
  const nextUrl = `${window.location.pathname}${nextSearch}${window.location.hash}`

  window.history.replaceState(window.history.state, '', nextUrl)

  return payload
}

export function PushProvider({ children }: PushProviderProps) {
  const [activePayload, setActivePayload] = useState<PushClickPayload | null>(
    () => readStartupPayload(),
  )

  useEffect(() => {
    let unsubscribed = false
    let unsubscribe = () => undefined

    void subscribeToPushPayloads((payload) => {
      console.log('[push] received payload', payload)

      if (!unsubscribed) {
        setActivePayload(payload)
      }
    })
      .then((dispose) => {
        if (unsubscribed) {
          dispose()

          return
        }

        unsubscribe = dispose
      })
      .catch((err: unknown) =>
        console.warn('[push] subscribeToPushPayloads failed', err),
      )

    void ensurePushReady().catch((err: unknown) =>
      console.warn('[push] ensurePushReady failed', err),
    )

    return () => {
      unsubscribed = true
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (
      typeof navigator === 'undefined' ||
      typeof navigator.serviceWorker?.addEventListener !== 'function'
    ) {
      return
    }

    const handleMessage = (event: MessageEvent<unknown>) => {
      const payload = parsePushClickPayload(
        (event.data as { payload?: unknown; type?: unknown })?.payload,
      )

      if (
        !payload ||
        (event.data as { type?: unknown } | null)?.type !==
          oneSignalNotificationClickMessageType
      ) {
        return
      }

      console.log('[push] received payload from service worker', payload)
      setActivePayload(payload)
    }

    navigator.serviceWorker.addEventListener('message', handleMessage)

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage)
    }
  }, [])

  function handleClose() {
    setActivePayload(null)
  }

  return (
    <>
      {children}

      <Modal
        footer={null}
        onCancel={handleClose}
        onOk={handleClose}
        open={Boolean(activePayload)}
        title="Push payload received"
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Typography.Text className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[#7c7369]">
              Type
            </Typography.Text>
            <Typography.Text>{activePayload?.type ?? ''}</Typography.Text>
          </div>

          <div className="flex flex-col gap-1">
            <Typography.Text className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[#7c7369]">
              Entity ID
            </Typography.Text>
            <Typography.Text>{activePayload?.entityId ?? ''}</Typography.Text>
          </div>
        </div>
      </Modal>
    </>
  )
}
