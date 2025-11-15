export interface IUser {
  id: string
  username: string
  email: string
  role: "user" | "organizer" | "admin"
  createdAt: string
  updatedAt: string
}
