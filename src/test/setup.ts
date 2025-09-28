// Jest setup file for testing environment
import '@testing-library/jest-dom'
import { configure } from '@testing-library/react'

// Configure testing library
configure({ testIdAttribute: 'data-testid' })

// Mock environment variables
process.env.VITE_SUPABASE_URL = 'https://test.supabase.co'
process.env.VITE_SUPABASE_ANON_KEY = 'test-key'

// Mock Supabase
const mockSupabase = {
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: null }),
      }),
    }),
  }),
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    signIn: () => Promise.resolve({ data: null, error: null }),
    signOut: () => Promise.resolve({ error: null }),
  },
}

// Mock logger
const mockLogger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
  userAction: () => {},
  performance: () => {},
}

// Mock React Router
const mockNavigate = () => {}
const mockLocation = { pathname: '/' }
const mockParams = {}

// Mock Intersection Observer
const mockIntersectionObserver = () => ({
  observe: () => {},
  unobserve: () => {},
  disconnect: () => {},
})

// Mock ResizeObserver
const mockResizeObserver = () => ({
  observe: () => {},
  unobserve: () => {},
  disconnect: () => {},
})

// Mock window.matchMedia
const mockMatchMedia = () => ({
  matches: false,
  media: '',
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => {},
})

// Mock performance.now
const mockPerformance = {
  now: () => Date.now(),
}

// Suppress console warnings in tests
const originalConsoleWarn = console.warn
console.warn = (...args: any[]) => {
  if (
    args[0]?.includes?.('Warning: ReactDOM.render is no longer supported') ||
    args[0]?.includes?.('Warning: React.createFactory() is deprecated')
  ) {
    return
  }
  originalConsoleWarn(...args)
}
