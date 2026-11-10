import { AnimatePresence } from "framer-motion"
import { useToast } from "../../context/ToastContext"
import { Toast } from "./Toast"

export function Toaster() {
  const { toasts, remove } = useToast()
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-5 z-[100] flex justify-center px-4 sm:bottom-6"
      aria-label="Notifications"
    >
      <div className="flex w-full max-w-md flex-col gap-2">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onRemove={() => remove(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
