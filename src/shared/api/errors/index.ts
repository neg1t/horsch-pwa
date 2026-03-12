type ApiErrorData = {
  code: number
  message: string
  data?: unknown
}

export class ApiError extends Error {
  code
  data

  constructor(errorData: ApiErrorData) {
    super(errorData.message)
    this.name = 'ApiError'
    this.code = errorData.code
    this.data = errorData.data
  }
}

export class AuthError extends ApiError {
  constructor(message: string) {
    super({ code: 401, message: message })
    this.name = 'AuthError'
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string) {
    super({ code: 404, message: message })
    this.name = 'NotFoundError'
  }
}
