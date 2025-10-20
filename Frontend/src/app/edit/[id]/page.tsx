"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { EventFormData } from "@/types/event"
import { GENRES, API_BASE_URL } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function EditEventPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState<EventFormData>({
    name: "",
    description: "",
    eventDate: "",
    genre: "",
    ticketPrice: 0,
    maxTickets: 0,
    imageUrl: ""
  })

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`)
        if (!response.ok) throw new Error("Failed to fetch event")
        const data = await response.json()

        // Convert ISO date to datetime-local format
        const eventDate = new Date(data.eventDate)
        const localDateTime = new Date(eventDate.getTime() - eventDate.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16)

        setFormData({
          name: data.name,
          description: data.description,
          eventDate: localDateTime,
          genre: data.genre,
          ticketPrice: data.ticketPrice,
          maxTickets: data.maxTickets,
          imageUrl: data.imageUrl || ""
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load event")
      } finally {
        setIsLoading(false)
      }
    }

    if (eventId) {
      fetchEvent()
    }
  }, [eventId])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'ticketPrice' || name === 'maxTickets' ? Number(value) : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      if (!formData.name.trim()) throw new Error("Event name is required")
      if (!formData.description.trim()) throw new Error("Description is required")
      if (!formData.eventDate) throw new Error("Event date and time are required")
      if (!formData.genre) throw new Error("Genre is required")
      if (formData.ticketPrice < 0) throw new Error("Ticket price must be non-negative")
      if (formData.maxTickets < 1) throw new Error("Max tickets must be at least 1")

      const eventDateTime = new Date(formData.eventDate).toISOString()

      const requestBody = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        eventDate: eventDateTime,
        genre: formData.genre,
        ticketPrice: parseFloat(formData.ticketPrice.toString()),
        maxTickets: parseInt(formData.maxTickets.toString()),
        imageUrl: formData.imageUrl.trim() || null,
        organizerId: 1
      }

      const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        let errorMessage = `Failed to update event (${response.status})`
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch {
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/events")
      }, 1500)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
      console.error("Error updating event:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg">Loading event...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/10" />
        <div className="relative max-w-2xl mx-auto z-10">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3 text-white">
            <span className="gradient-text">Edit Event</span>
          </h1>
          <p className="text-gray-300 text-lg">
            Update your event details
          </p>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {success && (
            <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-lg backdrop-blur-sm">
              <p className="text-emerald-300 font-medium">✓ Event updated successfully! Redirecting...</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg backdrop-blur-sm">
              <p className="text-red-300 font-medium">✕ {error}</p>
            </div>
          )}

          <Card className="border-white/10 bg-white/5 backdrop-blur-sm shadow-xl">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-2xl text-white">Event Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-sm font-semibold text-white">
                    Event Name <span className="text-rose-400">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Summer Music Festival"
                    className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-semibold text-white">
                    Description <span className="text-rose-400">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    required
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Tell people about your event..."
                    rows={4}
                    className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="eventDate" className="text-sm font-semibold text-white">
                      Date & Time <span className="text-rose-400">*</span>
                    </Label>
                    <Input
                      id="eventDate"
                      name="eventDate"
                      type="datetime-local"
                      required
                      value={formData.eventDate}
                      onChange={handleInputChange}
                      className="mt-2 bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="genre" className="text-sm font-semibold text-white">
                      Genre <span className="text-rose-400">*</span>
                    </Label>
                    <select
                      id="genre"
                      name="genre"
                      required
                      value={formData.genre}
                      onChange={handleInputChange}
                      className="mt-2 flex h-10 w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2"
                    >
                      <option value="" className="bg-slate-900">Select a genre</option>
                      {GENRES.map((genre) => (
                        <option key={genre} value={genre} className="bg-slate-900">
                          {genre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ticketPrice" className="text-sm font-semibold text-white">
                      Ticket Price ($) <span className="text-rose-400">*</span>
                    </Label>
                    <Input
                      id="ticketPrice"
                      name="ticketPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={formData.ticketPrice}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxTickets" className="text-sm font-semibold text-white">
                      Max Tickets <span className="text-rose-400">*</span>
                    </Label>
                    <Input
                      id="maxTickets"
                      name="maxTickets"
                      type="number"
                      min="1"
                      required
                      value={formData.maxTickets}
                      onChange={handleInputChange}
                      placeholder="e.g., 500"
                      className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="imageUrl" className="text-sm font-semibold text-white">
                    Event Image URL
                  </Label>
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Optional: Provide a URL to an image for your event
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/10">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    size="lg"
                    className="flex-1 glow-effect"
                  >
                    {isSubmitting ? "Updating..." : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => router.back()}
                    className="flex-1 border-white/30 text-white hover:bg-white/10"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8 p-4 bg-cyan-500/20 border border-cyan-500/50 rounded-lg backdrop-blur-sm">
            <p className="text-sm text-cyan-300">
              <strong>Tip:</strong> All fields marked with <span className="text-rose-400">*</span> are required.
              Make sure the event date is in the future and ticket price is non-negative.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}