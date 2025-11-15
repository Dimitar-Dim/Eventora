"use client"

import { useState, useEffect } from "react"
import { Event } from "@/types/event"
import { EventGrid } from "@/components/event-grid"
import { ***REMOVED***vice/eventService"

export default function EventsPage() {
	const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const fetchEvents = async () => {
			try {
				setIsLoading(true)
				const data = await eventService.getAll()
				setFilteredEvents(data)
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to load events")
			} finally {
				setIsLoading(false)
			}
		}

		fetchEvents()
	}, [])

	return (
		<div className="min-h-screen bg-background py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="mb-8 text-center">
					<h1 className="text-4xl font-bold text-foreground mb-4 gradient-text">
						All Events
					</h1>
					<p className="text-muted-foreground text-lg">
						Discover amazing events
					</p>
				</div>

			{error && (
				<div className="mb-6 p-4 bg-destructive/20 border border-destructive/50 rounded-lg backdrop-blur-sm">
					<p className="text-destructive font-medium">✕ {error}</p>
				</div>
			)}				{isLoading && (
					<div className="text-center py-12">
						<p className="text-foreground text-lg">Loading events...</p>
					</div>
				)}

				{!isLoading && (
					<EventGrid events={filteredEvents} />
				)}
			</div>
		</div>
	)
}