import { useContext } from "react"
import { useToast } from "../../context/ToastContext"
import { Toast } from "./Toast"

export function Toaster() {
  const { toasts, remove } = useToast()
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onRemove={() => remove(t.id)} />
      ))}
    </div>
  )
}
