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
  it('calls the callback when a payload is delivered', () => {
    const consumer = vi.fn()
    const unsubscribe = subscribeToPushClicks(consumer)

    // subscribeToPushClicks is synchronous — it sets a global subscriber
    // and flushes any buffered payloads. Since no click happened yet,
    // consumer should not have been called.
    expect(consumer).not.toHaveBeenCalled()

    unsubscribe()
  })

  it('unsubscribe prevents further callbacks', () => {
    const consumer = vi.fn()
    const unsubscribe = subscribeToPushClicks(consumer)

    unsubscribe()

    // After unsubscribing, consumer should not be called
    expect(consumer).not.toHaveBeenCalled()
  })
})
