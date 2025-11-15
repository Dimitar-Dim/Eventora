"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { getAuthToken, clearAuthToken, getRoleFromToken, redirectAfterLogout, AUTH_CHANGE_EVENT } from "@/utils/auth"
import { showSuccess } from "@/utils/toast"
import { useRouter } from "next/navigation"

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = getAuthToken()
      setIsAuthenticated(!!token)
      if (token) {
        setUserRole(getRoleFromToken())
      }
      setIsLoading(false)
    }

    checkAuthStatus()

    window.addEventListener(AUTH_CHANGE_EVENT, checkAuthStatus)

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        checkAuthStatus()
      }
    })

    // Re-check when storage changes (for sync across tabs)
    window.addEventListener("storage", checkAuthStatus)

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, checkAuthStatus)
      document.removeEventListener("visibilitychange", checkAuthStatus)
      window.removeEventListener("storage", checkAuthStatus)
    }
  }, [])

  const handleLogout = () => {
    clearAuthToken()
    setIsAuthenticated(false)
    setIsMenuOpen(false)
    showSuccess("Logged out successfully 👋")
    redirectAfterLogout(router)
  }

  return (
    <nav className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Eventora Logo"
              width={32}
              height={32}
              className="h-8 w-auto mr-2"
            />
            <span className="text-2xl font-bold text-accent">EVENTORA</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/events" className="text-muted-foreground hover:text-foreground transition-colors">
              Events
            </Link>
            {isAuthenticated && (
              <>
                <Link href="/tickets" className="text-muted-foreground hover:text-foreground transition-colors">
                  My Tickets
                </Link>
                {(userRole === "ADMIN" || userRole === "ORGANIZER") && (
                  <Link href="/create" className="text-muted-foreground hover:text-foreground transition-colors">
                    + Create Event
                  </Link>
                )}
                <Link href="/profile" className="text-muted-foreground hover:text-foreground transition-colors">
                  Profile
                </Link>
              </>
            )}
            {!isLoading && (
              isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors font-medium"
                >
                  Logout
                </button>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/login"
                    className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors font-medium"
                  >
                    Register
                  </Link>
                </div>
              )
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-muted-foreground hover:text-foreground"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href="/events" className="block px-3 py-2 text-muted-foreground hover:text-foreground">
                Events
              </Link>
              {isAuthenticated && (
                <>
                  <Link href="/tickets" className="block px-3 py-2 text-muted-foreground hover:text-foreground">
                    My Tickets
                  </Link>
                  {(userRole === "ADMIN" || userRole === "ORGANIZER") && (
                    <Link href="/create" className="block px-3 py-2 text-muted-foreground hover:text-foreground">
                      + Create Event
                    </Link>
                  )}
                  <Link href="/profile" className="block px-3 py-2 text-muted-foreground hover:text-foreground">
                    Profile
                  </Link>
                </>
              )}
              <div className="border-t border-border mt-2 pt-2">
                {!isLoading && (
                  isAuthenticated ? (
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 text-muted-foreground hover:text-foreground font-medium"
                    >
                      Logout
                    </button>
                  ) : (
                    <>
                      <Link href="/login" className="block px-3 py-2 text-muted-foreground hover:text-foreground">
                        Login
                      </Link>
                      <Link href="/register" className="block px-3 py-2 text-muted-foreground hover:text-foreground font-medium">
                        Register
                      </Link>
                    </>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}