// Core TypeScript interfaces for ArtFlow
// This file centralizes all type definitions to eliminate 'any' usage

export interface User {
  id: string
  email: string
  email_confirmed_at?: string
  phone?: string
  confirmed_at?: string
  last_sign_in_at?: string
  app_metadata: Record<string, unknown>
  user_metadata: Record<string, unknown>
  identities?: Identity[]
  created_at: string
  updated_at: string
}

export interface Identity {
  id: string
  user_id: string
  identity_data: Record<string, unknown>
  provider: string
  last_sign_in_at?: string
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  full_name?: string
  display_name?: string
  username?: string
  bio?: string
  location?: string
  avatar_url?: string
  website?: string
  instagram?: string
  twitter?: string
  role: 'artist' | 'collector' | 'both'
  password_set?: boolean
  profile_complete: boolean
  created_at: string
  updated_at: string
}

export interface Artwork {
  id: string
  title: string
  description?: string
  medium: string
  year: number
  price: number
  currency: 'ZAR' | 'USD' | 'EUR' | 'GBP'
  dimensions: {
    width: number
    height: number
    depth?: number
    unit: 'cm' | 'in'
  }
  primary_image_url: string
  additional_images?: string[]
  genre?: string
  style?: string
  subject?: string
  availability: 'available' | 'sold' | 'reserved'
  user_id: string
  profiles?: Profile | Profile[]
  created_at: string
  updated_at: string
  view_count?: number
  like_count?: number
  is_featured?: boolean
  tags?: string[]
}

export interface Artist extends Profile {
  role: 'artist'
  artworks?: Artwork[]
  specialties?: string[]
  education?: string[]
  exhibitions?: Exhibition[]
  awards?: string[]
  statement?: string
  cv_url?: string
}

export interface Collector extends Profile {
  role: 'collector'
  collecting_interests?: string[]
  budget_range?: {
    min: number
    max: number
    currency: string
  }
  preferred_mediums?: string[]
  preferred_styles?: string[]
  collection_focus?: string
}

export interface Exhibition {
  id: string
  title: string
  description?: string
  venue: string
  location: string
  start_date: string
  end_date: string
  type: 'solo' | 'group'
  url?: string
}

