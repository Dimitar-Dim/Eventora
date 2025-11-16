export type TicketStatus = "ACTIVE" | "USED" | "EXPIRED"

export interface IUserTicket {
  ticketId: number
  eventId: number
  eventName: string
  eventDate: string
  issuedTo: string
  qrCode: string
  status: TicketStatus
  ticketPrice: number
  purchasedAt: string
  eventImageUrl?: string | null
}
