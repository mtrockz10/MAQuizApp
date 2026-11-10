import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"
import { useQuiz } from "../../context/QuizContext"
import {
  Sun,
  Moon,
  Bell,
  Flame,
  Star,
  Menu,
} from "lucide-react"
import { Logo } from "../ui/Logo"
import { cn } from "../../utils/cn"
import { Button } from "../ui/Button"

export function Navbar({ onMenu, title }) {
  const { user, isAdmin } = useAuth()
  const { theme, toggle } = useTheme()
  const { streak } = useQuiz()
  const location = useLocation()
  const ThemeIcon = theme === "dark" ? Sun : Moon

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenu}
            className="btn-icon sm:hidden"
            aria-label="Open menu"
          >
            <Menu size={22} strokeWidth={2} />
          </button>
          <Link
            to={isAdmin ? "/admin" : "/student"}
            className="flex items-center gap-2"
          >
            <Logo className="w-5 h-5 text-indigo-600" />
            <span className={cn("font-bold heading", isAdmin ? "text-gray-900 dark:text-white" : "text-indigo-600 dark:text-indigo-400")}>
              ImmersionQuest
            </span>
          </Link>
          {title && (
            <span className={cn("ml-3 text-sm font-semibold text-gray-600 dark:text-gray-300 hidden sm:block", title)}>{title}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={toggle} className="hidden sm:flex" aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
            <ThemeIcon size={16} strokeWidth={2} />
          </Button>
          <Button variant="ghost" size="sm" className="btn-icon" aria-label="Notifications">
            <Bell size={18} strokeWidth={2} />
          </Button>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user?.name}</span>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 capitalize">{user?.role}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shadow-glow">
              {user?.name?.charAt(0) || "?"}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
