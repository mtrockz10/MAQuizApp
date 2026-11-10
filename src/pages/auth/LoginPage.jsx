import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useToast } from "../../context/ToastContext"
import { useTheme } from "../../context/ThemeContext"
import { Sun, Moon, ArrowRight, Laptop } from "lucide-react"
import { Button } from "../../components/ui/Button"
import { Card } from "../../components/ui/Card"
import { Input } from "../../components/ui/Input"
import { Label } from "../../components/ui/Label"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState("")
  const [course, setCourse] = useState("")
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const { theme, toggle } = useTheme()
  const ThemeIcon = theme === "dark" ? Sun : Moon

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isRegister) {
        await register({ name, username, password, course })
        toast.success("Account created! Welcome to ImmersionQuest.")
        navigate("/student")
      } else {
        const user = await login(username, password)
        navigate(user.role === "admin" ? "/admin" : "/student", { replace: true })
      }
    } catch (err) {
      toast.error(err.message || "Login failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold heading text-indigo-600 dark:text-indigo-400">ImmersionQuest</span>
          </div>
          <button onClick={toggle} className="btn-icon p-1.5" aria-label={theme === "dark" ? "Light mode" : "Dark mode"}>
            <ThemeIcon size={16} strokeWidth={2} />
          </button>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center p-4 md:p-8 bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md shadow-card">
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 mb-5 text-white shadow-glow">
              <Laptop size={28} strokeWidth={2} />
            </div>
            <h2 className="text-2xl font-bold heading text-gray-900 dark:text-white mb-1">
              {isRegister ? "Create your account" : "Welcome back"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {isRegister
                ? "Join ImmersionQuest and start preparing for your work immersion."
                : "Sign in to continue your work immersion journey."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <>
                  <div>
                    <Label>Full name</Label>
                    <Input
                      placeholder="e.g. Juan Dela Cruz"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <Label>Course / program</Label>
                    <Input
                      placeholder="e.g. BS Information Technology"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      autoComplete="organization"
                    />
                  </div>
                </>
              )}
              <div>
                <Label>Username</Label>
                <Input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={isRegister ? "new-password" : "current-password"}
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={loading}
              >
                {loading ? <ArrowRight size={18} className="animate-spin" /> : isRegister ? "Create account" : "Sign in"}
              </Button>
            </form>

            <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">
              {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => setIsRegister(!isRegister)}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                {isRegister ? "Sign in instead" : "Sign up"}
              </button>
            </p>

          </div>
        </Card>
      </main>
    </div>
  )
}
