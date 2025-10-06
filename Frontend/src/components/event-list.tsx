"use client"

import { useState, useEffect, useRef } from "react"
import { EventCard } from "./event-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import type { Event } from "@/types/event"

// Mock data for demonstration
const mockEvents: Event[] = [
  {
    id: 1,
    title: "Techno Pulse",
    description: "Deep electronic beats and hypnotic rhythms. Experience the raw energy of cutting-edge techno music.",
    date: "2024-01-12",
    time: "22:00",
    genre: "Techno",
    artist: "DJ Pulse",
    price: 25,
    capacity: 200,
    status: "upcoming",
    image: "/placeholder.jpg",
    organizer: "DJ Pulse"
  },
  {
    id: 2,
    title: "Rock Revival Night",
    description: "Local rock bands showcase their latest tracks. Raw, unfiltered rock energy that will blow you away.",
    date: "2024-01-13",
    time: "20:00",
    genre: "Rock",
    artist: "The Rebels",
    price: 20,
    capacity: 150,
    status: "upcoming",
    image: "/rock.jpg",
    organizer: "The Rebels"
  },
  {
    id: 3,
    title: "Bass Drop Friday",
    description: "Heavy bass lines and darker vibes. Feel the music resonate through your entire body.",
    date: "2024-01-14",
    time: "23:00",
    genre: "Dubstep",
    artist: "Bass Master",
    price: 30,
    capacity: 180,
    status: "live",
    image: "/placeholder.jpg",
    organizer: "Bass Master"
  },
]

export function EventList({ events }: { events?: Event[] }) {
  const eventsToShow = events || mockEvents
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGenre, setSelectedGenre] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const filteredEvents = eventsToShow.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.genre.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGenre = selectedGenre === "all" || event.genre.toLowerCase() === selectedGenre.toLowerCase()
    const matchesStatus = selectedStatus === "all" || event.status === selectedStatus

    return matchesSearch && matchesGenre && matchesStatus
  })

  const genres = Array.from(new Set(eventsToShow.map((event) => event.genre)))

  useEffect(() => {
    if (!isAutoScrollEnabled || filteredEvents.length <= 1) return

    autoScrollIntervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % filteredEvents.length)
    }, 4000)

    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current)
      }
    }
  }, [isAutoScrollEnabled, filteredEvents.length])

  const scrollToIndex = (index: number) => {
    setCurrentIndex(index)
    setIsAutoScrollEnabled(false)

    // Re-enable auto-scroll after 10 seconds of inactivity
    setTimeout(() => {
      setIsAutoScrollEnabled(true)
    }, 10000)
  }

  const scrollLeft = () => {
    const newIndex = currentIndex === 0 ? filteredEvents.length - 1 : currentIndex - 1
    scrollToIndex(newIndex)
  }

  const scrollRight = () => {
    const newIndex = (currentIndex + 1) % filteredEvents.length
    scrollToIndex(newIndex)
  }

  useEffect(() => {
    if (scrollContainerRef.current && filteredEvents.length > 0) {
      const container = scrollContainerRef.current
      const cardWidth = container.scrollWidth / filteredEvents.length
      container.scrollTo({
        left: currentIndex * cardWidth,
        behavior: "smooth",
      })
    }
  }, [currentIndex, filteredEvents.length])

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-background/10 backdrop-blur-sm rounded-lg border border-border/20 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <Input
              placeholder="Search events, artists, genres..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-border/30 bg-background/10 focus:bg-background/20 focus:border-primary/30"
            />
          </div>

          <div className="flex gap-2">
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-32 border-border/30 bg-background/10 focus:bg-background/20 focus:border-primary/30">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground/60" />
                <SelectValue placeholder="All Gen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {genres.map((genre) => (
                  <SelectItem key={genre} value={genre.toLowerCase()}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-32 border-border/30 bg-background/10 focus:bg-background/20 focus:border-primary/30">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="ended">Ended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {filteredEvents.length > 0 ? (
        <div className="relative">
          {/* Navigation Arrows */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-card/80 border-primary/30 text-primary hover:bg-primary/20 hover:border-primary hover:scale-110 backdrop-blur-md transition-all duration-300 glow-effect"
            onClick={scrollLeft}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-card/80 border-primary/30 text-primary hover:bg-primary/20 hover:border-primary hover:scale-110 backdrop-blur-md transition-all duration-300 glow-effect"
            onClick={scrollRight}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Carousel Container */}
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-hidden scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {filteredEvents.map((event) => (
              <div key={event.id} className="w-full flex-shrink-0 px-2">
                <div className="event-card-hover">
                  <EventCard event={event} onViewDetails={(event) => console.log("View details for:", event.title)} />
                </div>
              </div>
            ))}
          </div>

          {/* Carousel Indicators */}
          <div className="flex justify-center space-x-2 mt-6">
            {filteredEvents.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "bg-primary scale-125" : "bg-white/30 hover:bg-white/50"
                }`}
                onClick={() => scrollToIndex(index)}
                aria-label={`Go to event ${index + 1}`}
              />
            ))}
          </div>

          {/* Auto-scroll Status Indicator */}
          <div className="text-center mt-2">
            <span className={`text-xs ${isAutoScrollEnabled ? "text-primary" : "text-muted-foreground"}`}>
              {isAutoScrollEnabled ? "● Auto-scrolling" : "○ Manual mode"}
            </span>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No events found matching your criteria.</p>
          <Button
            variant="outline"
            className="mt-4 bg-transparent"
            onClick={() => {
              setSearchTerm("")
              setSelectedGenre("all")
              setSelectedStatus("all")
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}