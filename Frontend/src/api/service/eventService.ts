import { ApiService } from "../apiService";
import { IEvent, ICreateEventPayload, IPurchaseTicketPayload, IPurchaseTicketResponse } from "@/types/event";

const apiService = new ApiService();

export const eventService = {
  /** Get all events */
  getAll: async () => {
    return await apiService.get<IEvent[]>({
      endpoint: "/api/events",
    });
  },

  /** Get single event by ID */
  getById: async (id: number) => {
    return await apiService.get<IEvent>({
      endpoint: `/api/events/${id}`,
    });
  },

  /** Create new event (requires auth) */
  create: async (payload: ICreateEventPayload) => {
    return await apiService.post<IEvent>({
      endpoint: "/api/events",
      config: {
        body: payload,
        requiresAuth: true,
      },
    });
  },

  /** Update existing event (requires auth) */
  update: async (id: number, payload: Partial<ICreateEventPayload>) => {
    return await apiService.put<IEvent>({
      endpoint: `/api/events/${id}`,
      config: {
        body: payload,
        requiresAuth: true,
      },
    });
  },

  /** Delete event (requires auth) */
  delete: async (id: number) => {
    return await apiService.delete<{ message: string }>({
      endpoint: `/api/events/${id}`,
      config: {
        requiresAuth: true,
      },
    });
  },

  /** Purchase a single ticket for the given event */
  purchaseTicket: async (
    id: number,
    payload?: IPurchaseTicketPayload,
    options?: { requiresAuth?: boolean }
  ) => {
    return await apiService.post<IPurchaseTicketResponse>({
      endpoint: `/api/events/${id}/tickets`,
      config: {
        requiresAuth: options?.requiresAuth ?? false,
        body: payload,
      },
    });
  },
};
