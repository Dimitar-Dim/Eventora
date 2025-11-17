"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, CheckCircle2, Clock, Loader2, MapPin, Music, Ticket, Users, AlertTriangle } from "lucide-react"
import { formatDate, formatTime } from "@/utils/dateUtils"
import { showError, showSuccess } from "@/utils/toast"
import { ***REMOVED***vice/eventService"
import { useAuth } from "@/context/AuthContext"
import type { Event, IPurchaseTicketResponse } from "@/types/event"

interface EventCardProps {
  event: Event
  onViewDetails?: (event: Event) => void
}

export function EventCard({ event, onViewDetails }: EventCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [eventDetails, setEventDetails] = useState(event)
  const [issuedTo, setIssuedTo] = useState("")
  const [isBuying, setIsBuying] = useState(false)
  const [purchaseError, setPurchaseError] = useState<string | null>(null)
  const [purchaseReceipt, setPurchaseReceipt] = useState<IPurchaseTicketResponse | null>(null)
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    setEventDetails(event)
    setPurchaseReceipt(null)
    setPurchaseError(null)
  }, [event])

  useEffect(() => {
    setIssuedTo(user?.username ?? user?.email ?? "")
  }, [user])

  const isSoldOut = eventDetails.availableTickets <= 0
  const canPurchase = eventDetails.isActive && !isSoldOut
  const purchaseCtaLabel = !eventDetails.isActive ? "Event Inactive" : isSoldOut ? "Sold Out" : "Get Tickets"

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
  }

  const handleCardClick = () => {
    setShowDetails(true)
    onViewDetails?.(eventDetails)
  }

  const handleTicketPurchase = async () => {
    if (!isAuthenticated) {
      showError("Please log in to purchase tickets.")
      return
    }

    setIsBuying(true)
    setPurchaseError(null)

    try {
      const response = await eventService.purchaseTicket(eventDetails.id, issuedTo ? { issuedTo } : undefined)
      setPurchaseReceipt(response)
      setEventDetails((prev) => ({ ...prev, availableTickets: response.remainingTickets }))
      showSuccess(`Ticket secured for ${response.eventName}!`)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to complete purchase"
      setPurchaseError(message)
      showError(message)
    } finally {
      setIsBuying(false)
    }
  }

  return (
    <>
      <div
        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-sm border border-border/30 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/20 event-card-hover"
        onClick={handleCardClick}
        data-cy="event-card"
      >
        <div className="absolute inset-0">
          <Image
            src={eventDetails.imageUrl || "/placeholder.svg"}
            alt={eventDetails.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        <div className="relative z-10 p-8 h-96 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="flex flex-wrap gap-2">
              <Badge className={`${getStatusColor(eventDetails.isActive)} font-medium text-sm`}>
                {eventDetails.isActive ? "✓ ACTIVE" : "✕ INACTIVE"}
              </Badge>
              {isSoldOut && (
                <Badge className="bg-destructive/80 text-destructive-foreground font-medium text-sm">
                  Sold Out
                </Badge>
              )}
            </div>
            <Badge variant="outline" className="bg-card/50 text-foreground border-border backdrop-blur-sm text-sm">
              {eventDetails.genre}
            </Badge>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-4xl font-bold text-foreground mb-2 text-balance leading-tight group-hover:text-primary transition-colors" data-cy="event-title">
                {eventDetails.name}
              </h3>
              <div className="flex items-center space-x-3 text-muted-foreground">
                <Music className="h-5 w-5" />
                <span className="font-medium text-xl">{eventDetails.genre}</span>
              </div>
            </div>

            <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50">
              <div className="flex items-center justify-between text-foreground">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-6 w-6 text-primary" />
                  <span className="font-semibold text-2xl">{formatDate(eventDetails.eventDate)}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-6 w-6 text-primary" />
                  <span className="font-semibold text-2xl">{formatTime(eventDetails.eventDate)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-foreground">
              <span className="text-4xl font-bold text-primary" data-cy="event-price">€{eventDetails.ticketPrice}</span>
            </div>
            <Button
              size="lg"
              className="bg-primary/90 hover:bg-primary text-primary-foreground font-semibold px-8 py-3 text-lg glow-effect"
              onClick={(e) => {
                e.stopPropagation()
                handleCardClick()
              }}
            >
              Details
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-md border-border/50">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold gradient-text" data-cy="event-details-title">{eventDetails.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {eventDetails.imageUrl && (
              <div className="aspect-video rounded-lg overflow-hidden relative">
                <Image src={eventDetails.imageUrl || "/placeholder.svg"} alt={eventDetails.name} fill className="object-cover" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Music className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Genre</p>
                    <p className="font-semibold" data-cy="event-genre">{eventDetails.genre}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-semibold" data-cy="event-date">{formatDate(eventDetails.eventDate)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-semibold" data-cy="event-time">{formatTime(eventDetails.eventDate)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Ticket className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="font-semibold text-primary text-xl" data-cy="event-details-price">€{eventDetails.ticketPrice}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Available Tickets</p>
                    <p className="font-semibold flex items-center gap-2" data-cy="event-available-tickets">
                      {eventDetails.availableTickets} / {eventDetails.maxTickets}
                      {isSoldOut && (
                        <Badge className="bg-destructive/80 text-destructive-foreground text-xs">Sold Out</Badge>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-semibold" data-cy="event-status">{eventDetails.isActive ? "Active" : "Inactive"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">About This Event</h4>
              <p className="text-muted-foreground text-pretty leading-relaxed" data-cy="event-description">{eventDetails.description}</p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Genre:</span>
              <Badge variant="outline" className="text-accent border-accent/30">
                {eventDetails.genre}
              </Badge>
              <Badge className={getStatusColor(eventDetails.isActive)}>{eventDetails.isActive ? "Active" : "Inactive"}</Badge>
            </div>

            <Card className="border border-border/60 bg-card/80 backdrop-blur">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-primary" />
                  Instant Tickets
                </CardTitle>
                <CardDescription>Purchase securely in just one tap.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-border/40 bg-background/40 px-4 py-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Available</p>
                    <p className="text-2xl font-semibold">{eventDetails.availableTickets}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Price</p>
                    <p className="text-2xl font-semibold text-primary">€{eventDetails.ticketPrice}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor={`ticket-owner-${eventDetails.id}`} className="text-sm font-medium">Ticket for</Label>
                  <Input
                    id={`ticket-owner-${eventDetails.id}`}
                    placeholder="Full name for this ticket"
                    value={issuedTo}
                    onChange={(e) => setIssuedTo(e.target.value)}
                    disabled={!canPurchase || isBuying}
                  />
                </div>

                {purchaseError && (
                  <div className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{purchaseError}</span>
                  </div>
                )}

                {purchaseReceipt && (
                  <div className="flex items-start gap-3 rounded-xl border border-primary/40 bg-primary/5 px-4 py-3 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold text-primary">Ticket #{purchaseReceipt.ticketId} confirmed</p>
                      <p className="text-xs text-muted-foreground">
                        Show QR ID <span className="font-mono">{purchaseReceipt.qrCode.slice(0, 10)}…</span> at the entrance.
                      </p>
                    </div>
                  </div>
                )}

                <Button
                  className={`w-full glow-effect ${(!canPurchase || isBuying) ? "opacity-60 cursor-not-allowed" : ""}`}
                  size="lg"
                  disabled={!canPurchase || isBuying}
                  onClick={handleTicketPurchase}
                >
                  {isBuying ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Ticket className="h-4 w-4" />
                      {purchaseCtaLabel}
                    </span>
                  )}
                </Button>

                {!isAuthenticated && (
                  <p className="text-center text-xs text-muted-foreground">
                    Log in to buy tickets instantly.
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" size="lg" className="flex-1">
                Share Event
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default EventCard