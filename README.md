# ImmersionQuest

A fun, responsive quiz platform for college students preparing for and reviewing their **work immersion**. Admins create and manage quizzes; students take quizzes, earn points, keep streaks, unlock badges, and compete on a leaderboard.

> **Name suggestion:** "ImmersionQuest" works well, but alternatives you might like: **ImmersionPrep**, **WorkWise Quiz**, **Campus Quest**, or **TraineeTrivia**. Rename is a search-and-replace away.

## Design direction — "Campus Pop"

Professional but playful:

- **Backgrounds:** white / soft lavender (`#F6F5FF`); cards white with soft shadows, 16–20px radius
- **Primary:** indigo (`#4F46E5`) with indigo→violet gradient on hero areas & main buttons
- **Accents:** coral (`#FF6B6B`) wrong/alert, amber (`#FFB020`) points/streaks/badges, mint (`#2DD4A7`) correct/success
- **Typography:** Poppins (headings) + Inter (body), loaded from Google Fonts
- **Dark mode:** full dark mode toggle (deep indigo-navy) that keeps the same personality
- **Microinteractions:** button press scale, card hover lift, animated progress bars, count-up points, shake on wrong, bounce+glow on correct, confetti on quiz completion / 3+ streaks / badge unlocks
- **Mobile-first:** bottom tab nav on mobile, sidebar on desktop, 44px+ touch targets
- **Accessibility:** WCAG AA contrast, visible focus rings, keyboard nav, `aria` labels, feedback never relies on color alone (icons + text)

## Tech stack

- React 19 (functional components + hooks) + Vite
- Tailwind CSS
- React Router
- Framer Motion (animations) + canvas-confetti (celebrations)
- Lucide React (icons), Recharts (admin charts)
- State: React Context (Auth, Quiz, Toast, Theme)
- Data: mock services backed by `localStorage`, structured in `/services` so a REST backend can swap in without touching components

## Folder structure

```
src/
  components/
    ui/           Button, Card, Badge, ProgressBar, Modal, Toast/Toaster, Skeleton, Input, Label, Logo
    layout/       Sidebar, Navbar, BottomTabNav, ProtectedRoute, RoleGate, StudentLayout, AdminLayout
    quiz/         QuestionCard, ProgressIndicator, StreakFlame, PointsDisplay
    leaderboard/  Podium, LeaderboardRow
    badges/       BadgeCard
    common/       Avatar, EmptyState, ConfirmDialog
  context/        AuthContext, QuizContext, ToastContext, ThemeContext
  hooks/          (custom hooks)
  pages/
    auth/         LoginPage
    student/      HomePage, QuizLibraryPage, QuizTakerPage, ResultsPage, LeaderboardPage, BadgesPage, ProfilePage
    admin/        AdminDashboard, QuizManagement, QuestionBuilder, ResultsView, PointsBadgeSettings
  services/       api.js   <-- the ONLY file that touches localStorage
  data/           mockData.js   <-- seed data (quizzes, questions, students, badges)
  utils/          cn.js, constants.js
  App.jsx, main.jsx, index.css
```

## Getting started

### Prerequisites
Node.js (v18+) and npm.

### Install
```bash
cd /c/Projects/MAQuizApp
npm install
```

### Run (development)
```bash
npm run dev        # http://localhost:5173
```

### Build (production)
```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build
```

> **Build note (Vite 8):** Vite 8 defaults to the rolldown bundler, which can fail to resolve `lucide-react`'s ESM exports. This project works around it by marking `lucide.react` as an external in `vite.config.js` and resolving it at runtime via an import map in `index.html` (pointing at `/lucide-react.esm.js`, copied into `public/`). If you ever rebuild and hit a rolldown resolution error, that import map + `external: ['lucide.react']` is the fix. Alternatively, switch Vite back to rollup.

## Demo credentials (pre-seeded)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@school.edu | admin123 |
| Student | student@school.edu | student123 |

You can also sign up as a new student. Additional sample students exist for the leaderboard.

## Seed data

- **3 quizzes** × 10 questions each (Workplace Ethics / Communication / Safety), covering all three question types:
  - Multiple Choice (large tappable option cards)
  - True / False (two big bold buttons)
  - Identification (text input, checked case-insensitively against admin-set accepted variations)
- **6 badges:** First Quiz, 5-Day Streak, Perfect Score, Top 10, Quiz Master, Communicator
- **5 sample students** for the leaderboard

All data lives in `src/data/mockData.js` and is persisted to `localStorage` via `src/services/api.js`.

## Swapping mock services for a real backend

The entire app talks to `src/services/api.js` — the **only** file that touches `localStorage`. To replace with a REST API + database, rewrite `api.js` to hit your endpoints while keeping the same function signatures:

```js
// Current (mock) signatures — keep these when wiring a backend
quizService.list(), quizService.get(id), quizService.create(data),
quizService.update(id, data), quizService.delete(id), quizService.publish(id, bool)
questionService.listByQuiz(quizId), questionService.create/update/delete, questionService.bulkImport(rows)
submissionService.create(submission), submissionService.leaderboard(quizId, period)
authService.login(email, password), authService.register(data), authService.logout
badgeService.unlock(userId, badgeId)
statsService.dashboard()
```

No component needs to change — just reimplement the service functions with `fetch`/`axios` calls to your API.

## Screens

**Student:** Login → Home (streak, points, level, continue quiz, recommendations) → Quiz Library (search + topic filter) → Quiz Taker (one question at a time, instant feedback, streak bonus) → Results (score, points, confetti, badge unlocks, review missed) → Leaderboard (weekly/all-time, podium, own rank) → Badges (earned vs locked) → Profile (avatar, level, streak, badge showcase).

**Admin:** Dashboard (stats + Recharts activity chart) → Quiz Management (create/edit/duplicate/publish/delete with confirm modal) → Question Builder (MC/TF/ID, live preview, question bank, CSV bulk import) → Results (filter + CSV export) → Points & Badge Settings.

## Accessibility

- WCAG AA color contrast
- Visible focus rings (`:focus-visible`)
- Full keyboard navigation
- `aria-label`s on icon buttons and controls
- Correct/wrong feedback uses icons + text (never color alone)
- 44px+ touch targets

## License

MIT
