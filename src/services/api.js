/**
 * ImmersionQuest services layer.
 *
 * This is the ONLY place that touches localStorage. Every component talks to
 * the service functions below, so swapping in a real REST API later only
 * requires rewriting this file (and its types) — no component changes needed.
 *
 * Design: each resource has get / create / update / delete helpers that read
 * and write to localStorage under a STORAGE_KEY. Data is seeded on first use.
 */

import {
  QUIZZES,
  QUESTIONS,
  LEGACY_QUIZZES,
  ASSESSOR_QUIZ_ID,
  STUDENTS,
  BADGES,
  INITIAL_SUBMISSIONS,
  STORAGE_KEYS,
  DEMO_ADMIN,
  DEMO_STUDENT,
} from "../data/mockData"

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------
const getStore = (key, defaultValue) => {
  if (typeof window === "undefined") return defaultValue
  try {
    const raw = window.localStorage.getItem(key)
    return raw === null ? defaultValue : JSON.parse(raw)
  } catch (e) {
    console.warn(`Failed to read localStorage key "${key}":`, e)
    return defaultValue
  }
}

const setStore = (key, value) => {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.warn(`Failed to write localStorage key "${key}":`, e)
  }
}

const nowISO = () => new Date().toISOString()
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
const DEFAULT_SETTINGS = {
  pointsByDifficulty: { Easy: 10, Medium: 20, Hard: 30 },
  streakThreshold: 3,
  streakMultiplier: 2,
}
const usernameFromUser = (user) => {
  const username = user.username?.trim() || user.email?.split("@")[0] ||
    user.name?.trim().toLowerCase().replace(/[^a-z0-9._-]+/g, ".") || user.id
  return username.toLowerCase()
}

