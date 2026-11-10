import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import {
  Home,
  BookOpen,
  Trophy,
  Badge as LucideBadge,
  User,
  LogOut,
  X,
} from "lucide-react"
import { cn } from "../../utils/cn"

const tabs = [
  { path: "/student", label: "Home", icon: Home },
  { path: "/student/library", label: "Library", icon: BookOpen },
  { path: "/student/leaderboard", label: "Leaderboard", icon: Trophy },
  { path: "/student/badges", label: "Badges", icon: LucideBadge },
  { path: "/student/profile", label: "Profile", icon: User },
]

export function BottomTabNav() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 h-16 border-t border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md"
        aria-label="Bottom navigation"
      >
        <div className="flex h-full px-3">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-1 rounded-button p-1.5 text-sm transition-colors",
                  isActive
                    ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20"
                    : "text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                )}
              >
                <tab.icon size={20} strokeWidth={2} className={cn("shrink-0", isActive && "fill-indigo-600 dark:fill-indigo-400")} />
                <span className={cn("leading-none", isActive && "font-semibold")}>{tab.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Mobile user menu (replaces desktop navbar actions) */}
      <div className="fixed top-0 left-0 right-0 z-30" />
      <div
        className={cn(
          "fixed inset-0 z-50 bg-gray-900/80 backdrop-blur-sm transition-opacity",
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />
      <aside
        className={cn(
          "fixed right-0 top-0 h-screen w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 z-50 flex flex-col transform transition-transform duration-300",
          menuOpen ? "translate-x-0" : "translate-x-full"
        )}
        aria-label="User menu"
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Account</h3>
          <button onClick={() => setMenuOpen(false)} className="btn-icon p-1.5">
            <XIcon size={20} />
          </button>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-lg shadow-glow">
              {user?.name?.charAt(0) || "?"}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user?.name}</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">@{user?.username}</p>
            </div>
          </div>
          <div className="space-y-1">
            <Link to="/student/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-button text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 block">
              <User size={18} strokeWidth={2} className="shrink-0" />
              Profile
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-button text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut size={18} strokeWidth={2.5} className="shrink-0" />
              Sign out
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

function XIcon({ size }) {
  return <X size={size} strokeWidth={2} />
}
