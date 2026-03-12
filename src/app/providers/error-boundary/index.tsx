import React from 'react'

import { useNavigate } from 'react-router-dom'

import { ErrorBoundary } from 'shared/ui/ErrorBoundary'

export function ErrorBoundaryRedirect({ children }: React.PropsWithChildren) {
  const navigate = useNavigate()

  const onGoBackHandler = () => {
    void navigate('/')

    setTimeout(() => {
      window.location.reload()
    }, 300)
  }

  return <ErrorBoundary onGoBack={onGoBackHandler}>{children}</ErrorBoundary>
}
