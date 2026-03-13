// @vitest-environment jsdom
import { act } from 'react'

import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { PushProvider } from './index'

type PushClickPayload = {
  type: string
  entityId: string
}

const pushMocks = vi.hoisted(() => {
  return {
    ensurePushReady: vi.fn(),
    subscribeToPushClicks: vi.fn(),
  }
})

vi.mock('shared/lib/push', () => {
  return {
    ensurePushReady: pushMocks.ensurePushReady,
    subscribeToPushClicks: pushMocks.subscribeToPushClicks,
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
  let clickListener: ((payload: PushClickPayload) => void) | null

  beforeEach(() => {
    ;(
      globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true

    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    clickListener = null

    pushMocks.ensurePushReady.mockResolvedValue(undefined)
    pushMocks.subscribeToPushClicks.mockImplementation((listener) => {
      clickListener = listener

      return Promise.resolve(vi.fn())
    })
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })

    container.remove()
    vi.clearAllMocks()
  })

  it('opens a modal after a valid push click payload', () => {
    act(() => {
      root.render(
        <PushProvider>
          <div>app</div>
        </PushProvider>,
      )
    })

    act(() => {
      clickListener?.({
        type: 'inspections',
        entityId: '123',
      })
    })

    expect(container.textContent).toContain('inspections')
    expect(container.textContent).toContain('123')
  })

  it('closes the modal when dismissed', () => {
    act(() => {
      root.render(
        <PushProvider>
          <div>app</div>
        </PushProvider>,
      )
    })

    act(() => {
      clickListener?.({
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
})
