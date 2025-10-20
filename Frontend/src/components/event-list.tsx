"use client"

import { useState, useEffect, useRef } from "react"
import { EventCard } from "./event-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import { GENRES } from "@/lib/constants"
import type { Event } from "@/types/event"

export function EventList({ events = [] }: { events?: Event[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGenre, setSelectedGenre] = useState<string>("All Genres")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const filteredEvents = events
    .filter((event) => {
      if (!event) {
        console.warn("Null/undefined event found")
        return false
      }
      if (!event.name) {
        console.warn("Event missing name:", event)
        return false
      }
      const matchesSearch =
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (event.genre?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
      const matchesGenre = selectedGenre === "All Genres" || event.genre === selectedGenre

      return matchesSearch && matchesGenre
    })

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
                <SelectItem value="All Genres">All Genres</SelectItem>
                {GENRES.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
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
            {filteredEvents.map((event) => event && (
              <div key={event.id} className="w-full flex-shrink-0 px-2">
                <div className="event-card-hover">
                  <EventCard event={event} />
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
              setSelectedGenre("All Genres")
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}