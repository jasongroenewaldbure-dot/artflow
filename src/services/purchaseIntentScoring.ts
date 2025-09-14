import { supabase } from '@/lib/supabase'

export interface ContactPurchaseIntent {
  contact_id: string
  contact_name: string
  contact_email: string
  overall_score: number
  score_breakdown: {
    engagement_score: number
    financial_capacity_score: number
    art_preference_alignment: number
    communication_frequency: number
    past_purchase_behavior: number
    social_proof_score: number
    timing_score: number
    relationship_depth: number
  }
  risk_factors: string[]
  opportunity_factors: string[]
  recommended_actions: string[]
  next_follow_up: string
  priority_level: 'low' | 'medium' | 'high' | 'critical'
  last_updated: string
}

export interface ContactInteraction {
  id: string
  contact_id: string
  interaction_type: 'email' | 'phone' | 'meeting' | 'gallery_visit' | 'artwork_inquiry' | 'social_media' | 'referral' | 'view' | 'favorite' | 'follow' | 'share' | 'save' | 'list_add'
  interaction_date: string
  duration_minutes?: number
  duration_seconds?: number
  sentiment: 'positive' | 'neutral' | 'negative'
  topics_discussed: string[]
  artwork_interest: string[]
  budget_mentioned?: number
  timeline_mentioned?: string
  follow_up_required: boolean
  notes: string
  metadata?: {
    artwork_id?: string
    artist_id?: string
    social_platform?: string
    list_name?: string
    view_depth?: number
    scroll_behavior?: 'quick_scan' | 'thorough_read' | 'deep_engagement'
    device_type?: 'desktop' | 'mobile' | 'tablet'
    referrer?: string
    session_id?: string
  }
}

export interface ContactProfile {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  title?: string
  location?: string
  art_collector_type: 'emerging' | 'established' | 'institutional' | 'unknown'
  estimated_budget_range: 'under_1k' | '1k_5k' | '5k_25k' | '25k_100k' | '100k_plus' | 'unknown'
  preferred_mediums: string[]
  preferred_artists: string[]
  collection_size: 'small' | 'medium' | 'large' | 'unknown'
  social_media_presence: {
    instagram?: string
    twitter?: string
    linkedin?: string
    facebook?: string
  }
  referral_source: string
  first_contact_date: string
  last_contact_date: string
  total_interactions: number
  total_spent: number
  average_purchase_size: number
  purchase_frequency: 'one_time' | 'occasional' | 'regular' | 'unknown'
}

export class PurchaseIntentScoringService {
  private readonly SCORING_WEIGHTS = {
    engagement_score: 0.20,
    financial_capacity_score: 0.18,
    art_preference_alignment: 0.15,
    communication_frequency: 0.12,
    past_purchase_behavior: 0.15,
    social_proof_score: 0.08,
    timing_score: 0.07,
    relationship_depth: 0.05
  }

  private readonly SCORE_THRESHOLDS = {
    critical: 85,
    high: 70,
    medium: 50,
    low: 0
  }

