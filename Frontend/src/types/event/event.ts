import { IGenre } from "./genre"

export interface IEvent {
  id: number
  name: string
  description: string
  eventDate: string
  genre: IGenre
  ticketPrice: number
  maxTickets: number
  availableTickets: number
  standingCapacity: number
  seatedCapacity: number
  hasSeating: boolean
  seatingLayout: "NONE" | "FLOOR" | "FLOOR_BALCONY"
  imageUrl?: string
  isActive: boolean
  organizerId: number
  createdAt: string
  updatedAt: string
}

export interface IEventFormData {
  name: string
  description: string
  eventDate: string
  genre: string
  ticketPrice: number | string
  standingCapacity: number | string
  hasSeating: boolean
  seatingLayout: "NONE" | "FLOOR" | "FLOOR_BALCONY"
  imageUrl: string
}

export interface ITicket {
  id: string
  event: IEvent
  qrCode: string
  status: "valid" | "used" | "expired"
  purchaseDate: string
  usedAt?: string
  purchasePrice: number
  number: string
}

// Export non-prefixed versions for backward compatibility
export type Event = IEvent
export type EventFormData = IEventFormData
export type Ticket = ITicket