// ---------------------------------------------------------------------------
// Seed on first boot
// ---------------------------------------------------------------------------
let seeded = false
function ensureSeeded() {
  if (seeded) return
  seeded = true

  const storedQuizzes = getStore(STORAGE_KEYS.QUIZZES, null)
  const storedQuestions = getStore(STORAGE_KEYS.QUESTIONS, null)
  if (storedQuizzes === null) {
    setStore(STORAGE_KEYS.QUIZZES, QUIZZES)
    if (storedQuestions === null) setStore(STORAGE_KEYS.QUESTIONS, QUESTIONS)
  } else if (
    storedQuizzes.some((quiz) => LEGACY_QUIZZES.some((legacy) => legacy.id === quiz.id)) &&
    !storedQuizzes.some((quiz) => quiz.id === ASSESSOR_QUIZ_ID)
  ) {
    setStore(STORAGE_KEYS.QUIZZES, QUIZZES)
    setStore(STORAGE_KEYS.QUESTIONS, QUESTIONS)
  } else if (storedQuestions === null) {
    setStore(STORAGE_KEYS.QUESTIONS, QUESTIONS)
  }
  const storedSubmissions = getStore(STORAGE_KEYS.SUBMISSIONS, null)
  if (storedSubmissions === null) {
    setStore(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS)
  } else {
    const legacyTitles = new Map(LEGACY_QUIZZES.map((quiz) => [quiz.id, quiz.title]))
    const submissions = storedSubmissions.map((submission) => {
      const quizTitle = legacyTitles.get(submission.quizId)
      return quizTitle && !submission.quizTitle
        ? { ...submission, quizTitle }
        : submission
    })
    if (submissions.some((submission, index) => submission !== storedSubmissions[index])) {
      setStore(STORAGE_KEYS.SUBMISSIONS, submissions)
    }
  }
  if (getStore(STORAGE_KEYS.BADGES, null) === null) setStore(STORAGE_KEYS.BADGES, BADGES)
  if (getStore(STORAGE_KEYS.SETTINGS, null) === null)
    setStore(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)

  // Keep demo accounts available even when this browser already has users
  // from an earlier run. Preserve registered accounts and their data.
  const storedUsers = getStore(STORAGE_KEYS.USERS, [])
  const users = (Array.isArray(storedUsers) ? storedUsers : []).map((user) => {
    const username = user.username || usernameFromUser(user)
    return username === user.username ? user : { ...user, username }
  })
  const demoUsers = [
    {
      ...DEMO_ADMIN,
      id: "admin-1",
      role: "admin",
      name: "Admin User",
      avatar: "A",
    },
    {
      ...DEMO_STUDENT,
      id: "student-demo",
      role: "student",
      name: "Demo Student",
      course: "BS Information Technology",
      avatar: "D",
      points: 0,
      level: 1,
      streak: 0,
      completedQuizzes: [],
      badges: [],
    },
    ...STUDENTS.map((s) => ({
      id: s.id,
      email: s.email,
      username: s.email.split("@")[0],
      password: "student123",
      role: "student",
      name: s.name,
      course: s.course,
      avatar: s.avatar,
      points: s.points,
      level: s.level,
      streak: s.streak,
      longestStreak: Math.max(s.streak, 3),
      completedQuizzes: [],
      badges: [],
      joinedAt: nowISO(),
    })),
  ]
  const existingUserIds = new Set(users.map((user) => user.id))
  const missingDemoUsers = demoUsers.filter(
    (user) => !existingUserIds.has(user.id)
  )
  if (missingDemoUsers.length > 0 || users.some((user, index) => user !== storedUsers[index])) {
    setStore(STORAGE_KEYS.USERS, [...users, ...missingDemoUsers])
  }

  const currentUser = getStore(STORAGE_KEYS.USER, null)
  if (currentUser === null) {
    setStore(STORAGE_KEYS.USER, null)
  } else {
    const migratedCurrentUser = {
      ...currentUser,
      username: currentUser.username || usernameFromUser(currentUser),
    }
    if (migratedCurrentUser.username !== currentUser.username) {
      setStore(STORAGE_KEYS.USER, migratedCurrentUser)
    }
  }
  if (typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEYS.THEME) === null)
    window.localStorage.setItem(STORAGE_KEYS.THEME, "light")
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export const authService = {
  login: (username, password) => {
    ensureSeeded()
    const users = getStore(STORAGE_KEYS.USERS, [])
    const normalizedUsername = username.trim().toLowerCase()
    const user = users.find(
      (u) => usernameFromUser(u) === normalizedUsername && u.password === password
    )
    if (!user) throw new Error("Invalid username or password.")
    const { password: _pw, ...safeUser } = user
    setStore(STORAGE_KEYS.USER, safeUser)
    return safeUser
  },

  register: (data) => {
    ensureSeeded()
    const users = getStore(STORAGE_KEYS.USERS, [])
    const username = String(data.username || "").trim()
    if (!username) throw new Error("Username is required.")
    if (users.some((user) => usernameFromUser(user) === username.toLowerCase())) {
      throw new Error("An account with this username already exists.")
    }
    const user = {
      id: uid(),
      ...data,
      username,
      role: "student",
      avatar: data.name.trim().charAt(0).toUpperCase(),
      points: 0,
      level: 1,
      streak: 0,
      longestStreak: 0,
      completedQuizzes: [],
      badges: [],
      joinedAt: nowISO(),
    }
    users.push(user)
    setStore(STORAGE_KEYS.USERS, users)
    const { password: _pw, ...safeUser } = user
    setStore(STORAGE_KEYS.USER, safeUser)
    return safeUser
  },

  getCurrentUser: () => getStore(STORAGE_KEYS.USER, null),

  updateCurrentUser: (updates) => {
    const currentUser = getStore(STORAGE_KEYS.USER, null)
    if (!currentUser) throw new Error("Not authenticated.")
    const updatedUser = { ...currentUser, ...updates }
    setStore(STORAGE_KEYS.USER, updatedUser)

    const users = getStore(STORAGE_KEYS.USERS, [])
    const index = users.findIndex((user) => user.id === currentUser.id)
    if (index !== -1) {
      users[index] = { ...users[index], ...updates }
      setStore(STORAGE_KEYS.USERS, users)
    }

    if (typeof window !== "undefined") window.dispatchEvent(new Event("iq-user-updated"))
    return updatedUser
  },

  updateCredentials: ({ username, currentPassword, newPassword }) => {
    ensureSeeded()
    const currentUser = getStore(STORAGE_KEYS.USER, null)
    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Only a signed-in admin can update admin credentials.")
    }

    const users = getStore(STORAGE_KEYS.USERS, [])
    const userIndex = users.findIndex((user) => user.id === currentUser.id)
    if (userIndex === -1) throw new Error("Admin account could not be found.")
    if (users[userIndex].password !== currentPassword) {
      throw new Error("Current password is incorrect.")
    }

    const normalizedUsername = String(username || "").trim()
    if (!normalizedUsername) throw new Error("Username is required.")
    if (users.some((user, index) =>
      index !== userIndex && usernameFromUser(user) === normalizedUsername.toLowerCase()
    )) {
      throw new Error("That username is already in use.")
    }

    if (newPassword && newPassword.length < 8) {
      throw new Error("New password must be at least 8 characters.")
    }

    users[userIndex] = {
      ...users[userIndex],
      username: normalizedUsername,
      ...(newPassword ? { password: newPassword } : {}),
    }
    setStore(STORAGE_KEYS.USERS, users)

    const updatedUser = { ...currentUser, username: normalizedUsername }
    setStore(STORAGE_KEYS.USER, updatedUser)
    if (typeof window !== "undefined") window.dispatchEvent(new Event("iq-user-updated"))
    return updatedUser
  },

  logout: () => setStore(STORAGE_KEYS.USER, null),

  isAuthenticated: () => getStore(STORAGE_KEYS.USER, null) !== null,
}

