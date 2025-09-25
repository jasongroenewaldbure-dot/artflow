import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { profileSyncService } from '../services/profileSync'
import toast from 'react-hot-toast'
import { Loader, CheckCircle, AlertCircle } from 'lucide-react'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    let isHandled = false
    
    const handleAuthCallback = async () => {
      if (isHandled) return
      isHandled = true
      
      try {
        setStatus('loading')
        console.log('AuthCallback: Starting auth callback handling')
        
        // Get URL parameters from both hash and search params
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const searchParamsFromUrl = new URLSearchParams(window.location.search)
        
        const accessToken = hashParams.get('access_token') || searchParamsFromUrl.get('access_token')
        const refreshToken = hashParams.get('refresh_token') || searchParamsFromUrl.get('refresh_token')
        const error = hashParams.get('error') || searchParamsFromUrl.get('error')
        const errorDescription = hashParams.get('error_description') || searchParamsFromUrl.get('error_description')

        console.log('AuthCallback: URL params:', { 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken, 
          error, 
          errorDescription 
        })

        // Handle errors first
        if (error) {
          console.error('AuthCallback: Error in URL params:', error, errorDescription)
          throw new Error(errorDescription || error)
        }

        // If no tokens, redirect to start page
        if (!accessToken && !refreshToken) {
          console.log('AuthCallback: No tokens found, redirecting to start')
          navigate('/start', { replace: true })
          return
        }

        // Set the session if we have tokens
        if (accessToken && refreshToken) {
          console.log('AuthCallback: Setting session with tokens')
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })
          
          if (sessionError) {
            console.error('AuthCallback: Session error:', sessionError)
            throw sessionError
          }
          
          // Wait a moment for session to be set
          await new Promise(resolve => setTimeout(resolve, 2000))
        }

        // Get the current user
        console.log('AuthCallback: Getting current user...')
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          console.error('AuthCallback: User error:', userError)
          throw new Error('Failed to get user information')
        }

        console.log('AuthCallback: ✅ Found user:', user.id, user.email)

        // Get the selected role from session storage
        const selectedRole = sessionStorage.getItem('selectedRole') as 'artist' | 'collector' | 'both' | null
        if (selectedRole) {
          console.log('AuthCallback: Found selected role:', selectedRole)
          sessionStorage.removeItem('selectedRole')
        }

        // Check if profile exists
        console.log('AuthCallback: Checking profile for user:', user.id)
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, user_id, role, display_name, full_name, profile_complete, password_set, created_at, avatar_url, bio, location, website')
          .eq('user_id', user.id)
          .single()

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('AuthCallback: Profile error:', profileError)
          throw profileError
        }

        console.log('AuthCallback: Profile check result:', {
          profileExists: !!profile,
          profileData: profile ? {
            id: profile.id,
            role: profile.role,
            display_name: profile.display_name,
            full_name: profile.full_name,
            profile_complete: profile.profile_complete,
            created_at: profile.created_at
          } : null
        })

        // If no profile exists, create one
        if (!profile) {
          console.log('AuthCallback: No profile found - creating new profile')
          
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{
              user_id: user.id,
              display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
              role: selectedRole?.toUpperCase() || 'COLLECTOR',
              profile_complete: false,
              password_set: false,
              email_verified: true
            }])
            .select()
            .single()
          
          if (createError) {
            console.error('AuthCallback: Failed to create profile:', createError)
            throw new Error('Failed to create user profile')
          }
          
          console.log('AuthCallback: Profile created successfully:', newProfile)
          
          // Redirect new users to onboarding
          setStatus('success')
          toast.success('Welcome! Let\'s set up your profile.')
          setTimeout(() => {
            navigate('/onboarding', { replace: true })
          }, 100)
          return
        }

        // Sync existing profile
        if (profile) {
          console.log('AuthCallback: Syncing existing profile')
          
          const userData = {
            id: user.id,
            email: user.email || '',
            user_metadata: {
              full_name: user.user_metadata?.full_name || profile.display_name || profile.full_name,
              avatar_url: user.user_metadata?.avatar_url || profile.avatar_url,
              bio: user.user_metadata?.bio || profile.bio,
              location: user.user_metadata?.location || profile.location,
              website: user.user_metadata?.website || profile.website
            },
            app_metadata: {
              role: profile.role as 'ARTIST' | 'COLLECTOR' | 'ADMIN'
            },
            created_at: user.created_at,
            updated_at: user.updated_at || new Date().toISOString()
          }

          await profileSyncService.syncUserProfile(userData)
        }

        // Check if user needs to complete onboarding
        const passwordSet = profile?.password_set === true
        const profileCompleted = profile?.profile_complete === true
        const hasDisplayName = profile?.display_name || profile?.full_name
        
        console.log('AuthCallback: Onboarding check:', {
          passwordSet,
          profileCompleted,
          hasDisplayName: !!hasDisplayName,
          userCreatedAt: user.created_at,
          profileExists: !!profile
        })

        // For magic link users, they need onboarding if:
        // - No profile exists, OR
        // - Password not set, OR  
        // - Profile not completed, OR
        // - No display name
        const needsOnboarding = !profile || !passwordSet || !profileCompleted || !hasDisplayName

        console.log('AuthCallback: Final decision - needsOnboarding:', needsOnboarding)

        if (needsOnboarding) {
          console.log('AuthCallback: User needs onboarding - redirecting to /onboarding')
          setStatus('success')
          toast.success('Welcome! Let\'s complete your profile setup.')
          
          // Force redirect with a small delay to ensure state is set
          setTimeout(() => {
            navigate('/onboarding', { replace: true })
          }, 100)
          return
        }

        // User is fully set up
        console.log('AuthCallback: User is fully set up, redirecting to dashboard')
        setStatus('success')
        toast.success('Successfully signed in!')
        setTimeout(() => {
          navigate('/u/dashboard', { replace: true })
        }, 100)

      } catch (error: unknown) {
        console.error('Auth callback error:', error)
        
        let errorMessage = 'An error occurred during authentication. Please try again.'
        
        const errorText = error instanceof Error ? error.message : 'Unknown error'
        
        if (errorText.includes('Email link is invalid or has expired')) {
          errorMessage = 'The verification link has expired. Please request a new one.'
        } else if (errorText.includes('Invalid login credentials')) {
          errorMessage = 'Invalid credentials. Please check your email and password.'
        } else if (errorText.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the verification link.'
        } else if (errorText.includes('expired')) {
          errorMessage = 'The verification link has expired. Please request a new one.'
        } else if (errorText.includes('invalid')) {
          errorMessage = 'The verification link is invalid. Please request a new one.'
        }
        
        setError(errorMessage)
        setStatus('error')
        toast.error(errorMessage)
        
        setTimeout(() => {
          navigate('/start', { replace: true })
        }, 3000)
      }
    }

    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (status === 'loading') {
        console.log('AuthCallback: Timeout reached, redirecting to start')
        setStatus('error')
        setError('Authentication timed out. Please try again.')
        setTimeout(() => {
          navigate('/start', { replace: true })
        }, 2000)
      }
    }, 20000) // 20 second timeout

    handleAuthCallback()

    return () => clearTimeout(timeout)
  }, [navigate, status])

  if (status === 'loading') {
    return (
      <div className="auth-callback-container">
        <Loader size={40} className="auth-callback-icon" />
        <h2 className="auth-callback-title">
          Signing you in...
        </h2>
        <p className="auth-callback-message">
          Please wait while we complete your authentication.
        </p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="auth-callback-container">
        <AlertCircle size={40} className="auth-callback-icon error" />
        <h2 className="auth-callback-title error">
          Authentication Failed
        </h2>
        <p className="auth-callback-message">
          {error}
        </p>
        <button 
          onClick={() => navigate('/start')}
          className="btn btn-primary"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="auth-callback-container">
      <CheckCircle size={40} className="auth-callback-icon success" />
      <h2 className="auth-callback-title success">
        Success!
      </h2>
      <p className="auth-callback-message">
        Redirecting you now...
      </p>
    </div>
  )
}