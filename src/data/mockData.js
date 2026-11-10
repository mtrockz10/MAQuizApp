import assessorQuestionBank from "./assessor_questions.json"
import { normalizeQuestionnaire } from "../utils/questionnaireImport"

export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: "multiple_choice",
  TRUE_FALSE: "true_false",
  IDENTIFICATION: "identification",
}

const MC = (id, quizId, text, options, correctIndex, explanation, points, difficulty, topic, order) => ({
  id,
  quizId,
  type: QUESTION_TYPES.MULTIPLE_CHOICE,
  text,
  image: null,
  options: options.map((t, i) => ({ id: `opt-${id}-${i}`, text: t })),
  correctAnswer: String(correctIndex),
  acceptedAnswers: [],
  explanation,
  points,
  difficulty,
  topic,
  orderIndex: order,
})

const TF = (id, quizId, text, correctBool, explanation, points, difficulty, topic, order) => ({
  id,
  quizId,
  type: QUESTION_TYPES.TRUE_FALSE,
  text,
  image: null,
  options: [
    { id: `opt-${id}-true`, text: "True" },
    { id: `opt-${id}-false`, text: "False" },
  ],
  correctAnswer: correctBool ? "true" : "false",
  acceptedAnswers: [],
  explanation,
  points,
  difficulty,
  topic,
  orderIndex: order,
})

const ID = (id, quizId, text, accepted, explanation, points, difficulty, topic, order) => ({
  id,
  quizId,
  type: QUESTION_TYPES.IDENTIFICATION,
  text,
  image: null,
  options: [],
  correctAnswer: accepted[0],
  acceptedAnswers: accepted,
  explanation,
  points,
  difficulty,
  topic,
  orderIndex: order,
})

export const LEGACY_QUIZZES = [
  {
    id: "quiz-1",
    title: "Work Immersion Essentials",
    description: "The basics every trainee needs before day one: ethics, punctuality, and professional conduct.",
    topic: "Workplace Ethics",
    difficulty: "Easy",
    questionCount: 10,
    timeLimit: 15,
    isPublished: true,
    createdBy: "admin-1",
    createdAt: "2026-01-10T08:00:00Z",
    updatedAt: "2026-01-10T08:00:00Z",
  },
  {
    id: "quiz-2",
    title: "Professional Communication at Work",
    description: "Emails, meetings, and workplace conversations — communicate with clarity and confidence.",
    topic: "Communication",
    difficulty: "Medium",
    questionCount: 10,
    timeLimit: 20,
    isPublished: true,
    createdBy: "admin-1",
    createdAt: "2026-01-15T09:00:00Z",
    updatedAt: "2026-01-15T09:00:00Z",
  },
  {
    id: "quiz-3",
    title: "Workplace Safety & Professional Conduct",
    description: "Safety protocols, harassment awareness, and handling tricky conduct situations.",
    topic: "Safety",
    difficulty: "Hard",
    questionCount: 10,
    timeLimit: 25,
    isPublished: true,
    createdBy: "admin-1",
    createdAt: "2026-01-20T10:00:00Z",
    updatedAt: "2026-01-20T10:00:00Z",
  },
]

