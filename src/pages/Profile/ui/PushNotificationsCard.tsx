import { useEffect, useState } from 'react'

import { Alert, Button, Card, Input, Select, Space, Typography } from 'antd'

import {
  buildPushDemoUrl,
  getPushConfig,
  getPushDemoPayload,
  linkPushUser,
  optOutPush,
  readPushSnapshot,
  requestPushPermission,
} from 'shared/lib/push'

type PushState = Awaited<ReturnType<typeof readPushSnapshot>>

const initialState: PushState = {
  // Use getPushConfig() synchronously so the UI never flashes
  // the "set env variable" warning when the config IS present.
  isConfigured: getPushConfig() !== null,
  isSupported: false,
  permission: 'unknown',
  optedIn: false,
  externalId: null,
  onesignalId: null,
  subscriptionId: null,
}

export function PushNotificationsCard() {
  const [state, setState] = useState<PushState>(initialState)
  const [externalId, setExternalId] = useState('field-user-1')
  const [role, setRole] = useState('field-worker')
  const [busy, setBusy] = useState(false)
  const [errorText, setErrorText] = useState<string | null>(null)
  const [demoUrl, setDemoUrl] = useState('')
  const [demoPayload, setDemoPayload] = useState('')

  useEffect(() => {
    let active = true

    const refresh = async () => {
      const snapshot = await readPushSnapshot()

      if (active) {
        setState(snapshot)
      }
    }

    if (typeof window !== 'undefined') {
      setDemoUrl(buildPushDemoUrl(window.location.origin))
      setDemoPayload(JSON.stringify(getPushDemoPayload()))
    }

    void refresh()

    return () => {
      active = false
    }
  }, [])

  async function run(action: () => Promise<void>) {
    setBusy(true)
    setErrorText(null)

    try {
      await action()
      setState(await readPushSnapshot())
    } catch (error) {
      setErrorText(
        error instanceof Error ? error.message : 'Unknown push error',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="rounded-[22px] border-[#e7e2dc] shadow-none">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Typography.Text className="text-[18px] font-semibold text-[#171411]">
            Push notifications
          </Typography.Text>
          <Typography.Text className="text-[14px] text-[#6f675f]">
            This screen links the current browser to OneSignal and lets you
            request notification permission manually.
          </Typography.Text>
        </div>

        {!state.isConfigured ? (
          <Alert
            message="Set VITE_ONESIGNAL_APP_ID in .env.local or Vercel to enable push setup."
            showIcon
            type="warning"
          />
        ) : null}

        {errorText ? <Alert message={errorText} showIcon type="error" /> : null}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Typography.Text className="text-[14px] font-semibold text-[#171411]">
              External user id
            </Typography.Text>
            <Input
              onChange={(event) => setExternalId(event.target.value)}
              value={externalId}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Typography.Text className="text-[14px] font-semibold text-[#171411]">
              Role tag
            </Typography.Text>
            <Select
              onChange={setRole}
              options={[
                { value: 'field-worker', label: 'field-worker' },
                { value: 'agronomist', label: 'agronomist' },
                { value: 'admin', label: 'admin' },
              ]}
              value={role}
            />
          </div>
        </div>

        <Space size={12} wrap>
          <Button
            disabled={!state.isConfigured}
            loading={busy}
            onClick={() => void run(() => linkPushUser({ externalId, role }))}
            type="primary"
          >
            Link browser
          </Button>

          <Button
            disabled={!state.isConfigured}
            loading={busy}
            onClick={() => void run(requestPushPermission)}
          >
            Request permission
          </Button>

          <Button
            danger
            disabled={!state.isConfigured}
            loading={busy}
            onClick={() => void run(optOutPush)}
          >
            Opt out
          </Button>
        </Space>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <StatusField
            label="Push supported"
            value={state.isSupported ? 'Yes' : 'No'}
          />
          <StatusField label="Permission" value={state.permission} />
          <StatusField label="Opted in" value={state.optedIn ? 'Yes' : 'No'} />
          <StatusField
            label="External id"
            value={state.externalId ?? 'Not linked'}
          />
          <StatusField
            label="OneSignal user id"
            value={state.onesignalId ?? 'Unknown'}
          />
          <StatusField
            label="Subscription id"
            value={state.subscriptionId ?? 'Unknown'}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Typography.Text className="text-[14px] font-semibold text-[#171411]">
            Launch URL for push click test
          </Typography.Text>
          <Input readOnly value={demoUrl || '/profile'} />
        </div>

        <div className="flex flex-col gap-1">
          <Typography.Text className="text-[14px] font-semibold text-[#171411]">
            additionalData payload example
          </Typography.Text>
          <Input
            readOnly
            value={demoPayload || '{"type":"inspections","entityId":"42"}'}
          />
        </div>
      </div>
    </Card>
  )
}

type StatusFieldProps = {
  label: string
  value: string
}

function StatusField({ label, value }: StatusFieldProps) {
  return (
    <div className="flex flex-col gap-1 rounded-[18px] border border-[#ece6df] bg-[#fcfaf6] p-3">
      <Typography.Text className="text-[13px] font-semibold uppercase tracking-[0.04em] text-[#7c7369]">
        {label}
      </Typography.Text>
      <Typography.Text className="break-all text-[14px] text-[#171411]">
        {value}
      </Typography.Text>
    </div>
  )
}
