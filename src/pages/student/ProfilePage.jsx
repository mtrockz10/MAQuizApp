import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useQuiz } from "../../context/QuizContext"
import { Star, Flame, Trophy, User, Building2, Clock } from "lucide-react"
import { cn } from "../../utils/cn"
import { Card } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { ProgressBar } from "../../components/ui/ProgressBar"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Avatar } from "../../components/common/Avatar"

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const { submissions } = useQuiz()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.name || "")
  const [course, setCourse] = useState(user?.course || "")

  const level = Math.floor((user?.points || 0) / 100) + 1
  const levelProgress = (user?.points || 0) % 100
  const mySubmissions = submissions.filter((s) => s.userId === user?.id)
  const avgScore = mySubmissions.length
    ? Math.round(mySubmissions.reduce((sum, s) => sum + s.score, 0) / mySubmissions.length)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-col items-center lg:items-start gap-4">
          <div className="flex items-center gap-3">
            <Avatar user={user} size="lg" isOnline />
            <div>
              <h1 className="text-2xl font-bold heading text-gray-900 dark:text-white">{user?.name}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user?.course}</p>
          {editing ? (
            <div className="flex gap-2">
              <Input value={name} onChange={(e) => setName(e.target.value)} className="w-48" />
              <Input value={course} onChange={(e) => setCourse(e.target.value)} className="w-48" />
              <Button variant="outline" onClick={() => { setEditing(false); setName(user.name); setCourse(user.course) }}>Cancel</Button>
              <Button variant="primary" onClick={() => { setEditing(false) }}>Save</Button>
            </div>
          ) : (
            <Button variant="ghost" onClick={() => setEditing(true)}>Edit profile</Button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Card className="p-4 text-center min-w-[150px]">
            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1 block">Level</span>
            <span className="text-2xl font-bold heading text-gray-900 dark:text-white">{level}</span>
          </Card>
          <Card className="p-4 text-center min-w-[150px]">
            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1 block">Points</span>
            <span className="text-2xl font-bold heading text-amber-500 dark:text-amber-400">{user?.points}</span>
          </Card>
          <Card className="p-4 text-center min-w-[150px]">
            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1 block">Streak</span>
            <span className="text-2xl font-bold heading text-amber-500 dark:text-amber-400">{user?.streak} days</span>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="p-6">
            <h2 className="text-lg font-bold heading text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User size={20} strokeWidth={2} className="text-indigo-500" />
              Progress overview
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Level progress</span>
                  <span className="text-gray-900 dark:text-gray-100">{levelProgress} / 100 pts</span>
                </div>
                <ProgressBar value={levelProgress} max={100} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Average quiz score</span>
                  <span className="text-gray-900 dark:text-gray-100">{avgScore}%</span>
                </div>
                <ProgressBar value={avgScore} max={100} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Quizzes completed</span>
                  <span className="text-gray-900 dark:text-gray-100">{mySubmissions.length}</span>
                </div>
                <ProgressBar value={Math.min(mySubmissions.length, 3)} max={3} />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-bold heading text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Trophy size={20} strokeWidth={2} className="text-amber-500" />
              Badge showcase
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {user?.badges?.slice(0, 6).map((bid) => (
                <div key={bid} className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/20 border border-amber-200/30 dark:border-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 text-lg">
                    🏅
                  </div>
                  <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 truncate w-full text-center">{bid}</span>
                </div>
              ))}
              {user?.badges?.length === 0 && (
                <p className="col-span-3 text-xs text-gray-500 dark:text-gray-400 text-center pt-4">No badges yet. Start quizzing!</p>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="Card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
        <div className="flex items-center gap-3 p-2 rounded-card bg-gray-50 dark:bg-gray-800/50">
          <User size={20} strokeWidth={2} className="text-gray-500" />
          <span className="text-sm text-gray-700 dark:text-gray-300">@{user?.username}</span>
        </div>
        <div className="flex items-center gap-3 p-2 rounded-card bg-gray-50 dark:bg-gray-800/50">
          <Building2 size={20} strokeWidth={2} className="text-gray-500" />
          <span className="text-sm text-gray-700 dark:text-gray-300">{user?.course}</span>
        </div>
        <Button variant="danger" onClick={logout}>Sign out</Button>
      </div>
    </div>
  )
}
