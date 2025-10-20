"use client"

import { useState, useEffect } from "react"
import { Event } from "@/types/event"
import { GENRES } from "@/lib/constants"
import { EventList } from "@/components/event-list"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const mockEvents: Event[] = [
	{
		id: 1,
		title: "Tech Conference 2024",
		description:
			"Join us for the biggest tech conference of the year featuring industry leaders and innovative workshops.",
		date: "2024-03-15",
		time: "10:00",
		genre: "Technology",
		artist: "TechCorp",
		price: 299,
		capacity: 500,
		image: "/rock.jpg",
		status: "upcoming",
		organizer: "TechCorp"
	},
	{
		id: 2,
		title: "Music Festival Summer",
		description:
			"Experience the best music acts from around the world in this amazing outdoor festival.",
		date: "2024-06-20",
		time: "18:00",
		genre: "Music",
		artist: "MusicEvents Inc",
		price: 150,
		capacity: 2000,
		image: "/rock.jpg",
		status: "upcoming",
		organizer: "MusicEvents Inc"
	},
	{
		id: 3,
		title: "Food & Wine Expo",
		description:
			"Discover culinary delights and fine wines from local and international vendors.",
		date: "2024-04-10",
		time: "12:00",
		genre: "Food & Drink",
		artist: "Culinary Events",
		price: 75,
		capacity: 800,
		image: "/rock.jpg",
		status: "ended",
		organizer: "Culinary Events"
	},
	{
		id: 4,
		title: "Business Networking Night",
		description:
			"Connect with like-minded professionals and grow your business network.",
		date: "2024-02-28",
		time: "19:00",
		genre: "Business",
		artist: "NetworkPro",
		price: 50,
		capacity: 200,
		image: "/rock.jpg",
		status: "ended",
		organizer: "NetworkPro"
	},
	{
		id: 5,
		title: "Art Gallery Opening",
		description:
			"Celebrate the opening of our new contemporary art exhibition featuring local artists.",
		date: "2024-05-15",
		time: "17:00",
		genre: "Art & Culture",
		artist: "Gallery Modern",
		price: 25,
		capacity: 150,
		image: "/rock.jpg",
		status: "upcoming",
		organizer: "Gallery Modern"
	},
	{
		id: 6,
		title: "Fitness Bootcamp",
		description:
			"High-intensity workout session suitable for all fitness levels. Bring water and a towel!",
		date: "2024-03-01",
		time: "07:00",
		genre: "Sports & Fitness",
		artist: "FitLife Training",
		price: 20,
		capacity: 30,
		image: "/rock.jpg",
		status: "live",
		organizer: "FitLife Training"
	},
]

export default function EventsPage() {
	const [searchTerm, setSearchTerm] = useState("")
	const [selectedGenre, setSelectedGenre] = useState("All Genres")
	const [filteredEvents, setFilteredEvents] = useState<Event[]>(mockEvents)

	useEffect(() => {
		let filtered = mockEvents

		if (searchTerm.trim() !== "") {
			filtered = filtered.filter(
				(event) =>
					event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
					event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
		      event.genre.toLowerCase().includes(searchTerm.toLowerCase())
			)
		}

		if (selectedGenre !== "All Genres") {
			filtered = filtered.filter(
				(event) => event.genre === selectedGenre
			)
		}

		setFilteredEvents(filtered)
	}, [searchTerm, selectedGenre])

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

				<div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-6 mb-8 glow-effect">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label
								htmlFor="search"
								className="block text-sm font-medium text-foreground mb-3"
							>
								Search Events
							</label>
							<Input
								id="search"
								type="text"
								placeholder="Search by title, description, or genre..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="bg-input/80 border-border/50 focus:border-primary transition-all duration-300"
							/>
						</div>

						<div>
							<label
								htmlFor="category"
								className="block text-sm font-medium text-foreground mb-3"
							>
								Category
							</label>
							<select
								id="category"
								value={selectedGenre}
								onChange={(e) => setSelectedGenre(e.target.value)}
								className="flex h-10 w-full rounded-md border border-border/50 bg-secondary/80 px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-300"
							>
								{GENRES.map((genre) => (
									<option key={genre} value={genre} className="bg-popover text-foreground">
										{genre}
									</option>
								))}
							</select>
						</div>
					</div>

					{(searchTerm || selectedGenre !== "All Genres") && (
						<div className="mt-6 pt-6 border-t border-border/30">
							<Button
								variant="outline"
								onClick={() => {
									setSearchTerm("")
									setSelectedGenre("All Genres")
								}}
								className="bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 hover:border-primary transition-all duration-300 glow-effect"
							>
								Clear Filters
							</Button>
						</div>
					)}
				</div>

				<EventList events={filteredEvents} />
			</div>
		</div>
	)
}