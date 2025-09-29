"use client"

import { useState, useEffect } from "react"
import { Event } from "@/types/event"
import EventList from "@/components/event-list"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

// Mock data - in a real app, this would come from an API
const mockEvents: Event[] = [
  {
    id: 1,
    title: "Tech Conference 2024",
    description: "Join us for the biggest tech conference of the year featuring industry leaders and innovative workshops.",
    date: "2024-03-15T10:00:00Z",
    time: "10:00",
    location: "Convention Center, San Francisco",
    price: 299,
    capacity: 500,
    category: "Technology",
    organizer: "TechCorp",
    imageUrl: "/placeholder.jpg",
    tags: ["technology", "conference", "networking"],
    isPublished: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: 2,
    title: "Music Festival Summer",
    description: "Experience the best music acts from around the world in this amazing outdoor festival.",
    date: "2024-06-20T18:00:00Z",
    time: "18:00",
    location: "Central Park, New York",
    price: 150,
    capacity: 2000,
    category: "Music",
    organizer: "MusicEvents Inc",
    imageUrl: "/placeholder.svg",
    tags: ["music", "festival", "outdoor"],
    isPublished: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: 3,
    title: "Food & Wine Expo",
    description: "Discover culinary delights and fine wines from local and international vendors.",
    date: "2024-04-10T12:00:00Z",
    time: "12:00",
    location: "Exhibition Hall, Chicago",
    price: 75,
    capacity: 800,
    category: "Food & Drink",
    organizer: "Culinary Events",
    imageUrl: "/placeholder.svg",
    tags: ["food", "wine", "expo"],
    isPublished: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: 4,
    title: "Business Networking Night",
    description: "Connect with like-minded professionals and grow your business network.",
    date: "2024-02-28T19:00:00Z",
    time: "19:00",
    location: "Downtown Hotel, Los Angeles",
    price: 50,
    capacity: 200,
    category: "Business",
    organizer: "NetworkPro",
    imageUrl: "/placeholder.svg",
    tags: ["business", "networking", "professional"],
    isPublished: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: 5,
    title: "Art Gallery Opening",
    description: "Celebrate the opening of our new contemporary art exhibition featuring local artists.",
    date: "2024-05-15T17:00:00Z",
    time: "17:00",
    location: "Modern Art Gallery, Boston",
    price: 25,
    capacity: 150,
    category: "Art & Culture",
    organizer: "Gallery Modern",
    imageUrl: "/placeholder.svg",
    tags: ["art", "gallery", "culture"],
    isPublished: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: 6,
    title: "Fitness Bootcamp",
    description: "High-intensity workout session suitable for all fitness levels. Bring water and a towel!",
    date: "2024-03-01T07:00:00Z",
    time: "07:00",
    location: "Riverside Park, Portland",
    price: 20,
    capacity: 30,
    category: "Sports & Fitness",
    organizer: "FitLife Training",
    imageUrl: "/placeholder.svg",
    tags: ["fitness", "outdoor", "bootcamp"],
    isPublished: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  }
]

const categories = [
  "All Categories",
  "Technology",
  "Music",
  "Food & Drink",
  "Business",
  "Art & Culture",
  "Sports & Fitness"
]

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(mockEvents)

  useEffect(() => {
    let filtered = mockEvents

    // Filter by search term
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.organizer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter(event => event.category === selectedCategory)
    }

    setFilteredEvents(filtered)
  }, [searchTerm, selectedCategory])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">All Events</h1>
          <p className="text-gray-600">
            Discover amazing events happening in your area
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Events
              </label>
              <Input
                id="search"
                type="text"
                placeholder="Search by title, description, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {(searchTerm || selectedCategory !== "All Categories") && (
            <div className="mt-4 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory("All Categories")
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        {/* Events List */}
        <EventList events={filteredEvents} />
      </div>
    </div>
  )
}