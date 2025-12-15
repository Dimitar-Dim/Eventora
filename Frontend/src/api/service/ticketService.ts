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

  /** Download a PDF for the specified ticket */
  downloadTicket: async (ticketId: number) => {
    return await apiService.get<ArrayBuffer>({
      endpoint: `/api/tickets/${ticketId}/download`,
      config: {
        requiresAuth: true,
        responseType: "arraybuffer",
      },
    })
  },
}
