import React, { createContext, useContext, ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthProvider'
import PublicHeader from './PublicHeader'
import Header from '../marketplace/Header'

interface NavigationContextType {
  // Add navigation context properties as needed
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

  // Determine which header to show based on route and auth state
  const isPublicRoute = location.pathname === '/' || 
                       location.pathname.startsWith('/start') ||
                       location.pathname.startsWith('/auth') ||
                       location.pathname === '/artworks' ||
                       location.pathname === '/artists' ||
                       location.pathname === '/catalogues' ||
                       location.pathname === '/community'

  const HeaderComponent = (!user || isPublicRoute) ? PublicHeader : Header

  return (
    <NavigationContext.Provider value={value}>
      <HeaderComponent />
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
