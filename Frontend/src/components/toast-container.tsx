"use client"

import { useEffect, useState } from "react"
import { subscribeToToasts, Toast } from "@/lib/toast"

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
            ${toast.type === "success" ? "bg-green-500/90 text-white border border-green-400/50" : ""}
            ${toast.type === "error" ? "bg-red-500/90 text-white border border-red-400/50" : ""}
            ${toast.type === "info" ? "bg-blue-500/90 text-white border border-blue-400/50" : ""}
          `}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}
