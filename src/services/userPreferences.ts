import { supabase } from '../lib/supabase'

// Get the API key to check if it's configured
// const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mZGR4cnBpdWF3Z2dtbnpxYWduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMzY2MjcsImV4cCI6MjA3MDkxMjYyN30.DfF1W6VRqto7KLwatpul63wPJbsJ23cTQ4Z4VGBlKdU'

export interface UserPreferences {
  id: string
  user_id: string
  preferred_mediums: string[]
  preferred_styles: string[]
  favorite_artists: string[]
  learned_preferences: any
  created_at: string
  updated_at: string
  min_budget: number
  max_budget: number
  notifications_enabled: boolean
  learning_enabled: boolean
  budget_mode: 'no_limit' | 'range' | 'max_value'
  use_learned_budget: boolean
  alert_specific_artists: string[]
  alert_specific_mediums: string[]
  alert_specific_styles: string[]
  exclude_mediums: string[]
  exclude_styles: string[]
  exclude_artists: string[]
  notify_by_email: boolean
  preferred_digest_time: string
  // Additional properties for enhanced functionality
  searchHistory?: SearchQuery[]
  browsingBehavior?: {
    sessionDuration?: number
    pagesPerSession?: number
    bounceRate?: number
    returnVisits?: number
    searchPatterns?: any[]
    clickThroughRates?: any
    averageSessionDuration?: number
    mostViewedGenres?: string[]
    mostViewedMediums?: string[]
    mostViewedArtists?: string[]
    preferredPriceRange?: { min: number; max: number }
    timeOfDayPreferences?: any
    devicePreferences?: any
    locationPreferences?: any
  }
  favoriteGenres?: string[]
  favoriteMediums?: string[]
  priceRange?: { min: number; max: number }
  preferredArtists?: string[]
  savedSearches?: SavedSearch[]
}

export interface SearchQuery {
  query: string
  timestamp: string
  resultsCount: number
  clickedResults: string[]
  filters: SearchFilters
}

export interface SavedSearch {
  id: string
  name: string
  query: string
  filters: SearchFilters
  isActive: boolean
  createdAt: string
}

export interface SearchFilters {
  genres?: string[]
  mediums?: string[]
  colors?: string[]
  styles?: string[]
  sizes?: string[]
  years?: string[]
  priceRange?: { min: number; max: number }
  artists?: string[]
  timePeriod?: { start: number; end: number }
  availability?: 'available' | 'sold' | 'all'
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'oldest' | 'popular'
}

export interface BrowsingBehavior {
  averageSessionDuration: number
  mostViewedGenres: string[]
  mostViewedMediums: string[]
  mostViewedArtists: string[]
  preferredPriceRange: { min: number; max: number }
  searchPatterns: string[]
  clickThroughRates: { [key: string]: number }
  timeOfDayPreferences: { [key: string]: number }
  devicePreferences: { [key: string]: number }
}

class UserPreferencesService {
  private cache = new Map<string, UserPreferences>()
  private cacheExpiry = 5 * 60 * 1000 // 5 minutes
  private retryCount = new Map<string, number>()
  private maxRetries = 3

  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    // Check cache first
    const cached = this.cache.get(userId)
    if (cached && Date.now() - new Date(cached.updated_at).getTime() < this.cacheExpiry) {
      return cached
    }

    // Check retry limit
    const retries = this.retryCount.get(userId) || 0
    if (retries >= this.maxRetries) {
      console.warn(`Max retries reached for user ${userId}, returning null preferences`)
      return null
    }

