"use client"

import { useState } from "react"
import { userService } from "@/api/service/userService"
import { PageHeader, TermsFooter } from "@/components/layout/PageHeader"
import { FormCard } from "@/components/form/FormCard"
import { ErrorAlert } from "@/components/form/ErrorAlert"
import { LoadingButton } from "@/components/form/LoadingButton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { showError, showSuccess } from "@/utils/toast"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setIsLoading(true)

    try {
      const response = await userService.forgotPassword(email)
      setMessage(response.message)
      showSuccess(response.message)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to send reset email"
      setError(message)
      showError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <PageHeader title="Forgot password" subtitle="We will email you a reset link" />

        <FormCard
          footerText="Remembered it?"
          footerLink={{ text: "Return to login", href: "/login" }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <ErrorAlert message={error} />}
            {message && !error && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-800 dark:text-emerald-100">
                {message}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="bg-background/40 border-border focus-visible:border-primary"
              />
            </div>

            <LoadingButton
              isLoading={isLoading}
              disabled={!email}
              loadingText="Sending link..."
            >
              Send reset link
            </LoadingButton>
          </form>
        </FormCard>

        <TermsFooter agreement="By requesting a reset, you agree to our" />
      </div>
    </div>
  )
}
