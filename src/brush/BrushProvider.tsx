import { type ReactNode, useEffect, createContext, useContext, useState, lazy } from 'react'
import './theme.css'

// Lazy load components
const Button = lazy(() => import('./components/Button'))
const Card = lazy(() => import('./components/Card'))
const Icon = lazy(() => import('./Icon'))
const Input = lazy(() => import('./components/forms/Input'))

interface BrushTheme {
  mode: 'light' | 'dark'
  accent: string
  radius: 'none' | 'sm' | 'md' | 'lg'
  density: 'compact' | 'comfortable' | 'spacious'
}

interface BrushContextType {
  theme: BrushTheme
  setTheme: (theme: Partial<BrushTheme>) => void
  components: {
    // Component registry for design system
    Button: React.ComponentType<Record<string, unknown>>
    Card: React.ComponentType<Record<string, unknown>>
    Icon: React.ComponentType<Record<string, unknown>>
    Input: React.ComponentType<Record<string, unknown>>
    // Add more as needed
  }
}

const BrushContext = createContext<BrushContextType | undefined>(undefined)

export function BrushProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<BrushTheme>({
    mode: 'light',
    accent: '#6f1fff',
    radius: 'md',
    density: 'comfortable'
  })

  const setTheme = (newTheme: Partial<BrushTheme>) => {
    setThemeState(prev => ({ ...prev, ...newTheme }))
  }

  useEffect(() => {
    // Apply theme to CSS custom properties
    document.documentElement.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--bg')
    
    // Apply theme mode
    document.documentElement.setAttribute('data-theme', theme.mode)
    document.documentElement.setAttribute('data-density', theme.density)
    
    // Apply custom accent color
    document.documentElement.style.setProperty('--primary', theme.accent)
    
    // Apply border radius preference
    const radiusValues = {
      none: '0px',
      sm: '4px', 
      md: '8px',
      lg: '12px'
    }
    document.documentElement.style.setProperty('--radius-base', radiusValues[theme.radius])
  }, [theme])

  // Component registry for design system
  const components = {
    Button,
    Card,
    Icon,
    Input,
  }

  const contextValue: BrushContextType = {
    theme,
    setTheme,
    components: components as unknown as BrushContextType['components']
  }

  return (
    <BrushContext.Provider value={contextValue}>
      {children}
    </BrushContext.Provider>
  )
}

export function useBrush() {
  const context = useContext(BrushContext)
  if (context === undefined) {
    throw new Error('useBrush must be used within a BrushProvider')
  }
  return context
}

