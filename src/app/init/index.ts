import { sample } from 'effector'

import { effects } from 'entities/auth'

import { initApiClientFx } from 'shared/api'
import { appStarted } from 'shared/lib/effector-utils'

sample({
  clock: appStarted,
  target: initApiClientFx,
})

sample({
  clock: appStarted,
  target: effects.initUserManagerFx,
})

sample({
  clock: appStarted,
  fn: () => window.location.search,
  target: effects.aquireUser,
})
