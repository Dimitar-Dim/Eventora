"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { showSuccess, showError } from "@/utils/toast"
import { IValidationError, IAuthError, IRegisterResponse } from "@/types/auth"
import { userService } from "@/api/service/userService"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
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
  const [registrationResult, setRegistrationResult] = useState<IRegisterResponse | null>(null)
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)

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
      const response = await userService.register({
        username,
        email,
        password,
        passwordConfirm,
      })

      setRegistrationResult(response)
      setResendMessage(null)
      showSuccess("Account created! Please verify your email to continue.")
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred"
      showError(message)
      setError({ message })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!registrationResult) return
    setIsResending(true)
    setResendMessage(null)
    try {
      const response = await userService.resendVerification(registrationResult.email)
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
          {registrationResult ? (
            <div className="space-y-6 text-center">
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-foreground">Check your inbox</h2>
                <p className="text-sm text-muted-foreground">
                  We sent a verification link to
                  <span className="font-medium text-foreground"> {registrationResult.email}</span>.
                  Follow the instructions to activate your account.
                </p>
                {!registrationResult.verificationEmailSent && (
                  <p className="text-xs text-muted-foreground">
                    The email is queued for delivery and should arrive shortly.
                  </p>
                )}
              </div>

              {resendMessage && (
                <p className="text-sm text-muted-foreground">{resendMessage}</p>
              )}

              <div className="space-y-3">
                <Button
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="w-full"
                >
                  {isResending ? "Sending..." : "Resend verification email"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/login")}
                  className="w-full"
                >
                  Back to login
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Didn&apos;t get the email? Check your spam folder or resend it above.
              </p>
            </div>
          ) : (
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
                  data-cy="register-username-input"
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
                  data-cy="register-email-input"
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
                    data-cy="register-password-input"
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
                    data-cy="register-password-confirm-input"
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
                data-cy="register-submit"
              >
                Create Account
              </LoadingButton>
            </form>
          )}
        </FormCard>

        <TermsFooter agreement="By creating an account, you agree to our" />
      </div>
    </div>
  )
}
