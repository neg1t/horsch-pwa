import type {
  IInitObject,
  IOneSignalOneSignal,
  NotificationClickEvent,
} from 'react-onesignal'

import { AppRoutes, ONESIGNAL_APP_ID } from 'shared/config'

export type PushConfig = {
  appId: string
}

export type PushClickPayload = {
  type: string
  entityId: string
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

let modulePromise: Promise<IOneSignalOneSignal> | null = null
let initPromise: Promise<IOneSignalOneSignal> | null = null

export function getPushConfig(env?: {
  VITE_ONESIGNAL_APP_ID?: string | null
}): PushConfig | null {
  const appId = (env?.VITE_ONESIGNAL_APP_ID ?? ONESIGNAL_APP_ID)?.trim()

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

  return url.toString()
}

export function getPushDemoPayload(): PushClickPayload {
  return {
    type: 'inspections',
    entityId: '42',
  }
}

export function parsePushClickPayload(
  additionalData: unknown,
): PushClickPayload | null {
  if (!additionalData || typeof additionalData !== 'object') {
    return null
  }

  const payload = additionalData as {
    entityId?: unknown
    type?: unknown
  }

  if (
    typeof payload.type !== 'string' ||
    payload.type.length === 0 ||
    typeof payload.entityId !== 'string' ||
    payload.entityId.length === 0
  ) {
    return null
  }

  return {
    type: payload.type,
    entityId: payload.entityId,
  }
}

function getOneSignalModule(): Promise<IOneSignalOneSignal> | null {
  if (typeof window === 'undefined') {
    return null
  }

  const config = getPushConfig()

  if (!config) {
    return null
  }

  if (!modulePromise) {
    modulePromise = import('react-onesignal').then(
      ({ default: oneSignal }) => oneSignal,
    )
  }

  return modulePromise
}

export async function loadOneSignalClient(): Promise<IOneSignalOneSignal | null> {
  const modPromise = getOneSignalModule()

  if (!modPromise) {
    return null
  }

  if (!initPromise) {
    const config = getPushConfig()

    if (!config) {
      return null
    }

    initPromise = modPromise.then(async (oneSignal) => {
      await oneSignal.init(createOneSignalInitOptions(config.appId))

      return oneSignal
    })
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

export async function ensurePushReady() {
  const oneSignal = await loadOneSignalClient()

  if (!oneSignal) {
    return defaultSnapshot
  }

  const isSupported = oneSignal.Notifications.isPushSupported()
  const permission = oneSignal.Notifications.permissionNative

  if (
    isSupported &&
    permission === 'granted' &&
    !oneSignal.User.PushSubscription.optedIn
  ) {
    await oneSignal.User.PushSubscription.optIn()
  }

  return readPushSnapshot()
}

// ── Early click buffer ──────────────────────────────────────
// We push a callback into window.OneSignalDeferred *synchronously*
// (no async import needed). The Web SDK drains the deferred queue
// in insertion order, so as long as this runs before init(), our
// listener is guaranteed to be registered on the SDK before pending
// click events are replayed.

type ClickCallback = (payload: PushClickPayload) => void

const earlyClickBuffer: PushClickPayload[] = []
let clickSubscriber: ClickCallback | null = null
let earlyListenerInstalled = false

function installEarlyClickListener() {
  if (earlyListenerInstalled) return
  if (typeof window === 'undefined') return
  if (!getPushConfig()) return

  earlyListenerInstalled = true

  // Ensure the deferred array exists (react-onesignal creates it on import,
  // but we may run before that import).
  window.OneSignalDeferred = window.OneSignalDeferred || []

  window.OneSignalDeferred.push((oneSignal) => {
    oneSignal.Notifications.addEventListener(
      'click',
      (event: NotificationClickEvent) => {
        console.log('[push] click event from SDK', event)

        const payload = parsePushClickPayload(event.notification.additionalData)

        if (!payload) return

        if (clickSubscriber) {
          clickSubscriber(payload)
        } else {
          // No subscriber yet — buffer for later delivery
          earlyClickBuffer.push(payload)
        }
      },
    )
  })
}

// Install as early as possible (module evaluation time).
installEarlyClickListener()

export function subscribeToPushClicks(onPayload: ClickCallback): () => void {
  clickSubscriber = onPayload

  // Flush anything that arrived before the subscriber was attached
  while (earlyClickBuffer.length > 0) {
    const buffered = earlyClickBuffer.shift()
    if (buffered) onPayload(buffered)
  }

  return () => {
    if (clickSubscriber === onPayload) {
      clickSubscriber = null
    }
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
