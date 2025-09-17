import { supabase } from '../lib/supabase'

export interface BanditContext {
  userId: string
  timeOfDay: string
  dayOfWeek: string
  season: string
  recentViews: string[]
  recentSearches: string[]
  currentBudget?: number
  sessionDuration: number
  deviceType: 'mobile' | 'desktop' | 'tablet'
}

export interface BanditArm {
  artworkId: string
  features: number[] // Feature vector for LinUCB
  metadata: {
    medium: string
    genre: string
    price: number
    colors: string[]
    artist_id: string
    popularity_score: number
    recency_score: number
  }
}

export interface BanditReward {
  armId: string
  reward: number // 0-1 based on action (view=0.1, save=0.5, inquiry=0.8, purchase=1.0)
  context: BanditContext
  timestamp: string
}

export interface BanditRecommendation {
  artworkId: string
  confidence: number
  reason: 'exploit' | 'explore'
  expectedReward: number
  uncertainty: number
}

/**
 * LinUCB (Linear Upper Confidence Bound) Contextual Bandit
 * Balances exploitation of known preferences with exploration of new options
 */
export class ContextualBanditService {
  private alpha: number = 0.3 // Exploration parameter (higher = more exploration)
  private featureDimension: number = 20 // Number of features per arm
  
  constructor(alpha: number = 0.3) {
    this.alpha = alpha
  }

  /**
   * Get personalized recommendations using contextual bandit
   * Returns mix of exploitation (safe bets) and exploration (discovery)
   */
  async getRecommendations(
    context: BanditContext,
    candidateArtworks: BanditArm[],
    numRecommendations: number = 10,
    explorationRatio: number = 0.2 // 20% exploration, 80% exploitation
  ): Promise<BanditRecommendation[]> {
    try {
      // Get user's bandit model (A matrix and b vector from LinUCB)
      const userModel = await this.getUserModel(context.userId)
      
      // Calculate upper confidence bounds for each arm
      const armScores = candidateArtworks.map(arm => {
        const features = this.extractFeatures(arm, context)
        const { expectedReward, uncertainty } = this.calculateUCB(features, userModel)
        
        return {
          artworkId: arm.artworkId,
          expectedReward,
          uncertainty,
          ucbScore: expectedReward + this.alpha * uncertainty,
          features,
          metadata: arm.metadata
        }
      })

      // Sort by UCB score (higher = better)
      const sortedArms = armScores.sort((a, b) => b.ucbScore - a.ucbScore)
      
      // Split into exploitation and exploration
      const numExploit = Math.floor(numRecommendations * (1 - explorationRatio))
      const numExplore = numRecommendations - numExploit
      
      const recommendations: BanditRecommendation[] = []
      
      // Exploitation: Take top scoring arms
      for (let i = 0; i < numExploit && i < sortedArms.length; i++) {
        const arm = sortedArms[i]
        recommendations.push({
          artworkId: arm.artworkId,
          confidence: arm.expectedReward,
          reason: 'exploit',
          expectedReward: arm.expectedReward,
          uncertainty: arm.uncertainty
        })
      }
      
      // Exploration: Sample from high-uncertainty arms
      const explorationCandidates = sortedArms
        .slice(numExploit)
        .sort((a, b) => b.uncertainty - a.uncertainty) // Sort by uncertainty
      
      for (let i = 0; i < numExplore && i < explorationCandidates.length; i++) {
        const arm = explorationCandidates[i]
        recommendations.push({
          artworkId: arm.artworkId,
          confidence: arm.expectedReward,
          reason: 'explore',
          expectedReward: arm.expectedReward,
          uncertainty: arm.uncertainty
        })
      }
      
      // Shuffle to avoid position bias
      return this.shuffleArray(recommendations)
      
    } catch (error) {
      console.error('Error getting bandit recommendations:', error)
      return []
    }
  }