// ---------------------------------------------------------------------------
// Quizzes
// ---------------------------------------------------------------------------
export const quizService = {
  list: () => {
    ensureSeeded()
    return getStore(STORAGE_KEYS.QUIZZES, [])
  },

  get: (id) => {
    ensureSeeded()
    return getStore(STORAGE_KEYS.QUIZZES, []).find((q) => q.id === id)
  },

  create: (data) => {
    ensureSeeded()
    const quizzes = getStore(STORAGE_KEYS.QUIZZES, [])
    const quiz = { ...data, id: uid(), createdAt: nowISO(), updatedAt: nowISO() }
    quizzes.push(quiz)
    setStore(STORAGE_KEYS.QUIZZES, quizzes)
    return quiz
  },

  update: (id, data) => {
    ensureSeeded()
    const quizzes = getStore(STORAGE_KEYS.QUIZZES, [])
    const idx = quizzes.findIndex((q) => q.id === id)
    if (idx === -1) throw new Error("Quiz not found.")
    quizzes[idx] = { ...quizzes[idx], ...data, updatedAt: nowISO() }
    setStore(STORAGE_KEYS.QUIZZES, quizzes)
    return quizzes[idx]
  },

  delete: (id) => {
    ensureSeeded()
    let quizzes = getStore(STORAGE_KEYS.QUIZZES, [])
    quizzes = quizzes.filter((q) => q.id !== id)
    setStore(STORAGE_KEYS.QUIZZES, quizzes)
    // cascade delete questions & submissions for this quiz
    let questions = getStore(STORAGE_KEYS.QUESTIONS, [])
    questions = questions.filter((q) => q.quizId !== id)
    setStore(STORAGE_KEYS.QUESTIONS, questions)
    let submissions = getStore(STORAGE_KEYS.SUBMISSIONS, [])
    submissions = submissions.filter((s) => s.quizId !== id)
    setStore(STORAGE_KEYS.SUBMISSIONS, submissions)
  },

  publish: (id, isPublished) => {
    ensureSeeded()
    const quizzes = getStore(STORAGE_KEYS.QUIZZES, [])
    const idx = quizzes.findIndex((q) => q.id === id)
    if (idx === -1) throw new Error("Quiz not found.")
    quizzes[idx] = { ...quizzes[idx], isPublished, updatedAt: nowISO() }
    setStore(STORAGE_KEYS.QUIZZES, quizzes)
    return quizzes[idx]
  },

  duplicate: (id) => {
    ensureSeeded()
    const original = getStore(STORAGE_KEYS.QUIZZES, []).find((quiz) => quiz.id === id)
    if (!original) throw new Error("Quiz not found.")
    const quizId = uid()
    const questions = getStore(STORAGE_KEYS.QUESTIONS, [])
      .filter((question) => question.quizId === id)
      .map((question) => ({
        ...question,
        id: uid(),
        quizId,
        options: (question.options || []).map((option) => ({ ...option, id: uid() })),
        acceptedAnswers: [...(question.acceptedAnswers || [])],
      }))
    const duplicate = {
      ...original,
      id: quizId,
      title: `${original.title} (Copy)`,
      questionCount: questions.length,
      isPublished: false,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    }
    setStore(STORAGE_KEYS.QUIZZES, [...getStore(STORAGE_KEYS.QUIZZES, []), duplicate])
    setStore(STORAGE_KEYS.QUESTIONS, [...getStore(STORAGE_KEYS.QUESTIONS, []), ...questions])
    return duplicate
  },

  syncQuestionCount: (id) => {
    ensureSeeded()
    const quizzes = getStore(STORAGE_KEYS.QUIZZES, [])
    const quiz = quizzes.find((item) => item.id === id)
    if (!quiz) return
    const count = getStore(STORAGE_KEYS.QUESTIONS, []).filter((item) => item.quizId === id).length
    quiz.questionPoolCount = count
    quiz.questionCount = count
      ? Math.min(Math.max(1, Number(quiz.questionCount) || 15), count)
      : 0
    quiz.updatedAt = nowISO()
    setStore(STORAGE_KEYS.QUIZZES, quizzes)
  },
}

