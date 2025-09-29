"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Ticket, Event } from "@/types/event"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate, formatTime } from "@/lib/utils"

// Mock data - in a real app, this would come from an API
const mockTickets: (Ticket & { event: Event })[] = [
  {
    id: 1,
    eventId: 1,
    userId: 1,
    purchaseDate: "2024-01-15T10:00:00Z",
    price: 299,
    status: "confirmed",
    ticketCode: "TC-2024-001",
    event: {
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
      imageUrl: "/placeholder.svg",
      tags: ["technology", "conference", "networking"],
      isPublished: true,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z"
    }
  },
  {
    id: 2,
    eventId: 2,
    userId: 1,
    purchaseDate: "2024-01-20T14:30:00Z",
    price: 150,
    status: "confirmed",
    ticketCode: "MF-2024-002",
    event: {
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
    }
  },
  {
    id: 3,
    eventId: 4,
    userId: 1,
    purchaseDate: "2024-02-01T09:15:00Z",
    price: 50,
    status: "pending",
    ticketCode: "BN-2024-003",
    event: {
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
    }
  }
]

export default function TicketsPage() {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all')

  const filteredTickets = selectedFilter === 'all' 
    ? mockTickets 
    : mockTickets.filter(ticket => ticket.status === selectedFilter)

  const getStatusBadge = (status: Ticket['status']) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    
    switch (status) {
      case 'confirmed':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const getTotalSpent = () => {
    return mockTickets
      .filter(ticket => ticket.status === 'confirmed')
      .reduce((total, ticket) => total + ticket.price, 0)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">My Tickets</h1>
          <p className="text-gray-600">
            Manage your event tickets and view upcoming events
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockTickets.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Confirmed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {mockTickets.filter(t => t.status === 'confirmed').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${getTotalSpent()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('all')}
              size="sm"
            >
              All Tickets
            </Button>
            <Button
              variant={selectedFilter === 'confirmed' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('confirmed')}
              size="sm"
            >
              Confirmed
            </Button>
            <Button
              variant={selectedFilter === 'pending' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('pending')}
              size="sm"
            >
              Pending
            </Button>
            <Button
              variant={selectedFilter === 'cancelled' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('cancelled')}
              size="sm"
            >
              Cancelled
            </Button>
          </div>
        </div>

        {/* Tickets List */}
        {filteredTickets.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="max-w-md mx-auto">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No tickets found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedFilter === 'all' 
                    ? "You haven't purchased any tickets yet." 
                    : `No ${selectedFilter} tickets found.`
                  }
                </p>
                <div className="mt-6">
                  <Link href="/events">
                    <Button>Browse Events</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <Card key={ticket.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Event Image */}
                    <div className="relative w-full md:w-48 h-32 md:h-auto">
                      <Image
                        src={ticket.event.imageUrl || "/placeholder.svg"}
                        alt={ticket.event.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Ticket Details */}
                    <div className="flex-1 p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {ticket.event.title}
                            </h3>
                            <span className={getStatusBadge(ticket.status)}>
                              {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                            </span>
                          </div>

                          <div className="space-y-1 text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {formatDate(ticket.event.date)} at {formatTime(ticket.event.date)}
                            </div>
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {ticket.event.location}
                            </div>
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                              </svg>
                              Ticket Code: {ticket.ticketCode}
                            </div>
                          </div>

                          <div className="text-sm text-gray-500">
                            Purchased on {formatDate(ticket.purchaseDate)}
                          </div>
                        </div>

                        <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-end">
                          <div className="text-2xl font-bold text-gray-900 mb-2">
                            ${ticket.price}
                          </div>
                          <div className="flex gap-2">
                            <Link href={`/events/${ticket.event.id}`}>
                              <Button variant="outline" size="sm">
                                View Event
                              </Button>
                            </Link>
                            {ticket.status === 'confirmed' && (
                              <Button size="sm">
                                Download Ticket
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}