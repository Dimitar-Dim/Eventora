"use client"

import { useState } from "react"
import Link from "next/link"
import { Event } from "@/types/event"

// Mock data for demonstration - Music focused events
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

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-900 via-slate-900 to-purple-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Live
            </h1>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Music Events
            </h2>
            <p className="text-xl md:text-2xl mb-12 text-gray-300 max-w-3xl mx-auto">
              Experience the energy of live music. From techno nights to rock showcases, discover your next favorite show.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/events">
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                  Explore Events
                </button>
              </Link>
              <Link href="/create">
                <button className="bg-transparent border border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                  + Create Event
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white">Upcoming Events</h2>
            <p className="text-gray-400">Discover your next live music experience</p>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="Search events, artists, genres..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 text-white placeholder-gray-400 border border-slate-700 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:border-purple-500"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600">
                All Genres
              </button>
              <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600">
                All Status
              </button>
            </div>
          </div>

          {/* Event Card */}
          <div className="relative">
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl overflow-hidden">
              <div className="relative h-64 md:h-80">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm">UPCOMING</span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm">Rock</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
                    </svg>
                    <span className="text-white font-medium">The Rebels</span>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">Rock Revival Night</h3>
                  <div className="flex items-center gap-4 text-white">
                    <div className="flex items-center gap-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Sat, Jan 13</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>20:00</span>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-2xl font-bold text-white">${mockEvents[0].price}</span>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                      Details
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation dots */}
            <div className="flex justify-center mt-6 gap-2">
              <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
              <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
              <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
            </div>
            <p className="text-center text-gray-400 text-sm mt-2">Auto-scrolling</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Why Choose Eventoria?
            </h2>
            <p className="text-lg text-gray-400">
              Everything you need to discover, create, and manage events
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-purple-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Discover Events</h3>
              <p className="text-gray-400">
                Find amazing events happening in your area with powerful search and filtering
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Create Events</h3>
              <p className="text-gray-400">
                Easily create and publish your own events with our intuitive event creation tools
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Manage Tickets</h3>
              <p className="text-gray-400">
                Handle ticket sales, check-ins, and attendee management all in one place
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
