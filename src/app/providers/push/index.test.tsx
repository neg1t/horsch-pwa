// @vitest-environment jsdom
import { act } from 'react'

import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { PushProvider } from './index'

type PushClickPayload = {
  type: string
  entityId: string
}

const pushPayloadSearchParam = 'pushPayload'

const pushMocks = vi.hoisted(() => {
  return {
    ensurePushReady: vi.fn(),
    subscribeToPushPayloads: vi.fn(),
  }
})

vi.mock('shared/lib/push', async () => {
  const actual = await vi.importActual('shared/lib/push')

  return {
    ...actual,
    ensurePushReady: pushMocks.ensurePushReady,
    subscribeToPushPayloads: pushMocks.subscribeToPushPayloads,
  }
})

vi.mock('antd', () => {
  return {
    Modal: ({
      children,
      onCancel,
      open,
      title,
    }: {
      children: React.ReactNode
      onCancel?: () => void
      open?: boolean
      title?: React.ReactNode
    }) =>
      open ? (
        <div data-testid="modal">
          <div>{title}</div>
          <div>{children}</div>
          <button onClick={onCancel} type="button">
            close
          </button>
        </div>
      ) : null,
    Typography: {
      Text: ({ children }: { children: React.ReactNode }) => (
        <span>{children}</span>
      ),
    },
  }
})

describe('PushProvider', () => {
  let container: HTMLDivElement
  let root: ReturnType<typeof createRoot>
  let payloadListener: ((payload: PushClickPayload) => void) | null
  let serviceWorker: EventTarget

  beforeEach(() => {
    ;(
      globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true

    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    payloadListener = null
    serviceWorker = new EventTarget()
    window.history.replaceState({}, '', '/')
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: serviceWorker,
    })

    pushMocks.ensurePushReady.mockResolvedValue(undefined)
    pushMocks.subscribeToPushPayloads.mockImplementation((listener) => {
      payloadListener = listener

      return Promise.resolve(vi.fn())
    })
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })

    container.remove()
    window.history.replaceState({}, '', '/')
    vi.clearAllMocks()
  })

  it('opens a modal after a valid push payload', async () => {
    await act(async () => {
      root.render(
        <PushProvider>
          <div>app</div>
        </PushProvider>,
      )
      await Promise.resolve()
    })

    act(() => {
      payloadListener?.({
        type: 'inspections',
        entityId: '123',
      })
    })

    expect(container.textContent).toContain('inspections')
    expect(container.textContent).toContain('123')
  })

  it('closes the modal when dismissed', async () => {
    await act(async () => {
      root.render(
        <PushProvider>
          <div>app</div>
        </PushProvider>,
      )
      await Promise.resolve()
    })

    act(() => {
      payloadListener?.({
        type: 'inspections',
        entityId: '123',
      })
    })

    const button = container.querySelector('button')

    act(() => {
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(container.textContent).not.toContain('inspections')
    expect(container.textContent).not.toContain('123')
  })

  it('opens a modal from push payload stored in the URL and clears the one-shot param', async () => {
    const params = new URLSearchParams()
    params.set(
      pushPayloadSearchParam,
      JSON.stringify({
        type: 'inspections',
        entityId: '123',
      }),
    )
    window.history.replaceState({}, '', `/?${params.toString()}`)

    await act(async () => {
      root.render(
        <PushProvider>
          <div>app</div>
        </PushProvider>,
      )
      await Promise.resolve()
    })

    expect(container.textContent).toContain('inspections')
    expect(container.textContent).toContain('123')
    expect(window.location.search).toBe('')
  })

  it('opens a modal from the service worker click bridge', async () => {
    await act(async () => {
      root.render(
        <PushProvider>
          <div>app</div>
        </PushProvider>,
      )
      await Promise.resolve()
    })

    act(() => {
      serviceWorker.dispatchEvent(
        new MessageEvent('message', {
          data: {
            type: 'onesignal-notification-click',
            payload: {
              type: 'inspections',
              entityId: '123',
            },
          },
        }),
      )
    })

    expect(container.textContent).toContain('inspections')
    expect(container.textContent).toContain('123')
  })
})