// ---------------------------------------------------------------------------
// Questions
// ---------------------------------------------------------------------------
export const questionService = {
  listByQuiz: (quizId) => {
    ensureSeeded()
    return getStore(STORAGE_KEYS.QUESTIONS, [])
      .filter((q) => q.quizId === quizId)
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
  },

  listEnabledByQuiz: (quizId) => questionService.listByQuiz(quizId)
    .filter((question) => question.enabled !== false),

  get: (id) => {
    ensureSeeded()
    return getStore(STORAGE_KEYS.QUESTIONS, []).find((q) => q.id === id)
  },

  create: (data) => {
    ensureSeeded()
    const questions = getStore(STORAGE_KEYS.QUESTIONS, [])
    const question = { ...data, enabled: data.enabled !== false, id: uid() }
    questions.push(question)
    setStore(STORAGE_KEYS.QUESTIONS, questions)
    quizService.syncQuestionCount(question.quizId)
    return question
  },

  update: (id, data) => {
    ensureSeeded()
    const questions = getStore(STORAGE_KEYS.QUESTIONS, [])
    const idx = questions.findIndex((q) => q.id === id)
    if (idx === -1) throw new Error("Question not found.")
    questions[idx] = { ...questions[idx], ...data }
    setStore(STORAGE_KEYS.QUESTIONS, questions)
    quizService.syncQuestionCount(questions[idx].quizId)
    return questions[idx]
  },

  delete: (id) => {
    ensureSeeded()
    let questions = getStore(STORAGE_KEYS.QUESTIONS, [])
    const question = questions.find((item) => item.id === id)
    questions = questions.filter((q) => q.id !== id)
    setStore(STORAGE_KEYS.QUESTIONS, questions)
    if (question) quizService.syncQuestionCount(question.quizId)
  },

  bulkImport: (csvRows) => {
    ensureSeeded()
    const questions = getStore(STORAGE_KEYS.QUESTIONS, [])
    const imported = csvRows.map((row) => ({
      ...row,
      enabled: row.enabled !== false,
      id: uid(),
    }))
    questions.push(...imported)
    setStore(STORAGE_KEYS.QUESTIONS, questions)
    new Set(imported.map((question) => question.quizId)).forEach((quizId) => {
      quizService.syncQuestionCount(quizId)
    })
    return imported
  },

  replaceByQuiz: (quizId, rows) => {
    ensureSeeded()
    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error("At least one valid question is required.")
    }
    const questions = getStore(STORAGE_KEYS.QUESTIONS, [])
      .filter((question) => question.quizId !== quizId)
    const imported = rows.map((row) => ({
      ...row,
      enabled: row.enabled !== false,
      id: uid(),
      quizId,
      options: (row.options || []).map((option) => ({ ...option, id: uid() })),
    }))
    setStore(STORAGE_KEYS.QUESTIONS, [...questions, ...imported])
    quizService.syncQuestionCount(quizId)
    return imported
  },
}

