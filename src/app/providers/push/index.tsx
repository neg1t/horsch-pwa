import { type PropsWithChildren, useEffect, useState } from 'react'

import { Modal, Typography } from 'antd'

import {
  type PushClickPayload,
  ensurePushReady,
  subscribeToPushPayloads,
} from 'shared/lib/push'

type PushProviderProps = PropsWithChildren

export function PushProvider({ children }: PushProviderProps) {
  const [activePayload, setActivePayload] = useState<PushClickPayload | null>(
    null,
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

  function handleClose() {
    setActivePayload(null)
  }

  return (
    <>
      {children}

      <Modal
        destroyOnHidden
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
