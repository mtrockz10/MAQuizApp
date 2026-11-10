import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useQuiz } from "../../context/QuizContext"
import { Flame, Star, ArrowRight, Play, Trophy } from "lucide-react"
import { Card } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { ProgressBar } from "../../components/ui/ProgressBar"
import { Button } from "../../components/ui/Button"
import { Avatar } from "../../components/common/Avatar"
import { EmptyState } from "../../components/common/EmptyState"
import { Skeleton } from "../../components/ui/Skeleton"

export default function HomePage() {
  const { user } = useAuth()
  const { quizzes, loading } = useQuiz()
  const navigate = useNavigate()

  const completedIds = user?.completedQuizzes || []
  const available = quizzes.filter((q) => q.isPublished)
  const inProgress = available.find((q) => !completedIds.includes(q.id))
  const levelProgress = ((user?.points || 0) % 100)
  const level = Math.floor((user?.points || 0) / 100) + 1

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((item) => <Skeleton key={item} className="h-48" />)}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Good to see you,</p>
          <h1 className="text-3xl font-bold heading text-gray-900 dark:text-white leading-tight">
            {user?.name}! 👋
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Avatar user={user} size="lg" isOnline />
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user?.points} pts</span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 capitalize">{user?.role}</span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Streak" icon={<Flame className="text-amber-500" />} value={user?.streak || 0} suffix="days" />
        <StatCard title="Points" icon={<Star className="text-amber-400" />} value={user?.points || 0} suffix="" />
        <StatCard title="Level" icon={<Play className="text-indigo-500" />} value={level} suffix="" />
        <StatCard title="Accuracy" icon={<Trophy className="text-emerald-500" />} value="—" suffix="" />
      </div>

      {/* Continue quiz + level */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold heading text-gray-900 dark:text-white">Keep the streak going</h2>
                <Badge variant="indigo">Continue</Badge>
              </div>
              {inProgress ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{inProgress.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{inProgress.topic} • {inProgress.questionCount} questions</p>
                  </div>
                  <ProgressBar value={(user?.completedQuizzes?.filter(id => id===inProgress.id).length||0) === 0 ? 0 : 100} />
                  <Button variant="primary" className="w-full" onClick={() => navigate(`/student/quiz/${inProgress.id}`)}>
                    <Play size={18} className="mr-2" /> Continue quiz
                  </Button>
                </div>
              ) : (
                <EmptyState type="quizzes" title="No quizzes in progress" description="Great job! Pick a quiz from the library to start." action={() => navigate("/student/library")} actionLabel="Browse library" />
              )}
            </div>
          </Card>

          <div className="mt-6">
            <h2 className="text-lg font-bold heading text-gray-900 dark:text-white mb-4">Recommended quizzes</h2>
            <div className="grid gap-4">
              {available.map((quiz) => (
                <Card key={quiz.id} className="p-0 overflow-hidden card-interactive">
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-900 dark:text-gray-100">{quiz.title}</h3>
                      <Badge variant="indigo" className="text-[10px]">{quiz.difficulty}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{quiz.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{quiz.topic} • {quiz.questionCount} questions</span>
                      <span>{quiz.timeLimit} min</span>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full mt-4"
                      onClick={() => navigate(`/student/quiz/${quiz.id}`)}
                    >
                      Start quiz <ArrowRight size={14} />
                    </Button>
                  </div>
                </Card>
              ))}
              {available.length === 0 && <EmptyState type="quizzes" title="No quizzes available" description="Check back soon for new quizzes." />}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          {/* Level progress */}
          <Card>
            <div className="p-6">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Level {level}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{user?.points} total points</p>
              <ProgressBar value={levelProgress} max={100} />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{levelProgress} / 100 pts to next level</p>
            </div>
          </Card>

          {/* Recent badges */}
          <Card className="mt-6">
            <div className="p-6">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent badges</h2>
              <div className="flex flex-wrap gap-3" id="recent-badges">
                {user?.badges?.slice(0, 4).map((bid) => (
                  <Badge key={bid} variant="amber" className="px-3 py-2 text-xs">{bid}</Badge>
                ))}
                {user?.badges?.length === 0 && <p className="text-xs text-gray-500 dark:text-gray-400">No badges yet — keep going!</p>}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, icon, value, suffix }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">{title}</p>
          <p className="text-2xl font-bold heading text-gray-900 dark:text-white mt-1">{value}{suffix}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500 dark:text-indigo-400">
          {icon}
        </div>
      </div>
    </Card>
  )
}
