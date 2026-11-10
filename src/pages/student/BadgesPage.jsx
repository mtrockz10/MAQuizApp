import { useState } from "react"
import { useQuiz } from "../../context/QuizContext"
import { useAuth } from "../../context/AuthContext"
import { Star, Flame, Medal, Trophy, CheckCircle2, Lock } from "lucide-react"
import { cn } from "../../utils/cn"
import { Card } from "../../components/ui/Card"
import { ProgressBar } from "../../components/ui/ProgressBar"
import { BadgeCard } from "../../components/badges/BadgeCard"
import { Button } from "../../components/ui/Button"

export default function BadgesPage() {
  const { user } = useAuth()
  const { badges: allBadges } = useQuiz()
  const [filter, setFilter] = useState("all")

  const earnedIds = user?.badges || []
  const filtered = allBadges.filter((b) => filter === "all" || (filter === "earned") === earnedIds.includes(b.id))

  const filters = [
    { key: "all", label: "All" },
    { key: "earned", label: "Earned" },
    { key: "locked", label: "Locked" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold heading text-gray-900 dark:text-white">Badges &amp; achievements</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Collect badges as you complete quizzes and keep your streak alive.</p>
        </div>
        <div className="flex gap-2">
          {filters.map((f) => (
            <Button
              key={f.key}
              variant="ghost"
              size="sm"
              onClick={() => setFilter(f.key)}
              className={cn(
                "px-3 py-2 rounded-button text-sm font-medium",
                filter === f.key
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              )}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-2">
        <div className="flex items-center gap-2">
          <Star size={16} className="text-amber-500" />
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{earnedIds.length} / {allBadges.length} badges</span>
        </div>
        <ProgressBar value={allBadges.length ? Math.round((earnedIds.length / allBadges.length) * 100) : 0} max={100} className="flex-1 h-2" />
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {filtered.length > 0 ? (
          filtered.map((badge) => {
            const earned = earnedIds.includes(badge.id)
            return (
              <BadgeCard key={badge.id} badge={badge} earned={earned} progress={earned ? 100 : 0} onUnlock={() => {}} />
            )
          })
        ) : (
          <div className="col-span-full">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No badges match this filter.</p>
          </div>
        )}
      </div>
    </div>
  )
}
