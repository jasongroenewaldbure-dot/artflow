import { supabase } from '@/lib/supabase'

export interface CollectorProfile {
  id: string
  user_id: string
  experience_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  collecting_focus: 'investment' | 'aesthetic' | 'personal' | 'mixed'
  budget_profile: {
    min_budget: number
    max_budget: number
    typical_purchase_range: [number, number]
    budget_confidence: number
    price_sensitivity: 'low' | 'medium' | 'high'
  }
  aesthetic_preferences: {
    color_palette: string[]
    mood_preferences: string[]
    style_affinities: string[]
    medium_preferences: string[]
    size_preferences: {
      min_dimensions: { width: number; height: number }
      max_dimensions: { width: number; height: number }
      preferred_ratios: string[]
    }
  }
  behavioral_patterns: {
    browsing_frequency: 'daily' | 'weekly' | 'monthly' | 'occasional'
    purchase_frequency: 'frequent' | 'regular' | 'occasional' | 'rare'
    decision_speed: 'impulsive' | 'quick' | 'considered' | 'deliberate'
    research_depth: 'surface' | 'moderate' | 'deep' | 'exhaustive'
    social_influence: 'independent' | 'peer_influenced' | 'expert_guided' | 'trend_following'
  }
  learning_insights: {
    taste_evolution: TasteEvolution[]
    preference_stability: number
    discovery_patterns: string[]
    rejection_patterns: string[]
    seasonal_preferences: SeasonalPreferences
    market_awareness: number
  }
  social_signals: {
    following_artists: string[]
    following_collectors: string[]
    social_activity: SocialActivity[]
    community_engagement: number
    influence_score: number
  }
  market_behavior: {
    auction_participation: boolean
    gallery_visits: number
    art_fair_attendance: number
    online_activity: OnlineActivity[]
    price_tracking: PriceTracking[]
  }
  created_at: string
  updated_at: string
}

export interface TasteEvolution {
  timestamp: string
  preference_type: 'medium' | 'style' | 'color' | 'size' | 'price'
  old_preference: string
  new_preference: string
  confidence: number
  trigger_event: string
}

export interface SeasonalPreferences {
  spring: string[]
  summer: string[]
  autumn: string[]
  winter: string[]
}

export interface SocialActivity {
  type: 'like' | 'share' | 'comment' | 'save' | 'follow'
  target_type: 'artwork' | 'artist' | 'collector' | 'gallery'
  target_id: string
  timestamp: string
  metadata?: any
}

export interface OnlineActivity {
  platform: 'website' | 'social_media' | 'auction_house' | 'gallery_site'
  activity_type: 'view' | 'search' | 'purchase' | 'inquiry'
  timestamp: string
  duration: number
  metadata?: any
}

export interface PriceTracking {
  artwork_id: string
  initial_price: number
  current_price: number
  price_changes: PriceChange[]
  interest_level: 'low' | 'medium' | 'high'
  tracking_start: string
}

export interface PriceChange {
  timestamp: string
  old_price: number
  new_price: number
  change_percentage: number
  trigger: string
}

export interface PreferenceLearningEngine {
  analyzeInteraction(interaction: UserInteraction): Promise<void>
  updateTasteProfile(userId: string): Promise<void>
  generateRecommendations(userId: string, context?: RecommendationContext): Promise<ArtworkRecommendation[]>
  predictPurchaseIntent(artworkId: string, userId: string): Promise<number>
  identifyTasteShifts(userId: string): Promise<TasteShift[]>
  generateInsights(userId: string): Promise<CollectorInsights>
}

export interface UserInteraction {
  user_id: string
  interaction_type: 'view' | 'like' | 'share' | 'save' | 'inquiry' | 'purchase' | 'reject'
  target_type: 'artwork' | 'artist' | 'gallery' | 'search'
  target_id: string
  timestamp: string
  duration?: number
  context?: {
    source: string
    referrer?: string
    device_type: string
    location?: string
  }
  metadata?: {
    artwork_attributes?: ArtworkAttributes
    search_query?: string
    filters_used?: any
    price_range?: [number, number]
  }
}

