import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { QuizProvider } from "./context/QuizContext"
import { ToastProvider } from "./context/ToastContext"
import { ThemeProvider } from "./context/ThemeContext"
import { ProtectedRoute, RoleGate } from "./components/layout/ProtectedRoute"
import { StudentLayout } from "./components/layout/StudentLayout"
import { AdminLayout } from "./components/layout/AdminLayout"
import { Toaster } from "./components/ui/Toaster"

// Pages
import LoginPage from "./pages/auth/LoginPage"
import HomePage from "./pages/student/HomePage"
import QuizLibraryPage from "./pages/student/QuizLibraryPage"
import QuizTakerPage from "./pages/student/QuizTakerPage"
import ResultsPage from "./pages/student/ResultsPage"
import LeaderboardPage from "./pages/student/LeaderboardPage"
import BadgesPage from "./pages/student/BadgesPage"
import ProfilePage from "./pages/student/ProfilePage"
import AdminDashboard from "./pages/admin/AdminDashboard"
import QuizManagement from "./pages/admin/QuizManagement"
import QuestionBuilder from "./pages/admin/QuestionBuilder"
import ResultsView from "./pages/admin/ResultsView"
import PointsBadgeSettings from "./pages/admin/PointsBadgeSettings"

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QuizProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                {/* Public */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Student */}
                <Route
                  path="/student"
                  element={
                    <ProtectedRoute roles={["student"]}>
                      <StudentLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<HomePage />} />
                  <Route path="library" element={<QuizLibraryPage />} />
                  <Route path="quiz/:quizId" element={<QuizTakerPage />} />
                  <Route path="results/:submissionId" element={<ResultsPage />} />
                  <Route path="leaderboard" element={<LeaderboardPage />} />
                  <Route path="badges" element={<BadgesPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                </Route>

                {/* Admin */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="quizzes" element={<QuizManagement />} />
                  <Route path="builder/new" element={<QuestionBuilder />} />
                  <Route path="builder/:quizId" element={<QuestionBuilder />} />
                  <Route path="results" element={<ResultsView />} />
                  <Route path="settings" element={<PointsBadgeSettings />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
              <Toaster />
            </BrowserRouter>
          </ToastProvider>
        </QuizProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
