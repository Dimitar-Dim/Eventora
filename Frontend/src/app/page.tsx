"use client"
import Link from "next/link"
import { EventList } from "@/components/event-list"
import { Event } from "@/types/event"
import { Button } from "@/components/ui/button"
import { Plus, Zap } from "lucide-react"

const mockEvents: Event[] = [
  {
    id: 1,
    title: "Rock Revival Night",
    description: "Experience the energy of live music. From techno nights to rock showcases, discover your next favorite show.",
    date: "2025-01-13T20:00:00Z",
    time: "20:00",
    genre: "Rock",
    artist: "The Rebels",
    price: 20,
    capacity: 500,
    image: "/rock.jpg",
    status: "upcoming",
    organizer: "The Rebels"
  },
  {
    id: 2,
    title: "Techno Underground",
    description: "Deep beats and electronic vibes in an underground setting.",
    date: "2025-01-15T22:00:00Z",
    time: "22:00",
    genre: "Techno",
    artist: "Electronic Collective",
    price: 35,
    capacity: 300,
    image: "/rock.jpg",
    status: "upcoming",
    organizer: "Electronic Collective"
  },
  {
    id: 3,
    title: "Dubstep Revolution",
    description: "Heavy bass and mind-blowing drops with purple neon atmosphere.",
    date: "2025-01-18T21:00:00Z",
    time: "21:00",
    genre: "Dubstep",
    artist: "Bass Masters",
    price: 30,
    capacity: 800,
    image: "/rock.jpg",
    status: "upcoming",
    organizer: "Bass Masters"
  }
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/** Background Image */}
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
            <h1 className="text-4xl sm:text-6xl font-bold mb-6 text-balance text-white drop-shadow-2xl">
              <span className="gradient-text">Live</span>
              <br />
              Music Events
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto text-pretty drop-shadow-lg">
              Experience the energy of live music. From techno nights to rock shows, discover your next favorite event.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/events">
                <Button size="lg" className="glow-effect backdrop-blur-sm">
                  <Zap className="mr-2 h-5 w-5" />
                  Explore Events
                </Button>
              </Link>
              <Link href="/create">
                <Button size="lg" variant="outline" className="backdrop-blur-sm border-white/30 text-white hover:bg-white/10">
                  <Plus className="mr-2 h-5 w-5" />
                  Create Event
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Upcoming Events</h2>
              <p className="text-muted-foreground">Discover your next live music experience</p>
            </div>
          </div>
          <EventList events={mockEvents} />
        </div>
      </section>
    </div>
  )
}