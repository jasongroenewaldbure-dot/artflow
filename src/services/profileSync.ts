import { supabase } from '../lib/supabase'
import { showErrorToast, showSuccessToast } from '../utils/errorHandling'

export interface UserProfile {
  id: string
  full_name?: string
  display_name?: string
  slug?: string
  role: 'ARTIST' | 'COLLECTOR' | 'ADMIN'
  created_at: string
  updated_at?: string
  avatar_url?: string
  bio?: string
  location?: string
  website?: string
}

export interface SupabaseUser {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
    bio?: string
    location?: string
    website?: string
  }
  app_metadata?: {
    role?: 'ARTIST' | 'COLLECTOR' | 'ADMIN'
  }
  created_at: string
  updated_at: string
}

class ProfileSyncService {
  /**
   * Check if a user has a corresponding profile
   */
  async hasProfile(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }

      return !!data
    } catch (error) {
      console.error('Error checking profile existence:', error)
      return false
    }
  }

  /**
   * Get user profile by user ID
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // No profile found
        }
        throw error
      }

      return data as UserProfile
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  }

  /**
   * Create a new profile for an authenticated user
   */
  async createProfile(user: SupabaseUser): Promise<UserProfile | null> {
    try {
      const profileData = {
        id: user.id,
        full_name: user.user_metadata?.full_name || 'User',
        display_name: user.user_metadata?.display_name || user.user_metadata?.full_name || 'User',
        slug: user.user_metadata?.slug || user.id,
        role: (user.app_metadata?.role || 'COLLECTOR').toUpperCase() as 'ARTIST' | 'COLLECTOR' | 'ADMIN',
        created_at: user.created_at,
        updated_at: user.updated_at || new Date().toISOString(),
        avatar_url: user.user_metadata?.avatar_url,
        bio: user.user_metadata?.bio,
        location: user.user_metadata?.location,
        website: user.user_metadata?.website
      }

      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single()

      if (error) throw error

      console.log('Profile created successfully:', data)
      return data as UserProfile
    } catch (error) {
      console.error('Error creating profile:', error)
      showErrorToast('Failed to create user profile')
      return null
    }
  }

  /**
   * Update an existing profile with user data
   */
  async updateProfile(userId: string, user: SupabaseUser): Promise<UserProfile | null> {
    try {
      const updateData: Partial<UserProfile> = {
        updated_at: new Date().toISOString()
      }

      // Only update fields that have changed or are missing
      if (user.user_metadata?.full_name) {
        updateData.full_name = user.user_metadata.full_name
      }
      if (user.user_metadata?.display_name) {
        updateData.display_name = user.user_metadata.display_name
      }
      if (user.user_metadata?.slug) {
        updateData.slug = user.user_metadata.slug
      }
      if (user.app_metadata?.role) {
        updateData.role = user.app_metadata.role.toUpperCase() as 'ARTIST' | 'COLLECTOR' | 'ADMIN'
      }
      if (user.user_metadata?.avatar_url) {
        updateData.avatar_url = user.user_metadata.avatar_url
      }
      if (user.user_metadata?.bio) {
        updateData.bio = user.user_metadata.bio
      }
      if (user.user_metadata?.location) {
        updateData.location = user.user_metadata.location
      }
      if (user.user_metadata?.website) {
        updateData.website = user.user_metadata.website
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error

      console.log('Profile updated successfully:', data)
      return data as UserProfile
    } catch (error) {
      console.error('Error updating profile:', error)
      showErrorToast('Failed to update user profile')
      return null
    }
  }

  /**
   * Sync user with profile - main method to ensure consistency
   */
  async syncUserProfile(user: SupabaseUser): Promise<UserProfile | null> {
    try {
      if (!user.id) {
        console.error('User ID is required for profile sync')
        return null
      }

      // Check if profile exists
      const hasProfile = await this.hasProfile(user.id)
      
      if (!hasProfile) {
        // Create new profile
        console.log('Creating new profile for user:', user.id)
        return await this.createProfile(user)
      } else {
        // Update existing profile if needed
        console.log('Updating existing profile for user:', user.id)
        return await this.updateProfile(user.id, user)
      }
    } catch (error) {
      console.error('Error syncing user profile:', error)
      return null
    }
  }

  /**
   * Validate profile completeness
   */
  async validateProfile(profile: UserProfile): Promise<{
    isValid: boolean
    missingFields: string[]
    suggestions: string[]
  }> {
    const missingFields: string[] = []
    const suggestions: string[] = []

    if (!profile.name || profile.name.trim() === '') {
      missingFields.push('name')
      suggestions.push('Please add your full name')
    }

    if (!profile.slug || profile.slug.trim() === '') {
      missingFields.push('slug')
      suggestions.push('Please add a unique slug for your profile')
    }

    return {
      isValid: missingFields.length === 0,
      missingFields,
      suggestions
    }
  }

  /**
   * Get all users without profiles (for admin purposes)
   */
  async getUsersWithoutProfiles(): Promise<SupabaseUser[]> {
    try {
      // This would require admin access to auth.users table
      // For now, we'll return an empty array as this is typically handled server-side
      console.warn('getUsersWithoutProfiles requires admin access - implement server-side')
      return []
    } catch (error) {
      console.error('Error fetching users without profiles:', error)
      return []
    }
  }

  /**
   * Bulk sync all authenticated users (admin function)
   */
  async bulkSyncProfiles(): Promise<{
    success: number
    failed: number
    errors: string[]
  }> {
    try {
      // This would require admin access and should be implemented server-side
      console.warn('bulkSyncProfiles requires admin access - implement server-side')
      return { success: 0, failed: 0, errors: ['Admin access required'] }
    } catch (error) {
      console.error('Error in bulk sync:', error)
      return { success: 0, failed: 1, errors: [error instanceof Error ? error.message : 'Unknown error'] }
    }
  }
}

export const profileSyncService = new ProfileSyncService()
export default profileSyncService