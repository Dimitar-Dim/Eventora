"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { clearAuthToken, redirectAfterLogout } from "@/utils/auth"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ProfilePage() {
  const router = useRouter()
  const { user } = useAuth()

  const handleLogout = () => {
    clearAuthToken()
    redirectAfterLogout(router)
  }

  const initials = user?.username
    ? user.username
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : "U"

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">My Profile</h1>
          <p className="text-muted-foreground">Manage your account and view your ticket history</p>
        </div>

        {/* Profile Card */}
        <Card className="mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-accent h-24" />
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-12 mb-6">
              <div className="flex items-end gap-6 mb-4 md:mb-0">
                <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-foreground text-4xl font-bold border-4 border-card shadow-lg">
                  {initials}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-foreground">{user?.username ?? "Unknown User"}</h2>
                  {user?.email && (
                    <p className="text-muted-foreground mt-1">{user.email}</p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">{user?.role?.toUpperCase() ?? "User"}</Badge>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => router.push("/events")}>
                  Browse Events
                </Button>
                <Button variant="destructive" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <div className="text-muted-foreground text-sm mb-2">Total Tickets</div>
            <div className="text-3xl font-bold text-foreground">0</div>
            <p className="text-muted-foreground text-xs mt-2">No tickets purchased yet</p>
          </Card>
          <Card className="p-6">
            <div className="text-muted-foreground text-sm mb-2">Upcoming Events</div>
            <div className="text-3xl font-bold text-foreground">0</div>
            <p className="text-muted-foreground text-xs mt-2">Events you&apos;re attending</p>
          </Card>
          <Card className="p-6">
            <div className="text-muted-foreground text-sm mb-2">Member Since</div>
            <div className="text-3xl font-bold text-foreground">2025</div>
            <p className="text-muted-foreground text-xs mt-2">Active member</p>
          </Card>
        </div>

        {/* Ticket History Section */}
        <Card>
          <div className="p-8">
            <h3 className="text-2xl font-bold text-foreground mb-6">Ticket History</h3>

            <div className="space-y-4">
              {/* Placeholder tickets */}
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:border-primary/50 hover:bg-card/80 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-foreground font-bold">
                      🎫
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground font-medium">Ticket #{1000 + i}</p>
                      <p className="text-muted-foreground text-sm">Event name placeholder</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground text-sm">Date TBD</p>
                    <p className="text-muted-foreground text-xs mt-1">Pending</p>
                  </div>
                </div>
              ))}

              {/* Empty state */}
              <div className="py-12 text-center border-2 border-dashed border-border rounded-lg">
                <div className="text-5xl mb-3">🎫</div>
                <p className="text-muted-foreground mb-2">No tickets yet</p>
                <p className="text-muted-foreground text-sm mb-4">Start purchasing tickets to events and they&apos;ll appear here</p>
                <Button onClick={() => router.push("/events")}>
                  Browse Events
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
