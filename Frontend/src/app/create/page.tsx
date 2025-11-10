"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { EventFormData } from "@/types/event"
import { GENRES, API_BASE_URL } from "@/lib/constants"
import { getAuthHeader } from "@/lib/auth"
import { showSuccess, showError } from "@/lib/toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CreateEventPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<EventFormData>({
    name: "",
    description: "",
    eventDate: "",
    genre: "",
    ticketPrice: "",
    maxTickets: "",
    imageUrl: ""
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'ticketPrice' || name === 'maxTickets' ? (value === '' ? '' : Number(value)) : value
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
      if (formData.ticketPrice === '' || formData.ticketPrice === null) throw new Error("Ticket price is required")
      if (Number(formData.ticketPrice) < 0) throw new Error("Ticket price must be non-negative")
      if (formData.maxTickets === '' || formData.maxTickets === null) throw new Error("Max tickets is required")
      if (Number(formData.maxTickets) < 1) throw new Error("Max tickets must be at least 1")

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

      const response = await fetch(`${API_BASE_URL}/api/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader()
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        let errorMessage = `Failed to create event (${response.status})`
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch {
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const event = await response.json()
      showSuccess("Event created! 🎉 Redirecting...")
      
      setTimeout(() => {
        router.push(`/edit/${event.id}?created=true`)
      }, 1500)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      showError(errorMessage)
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/10" />
        <div className="relative max-w-2xl mx-auto z-10">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3 text-white">
            <span className="gradient-text">Create New Event</span>
          </h1>
          <p className="text-gray-300 text-lg">
            Share your event with the community and reach music enthusiasts
          </p>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
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
                    className="mt-2"
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
                    className="mt-2"
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
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="genre" className="text-sm font-semibold text-white">
                      Genre <span className="text-rose-400">*</span>
                    </Label>
                    <Select value={formData.genre} onValueChange={(value) => setFormData(prev => ({ ...prev, genre: value }))}>
                      <SelectTrigger className="mt-2 border-border/30 bg-background/10 focus:bg-background/20 focus:border-primary/30">
                        <SelectValue placeholder="Select a genre" />
                      </SelectTrigger>
                      <SelectContent>
                        {GENRES.map((genre) => (
                          <SelectItem key={genre} value={genre}>
                            {genre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ticketPrice" className="text-sm font-semibold text-white">
                      Ticket Price (€) <span className="text-rose-400">*</span>
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
                      className="mt-2"
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
                      className="mt-2"
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
                    className="mt-2"
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
                    {isSubmitting ? "Creating..." : "Create Event"}
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