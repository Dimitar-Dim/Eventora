"use client"
import Link from "next/link"
import { EventList } from "@/components/event-list"
import { Event } from "@/types/event"
import { Button } from "@/components/ui/button"
import { Plus, Zap } from "lucide-react"
import { useEffect, useState } from "react"
import { ***REMOVED***vice/eventService"
import { getRoleFromToken } from "@/utils/auth"

export default function HomePage() {
  const [allEvents, setAllEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const role = getRoleFromToken()
    setUserRole(role)
  }, [])

  useEffect(() => {
    const fetchAllEvents = async () => {
      try {
        setIsLoading(true)
        const data = await eventService.getAll()
        setAllEvents(data)
      } catch {
        setAllEvents([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllEvents()
  }, [])
  return (
    <div className="min-h-screen bg-background">
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/lorna.jpg')",
            filter: "blur(2px)",
          }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/10" />
        <div className="relative max-w-7xl mx-auto text-center z-10">
          <div className="backdrop-blur-sm sm:p-12">
            <h1 className="text-4xl sm:text-6xl font-bold mb-6 text-balance text-foreground drop-shadow-2xl">
              <span className="gradient-text">Live</span>
              <br />
              Music Events
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty drop-shadow-lg">
              Experience the energy of live music. From techno nights to rock shows, discover your next favorite event.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/events">
                <Button size="lg" className="glow-effect backdrop-blur-sm">
                  <Zap className="mr-2 h-5 w-5" />
                  Explore Events
                </Button>
              </Link>
              {(userRole === "ADMIN" || userRole === "ORGANIZER") && (
                <Link href="/create">
                  <Button size="lg" variant="outline" className="backdrop-blur-sm border-border text-foreground hover:bg-card">
                    <Plus className="mr-2 h-5 w-5" />
                    Create Event
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Closest Upcoming Events</h2>
              <p className="text-muted-foreground">Discover your next live music experience</p>
            </div>
          </div>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-foreground text-lg">Loading events...</p>
            </div>
          ) : (
            <EventList events={allEvents} />
          )}
        </div>
      </section>
    </div>
  )
}