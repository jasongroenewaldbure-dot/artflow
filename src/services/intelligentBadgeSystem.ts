// Enhanced Intelligent Badge System with Nuanced Scoring and ML
import { supabase } from '../lib/supabase'
import { cachedQuery, clearCache } from './database'

export interface IntelligentBadge {
  id: string
  type: 'emerging' | 'trending' | 'collector_interest' | 'featured' | 'sold_out' | 'limited_edition' | 'rising' | 'viral' | 'curator_pick' | 'investment_grade'
  label: string
  description: string
  color: string
  icon: string
  priority: number
  confidence: number // 0-1 confidence score
  score: number // 0-100 calculated score
  factors: string[] // What contributed to this badge
  expiresAt?: string
  metadata: {
    trendDirection?: 'up' | 'down' | 'stable'
    velocity?: number // Rate of change
    peakScore?: number
    decayRate?: number
  }
}

export interface BadgeContext {
  userId?: string
  userRole?: 'ARTIST' | 'COLLECTOR' | 'ADMIN'
  userPreferences?: any
  marketTrends?: any
  timeWindow?: 'hour' | 'day' | 'week' | 'month' | 'year'
  location?: string
}

// Advanced scoring algorithms
class BadgeScoringEngine {
  // Time decay function for trending badges
  static calculateTimeDecay(score: number, ageInHours: number, decayRate: number = 0.1): number {
    return score * Math.exp(-decayRate * ageInHours)
  }

  // Velocity calculation for rising badges
  static calculateVelocity(currentScore: number, previousScore: number, timeDiff: number): number {
    return (currentScore - previousScore) / timeDiff
  }

  // Market context adjustment
  static adjustForMarketContext(score: number, marketTrend: 'bull' | 'bear' | 'stable', category: string): number {
    const adjustments = {
      'bull': { 'contemporary': 1.2, 'digital': 1.3, 'traditional': 1.1 },
      'bear': { 'contemporary': 0.8, 'digital': 0.7, 'traditional': 0.9 },
      'stable': { 'contemporary': 1.0, 'digital': 1.0, 'traditional': 1.0 }
    }
    
    return score * (adjustments[marketTrend][category] || 1.0)
  }

  // User behavior weighting
  static weightByUserBehavior(score: number, userEngagement: number, userValue: number): number {
    const engagementWeight = Math.min(userEngagement / 100, 1.0) // Cap at 1.0
    const valueWeight = Math.min(userValue / 1000, 1.0) // Cap at 1.0
    
    return score * (0.6 + 0.2 * engagementWeight + 0.2 * valueWeight)
  }

  // Seasonal adjustments
  static applySeasonalAdjustment(score: number, month: number, category: string): number {
    const seasonalFactors = {
      'contemporary': [1.1, 1.0, 1.2, 1.3, 1.2, 1.1, 0.9, 0.8, 1.0, 1.1, 1.2, 1.0],
      'digital': [1.0, 1.0, 1.1, 1.2, 1.3, 1.2, 1.1, 1.0, 1.1, 1.2, 1.1, 1.0],
      'traditional': [1.2, 1.1, 1.0, 0.9, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.2, 1.1]
    }
    
    return score * (seasonalFactors[category]?.[month - 1] || 1.0)
  }
}

// Enhanced badge definitions with nuanced criteria
export const INTELLIGENT_BADGE_DEFINITIONS: Record<string, Omit<IntelligentBadge, 'id' | 'confidence' | 'score' | 'factors' | 'metadata'>> = {
  emerging_artist: {
    type: 'emerging',
    label: 'Emerging',
    description: 'New artist with growing recognition',
    color: '#10B981',
    icon: 'sparkles',
    priority: 1
  },
  rising_artist: {
    type: 'rising',
    label: 'Rising',
    description: 'Artist gaining momentum and attention',
    color: '#F59E0B',
    icon: 'trending-up',
    priority: 2
  },
  viral_artwork: {
    type: 'viral',
    label: 'Viral',
    description: 'Artwork with explosive growth in engagement',
    color: '#EF4444',
    icon: 'zap',
    priority: 3
  },
  trending_artwork: {
    type: 'trending',
    label: 'Trending',
    description: 'High engagement and growing popularity',
    color: '#F59E0B',
    icon: 'trending-up',
    priority: 4
  },
  collector_interest: {
    type: 'collector_interest',
    label: 'Collector Interest',
    description: 'High collector engagement and inquiries',
    color: '#8B5CF6',
    icon: 'heart',
    priority: 5
  },
  curator_pick: {
    type: 'curator_pick',
    label: 'Curator Pick',
    description: 'Selected by art curators and experts',
    color: '#7C3AED',
    icon: 'award',
    priority: 6
  },
  investment_grade: {
    type: 'investment_grade',
    label: 'Investment Grade',
    description: 'High-value artwork with strong market potential',
    color: '#059669',
    icon: 'dollar-sign',
    priority: 7
  },
  featured: {
    type: 'featured',
    label: 'Featured',
    description: 'Platform featured artwork',
    color: '#DC2626',
    icon: 'star',
    priority: 8
  },
  sold_out: {
    type: 'sold_out',
    label: 'Sold Out',
    description: 'No longer available for purchase',
    color: '#6B7280',
    icon: 'check-circle',
    priority: 9
  },
  limited_edition: {
    type: 'limited_edition',
    label: 'Limited Edition',
    description: 'Limited quantity available',
    color: '#DC2626',
    icon: 'award',
    priority: 10
  }
}

