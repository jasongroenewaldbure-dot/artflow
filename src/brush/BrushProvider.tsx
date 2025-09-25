import { type ReactNode, useEffect, createContext, useContext, useState } from 'react'
import './theme.css'

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
    Button: React.ComponentType<any>
    Card: React.ComponentType<any>
    Icon: React.ComponentType<any>
    Input: React.ComponentType<any>
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
    Button: () => import('./components/Button'),
    Card: () => import('./components/Card'),
    Icon: () => import('./Icon'),
    Input: () => import('./components/forms/Input'),
  }

  const contextValue: BrushContextType = {
    theme,
    setTheme,
    components
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