export const LEGACY_QUESTIONS = [
  // ---------- QUIZ 1: Work Immersion Essentials ----------
  MC("q1-1", "quiz-1", "You arrive 20 minutes late on your first day. What should you do first?",
    ["Sneak to your desk quietly", "Apologize to your supervisor and explain", "Pretend the bus broke down", "Start working without saying anything"],
    1, "Own your lateness, apologize sincerely, and commit to being on time.", 10, "Easy", "Workplace Ethics", 1),
  MC("q1-2", "quiz-1", "Which of these is the best example of professional attire in an office immersion?",
    ["Flip-flops and shorts", "A neat button-down shirt and slacks", "A gym tank top", "Beachwear"],
    1, "Dress neatly and in line with your host company's dress code.", 10, "Easy", "Workplace Ethics", 2),
  TF("q1-3", "quiz-1", "It is acceptable to share confidential client details on your personal social media if you don't name the client.",
    false, "Never disclose confidential information, even indirectly.", 10, "Easy", "Workplace Ethics", 3),
  MC("q1-4", "quiz-1", "You don't understand a task assigned to you. What is the best response?",
    ["Guess and hope it's right", "Say nothing and delay", "Ask your supervisor for clarification", "Ask a fellow trainee to do it"],
    2, "Asking for clarity early prevents costly mistakes.", 10, "Easy", "Workplace Ethics", 4),
  ID("q1-5", "quiz-1", "What three-letter acronym stands for 'Personal Protective Equipment'?",
    ["PPE", "personal protective equipment"], "Wear the right PPE to stay safe on site.", 10, "Easy", "Workplace Ethics", 5),
  MC("q1-6", "quiz-1", "Your supervisor asks you to do something that feels unsafe. What should you do?",
    ["Do it anyway", "Refuse and leave", "Politely raise your safety concern", "Ignore the task"],
    2, "You have the right to a safe workplace — speak up.", 10, "Easy", "Workplace Ethics", 6),
  TF("q1-7", "quiz-1", "Using your phone for personal messages during work hours is fine as long as work gets done.",
    false, "Limit personal phone use to breaks so you stay focused and professional.", 10, "Easy", "Workplace Ethics", 7),
  MC("q1-8", "quiz-1", "Which greeting is most appropriate when meeting a new colleague?",
    ["Hey!", "Good morning, I'm [Name], nice to meet you", "Yo", "Stay silent"],
    1, "A polite, self-introducing greeting sets a professional tone.", 10, "Easy", "Workplace Ethics", 8),
  ID("q1-9", "quiz-1", "What should you always wear on-site for identification?",
    ["ID badge", "identification badge", "id badge"], "Your ID badge identifies you as an authorized trainee.", 10, "Easy", "Workplace Ethics", 9),
  MC("q1-10", "quiz-1", "You make a small error on a document. What is the professional way to handle it?",
    ["Hide it", "Blame someone else", "Tell your supervisor and offer to fix it", "Delete the file"],
    2, "Honesty and ownership build trust — errors happen, fixing them matters.", 10, "Easy", "Workplace Ethics", 10),

  // ---------- QUIZ 2: Professional Communication ----------
  MC("q2-1", "quiz-2", "Which email subject line is most professional?",
    ["Hi", "Question re: Internship Schedule - J. Reyes", "URGENT!!!!", "no subject"],
    1, "Clear, specific subjects help recipients prioritize.", 20, "Medium", "Communication", 1),
  TF("q2-2", "quiz-2", "Using ALL CAPS in a workplace email is a good way to show importance.",
    false, "ALL CAPS reads as shouting — keep tone calm and clear.", 20, "Medium", "Communication", 2),
  MC("q2-3", "quiz-2", "In a meeting, you disagree with a colleague's idea. Best approach?",
    ["Interrupt and say it's wrong", "Wait, then share your view respectfully", "Stay silent forever", "Laugh at the idea"],
    1, "Respectful, timely disagreement improves outcomes.", 20, "Medium", "Communication", 3),
  ID("q2-4", "quiz-2", "What does 'cc' stand for in email?",
    ["carbon copy", "cc"], "'cc' sends a copy to additional recipients.", 20, "Medium", "Communication", 4),
  MC("q2-5", "quiz-2", "A client sounds upset on a call. What should you do first?",
    ["Argue back", "Hang up", "Listen actively and acknowledge their concern", "Transfer immediately"],
    2, "Listening first de-escalates tension and shows respect.", 20, "Medium", "Communication", 5),
  TF("q2-6", "quiz-2", "It is professional to use emojis freely in emails to supervisors.",
    false, "Use emojis sparingly, if at all, with supervisors — match their tone.", 20, "Medium", "Communication", 6),
  MC("q2-7", "quiz-2", "You need to reschedule a meeting. What is the best way?",
    ["Just not show up", "Propose new times and apologize for the change", "Send a one-word text", "Wait for them to cancel"],
    1, "Offer alternatives and apologize for the inconvenience.", 20, "Medium", "Communication", 7),
  ID("q2-8", "quiz-2", "What is a short informal workplace chat message often called?",
    ["IM", "instant message", "instant messaging"], "Instant messages keep quick workplace conversations flowing.", 20, "Medium", "Communication", 8),
  MC("q2-9", "quiz-2", "Before sending an important email, you should:",
    ["Send immediately", "Proofread and check recipients", "Bcc everyone", "Write in all caps"],
    1, "Proofreading prevents errors and wrong recipients.", 20, "Medium", "Communication", 9),
  TF("q2-10", "quiz-2", "Active listening means only waiting for your turn to speak.",
    false, "Active listening means fully focusing, understanding, and responding thoughtfully.", 20, "Medium", "Communication", 10),

  // ---------- QUIZ 3: Workplace Safety & Conduct ----------
  MC("q3-1", "quiz-3", "You smell something burning near equipment. First step?",
    ["Ignore it", "Try to fix it yourself", "Alert others and report to a supervisor", "Take a photo for social media"],
    2, "Report hazards immediately — don't handle them alone.", 30, "Hard", "Safety", 1),
  TF("q3-1", "quiz-3", "Workplace harassment includes offensive jokes and unwanted comments.",
    true, "Harassment can be verbal, not just physical.", 30, "Hard", "Safety", 2),
  MC("q3-3", "quiz-3", "A colleague makes you uncomfortable with repeated personal comments. What should you do?",
    ["Quit immediately", "Confront them aggressively", "Document it and report to HR/supervisor", "Ignore and hope it stops"],
    2, "Document incidents and report through proper channels.", 30, "Hard", "Safety", 3),
  ID("q3-4", "quiz-3", "What does 'OSHA' stand for?",
    ["occupational safety and health administration", "osha"], "OSHA sets workplace safety and health standards.", 30, "Hard", "Safety", 4),
  MC("q3-5", "quiz-3", "You notice a frayed electrical cord. Best action?",
    ["Use it carefully", "Tape it and keep using", "Stop use, tag it, and report it", "Hide it"],
    2, "Damaged equipment must be removed from service and reported.", 30, "Hard", "Safety", 5),
  TF("q3-6", "quiz-3", "Emergency exits must be kept clear at all times.",
    true, "Blocked exits put lives at risk during evacuation.", 30, "Hard", "Safety", 6),
  MC("q3-7", "quiz-3", "A visitor without an ID badge is wandering the floor. What do you do?",
    ["Ignore them", "Confront aggressively", "Politely ask who they're with and notify security/host", "Take their photo"],
    2, "Verify visitors politely and involve security when unsure.", 30, "Hard", "Safety", 7),
  ID("q3-8", "quiz-3", "PPE for your eyes and face is commonly called:",
    ["safety goggles", "goggles", "safety glasses"], "Protect your eyes with the right face/eye PPE.", 30, "Hard", "Safety", 8),
  MC("q3-9", "quiz-3", "The safest way to lift a heavy box is:",
    ["Bend your back", "Bend your knees and keep the load close", "Lift quickly", "Only use your arms"],
    1, "Lift with your legs, not your back.", 30, "Hard", "Safety", 9),
  TF("q3-10", "quiz-3", "If you are injured at work, wait until the end of the day to report it.",
    false, "Report injuries immediately, no matter how small.", 30, "Hard", "Safety", 10),
]

