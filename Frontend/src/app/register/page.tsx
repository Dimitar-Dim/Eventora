"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { redirectAfterRegister } from "@/utils/auth"
import { showSuccess, showError } from "@/utils/toast"
import { IValidationError, IAuthError } from "@/types/auth"
import { userService } from "@/api/service/userService"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ErrorAlert } from "@/components/form/ErrorAlert"
import { LoadingButton } from "@/components/form/LoadingButton"
import { FormCard } from "@/components/form/FormCard"
import { PageHeader, TermsFooter } from "@/components/layout/PageHeader"

export default function RegisterPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<IAuthError | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [validationErrors, setValidationErrors] = useState<IValidationError[]>([])

  const validateForm = (): boolean => {
    const errors: IValidationError[] = []

    if (username.length < 3) {
      errors.push({ field: "username", message: "Username must be at least 3 characters" })
    }
    if (username.length > 50) {
      errors.push({ field: "username", message: "Username must not exceed 50 characters" })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      errors.push({ field: "email", message: "Please enter a valid email address" })
    }

    if (password.length < 8) {
      errors.push({ field: "password", message: "Password must be at least 8 characters" })
    }

    if (password !== passwordConfirm) {
      errors.push({ field: "passwordConfirm", message: "Passwords do not match" })
    }

    setValidationErrors(errors)
    return errors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      await userService.register({
        username,
        email,
        password,
        passwordConfirm,
      })

      showSuccess("Account created! 🎉 Redirecting to login...")
      redirectAfterRegister(router)
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred"
      showError(message)
      setError({ message })
    } finally {
      setIsLoading(false)
    }
  }

  const getFieldError = (field: string): string | undefined => {
    return validationErrors.find((e) => e.field === field)?.message
  }

  const inputClasses = (hasError: boolean) =>
    `bg-background/40 border-border focus-visible:border-primary ${
      hasError ? "border-destructive/50 focus-visible:border-destructive/50" : ""
    }`

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <PageHeader title="Join Eventora" subtitle="Create your account to discover amazing events" />

        <FormCard
          footerText="Already have an account?"
          footerLink={{ text: "Sign in", href: "/login" }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <ErrorAlert message={error.message} />}

            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Your display name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                required
                className={inputClasses(!!getFieldError("username"))}
              />
              {getFieldError("username") && (
                <p className="text-xs text-destructive">{getFieldError("username")}</p>
              )}
            </div>

            {/* Email Field */}
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
                className={inputClasses(!!getFieldError("email"))}
              />
              {getFieldError("email") && (
                <p className="text-xs text-destructive">{getFieldError("email")}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  className={`${inputClasses(!!getFieldError("password"))} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
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
              {getFieldError("password") && (
                <p className="text-xs text-destructive">{getFieldError("password")}</p>
              )}
            </div>

            {/* Password Confirmation Field */}
            <div className="space-y-2">
              <Label htmlFor="passwordConfirm" className="text-foreground">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="passwordConfirm"
                  type={showPasswordConfirm ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  disabled={isLoading}
                  required
                  className={`${inputClasses(!!getFieldError("passwordConfirm"))} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
                >
                  {showPasswordConfirm ? (
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
              {getFieldError("passwordConfirm") && (
                <p className="text-xs text-destructive">{getFieldError("passwordConfirm")}</p>
              )}
            </div>

            {/* Submit Button */}
            <LoadingButton
              isLoading={isLoading}
              disabled={!username || !email || !password || !passwordConfirm}
              loadingText="Creating account..."
            >
              Create Account
            </LoadingButton>
          </form>
        </FormCard>

        <TermsFooter agreement="By creating an account, you agree to our" />
      </div>
    </div>
  )
}