  /**
   * Record user action and update bandit model
   */
  async recordReward(
    userId: string,
    artworkId: string,
    action: 'view' | 'save' | 'inquiry' | 'purchase' | 'skip',
    context: BanditContext
  ): Promise<void> {
    try {
      // Convert action to reward signal
      const rewardMap = {
        'skip': 0,
        'view': 0.1,
        'save': 0.5,
        'inquiry': 0.8,
        'purchase': 1.0
      }
      
      const reward = rewardMap[action]
      
      // Get the arm features that were used for this recommendation
      const arm = await this.getArmFeatures(artworkId)
      if (!arm) return
      
      const features = this.extractFeatures(arm, context)
      
      // Update LinUCB model
      await this.updateUserModel(userId, features, reward)
      
      // Log the interaction for analysis
      await supabase.from('bandit_interactions').insert({
        user_id: userId,
        artwork_id: artworkId,
        action,
        reward,
        context: context,
        features: features,
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      console.error('Error recording bandit reward:', error)
    }
  }

  /**
   * Extract feature vector from artwork and context
   */
  private extractFeatures(arm: BanditArm, context: BanditContext): number[] {
    const features = new Array(this.featureDimension).fill(0)
    
    // Price features (normalized)
    features[0] = Math.log(arm.metadata.price + 1) / 10 // Log-normalized price
    features[1] = context.currentBudget ? arm.metadata.price / context.currentBudget : 0.5
    
    // Time features
    features[2] = parseInt(context.timeOfDay.split(':')[0]) / 24 // Hour of day
    features[3] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].indexOf(context.dayOfWeek.toLowerCase()) / 7
    
    // Medium features (one-hot encoding)
    const mediums = ['oil', 'acrylic', 'digital', 'photography', 'sculpture', 'print']
    const mediumIndex = mediums.indexOf(arm.metadata.medium.toLowerCase())
    if (mediumIndex >= 0 && mediumIndex < 6) {
      features[4 + mediumIndex] = 1
    }
    
    // Genre features (one-hot encoding)
    const genres = ['abstract', 'realism', 'contemporary', 'landscape', 'portrait']
    const genreIndex = genres.indexOf(arm.metadata.genre.toLowerCase())
    if (genreIndex >= 0 && genreIndex < 5) {
      features[10 + genreIndex] = 1
    }
    
    // Popularity and recency
    features[15] = arm.metadata.popularity_score
    features[16] = arm.metadata.recency_score
    
    // User context features
    features[17] = context.sessionDuration / 3600 // Session duration in hours
    features[18] = context.recentViews.length / 10 // Normalized recent activity
    features[19] = context.deviceType === 'mobile' ? 1 : 0 // Device type
    
    return features
  }

  /**
   * Calculate Upper Confidence Bound for LinUCB
   */
  private calculateUCB(features: number[], userModel: LinUCBModel): { expectedReward: number; uncertainty: number } {
    // θ^T * x (expected reward)
    const expectedReward = this.dotProduct(userModel.theta, features)
    
    // √(x^T * A^(-1) * x) (uncertainty)
    const xAInvX = this.quadraticForm(features, userModel.AInverse)
    const uncertainty = Math.sqrt(Math.max(0, xAInvX))
    
    return { expectedReward, uncertainty }
  }

  /**
   * Update LinUCB model with new observation
   */
  private async updateUserModel(userId: string, features: number[], reward: number): Promise<void> {
    try {
      const model = await this.getUserModel(userId)
      
      // Update A matrix: A = A + x * x^T
      const outerProduct = this.outerProduct(features, features)
      const newA = this.matrixAdd(model.A, outerProduct)
      
      // Update b vector: b = b + r * x
      const rewardFeatures = features.map(f => f * reward)
      const newB = this.vectorAdd(model.b, rewardFeatures)
      
      // Compute new theta: θ = A^(-1) * b
      const newAInverse = this.matrixInverse(newA)
      const newTheta = this.matrixVectorMultiply(newAInverse, newB)
      
      // Save updated model
      await supabase.from('user_bandit_models').upsert({
        user_id: userId,
        A: newA,
        b: newB,
        theta: newTheta,
        A_inverse: newAInverse,
        updated_at: new Date().toISOString()
      })
      
    } catch (error) {
      console.error('Error updating user model:', error)
    }
  }

  /**
   * Get or initialize user's LinUCB model
   */
  private async getUserModel(userId: string): Promise<LinUCBModel> {
    try {
      const { data } = await supabase
        .from('user_bandit_models')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (data) {
        return {
          A: data.A,
          b: data.b,
          theta: data.theta,
          AInverse: data.A_inverse
        }
      }
      
      // Initialize new model
      const identity = this.identityMatrix(this.featureDimension)
      const zeros = new Array(this.featureDimension).fill(0)
      
      const newModel = {
        A: identity,
        b: zeros,
        theta: zeros,
        AInverse: identity
      }
      
      await supabase.from('user_bandit_models').insert({
        user_id: userId,
        A: newModel.A,
        b: newModel.b,
        theta: newModel.theta,
        A_inverse: newModel.AInverse,
        created_at: new Date().toISOString()
      })
      
      return newModel
      
    } catch (error) {
      console.error('Error getting user model:', error)
      // Return default model
      const identity = this.identityMatrix(this.featureDimension)
      const zeros = new Array(this.featureDimension).fill(0)
      return {
        A: identity,
        b: zeros,
        theta: zeros,
        AInverse: identity
      }
    }
  }

  private async getArmFeatures(artworkId: string): Promise<BanditArm | null> {
    try {
      const { data: artwork } = await supabase
        .from('artworks')
        .select(`
          id, medium, genre, price, dominant_colors, user_id,
          view_count, like_count, created_at
        `)
        .eq('id', artworkId)
        .single()
      
      if (!artwork) return null
      
      // Calculate popularity and recency scores
      const totalEngagement = (artwork.view_count || 0) + (artwork.like_count || 0) * 5
      const popularityScore = Math.min(1, totalEngagement / 100) // Normalize to 0-1
      
      const daysSinceCreation = (Date.now() - new Date(artwork.created_at).getTime()) / (1000 * 60 * 60 * 24)
      const recencyScore = Math.max(0, 1 - daysSinceCreation / 365) // Decay over a year
      
      return {
        artworkId: artwork.id,
        features: [], // Will be filled by extractFeatures
        metadata: {
          medium: artwork.medium || '',
          genre: artwork.genre || '',
          price: artwork.price || 0,
          colors: artwork.dominant_colors || [],
          artist_id: artwork.user_id,
          popularity_score: popularityScore,
          recency_score: recencyScore
        }
      }
    } catch (error) {
      console.error('Error getting arm features:', error)
      return null
    }
  }

  // Matrix/Vector utility functions
  private dotProduct(a: number[], b: number[]): number {
    return a.reduce((sum, val, i) => sum + val * b[i], 0)
  }

  private outerProduct(a: number[], b: number[]): number[][] {
    return a.map(aVal => b.map(bVal => aVal * bVal))
  }

  private matrixAdd(a: number[][], b: number[][]): number[][] {
    return a.map((row, i) => row.map((val, j) => val + b[i][j]))
  }

  private vectorAdd(a: number[], b: number[]): number[] {
    return a.map((val, i) => val + b[i])
  }

  private quadraticForm(x: number[], AInverse: number[][]): number {
    const Ax = this.matrixVectorMultiply(AInverse, x)
    return this.dotProduct(x, Ax)
  }

  private matrixVectorMultiply(matrix: number[][], vector: number[]): number[] {
    return matrix.map(row => this.dotProduct(row, vector))
  }

  private identityMatrix(size: number): number[][] {
    return Array(size).fill(0).map((_, i) => 
      Array(size).fill(0).map((_, j) => i === j ? 1 : 0)
    )
  }

  private matrixInverse(matrix: number[][]): number[][] {
    // Simplified matrix inversion using Gauss-Jordan elimination
    // For production, use a robust linear algebra library
    const n = matrix.length
    const augmented = matrix.map((row, i) => [...row, ...this.identityMatrix(n)[i]])
    
    // Forward elimination
    for (let i = 0; i < n; i++) {
      // Find pivot
      let maxRow = i
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
          maxRow = k
        }
      }
      
      // Swap rows
      [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]]
      