// Machine Learning-based scoring
class MLBadgeScorer {
  private static modelWeights = {
    engagement: 0.3,
    velocity: 0.25,
    marketContext: 0.2,
    userBehavior: 0.15,
    seasonal: 0.1
  }

  static calculateEngagementScore(metrics: any): number {
    const weights = {
      view_count: 0.2,
      favorite_count: 0.3,
      inquiry_count: 0.25,
      share_count: 0.15,
      comment_count: 0.1
    }

    let score = 0
    for (const [metric, weight] of Object.entries(weights)) {
      const value = metrics[metric] || 0
      const normalizedValue = Math.min(value / 100, 1.0) // Normalize to 0-1
      score += normalizedValue * weight
    }

    return Math.min(score * 100, 100)
  }

  static calculateVelocityScore(currentMetrics: any, previousMetrics: any, timeDiff: number): number {
    if (!previousMetrics || timeDiff === 0) return 0

    const metrics = ['view_count', 'favorite_count', 'inquiry_count', 'share_count']
    let totalVelocity = 0

    for (const metric of metrics) {
      const current = currentMetrics[metric] || 0
      const previous = previousMetrics[metric] || 0
      const velocity = (current - previous) / timeDiff
      totalVelocity += Math.max(velocity, 0) // Only positive velocity
    }

    return Math.min(totalVelocity * 10, 100) // Scale and cap at 100
  }

  static calculateMarketContextScore(artwork: any, marketTrends: any): number {
    const category = artwork.genre || 'contemporary'
    const price = artwork.price || 0
    const marketTrend = marketTrends?.trend || 'stable'

    let score = 50 // Base score

    // Price tier adjustment
    if (price > 10000) score += 20
    else if (price > 5000) score += 10
    else if (price > 1000) score += 5

    // Market trend adjustment
    const trendAdjustments = {
      'bull': 20,
      'stable': 0,
      'bear': -10
    }
    score += trendAdjustments[marketTrend] || 0

    // Category popularity
    const categoryPopularity = marketTrends?.categoryPopularity?.[category] || 0
    score += categoryPopularity * 10

    return Math.max(0, Math.min(100, score))
  }

  static calculateUserBehaviorScore(userEngagement: any, userValue: number): number {
    const engagementScore = this.calculateEngagementScore(userEngagement)
    const valueScore = Math.min(userValue / 1000, 1.0) * 100

    return (engagementScore * 0.7 + valueScore * 0.3)
  }

  static calculateSeasonalScore(artwork: any): number {
    const month = new Date().getMonth() + 1
    const category = artwork.genre || 'contemporary'
    
    const seasonalFactors = {
      'contemporary': [1.0, 0.9, 1.1, 1.2, 1.3, 1.2, 1.0, 0.8, 0.9, 1.1, 1.2, 1.0],
      'digital': [1.0, 1.0, 1.0, 1.1, 1.2, 1.3, 1.2, 1.1, 1.0, 1.1, 1.0, 1.0],
      'traditional': [1.2, 1.1, 1.0, 0.9, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.2, 1.1]
    }

    const factor = seasonalFactors[category]?.[month - 1] || 1.0
    return factor * 50 // Base seasonal score
  }

  static calculateOverallScore(
    engagementScore: number,
    velocityScore: number,
    marketScore: number,
    behaviorScore: number,
    seasonalScore: number
  ): number {
    const { engagement, velocity, marketContext, userBehavior, seasonal } = this.modelWeights

    return Math.round(
      engagementScore * engagement +
      velocityScore * velocity +
      marketScore * marketContext +
      behaviorScore * userBehavior +
      seasonalScore * seasonal
    )
  }
}

