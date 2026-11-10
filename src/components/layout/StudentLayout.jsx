import { useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { Navbar } from "./Navbar"
import { BottomTabNav } from "./BottomTabNav"

export function StudentLayout() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <div className="flex flex-col h-screen">
      <Navbar onMenu={() => setMenuOpen((m) => !m)} title={pageTitle(location.pathname)} />
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="px-4 sm:px-6 lg:px-8 py-6 pb-24"><Outlet /></div>
      </main>
      <BottomTabNav />
    </div>
  )
}

function pageTitle(path) {
  const map = {
    "/student": "Home",
    "/student/library": "Quiz Library",
    "/student/leaderboard": "Leaderboard",
    "/student/badges": "Badges",
    "/student/profile": "Profile",
  }
  return map[path] || "ImmersionQuest"
}
