import { motion } from "framer-motion"
import { Star, Flame, Medal, CheckCircle2 } from "lucide-react"
import { cn } from "../../utils/cn"
import { ProgressBar } from "../ui/ProgressBar"

const icons = {
  bronze: Medal,
  silver: Medal,
  gold: Star,
  platinum: Star,
}

const colors = {
  bronze: "text-amber-600 bg-amber-50 dark:bg-amber-900/10 border-amber-200/30 dark:border-amber-900/20",
  silver: "text-gray-500 bg-gray-50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/30",
  gold: "text-amber-500 bg-amber-50 dark:bg-amber-900/10 border-amber-200/30 dark:border-amber-900/20",
  platinum: "text-violet-500 bg-violet-50 dark:bg-violet-900/10 border-violet-200/30 dark:border-violet-900/20",
}

export function BadgeCard({ badge, earned, progress = 0, onUnlock }) {
  const Icon = icons[badge.type] || Medal
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={cn(
        "flex flex-col items-center gap-3 p-4 rounded-card border transition-all group",
        earned
          ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-card"
          : "bg-gray-50 dark:bg-gray-800/30 border-gray-100 dark:border-gray-700/40 border-dashed opacity-60 grayscale"
      )}
    >
      <div
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center mb-1 shadow-sm border",
          earned ? colors[badge.type] : "bg-gray-200 text-gray-400 dark:bg-gray-700 border-gray-600"
        )}
      >
        <Icon size={22} strokeWidth={2.5} />
      </div>
      <div className="text-center">
        <h4 className={cn("text-sm font-semibold", earned ? "text-gray-900 dark:text-gray-100" : "text-gray-400 dark:text-gray-500")}>
          {badge.name}
        </h4>
        <p className={cn("text-[11px] leading-tight", earned ? "text-gray-500 dark:text-gray-400" : "text-gray-300 dark:text-gray-600")}>
          {badge.criterion}
        </p>
      </div>
      {!earned && progress > 0 && (
        <div className="w-full">
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Progress</p>
          <ProgressBar value={progress} max={100} className="h-1.5" />
        </div>
      )}
      {!earned && progress === 0 && (
        <button
          onClick={onUnlock}
          className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mt-1"
        >
          Start quiz
        </button>
      )}
      {earned && (
        <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">
          Earned
        </span>
      )}
    </motion.div>
  )
}
