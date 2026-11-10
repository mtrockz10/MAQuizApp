export const ROUTES = {
  LOGIN: "/login",
  STUDENT_HOME: "/student",
  STUDENT_LIBRARY: "/student/library",
  STUDENT_QUIZ: "/student/quiz/:quizId",
  STUDENT_RESULTS: "/student/results/:submissionId",
  STUDENT_LEADERBOARD: "/student/leaderboard",
  STUDENT_BADGES: "/student/badges",
  STUDENT_PROFILE: "/student/profile",
  ADMIN_HOME: "/admin",
  ADMIN_QUIZZES: "/admin/quizzes",
  ADMIN_BUILDER: (quizId) => `/admin/builder/${quizId}`,
  ADMIN_BUILDER_NEW: "/admin/builder/new",
  ADMIN_RESULTS: "/admin/results",
  ADMIN_SETTINGS: "/admin/settings",
}

export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: "multiple_choice",
  TRUE_FALSE: "true_false",
  IDENTIFICATION: "identification",
}

export const TOPICS = [
  "Workplace Ethics",
  "Communication",
  "Safety",
  "Resume & Interview",
  "Professional Conduct",
]

export const DIFFICULTIES = ["Easy", "Medium", "Hard"]

export const POINTS_BY_DIFFICULTY = {
  Easy: 10,
  Medium: 20,
  Hard: 30,
}

export const STREAK_BONUS_THRESHOLD = 3
export const STREAK_BONUS_MULTIPLIER = 2

export const STORAGE_KEYS = {
  USER: "iq_user",
  QUIZZES: "iq_quizzes",
  QUESTIONS: "iq_questions",
  SUBMISSIONS: "iq_submissions",
  BADGES: "iq_badges",
  THEME: "iq_theme",
}

export const DEMO_ADMIN = { email: "admin@school.edu", password: "admin123" }
export const DEMO_STUDENT = { email: "student@school.edu", password: "student123" }
