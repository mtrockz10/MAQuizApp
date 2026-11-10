import { useMemo, useState } from "react"
import { useQuiz } from "../../context/QuizContext"
import { useToast } from "../../context/ToastContext"
import { Search, Download, User, Clock, Mail, Eye } from "lucide-react"
import { Card } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Modal } from "../../components/ui/Modal"
import { questionService, userService } from "../../services/api"

export default function ResultsView() {
  const { submissions, quizzes } = useQuiz()
  const toast = useToast()
  const [search, setSearch] = useState("")
  const [quizFilter, setQuizFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const students = useMemo(() => userService.listStudents(), [])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return submissions
      .filter((submission) => {
        const student = students.find((item) => item.id === submission.userId)
        const quiz = quizzes.find((item) => item.id === submission.quizId)
        const matchesSearch = [
          student?.name,
          student?.username,
          submission.userId,
          quiz?.title || submission.quizTitle,
        ].some((value) => value?.toLowerCase().includes(query))
        return (quizFilter === "all" || submission.quizId === quizFilter) && matchesSearch
      })
      .sort((a, b) => sortBy === "score"
        ? b.score - a.score
        : sortBy === "points"
          ? b.pointsEarned - a.pointsEarned
          : new Date(b.completedAt) - new Date(a.completedAt))
  }, [submissions, students, quizzes, quizFilter, search, sortBy])

  const exportCSV = () => {
    const escapeCell = (value) => {
      const text = String(value ?? "").replaceAll('"', '""')
      const safeText = /^[=+\-@]/.test(text) ? `'${text}` : text
      return `"${safeText}"`
    }
    const header = ["Student", "Username", "User ID", "Quiz", "Score (%)", "Points", "Accuracy (%)", "Streak Bonus", "Completed At"]
    const rows = filtered.map((submission) => {
      const student = students.find((item) => item.id === submission.userId)
      const quiz = quizzes.find((item) => item.id === submission.quizId)
      return [
        student?.name || submission.userId,
        student?.username,
        submission.userId,
        quiz?.title || submission.quizTitle || "Archived quiz",
        submission.score,
        submission.pointsEarned,
        submission.accuracy,
        `${submission.streakBonus}x`,
        submission.completedAt,
      ]
    })
    const csv = [header, ...rows].map((row) => row.map(escapeCell).join(",")).join("\r\n")
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `immersionquest-results-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
    toast.success(`Exported ${filtered.length} result${filtered.length === 1 ? "" : "s"} to CSV`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold heading text-gray-900 dark:text-white">Results</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Review student scores and export reports.</p>
        </div>
        <Button variant="primary" onClick={exportCSV} className="flex items-center gap-2">
          <Download size={18} /> Export CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <StatCard title="Total attempts" icon={<Mail className="text-indigo-500" />} value={submissions.length} />
        <StatCard title="Students with attempts" icon={<User className="text-violet-500" />} value={new Set(submissions.map((s) => s.userId)).size} />
        <StatCard title="Avg score" icon={<Clock className="text-amber-500" />} value={submissions.length ? Math.round(submissions.reduce((a, b) => a + b.score, 0) / submissions.length) + "%" : "0%"} />
        <StatCard title="Total points awarded" icon={<Search className="text-emerald-500" />} value={submissions.reduce((a, b) => a + b.pointsEarned, 0)} />
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <Input
          placeholder="Search by user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search size={16} strokeWidth={2} />}
          className="w-64"
        />
        <Button variant="ghost" size="sm" onClick={() => setQuizFilter("all")} className={quizFilter === "all" ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" : ""}>
          All quizzes
        </Button>
        {quizzes.map((q) => (
          <Button key={q.id} variant="ghost" size="sm" onClick={() => setQuizFilter(q.id)} className={quizFilter === q.id ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" : ""}>
            {q.title}
          </Button>
        ))}
        <select
          className="input w-auto py-2"
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          aria-label="Sort results"
        >
          <option value="newest">Newest first</option>
          <option value="score">Highest score</option>
          <option value="points">Most points</option>
        </select>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Student</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Quiz</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase text-center">Score</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase text-center">Points</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase text-center">Accuracy</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase text-center">Bonus</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Completed</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase text-right">Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((s) => {
                  const quiz = quizzes.find((q) => q.id === s.quizId)
                  const student = students.find((item) => item.id === s.userId)
                  return (
                    <tr key={s.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-900 dark:text-gray-100">{student?.name || "Unknown student"}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">@{student?.username || s.userId}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{quiz?.title || s.quizTitle || "Archived quiz"}</td>
                      <td className="px-4 py-3 text-sm text-center font-medium text-gray-900 dark:text-gray-100">{s.score}%</td>
                      <td className="px-4 py-3 text-sm text-center text-amber-600 dark:text-amber-400 font-medium">{s.pointsEarned}</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-600 dark:text-gray-400">{s.accuracy}%</td>
                      <td className="px-4 py-3 text-sm text-center">{s.streakBonus > 1 ? <span className="text-amber-600 dark:text-amber-400 font-bold">2×</span> : "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{new Date(s.completedAt).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedSubmission(s)} title="View answers" aria-label="View submission answers">
                          <Eye size={16} />
                        </Button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">No results match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={!!selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
        title="Submission details"
      >
        {selectedSubmission && (
          <div className="space-y-4 max-h-[65vh] overflow-y-auto">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <p>{students.find((student) => student.id === selectedSubmission.userId)?.name || selectedSubmission.userId}</p>
              <p>{quizzes.find((quiz) => quiz.id === selectedSubmission.quizId)?.title || selectedSubmission.quizTitle || "Archived quiz"} · {selectedSubmission.score}%</p>
            </div>
            {(selectedSubmission.answers || []).map((answer, index) => (
              <div key={answer.questionId} className="rounded-card border border-gray-200 dark:border-gray-700 p-3">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {index + 1}. {questionText(selectedSubmission.quizId, answer.questionId)}
                </p>
                <p className={`mt-2 text-xs ${answer.correct ? "text-emerald-600" : "text-red-600"}`}>
                  {answer.correct ? "Correct" : "Incorrect"} · Answer: {formatAnswer(selectedSubmission.quizId, answer.questionId, answer.answer)}
                </p>
                {!answer.correct && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Correct answer: {formatCorrectAnswer(selectedSubmission.quizId, answer.questionId)}
                  </p>
                )}
              </div>
            ))}
            {(!selectedSubmission.answers || selectedSubmission.answers.length === 0) && (
              <p className="text-sm text-gray-500 dark:text-gray-400">Answer-level details are not available for this attempt.</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  )

  function questionText(quizId, questionId) {
    const question = questionService.listByQuiz(quizId).find((item) => item.id === questionId)
    return question?.text || "Question unavailable"
  }

  function formatAnswer(quizId, questionId, answer) {
    const question = questionService.listByQuiz(quizId).find((item) => item.id === questionId)
    if (question?.type === "multiple_choice") return question.options?.[Number(answer)]?.text || "No answer"
    if (question?.type === "true_false") return String(answer).toLowerCase() === "true" ? "True" : "False"
    return answer || "No answer"
  }

  function formatCorrectAnswer(quizId, questionId) {
    const question = questionService.listByQuiz(quizId).find((item) => item.id === questionId)
    if (question?.type === "multiple_choice") return question.options?.[Number(question.correctAnswer)]?.text || question.correctAnswer
    if (question?.type === "true_false") return String(question.correctAnswer).toLowerCase() === "true" ? "True" : "False"
    return (question?.acceptedAnswers || []).join(", ") || "Unavailable"
  }
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
