import { env } from "@/config/env";
import { ApiRequest, ApiRequestParams, RequestConfig, RequestHeaders } from "@/types/IRequestOptions";
import { getAuthToken } from "@/utils/auth";

export class ApiService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = env.API_BASE_URL;
  }

  public async request<T>({
    endpoint,
    method,
    config,
  }: ApiRequest): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = await this.buildHeaders(config);
    const init = this.buildRequest(method, headers, config);

    const response = await fetch(url, init);

    return this.handleResponse<T>(response);
  }

  private async buildHeaders(config?: RequestConfig) {
    const headers: Record<string, string> = {
      Accept: `application/json`,
    };

    if (!config?.formData) {
      headers["Content-Type"] = "application/json";
    }

    if (config?.requiresAuth) {
      const token = await getAuthToken();
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }

  private buildRequest(
    method: ApiRequest["method"],
    headers: RequestHeaders,
    config?: RequestConfig
  ): RequestInit {
    const init: RequestInit = {
      method,
      headers,
      credentials: config?.requiresAuth ? "include" : "omit",
    };

    if (config?.formData) {
      // Let the browser set the proper boundary when using FormData
      delete headers["Content-Type"];
      init.body = config.formData;
    } else if (config?.body !== undefined) {
      init.body = JSON.stringify(config.body);
    }

    return init;
  }

  /** Convert the raw fetch response into JSON */
  private async handleResponse<T>(res: Response): Promise<T> {
    const contentType = res.headers.get("content-type") ?? "";
    let payload: unknown = null;
    if (res.status !== 204) {
      if (contentType.includes("application/json")) {
        payload = await res.json();
      } else {
        payload = await res.text();
      }
    }

    if (!res.ok) {
      const errorMessage = 
        typeof payload === "object" && payload !== null && "message" in payload
          ? (payload as Record<string, unknown>).message
          : `HTTP ${res.status}: ${res.statusText}`;
      throw new Error(String(errorMessage));
    }

    return payload as T;
  }

  /** Issue a GET request to the specified endpoint. */
  public async get<T>({ endpoint, config }: ApiRequestParams): Promise<T> {
    return this.request<T>({
      endpoint,
      method: "GET",
      config,
    });
  }

  /** Issue a POST request to the specified endpoint with an optional payload. */
  public async post<T>({ endpoint, config }: ApiRequestParams): Promise<T> {
    return this.request<T>({
      endpoint,
      method: "POST",
      config,
    });
  }

  /** Issue a PUT request to update resources at the specified endpoint. */
  public async put<T>({ endpoint, config }: ApiRequestParams): Promise<T> {
    return this.request<T>({
      endpoint,
      method: "PUT",
      config,
    });
  }

  /** Issue a DELETE request for the specified endpoint. */
  public async delete<T>({ endpoint, config }: ApiRequestParams): Promise<T> {
    return this.request<T>({
      endpoint,
      method: "DELETE",
      config,
    });
  }
}