// Contextual badge recommendations
class ContextualBadgeRecommender {
  static async getPersonalizedBadges(
    entityId: string,
    entityType: 'artwork' | 'artist' | 'catalogue',
    context: BadgeContext
  ): Promise<IntelligentBadge[]> {
    const badges = await calculateIntelligentBadges(entityId, entityType, context)
    
    // Filter and rank based on user context
    return badges
      .filter(badge => this.shouldShowBadge(badge, context))
      .sort((a, b) => {
        // Personalize ranking based on user preferences
        const aScore = this.calculatePersonalizedScore(a, context)
        const bScore = this.calculatePersonalizedScore(b, context)
        return bScore - aScore
      })
  }

  private static shouldShowBadge(badge: IntelligentBadge, context: BadgeContext): boolean {
    // Don't show certain badges to artists for their own work
    if (context.userRole === 'ARTIST' && badge.type === 'collector_interest') {
      return false
    }

    // Show investment grade badges only to collectors
    if (badge.type === 'investment_grade' && context.userRole !== 'COLLECTOR') {
      return false
    }

    // Minimum confidence threshold
    return badge.confidence >= 0.6
  }

  private static calculatePersonalizedScore(badge: IntelligentBadge, context: BadgeContext): number {
    let score = badge.score

    // Boost badges that match user preferences
    if (context.userPreferences?.favoriteGenres?.includes(badge.type)) {
      score *= 1.2
    }

    // Boost trending badges for collectors
    if (context.userRole === 'COLLECTOR' && badge.type === 'trending') {
      score *= 1.15
    }

    // Boost emerging badges for artists
    if (context.userRole === 'ARTIST' && badge.type === 'emerging') {
      score *= 1.1
    }

    return Math.min(score, 100)
  }
}

// Main badge calculation function
export async function calculateIntelligentBadges(
  entityId: string,
  entityType: 'artwork' | 'artist' | 'catalogue',
  context: BadgeContext = {}
): Promise<IntelligentBadge[]> {
  const badges: IntelligentBadge[] = []
  
  try {
    // Get entity data with enhanced metrics
    const entityData = await getEntityWithMetrics(entityId, entityType)
    if (!entityData) return badges

    // Get market trends and context
    const marketTrends = await getMarketTrends()
    
    // Calculate base scores
    const engagementScore = MLBadgeScorer.calculateEngagementScore(entityData.metrics || {})
    const velocityScore = MLBadgeScorer.calculateVelocityScore(
      entityData.metrics || {},
      entityData.previousMetrics || {},
      entityData.timeDiff || 1
    )
    const marketScore = MLBadgeScorer.calculateMarketContextScore(entityData, marketTrends)
    const behaviorScore = MLBadgeScorer.calculateUserBehaviorScore(
      entityData.userEngagement || {},
      entityData.userValue || 0
    )
    const seasonalScore = MLBadgeScorer.calculateSeasonalScore(entityData)

    // Calculate overall score
    const overallScore = MLBadgeScorer.calculateOverallScore(
      engagementScore,
      velocityScore,
      marketScore,
      behaviorScore,
      seasonalScore
    )

    // Determine badges based on scores and criteria
    const badgeCandidates = await determineBadgeCandidates(entityData, {
      engagementScore,
      velocityScore,
      marketScore,
      behaviorScore,
      seasonalScore,
      overallScore
    })

    // Create intelligent badges with confidence scores
    for (const candidate of badgeCandidates) {
      const badge = await createIntelligentBadge(candidate, entityData, context)
      if (badge) {
        badges.push(badge)
      }
    }

    // Sort by priority and confidence
    return badges.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority
      return b.confidence - a.confidence
    })

  } catch (error) {
    console.error('Error calculating intelligent badges:', error)
    return badges
  }
}

