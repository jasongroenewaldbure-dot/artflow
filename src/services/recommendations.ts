import { supabase } from '../lib/supabase'

export interface Recommendation {
  id: string
  type: 'artwork' | 'artist' | 'catalogue'
  title: string
  description: string
  imageUrl?: string
  score: number
  reason: string
  metadata: any
}

export interface CollectorProfile {
  id: string
  preferences: {
    mediums: string[]
    styles: string[]
    colors: string[]
    priceRange: { min: number; max: number }
    artists: string[]
    excludedArtists: string[]
    excludedMediums: string[]
    excludedStyles: string[]
  }
  behavior: {
    likes: string[]
    views: string[]
    searches: string[]
    purchases: string[]
    follows: string[]
    saves: string[]
  }
  goals: {
    budget: number
    targetMediums: string[]
    targetStyles: string[]
    timeline: string
    experience: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  }
}

class RecommendationEngine {
  private cache = new Map<string, Recommendation[]>()
  private cacheExpiry = 5 * 60 * 1000 // 5 minutes

  async getPersonalizedRecommendations(
    collectorId: string, 
    limit: number = 20,
    types: ('artwork' | 'artist' | 'catalogue')[] = ['artwork', 'artist', 'catalogue']
  ): Promise<Recommendation[]> {
    try {
      // Check cache first
      const cacheKey = `${collectorId}_${types.join('_')}_${limit}`
      const cached = this.cache.get(cacheKey)
      if (cached && Date.now() - new Date().getTime() < this.cacheExpiry) {
        return cached
      }

      // Get collector profile
      const profile = await this.getCollectorProfile(collectorId)
      if (!profile) {
        return []
      }

      const recommendations: Recommendation[] = []

      // Generate recommendations for each requested type
      for (const type of types) {
        const typeRecommendations = await this.generateTypeRecommendations(collectorId, type, profile, Math.ceil(limit / types.length))
        recommendations.push(...typeRecommendations)
      }

      // Sort by score and limit results
      const sortedRecommendations = recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)

      // Cache results
      this.cache.set(cacheKey, sortedRecommendations)

      return sortedRecommendations
    } catch (error) {
      console.error('Error generating personalized recommendations:', error)
      return []
    }
  }

  private async getCollectorProfile(collectorId: string): Promise<CollectorProfile | null> {
    try {
      // Get user preferences
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', collectorId)
        .single()

      // Get behavior data
      const { data: likes } = await supabase
        .from('artwork_likes')
        .select('artwork_id')
        .eq('collector_id', collectorId)

      const { data: views } = await supabase
        .from('artwork_views')
        .select('artwork_id')
        .eq('viewer_id', collectorId)

      const { data: purchases } = await supabase
        .from('sales')
        .select('artwork_id')
        .eq('collector_id', collectorId)

      const { data: follows } = await supabase
        .from('followers')
        .select('following_id')
        .eq('follower_id', collectorId)

      return {
        id: collectorId,
        preferences: {
          mediums: preferences?.preferred_mediums || [],
          styles: preferences?.preferred_styles || [],
          colors: preferences?.favorite_colors || [],
          priceRange: {
            min: preferences?.min_budget || 0,
            max: preferences?.max_budget || 100000
          },
          artists: preferences?.favorite_artists || [],
          excludedArtists: preferences?.exclude_artists || [],
          excludedMediums: preferences?.exclude_mediums || [],
          excludedStyles: preferences?.exclude_styles || []
        },
        behavior: {
          likes: likes?.map(l => l.artwork_id) || [],
          views: views?.map(v => v.artwork_id) || [],
          searches: [],
          purchases: purchases?.map(p => p.artwork_id) || [],
          follows: follows?.map(f => f.following_id) || [],
          saves: []
        },
        goals: {
          budget: preferences?.max_budget || 10000,
          targetMediums: preferences?.preferred_mediums || [],
          targetStyles: preferences?.preferred_styles || [],
          timeline: 'flexible',
          experience: 'intermediate'
        }
      }
    } catch (error) {
      console.error('Error getting collector profile:', error)
      return null
    }
  }

  private async generateTypeRecommendations(
    collectorId: string,
    type: 'artwork' | 'artist' | 'catalogue',
    profile: CollectorProfile,
    limit: number
  ): Promise<Recommendation[]> {
    switch (type) {
      case 'artwork':
        return this.generateArtworkRecommendations(collectorId, profile, limit)
      case 'artist':
        return this.generateArtistRecommendations(collectorId, profile, limit)
      case 'catalogue':
        return this.generateCatalogueRecommendations(collectorId, profile, limit)
      default:
        return []
    }
  }

  private async generateArtworkRecommendations(
    collectorId: string,
    profile: CollectorProfile,
    limit: number
  ): Promise<Recommendation[]> {
    try {
      // Build query based on preferences
      let query = supabase
        .from('artworks')
        .select(`
          id, title, description, price, medium, genre, dominant_colors,
          primary_image_url, created_at, user_id,
          profiles!artworks_user_id_fkey(id, name, avatar_url)
        `)
        .eq('status', 'available')
        .not('primary_image_url', 'is', null)

      // Apply price range filter
      if (profile.preferences.priceRange.min > 0) {
        query = query.gte('price', profile.preferences.priceRange.min)
      }
      if (profile.preferences.priceRange.max < 100000) {
        query = query.lte('price', profile.preferences.priceRange.max)
      }

      // Apply medium filter
      if (profile.preferences.mediums.length > 0) {
        query = query.in('medium', profile.preferences.mediums)
      }

      // Apply style filter
      if (profile.preferences.styles.length > 0) {
        query = query.in('genre', profile.preferences.styles)
      }

      // Exclude already liked/viewed/purchased artworks
      const excludeIds = [
        ...profile.behavior.likes,
        ...profile.behavior.views,
        ...profile.behavior.purchases
      ]
      if (excludeIds.length > 0) {
        query = query.not('id', 'in', `(${excludeIds.join(',')})`)
      }

      const { data: artworks, error } = await query.limit(limit * 3)

      if (error) throw error

      // Score and rank artworks
      const scoredArtworks = artworks.map(artwork => {
        let score = 0
        let reasons: string[] = []

        // Price fit scoring
        const priceFit = this.calculatePriceFit(artwork.price, profile.preferences.priceRange)
        score += priceFit * 20
        if (priceFit > 0.8) reasons.push('Fits your budget perfectly')

        // Medium preference scoring
        if (profile.preferences.mediums.includes(artwork.medium)) {
          score += 15
          reasons.push(`Matches your preferred medium: ${artwork.medium}`)
        }

        // Style preference scoring
        if (profile.preferences.styles.includes(artwork.genre)) {
          score += 15
          reasons.push(`Matches your preferred style: ${artwork.genre}`)
        }

        // Artist preference scoring
        if (profile.preferences.artists.includes(artwork.user_id)) {
          score += 25
          reasons.push('From an artist you follow')
        }

        // Recency scoring
        const daysSinceCreation = (Date.now() - new Date(artwork.created_at).getTime()) / (1000 * 60 * 60 * 24)
        if (daysSinceCreation < 30) {
          score += 5
          reasons.push('Recently created')
        }

        return {
          id: artwork.id,
          type: 'artwork' as const,
          title: artwork.title || 'Untitled',
          description: artwork.description || '',
          imageUrl: artwork.primary_image_url,
          score: Math.max(0, score),
          reason: reasons.join(', ') || 'Recommended for you',
          metadata: {
            price: artwork.price,
            medium: artwork.medium,
            genre: artwork.genre,
            artist: artwork.profiles,
            dominantColors: artwork.dominant_colors,
            createdAt: artwork.created_at
          }
        }
      })

      return scoredArtworks
        .filter(artwork => artwork.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)

    } catch (error) {
      console.error('Error generating artwork recommendations:', error)
      return []
    }
  }

  private async generateArtistRecommendations(
    collectorId: string,
    profile: CollectorProfile,
    limit: number
  ): Promise<Recommendation[]> {
    try {
      const { data: similarArtists, error } = await supabase
        .from('profiles')
        .select(`
          id, name, bio, avatar_url, created_at,
          artworks!artworks_user_id_fkey(id, title, primary_image_url, price, medium, genre)
        `)
        .eq('role', 'artist')
        .not('id', 'in', `(${profile.behavior.follows.join(',')})`)
        .limit(limit * 2)

      if (error) throw error

      const scoredArtists = similarArtists.map(artist => {
        let score = 0
        let reasons: string[] = []

        // Check if artist's work matches preferences
        const artworks = artist.artworks || []
        const matchingArtworks = artworks.filter(artwork => 
          profile.preferences.mediums.includes(artwork.medium) ||
          profile.preferences.styles.includes(artwork.genre)
        )

        if (matchingArtworks.length > 0) {
          score += 20
          reasons.push('Creates work in your preferred styles/mediums')
        }

        // Price range compatibility
        const avgPrice = artworks.reduce((sum, artwork) => sum + (artwork.price || 0), 0) / artworks.length
        if (avgPrice > 0) {
          const priceFit = this.calculatePriceFit(avgPrice, profile.preferences.priceRange)
          score += priceFit * 15
          if (priceFit > 0.8) reasons.push('Price range matches your budget')
        }

        return {
          id: artist.id,
          type: 'artist' as const,
          title: artist.name || 'Unknown Artist',
          description: artist.bio || '',
          imageUrl: artist.avatar_url,
          score: Math.max(0, score),
          reason: reasons.join(', ') || 'Similar to artists you follow',
          metadata: {
            bio: artist.bio,
            avatarUrl: artist.avatar_url,
            artworkCount: artworks.length,
            createdAt: artist.created_at
          }
        }
      })

      return scoredArtists
        .filter(artist => artist.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)

    } catch (error) {
      console.error('Error generating artist recommendations:', error)
      return []
    }
  }

  private async generateCatalogueRecommendations(
    collectorId: string,
    profile: CollectorProfile,
    limit: number
  ): Promise<Recommendation[]> {
    try {
      const { data: catalogues, error } = await supabase
        .from('catalogues')
        .select(`
          id, title, description, cover_image_url, is_public, created_at, user_id,
          profiles!catalogues_user_id_fkey(id, name, avatar_url)
        `)
        .eq('is_public', true)
        .limit(limit * 2)

      if (error) throw error

      const scoredCatalogues = catalogues.map(catalogue => {
        let score = 0
        let reasons: string[] = []

        // Artist preference
        if (profile.preferences.artists.includes(catalogue.user_id)) {
          score += 25
          reasons.push('From an artist you follow')
        }

        // Recent activity
        const daysSinceCreation = (Date.now() - new Date(catalogue.created_at).getTime()) / (1000 * 60 * 60 * 24)
        if (daysSinceCreation < 30) {
          score += 5
          reasons.push('Recently created')
        }

        return {
          id: catalogue.id,
          type: 'catalogue' as const,
          title: catalogue.title || 'Untitled Catalogue',
          description: catalogue.description || '',
          imageUrl: catalogue.cover_image_url,
          score: Math.max(0, score),
          reason: reasons.join(', ') || 'Curated collection you might enjoy',
          metadata: {
            description: catalogue.description,
            coverImageUrl: catalogue.cover_image_url,
            isPublic: catalogue.is_public,
            artist: catalogue.profiles,
            createdAt: catalogue.created_at
          }
        }
      })

      return scoredCatalogues
        .filter(catalogue => catalogue.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)

    } catch (error) {
      console.error('Error generating catalogue recommendations:', error)
      return []
    }
  }

  private calculatePriceFit(price: number, range: { min: number; max: number }): number {
    if (price < range.min) return 0
    if (price > range.max) return 0
    if (range.min === range.max) return 1
    
    const rangeSize = range.max - range.min
    const distanceFromMin = price - range.min
    return 1 - (distanceFromMin / rangeSize) * 0.5
  }

  clearCache(): void {
    this.cache.clear()
  }
}

export const recommendationEngine = new RecommendationEngine()