  // Main method to calculate purchase intent score for a contact
  async calculatePurchaseIntentScore(contactId: string, artistId: string): Promise<ContactPurchaseIntent> {
    try {
      // Get contact profile and all interactions
      const contactProfile = await this.getContactProfile(contactId)
      const interactions = await this.getContactInteractions(contactId, artistId)
      const artistData = await this.getArtistData(artistId)

      // Get detailed behavioral data
      const behavioralData = await this.getBehavioralData(contactId, artistId)
      const artworkInteractions = await this.getArtworkInteractions(contactId, artistId)
      const socialEngagement = await this.getSocialEngagement(contactId, artistId)

      // Calculate individual score components with enhanced intelligence
      const engagementScore = this.calculateAdvancedEngagementScore(interactions, behavioralData, artworkInteractions)
      const financialCapacityScore = this.calculateFinancialCapacityScore(contactProfile, interactions)
      const artPreferenceAlignment = this.calculateArtPreferenceAlignment(contactProfile, artistData, artworkInteractions)
      const communicationFrequency = this.calculateCommunicationFrequency(interactions)
      const pastPurchaseBehavior = this.calculatePastPurchaseBehavior(contactProfile, interactions)
      const socialProofScore = this.calculateAdvancedSocialProofScore(contactProfile, interactions, socialEngagement)
      const timingScore = this.calculateAdvancedTimingScore(interactions, contactProfile, behavioralData)
      const relationshipDepth = this.calculateAdvancedRelationshipDepth(interactions, contactProfile, socialEngagement)

      // Calculate weighted overall score with enhanced weighting
      const overallScore = this.calculateWeightedScore({
        engagement_score: engagementScore,
        financial_capacity_score: financialCapacityScore,
        art_preference_alignment: artPreferenceAlignment,
        communication_frequency: communicationFrequency,
        past_purchase_behavior: pastPurchaseBehavior,
        social_proof_score: socialProofScore,
        timing_score: timingScore,
        relationship_depth: relationshipDepth
      })

      // Identify risk and opportunity factors
      const riskFactors = this.identifyAdvancedRiskFactors(contactProfile, interactions, behavioralData, overallScore)
      const opportunityFactors = this.identifyAdvancedOpportunityFactors(contactProfile, interactions, behavioralData, socialEngagement, overallScore)

      // Generate recommendations
      const recommendedActions = this.generateAdvancedRecommendations(contactProfile, interactions, behavioralData, overallScore)
      const nextFollowUp = this.suggestAdvancedNextFollowUp(interactions, contactProfile, behavioralData, overallScore)

      // Determine priority level
      const priorityLevel = this.determinePriorityLevel(overallScore)

      return {
        contact_id: contactId,
        contact_name: contactProfile.name,
        contact_email: contactProfile.email,
        overall_score: Math.round(overallScore),
        score_breakdown: {
          engagement_score: Math.round(engagementScore),
          financial_capacity_score: Math.round(financialCapacityScore),
          art_preference_alignment: Math.round(artPreferenceAlignment),
          communication_frequency: Math.round(communicationFrequency),
          past_purchase_behavior: Math.round(pastPurchaseBehavior),
          social_proof_score: Math.round(socialProofScore),
          timing_score: Math.round(timingScore),
          relationship_depth: Math.round(relationshipDepth)
        },
        risk_factors: riskFactors,
        opportunity_factors: opportunityFactors,
        recommended_actions: recommendedActions,
        next_follow_up: nextFollowUp,
        priority_level: priorityLevel,
        last_updated: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error calculating purchase intent score:', error)
      throw error
    }
  }

  // Calculate engagement score based on interaction quality and frequency
  private calculateEngagementScore(interactions: ContactInteraction[], contactProfile: ContactProfile): number {
    if (interactions.length === 0) return 0

    let score = 0
    const recentInteractions = interactions.filter(i => 
      new Date(i.interaction_date) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    )

    // Base score from interaction frequency
    score += Math.min(interactions.length * 2, 30)

    // Recent activity bonus
    score += Math.min(recentInteractions.length * 3, 20)

    // Quality of interactions
    const positiveInteractions = interactions.filter(i => i.sentiment === 'positive').length
    const qualityScore = (positiveInteractions / interactions.length) * 25
    score += qualityScore

    // Duration bonus for longer interactions
    const avgDuration = interactions
      .filter(i => i.duration_minutes)
      .reduce((sum, i) => sum + (i.duration_minutes || 0), 0) / interactions.length
    score += Math.min(avgDuration / 10, 15)

    // Artwork interest bonus
    const artworkInteractions = interactions.filter(i => i.artwork_interest.length > 0).length
    score += Math.min(artworkInteractions * 2, 10)

    return Math.min(score, 100)
  }

  // Calculate financial capacity based on profile and past behavior
  private calculateFinancialCapacityScore(contactProfile: ContactProfile, interactions: ContactInteraction[]): number {
    let score = 0

    // Budget range scoring
    const budgetScores = {
      'under_1k': 10,
      '1k_5k': 25,
      '5k_25k': 50,
      '25k_100k': 75,
      '100k_plus': 95,
      'unknown': 30
    }
    score += budgetScores[contactProfile.estimated_budget_range] || 30

    // Past purchase behavior
    if (contactProfile.total_spent > 0) {
      const avgPurchase = contactProfile.average_purchase_size
      if (avgPurchase > 10000) score += 20
      else if (avgPurchase > 5000) score += 15
      else if (avgPurchase > 1000) score += 10
      else score += 5
    }

    // Collection size indicator
    const collectionScores = {
      'small': 20,
      'medium': 40,
      'large': 60,
      'unknown': 25
    }
    score += collectionScores[contactProfile.collection_size] || 25

    // Budget mentions in interactions
    const budgetMentions = interactions.filter(i => i.budget_mentioned && i.budget_mentioned > 0).length
    score += Math.min(budgetMentions * 5, 15)

    // Collector type
    const collectorTypeScores = {
      'institutional': 90,
      'established': 70,
      'emerging': 40,
      'unknown': 30
    }
    score += collectorTypeScores[contactProfile.art_collector_type] || 30

    return Math.min(score, 100)
  }

  // Calculate alignment with artist's work and style
  private calculateArtPreferenceAlignment(contactProfile: ContactProfile, artistData: any): number {
    let score = 50 // Base score

    // Check if contact has shown interest in similar artists
    if (artistData.similar_artists) {
      const commonArtists = contactProfile.preferred_artists.filter(artist => 
        artistData.similar_artists.includes(artist)
      )
      score += commonArtists.length * 10
    }

    // Check medium preferences
    if (artistData.primary_mediums) {
      const commonMediums = contactProfile.preferred_mediums.filter(medium =>
        artistData.primary_mediums.includes(medium)
      )
      score += commonMediums.length * 8
    }

    // Check if contact has inquired about similar artworks
    // This would require more detailed artwork data analysis

    return Math.min(score, 100)
  }

  // Calculate communication frequency score
  private calculateCommunicationFrequency(interactions: ContactInteraction[]): number {
    if (interactions.length === 0) return 0

    const now = new Date()
    const daysSinceFirstContact = Math.floor(
      (now.getTime() - new Date(interactions[0].interaction_date).getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysSinceFirstContact === 0) return 50

    const interactionsPerMonth = (interactions.length / daysSinceFirstContact) * 30
    let score = Math.min(interactionsPerMonth * 10, 60)

    // Recent activity bonus
    const recentInteractions = interactions.filter(i => 
      new Date(i.interaction_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    )
    score += Math.min(recentInteractions.length * 5, 20)

    // Consistency bonus
    const monthlyInteractions = this.groupInteractionsByMonth(interactions)
    const consistentMonths = monthlyInteractions.filter(month => month.count > 0).length
    score += Math.min(consistentMonths * 2, 20)

    return Math.min(score, 100)
  }

  // Calculate past purchase behavior score
  private calculatePastPurchaseBehavior(contactProfile: ContactProfile, interactions: ContactInteraction[]): number {
    let score = 0

    // Purchase frequency
    const frequencyScores = {
      'regular': 80,
      'occasional': 50,
      'one_time': 30,
      'unknown': 20
    }
    score += frequencyScores[contactProfile.purchase_frequency] || 20

    // Total spent
    if (contactProfile.total_spent > 0) {
      if (contactProfile.total_spent > 50000) score += 20
      else if (contactProfile.total_spent > 10000) score += 15
      else if (contactProfile.total_spent > 1000) score += 10
      else score += 5
    }

    // Purchase timeline mentions
    const timelineMentions = interactions.filter(i => i.timeline_mentioned).length
    score += Math.min(timelineMentions * 5, 15)

    // Follow-up completion rate
    const followUpRequired = interactions.filter(i => i.follow_up_required).length
    const followUpCompleted = interactions.filter(i => 
      i.follow_up_required && i.interaction_type === 'meeting'
    ).length
    if (followUpRequired > 0) {
      score += (followUpCompleted / followUpRequired) * 15
    }

    return Math.min(score, 100)
  }

  // Calculate social proof score based on referrals and social presence
  private calculateSocialProofScore(contactProfile: ContactProfile, interactions: ContactInteraction[]): number {
    let score = 0

    // Social media presence
    const socialPlatforms = Object.values(contactProfile.social_media_presence).filter(Boolean).length
    score += Math.min(socialPlatforms * 10, 30)

    // Referral source quality
    const referralScores = {
      'gallery': 25,
      'artist': 20,
      'collector': 15,
      'art_fair': 10,
      'online': 5,
      'unknown': 0
    }
    score += referralScores[contactProfile.referral_source] || 0

    // Referral activity
    const referralInteractions = interactions.filter(i => i.interaction_type === 'referral').length
    score += Math.min(referralInteractions * 8, 20)

    // Company/title prestige (simplified)
    if (contactProfile.company && contactProfile.title) {
      score += 15
    }

    // Collection size as social proof
    const collectionScores = {
      'large': 20,
      'medium': 10,
      'small': 5,
      'unknown': 0
    }
    score += collectionScores[contactProfile.collection_size] || 0

    return Math.min(score, 100)
  }

  // Calculate timing score based on recent activity and market conditions
  private calculateTimingScore(interactions: ContactInteraction[], contactProfile: ContactProfile): number {
    let score = 0

    // Recent activity
    const recentInteractions = interactions.filter(i => 
      new Date(i.interaction_date) > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    )
    score += Math.min(recentInteractions.length * 15, 40)

    // Seasonal timing (art market typically peaks in spring/fall)
    const currentMonth = new Date().getMonth()
    if (currentMonth >= 2 && currentMonth <= 5) score += 15 // Spring
    else if (currentMonth >= 8 && currentMonth <= 11) score += 15 // Fall
    else score += 5

    // Timeline mentions
    const timelineMentions = interactions.filter(i => i.timeline_mentioned).length
    score += Math.min(timelineMentions * 10, 20)

    // Budget discussions
    const budgetDiscussions = interactions.filter(i => i.budget_mentioned).length
    score += Math.min(budgetDiscussions * 8, 15)

    // Artwork interest spikes
    const artworkInterestSpikes = interactions.filter(i => 
      i.artwork_interest.length > 2
    ).length
    score += Math.min(artworkInterestSpikes * 5, 10)

    return Math.min(score, 100)
  }

  // Calculate relationship depth score
  private calculateRelationshipDepth(interactions: ContactInteraction[], contactProfile: ContactProfile): number {
    let score = 0

    // Relationship duration
    const daysSinceFirstContact = Math.floor(
      (new Date().getTime() - new Date(contactProfile.first_contact_date).getTime()) / (1000 * 60 * 60 * 24)
    )
    score += Math.min(daysSinceFirstContact / 30, 30) // Max 30 points for 30+ months

    // Meeting frequency
    const meetings = interactions.filter(i => i.interaction_type === 'meeting').length
    score += Math.min(meetings * 10, 30)

    // Personal topics discussed
    const personalTopics = interactions.filter(i => 
      i.topics_discussed.some(topic => 
        ['personal', 'family', 'travel', 'hobbies'].includes(topic.toLowerCase())
      )
    ).length
    score += Math.min(personalTopics * 5, 15)

    // Referral activity
    const referrals = interactions.filter(i => i.interaction_type === 'referral').length
    score += Math.min(referrals * 8, 15)

    // Social media connections
    const socialConnections = Object.values(contactProfile.social_media_presence).filter(Boolean).length
    score += Math.min(socialConnections * 3, 10)

    return Math.min(score, 100)
  }

  // Calculate weighted overall score
  private calculateWeightedScore(scores: Record<string, number>): number {
    let weightedSum = 0
    let totalWeight = 0

    Object.entries(scores).forEach(([key, score]) => {
      const weight = this.SCORING_WEIGHTS[key as keyof typeof this.SCORING_WEIGHTS] || 0
      weightedSum += score * weight
      totalWeight += weight
    })

    return totalWeight > 0 ? weightedSum / totalWeight : 0
  }

  // Identify risk factors that might prevent a purchase
  private identifyRiskFactors(contactProfile: ContactProfile, interactions: ContactInteraction[], overallScore: number): string[] {
    const risks: string[] = []

    if (overallScore < 30) risks.push('Very low engagement score')
    if (contactProfile.estimated_budget_range === 'unknown') risks.push('Unknown budget capacity')
    if (contactProfile.art_collector_type === 'unknown') risks.push('Unclear collector profile')
    if (contactProfile.total_spent === 0) risks.push('No purchase history')
    if (contactProfile.purchase_frequency === 'one_time') risks.push('One-time buyer pattern')
    
    const recentInteractions = interactions.filter(i => 
      new Date(i.interaction_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    )
    if (recentInteractions.length === 0) risks.push('No recent contact')
    
    const negativeInteractions = interactions.filter(i => i.sentiment === 'negative').length
    if (negativeInteractions > interactions.length * 0.3) risks.push('High negative interaction rate')
    
    const followUpOverdue = interactions.filter(i => 
      i.follow_up_required && 
      new Date(i.interaction_date) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length
    if (followUpOverdue > 0) risks.push('Overdue follow-ups')

    return risks
  }

  // Identify opportunity factors that increase purchase likelihood
  private identifyOpportunityFactors(contactProfile: ContactProfile, interactions: ContactInteraction[], overallScore: number): string[] {
    const opportunities: string[] = []

    if (overallScore > 80) opportunities.push('Very high purchase intent')
    if (contactProfile.estimated_budget_range === '100k_plus') opportunities.push('High budget capacity')
    if (contactProfile.art_collector_type === 'institutional') opportunities.push('Institutional collector')
    if (contactProfile.purchase_frequency === 'regular') opportunities.push('Regular buyer')
    if (contactProfile.total_spent > 50000) opportunities.push('High-value customer')
    
    const recentInteractions = interactions.filter(i => 
      new Date(i.interaction_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    )
    if (recentInteractions.length > 2) opportunities.push('Very active recently')
    
    const artworkInterests = interactions.filter(i => i.artwork_interest.length > 0).length
    if (artworkInterests > interactions.length * 0.5) opportunities.push('High artwork interest')
    
    const budgetDiscussions = interactions.filter(i => i.budget_mentioned).length
    if (budgetDiscussions > 0) opportunities.push('Budget discussions initiated')
    
    const timelineDiscussions = interactions.filter(i => i.timeline_mentioned).length
    if (timelineDiscussions > 0) opportunities.push('Timeline discussions initiated')

    return opportunities
  }

  // Generate actionable recommendations
  private generateRecommendations(contactProfile: ContactProfile, interactions: ContactInteraction[], overallScore: number): string[] {
    const recommendations: string[] = []

    if (overallScore < 30) {
      recommendations.push('Schedule initial discovery call to understand needs')
      recommendations.push('Send portfolio samples to gauge interest')
      recommendations.push('Research contact background and preferences')
    } else if (overallScore < 50) {
      recommendations.push('Increase communication frequency')
      recommendations.push('Share relevant artwork examples')
      recommendations.push('Invite to upcoming exhibition or event')
    } else if (overallScore < 70) {
      recommendations.push('Schedule studio visit or gallery meeting')
      recommendations.push('Present specific artwork recommendations')
      recommendations.push('Discuss budget and timeline')
    } else {
      recommendations.push('Prepare detailed proposal with pricing')
      recommendations.push('Schedule final presentation meeting')
      recommendations.push('Create urgency with limited-time offers')
    }

    // Specific recommendations based on profile
    if (contactProfile.estimated_budget_range === 'unknown') {
      recommendations.push('Gather budget information through conversation')
    }
    
    if (contactProfile.preferred_mediums.length === 0) {
      recommendations.push('Identify preferred art mediums and styles')
    }
    
    if (contactProfile.purchase_frequency === 'unknown') {
      recommendations.push('Research past collecting behavior')
    }

    // Timing-based recommendations
    const recentInteractions = interactions.filter(i => 
      new Date(i.interaction_date) > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    )
    if (recentInteractions.length === 0) {
      recommendations.push('Re-engage with personalized outreach')
    }

    return recommendations
  }

  // Suggest next follow-up action
  private suggestNextFollowUp(interactions: ContactInteraction[], contactProfile: ContactProfile, overallScore: number): string {
    const lastInteraction = interactions[interactions.length - 1]
    const daysSinceLastContact = lastInteraction ? 
      Math.floor((new Date().getTime() - new Date(lastInteraction.interaction_date).getTime()) / (1000 * 60 * 60 * 24)) : 999

    if (overallScore > 80) {
      return 'Schedule final presentation meeting within 3 days'
    } else if (overallScore > 60) {
      return 'Send detailed artwork proposal within 1 week'
    } else if (overallScore > 40) {
      return 'Schedule studio visit or gallery meeting within 2 weeks'
    } else if (daysSinceLastContact > 30) {
      return 'Send re-engagement email with new artwork samples'
    } else {
      return 'Continue nurturing relationship with regular updates'
    }
  }

  // Determine priority level based on overall score
  private determinePriorityLevel(overallScore: number): 'low' | 'medium' | 'high' | 'critical' {
    if (overallScore >= this.SCORE_THRESHOLDS.critical) return 'critical'
    if (overallScore >= this.SCORE_THRESHOLDS.high) return 'high'
    if (overallScore >= this.SCORE_THRESHOLDS.medium) return 'medium'
    return 'low'
  }

  // Helper methods for data retrieval
  private async getContactProfile(contactId: string): Promise<ContactProfile> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', contactId)
      .single()

    if (error) throw error
    return data as ContactProfile
  }

  private async getContactInteractions(contactId: string, artistId: string): Promise<ContactInteraction[]> {
    const { data, error } = await supabase
      .from('contact_interactions')
      .select('*')
      .eq('contact_id', contactId)
      .eq('artist_id', artistId)
      .order('interaction_date', { ascending: false })

    if (error) throw error
    return data as ContactInteraction[]
  }

  private async getArtistData(artistId: string): Promise<any> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', artistId)
      .single()

    if (error) throw error
    return data
  }

  private groupInteractionsByMonth(interactions: ContactInteraction[]): Array<{ month: string; count: number }> {
    const grouped: Record<string, number> = {}
    
    interactions.forEach(interaction => {
      const month = new Date(interaction.interaction_date).toISOString().substring(0, 7)
      grouped[month] = (grouped[month] || 0) + 1
    })

    return Object.entries(grouped).map(([month, count]) => ({ month, count }))
  }

  // Batch calculate scores for multiple contacts
  async calculateBatchScores(contactIds: string[], artistId: string): Promise<ContactPurchaseIntent[]> {
    const scores = await Promise.all(
      contactIds.map(contactId => this.calculatePurchaseIntentScore(contactId, artistId))
    )
    return scores.sort((a, b) => b.overall_score - a.overall_score)
  }

  // Get top priority contacts
  async getTopPriorityContacts(artistId: string, limit: number = 10): Promise<ContactPurchaseIntent[]> {
    const { data: contacts, error } = await supabase
      .from('contacts')
      .select('id')
      .eq('artist_id', artistId)

    if (error) throw error

    const contactIds = contacts.map(c => c.id)
    const scores = await this.calculateBatchScores(contactIds, artistId)
    
    return scores
      .filter(score => score.priority_level === 'critical' || score.priority_level === 'high')
      .slice(0, limit)
  }

  // Track interaction and update score
  async recordInteraction(interaction: Omit<ContactInteraction, 'id'>): Promise<void> {
    const { error } = await supabase
      .from('contact_interactions')
      .insert(interaction)

    if (error) throw error
  }

  // Get score history for a contact
  async getScoreHistory(contactId: string, artistId: string, days: number = 30): Promise<Array<{ date: string; score: number }>> {
    // This would require storing historical scores in a separate table
    // For now, return current score
    const currentScore = await this.calculatePurchaseIntentScore(contactId, artistId)
    return [{
      date: currentScore.last_updated,
      score: currentScore.overall_score
    }]
  }
}

export const purchaseIntentScoringService = new PurchaseIntentScoringService()
