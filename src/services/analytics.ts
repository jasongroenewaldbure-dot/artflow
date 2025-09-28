import { supabase } from '../lib/supabase'

export interface AnalyticsEvent {
  id?: string
  user_id?: string
  event_type: string
  event_category: 'page_view' | 'artwork_interaction' | 'user_action' | 'conversion' | 'engagement' | 'referral' | 'utm' | 'performance'
  event_name: string
  properties: Record<string, any>
  session_id?: string
  user_agent?: string
  ip_address?: string
  referrer?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  page_url?: string
  page_title?: string
  timestamp?: string
  created_at?: string
}

export interface ArtistInsights {
  artist_id: string
  period: '7d' | '30d' | '90d' | '1y' | 'all'
  metrics: {
    total_views: number
    unique_viewers: number
    page_views: number
    artwork_views: number
    catalogue_views: number
    profile_views: number
    likes: number
    shares: number
    saves: number
    follows: number
    unfollows: number
    inquiries: number
    conversations: number
    total_sales: number
    revenue: number
    average_sale_price: number
    conversion_rate: number
    engagement_rate: number
    reach: number
    impressions: number
    click_through_rate: number
    bounce_rate: number
    session_duration: number
    pages_per_session: number
    follower_growth: number
    artwork_growth: number
    revenue_growth: number
    view_growth: number
  }
  generated_at: string
}

class AnalyticsService {
  private sessionId: string
  private userId?: string

  constructor() {
    this.sessionId = this.generateSessionId()
    this.loadUserFromStorage() // This will be called during SSR
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private loadUserFromStorage(): void {
    // FIX: Conditionally access localStorage only if window is defined (client-side)
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const user = localStorage.getItem('supabase.auth.token')
        if (user) {
          const parsed = JSON.parse(user)
          this.userId = parsed.user?.id
        }
      } catch (error) {
        console.warn('Failed to load user from storage:', error)
      }
    }
  }

  private extractUTMData() {
    // FIX: Conditionally access window.location only if window is defined
    if (typeof window === 'undefined') {
      return {
        source: null,
        medium: null,
        campaign: null,
        term: null,
        content: null
      };
    }
    const urlParams = new URLSearchParams(window.location.search)
    return {
      source: urlParams.get('utm_source') || undefined,
      medium: urlParams.get('utm_medium') || undefined,
      campaign: urlParams.get('utm_campaign') || undefined,
      term: urlParams.get('utm_term') || undefined,
      content: urlParams.get('utm_content') || undefined
    }
  }

  private extractReferralData() {
    // FIX: Conditionally access document.referrer only if document is defined
    if (typeof document === 'undefined') {
      return { referrer: 'direct', domain: 'direct', type: 'direct' };
    }
    const referrer = document.referrer
    if (!referrer) {
      return { referrer: 'direct', domain: 'direct', type: 'direct' }
    }

    try {
      const url = new URL(referrer)
      const domain = url.hostname

      let type = 'referral'
      if (domain.includes('google') || domain.includes('bing') || domain.includes('yahoo')) {
        type = 'search'
      } else if (domain.includes('facebook') || domain.includes('twitter') || domain.includes('instagram')) {
        type = 'social'
      } else if (domain.includes('mail') || domain.includes('email')) {
        type = 'email'
      }

      return { referrer, domain, type }
    } catch (error) {
      return { referrer, domain: 'unknown', type: 'other' }
    }
  }

  async trackEvent(event: Omit<AnalyticsEvent, 'id' | 'created_at' | 'timestamp'>): Promise<void> {
    try {
      const utmData = this.extractUTMData()
      const referralData = this.extractReferralData()

      const analyticsEvent: AnalyticsEvent = {
        ...event,
        user_id: this.userId,
        session_id: this.sessionId,
        // FIX: Conditionally access navigator.userAgent
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        referrer: referralData.referrer || undefined,
        utm_source: utmData.source || undefined,
        utm_medium: utmData.medium || undefined,
        utm_campaign: utmData.campaign || undefined,
        utm_term: utmData.term || undefined,
        utm_content: utmData.content || undefined,
        // FIX: Conditionally access window.location.href
        page_url: typeof window !== 'undefined' ? window.location.href : undefined,
        // FIX: Conditionally access document.title
        page_title: typeof document !== 'undefined' ? document.title : undefined,
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('analytics_events')
        .insert(analyticsEvent)

      if (error) {
        console.error('Analytics tracking error:', error)
      }
    } catch (error) {
      console.error('Failed to track analytics event:', error)
    }
  }

  async trackPageView(page: string, properties: Record<string, any> = {}): Promise<void> {
    await this.trackEvent({
      event_type: 'page_view',
      event_category: 'page_view',
      event_name: 'page_viewed',
      properties: { page, ...properties }
    })
  }

  async trackArtworkView(artworkId: string, artistId: string, properties: Record<string, any> = {}): Promise<void> {
    await this.trackEvent({
      event_type: 'artwork_view',
      event_category: 'artwork_interaction',
      event_name: 'artwork_viewed',
      properties: { artwork_id: artworkId, artist_id: artistId, ...properties }
    })
  }

  async trackArtworkLike(artworkId: string, artistId: string, liked: boolean): Promise<void> {
    await this.trackEvent({
      event_type: 'artwork_like',
      event_category: 'engagement',
      event_name: liked ? 'artwork_liked' : 'artwork_unliked',
      properties: { artwork_id: artworkId, artist_id: artistId, liked }
    })
  }

  async trackArtworkShare(artworkId: string, artistId: string, platform: string): Promise<void> {
    await this.trackEvent({
      event_type: 'artwork_share',
      event_category: 'engagement',
      event_name: 'artwork_shared',
      properties: { artwork_id: artworkId, artist_id: artistId, platform }
    })
  }

  async trackArtistFollow(artistId: string, followed: boolean): Promise<void> {
    await this.trackEvent({
      event_type: 'artist_follow',
      event_category: 'engagement',
      event_name: followed ? 'artist_followed' : 'artist_unfollowed',
      properties: { artist_id: artistId, followed }
    })
  }

  async trackSale(artworkId: string, artistId: string, collectorId: string, salePrice: number): Promise<void> {
    await this.trackEvent({
      event_type: 'sale',
      event_category: 'conversion',
      event_name: 'artwork_sold',
      properties: { artwork_id: artworkId, artist_id: artistId, collector_id: collectorId, sale_price: salePrice }
    })
  }

  async trackSearch(query: string, resultsCount: number, filters: Record<string, any> = {}): Promise<void> {
    await this.trackEvent({
      event_type: 'search',
      event_category: 'user_action',
      event_name: 'search_performed',
      properties: { query, results_count: resultsCount, filters }
    })
  }

  setUserId(userId: string): void {
    this.userId = userId
  }

  getSessionId(): string {
    return this.sessionId
  }
}

export const analytics = new AnalyticsService()