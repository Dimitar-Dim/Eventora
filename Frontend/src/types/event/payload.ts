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

export interface IPurchaseTicketPayload {
  issuedTo?: string
  deliveryEmail?: string
}

export interface IPurchaseTicketResponse {
  ticketId: number
  eventId: number
  eventName: string
  issuedTo: string
  qrCode: string
  status: string
  remainingTickets: number
  pricePaid: number
  purchasedAt: string
  seatSection: string
  seatRow: string
  seatNumber: string
  deliveryEmail?: string | null
}
