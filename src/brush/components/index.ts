// Brush Design System Components
// Centralized export for all design system components

// Core Components
export { default as BrushButton } from './Button'
export { default as BrushCard } from './Card'
export { default as BrushIcon } from '../Icon'

// Feedback Components  
export { default as LoadingSpinner } from './feedback/LoadingSpinner'

// Auth Components
export { default as AuthStatus } from './auth/AuthStatus'
export { default as ProtectedRoute } from './auth/ProtectedRoute'

// Navigation Components
export { default as NavigationProvider } from './navigation/NavigationProvider'
export { default as PublicHeader } from './navigation/PublicHeader'

// Layout Components
export { default as DashboardLayout } from './layout/DashboardLayout'
export { default as MarketingLayout } from './layout/MarketingLayout'
export { default as PublicPageLayout } from './layout/PublicPageLayout'

// Artwork Components
export { default as ArtworkCard } from './artwork/ArtworkCard'
export { default as ArtworkGrid } from './artwork/ArtworkGrid'
export { default as ArtworkGridOptimized } from './artwork/ArtworkGridOptimized'

// Marketplace Components
export { default as FiltersSidebar } from './marketplace/FiltersSidebar'
export { default as IntelligentFilters } from './marketplace/IntelligentFilters'
export { default as MegaMenu } from './marketplace/MegaMenu'

// Form Components (from old common)
export { default as Input } from './forms/Input'
export { default as Toggle } from './forms/Toggle'
export { default as Container } from './forms/Container'
export { default as Badge } from './forms/Badge'
export { default as ErrorBoundary } from './forms/ErrorBoundary'
export { default as ErrorMessage } from './forms/ErrorMessage'
export { default as LocationSearch } from './forms/LocationSearch'

// Re-export everything for compatibility
export * from './auth'
export * from './navigation'
export * from './layout'
export * from './artwork'
export * from './marketplace'
export * from './forms'
export * from './feedback'
export * from './data'