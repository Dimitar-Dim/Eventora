export type ToastType = "success" | "error" | "info"

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

const toastListeners: Set<(toast: Toast) => void> = new Set()

export const createToast = (message: string, type: ToastType = "info", duration: number = 3000) => {
  const id = Math.random().toString(36).substr(2, 9)
  const toast: Toast = { id, message, type, duration }
  
  toastListeners.forEach(listener => listener(toast))
  
  return id
}

export const subscribeToToasts = (callback: (toast: Toast) => void) => {
  toastListeners.add(callback)
  return () => toastListeners.delete(callback)
}

export const showSuccess = (message: string) => createToast(message, "success", 3000)
export const showError = (message: string) => createToast(message, "error", 4000)
export const showInfo = (message: string) => createToast(message, "info", 3000)
