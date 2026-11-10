import { Modal } from "../ui/Modal"
import { Button } from "../ui/Button"
import { AlertTriangle } from "lucide-react"

export function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title = "Confirm action",
  description = "This cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
}) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <div className="flex items-start gap-3 mb-6">
        <AlertTriangle className="mt-1 w-5 h-5 text-amber-500 shrink-0" />
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
