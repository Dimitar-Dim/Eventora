"use client"
import Link from "next/link"
import EventList from "@/components/event-list"
import { Event } from "@/types/event"

// Mock data
const mockEvents: Event[] = [
  {
    id: 1,
    title: "Rock Revival Night",
    description: "Experience the energy of live music. From techno nights to rock showcases, discover your next favorite show.",
    date: "2025-01-13T20:00:00Z",
    time: "20:00",
    location: "The Rebels",
    price: 20,
    capacity: 500,
    category: "Rock",
    organizer: "The Rebels",
    imageUrl: "/rock-band-on-stage-with-purple-lighting.jpg",
    tags: ["rock", "live", "music"],
    isPublished: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: 2,
    title: "Techno Underground",
    description: "Deep beats and electronic vibes in an underground setting.",
    date: "2025-01-15T22:00:00Z",
    time: "22:00",
    location: "Club Underground",
    price: 35,
    capacity: 300,
    category: "Techno",
    organizer: "Electronic Collective",
    imageUrl: "/dark-techno-club-with-purple-lights.jpg",
    tags: ["techno", "electronic", "underground"],
    isPublished: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: 3,
    title: "Dubstep Revolution",
    description: "Heavy bass and mind-blowing drops with purple neon atmosphere.",
    date: "2025-01-18T21:00:00Z",
    time: "21:00",
    location: "Bass Arena",
    price: 30,
    capacity: 800,
    category: "Dubstep",
    organizer: "Bass Masters",
    imageUrl: "/dubstep-concert-with-heavy-bass-and-purple-neon.jpg",
    tags: ["dubstep", "bass", "electronic"],
    isPublished: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  }
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-black via-purple-900/20 to-black py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              Live
            </h1>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Music Events
            </h2>
            <p className="text-xl md:text-2xl mb-12 text-gray-500 max-w-3xl mx-auto">
              Experience the energy of live music. From techno nights to rock showcases, discover your next favorite show.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/events">
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105">
                  Explore Events
                </button>
              </Link>
              <Link href="/create">
                <button className="bg-transparent border-2 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105">
                  + Create Event
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white">Upcoming Events</h2>
            <p className="text-gray-400">Discover your next live music experience</p>
          </div>

          <EventList events={mockEvents} />
        </div>
      </section>
    </div>
  )
}