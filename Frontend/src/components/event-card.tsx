"use client"

import { useState } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, Clock, MapPin, Music, Users, Ticket } from "lucide-react"
import type { Event } from "@/types/event"

interface EventCardProps {
  event: Event
  onViewDetails?: (event: Event) => void
}

export function EventCard({ event, onViewDetails }: EventCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-accent text-accent-foreground animate-pulse"
      case "upcoming":
        return "bg-primary text-primary-foreground"
      case "ended":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  const handleCardClick = () => {
    setShowDetails(true)
    onViewDetails?.(event)
  }

  return (
    <>
      <div
        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-sm border border-border/30 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/20 event-card-hover"
        onClick={handleCardClick}
      >
        <div className="absolute inset-0">
          <Image
            src={event.image || "/placeholder.svg"}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        <div className="relative z-10 p-8 h-96 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <Badge className={`${getStatusColor(event.status)} font-medium text-sm`}>
              {event.status === "live" ? "🔴 LIVE" : event.status.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="bg-black/30 text-white border-white/20 backdrop-blur-sm text-sm">
              {event.genre}
            </Badge>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-4xl font-bold text-white mb-2 text-balance leading-tight group-hover:text-primary transition-colors">
                {event.title}
              </h3>
              <div className="flex items-center space-x-3 text-white/80">
                <Music className="h-5 w-5" />
                <span className="font-medium text-xl">{event.artist}</span>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-6 w-6 text-primary" />
                  <span className="font-semibold text-2xl">{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-6 w-6 text-primary" />
                  <span className="font-semibold text-2xl">{event.time}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-white">
              <span className="text-4xl font-bold text-primary">${event.price}</span>
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
            <DialogTitle className="text-2xl font-bold gradient-text">{event.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {event.image && (
              <div className="aspect-video rounded-lg overflow-hidden relative">
                <Image src={event.image || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Music className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Artist</p>
                    <p className="font-semibold">{event.artist}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-semibold">{formatDate(event.date)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-semibold">{event.time}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Ticket className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="font-semibold text-primary text-xl">${event.price}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Capacity</p>
                    <p className="font-semibold">{event.capacity} people</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Venue</p>
                    <p className="font-semibold">Main Stage</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">About This Event</h4>
              <p className="text-muted-foreground text-pretty leading-relaxed">{event.description}</p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Genre:</span>
              <Badge variant="outline" className="text-accent border-accent/30">
                {event.genre}
              </Badge>
              <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
            </div>

            <div className="flex gap-3 pt-4">
              <Button className="flex-1 glow-effect" size="lg" disabled={event.status === 'ended'}>
                <Ticket className="mr-2 h-5 w-5" />
                {event.status === 'ended' ? 'Event Ended' : 'Get Tickets'}
              </Button>
              <Button variant="outline" size="lg">
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