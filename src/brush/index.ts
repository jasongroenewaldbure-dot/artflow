// Brush Design System - Main Export
// Single source of truth for all design system components

// Core Design System
export { BrushProvider, useBrush } from './BrushProvider'
export { default as BrushIcon } from './Icon'

// Component Library
export * from './components'

// Theme and Tokens
export * from './tokens'
export * from './palette-tokens'
export * from './colors'
export * from './spacing'
export { typography } from './typography'

// Utilities
export const brushTheme = {
  colors: {
    primary: 'var(--primary)',
    secondary: 'var(--secondary)', 
    accent: 'var(--accent)',
    background: 'var(--bg)',
    foreground: 'var(--fg)',
    muted: 'var(--muted)',
    border: 'var(--border)',
    card: 'var(--card)',
    danger: 'var(--danger)',
    warning: 'var(--warning)',
    success: 'var(--success)'
  },
  spacing: {
    xs: 'var(--space-xs)',
    sm: 'var(--space-sm)',
    md: 'var(--space-md)',
    lg: 'var(--space-lg)',
    xl: 'var(--space-xl)',
    '2xl': 'var(--space-2xl)'
  },
  radius: {
    none: '0',
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)'
  },
  shadows: {
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
    xl: 'var(--shadow-xl)'
  }
}

// Design System Utilities
export const brushUtils = {
  // Get CSS custom property value
  getCSSVar: (property: string) => {
    if (typeof window !== 'undefined') {
      return getComputedStyle(document.documentElement).getPropertyValue(property)
    }
    return ''
  },
  
  // Set CSS custom property value
  setCSSVar: (property: string, value: string) => {
    if (typeof window !== 'undefined') {
      document.documentElement.style.setProperty(property, value)
    }
  },
  
  // Toggle dark mode
  toggleDarkMode: () => {
    if (typeof window !== 'undefined') {
      const current = document.documentElement.getAttribute('data-theme')
      const newTheme = current === 'dark' ? 'light' : 'dark'
      document.documentElement.setAttribute('data-theme', newTheme)
      localStorage.setItem('brush-theme', newTheme)
    }
  },
  
  // Get current theme
  getCurrentTheme: () => {
    if (typeof window !== 'undefined') {
      return document.documentElement.getAttribute('data-theme') || 'light'
    }
    return 'light'
  }
}
