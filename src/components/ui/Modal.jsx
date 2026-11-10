import { useEffect } from "react"
import { motion } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "../../utils/cn"
import { Button } from "./Button"

export function Modal({ isOpen, onClose, title, children, footer, closeLabel = "Close" }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          "relative w-full max-w-lg bg-white rounded-card-lg shadow-card-hover border border-gray-100 dark:bg-gray-800 dark:border-gray-700",
          "animate-in"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 id="modal-title" className="text-lg font-semibold heading text-gray-900 dark:text-gray-100">{title}</h2>
          <Button variant="ghost" size="sm" className="btn-icon" onClick={onClose} aria-label={closeLabel}>
            <X size={18} />
          </Button>
        </div>
        <div className="p-6">{children}</div>
        {footer && <div className="border-t border-gray-100 dark:border-gray-700 p-4 flex justify-end gap-2">{footer}</div>}
      </motion.div>
    </div>
  )
}