    // Check if we have a valid Supabase connection
    if (!supabase) {
      console.warn('Supabase not available, returning null preferences')
      return null
    }

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No preferences found, create default
          return await this.createDefaultPreferences(userId)
        }
        throw error
      }

      const preferences = data as UserPreferences
      this.cache.set(userId, preferences)
      this.retryCount.delete(userId) // Reset retry count on success
      return preferences
    } catch (error) {
      console.error('Error fetching user preferences:', error)
      this.retryCount.set(userId, retries + 1)
      // Return null instead of retrying to prevent infinite loops
      return null
    }
  }

  async createDefaultPreferences(userId: string): Promise<UserPreferences> {
    const defaultPreferences: Omit<UserPreferences, 'id' | 'created_at' | 'updated_at'> = {
      user_id: userId,
      preferred_mediums: [],
      preferred_styles: [],
      favorite_artists: [],
      learned_preferences: null,
      min_budget: 0,
      max_budget: 1000000,
      notifications_enabled: true,
      learning_enabled: true,
      budget_mode: 'no_limit',
      use_learned_budget: false,
      alert_specific_artists: [],
      alert_specific_mediums: [],
      alert_specific_styles: [],
      exclude_mediums: [],
      exclude_styles: [],
      exclude_artists: [],
      notify_by_email: true,
      preferred_digest_time: '08:00:00+00'
    }

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .insert(defaultPreferences)
        .select()
        .single()

      if (error) throw error

      const preferences = data as UserPreferences
      this.cache.set(userId, preferences)
      return preferences
    } catch (error) {
      console.error('Error creating default preferences:', error)
      throw error
    }
  }

  async updatePreferences(userId: string, updates: Partial<UserPreferences>): Promise<UserPreferences> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .update({
          ...updates,
          updatedAt: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error

      const preferences = data as UserPreferences
      this.cache.set(userId, preferences)
      return preferences
    } catch (error) {
      console.error('Error updating preferences:', error)
      throw error
    }
  }

  async recordSearchQuery(userId: string, query: string, filters: SearchFilters, resultsCount: number): Promise<void> {
    try {
      const preferences = await this.getUserPreferences(userId)
      if (!preferences) return

      const searchQuery: SearchQuery = {
        query,
        timestamp: new Date().toISOString(),
        resultsCount,
        clickedResults: [],
        filters
      }

      const updatedHistory = [searchQuery, ...(preferences.searchHistory || [])].slice(0, 100) // Keep last 100 searches

      await this.updatePreferences(userId, {
        searchHistory: updatedHistory
      })

      // Update browsing behavior
      await this.updateBrowsingBehavior(userId, {
        searchPatterns: [...(preferences.browsingBehavior?.searchPatterns || []), query].slice(-50)
      })
    } catch (error) {
      console.error('Error recording search query:', error)
    }
  }

  async recordClick(userId: string, resultId: string, resultType: string): Promise<void> {
    try {
      const preferences = await this.getUserPreferences(userId)
      if (!preferences) return

      // Update click-through rates
      const clickThroughRates = { ...(preferences.browsingBehavior?.clickThroughRates || {}) }
      clickThroughRates[resultId] = (clickThroughRates[resultId] || 0) + 1

      // Update most viewed items based on type
      let updatedBehavior = { 
        ...preferences.browsingBehavior,
        clickThroughRates,
        sessionDuration: preferences.browsingBehavior?.sessionDuration || 0,
        pagesPerSession: preferences.browsingBehavior?.pagesPerSession || 0,
        bounceRate: preferences.browsingBehavior?.bounceRate || 0,
        returnVisits: preferences.browsingBehavior?.returnVisits || 0
      }

      if (resultType === 'artwork') {
        // This would need to be enhanced to get artwork details
        // For now, we'll just record the click
      }

      await this.updatePreferences(userId, {
        browsingBehavior: updatedBehavior
      })
    } catch (error) {
      console.error('Error recording click:', error)
    }
  }

  async updateBrowsingBehavior(userId: string, updates: Partial<BrowsingBehavior>): Promise<void> {
    try {
      const preferences = await this.getUserPreferences(userId)
      if (!preferences) return

      const updatedBehavior = {
        ...preferences.browsingBehavior,
        ...updates
      }

      await this.updatePreferences(userId, {
        browsingBehavior: updatedBehavior
      })
    } catch (error) {
      console.error('Error updating browsing behavior:', error)
    }
  }

  async getPersonalizedSuggestions(userId: string, limit: number = 10): Promise<string[]> {
    try {
      const preferences = await this.getUserPreferences(userId)
      if (!preferences) return []

      const suggestions: string[] = []

      // Add recent search patterns (if available)
      if (preferences.learned_preferences?.searchPatterns) {
        const recentPatterns = preferences.learned_preferences.searchPatterns.slice(-10)
        suggestions.push(...recentPatterns)
      }

      // Add favorite genres and mediums (if available)
      if (preferences.preferred_styles) {
        suggestions.push(...preferences.preferred_styles)
      }
      if (preferences.preferred_mediums) {
        suggestions.push(...preferences.preferred_mediums)
      }

      // Add trending searches (this would come from analytics)
      const trending = await this.getTrendingSearches()
      suggestions.push(...trending.slice(0, 5))

      // Remove duplicates and return unique suggestions
      return [...new Set(suggestions)].slice(0, limit)
    } catch (error) {
      console.error('Error getting personalized suggestions:', error)
      return []
    }
  }

  async getRecommendedFilters(userId: string): Promise<SearchFilters> {
    try {
      const preferences = await this.getUserPreferences(userId)
      if (!preferences) return {}

      const recommended: SearchFilters = {}

      // Recommend based on user's favorite genres
      if (preferences.favoriteGenres && preferences.favoriteGenres.length > 0) {
        recommended.genres = preferences.favoriteGenres.slice(0, 3)
      }

      // Recommend based on user's favorite mediums
      if (preferences.favoriteMediums && preferences.favoriteMediums.length > 0) {
        recommended.mediums = preferences.favoriteMediums.slice(0, 3)
      }

      // Recommend based on user's price range
      if (preferences.priceRange) {
        recommended.priceRange = preferences.priceRange
      }

      // Recommend based on user's preferred artists
      if (preferences.preferredArtists && preferences.preferredArtists.length > 0) {
        recommended.artists = preferences.preferredArtists.slice(0, 5)
      }

      return recommended
    } catch (error) {
      console.error('Error getting recommended filters:', error)
      return {}
    }
  }

  async saveSearch(userId: string, name: string, query: string, filters: SearchFilters): Promise<void> {
    try {
      const preferences = await this.getUserPreferences(userId)
      if (!preferences) return

      const savedSearch: SavedSearch = {
        id: crypto.randomUUID(),
        name,
        query,
        filters,
        isActive: true,
        createdAt: new Date().toISOString()
      }

      const updatedSearches = [...(preferences.savedSearches || []), savedSearch]

      await this.updatePreferences(userId, {
        savedSearches: updatedSearches
      })
    } catch (error) {
      console.error('Error saving search:', error)
    }
  }

  async getSavedSearches(userId: string): Promise<SavedSearch[]> {
    try {
      const preferences = await this.getUserPreferences(userId)
      if (!preferences) return []

      return (preferences.savedSearches || []).filter(search => search.isActive)
    } catch (error) {
      console.error('Error getting saved searches:', error)
      return []
    }
  }

  async deleteSavedSearch(userId: string, searchId: string): Promise<void> {
    try {
      const preferences = await this.getUserPreferences(userId)
      if (!preferences) return

      const updatedSearches = (preferences.savedSearches || []).map(search =>
        search.id === searchId ? { ...search, isActive: false } : search
      )

      await this.updatePreferences(userId, {
        savedSearches: updatedSearches
      })
    } catch (error) {
      console.error('Error deleting saved search:', error)
    }
  }

  private async getTrendingSearches(): Promise<string[]> {
    // This would typically come from analytics data
    // For now, return some sample trending searches
    return [
      'abstract art',
      'contemporary paintings',
      'digital art',
      'portrait photography',
      'landscape paintings',
      'sculpture',
      'watercolor',
      'mixed media',
      'street art',
      'minimalist'
    ]
  }

  async getQuickFilters(userId: string): Promise<QuickFilter[]> {
    try {
      const preferences = await this.getUserPreferences(userId)
      if (!preferences) return this.getDefaultQuickFilters()

      const quickFilters: QuickFilter[] = []

      // Add user's favorite genres as quick filters
      if (preferences.favoriteGenres) {
        preferences.favoriteGenres.forEach(genre => {
          quickFilters.push({
            id: `genre_${genre}`,
            label: genre,
            type: 'genre',
            value: genre,
            isActive: false
          })
        })
      }

      // Add user's favorite mediums as quick filters
      if (preferences.favoriteMediums) {
        preferences.favoriteMediums.forEach(medium => {
          quickFilters.push({
            id: `medium_${medium}`,
            label: medium,
            type: 'medium',
            value: medium,
            isActive: false
          })
        })
      }

      // Add price range quick filters
      const priceRanges = [
        { label: 'Under $100', min: 0, max: 100 },
        { label: '$100 - $500', min: 100, max: 500 },
        { label: '$500 - $1000', min: 500, max: 1000 },
        { label: '$1000 - $5000', min: 1000, max: 5000 },
        { label: 'Over $5000', min: 5000, max: 100000 }
      ]

      priceRanges.forEach(range => {
        quickFilters.push({
          id: `price_${range.min}_${range.max}`,
          label: range.label,
          type: 'priceRange',
          value: { min: range.min, max: range.max },
          isActive: false
        })
      })

      return quickFilters.slice(0, 10) // Limit to 10 quick filters
    } catch (error) {
      console.error('Error getting quick filters:', error)
      return this.getDefaultQuickFilters()
    }
  }

  private getDefaultQuickFilters(): QuickFilter[] {
    return [
      { id: 'genre_abstract', label: 'Abstract', type: 'genre', value: 'abstract', isActive: false },
      { id: 'genre_contemporary', label: 'Contemporary', type: 'genre', value: 'contemporary', isActive: false },
      { id: 'medium_painting', label: 'Painting', type: 'medium', value: 'painting', isActive: false },
      { id: 'medium_photography', label: 'Photography', type: 'medium', value: 'photography', isActive: false },
      { id: 'price_under_100', label: 'Under $100', type: 'priceRange', value: { min: 0, max: 100 }, isActive: false },
      { id: 'price_100_500', label: '$100 - $500', type: 'priceRange', value: { min: 100, max: 500 }, isActive: false }
    ]
  }
}

export interface QuickFilter {
  id: string
  label: string
  type: 'genre' | 'medium' | 'color' | 'priceRange' | 'artist'
  value: string | { min: number; max: number }
  isActive: boolean
}

export const userPreferencesService = new UserPreferencesService()
