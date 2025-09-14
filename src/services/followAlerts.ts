import { supabase } from '@/lib/supabase';

export interface FollowAlert {
  id: string;
  userId: string;
  type: 'artist' | 'artwork' | 'catalogue' | 'search';
  targetId: string;
  criteria?: any;
  isActive: boolean;
  lastTriggered?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  query: string;
  filters: any;
  entityTypes: string[];
  isActive: boolean;
  lastRun?: string;
  resultCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface FollowRelationship {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
  notificationsEnabled: boolean;
}

class FollowAlertsService {
  // Follow an artist
  async followArtist(followerId: string, artistId: string): Promise<FollowRelationship> {
    try {
      const { data, error } = await supabase
        .from('followers')
        .insert({
          follower_id: followerId,
          following_id: artistId,
          notifications_enabled: true
        })
        .select()
        .single();

      if (error) throw error;

      // Create follow alert
      await this.createAlert({
        userId: followerId,
        type: 'artist',
        targetId: artistId,
        criteria: { follow: true }
      });

      return data;
    } catch (error) {
      console.error('Error following artist:', error);
      throw error;
    }
  }

  // Unfollow an artist
  async unfollowArtist(followerId: string, artistId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('followers')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', artistId);

      if (error) throw error;

      // Deactivate follow alert
      await this.deactivateAlert(followerId, 'artist', artistId);
    } catch (error) {
      console.error('Error unfollowing artist:', error);
      throw error;
    }
  }

  // Check if user is following an artist
  async isFollowing(followerId: string, artistId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('followers')
        .select('id')
        .eq('follower_id', followerId)
        .eq('following_id', artistId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  }

  // Get user's followed artists
  async getFollowedArtists(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('followers')
        .select(`
          following_id,
          artist:following_id(
            id, full_name, slug, avatar_url, bio
          )
        `)
        .eq('follower_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data?.map(follow => follow.artist).filter(Boolean) || [];
    } catch (error) {
      console.error('Error getting followed artists:', error);
      throw error;
    }
  }

  // Get user's followers
  async getFollowers(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('followers')
        .select(`
          follower_id,
          follower:follower_id(
            id, full_name, slug, avatar_url
          )
        `)
        .eq('following_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data?.map(follow => follow.follower).filter(Boolean) || [];
    } catch (error) {
      console.error('Error getting followers:', error);
      throw error;
    }
  }

  // Create an alert
  async createAlert(alertData: Omit<FollowAlert, 'id' | 'createdAt' | 'updatedAt'>): Promise<FollowAlert> {
    try {
      const { data, error } = await supabase
        .from('collector_alerts')
        .insert({
          collector_id: alertData.userId,
          type: alertData.type,
          target_artwork_id: alertData.type === 'artwork' ? alertData.targetId : null,
          target_artist_id: alertData.type === 'artist' ? alertData.targetId : null,
          criteria: alertData.criteria || {},
          status: alertData.isActive ? 'active' : 'inactive'
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.collector_id,
        type: data.type as any,
        targetId: data.target_artwork_id || data.target_artist_id || '',
        criteria: data.criteria,
        isActive: data.status === 'active',
        lastTriggered: data.last_triggered_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error creating alert:', error);
      throw error;
    }
  }

  // Deactivate an alert
  async deactivateAlert(userId: string, type: string, targetId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('collector_alerts')
        .update({ status: 'inactive' })
        .eq('collector_id', userId)
        .eq('type', type)
        .or(`target_artwork_id.eq.${targetId},target_artist_id.eq.${targetId}`);

      if (error) throw error;
    } catch (error) {
      console.error('Error deactivating alert:', error);
      throw error;
    }
  }

  // Get user's alerts
  async getUserAlerts(userId: string): Promise<FollowAlert[]> {
    try {
      const { data, error } = await supabase
        .from('collector_alerts')
        .select('*')
        .eq('collector_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(alert => ({
        id: alert.id,
        userId: alert.collector_id,
        type: alert.type as any,
        targetId: alert.target_artwork_id || alert.target_artist_id || '',
        criteria: alert.criteria,
        isActive: alert.status === 'active',
        lastTriggered: alert.last_triggered_at,
        createdAt: alert.created_at,
        updatedAt: alert.updated_at
      })) || [];
    } catch (error) {
      console.error('Error getting user alerts:', error);
      throw error;
    }
  }

  // Save a search
  async saveSearch(searchData: Omit<SavedSearch, 'id' | 'createdAt' | 'updatedAt'>): Promise<SavedSearch> {
    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .insert({
          user_id: searchData.userId,
          name: searchData.name,
          query: searchData.query,
          filters: searchData.filters,
          entity_types: searchData.entityTypes,
          is_active: searchData.isActive
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        query: data.query,
        filters: data.filters,
        entityTypes: data.entity_types,
        isActive: data.is_active,
        lastRun: data.last_run,
        resultCount: data.result_count,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error saving search:', error);
      throw error;
    }
  }

  // Get user's saved searches
  async getSavedSearches(userId: string): Promise<SavedSearch[]> {
    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(search => ({
        id: search.id,
        userId: search.user_id,
        name: search.name,
        query: search.query,
        filters: search.filters,
        entityTypes: search.entity_types,
        isActive: search.is_active,
        lastRun: search.last_run,
        resultCount: search.result_count,
        createdAt: search.created_at,
        updatedAt: search.updated_at
      })) || [];
    } catch (error) {
      console.error('Error getting saved searches:', error);
      throw error;
    }
  }

  // Run a saved search
  async runSavedSearch(searchId: string): Promise<any[]> {
    try {
      const { data: search, error: searchError } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('id', searchId)
        .single();

      if (searchError) throw searchError;

      // Execute the search
      const { data: results, error: resultsError } = await supabase.rpc('execute_saved_search', {
        search_query: search.query,
        entity_types: search.entity_types,
        filters: search.filters,
        limit_count: 50
      });

      if (resultsError) throw resultsError;

      // Update last run time and result count
      await supabase
        .from('saved_searches')
        .update({
          last_run: new Date().toISOString(),
          result_count: results?.length || 0
        })
        .eq('id', searchId);

      return results || [];
    } catch (error) {
      console.error('Error running saved search:', error);
      throw error;
    }
  }

  // Delete a saved search
  async deleteSavedSearch(searchId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', searchId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting saved search:', error);
      throw error;
    }
  }

  // Update search frequency
  async updateSearchFrequency(searchId: string, frequency: 'realtime' | 'daily' | 'weekly'): Promise<void> {
    try {
      const { error } = await supabase
        .from('saved_searches')
        .update({ 
          frequency,
          updated_at: new Date().toISOString()
        })
        .eq('id', searchId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating search frequency:', error);
      throw error;
    }
  }

  // Get search suggestions based on user preferences
  async getSearchSuggestions(userId: string, query: string): Promise<string[]> {
    try {
      const { data, error } = await supabase.rpc('get_search_suggestions', {
        user_id: userId,
        query_text: query,
        limit_count: 10
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }

  // Get trending searches
  async getTrendingSearches(limit: number = 10): Promise<string[]> {
    try {
      const { data, error } = await supabase.rpc('get_trending_searches', {
        limit_count: limit
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting trending searches:', error);
      return [];
    }
  }
}

export const followAlerts = new FollowAlertsService();