      // Make diagonal element 1
      const pivot = augmented[i][i]
      if (Math.abs(pivot) < 1e-10) continue // Skip near-zero pivots
      
      for (let j = 0; j < 2 * n; j++) {
        augmented[i][j] /= pivot
      }
      
      // Eliminate column
      for (let k = 0; k < n; k++) {
        if (k !== i) {
          const factor = augmented[k][i]
          for (let j = 0; j < 2 * n; j++) {
            augmented[k][j] -= factor * augmented[i][j]
          }
        }
      }
    }
    
    // Extract inverse from augmented matrix
    return augmented.map(row => row.slice(n))
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  /**
   * Get current context for bandit decisions
   */
  getCurrentContext(userId: string, additionalContext: Partial<BanditContext> = {}): BanditContext {
    const now = new Date()
    
    return {
      userId,
      timeOfDay: now.toTimeString().slice(0, 5), // HH:MM
      dayOfWeek: now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase(),
      season: this.getSeason(now),
      recentViews: [], // Would be populated from recent activity
      recentSearches: [], // Would be populated from search history
      sessionDuration: 0, // Would be tracked from session start
      deviceType: 'desktop', // Would be detected from user agent
      ...additionalContext
    }
  }

  private getSeason(date: Date): string {
    const month = date.getMonth() + 1
    if (month >= 3 && month <= 5) return 'spring'
    if (month >= 6 && month <= 8) return 'summer'
    if (month >= 9 && month <= 11) return 'autumn'
    return 'winter'
  }

  /**
   * Analyze bandit performance and provide insights
   */
  async getBanditAnalytics(userId: string, timeframe: 'day' | 'week' | 'month' = 'week'): Promise<{
    explorationRate: number
    exploitationRate: number
    averageReward: number
    totalInteractions: number
    topPerformingFeatures: Array<{ feature: string; impact: number }>
    recommendationAccuracy: number
  }> {
    try {
      const timeAgo = new Date()
      timeAgo.setDate(timeAgo.getDate() - (timeframe === 'day' ? 1 : timeframe === 'week' ? 7 : 30))
      
      const { data: interactions } = await supabase
        .from('bandit_interactions')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', timeAgo.toISOString())
      
      if (!interactions || interactions.length === 0) {
        return {
          explorationRate: 0,
          exploitationRate: 0,
          averageReward: 0,
          totalInteractions: 0,
          topPerformingFeatures: [],
          recommendationAccuracy: 0
        }
      }
      
      const totalInteractions = interactions.length
      const totalReward = interactions.reduce((sum, i) => sum + i.reward, 0)
      const averageReward = totalReward / totalInteractions
      
      // Calculate exploration vs exploitation rates
      const explorationCount = interactions.filter(i => i.context?.reason === 'explore').length
      const exploitationCount = interactions.filter(i => i.context?.reason === 'exploit').length
      
      return {
        explorationRate: explorationCount / totalInteractions,
        exploitationRate: exploitationCount / totalInteractions,
        averageReward,
        totalInteractions,
        topPerformingFeatures: [], // Would analyze feature importance
        recommendationAccuracy: averageReward // Simplified accuracy metric
      }
      
    } catch (error) {
      console.error('Error getting bandit analytics:', error)
      return {
        explorationRate: 0,
        exploitationRate: 0,
        averageReward: 0,
        totalInteractions: 0,
        topPerformingFeatures: [],
        recommendationAccuracy: 0
      }
    }
  }
}

interface LinUCBModel {
  A: number[][] // Feature covariance matrix
  b: number[] // Reward-weighted feature sum
  theta: number[] // Parameter estimates
  AInverse: number[][] // Inverse of A matrix
}

export const contextualBandit = new ContextualBanditService()
