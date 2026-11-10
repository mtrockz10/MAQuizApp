import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQuiz } from "../../context/QuizContext"
import { Search, Filter, BookOpen, Clock, ArrowRight } from "lucide-react"
import { cn } from "../../utils/cn"
import { Card } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { EmptyState } from "../../components/common/EmptyState"

const DIFFICULTY_COLOR = {
  Easy: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10",
  Medium: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10",
  Hard: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10",
}

export default function QuizLibraryPage() {
  const { quizzes } = useQuiz()
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [topicFilter, setTopicFilter] = useState("all")

  const publishedQuizzes = quizzes.filter((quiz) => quiz.isPublished)

  const topics = ["all", ...new Set(publishedQuizzes.map((quiz) => quiz.topic))]

  const filtered = publishedQuizzes.filter((quiz) => {
    const matchSearch = quiz.title.toLowerCase().includes(search.toLowerCase()) || quiz.description.toLowerCase().includes(search.toLowerCase())
    const matchTopic = topicFilter === "all" || quiz.topic === topicFilter
    return matchSearch && matchTopic
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold heading text-gray-900 dark:text-white">Quiz Library</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Pick a topic and test your work immersion knowledge.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Input
            placeholder="Search quizzes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64"
            leftIcon={<Search size={16} strokeWidth={2} />}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="ghost" size="sm" onClick={() => setTopicFilter("all")} className={topicFilter === "all" ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" : ""}>
          <Filter size={16} className="mr-2" /> All topics
        </Button>
        {topics.map((topic) => (
          <Button
            key={topic}
            variant="ghost"
            size="sm"
            onClick={() => setTopicFilter(topic)}
            className={topicFilter === topic ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" : ""}
          >
            {topic}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.length > 0 ? (
          filtered.map((quiz) => {
            return (
              <Card key={quiz.id} className="p-0 overflow-hidden card-interactive" onClick={() => navigate(`/student/quiz/${quiz.id}`)}>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="indigo" className="text-[10px]">{quiz.difficulty}</Badge>
                    <Badge variant="mint" className="text-[10px]">Published</Badge>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">{quiz.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{quiz.description}</p>
                  <div className="grid grid-cols-4 gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-1.5">
                      <BookOpen size={14} strokeWidth={2} />
                      <span>{quiz.questionCount} Q</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} strokeWidth={2} />
                      <span>{quiz.timeLimit} min</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>{quiz.topic}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>Available</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4">
                    <span className={cn("text-sm font-semibold", DIFFICULTY_COLOR[quiz.difficulty] || "text-gray-600")}>
                      {quiz.difficulty}
                    </span>
                    <Button variant="primary" size="sm" className="px-3 py-2" onClick={(e) => { e.stopPropagation(); navigate(`/student/quiz/${quiz.id}`) }}>
                      Start <ArrowRight size={14} />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })
        ) : (
          <EmptyState type="quizzes" title="No quizzes found" description="Try adjusting your search or topic filter." action={() => setSearch("")} actionLabel="Clear filters" />
        )}
      </div>
    </div>
  )
}
