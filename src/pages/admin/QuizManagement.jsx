import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useQuiz } from "../../context/QuizContext"
import { useToast } from "../../context/ToastContext"
import { quizService, questionService } from "../../services/api"
import { Edit, Eye, Play, BookOpen, Search } from "lucide-react"
import { cn } from "../../utils/cn"
import { Card } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { Button } from "../../components/ui/Button"
import { Modal } from "../../components/ui/Modal"
import { ROUTES } from "../../utils/constants"
import { Input } from "../../components/ui/Input"

export default function QuizManagement() {
  const { quizzes, refresh } = useQuiz()
  const navigate = useNavigate()
  const toast = useToast()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [previewQuiz, setPreviewQuiz] = useState(null)

  const filteredQuizzes = quizzes.filter((quiz) => {
    const query = search.trim().toLowerCase()
    const matchesSearch = [quiz.title, quiz.description, quiz.topic]
      .some((value) => value?.toLowerCase().includes(query))
    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "published") === quiz.isPublished
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold heading text-gray-900 dark:text-white">Quiz management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage the question bank and the number drawn for each attempt.</p>
        </div>
      </div>

      {quizzes.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen size={40} className="mx-auto text-gray-400 mb-3" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">No quizzes yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">The assessor quiz is not configured.</p>
        </Card>
      ) : (
        <>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Search quizzes..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            leftIcon={<Search size={16} />}
          />
          <div className="flex gap-2 shrink-0">
            {["all", "published", "draft"].map((filter) => (
              <Button
                key={filter}
                variant="ghost"
                size="sm"
                onClick={() => setStatusFilter(filter)}
                className={statusFilter === filter ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" : ""}
              >
                {filter === "all" ? "All" : filter === "published" ? "Published" : "Drafts"}
              </Button>
            ))}
          </div>
        </div>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Quiz</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Topic</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Difficulty</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Questions</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase text-right">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuizzes.map((quiz) => (
                  <tr key={quiz.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link to={ROUTES.ADMIN_BUILDER(quiz.id)} className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400">
                          {quiz.title}
                        </Link>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{quiz.description}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      <Badge variant="indigo" className="text-[10px]">{quiz.topic}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      <span className={cn("text-xs font-medium", quiz.difficulty === "Easy" ? "text-emerald-600" : quiz.difficulty === "Medium" ? "text-amber-600" : "text-red-600")}>
                        {quiz.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {quiz.questionCount} / {quiz.questionPoolCount ?? quiz.questionCount}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Badge variant={quiz.isPublished ? "mint" : "gray"} className="text-[10px] uppercase">
                        {quiz.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setPreviewQuiz(quiz)} title="Preview" aria-label={`Preview ${quiz.title}`}>
                          <Eye size={16} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.ADMIN_BUILDER(quiz.id))} title="Edit">
                          <Edit size={16} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => togglePublish(quiz)} title={quiz.isPublished ? "Unpublish" : "Publish"}>
                          <Play size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredQuizzes.length === 0 && (
              <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No quizzes match your search and status filters.
              </p>
            )}
          </div>
        </Card>
        </>
      )}

      <Modal
        isOpen={!!previewQuiz}
        onClose={() => setPreviewQuiz(null)}
        title={previewQuiz?.title || "Quiz preview"}
      >
        {previewQuiz && (
          <div className="space-y-4 max-h-[65vh] overflow-y-auto">
            <p className="text-sm text-gray-600 dark:text-gray-300">{previewQuiz.description}</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="indigo">{previewQuiz.topic}</Badge>
              <Badge variant="gray">{previewQuiz.difficulty}</Badge>
              <Badge variant={previewQuiz.isPublished ? "mint" : "gray"}>
                {previewQuiz.isPublished ? "Published" : "Draft"}
              </Badge>
            </div>
            {questionService.listByQuiz(previewQuiz.id).map((question, index) => (
              <div key={question.id} className="rounded-card border border-gray-200 dark:border-gray-700 p-3">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {index + 1}. {question.text}
                </p>
                {question.options?.length > 0 && (
                  <ul className="mt-2 space-y-1 pl-4 text-xs text-gray-500 dark:text-gray-400 list-disc">
                    {question.options.map((option) => <li key={option.id}>{option.text}</li>)}
                  </ul>
                )}
              </div>
            ))}
            {questionService.listByQuiz(previewQuiz.id).length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">This quiz has no questions yet.</p>
            )}
            <Button variant="secondary" onClick={() => { setPreviewQuiz(null); navigate(ROUTES.ADMIN_BUILDER(previewQuiz.id)) }}>
              <Edit size={16} /> Edit questions
            </Button>
          </div>
        )}
      </Modal>

    </div>
  )

  function togglePublish(quiz) {
    try {
      quizService.publish(quiz.id, !quiz.isPublished)
      refresh()
      toast.success(quiz.isPublished ? "Quiz unpublished" : "Quiz published")
    } catch (err) {
      toast.error(err.message)
    }
  }
}
