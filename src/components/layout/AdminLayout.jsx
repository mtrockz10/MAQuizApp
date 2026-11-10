import { useState } from "react"
import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { cn } from "../../utils/cn"

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={cn("flex-1 overflow-y-auto transition-all duration-300", collapsed ? "pl-16" : "pl-64")}>
        <div className="px-6 sm:px-8 py-6"><Outlet /></div>
      </div>
    </div>
  )
}
