// Auth domain
export type {
  IUser,
  ILoginResponse,
  IRegisterPayload,
  IAuthContext,
  IValidationError,
  IAuthError,
  ITokenPayload,
} from "./auth"

// Event domain
export type {
  IGenre,
  IEvent,
  IEventFormData,
  ITicket,
  Event,
  EventFormData,
  Ticket,
  ICreateEventPayload,
  IUpdateEventPayload,
} from "./event"

// Ticket domain
export type {
  IUserTicket,
  TicketStatus,
} from "./ticket"

// Re-export constants
export { GENRES } from "./event/genre"

// Utility types
export type { IEnv } from "./IEnv"
