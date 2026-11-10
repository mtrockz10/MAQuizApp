import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useQuiz } from "../../context/QuizContext"
import { useAuth } from "../../context/AuthContext"
import { questionService } from "../../services/api"
import confetti from "canvas-confetti"
import { ArrowRight, RefreshCw, Trophy } from "lucide-react"
import { Card } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { getAnswerText, getCorrectAnswerText } from "../../utils/quizAnswers"

export default function ResultsPage() {
  const { submissionId } = useParams()
  const navigate = useNavigate()
  const { submissions, quizzes, badges, loading } = useQuiz()
  const { user } = useAuth()

  const submission = submissions.find((item) => item.id === submissionId && item.userId === user?.id)
  const newBadges = (submission?.newlyUnlocked || [])
    .map((badgeId) => badges.find((badge) => badge.id === badgeId))
    .filter(Boolean)

  useEffect(() => {
    if (!submission) return
    const end = Date.now() + 2000
    const interval = setInterval(() => {
      if (Date.now() > end) { clearInterval(interval); return }
      confetti({ particleCount: 50, angle: 60, spread: 100, origin: { x: 0, y: 0.6 }, colors: ["#4F46E5", "#7C3AED", "#FFB020", "#2DD4A7"] })
      confetti({ particleCount: 50, angle: 120, spread: 100, origin: { x: 1, y: 0.6 }, colors: ["#4F46E5", "#7C3AED", "#FFB020", "#2DD4A7"] })
    }, 200)
    return () => clearInterval(interval)
  }, [submission])

  if (!submission) {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-gray-500 dark:text-gray-400">Loading results...</p>
        </div>
      )
    }
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-4">This quiz result could not be found.</p>
        <Button variant="primary" onClick={() => navigate("/student/library")}>Back to quiz library</Button>
      </div>
    )
  }

  const quiz = quizzes.find((q) => q.id === submission.quizId)
  const missed = submission.answers.filter((a) => !a.correct)

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold heading text-gray-900 dark:text-white">Quiz complete!</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{quiz?.title || submission.quizTitle || "Archived quiz"}</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/student/library")}>
          <ArrowRight size={16} className="mr-2" /> Back to library
        </Button>
      </div>

      <Card className="p-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="col-span-3 md:col-span-1">
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold heading text-indigo-600 dark:text-indigo-400">{submission.score}%</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Score</span>
            </div>
          </div>
          <div className="col-span-3 md:col-span-1">
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold heading text-amber-500 dark:text-amber-400">{submission.pointsEarned}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Points earned</span>
            </div>
          </div>
          <div className="col-span-3 md:col-span-1">
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold heading text-emerald-500 dark:text-emerald-400">{submission.accuracy}%</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Accuracy</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 grid gap-4 md:grid-cols-3">
          <StatMini label="Correct" value={`${submission.answers.filter((a) => a.correct).length} / ${submission.answers.length}`} color="text-emerald-600 dark:text-emerald-400" />
          <StatMini label="Streak bonus" value={submission.streakBonus > 1 ? `${submission.streakBonus}×` : "—"} color={submission.streakBonus > 1 ? "text-amber-600 dark:text-amber-400" : "text-gray-500 dark:text-gray-400"} />
          <StatMini label="Time" value={formatDuration(submission.timeSpent)} color="text-gray-600 dark:text-gray-400" />
        </div>
      </Card>

      {newBadges.length > 0 && (
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-bold heading text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Trophy size={20} strokeWidth={2} className="text-amber-500" />
              New badges unlocked!
            </h2>
            <div className="flex gap-4">
              {newBadges.map((badge) => (
                <div key={badge.id} className="text-center">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                    className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 text-2xl mx-auto mb-2 shadow-glow"
                  >
                    🏅
                  </motion.div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">{badge.name}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {missed.length > 0 && (
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-bold heading text-gray-900 dark:text-white mb-4">Review missed questions</h2>
            <div className="space-y-4">
              {missed.map((ans) => {
                const allQs = questionService.listByQuiz(submission.quizId)
                const q = allQs.find((x) => x.id === ans.questionId)
                return (
                  <Card key={ans.questionId} className="p-4 border-l-4 border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/10">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">{q ? q.text : "Question"}</p>
                    <p className="text-xs text-red-600 dark:text-red-400 font-medium">Your answer: {getAnswerText(q || { type: "identification" }, ans.answer)}</p>
                    {q && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">Correct: {getCorrectAnswerText(q)}</p>
                    )}
                  </Card>
                )
              })}
            </div>
          </div>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button variant="outline" onClick={() => navigate(`/student/quiz/${submission.quizId}`)}>
          <RefreshCw size={18} className="mr-2" /> Retake quiz
        </Button>
        <Button variant="primary" onClick={() => navigate("/student/library")}>
          Next quiz <ArrowRight size={18} className="ml-2" />
        </Button>
      </div>
    </div>
  )
}

function StatMini({ label, value, color }) {
  return (
    <div className="text-center">
      <span className={`text-lg font-bold ${color}`}>{value}</span>
      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</span>
    </div>
  )
}

function formatDuration(seconds = 0) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return minutes ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`
}
