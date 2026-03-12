import Axios from 'axios'

export function createApiClient(baseURL: string) {
  return Axios.create({
    baseURL,
    timeout: 120000,
  })
}
