export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          display_name: string | null
          username: string | null
          bio: string | null
          location: string | null
          avatar_url: string | null
          website: string | null
          instagram: string | null
          twitter: string | null
          role: 'artist' | 'collector' | 'both'
          profile_complete: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          display_name?: string | null
          username?: string | null
          bio?: string | null
          location?: string | null
          avatar_url?: string | null
          website?: string | null
          instagram?: string | null
          twitter?: string | null
          role?: 'artist' | 'collector' | 'both'
          profile_complete?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          display_name?: string | null
          username?: string | null
          bio?: string | null
          location?: string | null
          avatar_url?: string | null
          website?: string | null
          instagram?: string | null
          twitter?: string | null
          role?: 'artist' | 'collector' | 'both'
          profile_complete?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      artworks: {
        Row: {
          id: string
          title: string
          description: string | null
          medium: string
          year: number
          price: number
          currency: string
          dimensions: {
            width: number
            height: number
            depth?: number
            unit: string
          }
          primary_image_url: string
          additional_images: string[] | null
          genre: string | null
          style: string | null
          subject: string | null
          availability: 'available' | 'sold' | 'reserved'
          user_id: string
          created_at: string
          updated_at: string
          view_count: number
          like_count: number
          is_featured: boolean
          tags: string[] | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          medium: string
          year: number
          price: number
          currency: string
          dimensions: {
            width: number
            height: number
            depth?: number
            unit: string
          }
          primary_image_url: string
          additional_images?: string[] | null
          genre?: string | null
          style?: string | null
          subject?: string | null
          availability?: 'available' | 'sold' | 'reserved'
          user_id: string
          created_at?: string
          updated_at?: string
          view_count?: number
          like_count?: number
          is_featured?: boolean
          tags?: string[] | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          medium?: string
          year?: number
          price?: number
          currency?: string
          dimensions?: {
            width: number
            height: number
            depth?: number
            unit: string
          }
          primary_image_url?: string
          additional_images?: string[] | null
          genre?: string | null
          style?: string | null
          subject?: string | null
          availability?: 'available' | 'sold' | 'reserved'
          user_id?: string
          created_at?: string
          updated_at?: string
          view_count?: number
          like_count?: number
          is_featured?: boolean
          tags?: string[] | null
        }
      }
      user_preferences: {
        Row: {
          user_id: string
          preferred_mediums: string[] | null
          preferred_styles: string[] | null
          min_budget: number | null
          max_budget: number | null
          use_learned_budget: boolean | null
          learned_preferences: Record<string, unknown> | null
          live_preferences: Record<string, unknown> | null
          notification_real_time: Record<string, boolean> | null
          notification_daily: Record<string, boolean> | null
          notification_weekly: Record<string, boolean> | null
          alert_specific_artists: string[] | null
          alert_specific_mediums: string[] | null
          alert_specific_styles: string[] | null
          exclude_mediums: string[] | null
          exclude_styles: string[] | null
          exclude_artists: string[] | null
          notify_by_email: boolean | null
          notify_price_drops: boolean | null
          notify_new_works: boolean | null
          notify_auction_reminders: boolean | null
          notify_collection_insights: boolean | null
          preferred_digest_time: string | null
          updated_at: string
        }
        Insert: {
          user_id: string
          preferred_mediums?: string[] | null
          preferred_styles?: string[] | null
          min_budget?: number | null
          max_budget?: number | null
          use_learned_budget?: boolean | null
          learned_preferences?: Record<string, unknown> | null
          live_preferences?: Record<string, unknown> | null
          notification_real_time?: Record<string, boolean> | null
          notification_daily?: Record<string, boolean> | null
          notification_weekly?: Record<string, boolean> | null
          alert_specific_artists?: string[] | null
          alert_specific_mediums?: string[] | null
          alert_specific_styles?: string[] | null
          exclude_mediums?: string[] | null
          exclude_styles?: string[] | null
          exclude_artists?: string[] | null
          notify_by_email?: boolean | null
          notify_price_drops?: boolean | null
          notify_new_works?: boolean | null
          notify_auction_reminders?: boolean | null
          notify_collection_insights?: boolean | null
          preferred_digest_time?: string | null
          updated_at?: string
        }
        Update: {
          user_id?: string
          preferred_mediums?: string[] | null
          preferred_styles?: string[] | null
          min_budget?: number | null
          max_budget?: number | null
          use_learned_budget?: boolean | null
          learned_preferences?: Record<string, unknown> | null
          live_preferences?: Record<string, unknown> | null
          notification_real_time?: Record<string, boolean> | null
          notification_daily?: Record<string, boolean> | null
          notification_weekly?: Record<string, boolean> | null
          alert_specific_artists?: string[] | null
          alert_specific_mediums?: string[] | null
          alert_specific_styles?: string[] | null
          exclude_mediums?: string[] | null
          exclude_styles?: string[] | null
          exclude_artists?: string[] | null
          notify_by_email?: boolean | null
          notify_price_drops?: boolean | null
          notify_new_works?: boolean | null
          notify_auction_reminders?: boolean | null
          notify_collection_insights?: boolean | null
          preferred_digest_time?: string | null
          updated_at?: string
        }
      }
      sales: {
        Row: {
          id: string
          artwork_id: string
          buyer_id: string
          seller_id: string
          price: number
          currency: string
          commission_rate: number
          status: 'pending' | 'completed' | 'cancelled' | 'refunded'
          payment_method: string | null
          transaction_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          artwork_id: string
          buyer_id: string
          seller_id: string
          price: number
          currency: string
          commission_rate: number
          status?: 'pending' | 'completed' | 'cancelled' | 'refunded'
          payment_method?: string | null
          transaction_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          artwork_id?: string
          buyer_id?: string
          seller_id?: string
          price?: number
          currency?: string
          commission_rate?: number
          status?: 'pending' | 'completed' | 'cancelled' | 'refunded'
          payment_method?: string | null
          transaction_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'artist' | 'collector' | 'both'
      artwork_availability: 'available' | 'sold' | 'reserved'
      sale_status: 'pending' | 'completed' | 'cancelled' | 'refunded'
    }
  }
}