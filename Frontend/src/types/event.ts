export interface Event {
  id: number
  name: string
  description: string
  eventDate: string // ISO 8601 datetime
  genre: "Rock" | "Pop" | "Folk" | "Classical" | "Jazz" | "Metal" | "Techno"
  ticketPrice: number
  maxTickets: number
  availableTickets: number
  imageUrl?: string
  isActive: boolean
  organizerId: number
  createdAt: string
  updatedAt: string
}

export interface EventFormData {
  name: string
  description: string
  eventDate: string // datetime-local format for input
  genre: string
  ticketPrice: number
  maxTickets: number
  imageUrl: string
}

export interface Ticket {
  id: string
  event: Event
  qrCode: string
  status: "valid" | "used" | "expired"
  purchaseDate: string
  usedAt?: string
  purchasePrice: number
  number: string
}
