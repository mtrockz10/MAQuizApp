import { motion } from "framer-motion"
import { cn } from "../../utils/cn"

export function ProgressIndicator({ current, total, className }) {
  const pct = total ? ((current) / total) * 100 : 0
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between text-xs font-semibold tracking-wide uppercase text-gray-500 dark:text-gray-400">
        <span>Question {Math.min(current, total)} of {total}</span>
        <span>{Math.round(pct)}% complete</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="h-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 shadow-glow"
        />
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mt-1">
        {[1, Math.ceil(total / 2), total].map((n) => (
          <span key={n}>{n}</span>
        ))}
      </div>
    </div>
  )
}
