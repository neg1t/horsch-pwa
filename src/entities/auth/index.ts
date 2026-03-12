import {
  $tokenData,
  aquireUser,
  initUserManagerFx,
  logout,
  userReceived,
} from './model'

export const stores = {
  $tokenData,
}

export const effects = {
  aquireUser,
  initUserManagerFx,
}

export const events = {
  userReceived,
  logout,
}
