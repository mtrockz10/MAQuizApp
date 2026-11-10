import { BookOpen, Trophy, Medal, AlertCircle } from "lucide-react"

const icons = {
  quizzes: BookOpen,
  leaderboard: Trophy,
  badges: Medal,
  error: AlertCircle,
}

export function EmptyState({ type = "quizzes", title, description, action, actionLabel }) {
  const Icon = icons[type]
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center rounded-card p-6 border border-dashed border-gray-200 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30">
      <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4 text-gray-400">
        <Icon size={28} strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-semibold heading text-gray-900 dark:text-gray-100 mb-1">{title || "Nothing here yet"}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{description}</p>
      {action && actionLabel && (
        <button className="btn-primary" onClick={action}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}
