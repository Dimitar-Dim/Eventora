"use client"

import { useState } from "react"
import { EventCard } from "./event-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import { GENRES } from "@/lib/constants"
import type { Event } from "@/types/event"

const EVENTS_PER_PAGE = 15

export function EventGrid({ events = [] }: { events?: Event[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGenre, setSelectedGenre] = useState<string>("All Genres")
  const [currentPage, setCurrentPage] = useState(1)

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

  const totalPages = Math.ceil(filteredEvents.length / EVENTS_PER_PAGE)
  const startIndex = (currentPage - 1) * EVENTS_PER_PAGE
  const endIndex = startIndex + EVENTS_PER_PAGE
  const currentEvents = filteredEvents.slice(startIndex, endIndex)

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleGenreChange = (value: string) => {
    setSelectedGenre(value)
    setCurrentPage(1)
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    setSelectedGenre("All Genres")
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      <div className="bg-background/10 backdrop-blur-sm rounded-lg border border-border/20 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <Input
              placeholder="Search events, artists, genres..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 border-border/30 bg-background/10 focus:bg-background/20 focus:border-primary/30"
            />
          </div>

          <div className="flex gap-2">
            <Select value={selectedGenre} onValueChange={handleGenreChange}>
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
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentEvents.map((event) =>
              event && (
                <div key={event.id} className="event-card-hover">
                  <EventCard event={event} />
                </div>
              )
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-border/20">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={page === currentPage ? "glow-effect" : ""}
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground pt-4">
            Showing {startIndex + 1}–{Math.min(endIndex, filteredEvents.length)} of {filteredEvents.length} events
            {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No events found matching your criteria.</p>
          <Button
            variant="outline"
            className="mt-4 bg-transparent"
            onClick={handleClearFilters}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}
