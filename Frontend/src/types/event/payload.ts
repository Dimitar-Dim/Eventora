export interface ICreateEventPayload {
  name: string
  description: string
  eventDate: string
  genre: string
  ticketPrice: number
  maxTickets: number
  imageUrl?: string | null
  organizerId: number
}

export interface IUpdateEventPayload extends Partial<ICreateEventPayload> {
  id: number
}
