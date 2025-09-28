import { supabase } from '../lib/supabase'
import { ColorIntelligenceService } from './colorIntelligence'
import { PurchaseIntentScoringService } from './purchaseIntentScoring'
import { getAllMediaKeywords, getAllColorKeywords, getAllSubjectKeywords } from '../lib/mediaTaxonomy'

export interface Recommendation {
  id: string
  type: 'artwork' | 'artist' | 'catalogue'
  title: string
  description: string
  imageUrl?: string
  score: number
  confidence: number
  reason: string
  reasoning: {
    primary: string
    secondary: string[]
    factors: RecommendationFactor[]
  }
  metadata: {
    price?: number
    medium?: string
    genre?: string
    artist?: any
    dominantColors?: string[]
    createdAt?: string
    marketTrends?: MarketTrends
    socialProof?: SocialProof
    rarity?: RarityScore
    investmentPotential?: InvestmentPotential
  }
}

export interface RecommendationFactor {
  type: 'preference_match' | 'behavioral_signal' | 'market_trend' | 'social_proof' | 'rarity' | 'investment' | 'novelty' | 'seasonal'
  weight: number
  score: number
  description: string
  confidence: number
}

export interface MarketTrends {
  priceVelocity: number
  demandTrend: 'rising' | 'stable' | 'declining'
  marketMomentum: number
  comparableSales: number
  marketPosition: 'undervalued' | 'fair' | 'overvalued'
}

export interface SocialProof {
  likes: number
  views: number
  shares: number
  saves: number
  follows: number
  engagementRate: number
  influencerEndorsements: number
}

export interface RarityScore {
  editionSize?: number
  uniqueness: number
  historicalSignificance: number
  culturalImpact: number
  technicalInnovation: number
}

export interface InvestmentPotential {
  appreciationRate: number
  riskLevel: 'low' | 'medium' | 'high'
  liquidityScore: number
  marketStability: number
  artistCareerStage: 'emerging' | 'established' | 'blue_chip'
}

export interface CollectorProfile {
  id: string
  preferences: {
    mediums: string[]
    styles: string[]
    colors: string[]
    subjects: string[]
    priceRange: { min: number; max: number }
    artists: string[]
    excludedArtists: string[]
    excludedMediums: string[]
    excludedStyles: string[]
    excludedColors: string[]
    sizePreferences: {
      minWidth: number
      maxWidth: number
      minHeight: number
      maxHeight: number
    }
    timePeriods: string[]
    culturalContexts: string[]
  }
  behavior: {
    likes: string[]
    views: string[]
    searches: string[]
    purchases: string[]
    follows: string[]
    saves: string[]
    shares: string[]
    timeSpent: { [artworkId: string]: number }
    interactionPatterns: {
      peakHours: number[]
      sessionDuration: number
      browsingDepth: number
      returnVisits: number
    }
  }
  goals: {
    budget: number
    targetMediums: string[]
    targetStyles: string[]
    timeline: string
    experience: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    collectionStrategy: 'diversification' | 'focus' | 'investment' | 'personal'
    riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  }
  marketContext: {
    location: string
    localArtScene: string[]
    culturalAffinities: string[]
    economicFactors: {
      disposableIncome: number
      marketAccess: number
      currency: string
    }
  }
}

class RecommendationEngine {
  private cache = new Map<string, Recommendation[]>()
  private cacheExpiry = 5 * 60 * 1000 // 5 minutes
  private colorIntelligence = new ColorIntelligenceService()
  private purchaseIntentScoring = new PurchaseIntentScoringService()
  private marketTrendsCache = new Map<string, MarketTrends>()
  private socialProofCache = new Map<string, SocialProof>()

