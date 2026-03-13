import { type PropsWithChildren, useEffect, useState } from 'react'

import { Modal, Typography } from 'antd'

import {
  type PushClickPayload,
  ensurePushReady,
  subscribeToPushClicks,
} from 'shared/lib/push'

type PushProviderProps = PropsWithChildren

export function PushProvider({ children }: PushProviderProps) {
  const [activePayload, setActivePayload] = useState<PushClickPayload | null>(
    null,
  )

  const [payload, setPayload] = useState<PushClickPayload | null>(null)

  useEffect(() => {
    let unsubscribed = false
    let unsubscribe = () => undefined

    // 1. Subscribe FIRST — registers the click listener on the OneSignal
    //    facade *before* init(), so replayed pending clicks are caught.
    void subscribeToPushClicks((payload) => {
      console.log('Received push click payload', payload)
      setPayload(payload)
      if (!unsubscribed) {
        setActivePayload(payload)
      }
    })
      .then((dispose) => {
        unsubscribe = dispose
        // 2. Now trigger SDK init (idempotent); listener is already in place.
        return ensurePushReady()
      })
      .catch(() => undefined)

    return () => {
      unsubscribed = true
      unsubscribe()
    }
  }, [])

  function handleClose() {
    setActivePayload(null)
  }

  return (
    <>
      {JSON.stringify(payload, null, 2)}
      {children}

      <Modal
        // destroyOnHidden

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
