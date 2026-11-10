import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

export function ProtectedRoute({ children, roles = ["student", "admin"] }) {
  const { user, loading, isAuthenticated } = useAuth()
  const location = useLocation()

  if (loading) return null // or a spinner
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  if (!roles.includes(user.role)) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/student"} replace />
  }
  return <>{children}</>
}

export function RoleGate({ children, role, fallback }) {
  const { user } = useAuth()
  if (!user) return <>{fallback || null}</>
  return user.role === role ? <>{children}</> : <>{fallback || null}</>
}
