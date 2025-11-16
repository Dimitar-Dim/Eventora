"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { clearAuthToken, redirectAfterLogout } from "@/utils/auth"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ticketService } from "@/api/service/ticketService"
import { IUserTicket, TicketStatus } from "@/types"
import { formatDate } from "@/utils/dateUtils"

export default function ProfilePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [tickets, setTickets] = useState<IUserTicket[]>([])
  const [isLoadingTickets, setIsLoadingTickets] = useState(false)
  const [ticketsError, setTicketsError] = useState<string | null>(null)

  const handleLogout = () => {
    clearAuthToken()
    redirectAfterLogout(router)
  }

  useEffect(() => {
    if (!user) {
      setTickets([])
      return
    }

    let isMounted = true
    const fetchTickets = async () => {
      setIsLoadingTickets(true)
      setTicketsError(null)
      try {
        const data = await ticketService.getMyTickets()
        if (isMounted) {
          setTickets(data)
        }
      } catch (error) {
        if (isMounted) {
          const message = error instanceof Error ? error.message : "Failed to load tickets"
          setTicketsError(message)
        }
      } finally {
        if (isMounted) {
          setIsLoadingTickets(false)
        }
      }
    }

    fetchTickets()

    return () => {
      isMounted = false
    }
  }, [user])

  const totalTickets = tickets.length
  const upcomingEvents = useMemo(() => {
    const now = Date.now()
    return tickets.filter((ticket) => new Date(ticket.eventDate).getTime() > now).length
  }, [tickets])

  const memberSince = user?.createdAt ? formatDate(user.createdAt) : "—"

  const initials = user?.username
    ? user.username
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : "U"

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  const formatStatus = (status: TicketStatus) => {
    switch (status) {
      case "USED":
        return "Used"
      case "EXPIRED":
        return "Expired"
      default:
        return "Active"
    }
  }

  const statusBadgeClasses: Record<TicketStatus, string> = {
    ACTIVE: "bg-emerald-500/15 text-emerald-500",
    USED: "bg-amber-500/15 text-amber-500",
    EXPIRED: "bg-muted text-muted-foreground",
  }

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
            <div className="text-3xl font-bold text-foreground">{totalTickets}</div>
            <p className="text-muted-foreground text-xs mt-2">
              {totalTickets > 0 ? "Purchased across all events" : "No tickets purchased yet"}
            </p>
          </Card>
          <Card className="p-6">
            <div className="text-muted-foreground text-sm mb-2">Upcoming Events</div>
            <div className="text-3xl font-bold text-foreground">{upcomingEvents}</div>
            <p className="text-muted-foreground text-xs mt-2">Events you&apos;re attending</p>
          </Card>
          <Card className="p-6">
            <div className="text-muted-foreground text-sm mb-2">Member Since</div>
            <div className="text-3xl font-bold text-foreground">{memberSince}</div>
            <p className="text-muted-foreground text-xs mt-2">Active member</p>
          </Card>
        </div>

        {/* Ticket History Section */}
        <Card>
          <div className="p-8">
            <h3 className="text-2xl font-bold text-foreground mb-6">Ticket History</h3>
            <div className="space-y-4">
              {ticketsError && (
                <div className="p-4 border border-destructive/40 bg-destructive/5 rounded-lg text-destructive text-sm">
                  {ticketsError}
                </div>
              )}

              {isLoadingTickets && (
                <div className="space-y-3" data-cy="ticket-skeletons">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="h-20 rounded-lg bg-muted/60 animate-pulse" />
                  ))}
                </div>
              )}

              {!isLoadingTickets && tickets.length > 0 && tickets.map((ticket) => (
                <div
                  key={ticket.ticketId}
                  className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:border-primary/50 hover:bg-card/80 transition-all"
                  data-cy="ticket-card"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-foreground font-bold">
                      {ticket.eventName.substring(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-foreground font-semibold line-clamp-1">{ticket.eventName}</p>
                        <Badge className={`${statusBadgeClasses[ticket.status]} border-none`}>
                          {formatStatus(ticket.status)}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {formatDate(ticket.eventDate)} • #{ticket.ticketId}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-foreground font-semibold">{formatCurrency(ticket.ticketPrice)}</p>
                    <p className="text-muted-foreground text-xs mt-1">Purchased {formatDate(ticket.purchasedAt)}</p>
                  </div>
                </div>
              ))}

              {!isLoadingTickets && tickets.length === 0 && !ticketsError && (
                <div className="py-12 text-center border-2 border-dashed border-border rounded-lg" data-cy="ticket-empty-state">
                  <div className="text-5xl mb-3">🎫</div>
                  <p className="text-muted-foreground mb-2">No tickets yet</p>
                  <p className="text-muted-foreground text-sm mb-4">Start purchasing tickets to events and they&apos;ll appear here</p>
                  <Button onClick={() => router.push("/events")}>
                    Browse Events
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
