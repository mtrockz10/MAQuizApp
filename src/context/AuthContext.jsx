import { createContext, useContext, useEffect, useState } from "react"
import { authService } from "../services/api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // hydrate user from localStorage on mount
    const stored = authService.getCurrentUser()
    setUser(stored)
    setLoading(false)

    const syncUser = () => setUser(authService.getCurrentUser())
    window.addEventListener("iq-user-updated", syncUser)
    return () => window.removeEventListener("iq-user-updated", syncUser)
  }, [])

  const login = async (email, password) => {
    const u = await authService.login(email, password)
    setUser(u)
    return u
  }

  const register = async (data) => {
    const u = await authService.register(data)
    setUser(u)
    return u
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    window.location.replace("/login")
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user && user.role === "admin",
    isStudent: user && user.role === "student",
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
  return ctx
}