// ---------------------------------------------------------------------------
// Submissions
// ---------------------------------------------------------------------------
export const submissionService = {
  list: () => {
    ensureSeeded()
    return getStore(STORAGE_KEYS.SUBMISSIONS, []).sort(
      (a, b) => new Date(b.completedAt) - new Date(a.completedAt)
    )
  },

  listByUser: (userId) => {
    ensureSeeded()
    return getStore(STORAGE_KEYS.SUBMISSIONS, [])
      .filter((s) => s.userId === userId)
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
  },

  get: (id) => {
    ensureSeeded()
    return getStore(STORAGE_KEYS.SUBMISSIONS, []).find((s) => s.id === id)
  },

  create: (submission) => {
    ensureSeeded()
    const submissions = getStore(STORAGE_KEYS.SUBMISSIONS, [])
    const record = {
      ...submission,
      id: uid(),
      completedAt: nowISO(),
    }
    submissions.push(record)
    setStore(STORAGE_KEYS.SUBMISSIONS, submissions)
    return record
  },

  update: (id, updates) => {
    ensureSeeded()
    const submissions = getStore(STORAGE_KEYS.SUBMISSIONS, [])
    const index = submissions.findIndex((submission) => submission.id === id)
    if (index === -1) throw new Error("Submission not found.")
    submissions[index] = { ...submissions[index], ...updates }
    setStore(STORAGE_KEYS.SUBMISSIONS, submissions)
    return submissions[index]
  },

  leaderboard: (quizId, period = "all-time") => {
    ensureSeeded()
    const storedUsers = getStore(STORAGE_KEYS.USERS, [])
    const currentUser = getStore(STORAGE_KEYS.USER, null)
    const users = storedUsers
      .filter((user) => user.role === "student")
      .map((user) => user.id === currentUser?.id ? { ...user, ...currentUser } : user)
    const subs = getStore(STORAGE_KEYS.SUBMISSIONS, [])
    let filtered = subs.filter((submission) => {
      if (quizId && submission.quizId !== quizId) return false
      return true
    })
    if (period === "weekly") {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      filtered = filtered.filter((submission) => submission.completedAt >= weekAgo)
    }

    const pointsByUser = new Map()
    filtered.forEach((submission) => {
      pointsByUser.set(
        submission.userId,
        (pointsByUser.get(submission.userId) || 0) + (Number(submission.pointsEarned) || 0)
      )
    })

    return users
      .map((user) => ({
        id: user.id,
        userId: user.id,
        name: user.name || "Student",
        course: user.course || "",
        avatar: user.avatar || user.name?.charAt(0) || "?",
        points: quizId || period === "weekly"
          ? pointsByUser.get(user.id) || 0
          : Number(user.points) || 0,
      }))
      .filter((entry) => !quizId && period !== "weekly" || pointsByUser.has(entry.userId))
      .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name))
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }))
  },
}

