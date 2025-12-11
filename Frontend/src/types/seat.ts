export interface ISeatInfo {
  eventId: number
  sector: string
  seatNumber: number
}

export interface ISeatReservation extends ISeatInfo {
  reservedBy: string
  reservedAt: string
  expiresAt: string
}

export interface ISeatPurchase extends ISeatInfo {
  purchasedBy: string
  purchasedAt: string
}

export type SeatStatus = "available" | "reserved" | "purchased" | "selected"

export interface ISeatState extends ISeatInfo {
  status: SeatStatus
  reservedBy?: string
  expiresAt?: string
}

export type SeatReservationMessage = 
  | { type: "RESERVE"; data: ISeatState }
  | { type: "RELEASE"; data: ISeatInfo }
  | { type: "PURCHASE"; data: ISeatPurchase }
  | { type: "INITIAL_STATE"; data: ISeatState[] }
  | { type: "RESERVATION_EXPIRED"; data: ISeatInfo }
  | { type: "RESERVATION_EXPIRED"; data: ISeatInfo }