export const ASSESSOR_QUIZ_ID = "quiz-assessor"

export const QUIZZES = [
  {
    id: ASSESSOR_QUIZ_ID,
    title: assessorQuestionBank.title,
    description: "A randomized assessment drawn from the municipal assessor question bank.",
    topic: "Municipal Assessment",
    difficulty: "Easy",
    questionCount: 15,
    questionPoolCount: assessorQuestionBank.questions.length,
    timeLimit: 30,
    isPublished: true,
    createdBy: "admin-1",
    createdAt: "2026-11-10T00:00:00Z",
    updatedAt: "2026-11-10T00:00:00Z",
  },
]

export const QUESTIONS = normalizeQuestionnaire(
  assessorQuestionBank,
  ASSESSOR_QUIZ_ID,
  { difficulty: "Easy", points: 10, topic: "Municipal Assessment" }
)

// ---------- Sample students for leaderboard ----------
export const STUDENTS = [
  { id: "student-1", name: "Alex Rivera", email: "alex@student.edu", course: "BS Information Technology", avatar: "A", points: 1420, level: 7, streak: 5, badgeCount: 6 },
  { id: "student-2", name: "Maria Santos", email: "maria@student.edu", course: "BS Hotel & Restaurant Management", avatar: "M", points: 1280, level: 6, streak: 3, badgeCount: 5 },
  { id: "student-3", name: "James Lim", email: "james@student.edu", course: "BS Accountancy", avatar: "J", points: 1150, level: 6, streak: 1, badgeCount: 4 },
  { id: "student-4", name: "Camille Dela Cruz", email: "camille@student.edu", course: "BS Tourism Management", avatar: "C", points: 980, level: 5, streak: 0, badgeCount: 3 },
  { id: "student-5", name: "Ryan Delgado", email: "ryan@student.edu", course: "BS Electrical Technology", avatar: "R", points: 870, level: 5, streak: 2, badgeCount: 3 },
]