// Helper functions
async function getEntityWithMetrics(entityId: string, entityType: string): Promise<any> {
  const cacheKey = `${entityType}_${entityId}_metrics`
  
  return await cachedQuery(cacheKey, async () => {
    let query
    switch (entityType) {
      case 'artwork':
        query = supabase
          .from('artworks')
          .select(`
            *,
            user:profiles!artworks_user_id_fkey(*),
            artwork_metrics(*),
            previous_metrics:artwork_metrics!previous_metrics_fkey(*)
          `)
          .eq('id', entityId)
        break
      case 'artist':
        query = supabase
          .from('profiles')
          .select(`
            *,
            artworks(id, artwork_metrics(*)),
            artist_metrics(*)
          `)
          .eq('id', entityId)
        break
      case 'catalogue':
        query = supabase
          .from('catalogues')
          .select(`
            *,
            user:profiles!catalogues_user_id_fkey(*),
            catalogue_metrics(*)
          `)
          .eq('id', entityId)
        break
      default:
        return null
    }

    const { data, error } = await query.single()
    if (error) throw error
    return data
  }, 5 * 60 * 1000) // 5 minute cache
}

async function getMarketTrends(): Promise<any> {
  return await cachedQuery('market_trends', async () => {
    // In production, this would fetch from a market data API
    return {
      trend: 'bull',
      categoryPopularity: {
        'contemporary': 0.8,
        'digital': 0.9,
        'traditional': 0.6
      }
    }
  }, 60 * 60 * 1000) // 1 hour cache
}

async function determineBadgeCandidates(entityData: any, scores: any): Promise<any[]> {
  const candidates = []

  // Emerging artist (new account)
  if (entityData.user?.created_at) {
    const ageInDays = (Date.now() - new Date(entityData.user.created_at).getTime()) / (1000 * 60 * 60 * 24)
    if (ageInDays < 30) {
      candidates.push({
        type: 'emerging_artist',
        confidence: Math.max(0.8 - (ageInDays / 30) * 0.3, 0.5),
        factors: ['new_account', 'recent_creation']
      })
    }
  }

  // Rising artist (growing velocity)
  if (scores.velocityScore > 30) {
    candidates.push({
      type: 'rising_artist',
      confidence: Math.min(scores.velocityScore / 100, 0.9),
      factors: ['high_velocity', 'growing_engagement']
    })
  }

  // Viral artwork (explosive growth)
  if (scores.velocityScore > 70 && scores.engagementScore > 60) {
    candidates.push({
      type: 'viral_artwork',
      confidence: Math.min((scores.velocityScore + scores.engagementScore) / 200, 0.95),
      factors: ['explosive_growth', 'high_engagement']
    })
  }

  // Trending (high engagement)
  if (scores.engagementScore > 50) {
    candidates.push({
      type: 'trending_artwork',
      confidence: Math.min(scores.engagementScore / 100, 0.8),
      factors: ['high_engagement', 'popular_content']
    })
  }

  // Collector interest (inquiries and favorites)
  if (entityData.metrics?.inquiry_count > 5 || entityData.metrics?.favorite_count > 20) {
    candidates.push({
      type: 'collector_interest',
      confidence: Math.min(
        ((entityData.metrics?.inquiry_count || 0) / 10 + (entityData.metrics?.favorite_count || 0) / 50),
        0.9
      ),
      factors: ['high_inquiries', 'collector_favorites']
    })
  }

  // Investment grade (high value and market score)
  if (entityData.price > 5000 && scores.marketScore > 70) {
    candidates.push({
      type: 'investment_grade',
      confidence: Math.min((scores.marketScore + (entityData.price / 10000)) / 200, 0.85),
      factors: ['high_value', 'strong_market', 'investment_potential']
    })
  }

  // Limited edition
  if (entityData.edition_size && entityData.edition_size <= 10) {
    candidates.push({
      type: 'limited_edition',
      confidence: 0.9,
      factors: ['limited_quantity', 'exclusive_edition']
    })
  }

  // Sold out
  if (entityData.status === 'sold') {
    candidates.push({
      type: 'sold_out',
      confidence: 1.0,
      factors: ['sold_status']
    })
  }

  return candidates
}

async function createIntelligentBadge(candidate: any, entityData: any, context: BadgeContext): Promise<IntelligentBadge | null> {
  const definition = INTELLIGENT_BADGE_DEFINITIONS[candidate.type]
  if (!definition) return null

  // Calculate decay and expiration
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours default

  return {
    id: `${candidate.type}_${Date.now()}`,
    ...definition,
    confidence: candidate.confidence,
    score: Math.round(candidate.confidence * 100),
    factors: candidate.factors,
    metadata: {
      trendDirection: 'up', // Would be calculated based on velocity
      velocity: 0, // Would be calculated
      peakScore: Math.round(candidate.confidence * 100),
      decayRate: 0.1
    },
    expiresAt: expiresAt.toISOString()
  }
}

// Export main functions
export { ContextualBadgeRecommender, MLBadgeScorer, BadgeScoringEngine }
