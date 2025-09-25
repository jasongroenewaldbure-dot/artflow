import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthProvider'
import LoadingSpinner from '../feedback/LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'ARTIST' | 'COLLECTOR' | 'ADMIN'
  requireOnboarding?: boolean
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  requireOnboarding = true 
}) => {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh'
      }}>
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/start" state={{ from: location }} replace />
  }

  // Check if user needs to complete onboarding
  if (requireOnboarding && profile) {
    const needsOnboarding = !profile.profile_complete || !profile.password_set || !profile.display_name
    if (needsOnboarding) {
      return <Navigate to="/onboarding" replace />
    }
  }

  if (requiredRole && profile?.role !== requiredRole) {
    return <Navigate to="/u/dashboard" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute