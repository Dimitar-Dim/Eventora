"use client"

import { env } from "@/config/env"
import { ISeatInfo, ISeatState, SeatReservationMessage } from "@/types/seat"

type SeatUpdateCallback = (seats: ISeatState[]) => void

class SeatReservationService {
  private ws: WebSocket | null = null
  private eventId: number | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private callbacks: Set<SeatUpdateCallback> = new Set()
  private userId: string | null = null

  private getOrCreateUserId(): string {
    if (typeof window === 'undefined') {
      if (!this.userId) {
        this.userId = `server-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }
      return this.userId
    }

    if (this.userId) {
      return this.userId
    }

    let userId = sessionStorage.getItem("seat-reservation-user-id")
    if (!userId) {
      userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem("seat-reservation-user-id", userId)
    }
    this.userId = userId
    return userId
  }

  connect(eventId: number) {
    if (this.ws?.readyState === WebSocket.OPEN && this.eventId === eventId) {
      return
    }

    this.disconnect()
    this.eventId = eventId

    const userId = this.getOrCreateUserId()
    const wsUrl = env.API_BASE_URL.replace(/^http/, "ws")
    const url = `${wsUrl}/ws/seats?***REMOVED***Id}`

    try {
      this.ws = new WebSocket(url)

      this.ws.onopen = () => {
        this.reconnectAttempts = 0
      }

      this.ws.onmessage = (event) => {
        try {
          const message: SeatReservationMessage = JSON.parse(event.data)
          this.handleMessage(message)
        } catch {
          // Ignore malformed messages to keep the connection alive
        }
      }

      this.ws.onerror = () => {
        this.ws?.close()
      }

      this.ws.onclose = () => {
        this.attemptReconnect()
      }
    } catch {
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.eventId) {
      this.reconnectAttempts++
      setTimeout(() => {
        this.connect(this.eventId!)
      }, this.reconnectDelay * this.reconnectAttempts)
    }
  }

  private handleMessage(message: SeatReservationMessage) {
    // Always notify subscribers with the message data
    // The component will handle merging the updates appropriately
    if (message.type === "INITIAL_STATE" && Array.isArray(message.data)) {
      this.notifySubscribers(message.data)
    } else if (
      message.type === "RESERVE" ||
      message.type === "RELEASE" ||
      message.type === "PURCHASE" ||
      message.type === "RESERVATION_EXPIRED"
    ) {
      const seatData = message.data as ISeatState | { eventId: number; sector: string; seatNumber: number }
      const status =
        "status" in seatData
          ? seatData.status
          : message.type === "RESERVE"
          ? "reserved"
          : message.type === "PURCHASE"
          ? "purchased"
          : "available"

      const seatUpdate: ISeatState = {
        eventId: seatData.eventId,
        sector: seatData.sector,
        seatNumber: seatData.seatNumber,
        status,
        ...(("reservedBy" in seatData) && { reservedBy: seatData.reservedBy }),
        ...(("expiresAt" in seatData) && { expiresAt: seatData.expiresAt }),
      }

      this.notifySubscribers([seatUpdate])
    }
  }

  subscribe(callback: SeatUpdateCallback) {
    this.callbacks.add(callback)
    return () => this.callbacks.delete(callback)
  }

  private notifySubscribers(seats: ISeatState[]) {
    this.callbacks.forEach((callback) => callback(seats))
  }

  reserveSeat(seat: ISeatInfo) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const userId = this.getOrCreateUserId()
      const message = {
        type: "RESERVE",
        data: { ...seat, userId }
      }
      this.ws.send(JSON.stringify(message))
    } else {
      this.attemptReconnect()
    }
  }

  releaseSeat(seat: ISeatInfo) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const userId = this.getOrCreateUserId()
      this.ws.send(JSON.stringify({
        type: "RELEASE",
        data: { ...seat, userId }
      }))
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.eventId = null
  }

  getUserId(): string {
    return this.getOrCreateUserId()
  }
}

export const seatReservationService = new SeatReservationService()
