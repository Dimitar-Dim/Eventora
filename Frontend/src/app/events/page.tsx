"use client"

import { useState, useEffect, useMemo } from "react"
import { Event } from "@/types/event"
import { EventGrid } from "@/components/event-grid"
import { ***REMOVED***vice/eventService"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"

export default function EventsPage() {
	const [events, setEvents] = useState<Event[]>([])
	const [showMine, setShowMine] = useState(false)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const { user } = useAuth()

	const isOrganizer = user?.role === "organizer" || user?.role === "admin"
	const ownerId = user ? Number(user.id) : null

	useEffect(() => {
		const fetchEvents = async () => {
			try {
				setIsLoading(true)
				const data = await eventService.getAll()
				setEvents(data)
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to load events")
			} finally {
				setIsLoading(false)
			}
		}

		fetchEvents()
	}, [])

	const displayedEvents = useMemo(() => {
		if (!showMine || ownerId === null) {
			return events
		}
		return events.filter((event) => event.organizerId === ownerId)
	}, [events, showMine, ownerId])

	const handleToggleMyEvents = () => {
		setShowMine((prev) => !prev)
	}

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

				{isOrganizer && (
					<div className="flex justify-center mb-8">
						<Button
							variant={showMine ? "default" : "outline"}
							onClick={handleToggleMyEvents}
							className="min-w-[160px]"
							data-cy="toggle-my-events"
						>
							{showMine ? "Show All Events" : "My Events"}
						</Button>
					</div>
				)}

			{error && (
				<div className="mb-6 p-4 bg-destructive/20 border border-destructive/50 rounded-lg backdrop-blur-sm">
					<p className="text-destructive font-medium">✕ {error}</p>
				</div>
			)}
				{isLoading && (
					<div className="text-center py-12">
						<p className="text-foreground text-lg">Loading events...</p>
					</div>
				)}

				{!isLoading && displayedEvents.length === 0 && (
					<div className="text-center py-16 text-muted-foreground">
						{showMine ? "You haven't created any events yet." : "No events found."}
					</div>
				)}

				{!isLoading && displayedEvents.length > 0 && (
					<EventGrid events={displayedEvents} />
				)}
			</div>
		</div>
	)
}