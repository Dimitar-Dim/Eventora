"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, CheckCircle2, Clock, Loader2, MapPin, Music, Ticket, Users, AlertTriangle } from "lucide-react"
import { VenueMap } from "@/components/venue-map"
import { env } from "@/config/env"
import { formatDate, formatTime } from "@/utils/dateUtils"
import { showError, showSuccess } from "@/utils/toast"
import { ***REMOVED***vice/eventService"
import { useAuth } from "@/context/AuthContext"
import { seatReservationService } from "@/services/seatReservationService"
import type { Event, IPurchaseTicketPayload, IPurchaseTicketResponse } from "@/types/event"
import type { ISeatState } from "@/types/seat"

interface EventCardProps {
  event: Event
  onViewDetails?: (event: Event) => void
}

export function EventCard({ event, onViewDetails }: EventCardProps) {
  const router = useRouter()
  const [showDetails, setShowDetails] = useState(false)
  const [eventDetails, setEventDetails] = useState(event)
  const [isBuying, setIsBuying] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [purchaseError, setPurchaseError] = useState<string | null>(null)
  const [purchaseReceipt, setPurchaseReceipt] = useState<IPurchaseTicketResponse | null>(null)
  const [isPurchaseDialogOpen, setPurchaseDialogOpen] = useState(false)
  const [selectedSeats, setSelectedSeats] = useState<Array<{ sector: string; seat: number }>>([])
  const [seatNames, setSeatNames] = useState<Record<string, string>>({})
  const [purchaseStep, setPurchaseStep] = useState<"select" | "details">("select")
  const [purchaseEmail, setPurchaseEmail] = useState("")
  const [ticketQuantity, setTicketQuantity] = useState(1)
  const [seatStates, setSeatStates] = useState<Map<string, ISeatState>>(new Map())
  const { isAuthenticated, user } = useAuth()
  const ownerId = user ? Number(user.id) : null
  const isAdmin = user?.role === "admin"
  const isOwner = ownerId !== null && ownerId === eventDetails.organizerId
  const canEdit = isOwner || isAdmin
  const canDelete = canEdit

  // WebSocket connection for seat reservations
  useEffect(() => {
    if (isPurchaseDialogOpen && eventDetails.hasSeating) {
      // Fetch purchased seats first
      const fetchPurchasedSeats = async () => {
        try {
          const response = await fetch(`${env.API_BASE_URL}/api/events/${eventDetails.id}/purchased-seats`)
          if (response.ok) {
            const purchasedSeats: Array<{ seatSection: string; seatRow: string; seatNumber: string }> = await response.json()
            
            const purchasedStates = new Map<string, ISeatState>()
            purchasedSeats.forEach(seat => {
              // Convert seat data to match our format
              const rowNum = parseInt(seat.seatRow.replace('R', ''))
              const seatNum = parseInt(seat.seatNumber)
              const absoluteSeatNum = (rowNum - 1) * 20 + seatNum
              const key = `${seat.seatSection}-${absoluteSeatNum}`
              purchasedStates.set(key, {
                eventId: eventDetails.id,
                sector: seat.seatSection,
                seatNumber: absoluteSeatNum,
                status: "purchased"
              })
            })
            
            setSeatStates(purchasedStates)
          }
        } catch (error) {
          console.error("Failed to fetch purchased seats:", error)
        }
      }
      
      fetchPurchasedSeats()
      seatReservationService.connect(eventDetails.id)
      
      const unsubscribe = seatReservationService.subscribe((seats: ISeatState[]) => {
        console.log("Received seat state updates:", seats)
        setSeatStates((prevStates) => {
          const newSeatStates = new Map(prevStates)
          seats.forEach(seat => {
            const key = `${seat.sector}-${seat.seatNumber}`
            console.log(`Updating seat ${key}:`, seat)
            newSeatStates.set(key, seat)
          })
          return newSeatStates
        })
      })

      return () => {
        unsubscribe()
        seatReservationService.disconnect()
      }
    }
  }, [isPurchaseDialogOpen, eventDetails.hasSeating, eventDetails.id])

  useEffect(() => {
    setEventDetails(event)
    setPurchaseReceipt(null)
    setPurchaseError(null)
    setSelectedSeats([])
    setSeatNames({})
    setPurchaseStep("select")
    setPurchaseEmail(user?.email ?? "")
    setPurchaseDialogOpen(false)
  }, [***REMOVED***?.email])

  useEffect(() => {
    setPurchaseEmail(user?.email ?? "")
  }, [user?.email])

  const handlePurchaseDialogChange = (open: boolean) => {
    setPurchaseDialogOpen(open)
    if (open) {
      setPurchaseError(null)
      setPurchaseReceipt(null)
      setSelectedSeats([])
      setSeatNames({})
      setTicketQuantity(1)
      // For standing events (NONE seating layout), skip directly to details
      setPurchaseStep(eventDetails.seatingLayout === "NONE" ? "details" : "select")
      setPurchaseEmail(user?.email ?? "")
    } else {
      // Release all reservations when closing the dialog
      if (purchaseStep === "details" && selectedSeats.length > 0) {
        selectedSeats.forEach((seat) => {
          seatReservationService.releaseSeat({
            eventId: eventDetails.id,
            sector: seat.sector,
            seatNumber: seat.seat
          })
        })
      }
      setPurchaseError(null)
    }
  }

  const openPurchaseDialog = () => {
    setPurchaseError(null)
    setPurchaseDialogOpen(true)
  }

  const isSoldOut = eventDetails.availableTickets <= 0
  const canPurchase = eventDetails.isActive && !isSoldOut
  const purchaseCtaLabel = !eventDetails.isActive ? "Event Inactive" : isSoldOut ? "Sold Out" : "Get Tickets"
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const trimmedPurchaseEmail = purchaseEmail.trim()
  const isEmailMissing = trimmedPurchaseEmail.length === 0
  const isEmailInvalid = trimmedPurchaseEmail.length > 0 && !emailRegex.test(trimmedPurchaseEmail)
  const isSelectStep = purchaseStep === "select"
  
  const hasTicketsSelected = eventDetails.hasSeating ? selectedSeats.length > 0 : ticketQuantity > 0
  
  const isPurchaseDisabled = isSelectStep
    ? !canPurchase || isBuying || !hasTicketsSelected
    : !canPurchase || isBuying || isEmailMissing || isEmailInvalid || !hasTicketsSelected

  const resolveImageUrl = (url?: string | null) => {
    if (!url) return "/placeholder.svg"
    if (url.startsWith("http")) return url
    if (url.startsWith("/")) return `${env.API_BASE_URL}${url}`
    return url
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
  }

  const handleCardClick = () => {
    setShowDetails(true)
    onViewDetails?.(eventDetails)
  }

  const toggleSeatSelection = useCallback(({ sector, seatNum }: { sector: string; seatNum: number }) => {
    const key = `${sector}-${seatNum}`
    const seatState = seatStates.get(key)
    const currentUserId = seatReservationService.getUserId()
    
    // Prevent selection of purchased seats
    if (seatState?.status === "purchased") {
      showError("This seat is already sold")
      return
    }
    
    // Pr***REMOVED***ved by others
    if (seatState?.status === "reserved" && seatState.reservedBy !== currentUserId) {
      showError("This seat is temporarily reserved by another user")
      return
    }
    
    setPurchaseReceipt(null)
    setSelectedSeats((prev) => {
      const exists = prev.some((s) => `${s.sector}-${s.seat}` === key)
      if (exists) {
        // Remove from selection
        setSeatNames((names) => {
          const next = { ...names }
          delete next[key]
          return next
        })
        return prev.filter((s) => `${s.sector}-${s.seat}` !== key)
      } else {
        // Add to selection (don't reserve yet)
        return [...prev, { sector, seat: seatNum }]
      }
    })
  }, [seatStates])

  const handleTicketPurchase = async () => {
    // For standing events, check ticket quantity; for seated events, check selected seats
    if ((eventDetails.hasSeating && selectedSeats.length === 0) || (!eventDetails.hasSeating && ticketQuantity === 0)) {
      const message = eventDetails.hasSeating ? "Select at least one seat to continue." : "Select at least one ticket to continue."
      setPurchaseError(message)
      showError(message)
      return
    }

    if (isEmailMissing) {
      const message = "Please add a delivery email."
      setPurchaseError(message)
      showError(message)
      return
    }

    if (isEmailInvalid) {
      const message = "Enter a valid email address."
      setPurchaseError(message)
      showError(message)
      return
    }

    setIsBuying(true)
    setPurchaseError(null)

    try {
      // For seated events, purchase one ticket per seat; for standing, purchase multiple standing tickets
      const ticketsToProcess = eventDetails.hasSeating 
        ? selectedSeats 
        : Array.from({ length: ticketQuantity }, (_, i) => ({ sector: "Standing", seat: i + 1 }))
      
      const purchasePromises = ticketsToProcess.map((ticket) => {
        const seatName = (seatNames[`${ticket.sector}-${ticket.seat}`] || "").trim()
        const payload: IPurchaseTicketPayload = {
          ...(seatName ? { issuedTo: seatName } : {}),
          ...(trimmedPurchaseEmail ? { deliveryEmail: trimmedPurchaseEmail } : {}),
          ...(eventDetails.hasSeating ? {
            seatSection: ticket.sector,
            seatRow: `R${Math.floor((ticket.seat - 1) / 20) + 1}`,
            seatNumber: String(((ticket.seat - 1) % 20) + 1).padStart(2, '0')
          } : {})
        }

        return eventService.purchaseTicket(
          eventDetails.id,
          Object.keys(payload).length ? payload : undefined,
          { requiresAuth: isAuthenticated }
        )
      })

      const responses = await Promise.all(purchasePromises)
      const lastResponse = responses[responses.length - 1]
      
      setPurchaseReceipt(lastResponse)
      setEventDetails((prev) => ({ ...prev, availableTickets: lastResponse.remainingTickets }))
      
      // Clear selected seats after successful purchase
      setSelectedSeats([])
      setSeatNames({})
      
      const recipient = lastResponse.deliveryEmail ?? (purchaseEmail.trim() || "your inbox")
      const ticketCount = ticketsToProcess.length
      const ticketWord = ticketCount === 1 ? "Ticket" : `${ticketCount} tickets`
      showSuccess(`${ticketWord} confirmed • Delivered to ${recipient}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to complete purchase"
      setPurchaseError(message)
      showError(message)
    } finally {
      setIsBuying(false)
    }
  }

  const handleEditEvent = () => {
    setShowDetails(false)
    router.push(`/edit/${eventDetails.id}`)
  }

  const handleDeleteEvent = async () => {
    setIsDeleting(true)
    try {
      await eventService.delete(eventDetails.id)
      showSuccess("Event deleted successfully")
      setConfirmDeleteOpen(false)
      setShowDetails(false)
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete event"
      showError(message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div
        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-sm border border-border/30 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/20 event-card-hover h-full flex"
        onClick={handleCardClick}
        data-cy="event-card"
      >
        <div className="absolute inset-0">
          <Image
            src={resolveImageUrl(eventDetails.imageUrl)}
            alt={eventDetails.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        <div className="relative z-10 p-8 h-full min-h-[360px] flex flex-col justify-between">
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

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-foreground">
              <span className="text-4xl font-bold text-primary" data-cy="event-price">€{eventDetails.ticketPrice}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="lg"
                className="bg-muted/30 hover:bg-muted text-foreground font-semibold px-6 py-3"
                onClick={(e) => {
                  e.stopPropagation()
                  handleCardClick()
                }}
              >
                Details
              </Button>
              <Button
                size="lg"
                className="bg-primary/90 hover:bg-primary text-primary-foreground font-semibold px-6 py-3 glow-effect"
                disabled={!canPurchase}
                onClick={(e) => {
                  e.stopPropagation()
                  if (!canPurchase) return
                  openPurchaseDialog()
                }}
              >
                {purchaseCtaLabel}
              </Button>
            </div>
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
                <Image src={resolveImageUrl(eventDetails.imageUrl)} alt={eventDetails.name} fill className="object-cover" />
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
                  Ticket Hub
                </CardTitle>
                <CardDescription>
                  Manage tickets, delivery, and seating with the live venue preview.
                </CardDescription>
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

                {purchaseReceipt && (
                  <div className="flex items-start gap-3 rounded-xl border border-primary/40 bg-primary/5 px-4 py-3 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold text-primary">Ticket #{purchaseReceipt.ticketId} confirmed</p>
                      <p className="text-xs text-muted-foreground">
                        Show QR ID <span className="font-mono">{purchaseReceipt.qrCode.slice(0, 10)}…</span> at the entrance.
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Seat {purchaseReceipt.seatSection} • {purchaseReceipt.seatRow} Seat {purchaseReceipt.seatNumber}
                      </p>
                      {purchaseReceipt.deliveryEmail && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Delivered to {purchaseReceipt.deliveryEmail}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    className="w-full sm:w-auto glow-effect"
                    size="lg"
                    disabled={!canPurchase}
                    onClick={() => {
                      if (!canPurchase) return
                      openPurchaseDialog()
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <Ticket className="h-4 w-4" />
                      Open ticket window
                    </span>
                  </Button>
                  <p className="text-xs text-muted-foreground text-center sm:text-right">
                    {eventDetails.hasSeating 
                      ? "Choose seats, then add ticket holder names and a delivery email."
                      : "Choose how many tickets, add names and your delivery email."}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-3">
              {canEdit && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="px-4"
                  onClick={handleEditEvent}
                  data-cy="event-edit-button"
                >
                  Edit Event
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="px-4"
                  onClick={() => setConfirmDeleteOpen(true)}
                  data-cy="event-delete-button"
                  disabled={isDeleting}
                >
                  Delete
                </Button>
              )}
              <Button variant="outline" size="lg" className="flex-1">
                Share Event
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
        <Dialog open={isPurchaseDialogOpen} onOpenChange={handlePurchaseDialogChange}>
          <DialogContent className="max-w-[1200px] max-h-[95vh] overflow-y-auto bg-card/95 backdrop-blur-md border-border/50">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Ticket className="h-5 w-5 text-primary" />
                Secure your ticket
              </DialogTitle>
              <DialogDescription>
                {eventDetails.hasSeating 
                  ? "Select seats, then add ticket holder names and a delivery email."
                  : "Choose how many tickets you want, add names and your delivery email."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-border/40 bg-background/40 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Date</p>
                  <p className="font-semibold">{formatDate(eventDetails.eventDate)}</p>
                </div>
                <div className="rounded-xl border border-border/40 bg-background/40 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Time</p>
                  <p className="font-semibold">{formatTime(eventDetails.eventDate)}</p>
                </div>
                <div className="rounded-xl border border-border/40 bg-background/40 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Price</p>
                  <p className="font-semibold text-primary">€{eventDetails.ticketPrice}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {eventDetails.hasSeating ? `Step ${purchaseStep === "select" ? "1" : "2"}` : "Final step"}
                    </Badge>
                    <span className="text-muted-foreground">
                      {eventDetails.hasSeating 
                        ? (purchaseStep === "select" ? "Select seats" : "Add ticket details")
                        : "Complete your purchase"}
                    </span>
                  </div>
                  {eventDetails.hasSeating && selectedSeats.length > 0 && (
                    <span className="text-xs text-muted-foreground">{selectedSeats.length} seat(s) chosen</span>
                  )}
                  {!eventDetails.hasSeating && ticketQuantity > 0 && (
                    <span className="text-xs text-muted-foreground">{ticketQuantity} ticket(s)</span>
                  )}
                </div>

                {purchaseStep === "select" ? (
                  <>
                    <p className="text-sm text-muted-foreground">Pick one or more seats. You can adjust later.</p>
                    <div className="rounded-xl border border-border/50 bg-background/60 p-2">
                      <VenueMap
                        hasSeating={eventDetails.hasSeating}
                        seatingLayout={eventDetails.seatingLayout}
                        seatedCapacity={eventDetails.seatedCapacity}
                        standingCapacity={eventDetails.standingCapacity}
                        onToggleSeat={({ sector, seatNum }) => toggleSeatSelection({ sector, seatNum })}
                        selectedSeats={selectedSeats}
                        seatStates={seatStates}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {!eventDetails.hasSeating && (
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-foreground">How many tickets?</Label>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                            disabled={ticketQuantity <= 1}
                          >
                            -
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            value={ticketQuantity}
                            onChange={(e) => setTicketQuantity(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                            className="w-20 text-center"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setTicketQuantity(Math.min(10, ticketQuantity + 1))}
                            disabled={ticketQuantity >= 10}
                          >
                            +
                          </Button>
                          <span className="text-sm text-muted-foreground">ticket(s)</span>
                        </div>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {eventDetails.hasSeating 
                        ? "Add a name for each seat and confirm the delivery email."
                        : "Add names for each ticket and confirm your delivery email."}
                    </p>
                    <div className="grid gap-3">
                      {(eventDetails.hasSeating ? selectedSeats : Array.from({ length: ticketQuantity }, (_, i) => ({ sector: "Standing", seat: i + 1 }))).map((s) => {
                        const key = `${s.sector}-${s.seat}`
                        return (
                          <div key={key} className="flex flex-col gap-1">
                            <Label className="text-xs font-medium text-foreground">
                              {eventDetails.hasSeating ? `Seat ${key}` : `Ticket ${s.seat}`}
                            </Label>
                            <Input
                              placeholder="Ticket holder name"
                              value={seatNames[key] ?? ""}
                              onChange={(e) => setSeatNames((prev) => ({ ...prev, [key]: e.target.value }))}
                              disabled={isBuying}
                            />
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-sm font-medium">Delivery email</Label>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        value={purchaseEmail}
                        onChange={(e) => setPurchaseEmail(e.target.value)}
                        disabled={isBuying}
                      />
                      <p className={`text-xs ${isEmailMissing || isEmailInvalid ? "text-destructive" : "text-muted-foreground"}`}>
                        {isEmailMissing ? "Email is required for delivery." : isEmailInvalid ? "That email doesn't look right." : "We send tickets here after purchase."}
                      </p>
                    </div>
                  </>
                )}

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
                      <p className="text-xs text-muted-foreground mt-1">
                        Seat {purchaseReceipt.seatSection} • {purchaseReceipt.seatRow} Seat {purchaseReceipt.seatNumber}
                      </p>
                      {purchaseReceipt.deliveryEmail && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Delivered to {purchaseReceipt.deliveryEmail}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:items-center">
                  <Button variant="ghost" onClick={() => handlePurchaseDialogChange(false)} disabled={isBuying}>
                    Cancel
                  </Button>
                  {purchaseStep === "details" && (
                    <Button variant="outline" onClick={() => {
                      // Release all reservations when going back
                      selectedSeats.forEach((seat) => {
                        seatReservationService.releaseSeat({
                          eventId: eventDetails.id,
                          sector: seat.sector,
                          seatNumber: seat.seat
                        })
                      })
                      setPurchaseStep("select")
                    }} disabled={isBuying}>
                      Back to seats
                    </Button>
                  )}
                  <Button
                    className={`sm:min-w-[200px] glow-effect ${isPurchaseDisabled ? "opacity-60" : ""}`}
                    size="lg"
                    disabled={isPurchaseDisabled}
                    onClick={() => {
                      if (purchaseStep === "select") {
                        // Reserve all selected seats when moving to details step
                        selectedSeats.forEach((seat) => {
                          seatReservationService.reserveSeat({
                            eventId: eventDetails.id,
                            sector: seat.sector,
                            seatNumber: seat.seat
                          })
                        })
                        setPurchaseStep("details")
                        return
                      }
                      handleTicketPurchase()
                    }}
                  >
                    {isBuying ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Ticket className="h-4 w-4" />
                        {purchaseStep === "select" ? "Continue to details" : "Complete purchase"}
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this event?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the event from listings for everyone. You can’t undo this action.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEvent}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
              data-cy="confirm-delete-event"
            >
              {isDeleting ? "Deleting..." : "Yes, delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default EventCard