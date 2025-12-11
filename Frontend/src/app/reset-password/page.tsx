"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { userService } from "@/api/service/userService"
import { PageHeader, TermsFooter } from "@/components/layout/PageHeader"
import { FormCard } from "@/components/form/FormCard"
import { ErrorAlert } from "@/components/form/ErrorAlert"
import { LoadingButton } from "@/components/form/LoadingButton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { showError, showSuccess } from "@/utils/toast"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setError("Reset link is missing or invalid.")
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (!token) {
      setError("Reset link is missing or invalid.")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      const response = await userService.resetPassword(token, newPassword)
      setMessage(response.message)
      showSuccess(response.message)
      setTimeout(() => router.push("/login"), 1200)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to reset password"
      setError(message)
      showError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <PageHeader title="Reset password" subtitle="Choose a new password for your account" />

        <FormCard
          footerText="Changed your mind?"
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
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
                required
                className="bg-background/40 border-border focus-visible:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
                className="bg-background/40 border-border focus-visible:border-primary"
              />
            </div>

            <LoadingButton
              isLoading={isLoading}
              disabled={!newPassword || !confirmPassword}
              loadingText="Updating password..."
            >
              Reset password
            </LoadingButton>
          </form>
        </FormCard>

        <TermsFooter agreement="By resetting, you agree to our" />
      </div>
    </div>
  )
}
