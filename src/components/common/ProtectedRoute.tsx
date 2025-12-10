import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/types/database.types'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  useEffect(() => {
    console.log('🛡️ ProtectedRoute check:', { 
      hasUser: !!user, 
      loading, 
      path: location.pathname 
    })
  }, [user, loading, location.pathname])

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-dark">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-t-2 border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="text-champagne/70">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.warn('⚠️ No user found, redirecting to login')
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  // Check role permissions
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.warn('⚠️ User role not allowed:', user.role)
    return <Navigate to="/" replace />
  }

  console.log('✅ User authorized')
  return <>{children}</>
}
