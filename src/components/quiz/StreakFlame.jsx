import { motion } from "framer-motion"
import { Flame } from "lucide-react"
import { cn } from "../../utils/cn"

export function StreakFlame({ streak, className }) {
  const onFire = streak >= 3
  return (
    <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-900/30", className)}>
      <motion.div
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className={cn("w-5 h-5", onFire ? "text-amber-500 animate-bounce-glow" : "text-gray-400")}
      >
        <Flame strokeWidth={2} />
      </motion.div>
      <span className={cn("text-sm font-semibold", onFire ? "text-amber-700 dark:text-amber-400" : "text-gray-600 dark:text-gray-400")}>
        {streak} Day{streak !== 1 ? "s" : ""} Streak
      </span>
    </div>
  )
}
