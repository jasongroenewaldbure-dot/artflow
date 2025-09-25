import { supabase } from '@/lib/supabase';

export interface ContactTimelineEvent {
  id: string;
  type: 'view' | 'like' | 'share' | 'inquiry' | 'purchase' | 'list_add' | 'follow' | 'unfollow';
  timestamp: string;
  artwork?: {
    id: string;
    title: string;
    image_url: string;
    artist_name: string;
  };
  metadata?: any;
}

export interface ContactInsights {
  contactId: string;
  intentScore: number;
  engagementLevel: 'low' | 'medium' | 'high' | 'very_high';
  preferredMediums: string[];
  preferredStyles: string[];
  budgetRange: { min: number; max: number };
  lastActivity: string;
  totalInteractions: number;
  purchaseHistory: number;
  averageSessionDuration: number;
  bounceRate: number;
  socialProofSignals: {
    follows: number;
    lists: number;
    shares: number;
    recommendations: number;
  };
}

export interface SmartSegment {
  id: string;
  name: string;
  description: string;
  criteria: any;
  contactCount: number;
  lastUpdated: string;
}

class Contact360Service {
  // Get comprehensive contact timeline
  async getContactTimeline(contactId: string, limit: number = 50): Promise<ContactTimelineEvent[]> {
    try {
      const timeline: ContactTimelineEvent[] = [];

      // Get artwork views
      const { data: views } = await supabase
        .from('artwork_views')
        .select(`
          id, viewed_at, artwork_id,
          artwork:artworks!artwork_views_artwork_id_fkey(
            title, 
            primary_image_url, 
            user_id,
            artist:profiles!artworks_user_id_fkey(full_name)
          )
        `)
        .eq('viewer_id', contactId)
        .order('viewed_at', { ascending: false })
        .limit(limit);

      if (views) {
        timeline.push(...views.map(view => ({
          id: `view_${view.id}`,
          type: 'view' as const,
          timestamp: view.viewed_at,
          artwork: {
            id: view.artwork_id,
            title: view.artwork?.title || 'Unknown',
            image_url: view.artwork?.primary_image_url || '',
            artist_name: view.artist?.full_name || 'Unknown'
          }
        })));
      }

      // Get likes
      const { data: likes } = await supabase
        .from('artwork_reactions')
        .select(`
          id, created_at, artwork_id,
          artwork:artworks!artwork_views_artwork_id_fkey(title, primary_image_url, user_id),
          artist:profiles!artworks_user_id_fkey(full_name)
        `)
        .eq('collector_id', contactId)
        .eq('reaction_type', 'like')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (likes) {
        timeline.push(...likes.map(like => ({
          id: `like_${like.id}`,
          type: 'like' as const,
          timestamp: like.created_at,
          artwork: {
            id: like.artwork_id,
            title: like.artwork?.title || 'Unknown',
            image_url: like.artwork?.primary_image_url || '',
            artist_name: like.artist?.full_name || 'Unknown'
          }
        })));
      }

      // Get shares
      const { data: shares } = await supabase
        .from('artwork_shares')
        .select(`
          id, created_at, artwork_id,
          artwork:artworks!artwork_views_artwork_id_fkey(title, primary_image_url, user_id),
          artist:profiles!artworks_user_id_fkey(full_name)
        `)
        .eq('collector_id', contactId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (shares) {
        timeline.push(...shares.map(share => ({
          id: `share_${share.id}`,
          type: 'share' as const,
          timestamp: share.created_at,
          artwork: {
            id: share.artwork_id,
            title: share.artwork?.title || 'Unknown',
            image_url: share.artwork?.primary_image_url || '',
            artist_name: share.artist?.full_name || 'Unknown'
          }
        })));
      }

      // Get inquiries
      const { data: inquiries } = await supabase
        .from('inquiries')
        .select(`
          id, created_at, artwork_id,
          artwork:artworks!artwork_views_artwork_id_fkey(title, primary_image_url, user_id),
          artist:profiles!artworks_user_id_fkey(full_name)
        `)
        .eq('inquirer_id', contactId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (inquiries) {
        timeline.push(...inquiries.map(inquiry => ({
          id: `inquiry_${inquiry.id}`,
          type: 'inquiry' as const,
          timestamp: inquiry.created_at,
          artwork: {
            id: inquiry.artwork_id,
            title: inquiry.artwork?.title || 'Unknown',
            image_url: inquiry.artwork?.primary_image_url || '',
            artist_name: inquiry.artist?.full_name || 'Unknown'
          }
        })));
      }

      // Get purchases
      const { data: purchases } = await supabase
        .from('sales')
        .select(`
          id, sale_date, artwork_id, sale_price,
          artwork:artworks!artwork_views_artwork_id_fkey(title, primary_image_url, user_id),
          artist:profiles!artworks_user_id_fkey(full_name)
        `)
        .eq('collector_id', contactId)
        .order('sale_date', { ascending: false })
        .limit(limit);

      if (purchases) {
        timeline.push(...purchases.map(purchase => ({
          id: `purchase_${purchase.id}`,
          type: 'purchase' as const,
          timestamp: purchase.sale_date,
          artwork: {
            id: purchase.artwork_id,
            title: purchase.artwork?.title || 'Unknown',
            image_url: purchase.artwork?.primary_image_url || '',
            artist_name: purchase.artist?.full_name || 'Unknown'
          },
          metadata: { sale_price: purchase.sale_price }
        })));
      }

      // Sort by timestamp and limit
      return timeline
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);

    } catch (error) {
      console.error('Error getting contact timeline:', error);
      throw error;
    }
  }

  // Calculate contact insights
  async getContactInsights(contactId: string): Promise<ContactInsights> {
    try {
      // Get all interactions
      const timeline = await this.getContactTimeline(contactId, 1000);
      
      // Calculate intent score
      const intentScore = this.calculateIntentScore(timeline);
      
      // Get engagement level
      const engagementLevel = this.calculateEngagementLevel(timeline);
      
      // Get preferred mediums and styles
      const preferences = await this.getContactPreferences(contactId);
      
      // Get budget range
      const budgetRange = await this.getContactBudgetRange(contactId);
      
      // Calculate social proof signals
      const socialProof = await this.getSocialProofSignals(contactId);
      
      // Get session data
      const sessionData = await this.getSessionData(contactId);

      return {
        contactId,
        intentScore,
        engagementLevel,
        preferredMediums: preferences.mediums,
        preferredStyles: preferences.styles,
        budgetRange,
        lastActivity: timeline[0]?.timestamp || new Date().toISOString(),
        totalInteractions: timeline.length,
        purchaseHistory: timeline.filter(t => t.type === 'purchase').length,
        averageSessionDuration: sessionData.averageDuration,
        bounceRate: sessionData.bounceRate,
        socialProofSignals: socialProof
      };
    } catch (error) {
      console.error('Error getting contact insights:', error);
      throw error;
    }
  }

  // Get smart segments
  async getSmartSegments(userId: string): Promise<SmartSegment[]> {
    try {
      const { data, error } = await supabase
        .from('smart_segments')
        .select('*')
        .eq('user_id', userId)
        .order('last_updated', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting smart segments:', error);
      throw error;
    }
  }

  // Create smart segment
  async createSmartSegment(
    userId: string,
    name: string,
    description: string,
    criteria: any
  ): Promise<SmartSegment> {
    try {
      // Calculate contact count based on criteria
      const contactCount = await this.calculateSegmentSize(userId, criteria);

      const { data, error } = await supabase
        .from('smart_segments')
        .insert({
          user_id: userId,
          name,
          description,
          criteria,
          contact_count: contactCount,
          last_updated: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating smart segment:', error);
      throw error;
    }
  }

  // Private helper methods
  private calculateIntentScore(timeline: ContactTimelineEvent[]): number {
    const weights = {
      view: 0.1,
      like: 0.3,
      share: 0.4,
      inquiry: 0.6,
      purchase: 1.0,
      list_add: 0.5,
      follow: 0.2
    };

    const recentTimeline = timeline.filter(t => 
      new Date(t.timestamp) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );

    const score = recentTimeline.reduce((sum, event) => {
      return sum + (weights[event.type] || 0);
    }, 0);

    return Math.min(score / 10, 1); // Normalize to 0-1
  }

  private calculateEngagementLevel(timeline: ContactTimelineEvent[]): 'low' | 'medium' | 'high' | 'very_high' {
    const recentActivity = timeline.filter(t => 
      new Date(t.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    if (recentActivity >= 20) return 'very_high';
    if (recentActivity >= 10) return 'high';
    if (recentActivity >= 5) return 'medium';
    return 'low';
  }

  private async getContactPreferences(contactId: string): Promise<{ mediums: string[], styles: string[] }> {
    try {
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('preferred_mediums, preferred_styles')
        .eq('user_id', contactId)
        .single();

      return {
        mediums: preferences?.preferred_mediums || [],
        styles: preferences?.preferred_styles || []
      };
    } catch (error) {
      return { mediums: [], styles: [] };
    }
  }

  private async getContactBudgetRange(contactId: string): Promise<{ min: number, max: number }> {
    try {
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('min_budget, max_budget')
        .eq('user_id', contactId)
        .single();

      return {
        min: preferences?.min_budget || 0,
        max: preferences?.max_budget || 100000
      };
    } catch (error) {
      return { min: 0, max: 100000 };
    }
  }

  private async getSocialProofSignals(contactId: string): Promise<any> {
    try {
      const [follows, lists, shares, recommendations] = await Promise.all([
        supabase.from('followers').select('id').eq('follower_id', contactId),
        supabase.from('collector_lists').select('id').eq('collector_id', contactId),
        supabase.from('artwork_shares').select('id').eq('collector_id', contactId),
        supabase.from('recommendations').select('id').eq('user_id', contactId)
      ]);

      return {
        follows: follows.data?.length || 0,
        lists: lists.data?.length || 0,
        shares: shares.data?.length || 0,
        recommendations: recommendations.data?.length || 0
      };
    } catch (error) {
      return { follows: 0, lists: 0, shares: 0, recommendations: 0 };
    }
  }

  private async getSessionData(contactId: string): Promise<{ averageDuration: number, bounceRate: number }> {
    try {
      const { data: sessionData, error } = await supabase
        .from('user_sessions')
        .select('duration, is_bounce')
        .eq('contact_id', contactId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days

      if (error) {
        console.error('Error fetching session data:', error)
        return { averageDuration: 0, bounceRate: 0 }
      }

      if (!sessionData || sessionData.length === 0) {
        return { averageDuration: 0, bounceRate: 0 }
      }

      const totalDuration = sessionData.reduce((sum, session) => sum + (session.duration || 0), 0)
      const averageDuration = totalDuration / sessionData.length
      const bounceCount = sessionData.filter(session => session.is_bounce).length
      const bounceRate = bounceCount / sessionData.length

      return { averageDuration, bounceRate }
    } catch (error) {
      console.error('Error in getSessionData:', error)
      return { averageDuration: 0, bounceRate: 0 }
    }
  }

  private async calculateSegmentSize(userId: string, criteria: any): Promise<number> {
    try {
      let query = supabase
        .from('contacts')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)

      // Apply criteria filters
      if (criteria.role) {
        query = query.eq('role', criteria.role)
      }
      if (criteria.location) {
        query = query.eq('location', criteria.location)
      }
      if (criteria.interests && criteria.interests.length > 0) {
        query = query.overlaps('interests', criteria.interests)
      }

      const { count, error } = await query

      if (error) {
        console.error('Error calculating segment size:', error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.error('Error in calculateSegmentSize:', error)
      return 0
    }
  }
}

export const contact360 = new Contact360Service();
