import { createContext, useContext, useEffect, useState, useCallback } from "react"
import {
  quizService,
  questionService,
  submissionService,
  badgeService,
  statsService,
  settingsService,
} from "../services/api"
import { isAnswerCorrect } from "../utils/quizAnswers"

const QuizContext = createContext(null)

export function QuizProvider({ children }) {
  const [quizzes, setQuizzes] = useState([])
  const [questionsByQuiz, setQuestionsByQuiz] = useState({})
  const [submissions, setSubmissions] = useState([])
  const [badges, setBadges] = useState([])
  const [stats, setStats] = useState(null)
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true)
      setQuizzes(quizService.list())
      setSubmissions(submissionService.list())
      setBadges(badgeService.list())
      setStats(statsService.dashboard())
      setSettings(settingsService.get())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const loadQuestions = useCallback((quizId) => {
    const qs = questionService.listEnabledByQuiz(quizId)
    setQuestionsByQuiz((prev) => ({ ...prev, [quizId]: qs }))
    return qs
  }, [])

  const getQuestionsForQuiz = useCallback(
    (quizId) => questionsByQuiz[quizId] || [],
    [questionsByQuiz]
  )

  const submitQuiz = useCallback(
    async ({ quizId, questionIds, answers, timeSpent }) => {
      const userStr = localStorage.getItem("iq_user")
      const user = userStr ? JSON.parse(userStr) : null
      if (!user) throw new Error("Not authenticated")

      const allQuizQuestions = questionService.listByQuiz(quizId)
      const selectedIds = Array.isArray(questionIds) ? new Set(questionIds) : null
      const quizQs = selectedIds
        ? allQuizQuestions.filter((question) => question.enabled !== false && selectedIds.has(question.id))
        : allQuizQuestions.filter((question) => question.enabled !== false)
      if (quizQs.length === 0) throw new Error("No valid quiz questions were submitted.")
      let pointsEarned = 0
      let correctCount = 0
      const currentSettings = settingsService.get()
      const today = new Date().toDateString()
      const lastQuiz = user.lastQuizDate ? new Date(user.lastQuizDate).toDateString() : null
      const yesterday = new Date(Date.now() - 86400000).toDateString()
      const effectiveStreak = lastQuiz === today
        ? user.streak
        : lastQuiz === yesterday
          ? user.streak + 1
          : 1
      const streakBonus =
        effectiveStreak >= currentSettings.streakThreshold ? currentSettings.streakMultiplier : 1

      const answerResults = quizQs.map((q) => {
        const ans = answers[q.id]
        const isCorrect = isAnswerCorrect(q, ans)
        const difficultyPoints = currentSettings.pointsByDifficulty[q.difficulty]
        const pointsPerAnswer = q.pointsOverride ? q.points : (difficultyPoints ?? q.points)
        const pts = isCorrect ? pointsPerAnswer * streakBonus : 0
        pointsEarned += pts
        if (isCorrect) correctCount += 1
        return { questionId: q.id, answer: ans, correct: isCorrect, pointsEarned: pts }
      })

      const accuracy = quizQs.length ? Math.round((correctCount / quizQs.length) * 100) : 0
      const submission = {
        quizId,
        userId: user.id,
        score: accuracy,
        pointsEarned,
        accuracy,
        streakBonus,
        answers: answerResults,
        timeSpent,
      }

      const created = submissionService.create(submission)

      // update user points / streak
      const completedQuizzes = [...new Set([...(user.completedQuizzes || []), quizId])]
      const updatedUser = { ...user, points: user.points + pointsEarned, completedQuizzes }
      if (lastQuiz !== today) {
        updatedUser.streak = effectiveStreak
        updatedUser.longestStreak = Math.max(updatedUser.longestStreak, updatedUser.streak)
      }
      updatedUser.lastQuizDate = today
      localStorage.setItem("iq_user", JSON.stringify(updatedUser))
      window.dispatchEvent(new Event("iq-user-updated"))

      // badge unlocks
      const newlyUnlocked = []
      const quizzes = quizService.list()
      const leaderboard = submissionService.leaderboard()
      badges.forEach((badge) => {
        const legacyRules = {
          "badge-first-quiz": "first_quiz",
          "badge-streak-5": "streak",
          "badge-perfect": "perfect_score",
          "badge-top-10": "top_10",
          "badge-quiz-master": "quiz_master",
          "badge-communicator": "topic",
        }
        const rule = badge.rule || legacyRules[badge.id]
        const threshold = Number(badge.threshold) || (rule === "streak" ? 5 : rule === "top_10" ? 10 : 1)
        const earned = {
          first_quiz: completedQuizzes.length >= threshold,
          streak: updatedUser.streak >= threshold,
          perfect_score: accuracy >= (Number(badge.threshold) || 100),
          top_10: (leaderboard.find((entry) => entry.userId === user.id)?.rank || Infinity) <= threshold,
          quiz_master: completedQuizzes.length >= quizzes.length,
          topic: (badge.topic || "Communication") === quizService.get(quizId)?.topic,
        }[rule]
        if (earned && badgeService.unlock(user.id, badge.id)) newlyUnlocked.push(badge.id)
      })
      submissionService.update(created.id, { newlyUnlocked })

      // refresh lists
      setSubmissions(submissionService.list())
      setStats(statsService.dashboard())
      setBadges(badgeService.list())

      return {
        submission: created,
        pointsEarned,
        accuracy,
        streakBonus,
        newlyUnlocked,
        correctCount,
        total: quizQs.length,
      }
    },
    [badges]
  )

  return (
    <QuizContext.Provider
      value={{
        quizzes,
        questions: questionsByQuiz,
        submissions,
        badges,
        stats,
        settings,
        loading,
        loadQuestions,
        getQuestionsForQuiz,
        submitQuiz,
        refresh: fetchAll,
      }}
    >
      {children}
    </QuizContext.Provider>
  )
}

export const useQuiz = () => {
  const ctx = useContext(QuizContext)
  if (!ctx) throw new Error("useQuiz must be used within a QuizProvider")
  return ctx
}
