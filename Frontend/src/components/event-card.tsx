"use client"

import Image from "next/image"
import Link from "next/link"
import { Event } from "@/types/event"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { formatDate, formatTime } from "@/lib/utils"

interface EventCardProps {
  event: Event
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48">
        <Image
          src={event.imageUrl || "/placeholder.svg"}
          alt={event.title}
          fill
          className="object-cover"
        />
        {event.category && (
          <div className="absolute top-2 left-2">
            <span className="bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-medium">
              {event.category}
            </span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className="bg-black bg-opacity-75 text-white px-2 py-1 rounded-md text-xs">
            ${event.price}
          </span>
        </div>
      </div>
      
      <CardHeader>
        <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
        <div className="text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(event.date)} at {formatTime(event.date)}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {event.location}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-gray-700 text-sm line-clamp-3">{event.description}</p>
        <div className="mt-2 text-xs text-gray-500">
          Organized by {event.organizer}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {event.capacity} spots available
        </div>
        <div className="flex gap-2">
          <Link href={`/events/${event.id}`}>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </Link>
          <Button size="sm">
            Buy Ticket
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}