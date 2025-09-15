import { supabase } from '../lib/supabase'

export interface EmailTemplate {
  id: string
  name: string
  type: 'catalogue_send' | 'follow_up' | 'welcome' | 'artwork_inquiry' | 'sale_confirmation' | 'exhibition_invite' | 'newsletter' | 'custom'
  subject: string
  html_content: string
  text_content: string
  variables: string[]
  is_system_template: boolean
  created_at: string
  updated_at: string
  user_id: string
}

export interface EmailCampaign {
  id: string
  name: string
  template_id: string
  subject: string
  html_content: string
  text_content: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled'
  scheduled_at: string | null
  sent_at: string | null
  recipient_count: number
  open_count: number
  click_count: number
  created_at: string
  updated_at: string
  user_id: string
}

export interface EmailTrigger {
  id: string
  name: string
  event_type: 'artwork_inquiry' | 'sale_completed' | 'catalogue_viewed' | 'artist_followed' | 'custom'
  template_id: string
  conditions: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
  user_id: string
}

export interface EmailRecipient {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  tags: string[]
  status: 'active' | 'unsubscribed' | 'bounced'
  created_at: string
  updated_at: string
  user_id: string
}

export class EmailMarketingService {
  // Email Templates
  static async getTemplates(userId: string): Promise<EmailTemplate[]> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async getSystemTemplates(): Promise<EmailTemplate[]> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('is_system_template', true)
      .order('name')

