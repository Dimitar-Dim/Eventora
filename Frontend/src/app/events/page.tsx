"use client"

import { useState, useEffect } from "react"
import { Event } from "@/types/event"
import { API_BASE_URL } from "@/lib/constants"
import { EventList } from "@/components/event-list"

export default function EventsPage() {
	console.log("EventsPage mounted")
	const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		console.log("useEffect running - fetching events")
		const fetchEvents = async () => {
			try {
				setIsLoading(true)
				const url = `${API_BASE_URL}/events`
				console.log("Fetching from:", url)
				const response = await fetch(url)
				console.log("Response status:", response.status)
				if (!response.ok) throw new Error(`Failed to fetch events: ${response.status}`)
				const data = await response.json()
				console.log("Fetched data:", data)
				setFilteredEvents(data)
			} catch (err) {
				console.error("Fetch error:", err)
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
					<div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg backdrop-blur-sm">
						<p className="text-red-300 font-medium">✕ {error}</p>
					</div>
				)}

				{isLoading && (
					<div className="text-center py-12">
						<p className="text-foreground text-lg">Loading events...</p>
					</div>
				)}

				{!isLoading && (
					<EventList events={filteredEvents} />
				)}
			</div>
		</div>
	)
}