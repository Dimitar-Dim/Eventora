"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getAuthToken, clearAuthToken, getRoleFromToken, redirectAfterLogout } from "@/lib/auth"
import { Button } from "@/components/ui/button"

type TokenPayload = {
  name?: string
  email?: string
  [key: string]: unknown
}

function decodeTokenPayload(token: string | null): TokenPayload | null {
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1]))
    return payload
  } catch (error) {
    console.debug("decodeTokenPayload error:", error)
    return null
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const [tokenPayload, setTokenPayload] = useState<TokenPayload | null>(null)

  useEffect(() => {
    const token = getAuthToken()
    const payload = decodeTokenPayload(token)
    setTokenPayload(payload)
  }, [])

  const handleLogout = () => {
    clearAuthToken()
    redirectAfterLogout(router)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-card/60 border border-purple-800 rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-white mb-4">Profile</h1>

        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-purple-700 flex items-center justify-center text-white text-xl font-bold">
            {tokenPayload?.name ? tokenPayload.name[0].toUpperCase() : "U"}
          </div>

          <div className="flex-1">
            <p className="text-lg font-medium text-white">{tokenPayload?.name ?? "Unknown User"}</p>
            {tokenPayload?.email && (
              <p className="text-sm text-gray-300 mt-1">{tokenPayload.email}</p>
            )}
            <p className="text-sm text-gray-300 mt-1">Role: {getRoleFromToken() ?? "-"}</p>
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="outline" onClick={() => router.push("/events")}>My events</Button>
            <Button variant="destructive" onClick={handleLogout}>Logout</Button>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-300">
          <p>This is a quick profile page placeholder. You can extend it to edit profile details, change avatar or view activity.</p>
        </div>
      </div>
    </div>
  )
}
