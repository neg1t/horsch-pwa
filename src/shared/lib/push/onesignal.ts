import type {
  IInitObject,
  IOSNotification,
  IOneSignalOneSignal,
  NotificationClickEvent,
  NotificationForegroundWillDisplayEvent,
} from 'react-onesignal'

import { AppRoutes, ONESIGNAL_APP_ID } from 'shared/config'

export type PushConfig = {
  appId: string
}

export type PushClickPayload = {
  type: string
  entityId: string
}

export const PUSH_PAYLOAD_SEARCH_PARAM = 'pushPayload'

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

function extractPushClickPayload(candidate: unknown): PushClickPayload | null {
  const payload = parsePushClickPayload(candidate)

  if (payload) {
    return payload
  }

  if (!candidate || typeof candidate !== 'object') {
    return null
  }

  const nested = candidate as {
    additionalData?: unknown
    custom?: unknown
    data?: unknown
  }

  return (
    parsePushClickPayload(nested.additionalData) ??
    parsePushClickPayload(nested.data) ??
    extractPushClickPayload(nested.custom) ??
    null
  )
}

export function parsePushClickPayloadFromSearch(
  search: string,
): PushClickPayload | null {
  const params = new URLSearchParams(search)
  const rawPayload = params.get(PUSH_PAYLOAD_SEARCH_PARAM)

  if (!rawPayload) {
    return null
  }

  try {
    return parsePushClickPayload(JSON.parse(rawPayload))
  } catch {
    return null
  }
}

export function stripPushClickPayloadFromSearch(search: string): string {
  const params = new URLSearchParams(search)

  params.delete(PUSH_PAYLOAD_SEARCH_PARAM)

  const nextSearch = params.toString()

  return nextSearch.length > 0 ? `?${nextSearch}` : ''
}

function getOneSignalModule(): Promise<IOneSignalOneSignal> | null {
  if (typeof window === 'undefined') {
    return null
  }

  if (!getPushConfig()) {
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

  const snapshot = await readPushSnapshot()

  console.log('[push] init ready', snapshot)

  return snapshot
}

function handlePushNotification(
  source: 'click' | 'foregroundWillDisplay',
  notification: IOSNotification,
  onPayload: (payload: PushClickPayload) => void,
) {
  console.log(`[push] ${source} notification`, notification)
  console.log(`[push] ${source} additionalData`, notification.additionalData)
  console.log(
    `[push] ${source} data`,
    (notification as IOSNotification & { data?: unknown }).data,
  )

  const payload = extractPushClickPayload(notification)

  if (!payload) {
    console.log(`[push] ${source} payload rejected`, notification)

    return false
  }

  console.log(`[push] ${source} payload accepted`, payload)
  onPayload(payload)

  return true
}

export async function subscribeToPushPayloads(
  onPayload: (payload: PushClickPayload) => void,
  loader: () => Promise<IOneSignalOneSignal | null> = loadOneSignalClient,
) {
  const oneSignal = await loader()

  if (!oneSignal) {
    return () => undefined
  }

  const foregroundListener = (
    event: NotificationForegroundWillDisplayEvent,
  ) => {
    handlePushNotification(
      'foregroundWillDisplay',
      event.notification,
      onPayload,
    )
  }

  const clickListener = (event: NotificationClickEvent) => {
    handlePushNotification('click', event.notification, onPayload)
  }

  oneSignal.Notifications.addEventListener(
    'foregroundWillDisplay',
    foregroundListener,
  )
  oneSignal.Notifications.addEventListener('click', clickListener)

  return () => {
    oneSignal.Notifications.removeEventListener(
      'foregroundWillDisplay',
      foregroundListener,
    )
    oneSignal.Notifications.removeEventListener('click', clickListener)
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
