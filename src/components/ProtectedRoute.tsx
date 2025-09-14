import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthProvider'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireRole?: 'ARTIST' | 'COLLECTOR' | 'BOTH'
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  requireRole 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: 'var(--text-secondary)'
      }}>
        Loading...
      </div>
    )
  }

  // Redirect to start page if authentication is required but user is not logged in
  if (requireAuth && !user) {
    return <Navigate to="/start" state={{ from: location }} replace />
  }

  // If user is logged in but doesn't have required role, redirect to dashboard
  if (user && requireRole && user.role !== requireRole && user.role !== 'BOTH') {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}