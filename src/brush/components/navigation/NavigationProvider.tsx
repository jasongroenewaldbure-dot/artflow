import React, { createContext, useContext, ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthProvider'
import PublicHeader from './PublicHeader'
import LoggedInLayout from '../layout/LoggedInLayout'

interface NavigationContextType {
  // Add navigation context properties as needed
  [key: string]: unknown
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

interface NavigationProviderProps {
  children: ReactNode
}

const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const location = useLocation()
  const { user } = useAuth()
  
  const value: NavigationContextType = {
    // Initialize context value
  }

  // Determine which layout to show based on route and auth state
  const isPublicRoute = location.pathname === '/' || 
                       location.pathname.startsWith('/start') ||
                       location.pathname.startsWith('/auth') ||
                       location.pathname === '/artworks' ||
                       location.pathname === '/artists' ||
                       location.pathname === '/catalogues' ||
                       location.pathname === '/community'

  // If user is logged in and not on a public route, use the logged-in layout
  if (user && !isPublicRoute) {
    return (
      <NavigationContext.Provider value={value}>
        <LoggedInLayout>
          {children}
        </LoggedInLayout>
      </NavigationContext.Provider>
    )
  }

  // Otherwise, use the public header
  return (
    <NavigationContext.Provider value={value}>
      <PublicHeader />
      {children}
    </NavigationContext.Provider>
  )
}

export default NavigationProvider

export const useNavigation = () => {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}
