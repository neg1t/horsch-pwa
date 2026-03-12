import { describe, expect, it } from 'vitest'

import {
  buildPushDemoUrl,
  createOneSignalInitOptions,
  getPushConfig,
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

describe('buildPushDemoUrl', () => {
  it('creates a profile deep link with push metadata', () => {
    expect(buildPushDemoUrl('https://demo.horsch.local')).toBe(
      'https://demo.horsch.local/profile?source=push&orderId=42',
    )
  })
})