export interface ArtworkAttributes {
  medium: string
  style: string
  color_palette: string[]
  dimensions: { width: number; height: number; depth?: number }
  price: number
  year: number
  artist_id: string
  gallery_id?: string
  tags: string[]
  mood: string[]
  technique: string[]
}

export interface RecommendationContext {
  occasion?: 'casual_browsing' | 'serious_shopping' | 'gift_hunting' | 'investment'
  budget_range?: [number, number]
  time_constraint?: 'immediate' | 'short_term' | 'long_term'
  social_context?: 'solo' | 'with_friends' | 'with_expert'
  discovery_mode?: 'explore' | 'refine' | 'discover'
}

export interface ArtworkRecommendation {
  artwork_id: string
  confidence_score: number
  reasons: string[]
  price_justification: string
  style_match: number
  budget_fit: number
  novelty_factor: number
  social_proof: number
  urgency_factor: number
  personalized_message: string
}

export interface TasteShift {
  type: 'emerging' | 'declining' | 'stable'
  preference: string
  confidence: number
  evidence: string[]
  recommendations: string[]
}

export interface CollectorInsights {
  taste_summary: string
  growth_areas: string[]
  market_opportunities: string[]
  budget_optimization: string[]
  collection_gaps: string[]
  social_recommendations: string[]
  learning_suggestions: string[]
}

export class IntelligentPreferenceLearning {
  private readonly LEARNING_WEIGHTS = {
    purchase: 10,
    inquiry: 8,
    save: 6,
    like: 4,
    share: 3,
    view: 1,
    reject: -2
  }

  // Constants for preference learning
  private readonly _INTERACTION_DECAY = 0.95 // Decay factor for older interactions
  private readonly _MIN_CONFIDENCE = 0.3 // Minimum confidence threshold for recommendations
  private readonly TASTE_SHIFT_THRESHOLD = 0.7

  // Main method to analyze user interactions and update preferences
  async analyzeInteraction(interaction: UserInteraction): Promise<void> {
    try {
      // Store the interaction
      await this.storeInteraction(interaction)
      
      // Update real-time preferences
      await this.updateRealTimePreferences(interaction)
      
      // Check for taste shifts
      await this.checkForTasteShifts(interaction.user_id)
      
      // Update learning insights
      await this.updateLearningInsights(interaction.user_id)
      
    } catch (error) {
      console.error('Error analyzing interaction:', error)
      throw error
    }
  }

