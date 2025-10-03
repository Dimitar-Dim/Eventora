export interface Event {
  id: number
  title: string
  description: string
  date: string
  time: string
  genre: string
  artist: string
  price: number
  capacity: number
  image?: string
  status: "upcoming" | "live" | "ended"
}

export interface Ticket {
  id: string
  eventId: string
  eventTitle: string
  eventDate: string
  eventTime: string
  qrCode: string
  status: "valid" | "used" | "expired"
  purchaseDate: string
}
