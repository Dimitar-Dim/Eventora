"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { IEventFormData, GENRES } from "@/types/event"
import { getAuthToken, getRoleFromToken } from "@/utils/auth"
import { showSuccess, showError } from "@/utils/toast"
import { ***REMOVED***vice/eventService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ErrorAlert } from "@/components/form/ErrorAlert"
import { PageHeader } from "@/components/layout/PageHeader"

export default function CreateEventPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [maxTickets, setMaxTickets] = useState<number | string>(600)

  const [formData, setFormData] = useState<IEventFormData>({
    name: "",
    description: "",
    eventDate: "",
    genre: "",
    ticketPrice: "",
    standingCapacity: 600,
    hasSeating: false,
    seatingLayout: "NONE",
    imageUrl: ""
  })

  const seatedCapacityValue = formData.hasSeating
    ? (formData.seatingLayout === "FLOOR_BALCONY" ? 600 : 300)
    : 0

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: ['ticketPrice', 'standingCapacity'].includes(name)
        ? (value === '' ? '' : Number(value))
        : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const seatedCapacity = formData.hasSeating
      ? (formData.seatingLayout === "FLOOR_BALCONY" ? 600 : 300)
      : 0
    const standingCapacity = Number(formData.standingCapacity || 0)
    const totalCapacityFallback = seatedCapacity + standingCapacity
    const maxTicketsValue = maxTickets === "" ? totalCapacityFallback : Number(maxTickets)

    try {
      const role = getRoleFromToken()
      const token = getAuthToken()

      if (!token) {
        throw new Error("Please log in as an organizer to create events")
      }

      if (!role || role === "USER") {
        throw new Error("Only organizers or admins can create events")
      }

      if (!formData.name.trim()) throw new Error("Event name is required")
      if (!formData.description.trim()) throw new Error("Description is required")
      if (!formData.eventDate) throw new Error("Event date and time are required")
      if (!formData.genre) throw new Error("Genre is required")
      if (formData.ticketPrice === '' || formData.ticketPrice === null) throw new Error("Ticket price is required")
      if (Number(formData.ticketPrice) < 0) throw new Error("Ticket price must be non-negative")
      if (standingCapacity < 0 || standingCapacity > 600) throw new Error("Standing capacity must be between 0 and 600")
      if (Number.isNaN(maxTicketsValue) || maxTicketsValue <= 0) throw new Error("Total tickets must be greater than zero")

      const totalCapacity = maxTicketsValue
      if (totalCapacity <= 0) throw new Error("Total capacity must be greater than zero")

      const eventDateTime = new Date(formData.eventDate).toISOString()

      let imageUrl = formData.imageUrl.trim() || null

      if (!imageUrl && imageFile) {
        const upload = await eventService.uploadImage(imageFile)
        imageUrl = upload.url
      }

      const requestBody = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        eventDate: eventDateTime,
        genre: formData.genre,
        ticketPrice: parseFloat(formData.ticketPrice.toString()),
        maxTickets: totalCapacity,
        standingCapacity,
        seatingLayout: formData.hasSeating ? formData.seatingLayout : "NONE",
        hasSeating: formData.hasSeating,
        imageUrl
      }

      const event = await eventService.create(requestBody)
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
      <PageHeader
        title={<span className="gradient-text">Create New Event</span>}
        subtitle="Share your event with the community and reach music enthusiasts"
      />

      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {error && <ErrorAlert message={error} />}

          <Card className="border-border bg-card/50 backdrop-blur-sm shadow-xl">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-2xl text-foreground">Event Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-sm font-semibold text-foreground">
                    Event Name <span className="text-destructive">*</span>
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
                    data-cy="event-name-input"
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="text-lg font-semibold text-foreground">Seating & Standing</h3>
                  <div className="flex items-center gap-3">
                    <input
                      id="hasSeating"
                      name="hasSeating"
                      type="checkbox"
                      checked={formData.hasSeating}
                      onChange={(e) => setFormData(prev => ({ ...prev, hasSeating: e.target.checked, seatingLayout: e.target.checked ? "FLOOR" : "NONE" }))}
                      className="h-4 w-4"
                      data-cy="event-has-seating-toggle"
                    />
                    <Label htmlFor="hasSeating" className="text-sm font-semibold text-foreground">
                      Enable seating (otherwise standing only)
                    </Label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="standingCapacity" className="text-sm font-semibold text-foreground">
                        Standing Capacity (0-600)
                      </Label>
                      <Input
                        id="standingCapacity"
                        name="standingCapacity"
                        type="number"
                        min="0"
                        max="600"
                        value={formData.standingCapacity}
                        onChange={handleInputChange}
                        className="mt-2"
                        data-cy="event-standing-capacity-input"
                      />
                    </div>

                    <div>
                      <Label htmlFor="seatingLayout" className="text-sm font-semibold text-foreground">
                        Seating Layout
                      </Label>
                      <Select
                        value={formData.seatingLayout}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, seatingLayout: value as IEventFormData["seatingLayout"] }))}
                        disabled={!formData.hasSeating}
                      >
                        <SelectTrigger className="mt-2 border-border/30 bg-background/10 focus:bg-background/20 focus:border-primary/30" data-cy="event-seating-layout-select">
                          <SelectValue placeholder="Choose layout" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FLOOR">Floor (300 seats)</SelectItem>
                          <SelectItem value="FLOOR_BALCONY">Floor + Balcony (600 seats)</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="mt-2">
                        <Label htmlFor="seatedCapacity" className="sr-only">Seated capacity</Label>
                        <Input
                          id="seatedCapacity"
                          value={seatedCapacityValue}
                          readOnly
                          className="text-sm"
                          data-cy="event-seated-capacity-input"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Seated capacity: {seatedCapacityValue}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-semibold text-foreground">
                    Description <span className="text-destructive">*</span>
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
                    data-cy="event-description-input"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="eventDate" className="text-sm font-semibold text-foreground">
                      Date & Time <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="eventDate"
                      name="eventDate"
                      type="datetime-local"
                      required
                      value={formData.eventDate}
                      onChange={handleInputChange}
                      className="mt-2"
                      data-cy="event-date-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="genre" className="text-sm font-semibold text-foreground">
                      Genre <span className="text-destructive">*</span>
                    </Label>
                    <Select value={formData.genre} onValueChange={(value) => setFormData(prev => ({ ...prev, genre: value }))}>
                      <SelectTrigger className="mt-2 border-border/30 bg-background/10 focus:bg-background/20 focus:border-primary/30" data-cy="event-genre-select">
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
                    <Label htmlFor="ticketPrice" className="text-sm font-semibold text-foreground">
                      Ticket Price (€) <span className="text-destructive">*</span>
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
                      data-cy="event-ticket-price-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxTickets" className="text-sm font-semibold text-foreground">
                      Total Tickets <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="maxTickets"
                      name="maxTickets"
                      type="number"
                      min="1"
                      value={maxTickets}
                      onChange={(e) => setMaxTickets(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="e.g., 100"
                      className="mt-2"
                      data-cy="event-max-tickets-input"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="imageUrl" className="text-sm font-semibold text-foreground">
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
                  <p className="text-xs text-muted-foreground mt-1">
                    Optional: Provide a URL to an image for your event
                  </p>
                </div>

                <div>
                  <Label htmlFor="imageFile" className="text-sm font-semibold text-foreground">
                    Upload Image
                  </Label>
                  <Input
                    id="imageFile"
                    name="imageFile"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    If URL is provided, it will be used; otherwise the uploaded image will be saved on the server.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    size="lg"
                    className="flex-1 glow-effect"
                    data-cy="create-event-submit"
                  >
                    {isSubmitting ? "Creating..." : "Create Event"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => router.back()}
                    className="flex-1"
                    disabled={isSubmitting}
                    data-cy="create-event-cancel"
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