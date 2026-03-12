import React from 'react'

import { Button, Input } from 'antd'

import './errorBoundary.scss'

interface ErrorBoundaryProps {
  onGoBack(): void
  children: React.ReactNode
  onCopy?(): void
}

interface ErrorBoundaryState {
  error: string
  hasError: boolean
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { error: '', hasError: false }
    // this.handleUnhandledRejection = this.handleUnhandledRejection.bind(this)
    this.handleErrorEvent = this.handleErrorEvent.bind(this)
  }

  // handleUnhandledRejection(event: PromiseRejectionEvent) {
  //   event.preventDefault()
  //   const errorMessage = getErrorMessage(event)
  //   this.setState({ hasError: true, error: errorMessage })
  // }

  handleErrorEvent(event: ErrorEvent) {
    const errorMessage = getErrorMessage(event)
    this.setState({ hasError: true, error: errorMessage })
  }

  componentDidMount() {
    // window.addEventListener('unhandledrejection', this.handleUnhandledRejection)
    window.addEventListener('error', this.handleErrorEvent.bind(this))
  }

  componentWillUnmount() {
    // window.removeEventListener(
    //   'unhandledrejection',
    //   this.handleUnhandledRejection,
    // )
    window.removeEventListener('error', this.handleErrorEvent.bind(this))
  }

  static getDerivedStateFromError(error: unknown) {
    const errorMessage = getErrorMessage(error)
    return { hasError: true, error: errorMessage }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Ой. Что-то пошло не так ☹</h2>
          <p className="text text--note fz-20">
            Отправьте этот текст в техническую поддержку
          </p>
          <Input
            readOnly
            onCopy={this.props.onCopy}
            name="errorBoundary"
            type="textarea"
            value={this.state.error}
          />

          <div className="spacer-3" />

          <Button onClick={this.props.onGoBack} className="d-flex center">
            Вернуться назад
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}

// Здесь специально any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getErrorMessage(error: any) {
  let errorMessage = `Current page: ${error?.currentTarget?.location?.href}\n`

  if (error?.reason) {
    errorMessage += JSON.stringify(error?.reason)
  } else if (error?.error instanceof Error) {
    errorMessage += String(error?.error.stack)
  } else {
    errorMessage += String(error?.stack)
  }

  return errorMessage
}
