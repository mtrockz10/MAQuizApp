import { motion } from "framer-motion"
import { cn } from "../../utils/cn"

export function ProgressBar({ value = 0, max = 100, className, label, showLabel = true }) {
  const pct = max ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
  return (
    <div className={cn("w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden", className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="h-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 shadow-glow"
      />
    </div>
  )
}

export function CircularProgress({ value = 0, size = 56, className, stroke = 6 }) {
  const pct = Math.min(100, Math.max(0, value))
  const strokeDasharray = 283 // circumference of r=45 circle
  const strokeDashoffset = strokeDasharray - (pct / 100) * strokeDasharray
  const color = pct >= 80 ? "text-mint" : pct >= 50 ? "text-amber-500" : "text-indigo-500"
  return (
    <div className={cn("relative", className)}>
      <svg
        className="block"
        width={size}
        height={size}
        viewBox="0 0 56 56"
      >
        <circle cx="28" cy="28" r="22" stroke="gray-200 dark:gray-700" strokeWidth={stroke} fill="none" className="dark:text-gray-700" />
        <circle
          cx="28"
          cy="28"
          r="22"
          stroke="currentColor"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn("transition-all duration-700 ease-out", color)}
          style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{Math.round(pct)}%</span>
      </div>
    </div>
  )
}
