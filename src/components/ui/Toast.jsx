import { motion } from "framer-motion"
import { CheckCircle, AlertCircle, Info } from "lucide-react"
import { cn } from "../../utils/cn"

const icons = { success: CheckCircle, error: AlertCircle, info: Info }
const colors = {
  success: "bg-mint/10 border-mint/20 text-emerald-800 dark:text-mint-300 dark:border-emerald-500/30",
  error: "bg-red-50 border-red-100 text-red-800 dark:text-red-400 dark:border-red-900/30",
  info: "bg-blue-50 border-blue-100 text-blue-800 dark:text-blue-400 dark:border-blue-900/30",
}

export function Toast({ toast, onRemove }) {
  const Icon = icons[toast.type] || Info
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      className={cn(
        "toast w-full flex items-start gap-3 px-4 py-3 rounded-card shadow-lg border",
        colors[toast.type]
      )}
    >
      <div className="mt-0.5 flex shrink-0">
        <Icon size={18} strokeWidth={2.5} />
      </div>
      <div className="text-sm font-medium leading-none">{toast.message}</div>
      <button
        onClick={onRemove}
        className="ml-auto shrink-0 opacity-50 hover:opacity-100 transition-opacity p-1"
        aria-label="Dismiss"
      >
        <span className="sr-only">Dismiss</span>
        <span className="w-0 h-0"></span>
      </button>
    </motion.div>
  )
}

export function Toaster() {
  // Toaster is rendered by app root; toasts managed via context
  return null
}
