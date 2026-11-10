import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { cn } from "../../utils/cn"

export function PointsDisplay({ points, className }) {
  return (
    <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200/50 dark:border-indigo-900/30", className)}>
      <Star size={16} strokeWidth={2} className="text-amber-500" />
      <motion.span
        className="text-sm font-semibold text-indigo-700 dark:text-indigo-300"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, repeatType: "mirror" }}
      >
        {points}
      </motion.span>
      <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">pts</span>
    </div>
  )
}
