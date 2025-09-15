import React, { useEffect, useState, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { generateUniqueSlugWithRandom } from '../utils/slug'
import { User, Palette, Heart, ArrowRight, CheckCircle, AlertCircle, Loader, Sparkles } from 'lucide-react'
import LocationSearch from '../components/LocationSearch'
import toast from 'react-hot-toast'

interface ProfileData {
  name: string
  role: 'ARTIST' | 'COLLECTOR' | 'BOTH'
  bio?: string
  statement?: string
  location?: string
  website?: string
  instagram?: string
}

interface ValidationErrors {
  name?: string
  bio?: string
  statement?: string
  website?: string
  instagram?: string
  location?: string
}

const Onboarding: React.FC = () => {
  const [step, setStep] = useState<'password' | 'role' | 'profile' | 'preferences' | 'complete'>('password')
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    role: 'COLLECTOR',
    location: 'South Africa' // Default to South Africa
  })
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [loading, setLoading] = useState(false)
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false)
  const [user, setUser] = useState<any>(null)
  const navigate = useNavigate()

  // Check if user is authenticated and get current profile
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) throw error
        
        if (!user) {
          navigate('/start', { replace: true })
          return
        }

        setUser(user)

        // Check if profile already exists and is complete (using user_id, not id)
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, display_name, role, slug, bio, location, created_at')
          .eq('id', user.id)
          .single()

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError
        }

        if (existingProfile && existingProfile.full_name && existingProfile.profile_completed && existingProfile.onboarding_completed) {
          // Profile already complete, redirect to dashboard
          navigate('/u/dashboard', { replace: true })
          return
        }

        // Always check if user needs to set up password (for magic link users)
        const hasPassword = user.user_metadata?.password_set || existingProfile?.password_set || false
        
        // Force password setup if not set
        if (!hasPassword) {
          setStep('password')
        } else if (!existingProfile?.full_name) {
          setStep('role')
        } else if (!existingProfile?.profile_completed) {
          setStep('profile')
        } else if (!existingProfile?.onboarding_completed) {
          // Check if user needs preferences or can complete onboarding
          if (existingProfile.role === 'collector' || existingProfile.role === 'both') {
            setStep('preferences')
          } else {
            setStep('complete')
          }
        }

        // Pre-fill with existing data if available
        if (existingProfile) {
          setProfileData(prev => ({
            ...prev,
            name: existingProfile.full_name || '',
            role: existingProfile.role || 'collector',
            bio: existingProfile.bio || '',
            statement: '', // This field doesn't exist in the new schema
            location: existingProfile.location || 'South Africa'
          }))
        }
      } catch (error: any) {
        console.error('Auth check failed:', error)
        toast.error('Failed to verify authentication. Please try again.')
        navigate('/start', { replace: true })
      }
    }

    checkAuth()
  }, [navigate])

  // Generate unique slug when name changes
  const generateSlug = useCallback(async (name: string) => {
    if (!name.trim()) return

    setIsGeneratingSlug(true)
    try {
      // Get existing artist slugs
      const { data: existingSlugs, error } = await supabase
        .from('profiles')
        .select('slug')
        .not('slug', 'is', null)
      
      if (error) throw error

      const slugs = existingSlugs?.map(p => p.slug) || []
      const newSlug = generateUniqueSlugWithRandom(name, slugs)
      
      return newSlug
    } catch (error: any) {
      console.error('Slug generation failed:', error)
      toast.error('Failed to generate profile URL. Please try again.')
      return null
    } finally {
      setIsGeneratingSlug(false)
    }
  }, [])

  // Validation functions
  const validateName = (name: string): string | undefined => {
    if (!name.trim()) return 'Name is required'
    if (name.trim().length < 2) return 'Name must be at least 2 characters'
    if (name.trim().length > 100) return 'Name must be less than 100 characters'
    if (!/^[a-zA-Z\s\-'\.]+$/.test(name.trim())) return 'Name contains invalid characters'
    return undefined
  }

  const validateBio = (bio: string): string | undefined => {
    if (bio && bio.length > 500) return 'Bio must be less than 500 characters'
    return undefined
  }

  const validateStatement = (statement: string): string | undefined => {
    if (statement && statement.length > 1000) return 'Artist statement must be less than 1000 characters'
    return undefined
  }

  const validateWebsite = (website: string): string | undefined => {
    if (!website) return undefined
    const urlPattern = /^https?:\/\/.+\..+/
    if (!urlPattern.test(website)) return 'Please enter a valid website URL'
    return undefined
  }

  const validateInstagram = (instagram: string): string | undefined => {
    if (!instagram) return undefined
    const instagramPattern = /^@?[a-zA-Z0-9._]+$/
    if (!instagramPattern.test(instagram)) return 'Please enter a valid Instagram username'
    return undefined
  }

  const validateLocation = (location: string): string | undefined => {
    if (!location.trim()) return 'Location is required'
    if (location.trim().length < 2) return 'Please select a valid location'
    return undefined
  }

  const handlePasswordSetup = async () => {
    if (!passwordData.password || !passwordData.confirmPassword) {
      toast.error('Please fill in all password fields')
      return
    }

    if (passwordData.password !== passwordData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (passwordData.password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    setLoading(true)
    try {
      if (!user) throw new Error('User not authenticated')

      // Update user password
      const { error } = await supabase.auth.updateUser({
        password: passwordData.password
      })

      if (error) throw error

      // Mark password as set in user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { password_set: true }
      })

      if (metadataError) {
        console.warn('Failed to update user metadata:', metadataError)
      }

      // Also update the profile to mark password as set
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          password_set: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (profileError) {
        console.warn('Failed to update profile password_set:', profileError)
      }

      toast.success('Password set successfully!')
      setStep('role')
    } catch (error: any) {
      console.error('Password setup failed:', error)
      toast.error(error.message || 'Failed to set password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const validateStep = (stepName: 'password' | 'role' | 'profile' | 'preferences' | 'complete'): boolean => {
    const newErrors: ValidationErrors = {}

    if (stepName === 'profile') {
      const nameError = validateName(profileData.name)
      if (nameError) newErrors.name = nameError

      const locationError = validateLocation(profileData.location || '')
      if (locationError) newErrors.location = locationError

      if (profileData.role === 'ARTIST' || profileData.role === 'BOTH') {
        const bioError = validateBio(profileData.bio || '')
        if (bioError) newErrors.bio = bioError

        const statementError = validateStatement(profileData.statement || '')
        if (statementError) newErrors.statement = statementError
      }

      const websiteError = validateWebsite(profileData.website || '')
      if (websiteError) newErrors.website = websiteError

      const instagramError = validateInstagram(profileData.instagram || '')
      if (instagramError) newErrors.instagram = instagramError
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRoleSelection = (role: 'ARTIST' | 'COLLECTOR' | 'BOTH') => {
    setProfileData(prev => ({ ...prev, role }))
    setStep('profile')
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep('profile')) {
      toast.error('Please fix the errors below')
      return
    }

    setLoading(true)
    try {
      if (!user) throw new Error('User not authenticated')

      // Generate unique slug
      const slug = await generateSlug(profileData.name)
      if (!slug) {
        throw new Error('Failed to generate profile URL')
      }

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: profileData.name.trim(),
          display_name: profileData.name.trim(),
          role: profileData.role,
          slug,
          bio: profileData.bio?.trim() || null,
          location: profileData.location?.trim() || null,
          website: profileData.website?.trim() || null,
          social_links: {
            instagram: profileData.instagram?.trim() || null
          },
          profile_completed: true,
          onboarding_completed: false, // Will be set to true when onboarding is complete
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })

      if (error) throw error

      toast.success('Profile saved successfully!')
      
      // Determine next step based on role
      if (profileData.role === 'COLLECTOR') {
        setStep('preferences')
      } else if (profileData.role === 'ARTIST') {
        setStep('complete')
      } else { // BOTH
        setStep('preferences') // Start with collector preferences, then artist setup
      }
    } catch (error: any) {
      console.error('Profile save failed:', error)
      toast.error(error.message || 'Failed to save profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSkipPreferences = async () => {
    try {
      if (!user) throw new Error('User not authenticated')

      // Mark onboarding as completed
      const { error } = await supabase
        .from('profiles')
        .update({ 
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      toast.success('Welcome to ArtFlow!')
      navigate('/u/dashboard', { replace: true })
    } catch (error: any) {
      console.error('Failed to complete onboarding:', error)
      toast.error('Failed to complete onboarding. Please try again.')
    }
  }

  const handleCompleteOnboarding = async () => {
    try {
      if (!user) throw new Error('User not authenticated')

      // Mark onboarding as completed
      const { error } = await supabase
        .from('profiles')
        .update({ 
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      toast.success('Welcome to ArtFlow!')
      navigate('/u/dashboard', { replace: true })
    } catch (error: any) {
      console.error('Failed to complete onboarding:', error)
      toast.error('Failed to complete onboarding. Please try again.')
    }
  }

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field as keyof ValidationErrors]: undefined }))
    }
  }

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '32px 16px'
    }}>
      <Helmet>
        <title>Complete Your Profile | ArtFlow</title>
      </Helmet>

      <div style={{
        maxWidth: '672px',
        margin: '0 auto'
      }}>
        {/* Progress indicator */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '500',
                backgroundColor: step === 'password' ? '#2563eb' : 
                  ['role', 'profile', 'preferences', 'complete'].includes(step) ? '#dbeafe' : '#e5e7eb',
                color: step === 'password' ? 'white' : 
                  ['role', 'profile', 'preferences', 'complete'].includes(step) ? '#2563eb' : '#6b7280'
              }}>
                1
              </div>
              <span style={{
                fontSize: '14px',
                fontWeight: '500',
                color: step === 'password' ? '#2563eb' : 
                  ['role', 'profile', 'preferences', 'complete'].includes(step) ? '#2563eb' : '#6b7280'
              }}>
                {step === 'password' ? 'Set Password' : 'Password'}
              </span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-4"></div>
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'role' ? 'bg-blue-600 text-white' : 
                ['profile', 'preferences', 'complete'].includes(step) ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
              <span className={`text-sm font-medium ${
                step === 'role' ? 'text-blue-600' : 
                ['profile', 'preferences', 'complete'].includes(step) ? 'text-green-600' : 'text-gray-500'
              }`}>
                Role
              </span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-4"></div>
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'profile' ? 'bg-blue-600 text-white' : 
                ['preferences', 'complete'].includes(step) ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                3
              </div>
              <span className={`text-sm font-medium ${
                step === 'profile' ? 'text-blue-600' : 
                ['preferences', 'complete'].includes(step) ? 'text-green-600' : 'text-gray-500'
              }`}>
                Profile
              </span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-4"></div>
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'preferences' ? 'bg-blue-600 text-white' : 
                step === 'complete' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                4
              </div>
              <span className={`text-sm font-medium ${
                step === 'preferences' ? 'text-blue-600' : 
                step === 'complete' ? 'text-green-600' : 'text-gray-500'
              }`}>
                {profileData.role === 'COLLECTOR' ? 'Preferences' : 'Complete'}
              </span>
            </div>
          </div>
        </div>

        {/* Password Setup Step */}
        {step === 'password' && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Set Your Password</h1>
              <p className="text-gray-600">Create a secure password for your ArtFlow account</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handlePasswordSetup(); }} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={passwordData.password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
                <p className="mt-1 text-sm text-gray-500">Password must be at least 6 characters long</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirm your password"
                  required
                />
              </div>

              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Setting Password...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Role Selection Step */}
        {step === 'role' && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to ArtFlow</h1>
              <p className="text-gray-600">Let's get to know you better. What brings you here?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => handleRoleSelection('ARTIST')}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left group"
              >
                <div className="flex flex-col items-center text-center">
                  <Palette className="w-12 h-12 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Artist</h3>
                  <p className="text-sm text-gray-600">Showcase your work, build your portfolio, and connect with collectors</p>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelection('COLLECTOR')}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left group"
              >
                <div className="flex flex-col items-center text-center">
                  <Heart className="w-12 h-12 text-red-600 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Collector</h3>
                  <p className="text-sm text-gray-600">Discover amazing art, build your collection, and support artists</p>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelection('BOTH')}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left group"
              >
                <div className="flex flex-col items-center text-center">
                  <User className="w-12 h-12 text-purple-600 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Both</h3>
                  <p className="text-sm text-gray-600">Create art and collect pieces from other talented artists</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Profile Setup Step */}
        {step === 'profile' && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Complete Your Profile</h1>
              <p className="text-gray-600">Tell us about yourself so others can discover your work</p>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                  required
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Location - Searchable */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <LocationSearch
                  value={profileData.location || ''}
                  onChange={(location) => handleInputChange('location', location)}
                  placeholder="Search for your location..."
                  error={errors.location}
                  required
                />
              </div>

              {/* Bio (for artists) */}
              {(profileData.role === 'ARTIST' || profileData.role === 'BOTH') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={profileData.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.bio ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Tell us about yourself and your artistic journey..."
                    rows={4}
                  />
                  {errors.bio && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.bio}
                    </p>
                  )}
                </div>
              )}

              {/* Artist Statement (for artists) */}
              {(profileData.role === 'ARTIST' || profileData.role === 'BOTH') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Artist Statement
                  </label>
                  <textarea
                    value={profileData.statement || ''}
                    onChange={(e) => handleInputChange('statement', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.statement ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Describe your artistic vision, inspiration, and creative process..."
                    rows={4}
                  />
                  {errors.statement && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.statement}
                    </p>
                  )}
                </div>
              )}

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={profileData.website || ''}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.website ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="https://yourwebsite.com"
                />
                {errors.website && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.website}
                  </p>
                )}
              </div>

              {/* Instagram */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instagram
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">@</span>
                  </div>
                  <input
                    type="text"
                    value={profileData.instagram || ''}
                    onChange={(e) => handleInputChange('instagram', e.target.value)}
                    className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.instagram ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="username"
                  />
                </div>
                {errors.instagram && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.instagram}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  disabled={loading || isGeneratingSlug}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : isGeneratingSlug ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Generating URL...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
      </form>
          </div>
        )}

        {/* Preferences Step (for collectors) */}
        {step === 'preferences' && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Help Us Personalize Your Experience</h1>
              <p className="text-gray-600">Tell us about your art preferences so we can show you the most relevant pieces</p>
            </div>

            <div className="text-center">
              <div className="mb-6">
                <Sparkles className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Collector Preferences Quiz</h3>
                <p className="text-gray-600 mb-6">This will help us recommend artworks you'll love</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/collector-quiz')}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                >
                  <span>Start Quiz</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSkipPreferences}
                  className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Skip for Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Complete Step */}
        {step === 'complete' && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="mb-8">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to ArtFlow!</h1>
              <p className="text-gray-600">Your profile is complete and you're ready to start exploring amazing art</p>
            </div>

            <button
              onClick={handleCompleteOnboarding}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2 mx-auto"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Onboarding