  // Enhanced AI-powered personalized recommendations with advanced algorithms
  async getPersonalizedRecommendations(
    collectorId: string, 
    limit: number = 20,
    types: ('artwork' | 'artist' | 'catalogue')[] = ['artwork', 'artist', 'catalogue'],
    options: {
      diversityFactor?: number // 0-1, higher = more diverse recommendations
      noveltyBoost?: boolean // Boost emerging/unknown artists
      seasonalTrends?: boolean // Consider seasonal preferences
      socialSignals?: boolean // Include social proof signals
      marketAwareness?: boolean // Consider market trends and investment potential
      culturalContext?: boolean // Consider cultural and regional factors
      temporalContext?: boolean // Consider time-based patterns
      riskProfile?: 'conservative' | 'moderate' | 'aggressive'
      collectionStrategy?: 'diversification' | 'focus' | 'investment' | 'personal'
    } = {}
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

      // Generate recommendations for each requested type with advanced algorithms
      for (const type of types) {
        const typeRecommendations = await this.generateTypeRecommendations(
          collectorId, 
          type, 
          profile, 
          Math.ceil(limit / types.length),
          options
        )
        recommendations.push(...typeRecommendations)
      }

      // Apply advanced ranking and diversity algorithms
      const rankedRecommendations = await this.applyAdvancedRanking(
        recommendations, 
        profile, 
        options
      )

      // Sort by composite score and limit results
      const sortedRecommendations = rankedRecommendations
        .sort((a, b) => (b.score * b.confidence) - (a.score * a.confidence))
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
          subjects: preferences?.preferred_subjects || [],
          priceRange: {
            min: preferences?.min_budget || 0,
            max: preferences?.max_budget || 100000
          },
          artists: preferences?.favorite_artists || [],
          excludedArtists: preferences?.exclude_artists || [],
          excludedMediums: preferences?.exclude_mediums || [],
          excludedStyles: preferences?.exclude_styles || [],
          excludedColors: preferences?.excluded_colors || [],
          sizePreferences: {
            minWidth: preferences?.min_width || 0,
            maxWidth: preferences?.max_width || 1000,
            minHeight: preferences?.min_height || 0,
            maxHeight: preferences?.max_height || 1000
          },
          timePeriods: preferences?.preferred_time_periods || [],
          culturalContexts: preferences?.preferred_cultural_contexts || []
        },
        behavior: {
          likes: likes?.map(l => l.artwork_id) || [],
          views: views?.map(v => v.artwork_id) || [],
          searches: [],
          purchases: purchases?.map(p => p.artwork_id) || [],
          follows: follows?.map(f => f.following_id) || [],
          saves: [],
          shares: [],
          timeSpent: {},
          interactionPatterns: {
            peakHours: [],
            sessionDuration: 0,
            browsingDepth: 0,
            returnVisits: 0
          }
        },
        goals: {
          budget: preferences?.max_budget || 10000,
          targetMediums: preferences?.preferred_mediums || [],
          targetStyles: preferences?.preferred_styles || [],
          timeline: 'flexible',
          experience: 'intermediate' as 'beginner' | 'intermediate' | 'advanced' | 'expert',
          collectionStrategy: 'personal' as 'focus' | 'investment' | 'personal' | 'diversification',
          riskTolerance: 'moderate' as 'conservative' | 'moderate' | 'aggressive'
        },
        marketContext: {
          location: 'Unknown',
          localArtScene: [],
          culturalAffinities: [],
          economicFactors: {
            disposableIncome: 50000,
            marketAccess: 0.7,
            currency: 'USD'
          }
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
    limit: number,
    options: any
  ): Promise<Recommendation[]> {
    switch (type) {
      case 'artwork':
        return this.generateArtworkRecommendations(collectorId, profile, limit, options)
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
    limit: number,
    options: any
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

      // Advanced scoring with multiple factors
      const scoredArtworks = await Promise.all(artworks.map(async (artwork) => {
        const factors: RecommendationFactor[] = []
        let totalScore = 0
        let confidence = 0.5

        // 1. Preference Matching (40% weight)
        const preferenceScore = await this.calculatePreferenceMatch(artwork, profile)
        totalScore += preferenceScore * 0.4
        factors.push({
          type: 'preference_match',
          weight: 0.4,
          score: preferenceScore,
          description: 'Matches your artistic preferences',
          confidence: 0.8
        })

        // 2. Behavioral Signals (25% weight)
        const behavioralScore = await this.calculateBehavioralSignals(artwork, profile, collectorId)
        totalScore += behavioralScore * 0.25
        factors.push({
          type: 'behavioral_signal',
          weight: 0.25,
          score: behavioralScore,
          description: 'Based on your viewing and interaction patterns',
          confidence: 0.7
        })

        // 3. Market Trends (15% weight)
        if (options.marketAwareness) {
          const marketScore = await this.calculateMarketTrends(artwork)
          totalScore += marketScore * 0.15
          factors.push({
            type: 'market_trend',
            weight: 0.15,
            score: marketScore,
            description: 'Current market trends and momentum',
            confidence: 0.6
          })
        }

        // 4. Social Proof (10% weight)
        if (options.socialSignals) {
          const socialScore = await this.calculateSocialProof(artwork)
          totalScore += socialScore * 0.1
          factors.push({
            type: 'social_proof',
            weight: 0.1,
            score: socialScore,
            description: 'Community engagement and validation',
            confidence: 0.7
          })
        }

        // 5. Rarity and Investment Potential (10% weight)
        if (options.marketAwareness) {
          const rarityScore = await this.calculateRarityScore(artwork)
          totalScore += rarityScore * 0.1
          factors.push({
            type: 'rarity',
            weight: 0.1,
            score: rarityScore,
            description: 'Uniqueness and investment potential',
            confidence: 0.5
          })
        }

        // Calculate overall confidence
        confidence = factors.reduce((sum, factor) => sum + (factor.confidence * factor.weight), 0)

        // Get market trends and social proof data
        const marketTrends = options.marketAwareness ? await this.getMarketTrends(artwork.id) : undefined
        const socialProof = options.socialSignals ? await this.getSocialProof(artwork.id) : undefined
        const rarity = options.marketAwareness ? await this.getRarityScore(artwork) : undefined
        const investmentPotential = options.marketAwareness ? await this.getInvestmentPotential(artwork) : undefined

        return {
          id: artwork.id,
          type: 'artwork' as const,
          title: artwork.title || 'Untitled',
          description: artwork.description || '',
          imageUrl: artwork.primary_image_url,
          score: Math.max(0, Math.min(100, totalScore)),
          confidence: Math.max(0, Math.min(1, confidence)),
          reason: this.generatePrimaryReason(factors),
          reasoning: {
            primary: this.generatePrimaryReason(factors),
            secondary: this.generateSecondaryReasons(factors),
            factors
          },
          metadata: {
            price: artwork.price,
            medium: artwork.medium,
            genre: artwork.genre,
            artist: artwork.profiles,
            dominantColors: artwork.dominant_colors,
            createdAt: artwork.created_at,
            marketTrends,
            socialProof,
            rarity,
            investmentPotential
          }
        }
      }))

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
          confidence: Math.min(Math.max(0, score) / 100, 1),
          reasoning: {
            primary: `Artist ${artist.name || 'Unknown Artist'} matches your preferences`,
            secondary: [`${artworks.length} available artworks`, 'Similar style preferences'],
            factors: []
          },
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
          confidence: Math.min(Math.max(0, score) / 100, 1),
          reasoning: {
            primary: `Catalogue ${catalogue.title || 'Untitled Catalogue'} matches your preferences`,
            secondary: ['Curated collection', 'Style alignment'],
            factors: []
          },
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

  // Advanced scoring algorithms
  private async calculatePreferenceMatch(artwork: any, profile: CollectorProfile): Promise<number> {
    let score = 0
    const maxScore = 100

    // Price fit (25 points)
    const priceFit = this.calculatePriceFit(artwork.price, profile.preferences.priceRange)
    score += priceFit * 25

    // Medium preference (20 points)
    if (profile.preferences.mediums.includes(artwork.medium)) {
      score += 20
    } else if (profile.preferences.excludedMediums.includes(artwork.medium)) {
      score -= 30
    }

    // Style/genre preference (20 points)
    if (profile.preferences.styles.includes(artwork.genre)) {
      score += 20
    } else if (profile.preferences.excludedStyles.includes(artwork.genre)) {
      score -= 30
    }

    // Color preference (15 points)
    if (artwork.dominant_colors && profile.preferences.colors.length > 0) {
      const colorMatch = this.calculateColorMatch(artwork.dominant_colors, profile.preferences.colors)
      score += colorMatch * 15
    }

    // Size preference (10 points)
    if (artwork.width_cm && artwork.height_cm) {
      const sizeFit = this.calculateSizeFit(artwork.width_cm, artwork.height_cm, profile.preferences.sizePreferences)
      score += sizeFit * 10
    }

    // Artist preference (10 points)
    if (profile.preferences.artists.includes(artwork.user_id)) {
      score += 10
    } else if (profile.preferences.excludedArtists.includes(artwork.user_id)) {
      score -= 20
    }

    return Math.max(0, Math.min(maxScore, score))
  }

  private async calculateBehavioralSignals(artwork: any, profile: CollectorProfile, collectorId: string): Promise<number> {
    let score = 0
    const maxScore = 100

    // Similar artwork interactions
    const similarArtworks = await this.findSimilarArtworks(artwork, profile.behavior.likes)
    score += similarArtworks.length * 15

    // Time spent on similar artworks
    const avgTimeSpent = this.calculateAverageTimeSpent(artwork, profile.behavior.timeSpent)
    score += Math.min(avgTimeSpent / 60, 20) // Max 20 points for time spent

    // Purchase intent scoring
    try {
      const purchaseIntent = await this.purchaseIntentScoring.calculatePurchaseIntentScore(collectorId, artwork.user_id)
      score += purchaseIntent.overall_score * 0.3 // 30% of purchase intent score
    } catch (error) {
      console.warn('Could not calculate purchase intent:', error)
    }

    // Browsing pattern analysis
    const patternScore = this.analyzeBrowsingPatterns(artwork, profile.behavior.interactionPatterns)
    score += patternScore * 10

    return Math.max(0, Math.min(maxScore, score))
  }

  private async calculateMarketTrends(artwork: any): Promise<number> {
    let score = 0
    const maxScore = 100

    // Price velocity analysis
    const priceVelocity = await this.calculatePriceVelocity(artwork)
    score += priceVelocity * 30

    // Demand trend analysis
    const demandTrend = await this.calculateDemandTrend(artwork)
    score += demandTrend * 25

    // Market momentum
    const marketMomentum = await this.calculateMarketMomentum(artwork)
    score += marketMomentum * 25

    // Comparable sales analysis
    const comparableSales = await this.calculateComparableSales(artwork)
    score += comparableSales * 20

    return Math.max(0, Math.min(maxScore, score))
  }

  private async calculateSocialProof(artwork: any): Promise<number> {
    let score = 0
    const maxScore = 100

    // Engagement metrics
    const engagement = await this.getEngagementMetrics(artwork.id)
    score += Math.min(engagement.likes * 2, 30)
    score += Math.min(engagement.views * 0.1, 20)
    score += Math.min(engagement.saves * 5, 25)

    // Influencer endorsements
    const endorsements = await this.getInfluencerEndorsements(artwork.id)
    score += endorsements * 15

    // Community validation
    const communityScore = await this.getCommunityValidation(artwork.id)
    score += communityScore * 10

    return Math.max(0, Math.min(maxScore, score))
  }

  private async calculateRarityScore(artwork: any): Promise<number> {
    let score = 0
    const maxScore = 100

    // Edition size rarity
    if (artwork.edition_size) {
      const rarity = Math.max(0, 100 - (artwork.edition_size * 2))
      score += rarity * 0.3
    }

    // Uniqueness analysis
    const uniqueness = await this.calculateUniqueness(artwork)
    score += uniqueness * 0.4

    // Historical significance
    const historicalSignificance = await this.calculateHistoricalSignificance(artwork)
    score += historicalSignificance * 0.3

    return Math.max(0, Math.min(maxScore, score))
  }

  // Helper methods for advanced calculations
  private calculatePriceFit(price: number, range: { min: number; max: number }): number {
    if (price < range.min) return 0
    if (price > range.max) return 0
    if (range.min === range.max) return 1
    
    const rangeSize = range.max - range.min
    const distanceFromMin = price - range.min
    return 1 - (distanceFromMin / rangeSize) * 0.5
  }

  private calculateColorMatch(artworkColors: string[], preferredColors: string[]): number {
    if (!artworkColors || !preferredColors) return 0
    
    const matches = artworkColors.filter(color => 
      preferredColors.some(pref => 
        color.toLowerCase().includes(pref.toLowerCase()) ||
        pref.toLowerCase().includes(color.toLowerCase())
      )
    ).length
    
    return matches / Math.max(artworkColors.length, 1)
  }

  private calculateSizeFit(width: number, height: number, preferences: any): number {
    if (!preferences) return 0.5
    
    const fitsWidth = width >= preferences.minWidth && width <= preferences.maxWidth
    const fitsHeight = height >= preferences.minHeight && height <= preferences.maxHeight
    
    if (fitsWidth && fitsHeight) return 1
    if (fitsWidth || fitsHeight) return 0.5
    return 0
  }

  private async findSimilarArtworks(artwork: any, likedArtworks: string[]): Promise<any[]> {
    if (likedArtworks.length === 0) return []
    
    try {
      const { data: similar } = await supabase
        .from('artworks')
        .select('id, medium, genre, dominant_colors')
        .in('id', likedArtworks)
        .or(`medium.eq.${artwork.medium},genre.eq.${artwork.genre}`)
      
      return similar || []
    } catch (error) {
      console.warn('Error finding similar artworks:', error)
      return []
    }
  }

  private calculateAverageTimeSpent(artwork: any, timeSpent: { [key: string]: number }): number {
    const similarArtworks = Object.keys(timeSpent).filter(id => 
      timeSpent[id] > 0
    )
    
    if (similarArtworks.length === 0) return 0
    
    const totalTime = similarArtworks.reduce((sum, id) => sum + timeSpent[id], 0)
    return totalTime / similarArtworks.length
  }

  private analyzeBrowsingPatterns(artwork: any, patterns: any): number {
    let score = 0
    
    // Peak hours analysis
    const currentHour = new Date().getHours()
    if (patterns.peakHours.includes(currentHour)) {
      score += 20
    }
    
    // Session duration analysis
    if (patterns.sessionDuration > 300) { // 5+ minutes
      score += 15
    }
    
    // Browsing depth analysis
    if (patterns.browsingDepth > 10) {
      score += 10
    }
    
    return Math.min(score, 45)
  }

  // Placeholder methods for market analysis (would be implemented with real data)
  private async calculatePriceVelocity(artwork: any): Promise<number> {
    // Would analyze price changes over time
    return Math.random() * 100
  }

  private async calculateDemandTrend(artwork: any): Promise<number> {
    // Would analyze demand patterns
    return Math.random() * 100
  }

  private async calculateMarketMomentum(artwork: any): Promise<number> {
    // Would analyze market momentum
    return Math.random() * 100
  }

  private async calculateComparableSales(artwork: any): Promise<number> {
    // Would analyze comparable sales data
    return Math.random() * 100
  }

  private async getEngagementMetrics(artworkId: string): Promise<{ likes: number; views: number; saves: number }> {
    try {
      const { data: likes } = await supabase
        .from('artwork_likes')
        .select('id')
        .eq('artwork_id', artworkId)
      
      const { data: views } = await supabase
        .from('artwork_views')
        .select('id')
        .eq('artwork_id', artworkId)
      
      return {
        likes: likes?.length || 0,
        views: views?.length || 0,
        saves: 0 // Would implement saves table
      }
    } catch (error) {
      return { likes: 0, views: 0, saves: 0 }
    }
  }

  private async getInfluencerEndorsements(artworkId: string): Promise<number> {
    // Would check for influencer endorsements
    return Math.floor(Math.random() * 5)
  }

  private async getCommunityValidation(artworkId: string): Promise<number> {
    // Would analyze community validation metrics
    return Math.random() * 100
  }

  private async calculateUniqueness(artwork: any): Promise<number> {
    // Would analyze uniqueness factors
    return Math.random() * 100
  }

  private async calculateHistoricalSignificance(artwork: any): Promise<number> {
    // Would analyze historical significance
    return Math.random() * 100
  }

  // Data retrieval methods
  private async getMarketTrends(artworkId: string): Promise<MarketTrends | undefined> {
    return {
      priceVelocity: Math.random() * 100,
      demandTrend: 'rising',
      marketMomentum: Math.random() * 100,
      comparableSales: Math.floor(Math.random() * 50),
      marketPosition: 'fair'
    }
  }

  private async getSocialProof(artworkId: string): Promise<SocialProof | undefined> {
    const engagement = await this.getEngagementMetrics(artworkId)
    return {
      likes: engagement.likes,
      views: engagement.views,
      shares: Math.floor(Math.random() * 20),
      saves: engagement.saves,
      follows: Math.floor(Math.random() * 100),
      engagementRate: Math.random(),
      influencerEndorsements: await this.getInfluencerEndorsements(artworkId)
    }
  }

  private async getRarityScore(artwork: any): Promise<RarityScore | undefined> {
    return {
      editionSize: artwork.edition_size,
      uniqueness: await this.calculateUniqueness(artwork),
      historicalSignificance: await this.calculateHistoricalSignificance(artwork),
      culturalImpact: Math.random() * 100,
      technicalInnovation: Math.random() * 100
    }
  }

  private async getInvestmentPotential(artwork: any): Promise<InvestmentPotential | undefined> {
    return {
      appreciationRate: Math.random() * 20 - 10, // -10% to +10%
      riskLevel: 'medium',
      liquidityScore: Math.random() * 100,
      marketStability: Math.random() * 100,
      artistCareerStage: 'established'
    }
  }

  // Advanced ranking and diversity algorithms
  private async applyAdvancedRanking(
    recommendations: Recommendation[],
    profile: CollectorProfile,
    options: any
  ): Promise<Recommendation[]> {
    // Apply diversity algorithms
    if (options.diversityFactor && options.diversityFactor > 0) {
      recommendations = this.applyDiversityRanking(recommendations, options.diversityFactor)
    }

    // Apply novelty boost
    if (options.noveltyBoost) {
      recommendations = this.applyNoveltyBoost(recommendations)
    }

    // Apply seasonal trends
    if (options.seasonalTrends) {
      recommendations = this.applySeasonalTrends(recommendations)
    }

    return recommendations
  }

  private applyDiversityRanking(recommendations: Recommendation[], diversityFactor: number): Recommendation[] {
    // Implement diversity algorithm to ensure varied recommendations
    const diversified: Recommendation[] = []
    const usedMediums = new Set<string>()
    const usedArtists = new Set<string>()
    const usedStyles = new Set<string>()

    for (const rec of recommendations) {
      const medium = rec.metadata.medium || 'unknown'
      const artist = rec.metadata.artist?.id || 'unknown'
      const style = rec.metadata.genre || 'unknown'

      const diversityScore = this.calculateDiversityScore(medium, artist, style, usedMediums, usedArtists, usedStyles)
      const adjustedScore = rec.score * (1 - diversityFactor) + (rec.score * diversityScore * diversityFactor)

      diversified.push({
        ...rec,
        score: adjustedScore
      })

      if (medium) usedMediums.add(medium)
      if (artist) usedArtists.add(artist)
      if (style) usedStyles.add(style)
    }

    return diversified.sort((a, b) => b.score - a.score)
  }

  private calculateDiversityScore(
    medium: string,
    artist: string,
    style: string,
    usedMediums: Set<string>,
    usedArtists: Set<string>,
    usedStyles: Set<string>
  ): number {
    let score = 1

    if (medium && usedMediums.has(medium)) score -= 0.3
    if (artist && usedArtists.has(artist)) score -= 0.4
    if (style && usedStyles.has(style)) score -= 0.3

    return Math.max(0, score)
  }

  private applyNoveltyBoost(recommendations: Recommendation[]): Recommendation[] {
    return recommendations.map(rec => {
      // Boost emerging artists and new artworks
      const daysSinceCreation = rec.metadata.createdAt ? 
        (Date.now() - new Date(rec.metadata.createdAt).getTime()) / (1000 * 60 * 60 * 24) : 365

      const noveltyBoost = daysSinceCreation < 30 ? 1.2 : daysSinceCreation < 90 ? 1.1 : 1.0

      return {
        ...rec,
        score: rec.score * noveltyBoost
      }
    })
  }

  private applySeasonalTrends(recommendations: Recommendation[]): Recommendation[] {
    const currentMonth = new Date().getMonth()
    const seasonalMultipliers = {
      0: 1.1, // January - winter themes
      1: 1.0, // February
      2: 1.2, // March - spring themes
      3: 1.1, // April
      4: 1.0, // May
      5: 1.1, // June - summer themes
      6: 1.0, // July
      7: 1.0, // August
      8: 1.2, // September - fall themes
      9: 1.1, // October
      10: 1.0, // November
      11: 1.1  // December - holiday themes
    }

    return recommendations.map(rec => ({
      ...rec,
      score: rec.score * (seasonalMultipliers[currentMonth] || 1.0)
    }))
  }

  // Reason generation methods
  private generatePrimaryReason(factors: RecommendationFactor[]): string {
    const topFactor = factors.reduce((prev, current) => 
      (prev.score * prev.weight) > (current.score * current.weight) ? prev : current
    )

    switch (topFactor.type) {
      case 'preference_match':
        return 'Perfect match for your artistic preferences'
      case 'behavioral_signal':
        return 'Based on your viewing patterns and interests'
      case 'market_trend':
        return 'Strong market momentum and trending upward'
      case 'social_proof':
        return 'Highly engaged by the community'
      case 'rarity':
        return 'Rare and unique piece with investment potential'
      default:
        return 'Recommended for you'
    }
  }

  private generateSecondaryReasons(factors: RecommendationFactor[]): string[] {
    return factors
      .filter(factor => factor.score > 50)
      .map(factor => factor.description)
      .slice(0, 3)
  }

  clearCache(): void {
    this.cache.clear()
    this.marketTrendsCache.clear()
    this.socialProofCache.clear()
  }
}

export const recommendationEngine = new RecommendationEngine()