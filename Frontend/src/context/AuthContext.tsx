"use client"

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react"
import { IUser, IAuthContext } from "@/types/auth"
import { setAuthToken as saveAuthToken, clearAuthToken as removeAuthToken, getAuthToken, clearAuthToken } from "@/utils/auth"
import { userService } from "@/api/service/userService"

const AuthContext = createContext<IAuthContext | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = getAuthToken()
        if (token) {
          const profile = await userService.getProfile()
          setUser(profile)
        }
      } catch {
        clearAuthToken()
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const data = await userService.login(email, password)

      saveAuthToken(data.access_token, data.token_type, data.expires_in)
      setUser(data.user)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    removeAuthToken()
    setUser(null)
  }, [])

  const isAuthenticated = user !== null

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