    if (error) throw error
    return data || []
  }

  static async createTemplate(template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<EmailTemplate> {
    const { data, error } = await supabase
      .from('email_templates')
      .insert(template)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateTemplate(id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const { data, error } = await supabase
      .from('email_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Email Campaigns
  static async getCampaigns(userId: string): Promise<EmailCampaign[]> {
    const { data, error } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async createCampaign(campaign: Omit<EmailCampaign, 'id' | 'created_at' | 'updated_at' | 'recipient_count' | 'open_count' | 'click_count'>): Promise<EmailCampaign> {
    const { data, error } = await supabase
      .from('email_campaigns')
      .insert(campaign)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateCampaign(id: string, updates: Partial<EmailCampaign>): Promise<EmailCampaign> {
    const { data, error } = await supabase
      .from('email_campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteCampaign(id: string): Promise<void> {
    const { error } = await supabase
      .from('email_campaigns')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  static async sendCampaign(campaignId: string): Promise<void> {
    const { error } = await supabase
      .from('email_campaigns')
      .update({ 
        status: 'sending',
        sent_at: new Date().toISOString()
      })
      .eq('id', campaignId)

    if (error) throw error

    // TODO: Implement actual email sending logic
    // This would integrate with an email service like SendGrid, Mailgun, etc.
  }

  // Email Triggers
  static async getTriggers(userId: string): Promise<EmailTrigger[]> {
    const { data, error } = await supabase
      .from('email_triggers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async createTrigger(trigger: Omit<EmailTrigger, 'id' | 'created_at' | 'updated_at'>): Promise<EmailTrigger> {
    const { data, error } = await supabase
      .from('email_triggers')
      .insert(trigger)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateTrigger(id: string, updates: Partial<EmailTrigger>): Promise<EmailTrigger> {
    const { data, error } = await supabase
      .from('email_triggers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteTrigger(id: string): Promise<void> {
    const { error } = await supabase
      .from('email_triggers')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Email Recipients
  static async getRecipients(userId: string): Promise<EmailRecipient[]> {
    const { data, error } = await supabase
      .from('email_recipients')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async createRecipient(recipient: Omit<EmailRecipient, 'id' | 'created_at' | 'updated_at'>): Promise<EmailRecipient> {
    const { data, error } = await supabase
      .from('email_recipients')
      .insert(recipient)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateRecipient(id: string, updates: Partial<EmailRecipient>): Promise<EmailRecipient> {
    const { data, error } = await supabase
      .from('email_recipients')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteRecipient(id: string): Promise<void> {
    const { error } = await supabase
      .from('email_recipients')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Email Analytics
  static async getCampaignAnalytics(campaignId: string): Promise<{
    open_rate: number
    click_rate: number
    bounce_rate: number
    unsubscribe_rate: number
  }> {
    const { data: campaign } = await supabase
      .from('email_campaigns')
      .select('recipient_count, open_count, click_count')
      .eq('id', campaignId)
      .single()

    if (!campaign) throw new Error('Campaign not found')

    const open_rate = campaign.recipient_count > 0 ? (campaign.open_count / campaign.recipient_count) * 100 : 0
    const click_rate = campaign.recipient_count > 0 ? (campaign.click_count / campaign.recipient_count) * 100 : 0

    return {
      open_rate,
      click_rate,
      bounce_rate: 0, // TODO: Implement bounce tracking
      unsubscribe_rate: 0 // TODO: Implement unsubscribe tracking
    }
  }

  // Template Processing
  static processTemplate(template: string, variables: Record<string, string>): string {
    let processed = template
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      processed = processed.replace(regex, value)
    })
    
    return processed
  }

  // System Template Creation
  static async createSystemTemplates(): Promise<void> {
    const systemTemplates = [
      {
        name: 'Catalogue Send',
        type: 'catalogue_send' as const,
        subject: 'New Catalogue: {{catalogue_title}}',
        html_content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">New Catalogue: {{catalogue_title}}</h2>
            <p>Dear {{recipient_name}},</p>
            <p>I'm excited to share my latest catalogue with you: <strong>{{catalogue_title}}</strong></p>
            <p>{{catalogue_description}}</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{catalogue_url}}" style="background: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">View Catalogue</a>
            </div>
            <p>Best regards,<br>{{artist_name}}</p>
          </div>
        `,
        text_content: `
          New Catalogue: {{catalogue_title}}
          
          Dear {{recipient_name}},
          
          I'm excited to share my latest catalogue with you: {{catalogue_title}}
          
          {{catalogue_description}}
          
          View the catalogue: {{catalogue_url}}
          
          Best regards,
          {{artist_name}}
        `,
        variables: ['catalogue_title', 'catalogue_description', 'catalogue_url', 'recipient_name', 'artist_name'],
        is_system_template: true,
        user_id: 'system'
      },
      {
        name: 'Artwork Inquiry Follow-up',
        type: 'artwork_inquiry' as const,
        subject: 'Thank you for your interest in {{artwork_title}}',
        html_content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Thank you for your interest!</h2>
            <p>Dear {{recipient_name}},</p>
            <p>Thank you for your interest in <strong>{{artwork_title}}</strong>. I'm delighted that this piece caught your attention.</p>
            <p>Here are some additional details about the artwork:</p>
            <ul>
              <li><strong>Medium:</strong> {{artwork_medium}}</li>
              <li><strong>Dimensions:</strong> {{artwork_dimensions}}</li>
              <li><strong>Year:</strong> {{artwork_year}}</li>
              <li><strong>Price:</strong> {{artwork_price}}</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{artwork_url}}" style="background: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">View Artwork</a>
            </div>
            <p>Please don't hesitate to reach out if you have any questions or would like to arrange a viewing.</p>
            <p>Best regards,<br>{{artist_name}}</p>
          </div>
        `,
        text_content: `
          Thank you for your interest!
          
          Dear {{recipient_name}},
          
          Thank you for your interest in {{artwork_title}}. I'm delighted that this piece caught your attention.
          
          Here are some additional details about the artwork:
          - Medium: {{artwork_medium}}
          - Dimensions: {{artwork_dimensions}}
          - Year: {{artwork_year}}
          - Price: {{artwork_price}}
          
          View the artwork: {{artwork_url}}
          
          Please don't hesitate to reach out if you have any questions or would like to arrange a viewing.
          
          Best regards,
          {{artist_name}}
        `,
        variables: ['artwork_title', 'artwork_medium', 'artwork_dimensions', 'artwork_year', 'artwork_price', 'artwork_url', 'recipient_name', 'artist_name'],
        is_system_template: true,
        user_id: 'system'
      },
      {
        name: 'Welcome Email',
        type: 'welcome' as const,
        subject: 'Welcome to {{artist_name}}\'s Studio',
        html_content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome to my studio!</h2>
            <p>Dear {{recipient_name}},</p>
            <p>Thank you for joining my mailing list. I'm excited to share my latest works, upcoming exhibitions, and behind-the-scenes insights with you.</p>
            <p>You can expect to receive:</p>
            <ul>
              <li>Updates on new artworks</li>
              <li>Exhibition invitations</li>
              <li>Studio insights and process videos</li>
              <li>Exclusive previews of upcoming collections</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{artist_portfolio_url}}" style="background: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">View My Portfolio</a>
            </div>
            <p>Thank you for your support,<br>{{artist_name}}</p>
          </div>
        `,
        text_content: `
          Welcome to my studio!
          
          Dear {{recipient_name}},
          
          Thank you for joining my mailing list. I'm excited to share my latest works, upcoming exhibitions, and behind-the-scenes insights with you.
          
          You can expect to receive:
          - Updates on new artworks
          - Exhibition invitations
          - Studio insights and process videos
          - Exclusive previews of upcoming collections
          
          View my portfolio: {{artist_portfolio_url}}
          
          Thank you for your support,
          {{artist_name}}
        `,
        variables: ['recipient_name', 'artist_name', 'artist_portfolio_url'],
        is_system_template: true,
        user_id: 'system'
      }
    ]

    for (const template of systemTemplates) {
      const { error } = await supabase
        .from('email_templates')
        .upsert(template, { onConflict: 'name,user_id' })

      if (error) {
        console.error('Error creating system template:', error)
      }
    }
  }
}
