import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"

export const AUTH_TOKEN_KEY = "accessToken"
export const AUTH_TOKEN_TYPE_KEY = "tokenType"
export const AUTH_TOKEN_EXPIRATION_KEY = "tokenExpiration"

export const AUTH_CHANGE_EVENT = "auth-change"

export const setAuthToken = (token: string, tokenType: string, expiresIn: number) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
  localStorage.setItem(AUTH_TOKEN_TYPE_KEY, tokenType)

  const expirationTime = new Date().getTime() + expiresIn * 1000
  localStorage.setItem(AUTH_TOKEN_EXPIRATION_KEY, expirationTime.toString())

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT))
  }
}

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export const getAuthTokenType = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem(AUTH_TOKEN_TYPE_KEY)
}

export const isTokenExpired = (): boolean => {
  if (typeof window === "undefined") return true

  const expirationTime = localStorage.getItem(AUTH_TOKEN_EXPIRATION_KEY)
  if (!expirationTime) return true

  return new Date().getTime() > parseInt(expirationTime)
}

export function getRoleFromToken(): string | null {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    return payload.role || null;
  } catch {
    return null;
  }
}

export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_TOKEN_TYPE_KEY);
  localStorage.removeItem(AUTH_TOKEN_EXPIRATION_KEY);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT))
  }
}

export const getAuthHeader = (): Record<string, string> => {
  const token = getAuthToken()
  const tokenType = getAuthTokenType()

  if (!token || !tokenType) {
    return {}
  }

  return {
    Authorization: `${tokenType} ${token}`,
  }
}

export const redirectAfterLogin = (router: AppRouterInstance) => {
  router.push("/")
}

export const redirectAfterLogout = (router: AppRouterInstance) => {
  router.push("/")
}

export const redirectAfterRegister = (router: AppRouterInstance) => {
  router.push("/login")
}
