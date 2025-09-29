export interface Event {
  id: number
  title: string
  description: string
  date: string
  time: string
  location: string
  price: number
  capacity: number
  category: string
  organizer: string
  imageUrl?: string
  tags?: string[]
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export interface EventFormData {
  title: string
  description: string
  date: string
  time: string
  location: string
  price: number
  capacity: number
  category: string
  imageUrl?: string
  tags?: string[]
}

export interface Ticket {
  id: number
  eventId: number
  userId: number
  purchaseDate: string
  price: number
  status: 'confirmed' | 'pending' | 'cancelled'
  ticketCode: string
}

export interface User {
  id: number
  name: string
  email: string
  avatar?: string
}