import { motion } from "framer-motion"
import { AlertCircle, CheckCircle, Info, X } from "lucide-react"
import { cn } from "../../utils/cn"

const icons = { success: CheckCircle, error: AlertCircle, info: Info }
const colors = {
  success: "border-emerald-200 bg-white text-emerald-950 dark:border-emerald-800 dark:bg-gray-800 dark:text-emerald-100",
  error: "border-red-200 bg-white text-red-950 dark:border-red-800 dark:bg-gray-800 dark:text-red-100",
  info: "border-blue-200 bg-white text-blue-950 dark:border-blue-800 dark:bg-gray-800 dark:text-blue-100",
}
const iconColors = {
  success: "text-emerald-600 dark:text-emerald-400",
  error: "text-red-600 dark:text-red-400",
  info: "text-blue-600 dark:text-blue-400",
}

export function Toast({ toast, onRemove }) {
  const Icon = icons[toast.type] || Info
  return (
    <motion.div
      layout
      initial={{ y: 16, opacity: 0, scale: 0.98 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 8, opacity: 0, scale: 0.98 }}
      role={toast.type === "error" ? "alert" : "status"}
      aria-live={toast.type === "error" ? "assertive" : "polite"}
      className={cn(
        "pointer-events-auto flex w-full items-start gap-3 rounded-xl border px-4 py-3.5 text-left shadow-xl ring-1 ring-black/5 backdrop-blur",
        colors[toast.type]
      )}
    >
      <div className={cn("mt-0.5 flex shrink-0", iconColors[toast.type])}>
        <Icon size={20} strokeWidth={2.2} aria-hidden="true" />
      </div>
      <p className="min-w-0 flex-1 text-sm font-medium leading-5 break-words">
        {toast.message}
      </p>
      <button
        type="button"
        onClick={onRemove}
        className="btn-icon -mr-1 -mt-1 shrink-0 p-1.5"
        aria-label="Dismiss notification"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </motion.div>
  )
}

export function Toaster() {
  return null
}
