/// <reference types="vite/client" />

type URLString = `http://${string}` | `https://${string}`

interface ImportMetaEnv {
  VITE_API_ROOT: URLString
  VITE_NODE_ENV: 'development' | 'stage' | 'production'
  VITE_AUTH_URL: URLString
  VITE_CLIENT_ID: string
  VITE_REDIRECT_URI: URLString
  VITE_SCOPE: string
}
