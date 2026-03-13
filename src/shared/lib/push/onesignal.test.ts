import type { NotificationClickEvent } from 'react-onesignal'
import { describe, expect, it, vi } from 'vitest'

import {
  createOneSignalInitOptions,
  getPushConfig,
  parsePushClickPayload,
  subscribeToPushClicks,
} from './onesignal'

describe('getPushConfig', () => {
  it('returns null when app id is missing', () => {
    expect(
      getPushConfig({
        VITE_ONESIGNAL_APP_ID: '',
      }),
    ).toBeNull()
  })

  it('returns configured app id when env is present', () => {
    expect(
      getPushConfig({
        VITE_ONESIGNAL_APP_ID: 'da892cbe-5bd2-49d7-8348-10975a9f543b',
      }),
    ).toEqual({
      appId: 'da892cbe-5bd2-49d7-8348-10975a9f543b',
    })
  })
})

describe('createOneSignalInitOptions', () => {
  it('builds browser-only init options for the vite pwa', () => {
    expect(createOneSignalInitOptions('app-id')).toMatchObject({
      appId: 'app-id',
      allowLocalhostAsSecureOrigin: true,
      autoRegister: false,
      notificationClickHandlerAction: 'navigate',
      notificationClickHandlerMatch: 'origin',
      persistNotification: true,
      serviceWorkerPath: '/OneSignalSDKWorker.js',
      serviceWorkerUpdaterPath: '/OneSignalSDKUpdaterWorker.js',
    })
  })
})

describe('parsePushClickPayload', () => {
  it('returns payload when type and entityId are present', () => {
    expect(
      parsePushClickPayload({
        type: 'inspections',
        entityId: '123',
      }),
    ).toEqual({
      type: 'inspections',
      entityId: '123',
    })
  })

  it('returns null when type is missing', () => {
    expect(
      parsePushClickPayload({
        entityId: '123',
      }),
    ).toBeNull()
  })

  it('returns null when entityId is missing', () => {
    expect(
      parsePushClickPayload({
        type: 'inspections',
      }),
    ).toBeNull()
  })

  it('returns null when payload fields are not strings', () => {
    expect(
      parsePushClickPayload({
        type: 'inspections',
        entityId: 123,
      }),
    ).toBeNull()
  })
})

describe('subscribeToPushClicks', () => {
  function createClickEvent(additionalData: unknown): NotificationClickEvent {
    return {
      notification: {
        notificationId: 'notification-1',
        body: 'Body',
        confirmDelivery: true,
        additionalData: additionalData as object | undefined,
      },
      result: {},
    }
  }

  it('forwards valid payloads from OneSignal click events', async () => {
    const consumer = vi.fn()
    const addEventListener = vi.fn()
    const removeEventListener = vi.fn()
    const oneSignal = {
      Notifications: {
        addEventListener,
        removeEventListener,
      },
    }

    const unsubscribe = await subscribeToPushClicks(consumer, () =>
      Promise.resolve(oneSignal as never),
    )

    const listener = addEventListener.mock.calls[0]?.[1] as
      | ((event: NotificationClickEvent) => void)
      | undefined

    expect(addEventListener).toHaveBeenCalledWith('click', expect.any(Function))

    listener?.(
      createClickEvent({
        type: 'inspections',
        entityId: '123',
      }),
    )

    expect(consumer).toHaveBeenCalledWith({
      type: 'inspections',
      entityId: '123',
    })

    unsubscribe()

    expect(removeEventListener).toHaveBeenCalledWith('click', listener)
  })

  it('ignores invalid payloads', async () => {
    const consumer = vi.fn()
    const addEventListener = vi.fn()
    const oneSignal = {
      Notifications: {
        addEventListener,
        removeEventListener: vi.fn(),
      },
    }

    await subscribeToPushClicks(consumer, () =>
      Promise.resolve(oneSignal as never),
    )

    const listener = addEventListener.mock.calls[0]?.[1] as
      | ((event: NotificationClickEvent) => void)
      | undefined

    listener?.(
      createClickEvent({
        type: 'inspections',
      }),
    )

    expect(consumer).not.toHaveBeenCalled()
  })
})