export const BADGES = [
  {
    id: "badge-first-quiz",
    name: "First Quiz",
    description: "Complete your very first quiz.",
    icon: "🎯",
    criterion: "Complete 1 quiz",
    type: "bronze",
    rule: "first_quiz",
    threshold: 1,
  },
  {
    id: "badge-streak-5",
    name: "5-Day Streak",
    description: "Keep a 5-day streak going.",
    icon: "🔥",
    criterion: "5-day streak",
    type: "silver",
    rule: "streak",
    threshold: 5,
  },
  {
    id: "badge-perfect",
    name: "Perfect Score",
    description: "Score 100% on any quiz.",
    icon: "💯",
    criterion: "100% score",
    type: "gold",
    rule: "perfect_score",
    threshold: 100,
  },
  {
    id: "badge-top-10",
    name: "Top 10",
    description: "Reach the top 10 of the leaderboard.",
    icon: "🏆",
    criterion: "Top 10 leaderboard",
    type: "gold",
    rule: "top_10",
    threshold: 10,
  },
  {
    id: "badge-quiz-master",
    name: "Quiz Master",
    description: "Complete all available quizzes.",
    icon: "🎓",
    criterion: "Complete all quizzes",
    type: "platinum",
    rule: "quiz_master",
    threshold: 1,
  },
  {
    id: "badge-communicator",
    name: "Communicator",
    description: "Complete the Communication quiz.",
    icon: "💬",
    criterion: "Complete Communication quiz",
    type: "bronze",
    rule: "topic",
    topic: "Communication",
  },
]

export const INITIAL_USER = {
  id: "user-me",
  name: "Jordan Reyes",
  username: "jordan",
  role: "student",
  course: "BS Information Technology",
  avatar: "J",
  points: 0,
  level: 1,
  streak: 0,
  longestStreak: 0,
  completedQuizzes: [],
  badges: [],
  joinedAt: new Date().toISOString(),
}

export const INITIAL_SUBMISSIONS = []

export const STORAGE_KEYS = {
  USERS: "iq_users",
  USER: "iq_user",
  QUIZZES: "iq_quizzes",
  QUESTIONS: "iq_questions",
  SUBMISSIONS: "iq_submissions",
  BADGES: "iq_badges",
  SETTINGS: "iq_admin_settings",
  THEME: "iq_theme",
}

export const DEMO_ADMIN = { username: "admin", password: "admin123" }
export const DEMO_STUDENT = { username: "student", password: "student123" }
