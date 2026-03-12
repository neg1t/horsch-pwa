import { type Scope } from 'effector'
import { Provider } from 'effector-react'
import { BrowserRouter } from 'react-router-dom'

import { RouterEffects } from 'shared/lib/router-effects'

import './init'
import { ErrorBoundaryRedirect } from './providers/error-boundary'
import { ThemeProvider } from './providers/theme'
import { Router } from './router'
import './styles'

type AppProps = {
  scope: Scope
}
export const App = ({ scope }: AppProps) => {
  return (
    <Provider value={scope}>
      <ThemeProvider>
        <BrowserRouter>
          <RouterEffects>
            <ErrorBoundaryRedirect>
              <Router />
            </ErrorBoundaryRedirect>
          </RouterEffects>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  )
}
