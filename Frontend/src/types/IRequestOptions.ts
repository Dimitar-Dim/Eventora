export type RequestHeaders = Record<string, string>

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE"

export interface RequestConfig {
  body?: unknown
  requiresAuth?: boolean
  headers?: RequestHeaders
  formData?: FormData
  responseType?: "json" | "arraybuffer"
}

export interface ApiRequestParams {
  endpoint: string
  config?: RequestConfig
}

export interface ApiRequest {
  endpoint: string
  method: HttpMethod
  config?: RequestConfig
}
