import { motion } from "framer-motion"
import { Medal, Trophy, Star } from "lucide-react"
import { cn } from "../../utils/cn"

const podiumStyles = {
  1: "bg-amber-50 dark:bg-amber-900/20 border-amber-200/30 dark:border-amber-900/30 shadow-glow",
  2: "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600",
  3: "bg-orange-50 dark:bg-orange-900/10 border-orange-200/30 dark:border-orange-900/20",
}

export function Podium({ top3 }) {
  return (
    <div className="flex items-end justify-center gap-2 py-4 max-w-xl mx-auto">
      {[3, 2, 1].map((pos) => {
        const entry = top3[pos - 1]
        const h = pos === 1 ? 72 : pos === 2 ? 60 : 52
        return (
          <motion.div
            key={pos}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (pos - 1) * 0.1 }}
            className="flex flex-col items-center gap-2"
          >
            <div
              className={cn(
                "w-24 rounded-3xl border p-3 flex flex-col items-center justify-between",
                podiumStyles[pos],
                "min-h-[140px]"
              )}
              style={{ minHeight: `${h}px` }}
            >
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-white/60 dark:bg-white/10 flex items-center justify-center mx-auto mb-1.5 shadow-sm border border-white/40">
                  {entry ? (
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                      {entry.avatar}
                    </span>
                  ) : (
                    <Star size={16} className="text-gray-400" />
                  )}
                </div>
                {entry ? (
                  <div>
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 truncate w-full">
                      {entry.name}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">
                      {entry.points} pts
                    </span>
                  </div>
                ) : (
                  <span className="text-[10px] text-gray-400">—</span>
                )}
              </div>
              <div className="mt-2 flex items-center justify-center gap-1">
                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">#{pos}</span>
                {pos === 1 && <Trophy size={14} className="text-amber-500" />}
              </div>
            </div>
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shadow-lg", podiumStyles[pos])}>
              <Medal size={16} strokeWidth={2} className="text-amber-600" />
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
