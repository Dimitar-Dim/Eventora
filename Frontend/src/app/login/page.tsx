"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { showSuccess, showError } from "@/utils/toast"
import { redirectAfterLogin } from "@/utils/auth"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ErrorAlert } from "@/components/form/ErrorAlert"
import { LoadingButton } from "@/components/form/LoadingButton"
import { FormCard } from "@/components/form/FormCard"
import { PageHeader, TermsFooter } from "@/components/layout/PageHeader"
import { userService } from "@/api/service/userService"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null)
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setPendingVerificationEmail(null)
    setResendMessage(null)
    setIsLoading(true)

    try {
      await login(email, password)
      showSuccess("Welcome back! 🎉")
      redirectAfterLogin(router)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed"
      showError(message)
      setError(message)
      if (message.toLowerCase().includes("verif")) {
        setPendingVerificationEmail(email)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!pendingVerificationEmail) return
    setIsResending(true)
    setResendMessage(null)
    try {
      const response = await userService.resendVerification(pendingVerificationEmail)
      setResendMessage(response.message)
      showSuccess(response.message)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to resend verification email"
      setResendMessage(message)
      showError(message)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <PageHeader title="Welcome Back" subtitle="Sign in to your Eventora account" />

        <FormCard
          footerText="Don't have an account?"
          footerLink={{ text: "Create one", href: "/register" }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <ErrorAlert message={error} />}

            {pendingVerificationEmail && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-left space-y-3">
                <div>
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">Verify your email to continue</p>
                  <p className="text-xs text-amber-900/80 dark:text-amber-200/80">
                    We&apos;ve sent a link to {pendingVerificationEmail}. Click it to activate your account or resend the email below.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="w-full"
                >
                  {isResending ? "Sending..." : "Resend verification email"}
                </Button>
                {resendMessage && <p className="text-xs text-muted-foreground">{resendMessage}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="bg-background/40 border-border focus-visible:border-primary"
                data-cy="login-email-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  className="bg-background/40 border-border focus-visible:border-primary pr-10"
                  data-cy="login-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
                  data-cy="login-password-toggle"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <LoadingButton
              isLoading={isLoading}
              disabled={!email || !password}
              loadingText="Signing in..."
              data-cy="login-submit"
            >
              Sign In
            </LoadingButton>
          </form>
        </FormCard>

        <TermsFooter agreement="By signing in, you agree to our" />
      </div>
    </div>
  )
}
