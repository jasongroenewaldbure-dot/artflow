import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthProvider'
import Container from '../../components/ui/Container'
import { showErrorToast, showSuccessToast } from '../../utils/errorHandling'
import Icon from '../../components/icons/Icon'

interface UserPreferences {
  id?: string
  user_id: string
  preferred_mediums: string[]
  preferred_styles: string[]
  min_budget: number | null
  max_budget: number | null
  notification_preferences: {
    email: boolean
    push: boolean
    sms: boolean
  }
  privacy_settings: {
    profile_visibility: 'public' | 'private' | 'friends'
    show_collection: boolean
    show_favorites: boolean
  }
  created_at?: string
  updated_at?: string
}

const SettingsPage: React.FC = () => {
  const { user, profile, updateProfile } = useAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'notifications' | 'privacy' | 'security' | 'account'>('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Profile settings
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [website, setWebsite] = useState('')
  
  // Account settings
  const [currentRole, setCurrentRole] = useState('')
  
  // Preferences
  const [preferences, setPreferences] = useState<UserPreferences>({
    user_id: user?.id || '',
    preferred_mediums: [],
    preferred_styles: [],
    min_budget: null,
    max_budget: null,
    notification_preferences: {
      email: true,
      push: true,
      sms: false
    },
    privacy_settings: {
      profile_visibility: 'public',
      show_collection: true,
      show_favorites: true
    }
  })

  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    try {
      setLoading(true)
      
      // Load profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('display_name, bio, location, website, role')
        .eq('user_id', user?.id)
        .single()

      if (profileData) {
        setDisplayName(profileData.display_name || '')
        setBio(profileData.bio || '')
        setLocation(profileData.location || '')
        setWebsite(profileData.website || '')
        setCurrentRole(profileData.role || '')
      }

      // Load preferences
      const { data: userPrefs } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (userPrefs) {
        setPreferences({
          ...preferences,
          ...userPrefs,
          preferred_mediums: userPrefs.preferred_mediums || [],
          preferred_styles: userPrefs.preferred_styles || [],
          min_budget: userPrefs.min_budget,
          max_budget: userPrefs.max_budget,
          notification_preferences: userPrefs.notification_preferences || preferences.notification_preferences,
          privacy_settings: userPrefs.privacy_settings || preferences.privacy_settings
        })
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      showErrorToast('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setSaving(true)
      
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          bio: bio,
          location: location,
          website: website,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user?.id)

      if (error) throw error
      showSuccessToast('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      showErrorToast('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleSavePreferences = async () => {
    try {
      setSaving(true)
      
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user?.id,
          preferred_mediums: preferences.preferred_mediums,
          preferred_styles: preferences.preferred_styles,
          min_budget: preferences.min_budget,
          max_budget: preferences.max_budget,
          notification_preferences: preferences.notification_preferences,
          privacy_settings: preferences.privacy_settings,
          updated_at: new Date().toISOString()
        })

      if (error) throw error
      showSuccessToast('Preferences updated successfully')
    } catch (error) {
      console.error('Error updating preferences:', error)
      showErrorToast('Failed to update preferences')
    } finally {
      setSaving(false)
    }
  }

  const handleRoleChange = async (newRole: string) => {
    try {
      setSaving(true)
      
      const { error } = await supabase
        .from('profiles')
        .update({
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user?.id)

      if (error) throw error
      
      setCurrentRole(newRole)
      if (updateProfile) {
        updateProfile({ ...profile, role: newRole })
      }
      
      showSuccessToast(`Role changed to ${newRole} successfully`)
    } catch (error) {
      console.error('Error changing role:', error)
      showErrorToast('Failed to change role')
    } finally {
      setSaving(false)
    }
  }

  const handleMediumChange = (medium: string, checked: boolean) => {
    if (checked) {
      setPreferences(prev => ({
        ...prev,
        preferred_mediums: [...prev.preferred_mediums, medium]
      }))
    } else {
      setPreferences(prev => ({
        ...prev,
        preferred_mediums: prev.preferred_mediums.filter(m => m !== medium)
      }))
    }
  }

  const handleStyleChange = (style: string, checked: boolean) => {
    if (checked) {
      setPreferences(prev => ({
        ...prev,
        preferred_styles: [...prev.preferred_styles, style]
      }))
    } else {
      setPreferences(prev => ({
        ...prev,
        preferred_styles: prev.preferred_styles.filter(s => s !== style)
      }))
    }
  }

  const availableMediums = [
    'Oil on Canvas', 'Acrylic on Canvas', 'Watercolor', 'Mixed Media',
    'Digital Art', 'Photography', 'Sculpture', 'Drawing', 'Print'
  ]

  const availableStyles = [
    'Abstract', 'Realism', 'Contemporary', 'Impressionist', 'Expressionist',
    'Minimalist', 'Pop Art', 'Surrealist', 'Cubist', 'Landscape'
  ]

  if (loading) {
    return (
      <Container>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <Helmet>
        <title>Settings | ArtFlow</title>
      </Helmet>

      <div className="py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account and preferences</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'profile', label: 'Profile', icon: 'user' },
            { id: 'preferences', label: 'Preferences', icon: 'settings' },
            { id: 'notifications', label: 'Notifications', icon: 'bell' },
            { id: 'privacy', label: 'Privacy', icon: 'shield' },
            { id: 'account', label: 'Account', icon: 'settings' },
            { id: 'security', label: 'Security', icon: 'lock' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon name={tab.icon} size={20} className="mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us about yourself..."
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Art Preferences</h2>
            
            <div className="space-y-6">
              {/* Budget Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Budget Range (ZAR)</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Minimum</label>
                    <input
                      type="number"
                      value={preferences.min_budget || ''}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        min_budget: e.target.value ? parseFloat(e.target.value) : null
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Maximum</label>
                    <input
                      type="number"
                      value={preferences.max_budget || ''}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        max_budget: e.target.value ? parseFloat(e.target.value) : null
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="100000"
                    />
                  </div>
                </div>
              </div>

              {/* Preferred Mediums */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Preferred Mediums</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableMediums.map((medium) => (
                    <label key={medium} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferences.preferred_mediums.includes(medium)}
                        onChange={(e) => handleMediumChange(medium, e.target.checked)}
                        className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{medium}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Preferred Styles */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Preferred Styles</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableStyles.map((style) => (
                    <label key={style} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferences.preferred_styles.includes(style)}
                        onChange={(e) => handleStyleChange(style, e.target.checked)}
                        className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{style}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                onClick={handleSavePreferences}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Preferences</h2>
            
            <div className="space-y-4">
              {[
                { key: 'email', label: 'Email Notifications', description: 'Receive updates via email' },
                { key: 'push', label: 'Push Notifications', description: 'Receive browser notifications' },
                { key: 'sms', label: 'SMS Notifications', description: 'Receive text message updates' }
              ].map((notification) => (
                <div key={notification.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{notification.label}</h3>
                    <p className="text-sm text-gray-500">{notification.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.notification_preferences[notification.key as keyof typeof preferences.notification_preferences]}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        notification_preferences: {
                          ...prev.notification_preferences,
                          [notification.key]: e.target.checked
                        }
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <button
                onClick={handleSavePreferences}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Notifications'}
              </button>
            </div>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Privacy Settings</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Profile Visibility</label>
                <select
                  value={preferences.privacy_settings.profile_visibility}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    privacy_settings: {
                      ...prev.privacy_settings,
                      profile_visibility: e.target.value as 'public' | 'private' | 'friends'
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="public">Public - Anyone can see your profile</option>
                  <option value="friends">Friends - Only people you follow can see your profile</option>
                  <option value="private">Private - Only you can see your profile</option>
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Show Collection</h3>
                    <p className="text-sm text-gray-500">Allow others to see your purchased artworks</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.privacy_settings.show_collection}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        privacy_settings: {
                          ...prev.privacy_settings,
                          show_collection: e.target.checked
                        }
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Show Favorites</h3>
                    <p className="text-sm text-gray-500">Allow others to see your favorited artworks</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.privacy_settings.show_favorites}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        privacy_settings: {
                          ...prev.privacy_settings,
                          show_favorites: e.target.checked
                        }
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                onClick={handleSavePreferences}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Privacy Settings'}
              </button>
            </div>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === 'account' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Settings</h2>
            
            <div className="space-y-6">
              {/* Role Change */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Account Role</label>
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center">
                      <Icon name="info" size={20} className="text-blue-600 mr-3 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-blue-800">Current Role: {currentRole}</h3>
                        <p className="text-sm text-blue-700 mt-1">
                          Your role determines which features and pages you can access. You can change your role at any time.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { value: 'artist', label: 'Artist', description: 'Create and sell artwork' },
                      { value: 'collector', label: 'Collector', description: 'Discover and purchase art' },
                      { value: 'both', label: 'Both', description: 'Artist and collector features' }
                    ].map((role) => (
                      <div key={role.value} className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        currentRole === role.value 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <div className="flex items-center mb-2">
                          <input
                            type="radio"
                            name="role"
                            value={role.value}
                            checked={currentRole === role.value}
                            onChange={() => handleRoleChange(role.value)}
                            className="mr-3 text-blue-600 focus:ring-blue-500"
                          />
                          <h3 className="text-sm font-medium text-gray-900">{role.label}</h3>
                        </div>
                        <p className="text-sm text-gray-500 ml-6">{role.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                    <p className="text-sm text-gray-500 font-mono bg-gray-50 p-2 rounded">{user?.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Created</label>
                    <p className="text-sm text-gray-500">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Sign In</label>
                    <p className="text-sm text-gray-500">{user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Security</h2>
            
            <div className="space-y-6">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex">
                  <Icon name="alert-triangle" size={20} className="text-yellow-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">Security Features Coming Soon</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Password changes, two-factor authentication, and other security features will be available soon.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Change Password</h3>
                    <p className="text-sm text-gray-500">Update your account password</p>
                  </div>
                  <button
                    disabled
                    className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed"
                  >
                    Coming Soon
                  </button>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <button
                    disabled
                    className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed"
                  >
                    Coming Soon
                  </button>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Active Sessions</h3>
                    <p className="text-sm text-gray-500">Manage your active login sessions</p>
                  </div>
                  <button
                    disabled
                    className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed"
                  >
                    Coming Soon
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Container>
  )
}

export default SettingsPage
