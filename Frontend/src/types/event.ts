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
  organizer: string
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
