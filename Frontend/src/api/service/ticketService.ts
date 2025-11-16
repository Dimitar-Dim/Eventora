import { ApiService } from "../apiService"
import { IUserTicket } from "@/types"

const apiService = new ApiService()

export const ticketService = {
  /** Fetch tickets purchased by the current user */
  getMyTickets: async () => {
    return await apiService.get<IUserTicket[]>({
      endpoint: "/api/tickets/me",
      config: {
        requiresAuth: true,
      },
    })
  },
}
