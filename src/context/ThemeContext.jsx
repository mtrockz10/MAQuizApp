import { createContext, useContext, useEffect, useState } from "react"
import { STORAGE_KEYS } from "../utils/constants"

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light"
    return localStorage.getItem(STORAGE_KEYS.THEME) || "light"
  })

  useEffect(() => {
    const root = window.document.documentElement
    if (theme === "dark") root.classList.add("dark")
    else root.classList.remove("dark")
    localStorage.setItem(STORAGE_KEYS.THEME, theme)
  }, [theme])

  const toggle = () => setTheme((prev) => (prev === "light" ? "dark" : "light"))

  const value = { theme, toggle }
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider")
  return ctx
}