export interface Catalogue {
  id: string
  title: string
  description?: string
  cover_image_url?: string
  artworks: Artwork[]
  artist_id: string
  profiles?: Profile
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface Sale {
  id: string
  artwork_id: string
  artworks?: Artwork | Artwork[]
  buyer_id: string
  seller_id: string
  price: number
  currency: string
  commission_rate: number
  status: 'pending' | 'completed' | 'cancelled' | 'refunded'
  payment_method?: string
  transaction_id?: string
  created_at: string
  updated_at: string
}

export interface UserPreferences {
  user_id: string
  preferred_mediums: string[] | null
  preferred_styles: string[] | null
  min_budget: number | null
  max_budget: number | null
  use_learned_budget: boolean | null
  learned_preferences: LearnedPreferences | null
  live_preferences: UserLivePreferences | null
  notification_real_time: NotificationEntityTypeSettings | null
  notification_daily: NotificationEntityTypeSettings | null
  notification_weekly: NotificationEntityTypeSettings | null
  alert_specific_artists: string[] | null
  alert_specific_mediums: string[] | null
  alert_specific_styles: string[] | null
  exclude_mediums: string[] | null
  exclude_styles: string[] | null
  exclude_artists: string[] | null
  notify_by_email: boolean | null
  notify_price_drops: boolean | null
  notify_new_works: boolean | null
  notify_auction_reminders: boolean | null
  notify_collection_insights: boolean | null
  preferred_digest_time: string | null
  updated_at: string
}

export interface NotificationEntityTypeSettings {
  artwork: boolean
  artist: boolean
  catalogue: boolean
}

export interface LearnedBudgetRange {
  min: number
  max: number
  confidence?: string
}

export interface LearnedPreferences {
  top_liked_mediums?: { name: string; count: number; confidence: number }[]
  top_liked_styles?: { name: string; count: number; confidence: number }[]
  preferred_price_range_from_behavior?: LearnedBudgetRange
  overall_engagement_score?: number
  color_preferences?: Array<{ 
    color: string
    hex: string
    oklch: {
      l: number
      c: number
      h: number
    }
    frequency: number
    confidence: number
  }>
  behavioral_patterns?: {
    peak_browsing_hours: string[]
    session_duration_avg: number
    decision_speed: 'fast' | 'moderate' | 'slow'
    research_depth: 'surface' | 'moderate' | 'deep'
    price_sensitivity: number
    social_influence_factor: number
  }
  ai_performance?: {
    recommendation_accuracy: number
    discovery_success_rate: number
    total_interactions: number
    learning_velocity: number
    exploration_rate: number
    last_updated: string
  }
  market_intelligence?: {
    collection_gaps: string[]
    investment_opportunities: Array<{ 
      artist: string
      confidence: number
      reasoning: string
      potential_return: number
    }>
    optimal_buying_times: string[]
    budget_optimization_suggestions: string[]
  }
  negative_preferences?: {
    disliked_mediums?: string[]
    disliked_styles?: string[]
    disliked_colors?: string[]
    rejected_artists?: string[]
  }
  top_followed_artists?: { artist_id: string; full_name: string }[]
  last_learned_update?: string
}

export interface UserLivePreferences {
  paletteBias: 'warm' | 'cool' | 'neutral' | 'vibrant' | 'muted'
  priceSensitivity: number // 0-1, 0 = budget-focused, 1 = price-insensitive
  abstractionLevel: number // 0-1, 0 = figurative, 1 = abstract
  discoveryMode: number // 0-1, 0 = safe/familiar, 1 = adventurous/new
  sizeBias: 'small' | 'medium' | 'large' | 'any'
  mediumFocus: string[]
  colorPreferences: string[]
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  errors?: string[]
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Search and Filter Types
export interface SearchFilters {
  query?: string
  mediums?: string[]
  styles?: string[]
  genres?: string[]
  colors?: string[]
  priceRange?: {
    min: number
    max: number
    currency: string
  }
  sizeRange?: {
    minWidth: number
    maxWidth: number
    minHeight: number
    maxHeight: number
    unit: 'cm' | 'in'
  }
  yearRange?: {
    min: number
    max: number
  }
  availability?: ('available' | 'sold' | 'reserved')[]
  artists?: string[]
  location?: string
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'oldest' | 'popular' | 'title_asc'
  page?: number
  limit?: number
}

export interface SearchResult {
  artworks: Artwork[]
  artists: Artist[]
  total: number
  query: string
  filters: SearchFilters
  suggestions?: string[]
  facets?: {
    mediums: { name: string; count: number }[]
    styles: { name: string; count: number }[]
    priceRanges: { range: string; count: number }[]
  }
}

// Error Types
export interface ApiError {
  name: string
  message: string
  status?: number
  code?: string
  details?: Record<string, unknown>
}

export interface ValidationError {
  field: string
  message: string
  code: string
  value?: unknown
}

// Component Props Types
export interface ArtworkCardProps {
  artwork: Artwork
  showActions?: boolean
  onLike?: (artworkId: string) => void
  onSave?: (artworkId: string) => void
  onShare?: (artwork: Artwork) => void
  onClick?: (artwork: Artwork) => void
  className?: string
}

export interface ArtworkGridProps {
  artworks: Artwork[]
  columns?: number
  gap?: number
  showActions?: boolean
  onArtworkClick?: (artwork: Artwork) => void
  onLike?: (artworkId: string) => void
  onSave?: (artworkId: string) => void
  onShare?: (artwork: Artwork) => void
  className?: string
  loading?: boolean
  error?: string | null
}

export interface FilterProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  facets?: SearchResult['facets']
  loading?: boolean
}

// Form Types
export interface ArtworkFormData {
  title: string
  description?: string
  medium: string
  year: number
  price: number
  currency: string
  dimensions: {
    width: number
    height: number
    depth?: number
    unit: 'cm' | 'in'
  }
  genre?: string
  style?: string
  subject?: string
  tags?: string[]
  primary_image?: File
  additional_images?: File[]
}

export interface ProfileFormData {
  full_name?: string
  display_name?: string
  bio?: string
  location?: string
  website?: string
  instagram?: string
  twitter?: string
  avatar?: File
}

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export interface PaginationState {
  page: number
  limit: number
  total: number
  hasNext: boolean
  hasPrev: boolean
}

// Context Types
export interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData?: Partial<Profile>) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<Profile>) => Promise<void>
  refreshProfile: () => Promise<void>
}

// Hook Return Types
export interface UseArtworksReturn {
  artworks: Artwork[]
  loading: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => void
  refresh: () => void
  filters: SearchFilters
  setFilters: (filters: SearchFilters) => void
}

export interface UseSearchReturn {
  results: SearchResult | null
  loading: boolean
  error: string | null
  search: (query: string, filters?: SearchFilters) => void
  clearSearch: () => void
}

// Event Types
export interface ArtworkInteractionEvent {
  type: 'view' | 'like' | 'save' | 'share' | 'inquiry'
  artworkId: string
  userId: string
  timestamp: string
  metadata?: Record<string, unknown>
}

export interface SearchEvent {
  query: string
  filters: SearchFilters
  resultsCount: number
  userId?: string
  timestamp: string
}

// Configuration Types
export interface AppConfig {
  apiBaseUrl: string
  supabaseUrl: string
  supabaseAnonKey: string
  sentryDsn?: string
  posthogKey?: string
  stripePublishableKey?: string
  environment: 'development' | 'staging' | 'production'
  features: {
    aiRecommendations: boolean
    socialFeatures: boolean
    marketplace: boolean
    analytics: boolean
  }
}

// Re-export commonly used types
export type { Database } from './database.types'
