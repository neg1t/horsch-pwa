import type { IInitObject, IOneSignalOneSignal } from 'react-onesignal'

import { AppRoutes, ONESIGNAL_APP_ID } from 'shared/config'

export type PushConfig = {
  appId: string
}

export type PushSnapshot = {
  isConfigured: boolean
  isSupported: boolean
  permission: NotificationPermission | 'unknown' | 'unsupported'
  optedIn: boolean
  externalId: string | null
  onesignalId: string | null
  subscriptionId: string | null
}

const defaultSnapshot: PushSnapshot = {
  isConfigured: false,
  isSupported: false,
  permission: 'unknown',
  optedIn: false,
  externalId: null,
  onesignalId: null,
  subscriptionId: null,
}

let initPromise: Promise<IOneSignalOneSignal> | null = null

export function getPushConfig(): PushConfig | null {
  const appId = ONESIGNAL_APP_ID?.trim()

  if (!appId) {
    return null
  }

  return { appId }
}

export function createOneSignalInitOptions(appId: string): IInitObject {
  return {
    appId,
    allowLocalhostAsSecureOrigin: true,
    autoRegister: false,
    notificationClickHandlerAction: 'navigate',
    notificationClickHandlerMatch: 'origin',
    persistNotification: true,
    serviceWorkerPath: '/OneSignalSDKWorker.js',
    serviceWorkerUpdaterPath: '/OneSignalSDKUpdaterWorker.js',
    welcomeNotification: {
      disable: true,
      message: '',
    },
  }
}

export function buildPushDemoUrl(origin: string): string {
  const url = new URL(AppRoutes.Profile.path, origin)

  url.searchParams.set('source', 'push')
  url.searchParams.set('orderId', '42')

  return url.toString()
}

export async function loadOneSignalClient(): Promise<IOneSignalOneSignal | null> {
  if (typeof window === 'undefined') {
    return null
  }

  const config = getPushConfig()

  if (!config) {
    return null
  }

  if (!initPromise) {
    initPromise = import('react-onesignal').then(
      async ({ default: oneSignal }) => {
        await oneSignal.init(createOneSignalInitOptions(config.appId))

        return oneSignal
      },
    )
  }

  return initPromise
}

export async function readPushSnapshot(): Promise<PushSnapshot> {
  const oneSignal = await loadOneSignalClient()

  if (!oneSignal) {
    return defaultSnapshot
  }

  return {
    isConfigured: true,
    isSupported: oneSignal.Notifications.isPushSupported(),
    permission: oneSignal.Notifications.permissionNative,
    optedIn: Boolean(oneSignal.User.PushSubscription.optedIn),
    externalId: oneSignal.User.externalId ?? null,
    onesignalId: oneSignal.User.onesignalId ?? null,
    subscriptionId: oneSignal.User.PushSubscription.id ?? null,
  }
}

export async function linkPushUser(params: {
  externalId: string
  role: string
}) {
  const oneSignal = await loadOneSignalClient()

  if (!oneSignal) {
    throw new Error('OneSignal is not configured')
  }

  await oneSignal.login(params.externalId)
  oneSignal.User.addTag('role', params.role)
}

export async function requestPushPermission() {
  const oneSignal = await loadOneSignalClient()

  if (!oneSignal) {
    throw new Error('OneSignal is not configured')
  }

  await oneSignal.Notifications.requestPermission()
  await oneSignal.User.PushSubscription.optIn()
}

export async function optOutPush() {
  const oneSignal = await loadOneSignalClient()

  if (!oneSignal) {
    throw new Error('OneSignal is not configured')
  }

  await oneSignal.User.PushSubscription.optOut()
}