  // Get comprehensive collector profile
  async getCollectorProfile(userId: string): Promise<CollectorProfile | null> {
    try {
      const { data, error } = await supabase
        .from('collector_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create it
          return await this.createInitialProfile(userId)
        }
        throw error
      }

      return data as CollectorProfile
    } catch (error) {
      console.error('Error getting collector profile:', error)
      return null
    }
  }

  // Generate intelligent recommendations
  async generateRecommendations(
    userId: string, 
    context: RecommendationContext = {}
  ): Promise<ArtworkRecommendation[]> {
    try {
      const profile = await this.getCollectorProfile(userId)
      if (!profile) return []

      // Get recent interactions for context
      const recentInteractions = await this.getRecentInteractions(userId, 30)
      
      // Analyze current preferences
      const currentPreferences = await this.analyzeCurrentPreferences(profile, recentInteractions)
      
      // Find matching artworks
      const candidateArtworks = await this.findCandidateArtworks(currentPreferences, context)
      
      // Score and rank recommendations
      const recommendations = await this.scoreRecommendations(
        candidateArtworks, 
        profile, 
        currentPreferences, 
        context
      )

      return recommendations.sort((a, b) => b.confidence_score - a.confidence_score)
    } catch (error) {
      console.error('Error generating recommendations:', error)
      return []
    }
  }

  // Predict purchase intent for a specific artwork
  async predictPurchaseIntent(artworkId: string, userId: string): Promise<number> {
    try {
      const profile = await this.getCollectorProfile(userId)
      if (!profile) return 0

      const artwork = await this.getArtworkDetails(artworkId)
      if (!artwork) return 0

      const recentInteractions = await this.getRecentInteractions(userId, 7)
      const currentPreferences = await this.analyzeCurrentPreferences(profile, recentInteractions)

      // Calculate various factors
      const styleMatch = this.calculateStyleMatch(artwork, currentPreferences)
      const budgetFit = this.calculateBudgetFit(artwork, profile.budget_profile)
      const noveltyFactor = this.calculateNoveltyFactor(artwork, recentInteractions)
      const socialProof = await this.calculateSocialProof(artworkId)
      const urgencyFactor = this.calculateUrgencyFactor(artwork, profile)

      // Weighted combination
      const intent = (
        styleMatch * 0.3 +
        budgetFit * 0.25 +
        noveltyFactor * 0.2 +
        socialProof * 0.15 +
        urgencyFactor * 0.1
      )

      return Math.min(100, Math.max(0, intent * 100))
    } catch (error) {
      console.error('Error predicting purchase intent:', error)
      return 0
    }
  }

  // Identify taste shifts and evolution
  async identifyTasteShifts(userId: string): Promise<TasteShift[]> {
    try {
      const profile = await this.getCollectorProfile(userId)
      if (!profile) return []

      const tasteShifts: TasteShift[] = []
      
      // Analyze medium preferences
      const mediumShifts = await this.analyzePreferenceShifts(userId, 'medium')
      tasteShifts.push(...mediumShifts)
      
      // Analyze style preferences
      const styleShifts = await this.analyzePreferenceShifts(userId, 'style')
      tasteShifts.push(...styleShifts)
      
      // Analyze color preferences
      const colorShifts = await this.analyzePreferenceShifts(userId, 'color')
      tasteShifts.push(...colorShifts)
      
      // Analyze price preferences
      const priceShifts = await this.analyzePreferenceShifts(userId, 'price')
      tasteShifts.push(...priceShifts)

      return tasteShifts.filter(shift => shift.confidence > this.TASTE_SHIFT_THRESHOLD)
    } catch (error) {
      console.error('Error identifying taste shifts:', error)
      return []
    }
  }

  // Generate comprehensive collector insights
  async generateInsights(userId: string): Promise<CollectorInsights> {
    try {
      const profile = await this.getCollectorProfile(userId)
      if (!profile) {
        return {
          taste_summary: 'No profile data available',
          growth_areas: [],
          market_opportunities: [],
          budget_optimization: [],
          collection_gaps: [],
          social_recommendations: [],
          learning_suggestions: []
        }
      }

      const recentInteractions = await this.getRecentInteractions(userId, 90)
      const tasteShifts = await this.identifyTasteShifts(userId)
      
      return {
        taste_summary: this.generateTasteSummary(profile, tasteShifts),
        growth_areas: this.identifyGrowthAreas(profile, recentInteractions),
        market_opportunities: this.identifyMarketOpportunities(profile, recentInteractions),
        budget_optimization: this.suggestBudgetOptimization(profile, recentInteractions),
        collection_gaps: this.identifyCollectionGaps(profile, recentInteractions),
        social_recommendations: this.generateSocialRecommendations(profile),
        learning_suggestions: this.generateLearningSuggestions(profile, tasteShifts)
      }
    } catch (error) {
      console.error('Error generating insights:', error)
      throw error
    }
  }

  // Private helper methods
  private async storeInteraction(interaction: UserInteraction): Promise<void> {
    const { error } = await supabase
      .from('user_interactions')
      .insert({
        user_id: interaction.user_id,
        interaction_type: interaction.interaction_type,
        target_type: interaction.target_type,
        target_id: interaction.target_id,
        timestamp: interaction.timestamp,
        duration: interaction.duration,
        context: interaction.context,
        metadata: interaction.metadata
      })

    if (error) throw error
  }

  private async updateRealTimePreferences(interaction: UserInteraction): Promise<void> {
    const weight = this.LEARNING_WEIGHTS[interaction.interaction_type] || 1
    
    if (interaction.metadata?.artwork_attributes) {
      await this.updateArtworkPreferences(interaction.user_id, interaction.metadata.artwork_attributes, weight)
    }
    
    if (interaction.metadata?.search_query) {
      await this.updateSearchBehavior(interaction.user_id, interaction.metadata.search_query, weight)
    }
  }

  private async updateArtworkPreferences(
    userId: string, 
    attributes: ArtworkAttributes, 
    weight: number
  ): Promise<void> {
    // Update medium preferences
    await this.updatePreferenceArray(userId, 'preferred_mediums', attributes.medium, weight)
    
    // Update style preferences
    await this.updatePreferenceArray(userId, 'preferred_styles', attributes.style, weight)
    
    // Update color preferences
    await this.updatePreferenceArray(userId, 'preferred_colors', attributes.color_palette, weight)
    
    // Update price preferences
    await this.updatePricePreferences(userId, attributes.price, weight)
    
    // Update size preferences
    await this.updateSizePreferences(userId, attributes.dimensions, weight)
  }

  private async updatePreferenceArray(
    userId: string, 
    field: string, 
    values: string | string[], 
    weight: number
  ): Promise<void> {
    const currentProfile = await this.getCollectorProfile(userId)
    if (!currentProfile) return

    const currentValues = (currentProfile as any)[field] || []
    const newValues = Array.isArray(values) ? values : [values]
    
    // Calculate new weights
    const updatedValues = this.mergePreferenceArrays(currentValues, newValues, weight)
    
    // Update in database
    const { error } = await supabase
      .from('collector_profiles')
      .update({ [field]: updatedValues })
      .eq('user_id', userId)

    if (error) throw error
  }

  private mergePreferenceArrays(
    current: string[], 
    newValues: string[], 
    weight: number
  ): string[] {
    const preferenceMap = new Map<string, number>()
    
    // Add current preferences with decay
    current.forEach(pref => {
      preferenceMap.set(pref, (preferenceMap.get(pref) || 0) + 1)
    })
    
    // Add new preferences with weight
    newValues.forEach(pref => {
      preferenceMap.set(pref, (preferenceMap.get(pref) || 0) + weight)
    })
    
    // Sort by weight and return top preferences
    return Array.from(preferenceMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([pref]) => pref)
      .slice(0, 20) // Keep top 20 preferences
  }

  private async updatePricePreferences(userId: string, price: number, weight: number): Promise<void> {
    const profile = await this.getCollectorProfile(userId)
    if (!profile) return

    const budgetProfile = profile.budget_profile
    const newMinBudget = Math.min(budgetProfile.min_budget, price * 0.8)
    const newMaxBudget = Math.max(budgetProfile.max_budget, price * 1.2)
    
    // Update budget confidence based on consistency
    const priceInRange = price >= budgetProfile.min_budget && price <= budgetProfile.max_budget
    const newConfidence = priceInRange 
      ? Math.min(1, budgetProfile.budget_confidence + 0.1)
      : Math.max(0, budgetProfile.budget_confidence - 0.05)

    await supabase
      .from('collector_profiles')
      .update({
        budget_profile: {
          ...budgetProfile,
          min_budget: newMinBudget,
          max_budget: newMaxBudget,
          budget_confidence: newConfidence
        }
      })
      .eq('user_id', userId)
  }

  private async updateSizePreferences(
    userId: string, 
    dimensions: { width: number; height: number; depth?: number }, 
    _weight: number
  ): Promise<void> {
    const profile = await this.getCollectorProfile(userId)
    if (!profile) return

    const sizePrefs = profile.aesthetic_preferences.size_preferences
    const area = dimensions.width * dimensions.height
    
    // Update size preferences based on area
    const newMinArea = Math.min(sizePrefs.min_dimensions.width * sizePrefs.min_dimensions.height, area * 0.8)
    const newMaxArea = Math.max(sizePrefs.max_dimensions.width * sizePrefs.max_dimensions.height, area * 1.2)
    
    // Calculate new dimensions maintaining aspect ratio
    const aspectRatio = dimensions.width / dimensions.height
    const newMinWidth = Math.sqrt(newMinArea * aspectRatio)
    const newMinHeight = newMinWidth / aspectRatio
    const newMaxWidth = Math.sqrt(newMaxArea * aspectRatio)
    const newMaxHeight = newMaxWidth / aspectRatio

    await supabase
      .from('collector_profiles')
      .update({
        aesthetic_preferences: {
          ...profile.aesthetic_preferences,
          size_preferences: {
            ...sizePrefs,
            min_dimensions: { width: newMinWidth, height: newMinHeight },
            max_dimensions: { width: newMaxWidth, height: newMaxHeight }
          }
        }
      })
      .eq('user_id', userId)
  }

  private async checkForTasteShifts(userId: string): Promise<void> {
    const tasteShifts = await this.identifyTasteShifts(userId)
    
    if (tasteShifts.length > 0) {
      // Store taste evolution
      for (const shift of tasteShifts) {
        await supabase
          .from('taste_evolution')
          .insert({
            user_id: userId,
            preference_type: shift.type,
            old_preference: shift.preference,
            new_preference: shift.preference,
            confidence: shift.confidence,
            trigger_event: 'interaction_analysis',
            timestamp: new Date().toISOString()
          })
      }
    }
  }

  private async updateLearningInsights(userId: string): Promise<void> {
    const insights = await this.generateInsights(userId)
    
    await supabase
      .from('collector_insights')
      .upsert({
        user_id: userId,
        insights: insights,
        updated_at: new Date().toISOString()
      })
  }

  private async createInitialProfile(userId: string): Promise<CollectorProfile> {
    const initialProfile: CollectorProfile = {
      id: crypto.randomUUID(),
      user_id: userId,
      experience_level: 'beginner',
      collecting_focus: 'mixed',
      budget_profile: {
        min_budget: 0,
        max_budget: 100000,
        typical_purchase_range: [1000, 10000],
        budget_confidence: 0.5,
        price_sensitivity: 'medium'
      },
      aesthetic_preferences: {
        color_palette: [],
        mood_preferences: [],
        style_affinities: [],
        medium_preferences: [],
        size_preferences: {
          min_dimensions: { width: 10, height: 10 },
          max_dimensions: { width: 200, height: 200 },
          preferred_ratios: ['1:1', '4:3', '16:9']
        }
      },
      behavioral_patterns: {
        browsing_frequency: 'occasional',
        purchase_frequency: 'rare',
        decision_speed: 'considered',
        research_depth: 'moderate',
        social_influence: 'independent'
      },
      learning_insights: {
        taste_evolution: [],
        preference_stability: 0.5,
        discovery_patterns: [],
        rejection_patterns: [],
        seasonal_preferences: {
          spring: [],
          summer: [],
          autumn: [],
          winter: []
        },
        market_awareness: 0.3
      },
      social_signals: {
        following_artists: [],
        following_collectors: [],
        social_activity: [],
        community_engagement: 0,
        influence_score: 0
      },
      market_behavior: {
        auction_participation: false,
        gallery_visits: 0,
        art_fair_attendance: 0,
        online_activity: [],
        price_tracking: []
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('collector_profiles')
      .insert(initialProfile)

    if (error) throw error
    return initialProfile
  }

  private async getRecentInteractions(userId: string, days: number): Promise<UserInteraction[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('user_interactions')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: false })

    if (error) throw error
    return data as UserInteraction[]
  }

  private async analyzeCurrentPreferences(
    profile: CollectorProfile, 
    _interactions: UserInteraction[]
  ): Promise<any> {
    // This would analyze the current state of preferences based on recent interactions
    // and return a comprehensive preference object
    return {
      mediums: profile.aesthetic_preferences.medium_preferences,
      styles: profile.aesthetic_preferences.style_affinities,
      colors: profile.aesthetic_preferences.color_palette,
      price_range: [profile.budget_profile.min_budget, profile.budget_profile.max_budget],
      size_range: profile.aesthetic_preferences.size_preferences
    }
  }

  private async findCandidateArtworks(_preferences: any, _context: RecommendationContext): Promise<any[]> {
    // This would query the database for artworks matching the preferences
    // For now, return empty array
    return []
  }

  private async scoreRecommendations(
    _artworks: any[], 
    _profile: CollectorProfile, 
    _preferences: any, 
    _context: RecommendationContext
  ): Promise<ArtworkRecommendation[]> {
    // This would score each artwork based on various factors
    return []
  }

  private calculateStyleMatch(artwork: any, preferences: any): number {
    // Calculate how well the artwork matches the user's style preferences
    return Math.random() // Placeholder
  }

  private calculateBudgetFit(artwork: any, budgetProfile: any): number {
    // Calculate how well the artwork fits the user's budget
    return Math.random() // Placeholder
  }

  private calculateNoveltyFactor(artwork: any, interactions: UserInteraction[]): number {
    // Calculate how novel/interesting this artwork would be for the user
    return Math.random() // Placeholder
  }

  private async calculateSocialProof(artworkId: string): Promise<number> {
    // Calculate social proof based on likes, shares, etc.
    return Math.random() // Placeholder
  }

  private calculateUrgencyFactor(artwork: any, profile: CollectorProfile): number {
    // Calculate urgency factors like limited availability, price changes, etc.
    return Math.random() // Placeholder
  }

  private async analyzePreferenceShifts(userId: string, type: string): Promise<TasteShift[]> {
    // Analyze shifts in specific preference types
    return []
  }

  private generateTasteSummary(profile: CollectorProfile, tasteShifts: TasteShift[]): string {
    // Generate a human-readable summary of the collector's taste
    return `Your collecting style shows a preference for ${profile.aesthetic_preferences.medium_preferences.join(', ')} works with ${profile.aesthetic_preferences.color_palette.join(', ')} color palettes.`
  }

  private identifyGrowthAreas(profile: CollectorProfile, interactions: UserInteraction[]): string[] {
    // Identify areas where the collector could expand their taste
    return []
  }

  private identifyMarketOpportunities(profile: CollectorProfile, interactions: UserInteraction[]): string[] {
    // Identify market opportunities based on the collector's preferences
    return []
  }

  private suggestBudgetOptimization(profile: CollectorProfile, interactions: UserInteraction[]): string[] {
    // Suggest budget optimization strategies
    return []
  }

  private identifyCollectionGaps(profile: CollectorProfile, interactions: UserInteraction[]): string[] {
    // Identify gaps in the collector's collection
    return []
  }

  private generateSocialRecommendations(profile: CollectorProfile): string[] {
    // Generate social recommendations
    return []
  }

  private generateLearningSuggestions(profile: CollectorProfile, tasteShifts: TasteShift[]): string[] {
    // Generate learning and discovery suggestions
    return []
  }

  private async getArtworkDetails(artworkId: string): Promise<any> {
    // Get artwork details from database
    return null
  }

  private async updateSearchBehavior(userId: string, searchQuery: string, weight: number): Promise<void> {
    // Update user's search behavior patterns
    try {
      const { error } = await supabase
        .from('user_search_behaviors')
        .upsert({
          user_id: userId,
          search_query: searchQuery,
          weight: weight,
          updated_at: new Date().toISOString()
        })
      
      if (error) throw error
    } catch (error) {
      console.error('Error updating search behavior:', error)
    }
  }
}

export const intelligentPreferenceLearning = new IntelligentPreferenceLearning()

