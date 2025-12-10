import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface OwnerRouteProps {
  children: React.ReactNode
}

export function OwnerRoute({ children }: OwnerRouteProps) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-dark">
        <div className="w-16 h-16 border-t-2 border-b-2 rounded-full animate-spin border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Check if user is restaurant_owner or admin
  if (profile?.role !== 'restaurant_owner' && profile?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-dark">
        <div className="max-w-md text-center card">
          <div className="mb-4 text-6xl">🚫</div>
          <h2 className="mb-2 text-h2 text-champagne">Access Denied</h2>
          <p className="mb-6 text-champagne/70">
            You don't have permission to access the owner dashboard.
          </p>
          <a href="/" className="btn-primary">
            Back to Home
          </a>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
