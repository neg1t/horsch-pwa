import type {
  NotificationClickEvent,
  NotificationForegroundWillDisplayEvent,
} from 'react-onesignal'
import { describe, expect, it, vi } from 'vitest'

import {
  createOneSignalInitOptions,
  getPushConfig,
  parsePushClickPayload,
  subscribeToPushPayloads,
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

describe('subscribeToPushPayloads', () => {
  function createNotification(additionalData: unknown) {
    return {
      notificationId: 'notification-1',
      body: 'Body',
      confirmDelivery: true,
      additionalData: additionalData as object | undefined,
      display: vi.fn(),
    }
  }

  function findListener(
    addEventListener: ReturnType<typeof vi.fn>,
    eventName: 'click' | 'foregroundWillDisplay',
  ) {
    return addEventListener.mock.calls.find(([name]) => name === eventName)?.[1]
  }

  it('forwards valid payloads from foreground notifications and prevents default', async () => {
    const consumer = vi.fn()
    const addEventListener = vi.fn()
    const removeEventListener = vi.fn()
    const oneSignal = {
      Notifications: {
        addEventListener,
        removeEventListener,
      },
    }

    const unsubscribe = await subscribeToPushPayloads(consumer, () =>
      Promise.resolve(oneSignal as never),
    )

    const preventDefault = vi.fn()
    const foregroundListener = findListener(
      addEventListener,
      'foregroundWillDisplay',
    ) as ((event: NotificationForegroundWillDisplayEvent) => void) | undefined

    foregroundListener?.({
      notification: createNotification({
        type: 'inspections',
        entityId: '123',
      }),
      preventDefault,
    })

    expect(consumer).toHaveBeenCalledWith({
      type: 'inspections',
      entityId: '123',
    })
    expect(preventDefault).toHaveBeenCalled()

    unsubscribe()

    expect(removeEventListener).toHaveBeenCalledWith(
      'foregroundWillDisplay',
      foregroundListener,
    )
  })

  it('ignores invalid foreground payloads and does not prevent default', async () => {
    const consumer = vi.fn()
    const addEventListener = vi.fn()
    const oneSignal = {
      Notifications: {
        addEventListener,
        removeEventListener: vi.fn(),
      },
    }

    await subscribeToPushPayloads(consumer, () =>
      Promise.resolve(oneSignal as never),
    )

    const preventDefault = vi.fn()
    const foregroundListener = findListener(
      addEventListener,
      'foregroundWillDisplay',
    ) as ((event: NotificationForegroundWillDisplayEvent) => void) | undefined

    foregroundListener?.({
      notification: createNotification({
        type: 'inspections',
      }),
      preventDefault,
    })

    expect(consumer).not.toHaveBeenCalled()
    expect(preventDefault).not.toHaveBeenCalled()
  })

  it('forwards valid payloads from click notifications', async () => {
    const consumer = vi.fn()
    const addEventListener = vi.fn()
    const removeEventListener = vi.fn()
    const oneSignal = {
      Notifications: {
        addEventListener,
        removeEventListener,
      },
    }

    const unsubscribe = await subscribeToPushPayloads(consumer, () =>
      Promise.resolve(oneSignal as never),
    )

    const clickListener = findListener(addEventListener, 'click') as
      | ((event: NotificationClickEvent) => void)
      | undefined

    clickListener?.({
      notification: createNotification({
        type: 'inspections',
        entityId: '123',
      }),
      result: {},
    })

    expect(consumer).toHaveBeenCalledWith({
      type: 'inspections',
      entityId: '123',
    })

    unsubscribe()

    expect(removeEventListener).toHaveBeenCalledWith('click', clickListener)
  })
})
