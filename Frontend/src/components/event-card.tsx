"use client"

import { useEffect, useState } from "react"
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
import { env } from "@/config/env"
import { formatDate, formatTime } from "@/utils/dateUtils"
import { showError, showSuccess } from "@/utils/toast"
import { ***REMOVED***vice/eventService"
import { useAuth } from "@/context/AuthContext"
import type { Event, IPurchaseTicketPayload, IPurchaseTicketResponse } from "@/types/event"

interface EventCardProps {
  event: Event
  onViewDetails?: (event: Event) => void
}

export function EventCard({ event, onViewDetails }: EventCardProps) {
  const router = useRouter()
  const [showDetails, setShowDetails] = useState(false)
  const [eventDetails, setEventDetails] = useState(event)
  const [issuedTo, setIssuedTo] = useState("")
  const [deliveryEmail, setDeliveryEmail] = useState("")
  const [isBuying, setIsBuying] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [purchaseError, setPurchaseError] = useState<string | null>(null)
  const [purchaseReceipt, setPurchaseReceipt] = useState<IPurchaseTicketResponse | null>(null)
  const [isPurchaseDialogOpen, setPurchaseDialogOpen] = useState(false)
  const [seatSection, setSeatSection] = useState("")
  const [seatRow, setSeatRow] = useState("")
  const [seatNumber, setSeatNumber] = useState("")
  const { isAuthenticated, user } = useAuth()
  const ownerId = user ? Number(user.id) : null
  const isAdmin = user?.role === "admin"
  const isOwner = ownerId !== null && ownerId === eventDetails.organizerId
  const canEdit = isOwner || isAdmin
  const canDelete = canEdit

  useEffect(() => {
    setEventDetails(event)
    setPurchaseReceipt(null)
    setPurchaseError(null)
    setSeatSection("")
    setSeatRow("")
    setSeatNumber("")
    setPurchaseDialogOpen(false)
  }, [event])

  useEffect(() => {
    setIssuedTo(user?.username ?? user?.email ?? "")
    setDeliveryEmail(user?.email ?? "")
  }, [user])

  const handlePurchaseDialogChange = (open: boolean) => {
    setPurchaseDialogOpen(open)
    if (!open) {
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
  const trimmedDeliveryEmail = deliveryEmail.trim()
  const isGuestPurchase = !isAuthenticated
  const needsEmail = isGuestPurchase
  const isDeliveryEmailMissing = needsEmail && trimmedDeliveryEmail.length === 0
  const isDeliveryEmailInvalid = trimmedDeliveryEmail.length > 0 && !emailRegex.test(trimmedDeliveryEmail)
  const isPurchaseDisabled = !canPurchase || isBuying || isDeliveryEmailMissing || isDeliveryEmailInvalid

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

  const handleTicketPurchase = async () => {
    if (isDeliveryEmailMissing) {
      const message = "Please tell us where to send your ticket."
      setPurchaseError(message)
      showError(message)
      return
    }

    if (isDeliveryEmailInvalid) {
      const message = "Enter a valid email address so we can deliver your ticket."
      setPurchaseError(message)
      showError(message)
      return
    }

    setIsBuying(true)
    setPurchaseError(null)

    try {
      const payload: IPurchaseTicketPayload = {
        ...(issuedTo.trim() ? { issuedTo: issuedTo.trim() } : {}),
        ...(trimmedDeliveryEmail ? { deliveryEmail: trimmedDeliveryEmail } : {}),
      }

      const response = await eventService.purchaseTicket(
        eventDetails.id,
        Object.keys(payload).length ? payload : undefined,
        { requiresAuth: isAuthenticated }
      )
      setPurchaseReceipt(response)
      setSeatSection(response.seatSection ?? "")
      setSeatRow(response.seatRow ?? "")
      setSeatNumber(response.seatNumber ?? "")
      setEventDetails((prev) => ({ ...prev, availableTickets: response.remainingTickets }))
      const recipient = response.deliveryEmail ?? (trimmedDeliveryEmail || "your inbox")
      showSuccess(`Ticket confirmed • Delivered to ${recipient}`)
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
                  Seat selection now opens in a dedicated window so we can plug in the interactive map soon.
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

                <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
                  <p className="font-semibold text-primary">Seat planning</p>
                  <p>
                    We now collect ticket details inside a dedicated flow that already includes Section / Row / Seat fields.
                    They stay read-only today and will wire up to the venue map once it lands.
                  </p>
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
                    We&apos;ll guide you through contact info, delivery email, and soon the interactive seat map.
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
          <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto bg-card/95 backdrop-blur-md border-border/50">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Ticket className="h-5 w-5 text-primary" />
                Secure your ticket
              </DialogTitle>
              <DialogDescription>
                Confirm who the ticket is for, where to deliver it, and preview the seat placeholders before seat maps arrive.
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
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`modal-ticket-owner-${eventDetails.id}`} className="text-sm font-medium">Ticket for</Label>
                  <Input
                    id={`modal-ticket-owner-${eventDetails.id}`}
                    placeholder="Full name for this ticket"
                    value={issuedTo}
                    onChange={(e) => setIssuedTo(e.target.value)}
                    disabled={!canPurchase || isBuying}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor={`modal-ticket-email-${eventDetails.id}`} className="text-sm font-medium">Send ticket to</Label>
                  <Input
                    id={`modal-ticket-email-${eventDetails.id}`}
                    type="email"
                    placeholder="you@example.com"
                    value={deliveryEmail}
                    onChange={(e) => setDeliveryEmail(e.target.value)}
                    disabled={!canPurchase || isBuying}
                  />
                  <p className={`text-xs ${isDeliveryEmailMissing || isDeliveryEmailInvalid ? "text-destructive" : "text-muted-foreground"}`}>
                    {isDeliveryEmailMissing
                      ? "Guests need an email so we can deliver the ticket."
                      : isDeliveryEmailInvalid
                        ? "That email doesn't look quite right."
                        : "We'll email the PDF ticket minutes after purchase."}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={`seat-section-${eventDetails.id}`} className="text-sm font-medium">Seat section</Label>
                    <Input
                      id={`seat-section-${eventDetails.id}`}
                      value={seatSection}
                      placeholder="Auto-assigned at checkout"
                      readOnly
                      className="bg-muted/40"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={`seat-row-${eventDetails.id}`} className="text-sm font-medium">Seat row</Label>
                    <Input
                      id={`seat-row-${eventDetails.id}`}
                      value={seatRow}
                      placeholder="Auto-assigned at checkout"
                      readOnly
                      className="bg-muted/40"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={`seat-number-${eventDetails.id}`} className="text-sm font-medium">Seat number</Label>
                    <Input
                      id={`seat-number-${eventDetails.id}`}
                      value={seatNumber}
                      placeholder="Auto-assigned at checkout"
                      readOnly
                      className="bg-muted/40"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Map-based selection is coming soon. The placeholders above will immediately reflect the seat you draw on the future seating map.
                </p>

                <div className="rounded-2xl border border-dashed border-muted-foreground/40 bg-background/40 px-4 py-5 text-center text-sm text-muted-foreground">
                  <MapPin className="mx-auto mb-2 h-6 w-6 text-primary" />
                  <p className="font-semibold text-foreground">Interactive seat map (coming soon)</p>
                  <p>We&apos;re reserving this space for the venue map so buying flows stay familiar once it launches.</p>
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

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <Button variant="ghost" onClick={() => handlePurchaseDialogChange(false)} disabled={isBuying}>
                    Cancel
                  </Button>
                  <Button
                    className={`sm:min-w-[200px] glow-effect ${isPurchaseDisabled ? "opacity-60" : ""}`}
                    size="lg"
                    disabled={isPurchaseDisabled}
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
                        Complete purchase
                      </span>
                    )}
                  </Button>
                </div>

                {isGuestPurchase && (
                  <p className="text-center text-xs text-muted-foreground">
                    Have an account? Sign in to skip entering your email next time.
                  </p>
                )}
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