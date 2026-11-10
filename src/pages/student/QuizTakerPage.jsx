import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuiz } from "../../context/QuizContext"
import { useAuth } from "../../context/AuthContext"
import { useToast } from "../../context/ToastContext"
import { ArrowLeft, ArrowRight, Clock, Flame, Star } from "lucide-react"
import { Card } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { QuestionCard } from "../../components/quiz/QuestionCard"
import { ProgressIndicator } from "../../components/quiz/ProgressIndicator"
import { StreakFlame } from "../../components/quiz/StreakFlame"
import { PointsDisplay } from "../../components/quiz/PointsDisplay"
import { EmptyState } from "../../components/common/EmptyState"
import { Skeleton } from "../../components/ui/Skeleton"

export default function QuizTakerPage() {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { quizzes, loading, settings, loadQuestions, submitQuiz } = useQuiz()
  const toast = useToast()

  const [questions, setQuestions] = useState([])
  const [questionsLoading, setQuestionsLoading] = useState(true)
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showingFeedback, setShowingFeedback] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [finishError, setFinishError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const startTime = useRef(0)
  const isFinishing = useRef(false)

  const quiz = quizzes.find((item) => item.id === quizId)
  const total = questions.length
  const currentQuestion = questions[current]
  const timeLimitSeconds = Math.max(0, Number(quiz?.timeLimit) || 0) * 60

  useEffect(() => {
    let active = true
    setQuestions([])
    setQuestionsLoading(true)
    setCurrent(0)
    setAnswers({})
    setShowingFeedback(false)
    setQuizStarted(false)
    setFinishError("")

    try {
      const loadedQuestions = loadQuestions(quizId)
      if (active) {
        const configuredCount = Number(quiz?.questionCount)
        const attemptCount = Number.isInteger(configuredCount) && configuredCount > 0
          ? Math.min(configuredCount, loadedQuestions.length)
          : loadedQuestions.length
        const randomizedQuestions = [...loadedQuestions]
        for (let index = randomizedQuestions.length - 1; index > 0; index -= 1) {
          const swapIndex = Math.floor(Math.random() * (index + 1))
          const question = randomizedQuestions[index]
          randomizedQuestions[index] = randomizedQuestions[swapIndex]
          randomizedQuestions[swapIndex] = question
        }
        setQuestions(randomizedQuestions.slice(0, attemptCount))
      }
    } catch (loadError) {
      if (active) setFinishError(loadError.message || "Unable to load quiz questions.")
    } finally {
      if (active) setQuestionsLoading(false)
    }

    return () => {
      active = false
    }
  }, [quizId, quiz?.questionCount, loadQuestions])

  const finishQuiz = useCallback(async () => {
    if (isFinishing.current) return
    isFinishing.current = true
    setSubmitting(true)
    setFinishError("")

    try {
      const timeSpent = Math.floor((Date.now() - startTime.current) / 1000)
      const outcome = await submitQuiz({
        quizId,
        questionIds: questions.map((question) => question.id),
        answers,
        timeSpent,
      })
      navigate(`/student/results/${outcome.submission.id}`, { replace: true })
    } catch (submitError) {
      isFinishing.current = false
      setSubmitting(false)
      setFinishError(submitError.message || "Your answers could not be submitted. Please try again.")
      toast.error(submitError.message || "Your quiz could not be submitted.")
    }
  }, [answers, navigate, questions, quizId, submitQuiz, toast])

  useEffect(() => {
    if (!quizStarted || submitting || !timeLimitSeconds) return undefined
    const timer = window.setInterval(() => {
      setRemainingSeconds((seconds) => Math.max(0, seconds - 1))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [quizStarted, submitting, timeLimitSeconds])

  useEffect(() => {
    if (quizStarted && timeLimitSeconds > 0 && remainingSeconds === 0 && !submitting) finishQuiz()
  }, [finishQuiz, quizStarted, remainingSeconds, submitting, timeLimitSeconds])

  const handleAnswer = useCallback((answer) => {
    setAnswers((previous) => ({ ...previous, [answer.questionId]: answer.answer }))
    setShowingFeedback(true)
  }, [])

  const startQuiz = () => {
    if (!total) return
    startTime.current = Date.now()
    setRemainingSeconds(timeLimitSeconds)
    setQuizStarted(true)
  }

  const nextQuestion = () => {
    setShowingFeedback(false)
    if (current === total - 1) {
      finishQuiz()
    } else {
      setCurrent((index) => index + 1)
    }
  }

  if (loading || questionsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20" aria-label="Loading quiz">
        <Skeleton className="w-64 h-8" />
        <Skeleton className="w-48 h-4 mt-4" />
      </div>
    )
  }

  if (!quiz || !quiz.isPublished) {
    return (
      <EmptyState
        type="quizzes"
        title="Quiz unavailable"
        description="This quiz does not exist or is not currently published."
        action={() => navigate("/student/library")}
        actionLabel="Back to quiz library"
      />
    )
  }

  if (finishError && !quizStarted) {
    return (
      <EmptyState
        type="error"
        title="Unable to load quiz"
        description={finishError}
        action={() => navigate("/student/library")}
        actionLabel="Back to library"
      />
    )
  }

  if (!total) {
    return (
      <EmptyState
        type="quizzes"
        title="No questions yet"
        description="This quiz is published, but it does not have any questions yet."
        action={() => navigate("/student/library")}
        actionLabel="Back to quiz library"
      />
    )
  }

  if (!quizStarted) {
    const streakThreshold = settings?.streakThreshold ?? 3
    const streakMultiplier = settings?.streakMultiplier ?? 2
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold heading text-gray-900 dark:text-white">{quiz.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{quiz.description}</p>
        </div>

        <Card className="p-8">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col items-center text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-card">
              <Flame size={28} className="text-amber-500 mb-2" />
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Current streak</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{user?.streak || 0} days</span>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-card">
              <Star size={28} className="text-amber-400 mb-2" />
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Questions</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{total}</span>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-card">
              <Clock size={28} className="text-indigo-500 mb-2" />
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Time limit</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {timeLimitSeconds ? `${quiz.timeLimit} min` : "No limit"}
              </span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Answer each question and review the feedback before continuing. Your result and points are saved when you finish.
            </p>
            <Button variant="primary" className="w-full md:w-auto px-8" onClick={startQuiz}>
              Start quiz <ArrowRight size={18} />
            </Button>
          </div>
        </Card>

        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-card p-4 border border-indigo-100/30 dark:border-indigo-900/30">
          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-1 uppercase tracking-wider">How scoring works</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Earn points for correct answers. A {streakThreshold}-day streak earns a {streakMultiplier}× points bonus.
          </p>
        </div>
      </div>
    )
  }

  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/student/library")} className="hidden sm:flex">
            <ArrowLeft size={16} /> Back to library
          </Button>
          <StreakFlame streak={user?.streak || 0} className="hidden sm:flex" />
          <PointsDisplay points={user?.points || 0} className="hidden sm:flex" />
        </div>
        <div className="flex-1 sm:max-w-md">
          <ProgressIndicator current={current + 1} total={total} />
        </div>
        {timeLimitSeconds > 0 && (
          <div
            className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold tabular-nums ${
              remainingSeconds <= 60
                ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
            }`}
            role="timer"
            aria-label="Time remaining"
          >
            <Clock size={16} />
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>
        )}
      </div>

      <div className="min-h-[320px]">
        <QuestionCard
          question={currentQuestion}
          currentIndex={current}
          total={total}
          onAnswer={handleAnswer}
          disabled={showingFeedback || submitting}
        />
      </div>

      {finishError && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">{finishError}</p>
      )}
      <div className="flex items-center justify-between pt-2">
        {showingFeedback ? (
          <Button variant="primary" onClick={nextQuestion} disabled={submitting} className="px-8">
            {submitting ? "Submitting..." : current === total - 1 ? "See results" : "Next question"}
            {!submitting && <ArrowRight size={18} />}
          </Button>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400">Choose and submit an answer to continue.</p>
        )}
      </div>
    </div>
  )
}
