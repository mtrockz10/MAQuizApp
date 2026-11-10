import { useState } from "react"
import { useQuiz } from "../../context/QuizContext"
import { useAuth } from "../../context/AuthContext"
import { Trophy } from "lucide-react"
import { cn } from "../../utils/cn"
import { Card } from "../../components/ui/Card"
import { ProgressBar } from "../../components/ui/ProgressBar"
import { Button } from "../../components/ui/Button"
import { Podium } from "../../components/leaderboard/Podium"
import { LeaderboardRow } from "../../components/leaderboard/LeaderboardRow"
import { submissionService } from "../../services/api"

const tabs = [
  { key: "all-time", label: "All-time" },
  { key: "weekly", label: "Weekly" },
]

export default function LeaderboardPage() {
  const { user } = useAuth()
  const { quizzes } = useQuiz()
  const [tab, setTab] = useState("all-time")
  const [quizFilter, setQuizFilter] = useState("all")

  const leaderboard = submissionService.leaderboard(quizFilter === "all" ? undefined : quizFilter, tab)
  const me = leaderboard.find((e) => e.userId === user?.id)
  const top3 = leaderboard.slice(0, 3)
  const rest = leaderboard.slice(3)

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold heading text-gray-900 dark:text-white">Leaderboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Compare your points with fellow trainees.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            className="input w-full sm:w-auto py-2"
            value={quizFilter}
            onChange={(event) => setQuizFilter(event.target.value)}
            aria-label="Filter leaderboard by quiz"
          >
            <option value="all">All quizzes</option>
            {quizzes.filter((quiz) => quiz.isPublished).map((quiz) => (
              <option key={quiz.id} value={quiz.id}>{quiz.title}</option>
            ))}
          </select>
          <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-card bg-white dark:bg-gray-800 p-1">
          {tabs.map((t) => (
            <Button
              key={t.key}
              variant="ghost"
              size="sm"
              onClick={() => setTab(t.key)}
              className={cn(
                "rounded-button px-4 py-2 text-sm font-medium",
                tab === t.key
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              )}
            >
              {t.label}
            </Button>
          ))}
          </div>
        </div>
      </div>

      {/* Podium */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-bold heading text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Trophy size={20} strokeWidth={2} className="text-amber-500" />
            Top trainees
          </h2>
          {leaderboard.length > 0 ? (
            <Podium top3={top3} />
          ) : (
            <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              {tab === "weekly" || quizFilter !== "all"
                ? "No quiz points have been earned for this leaderboard yet."
                : "No students are available for the leaderboard yet."}
            </p>
          )}
        </div>
      </Card>

      {/* Own rank pinned */}
      {me && (
        <Card className="border-indigo-200 dark:border-indigo-900/30 bg-indigo-50 dark:bg-indigo-900/20">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xl">
                  {me.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{me.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{me.course}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold heading text-indigo-600 dark:text-indigo-400">#{me.rank}</span>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Your rank</p>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Points</p>
              <ProgressBar value={Math.min(me.points, 2000)} max={2000} />
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{me.points} pts</span>
            </div>
          </div>
        </Card>
      )}

      {/* Full list */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold heading text-gray-900 dark:text-white">Full leaderboard</h2>
            <span className="text-xs text-gray-500 dark:text-gray-400">{leaderboard.length} trainees</span>
          </div>
          <div className="space-y-2">
            {rest.length > 0 ? (
              rest.map((entry) => (
                <LeaderboardRow key={entry.id} entry={entry} isMe={entry.userId === user?.id} />
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No more trainees on this leaderboard.</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
