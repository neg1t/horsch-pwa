import { attach, createStore, sample } from 'effector'
import { createGate, useGate } from 'effector-react'
import { type NavigateFunction, useNavigate } from 'react-router-dom'

const RouterEffectsGate = createGate<{ navigate: NavigateFunction }>()

export function RouterEffects({ children }: React.PropsWithChildren) {
  useGate(RouterEffectsGate, { navigate: useNavigate() })
  return children
}

const $navigate = createStore<NavigateFunction | null>(null)
sample({
  clock: RouterEffectsGate.open,
  fn: (props) => props.navigate,
  target: $navigate,
})

export const navigateToFx = attach({
  source: $navigate,
  effect(navigate, to: string) {
    if (!navigate) {
      throw new Error('No init RouterEffects provider')
    }

    return navigate(to)
  },
})
