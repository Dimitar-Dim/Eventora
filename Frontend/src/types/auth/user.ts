export interface IUser {
  id: string
  username: string
  email: string
  role: "USER" | "ORGANIZER" | "ADMIN" | "user" | "organizer" | "admin"
  verified: boolean
  createdAt: string
  updatedAt: string
  verifiedAt?: string | null
}
