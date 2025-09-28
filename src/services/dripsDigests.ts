import { supabase } from '@/lib/supabase';

export interface DripCampaign {
  id: string;
  userId: string;
  name: string;
  description: string;
  type: 'welcome' | 'nurture' | 'drop' | 'win_back' | 'custom';
  status: 'draft' | 'active' | 'paused' | 'completed';
  targetAudience: {
    segments: string[];
    criteria: any;
  };
  emails: DripEmail[];
  schedule: {
    startDate: string;
    endDate?: string;
    timezone: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  };
  analytics: {
    sent: number;
    opened: number;
    clicked: number;
    unsubscribed: number;
    conversionRate: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DripEmail {
  id: string;
  campaignId: string;
  subject: string;
  content: string;
  template: string;
  delay: number; // hours after previous email
  order: number;
  isActive: boolean;
  analytics: {
    sent: number;
    opened: number;
    clicked: number;
  };
}

export interface DigestEmail {
  id: string;
  userId: string;
  type: 'daily' | 'weekly' | 'monthly';
  content: {
    newArtworks: any[];
    newArtists: any[];
    newCatalogues: any[];
    recommendations: any[];
    trending: any[];
    personalized: any[];
  };
  sendTime: string;
  timezone: string;
  isSent: boolean;
  sentAt?: string;
  analytics: {
    opened: boolean;
    clicked: boolean;
    unsubscribed: boolean;
  };
}

export interface SendTimeOptimization {
  userId: string;
  bestTimes: {
    monday: string[];
    tuesday: string[];
    wednesday: string[];
    thursday: string[];
    friday: string[];
    saturday: string[];
    sunday: string[];
  };
  timezone: string;
  lastUpdated: string;
}

class DripsDigestsService {
  // Create a drip campaign
  async createDripCampaign(campaignData: Omit<DripCampaign, 'id' | 'createdAt' | 'updatedAt' | 'analytics'>): Promise<DripCampaign> {
    try {
      const { data, error } = await supabase
        .from('drip_campaigns')
        .insert({
          user_id: campaignData.userId,
          name: campaignData.name,
          description: campaignData.description,
          type: campaignData.type,
          status: campaignData.status,
          target_audience: campaignData.targetAudience,
          schedule: campaignData.schedule,
          analytics: {
            sent: 0,
            opened: 0,
            clicked: 0,
            unsubscribed: 0,
            conversionRate: 0
          }
        })
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        targetAudience: data.target_audience,
        schedule: data.schedule,
        analytics: data.analytics,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error creating drip campaign:', error);
      throw error;
    }
  }

  // Add email to drip campaign
  async addDripEmail(emailData: Omit<DripEmail, 'id' | 'analytics'>): Promise<DripEmail> {
    try {
      const { data, error } = await supabase
        .from('drip_emails')
        .insert({
          campaign_id: emailData.campaignId,
          subject: emailData.subject,
          content: emailData.content,
          template: emailData.template,
          delay: emailData.delay,
          order: emailData.order,
          is_active: emailData.isActive,
          analytics: {
            sent: 0,
            opened: 0,
            clicked: 0
          }
        })
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        campaignId: data.campaign_id,
        isActive: data.is_active,
        analytics: data.analytics
      };
    } catch (error) {
      console.error('Error adding drip email:', error);
      throw error;
    }
  }

  // Get user's drip campaigns
  async getDripCampaigns(userId: string): Promise<DripCampaign[]> {
    try {
      const { data, error } = await supabase
        .from('drip_campaigns')
        .select(`
          *,
          emails:drip_emails(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(campaign => ({
        ...campaign,
        targetAudience: campaign.target_audience,
        schedule: campaign.schedule,
        analytics: campaign.analytics,
        emails: campaign.emails?.map(email => ({
          ...email,
          campaignId: email.campaign_id,
          isActive: email.is_active,
          analytics: email.analytics
        })) || [],
        createdAt: campaign.created_at,
        updatedAt: campaign.updated_at
      })) || [];
    } catch (error) {
      console.error('Error getting drip campaigns:', error);
      throw error;
    }
  }

  // Start a drip campaign
  async startDripCampaign(campaignId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('drip_campaigns')
        .update({ 
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId);

      if (error) throw error;

      // Schedule the first email
      await this.scheduleNextEmail(campaignId);
    } catch (error) {
      console.error('Error starting drip campaign:', error);
      throw error;
    }
  }

  // Generate digest content
  async generateDigestContent(userId: string, type: 'daily' | 'weekly' | 'monthly'): Promise<DigestEmail['content']> {
    try {
      const timeRange = this.getTimeRange(type);
      
      // Get new artworks
      const { data: newArtworks } = await supabase
        .from('artworks')
        .select(`
          id, title, slug, price, currency, primary_image_url, created_at,
          artist:user_id(full_name, slug)
        `)
        .gte('created_at', timeRange.start)
        .lte('created_at', timeRange.end)
        .eq('status', 'available')
        .order('created_at', { ascending: false })
        .limit(10);

      // Get new artists
      const { data: newArtists } = await supabase
        .from('profiles')
        .select('id, full_name, slug, avatar_url, bio')
        .gte('created_at', timeRange.start)
        .lte('created_at', timeRange.end)
        .eq('role', 'artist')
        .order('created_at', { ascending: false })
        .limit(5);

      // Get new catalogues
      const { data: newCatalogues } = await supabase
        .from('catalogues')
        .select(`
          id, title, slug, cover_image_url, created_at,
          artist:user_id(full_name, slug)
        `)
        .gte('created_at', timeRange.start)
        .lte('created_at', timeRange.end)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(5);

      // Get personalized recommendations
      const { data: recommendations } = await supabase.rpc('get_personalized_artworks', {
        p_collector_id: userId,
        p_limit: 8,
        p_offset: 0
      });

      // Get trending content
      const { data: trending } = await supabase.rpc('get_trending_content', {
        content_type: 'artwork',
        time_range: type,
        limit_count: 5
      });

      return {
        newArtworks: newArtworks || [],
        newArtists: newArtists || [],
        newCatalogues: newCatalogues || [],
        recommendations: recommendations || [],
        trending: trending || [],
        personalized: [] // This would be generated based on user preferences
      };
    } catch (error) {
      console.error('Error generating digest content:', error);
      throw error;
    }
  }

  // Send digest email
  async sendDigestEmail(userId: string, type: 'daily' | 'weekly' | 'monthly'): Promise<void> {
    try {
      const content = await this.generateDigestContent(userId, type);
      
      // Create digest record
      const { data: digest, error: digestError } = await supabase
        .from('digest_emails')
        .insert({
          user_id: userId,
          type,
          content,
          send_time: new Date().toISOString(),
          timezone: 'UTC',
          is_sent: false
        })
        .select()
        .single();

      if (digestError) throw digestError;

      // Send via email service (Postmark, etc.)
      await this.sendEmailViaService({
        to: userId, // This would be the user's email
        subject: this.getDigestSubject(type),
        template: 'digest',
        data: content
      });

      // Mark as sent
      await supabase
        .from('digest_emails')
        .update({ 
          is_sent: true,
          sent_at: new Date().toISOString()
        })
        .eq('id', digest.id);

    } catch (error) {
      console.error('Error sending digest email:', error);
      throw error;
    }
  }

  // Optimize send times based on user behavior
  async optimizeSendTimes(userId: string): Promise<SendTimeOptimization> {
    try {
      // Analyze user's email open patterns
      const { data: emailAnalytics } = await supabase
        .from('email_analytics')
        .select('opened_at, day_of_week, hour')
        .eq('user_id', userId)
        .gte('opened_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      // Calculate best times for each day
      const bestTimes = this.calculateBestTimes(emailAnalytics || []);

      // Update or create optimization record
      const { data, error } = await supabase
        .from('send_time_optimizations')
        .upsert({
          user_id: userId,
          best_times: bestTimes,
          timezone: 'UTC',
          last_updated: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return {
        userId: data.user_id,
        bestTimes: data.best_times,
        timezone: data.timezone,
        lastUpdated: data.last_updated
      };
    } catch (error) {
      console.error('Error optimizing send times:', error);
      throw error;
    }
  }

  // Smart resend to non-openers
  async smartResend(campaignId: string, emailId: string): Promise<void> {
    try {
      // Get recipients who didn't open the original email
      const { data: nonOpeners } = await supabase
        .from('email_recipients')
        .select('user_id, email')
        .eq('campaign_id', campaignId)
        .eq('email_id', emailId)
        .eq('opened', false);

      if (!nonOpeners?.length) return;

      // Get the original email data
      const { data: email } = await supabase
        .from('emails')
        .select('subject, content')
        .eq('id', emailId)
        .single();

      if (!email) return;

      // Resend with modified subject line
      const modifiedSubject = this.modifySubjectForResend(email.subject);
      
      for (const recipient of nonOpeners) {
        await this.sendEmailViaService({
          to: recipient.email,
          subject: modifiedSubject,
          template: 'resend',
          data: { originalEmailId: emailId }
        });
      }

    } catch (error) {
      console.error('Error smart resending:', error);
      throw error;
    }
  }

  // Private helper methods
  private async scheduleNextEmail(campaignId: string): Promise<void> {
    // Implementation for scheduling next email in the drip sequence
    console.log('Scheduling next email for campaign:', campaignId);
  }

  private getTimeRange(type: string): { start: string; end: string } {
    const now = new Date();
    const end = now.toISOString();
    
    let start: Date;
    switch (type) {
      case 'daily':
        start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    return {
      start: start.toISOString(),
      end
    };
  }

  private getDigestSubject(type: string): string {
    const subjects = {
      daily: 'Your Daily Art Discovery',
      weekly: 'This Week in Art',
      monthly: 'Monthly Art Digest'
    };
    return subjects[type as keyof typeof subjects] || 'Art Digest';
  }

  private calculateBestTimes(emailAnalytics: any[]): any {
    // Analyze open patterns and return best times for each day
    const dayHourCounts: Record<string, Record<number, number>> = {};
    
    emailAnalytics.forEach(analytics => {
      const day = analytics.day_of_week;
      const hour = analytics.hour;
      
      if (!dayHourCounts[day]) dayHourCounts[day] = {};
      dayHourCounts[day][hour] = (dayHourCounts[day][hour] || 0) + 1;
    });

    const bestTimes: any = {};
    for (const day in dayHourCounts) {
      const hours = dayHourCounts[day];
      const sortedHours = Object.entries(hours)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([hour]) => `${hour}:00`);
      bestTimes[day] = sortedHours;
    }

    return bestTimes;
  }

  private modifySubjectForResend(originalSubject: string): string {
    // Add resend indicators to subject line
    const resendIndicators = ['(Reminder)', '(Don\'t miss this)', '(Last chance)'];
    const randomIndicator = resendIndicators[Math.floor(Math.random() * resendIndicators.length)];
    return `${randomIndicator} ${originalSubject}`;
  }

  private async sendEmailViaService(emailData: any): Promise<void> {
    // This would integrate with Postmark, SendGrid, or similar service
    console.log('Sending email:', emailData);
  }
}

export const dripsDigests = new DripsDigestsService();
