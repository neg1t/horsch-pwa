import { attach, createEvent, createStore, sample, scopeBind } from 'effector'
import { jwtDecode } from 'jwt-decode'
import type { User, UserManager } from 'oidc-client-ts'
import { debug } from 'patronum'

import { $accessToken, apiApiRequestError } from 'shared/api'
import { AuthError } from 'shared/api'
import { AUTH_URL, CLIENT_ID, REDIRECT_URI, SCOPE } from 'shared/config'

import { createUserManager } from '../lib/user-manager'

export interface ITokenData {
  nbf: number
  exp: number
  iss: string
  name: string
  aud: string[]
  client_id: string
  sub: string
  auth_time: number
  idp: 'local'
  scope: string[]
}

export const logout = createEvent()
export const userReceived = createEvent<User>()
const silentUpdateError = createEvent<Error>()

const $manager = createStore<UserManager>(
  createUserManager({
    authority: AUTH_URL,
    clientId: CLIENT_ID,
    redirectUri: REDIRECT_URI,
    scope: SCOPE,
  }),
)

export const $tokenData = $accessToken.map((x) => x)

export const initUserManagerFx = attach({
  source: $manager,
  effect: (manager) => {
    const userReceivedScope = scopeBind(userReceived)
    const silentUpdateErrorScope = scopeBind(silentUpdateError)
    manager.events.addUserLoaded((user) => userReceivedScope(user))
    manager.events.addSilentRenewError((error) => silentUpdateErrorScope(error))
  },
})

export const aquireUser = attach({
  source: $manager,
  effect: async (manager, search: string) => {
    let data = await manager.getUser()

    if (data == null && search !== '') {
      data = await manager.signinRedirectCallback(search)
    }

    if (data === null) throw new Error('Failed to load user')
    return data
  },
})

const signoutUser = attach({
  source: $manager,
  effect: async (manager) => {
    await manager.signoutRedirect({
      post_logout_redirect_uri: REDIRECT_URI,
      redirectMethod: 'replace',
    })
    return manager.clearStaleState()
  },
})

const requestUser = attach({
  source: $manager,
  effect: (manager) => manager?.signinRedirect(),
})

sample({
  clock: [aquireUser.failData, silentUpdateError],
  target: requestUser,
})

sample({
  clock: [aquireUser.doneData, userReceived],
  fn: (user) => user.access_token,
  target: $accessToken,
})

sample({
  clock: logout,
  target: signoutUser,
})

sample({
  clock: apiApiRequestError,
  source: $accessToken,
  filter: (accessToken, error) =>
    error instanceof AuthError &&
    accessToken !== null &&
    accessToken.length > 0,
  target: logout,
})

//TODO убрать для прода
debug({ accessToken: $accessToken, token: $tokenData })