// ---------------------------------------------------------------------------
// Badges
// ---------------------------------------------------------------------------
export const badgeService = {
  list: () => {
    ensureSeeded()
    return getStore(STORAGE_KEYS.BADGES, [])
  },

  unlock: (userId, badgeId) => {
    ensureSeeded()
    const user = authService.getCurrentUser()
    if (!user || user.id !== userId) return false
    if ((user.badges || []).includes(badgeId)) return false
    authService.updateCurrentUser({ badges: [...(user.badges || []), badgeId] })
    return true
  },

  create: (badge) => {
    ensureSeeded()
    const badges = getStore(STORAGE_KEYS.BADGES, [])
    const created = { ...badge, id: uid() }
    setStore(STORAGE_KEYS.BADGES, [...badges, created])
    return created
  },

  update: (id, updates) => {
    ensureSeeded()
    const badges = getStore(STORAGE_KEYS.BADGES, [])
    const index = badges.findIndex((badge) => badge.id === id)
    if (index === -1) throw new Error("Badge not found.")
    badges[index] = { ...badges[index], ...updates }
    setStore(STORAGE_KEYS.BADGES, badges)
    return badges[index]
  },

  delete: (id) => {
    ensureSeeded()
    setStore(STORAGE_KEYS.BADGES, getStore(STORAGE_KEYS.BADGES, []).filter((badge) => badge.id !== id))
  },
}

export const settingsService = {
  get: () => {
    ensureSeeded()
    return { ...DEFAULT_SETTINGS, ...getStore(STORAGE_KEYS.SETTINGS, {}) }
  },

  update: (settings) => {
    ensureSeeded()
    const current = settingsService.get()
    const updated = {
      ...current,
      ...settings,
      pointsByDifficulty: {
        ...current.pointsByDifficulty,
        ...settings.pointsByDifficulty,
      },
    }
    setStore(STORAGE_KEYS.SETTINGS, updated)
    return updated
  },
}

export const userService = {
  listStudents: () => {
    ensureSeeded()
    return getStore(STORAGE_KEYS.USERS, [])
      .filter((user) => user.role === "student")
      .map(({ password: _password, ...user }) => user)
  },
}

// ---------------------------------------------------------------------------
// Stats (admin dashboard)
// ---------------------------------------------------------------------------
export const statsService = {
  dashboard: () => {
    ensureSeeded()
    const users = getStore(STORAGE_KEYS.USERS, [])
    const quizzes = getStore(STORAGE_KEYS.QUIZZES, [])
    const questions = getStore(STORAGE_KEYS.QUESTIONS, [])
    const submissions = getStore(STORAGE_KEYS.SUBMISSIONS, [])
    const students = users.filter((u) => u.role === "student")
    const avgScore =
      submissions.length > 0
        ? submissions.reduce((sum, s) => sum + s.score, 0) / submissions.length
        : 0

    // recent activity: submissions per day (last 7 days)
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      d.setHours(0, 0, 0, 0)
      return d.toISOString()
    })
    const activity = last7.map((day) => {
      const count = submissions.filter(
        (s) => new Date(s.completedAt).toISOString().slice(0, 10) === day.slice(0, 10)
      ).length
      return { day: new Date(day).toLocaleDateString(undefined, { weekday: "short" }), count }
    })

    return {
      totalStudents: students.length,
      totalQuizzes: quizzes.length,
      totalQuestions: questions.length,
      averageScore: Math.round(avgScore * 10) / 10,
      totalSubmissions: submissions.length,
      activity,
    }
  },
}
