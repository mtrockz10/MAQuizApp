import { useMemo } from "react"
import { Link } from "react-router-dom"
import { useQuiz } from "../../context/QuizContext"
import { useAuth } from "../../context/AuthContext"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { Users, Mail, BarChart3, Trophy, Clock, ArrowRight } from "lucide-react"
import { Card } from "../../components/ui/Card"
import { Avatar } from "../../components/common/Avatar"
import { EmptyState } from "../../components/common/EmptyState"
import { userService } from "../../services/api"

export default function AdminDashboard() {
  const { user } = useAuth()
  const { stats, submissions, quizzes, loading } = useQuiz()
  const students = useMemo(() => userService.listStudents(), [])

  if (loading || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-48" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold heading text-gray-900 dark:text-white">Admin dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Overview of your immersion quiz program.</p>
        </div>
        <div className="flex items-center gap-3">
          <Avatar user={user} size="md" isOnline />
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 capitalize">{user?.name}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/admin/quizzes" className="btn-secondary">Manage quizzes <ArrowRight size={16} /></Link>
        <Link to="/admin/results" className="btn-secondary">Review results <ArrowRight size={16} /></Link>
        <Link to="/admin/settings" className="btn-secondary">Points &amp; badges <ArrowRight size={16} /></Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Students" icon={<Users className="text-indigo-500" />} value={stats.totalStudents} />
        <StatCard title="Quizzes" icon={<Mail className="text-violet-500" />} value={stats.totalQuizzes} />
        <StatCard title="Questions" icon={<BarChart3 className="text-amber-500" />} value={stats.totalQuestions} />
        <StatCard title="Avg. score" icon={<Trophy className="text-emerald-500" />} value={`${stats.averageScore}%`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-bold heading text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock size={20} strokeWidth={2} className="text-indigo-500" />
                Recent activity
              </h2>
              {stats.activity.length > 0 ? (
                <ResponsiveContainer height={260}>
                  <LineChart data={stats.activity} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="text-gray-200 dark:text-gray-700" />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b" }} hide />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                    <Legend verticalAlign="top" align="right" height={36} />
                    <Line type="monotone" dataKey="count" stroke="#4F46E5" strokeWidth={3} dot={{ fill: "#4F46E5", strokeWidth: 3 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState type="quizzes" title="No activity yet" description="Quiz submissions will appear here." />
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-5">
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-bold heading text-gray-900 dark:text-white mb-4">Submissions</h2>
              <div className="text-center py-8">
                <span className="text-3xl font-bold heading text-gray-900 dark:text-white">{stats.totalSubmissions}</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">quiz attempts recorded</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold heading text-gray-900 dark:text-white">Recent submissions</h2>
              <Link to="/admin/results" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">View all</Link>
            </div>
            {submissions.length ? (
              <div className="space-y-3">
                {submissions.slice(0, 5).map((submission) => {
                  const student = students.find((item) => item.id === submission.userId)
                  const quiz = quizzes.find((item) => item.id === submission.quizId)
                  return (
                    <div key={submission.id} className="flex items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0 last:pb-0">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{student?.name || "Unknown student"}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{quiz?.title || submission.quizTitle || "Archived quiz"} · {new Date(submission.completedAt).toLocaleDateString()}</p>
                      </div>
                      <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 shrink-0">{submission.score}%</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <EmptyState type="quizzes" title="No submissions yet" description="Student attempts will appear here." />
            )}
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold heading text-gray-900 dark:text-white">Quiz engagement</h2>
              <Link to="/admin/quizzes" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Manage quizzes</Link>
            </div>
            {quizzes.length ? (
              <div className="space-y-4">
                {quizzes
                  .map((quiz) => {
                    const quizSubmissions = submissions.filter((submission) => submission.quizId === quiz.id)
                    const average = quizSubmissions.length
                      ? Math.round(quizSubmissions.reduce((sum, submission) => sum + submission.score, 0) / quizSubmissions.length)
                      : null
                    return { ...quiz, attempts: quizSubmissions.length, average }
                  })
                  .sort((a, b) => b.attempts - a.attempts || a.title.localeCompare(b.title))
                  .slice(0, 5)
                  .map((quiz) => (
                    <div key={quiz.id} className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{quiz.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{quiz.attempts} attempts · {quiz.isPublished ? "Published" : "Draft"}</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 shrink-0">
                        {quiz.average === null ? "—" : `${quiz.average}% avg`}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <EmptyState type="quizzes" title="No quizzes yet" description="Create a quiz to start tracking engagement." />
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ title, icon, value }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">{title}</p>
          <p className="text-2xl font-bold heading text-gray-900 dark:text-white mt-1">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500 dark:text-indigo-400">
          {icon}
        </div>
      </div>
    </Card>
  )
}
