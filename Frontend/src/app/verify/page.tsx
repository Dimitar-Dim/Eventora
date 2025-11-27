"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { userService } from "@/api/service/userService"
import { showError, showSuccess } from "@/utils/toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { FormCard } from "@/components/form/FormCard"
import { PageHeader, TermsFooter } from "@/components/layout/PageHeader"

export default function VerifyAccountPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [token, setToken] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null)
  const [verifySuccess, setVerifySuccess] = useState<boolean | null>(null)
  const [email, setEmail] = useState("")
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  useEffect(() => {
    const queryToken = searchParams.get("token") ?? ""
    if (queryToken) {
      setToken(queryToken)
      void verifyToken(queryToken)
    }
  }, [searchParams])

  const verifyToken = async (tokenValue: string) => {
    if (!tokenValue) return
    setIsVerifying(true)
    setVerifyMessage(null)
    try {
      const response = await userService.verifyAccount(tokenValue)
      setVerifyMessage(response.message)
      setVerifySuccess(response.success)
      if (response.success) {
        showSuccess(response.message)
      } else {
        showError(response.message)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Verification failed"
      setVerifyMessage(message)
      setVerifySuccess(false)
      showError(message)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await verifyToken(token)
  }

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setIsResending(true)
    setResendMessage(null)
    try {
      const response = await userService.resendVerification(email)
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

  const messageClasses = verifySuccess ? "text-green-600 dark:text-green-400" : "text-destructive"

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-2xl space-y-8">
        <PageHeader
          title="Verify your account"
          subtitle="Confirm your email to unlock the full Eventora experience"
        />

        <div className="grid gap-6 md:grid-cols-2">
          <FormCard
            footerText="Already verified?"
            footerLink={{ text: "Sign in", href: "/login" }}
          >
            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token">Verification token</Label>
                <Input
                  id="token"
                  type="text"
                  placeholder="Paste the token from your email"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  disabled={isVerifying}
                />
              </div>
              <Button type="submit" disabled={!token || isVerifying} className="w-full">
                {isVerifying ? "Verifying..." : "Verify account"}
              </Button>
              {verifyMessage && (
                <p className={`text-sm ${messageClasses}`}>{verifyMessage}</p>
              )}
              {verifySuccess && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/login")}
                >
                  Continue to login
                </Button>
              )}
            </form>
          </FormCard>

          <FormCard
            footerText="Need to start over?"
            footerLink={{ text: "Register again", href: "/register" }}
          >
            <form onSubmit={handleResend} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Need a new email?</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isResending}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Enter the email you registered with and we&apos;ll send a fresh verification link.
                </p>
              </div>
              <Button type="submit" disabled={!email || isResending} className="w-full">
                {isResending ? "Sending..." : "Resend email"}
              </Button>
              {resendMessage && (
                <p className="text-sm text-muted-foreground">{resendMessage}</p>
              )}
            </form>
          </FormCard>
        </div>

        <TermsFooter agreement="Looking for something else?" />
      </div>
    </div>
  )
}
