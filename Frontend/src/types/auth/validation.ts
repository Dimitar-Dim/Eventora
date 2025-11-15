export interface IValidationError {
  field: string
  message: string
}

export interface IAuthError {
  message: string
  errors?: Record<string, string>
  status?: number
}

export interface ITokenPayload {
  name?: string
  email?: string
  [key: string]: unknown
}
