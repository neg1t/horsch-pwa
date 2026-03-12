import {
  type AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import {
  attach,
  createEffect,
  createEvent,
  createStore,
  sample,
  scopeBind,
} from 'effector'

import { API_ROOT } from 'shared/config/env-consts'

import { createApiClient } from '../../lib/create-api-client'
import { ApiError, AuthError, NotFoundError } from '../errors'
import { $accessToken } from './token'

export const $apiClient = createStore<AxiosInstance>(createApiClient(API_ROOT))
export const apiApiRequestError = createEvent<Error>()

const requestHandlerFx = attach({
  source: $accessToken,
  effect: (token, config: InternalAxiosRequestConfig) => ({
    ...config,
    withCredentials: true,
    headers: new AxiosHeaders({
      Authorization: `Bearer ${token}`,
    }),
  }),
})

const responseHandler = (response: AxiosResponse) => {
  return response.data
}

const errorHandlerFx = createEffect((error: AxiosError) => {
  const { response } = error
  if (response) {
    const isUnauthorized = response.status === 401
    if (isUnauthorized) {
      throw new AuthError(response.statusText)
    }
    const isNotFound = response.status === 404
    if (isNotFound) {
      throw new NotFoundError(response.statusText)
    }

    throw new ApiError({
      code: response.status,
      message: response.statusText,
      data: response.data,
    })
  }

  throw error
})

export const initApiClientFx = attach({
  source: $apiClient,
  effect: (instance) => {
    instance.interceptors.request.use(scopeBind(requestHandlerFx))
    instance.interceptors.response.use(
      responseHandler,
      scopeBind(errorHandlerFx),
    )
  },
})

sample({
  clock: errorHandlerFx.failData,
  target: apiApiRequestError,
})
