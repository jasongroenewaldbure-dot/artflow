import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { profileSyncService } from '@/services/profileSync'
import toast from 'react-hot-toast'
import { Loader, CheckCircle, AlertCircle } from 'lucide-react'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (status === 'loading') {
        console.error('AuthCallback: Timeout reached')
        setStatus('error')
        setError('Authentication timed out. Please try again.')
        setTimeout(() => {
          navigate('/start', { replace: true })
        }, 2000)
      }
    }, 10000) // 10 second timeout

    const handleAuthCallback = async () => {
      try {
        setStatus('loading')
        console.log('AuthCallback: Starting auth callback handling')
        
        // Get URL parameters
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const error = hashParams.get('error')
        const errorDescription = hashParams.get('error_description')

        console.log('AuthCallback: URL params:', { 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken, 
          error, 
          errorDescription 
        })

        // Handle errors first
        if (error) {
          console.error('AuthCallback: Error in URL params:', error, errorDescription)
          
          if (error === 'access_denied') {
            throw new Error('Access was denied. Please try again.')
          } else if (error === 'server_error') {
            throw new Error('Server error occurred. Please try again later.')
          } else if (errorDescription?.includes('expired')) {
            throw new Error('The verification link has expired. Please request a new one.')
          } else if (errorDescription?.includes('invalid')) {
            throw new Error('The verification link is invalid. Please request a new one.')
          } else {
            throw new Error(errorDescription || error)
          }
        }

        // Set session if we have tokens
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
        }

        // Get the current user
        console.log('AuthCallback: Getting current user')
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          console.error('AuthCallback: User error:', userError)
          throw userError
        }
        
        if (!user) {
          console.error('AuthCallback: No user found')
          throw new Error('No user found after authentication')
        }
        
        console.log('AuthCallback: Found user:', user.id, user.email)

        // Get selected role from URL params or sessionStorage
        const selectedRole = searchParams.get('role') as 'artist' | 'collector' | 'both' | null ||
                            sessionStorage.getItem('selectedRole') as 'artist' | 'collector' | 'both' | null
        
        // Clear the role from sessionStorage
        if (sessionStorage.getItem('selectedRole')) {
          sessionStorage.removeItem('selectedRole')
        }

        // Check if profile exists
        console.log('AuthCallback: Checking profile for user:', user.id)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, role, display_name, full_name, created_at')
          .eq('id', user.id)
          .single()

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('AuthCallback: Profile error:', profileError)
          throw profileError
        }

        console.log('AuthCallback: Profile found:', !!profile)

        // If no profile exists, create one
        if (!profile) {
          console.log('AuthCallback: Creating new profile')
          
          // Set the role in user metadata before syncing
          const userWithRole = {
            ...user,
            app_metadata: {
              ...user.app_metadata,
              role: selectedRole || 'collector'
            }
          }

          const syncedProfile = await profileSyncService.syncUserProfile(userWithRole)
          
          if (!syncedProfile) {
            console.error('AuthCallback: Failed to create profile')
            throw new Error('Failed to create user profile')
          }
          
          console.log('AuthCallback: Profile created successfully')
          
          // Redirect new users to onboarding
          setStatus('success')
          toast.success('Welcome! Let\'s set up your profile.')
          navigate('/onboarding', { replace: true })
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
        const needsPassword = user.user_metadata?.password_set || profile?.password_set || false
        const needsOnboarding = !profile?.profile_completed || !profile?.onboarding_completed || !needsPassword

        if (needsOnboarding) {
          console.log('AuthCallback: User needs onboarding')
          setStatus('success')
          toast.success('Please complete your profile setup.')
          navigate('/onboarding', { replace: true })
          return
        }

        // User is fully set up
        console.log('AuthCallback: User is fully set up, redirecting to dashboard')
        setStatus('success')
        toast.success('Successfully signed in!')
        navigate('/u/dashboard', { replace: true })

      } catch (error: any) {
        console.error('Auth callback error:', error)
        
        let errorMessage = 'An error occurred during authentication. Please try again.'
        
        if (error.message?.includes('Email link is invalid or has expired')) {
          errorMessage = 'The verification link has expired. Please request a new one.'
        } else if (error.message?.includes('Invalid login credentials')) {
          errorMessage = 'Invalid credentials. Please check your email and password.'
        } else if (error.message?.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the verification link.'
        } else if (error.message?.includes('expired')) {
          errorMessage = 'The verification link has expired. Please request a new one.'
        } else if (error.message?.includes('invalid')) {
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

    handleAuthCallback()
    
    return () => clearTimeout(timeoutId)
  }, [navigate, searchParams, status])

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