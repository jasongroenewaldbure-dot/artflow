// Brush Design System Components
// Centralized export for all design system components

// Core Components
export { default as BrushIcon } from '../Icon'

// Feedback Components  
export { default as LoadingSpinner } from './feedback/LoadingSpinner'

// Auth Components
export { default as ProtectedRoute } from './auth/ProtectedRoute'

// Navigation Components
export { default as NavigationProvider } from './navigation/NavigationProvider'
export { default as PublicHeader } from './navigation/PublicHeader'

// Layout Components
export { default as DashboardLayout } from './layout/DashboardLayout'

// Marketplace Components
export { default as Header } from './marketplace/Header'
export { default as HorizontalFilterSystem } from './marketplace/HorizontalFilterSystem'

// Form Components
export { default as Container } from './forms/Container'
export { default as ErrorBoundary } from './forms/ErrorBoundary'
export { default as ErrorMessage } from './forms/ErrorMessage'
export { default as LocationSearch } from './forms/LocationSearch'
export { default as Toggle } from './forms/Toggle'
export { default as Badge } from './forms/Badge'

// Marketplace Components (additional)
export { default as ArtworkCard } from './marketplace/ArtworkCard'
export { default as ArtistCard } from './marketplace/ArtistCard'
export { default as FiltersSidebar } from './marketplace/FiltersSidebar'

// Data Components
export { default as SystemCatalogue } from './data/SystemCatalogue'

// Search Components
export { default as AdvancedSearch } from './search/AdvancedSearch'
export { default as VisualSearch } from './search/VisualSearch'

// Social Components
export { default as UserCollections } from './social/UserCollections'
export { default as ArtistFollowing } from './social/ArtistFollowing'

// Common Components (moved from components/common)
export { default as AdvancedSearchInterface } from './AdvancedSearchInterface'
export { default as LivePreferenceControls, type LivePreferences } from './LivePreferenceControls'
export { default as SerendipityEngine } from './SerendipityEngine'

// Marketplace Components (moved from components/marketplace)
export { default as ArtworkSelector } from './marketplace/ArtworkSelector'

// Artsy Palette Components (moved from palette)
export { Button, type ButtonProps } from './Button'
export { Card, type CardProps } from './Card'
export { Input, type InputProps } from './Input'
export { Typography, type TypographyProps } from './Typography'
