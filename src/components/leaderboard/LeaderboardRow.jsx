import { motion } from "framer-motion"
import { cn } from "../../utils/cn"

export function LeaderboardRow({ entry, isMe = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "flex items-center gap-4 px-4 py-3 rounded-card border transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50",
        isMe ? "bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-200/30 dark:border-indigo-900/30" : "bg-white dark:bg-gray-800 dark:border-gray-700"
      )}
    >
      <div className={cn("shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shadow-sm", isMe ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300")}>
        {entry.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {entry.name}
          </span>
          {isMe && (
            <span className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 px-2 py-0.5 rounded-full font-semibold uppercase tracking-tighter">
              You
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{entry.course}</p>
      </div>
      <div className="text-right">
        <span className={cn("text-sm font-bold", isMe ? "text-indigo-600 dark:text-indigo-400" : "text-gray-900 dark:text-gray-100")}>
          {entry.points}
        </span>
        <span className="text-[10px] text-gray-400 dark:text-gray-500">pts</span>
      </div>
    </motion.div>
  )
}
