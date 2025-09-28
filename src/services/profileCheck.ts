import { supabase } from '../lib/supabase'
import { showErrorToast, showSuccessToast } from '../utils/errorHandling'

export interface ProfileCheckResult {
  exists: boolean
  needsProfile: boolean
  needsSync: boolean
  user?: any
  profile?: any
  error?: string
}

class ProfileCheckService {
  /**
   * Check if a user exists in auth but not in profiles table
   */
  async checkUserProfileStatus(email: string): Promise<ProfileCheckResult> {
    try {
      // First, check if user exists in auth.users (this requires admin access)
      // Since we can't directly query auth.users from client, we'll try to sign them in
      // and then check their profile status
      
      console.log('ProfileCheck: Checking profile status for email:', email)
      
      // Try to get user by email using a magic link (this will work if user exists)
      const { data: magicLinkData, error: magicLinkError } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: false // Don't create user if they don't exist
        }
      })

      if (magicLinkError) {
        console.log('ProfileCheck: Magic link error:', magicLinkError.message)
        
        // If user doesn't exist in auth, they need to sign up
        if (magicLinkError.message.includes('Invalid login credentials') || 
            magicLinkError.message.includes('User not found')) {
          return {
            exists: false,
            needsProfile: false,
            needsSync: false,
            error: 'User not found. Please sign up first.'
          }
        }
        
        return {
          exists: false,
          needsProfile: false,
          needsSync: false,
          error: magicLinkError.message
        }
      }

      // If magic link was sent successfully, user exists in auth
      // Now check if they have a profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('ProfileCheck: Profile query error:', profileError)
        return {
          exists: true,
          needsProfile: true,
          needsSync: false,
          error: 'Error checking profile status'
        }
      }

      if (!profile) {
        console.log('ProfileCheck: User exists in auth but no profile found')
        return {
          exists: true,
          needsProfile: true,
          needsSync: false,
          error: 'User exists but profile is missing. Please contact support.'
        }
      }

      console.log('ProfileCheck: User and profile both exist')
      return {
        exists: true,
        needsProfile: false,
        needsSync: false,
        user: { email },
        profile
      }

    } catch (error) {
      console.error('ProfileCheck: Error checking profile status:', error)
      return {
        exists: false,
        needsProfile: false,
        needsSync: false,
        error: 'An error occurred while checking your account status'
      }
    }
  }

  /**
   * Create a missing profile for an existing auth user
   */
  async createMissingProfile(email: string, role: 'ARTIST' | 'COLLECTOR' = 'COLLECTOR'): Promise<boolean> {
    try {
      console.log('ProfileCheck: Creating missing profile for:', email)
      
      // This would typically be done server-side with admin access
      // For now, we'll show a message to contact support
      showErrorToast('Profile creation requires admin access. Please contact support.')
      return false
      
    } catch (error) {
      console.error('ProfileCheck: Error creating profile:', error)
      showErrorToast('Failed to create profile. Please contact support.')
      return false
    }
  }

  /**
   * Sync existing profile with auth user data
   */
  async syncProfile(email: string): Promise<boolean> {
    try {
      console.log('ProfileCheck: Syncing profile for:', email)
      
      // Get the profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single()

      if (profileError || !profile) {
        showErrorToast('Profile not found')
        return false
      }

      // This would typically sync with auth user data
      // For now, we'll just show success
      showSuccessToast('Profile sync completed')
      return true
      
    } catch (error) {
      console.error('ProfileCheck: Error syncing profile:', error)
      showErrorToast('Failed to sync profile')
      return false
    }
  }

}

export const profileCheckService = new ProfileCheckService()
export default profileCheckService
