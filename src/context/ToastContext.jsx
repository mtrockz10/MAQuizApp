import { createContext, useContext, useState, useCallback } from "react"

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const add = useCallback(
    (toast) => {
      const id = Date.now() + Math.random()
      setToasts((prev) => [...prev, { ...toast, id }])
      return id
    },
    []
  )

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const success = useCallback((msg) => add({ type: "success", message: msg }), [add])
  const error = useCallback((msg) => add({ type: "error", message: msg }), [add])
  const info = useCallback((msg) => add({ type: "info", message: msg }), [add])

  const value = { toasts, add, remove, success, error, info }
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within a ToastProvider")
  return ctx
}
