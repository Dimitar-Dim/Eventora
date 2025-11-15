"use client"

import { useEffect, useState } from "react"
import { subscribeToToasts, Toast } from "@/utils/toast"

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const unsubscribe = subscribeToToasts((toast) => {
      setToasts(prev => [...prev, toast])

      if (toast.duration) {
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== toast.id))
        }, toast.duration)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`
            pointer-events-auto
            px-4 py-3 rounded-lg
            font-medium text-sm
            backdrop-blur-sm
            animate-slide-in-right
            ${toast.type === "success" ? "bg-primary/90 text-primary-foreground border border-primary/50" : ""}
            ${toast.type === "error" ? "bg-destructive/90 text-destructive-foreground border border-destructive/50" : ""}
            ${toast.type === "info" ? "bg-accent/90 text-accent-foreground border border-accent/50" : ""}
          `}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}
