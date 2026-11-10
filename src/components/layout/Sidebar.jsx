import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"
import {
  Mail,
  Users,
  ShieldCheck,
  BarChart3,
  LogOut,
  ChevronLeft,
  X,
  Sun,
  Moon,
} from "lucide-react"
import { Logo } from "../ui/Logo"
import { cn } from "../../utils/cn"

const navItems = [
  { path: "/admin", label: "Dashboard", icon: BarChart3 },
  { path: "/admin/quizzes", label: "Quiz Management", icon: Mail },
  { path: "/admin/results", label: "Results", icon: Users },
  { path: "/admin/settings", label: "Points & Badges", icon: ShieldCheck },
]

export function Sidebar({ collapsed, setCollapsed }) {
  const { logout } = useAuth()
  const { theme, toggle } = useTheme()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const ThemeIcon = theme === "dark" ? Sun : Moon

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 z-40 flex flex-col transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between h-14 px-4 shrink-0 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3 min-w-0">
            <Logo className="w-6 h-6 text-indigo-600" />
            {!collapsed && (
              <span className="text-lg font-bold heading text-gray-900 dark:text-white truncate">
                ImmersionQuest
              </span>
            )}
          </div>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="btn-icon p-1.5"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronLeft size={18} /> : <X size={18} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1" aria-label="Admin navigation">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-button text-sm font-medium transition-colors",
                  isActive
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <item.icon size={18} strokeWidth={2.5} className="shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={toggle}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-button text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ThemeIcon size={18} strokeWidth={2} className="shrink-0" />
            <span className={cn(collapsed && "hidden")}>
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </span>
          </button>
          <Link
            to="/login"
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-button text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut size={18} strokeWidth={2.5} className="shrink-0" />
            <span className={cn(collapsed && "hidden")}>Sign out</span>
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-gray-900/80 backdrop-blur-sm transition-opacity",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-50 flex flex-col transform transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Logo className="w-6 h-6 text-indigo-600" />
            <span className="font-bold heading text-gray-900 dark:text-white">ImmersionQuest</span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="btn-icon p-1.5">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-button text-sm font-medium block",
                  isActive
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <item.icon size={18} strokeWidth={2.5} className="shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={toggle}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-button text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 mb-3"
          >
            <ThemeIcon size={18} strokeWidth={2} className="shrink-0" />
            <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
          </button>
          <Link
            to="/login"
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-button text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut size={18} strokeWidth={2.5} className="shrink-0" />
            <span>Sign out</span>
          </Link>
        </div>
      </aside>
    </>
  )
}
