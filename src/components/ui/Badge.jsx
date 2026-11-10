import { cn } from "../../utils/cn"

const variantStyles = {
  default: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
  indigo: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  mint: "bg-mint/10 text-emerald-800 dark:bg-emerald-900/30 dark:text-ember-300 border border-emerald-200/50 dark:border-emerald-900/30",
  coral: "bg-coral/10 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
}

export function Badge({ className, variant = "default", children }) {
  return (
    <span className={cn("badge", variantStyles[variant], className)}>
      {children}
    </span>
  )
}
