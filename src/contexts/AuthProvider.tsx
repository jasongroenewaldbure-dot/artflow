import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { User } from '@supabase/supabase-js'
import { profileSyncService, UserProfile } from '../services/profileSync'

interface Profile {
  id: string
  email: string
  role: 'artist' | 'collector' | 'both'
  display_name: string
  avatar_url?: string
  profile_completed?: boolean
  password_set?: boolean
  onboarding_completed?: boolean
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithMagicLink: (email: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    try {
      // First, get the current user from auth.users to check their status
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.warn('Failed to get auth user:', authError)
        return null
      }

      if (!authUser) {
        console.warn('No authenticated user found')
        return null
      }

      // Then get the profile from profiles table using user_id
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('display_name, full_name, role, avatar_url, created_at')
        .eq('id', userId)
        .single()
      
      if (error) {
        console.warn('Failed to fetch profile:', error)
        return null
      }
      
      return {
        id: userId,
        email: authUser.email || '',
        role: profileData.role || 'collector',
        display_name: profileData.display_name || profileData.full_name || authUser.email || 'User',
        full_name: profileData.full_name || authUser.email || 'User',
        avatar_url: profileData.avatar_url,
        created_at: profileData.created_at
      }
    } catch (error) {
      console.warn('Error fetching profile:', error)
      return null
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const currentUser = session?.user ?? null
        setUser(currentUser)
        
        if (currentUser) {
          const userProfile = await fetchProfile(currentUser.id)
          setProfile(userProfile)
        } else {
          setProfile(null)
        }
      } catch (error) {
        console.warn('Supabase auth not available:', error)
        setUser(null)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          const currentUser = session?.user ?? null
          setUser(currentUser)
          
          if (currentUser) {
            const userProfile = await fetchProfile(currentUser.id)
            setProfile(userProfile)
          } else {
            setProfile(null)
          }
          
          setLoading(false)
        }
      )

      return () => subscription.unsubscribe()
    } catch (error) {
      console.warn('Supabase auth listener not available:', error)
      setLoading(false)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
    } catch (error) {
      console.warn('Supabase signIn not available:', error)
      throw new Error('Authentication service not available. Please check your Supabase configuration.')
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error
    } catch (error) {
      console.warn('Supabase signUp not available:', error)
      throw new Error('Authentication service not available. Please check your Supabase configuration.')
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.warn('Supabase signOut not available:', error)
      // Still set user to null even if signOut fails
      setUser(null)
      setProfile(null)
    }
  }

  const signInWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        shouldCreateUser: true, // Allow new users to be created
      },
    })
    if (error) throw error
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) throw error
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithMagicLink,
    resetPassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
