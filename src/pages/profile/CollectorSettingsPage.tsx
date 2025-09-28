import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { 
  User, Mail, Lock, Bell, CreditCard, Download, Trash2, Eye, EyeOff,
  Brain, Palette, TrendingUp, BarChart3, Target, Sparkles, MapPin,
  Heart, ShoppingBag, Clock, Settings as SettingsIcon, Camera, Mic,
  Globe, Zap, Shield, FileText, HelpCircle, LogOut
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthProvider'
import Container from "../../brush/components/forms/Container"
import { LivePreferenceControls, LivePreferences } from '../../brush/components'
import { showErrorToast, showSuccessToast } from '../../utils/errorHandling'

interface CollectorProfile {
  id: string
  full_name: string
  display_name: string
  email: string
  location: string
  bio: string
  avatar_url: string
  collecting_since: string
  budget_range: { min: number; max: number }
  preferred_mediums: string[]
  preferred_styles: string[]
  notification_preferences: {
    email_newsletters: boolean
    price_alerts: boolean
    new_artist_works: boolean
    auction_reminders: boolean
    collection_insights: boolean
  }
  privacy_settings: {
    profile_visibility: 'public' | 'private' | 'collectors_only'
    collection_visibility: 'public' | 'private' | 'collectors_only'
    show_purchase_history: boolean
    allow_artist_contact: boolean
  }
}

interface AILearnings {
  taste_confidence: number
  total_interactions: number
  recommendation_accuracy: number
  discovery_success_rate: number
  learning_velocity: number
  preferred_mediums: Array<{ medium: string; confidence: number; frequency: number }>
  preferred_styles: Array<{ style: string; confidence: number; frequency: number }>
  color_preferences: Array<{ color: string; hex: string; oklch: any; frequency: number }>
  price_patterns: {
    average_interest: number
    range_confidence: number
    price_sensitivity: number
    budget_adherence: number
  }
  behavioral_insights: {
    browsing_peak_hours: string[]
    session_duration_avg: number
    decision_making_speed: 'fast' | 'moderate' | 'slow'
    research_depth: 'surface' | 'moderate' | 'deep'
    social_influence_factor: number
  }
  market_intelligence: {
    collection_gaps: string[]
    investment_opportunities: Array<{ artist: string; confidence: number; reasoning: string }>
    optimal_buying_times: string[]
    budget_optimization_suggestions: string[]
  }
}

const CollectorSettingsPage: React.FC = () => {
  const { user, profile, updateProfile } = useAuth()
  const [collectorProfile, setCollectorProfile] = useState<CollectorProfile | null>(null)
  const [aiLearnings, setAILearnings] = useState<AILearnings | null>(null)
  const [preferences, setPreferences] = useState<LivePreferences>()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeSection, setActiveSection] = useState<'profile' | 'preferences' | 'ai-insights' | 'notifications' | 'privacy' | 'security' | 'billing'>('profile')

  useEffect(() => {
    if (user) {
      loadCollectorData()
    }
  }, [user])

  const loadCollectorData = async () => {
    try {
      setIsLoading(true)
      
      // Load collector profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      // Load AI learnings
      const { data: learningsData } = await supabase
        .from('collector_ai_learnings')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      // Load preferences
      const { data: preferencesData } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (profileData) {
        setCollectorProfile(profileData)
      }

      if (learningsData) {
        setAILearnings(learningsData)
      }

      if (preferencesData?.live_preferences) {
        setPreferences(preferencesData.live_preferences as any)
      }

    } catch (error) {
      console.error('Error loading collector data:', error)
      showErrorToast('Failed to load collector data')
    } finally {
      setIsLoading(false)
    }
  }

  const saveProfile = async (updates: Partial<CollectorProfile>) => {
    try {
      setIsSaving(true)
      
      await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user?.id)

      await updateProfile(updates)
      setCollectorProfile(prev => prev ? { ...prev, ...updates } : null)
      showSuccessToast('Profile updated successfully')

    } catch (error) {
      console.error('Error saving profile:', error)
      showErrorToast('Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  const exportAllData = async () => {
    try {
      const exportData = {
        profile: collectorProfile,
        aiLearnings: aiLearnings,
        preferences: preferences,
        metadata: {
          exportedAt: new Date().toISOString(),
          version: '2.0',
          platform: 'ArtFlow'
        }
      }
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `artflow-collector-complete-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      
      showSuccessToast('Data exported successfully')
    } catch (error) {
      showErrorToast('Failed to export data')
    }
  }

  const resetAILearning = async () => {
    if (!confirm('This will reset all AI learning about your preferences. This action cannot be undone. Continue?')) {
      return
    }
    
    try {
      await Promise.all([
        supabase.from('user_bandit_models').delete().eq('user_id', user?.id),
        supabase.from('bandit_interactions').delete().eq('user_id', user?.id),
        supabase.from('collector_ai_learnings').delete().eq('user_id', user?.id),
        supabase.from('artwork_views').delete().eq('viewer_id', user?.id),
        supabase.from('artwork_saves').delete().eq('user_id', user?.id)
      ])
      
      await loadCollectorData()
      showSuccessToast('AI learning reset successfully')
    } catch (error) {
      showErrorToast('Failed to reset AI learning')
    }
  }

  if (!user) {
    return (
      <Container>
        <div className="auth-required">
          <User size={48} />
          <h2>Authentication Required</h2>
          <p>Please sign in to access your collector settings</p>
        </div>
      </Container>
    )
  }

  if (isLoading) {
    return (
      <Container>
        <div className="loading-state">
          <Brain size={48} className="loading-icon" />
          <h2>Loading Your Collector Intelligence...</h2>
          <p>Gathering your AI learnings and preferences</p>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <Helmet>
        <title>Collector Settings & AI Intelligence - ArtFlow</title>
        <meta name="description" content="Comprehensive collector settings with AI learnings, preferences, and intelligence insights" />
      </Helmet>

      <div className="collector-settings-page">
        {/* Header */}
        <div className="settings-header">
          <div className="header-main">
            <div className="profile-summary">
              <div className="avatar-section">
                {collectorProfile?.avatar_url ? (
                  <img src={collectorProfile.avatar_url} alt="Profile" className="profile-avatar" />
                ) : (
                  <div className="avatar-placeholder">
                    <User size={32} />
                  </div>
                )}
                <button className="change-avatar-btn">
                  <Camera size={16} />
                  Change Photo
                </button>
              </div>
              
              <div className="profile-info">
                <h1>{collectorProfile?.display_name || collectorProfile?.full_name || 'Collector'}</h1>
                <p className="profile-subtitle">
                  {collectorProfile?.location && (
                    <span><MapPin size={14} /> {collectorProfile.location}</span>
                  )}
                  {collectorProfile?.collecting_since && (
                    <span> • Collecting since {new Date(collectorProfile.collecting_since).getFullYear()}</span>
                  )}
                </p>
                
                {aiLearnings && (
                  <div className="ai-summary">
                    <div className="ai-stat">
                      <Brain size={16} />
                      <span>{aiLearnings.total_interactions} AI interactions</span>
                    </div>
                    <div className="ai-stat">
                      <Target size={16} />
                      <span>{Math.round(aiLearnings.recommendation_accuracy * 100)}% accuracy</span>
                    </div>
                    <div className="ai-stat">
                      <Sparkles size={16} />
                      <span>{Math.round(aiLearnings.discovery_success_rate * 100)}% discovery success</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="header-actions">
            <button onClick={exportAllData} className="export-btn">
              <Download size={16} />
              Export All Data
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="settings-navigation">
          {[
            { key: 'profile', label: 'Profile', icon: User, description: 'Basic information and bio' },
            { key: 'preferences', label: 'AI Preferences', icon: Brain, description: 'Live recommendation controls' },
            { key: 'ai-insights', label: 'Intelligence Insights', icon: Sparkles, description: 'Your AI learnings and patterns' },
            { key: 'notifications', label: 'Notifications', icon: Bell, description: 'Email and push preferences' },
            { key: 'privacy', label: 'Privacy', icon: Shield, description: 'Visibility and data controls' },
            { key: 'security', label: 'Security', icon: Lock, description: 'Password and authentication' },
            { key: 'billing', label: 'Billing', icon: CreditCard, description: 'Payment methods and history' }
          ].map(({ key, label, icon: Icon, description }) => (
            <button
              key={key}
              className={`nav-item ${activeSection === key ? 'active' : ''}`}
              onClick={() => setActiveSection(key as any)}
            >
              <Icon size={18} />
              <div className="nav-content">
                <span className="nav-label">{label}</span>
                <span className="nav-description">{description}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="settings-content">
          {activeSection === 'profile' && (
            <div className="profile-section">
              <h2>Collector Profile</h2>
              
              <div className="section-card">
                <h3>Personal Information</h3>
                <div className="form-grid">
                  <div className="form-field">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={collectorProfile?.full_name || ''}
                      onChange={(e) => setCollectorProfile(prev => prev ? {...prev, full_name: e.target.value} : null)}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-field">
                    <label>Display Name</label>
                    <input
                      type="text"
                      value={collectorProfile?.display_name || ''}
                      onChange={(e) => setCollectorProfile(prev => prev ? {...prev, display_name: e.target.value} : null)}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-field">
                    <label>Email</label>
                    <input
                      type="email"
                      value={collectorProfile?.email || user?.email || ''}
                      disabled
                      className="form-input disabled"
                    />
                    <small>Contact support to change your email address</small>
                  </div>
                  
                  <div className="form-field">
                    <label>Location</label>
                    <input
                      type="text"
                      value={collectorProfile?.location || ''}
                      onChange={(e) => setCollectorProfile(prev => prev ? {...prev, location: e.target.value} : null)}
                      className="form-input"
                      placeholder="City, Country"
                    />
                  </div>
                </div>
                
                <div className="form-field full-width">
                  <label>Bio</label>
                  <textarea
                    value={collectorProfile?.bio || ''}
                    onChange={(e) => setCollectorProfile(prev => prev ? {...prev, bio: e.target.value} : null)}
                    className="form-textarea"
                    rows={4}
                    placeholder="Tell us about your collecting journey and interests..."
                  />
                </div>

                <div className="form-actions">
                  <button 
                    onClick={() => collectorProfile && saveProfile(collectorProfile)}
                    disabled={isSaving}
                    className="save-btn"
                  >
                    {isSaving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'preferences' && (
            <div className="preferences-section">
              <h2>
                <Brain size={24} />
                AI Preference Controls
              </h2>
              <p>Fine-tune how our AI recommends artworks to you</p>
              
              <LivePreferenceControls
                onPreferencesChange={setPreferences}
                initialPreferences={preferences}
              />
              
              {/* Budget Preferences */}
              <div className="section-card">
                <h3>Budget Preferences</h3>
                <div className="budget-controls">
                  <div className="budget-field">
                    <label>Minimum Budget (ZAR)</label>
                    <input
                      type="number"
                      value={collectorProfile?.budget_range?.min || 0}
                      onChange={(e) => setCollectorProfile(prev => prev ? {
                        ...prev,
                        budget_range: { ...prev.budget_range, min: parseInt(e.target.value) || 0 }
                      } : null)}
                      className="form-input"
                    />
                  </div>
                  <div className="budget-field">
                    <label>Maximum Budget (ZAR)</label>
                    <input
                      type="number"
                      value={collectorProfile?.budget_range?.max || 50000}
                      onChange={(e) => setCollectorProfile(prev => prev ? {
                        ...prev,
                        budget_range: { ...prev.budget_range, max: parseInt(e.target.value) || 50000 }
                      } : null)}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'ai-insights' && aiLearnings && (
            <div className="ai-insights-section">
              <h2>
                <Sparkles size={24} />
                Your AI Intelligence Profile
              </h2>
              <p>Deep insights into your collecting behavior and preferences learned by AI</p>

              {/* AI Performance Overview */}
              <div className="section-card">
                <h3>AI Performance</h3>
                <div className="ai-performance-grid">
                  <div className="performance-metric">
                    <div className="metric-icon">
                      <TrendingUp size={24} color="var(--accent)" />
                    </div>
                    <div className="metric-content">
                      <span className="metric-value">{Math.round(aiLearnings.recommendation_accuracy * 100)}%</span>
                      <span className="metric-label">Recommendation Accuracy</span>
                      <span className="metric-description">
                        How often our AI recommendations match your interests
                      </span>
                    </div>
                  </div>

                  <div className="performance-metric">
                    <div className="metric-icon">
                      <Target size={24} color="#10b981" />
                    </div>
                    <div className="metric-content">
                      <span className="metric-value">{Math.round(aiLearnings.discovery_success_rate * 100)}%</span>
                      <span className="metric-label">Discovery Success</span>
                      <span className="metric-description">
                        Success rate when AI suggests new artists or styles
                      </span>
                    </div>
                  </div>

                  <div className="performance-metric">
                    <div className="metric-icon">
                      <Zap size={24} color="#f59e0b" />
                    </div>
                    <div className="metric-content">
                      <span className="metric-value">{Math.round(aiLearnings.learning_velocity * 100)}%</span>
                      <span className="metric-label">Learning Velocity</span>
                      <span className="metric-description">
                        How quickly AI adapts to your evolving preferences
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Taste Profile */}
              <div className="section-card">
                <h3>
                  <Palette size={20} />
                  AI-Learned Taste Profile
                </h3>
                
                {/* Medium Preferences */}
                <div className="taste-category">
                  <h4>Medium Preferences</h4>
                  <div className="preference-list">
                    {aiLearnings.preferred_mediums.map((medium, index) => (
                      <div key={index} className="preference-item">
                        <div className="preference-header">
                          <span className="preference-name">{medium.medium}</span>
                          <span className="confidence-badge">
                            {Math.round(medium.confidence * 100)}% confident
                          </span>
                        </div>
                        <div className="preference-bar">
                          <div 
                            className="preference-fill"
                            style={{ width: `${medium.confidence * 100}%` }}
                          />
                        </div>
                        <span className="frequency-text">{medium.frequency} interactions</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Color Intelligence */}
                <div className="taste-category">
                  <h4>Color Intelligence</h4>
                  <div className="color-grid">
                    {aiLearnings.color_preferences.map((color, index) => (
                      <div key={index} className="color-preference">
                        <div 
                          className="color-swatch"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div className="color-details">
                          <span className="color-name">{color.color}</span>
                          <span className="color-frequency">{color.frequency}x</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Intelligence */}
                <div className="taste-category">
                  <h4>Price Intelligence</h4>
                  <div className="price-intelligence">
                    <div className="price-metric">
                      <label>Average Interest Level</label>
                      <span className="price-value">
                        R{aiLearnings.price_patterns.average_interest.toLocaleString()}
                      </span>
                    </div>
                    <div className="price-metric">
                      <label>Price Sensitivity</label>
                      <span className="sensitivity-level">
                        {aiLearnings.price_patterns.price_sensitivity < 0.3 ? 'Low' :
                         aiLearnings.price_patterns.price_sensitivity > 0.7 ? 'High' : 'Moderate'}
                      </span>
                    </div>
                    <div className="price-metric">
                      <label>Budget Adherence</label>
                      <span className="adherence-score">
                        {Math.round(aiLearnings.price_patterns.budget_adherence * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Behavioral Insights */}
              <div className="section-card">
                <h3>
                  <BarChart3 size={20} />
                  Behavioral Intelligence
                </h3>
                
                <div className="behavior-insights">
                  <div className="insight-item">
                    <Clock size={20} />
                    <div className="insight-content">
                      <span className="insight-label">Peak Browsing Hours</span>
                      <span className="insight-value">
                        {aiLearnings.behavioral_insights.browsing_peak_hours.join(', ')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="insight-item">
                    <Eye size={20} />
                    <div className="insight-content">
                      <span className="insight-label">Average Session Duration</span>
                      <span className="insight-value">
                        {aiLearnings.behavioral_insights.session_duration_avg} minutes
                      </span>
                    </div>
                  </div>
                  
                  <div className="insight-item">
                    <TrendingUp size={20} />
                    <div className="insight-content">
                      <span className="insight-label">Decision Making Speed</span>
                      <span className="insight-value">
                        {aiLearnings.behavioral_insights.decision_making_speed}
                      </span>
                    </div>
                  </div>
                  
                  <div className="insight-item">
                    <BarChart3 size={20} />
                    <div className="insight-content">
                      <span className="insight-label">Research Depth</span>
                      <span className="insight-value">
                        {aiLearnings.behavioral_insights.research_depth}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Market Intelligence */}
              <div className="section-card">
                <h3>
                  <TrendingUp size={20} />
                  Market Intelligence
                </h3>
                
                {/* Collection Gaps */}
                <div className="intelligence-category">
                  <h4>Collection Gaps AI Identified</h4>
                  <div className="gaps-list">
                    {aiLearnings.market_intelligence.collection_gaps.map((gap, index) => (
                      <div key={index} className="gap-item">
                        <Target size={16} />
                        <span>{gap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Investment Opportunities */}
                <div className="intelligence-category">
                  <h4>AI Investment Opportunities</h4>
                  <div className="opportunities-list">
                    {aiLearnings.market_intelligence.investment_opportunities.map((opp, index) => (
                      <div key={index} className="opportunity-item">
                        <div className="opportunity-header">
                          <span className="artist-name">{opp.artist}</span>
                          <span className="confidence-level">
                            {Math.round(opp.confidence * 100)}% confidence
                          </span>
                        </div>
                        <p className="opportunity-reasoning">{opp.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Budget Optimization */}
                <div className="intelligence-category">
                  <h4>Budget Optimization Suggestions</h4>
                  <div className="optimization-list">
                    {aiLearnings.market_intelligence.budget_optimization_suggestions.map((suggestion, index) => (
                      <div key={index} className="optimization-item">
                        <ShoppingBag size={16} />
                        <span>{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Controls */}
              <div className="section-card danger-card">
                <h3>AI Learning Controls</h3>
                <p>Manage your AI learning data and preferences</p>
                
                <div className="ai-controls">
                  <button onClick={resetAILearning} className="reset-btn">
                    <Trash2 size={16} />
                    Reset All AI Learning
                  </button>
                  <p className="warning-text">
                    ⚠️ This will permanently delete all AI learning about your preferences. 
                    You'll start fresh, but lose all personalization.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="notifications-section">
              <h2>
                <Bell size={24} />
                Notification Preferences
              </h2>
              
              <div className="section-card">
                <h3>Email Notifications</h3>
                <div className="notification-options">
                  {[
                    { key: 'email_newsletters', label: 'Weekly Art Newsletter', description: 'Curated artworks and artist spotlights' },
                    { key: 'price_alerts', label: 'Price Drop Alerts', description: 'When saved artworks drop in price' },
                    { key: 'new_artist_works', label: 'New Works from Followed Artists', description: 'Fresh artworks from artists you follow' },
                    { key: 'auction_reminders', label: 'Auction Reminders', description: 'Upcoming auctions and bidding opportunities' },
                    { key: 'collection_insights', label: 'Collection Insights', description: 'Monthly AI insights about your collection' }
                  ].map(({ key, label, description }) => (
                    <div key={key} className="notification-option">
                      <div className="option-content">
                        <span className="option-label">{label}</span>
                        <span className="option-description">{description}</span>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={collectorProfile?.notification_preferences?.[key as keyof typeof collectorProfile.notification_preferences] || false}
                          onChange={(e) => setCollectorProfile(prev => prev ? {
                            ...prev,
                            notification_preferences: {
                              ...prev.notification_preferences,
                              [key]: e.target.checked
                            }
                          } : null)}
                        />
                        <span className="toggle-slider" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'privacy' && (
            <div className="privacy-section">
              <h2>
                <Shield size={24} />
                Privacy & Visibility
              </h2>
              
              <div className="section-card">
                <h3>Profile Visibility</h3>
                <div className="privacy-options">
                  {[
                    { value: 'public', label: 'Public', description: 'Visible to everyone' },
                    { value: 'collectors_only', label: 'Collectors Only', description: 'Visible to other collectors' },
                    { value: 'private', label: 'Private', description: 'Only visible to you' }
                  ].map(({ value, label, description }) => (
                    <label key={value} className="privacy-option">
                      <input
                        type="radio"
                        name="profile_visibility"
                        value={value}
                        checked={collectorProfile?.privacy_settings?.profile_visibility === value}
                        onChange={(e) => setCollectorProfile(prev => prev ? {
                          ...prev,
                          privacy_settings: {
                            ...prev.privacy_settings,
                            profile_visibility: e.target.value as any
                          }
                        } : null)}
                      />
                      <div className="option-details">
                        <span className="option-label">{label}</span>
                        <span className="option-description">{description}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="section-card">
                <h3>Data Controls</h3>
                <div className="data-controls">
                  <div className="control-item">
                    <div className="control-content">
                      <span className="control-label">Show Purchase History</span>
                      <span className="control-description">Allow others to see your purchase history</span>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={collectorProfile?.privacy_settings?.show_purchase_history || false}
                        onChange={(e) => setCollectorProfile(prev => prev ? {
                          ...prev,
                          privacy_settings: {
                            ...prev.privacy_settings,
                            show_purchase_history: e.target.checked
                          }
                        } : null)}
                      />
                      <span className="toggle-slider" />
                    </label>
                  </div>

                  <div className="control-item">
                    <div className="control-content">
                      <span className="control-label">Allow Artist Contact</span>
                      <span className="control-description">Let artists contact you directly about their work</span>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={collectorProfile?.privacy_settings?.allow_artist_contact || false}
                        onChange={(e) => setCollectorProfile(prev => prev ? {
                          ...prev,
                          privacy_settings: {
                            ...prev.privacy_settings,
                            allow_artist_contact: e.target.checked
                          }
                        } : null)}
                      />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <style>{`
          .collector-settings-page {
            max-width: 1200px;
            margin: 0 auto;
            padding: 24px;
          }

          .settings-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 32px;
            padding-bottom: 24px;
            border-bottom: 1px solid var(--border);
          }

          .profile-summary {
            display: flex;
            gap: 20px;
            align-items: flex-start;
          }

          .avatar-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
          }

          .profile-avatar {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid var(--border);
          }

          .avatar-placeholder {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: var(--bg-alt);
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid var(--border);
          }

          .change-avatar-btn {
            display: flex;
            align-items: center;
            gap: 6px;
            background: var(--bg-alt);
            border: 1px solid var(--border);
            border-radius: 6px;
            padding: 6px 12px;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 12px;
          }

          .change-avatar-btn:hover {
            background: var(--accent-bg);
            border-color: var(--accent);
          }

          .profile-info h1 {
            margin: 0 0 8px 0;
            font-size: 28px;
            font-weight: 700;
          }

          .profile-subtitle {
            display: flex;
            align-items: center;
            gap: 12px;
            margin: 0 0 16px 0;
            color: var(--muted);
            font-size: 14px;
          }

          .ai-summary {
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
          }

          .ai-stat {
            display: flex;
            align-items: center;
            gap: 6px;
            background: var(--accent-bg);
            color: var(--accent);
            padding: 6px 12px;
            border-radius: 16px;
            font-size: 13px;
            font-weight: 500;
          }

          .settings-navigation {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 12px;
            margin-bottom: 32px;
          }

          .nav-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px;
            background: var(--card);
            border: 2px solid var(--border);
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s;
            text-align: left;
          }

          .nav-item.active {
            border-color: var(--accent);
            background: var(--accent-bg);
          }

          .nav-item:hover:not(.active) {
            border-color: var(--border-hover);
            transform: translateY(-1px);
          }

          .nav-content {
            display: flex;
            flex-direction: column;
          }

          .nav-label {
            font-weight: 600;
            margin-bottom: 2px;
          }

          .nav-description {
            font-size: 13px;
            color: var(--muted);
          }

          .section-card {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
          }

          .section-card.danger-card {
            border-color: #fecaca;
            background: #fef2f2;
          }

          .section-card h2 {
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 0 0 8px 0;
            font-size: 24px;
            font-weight: 700;
          }

          .section-card h3 {
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 0 0 16px 0;
            font-size: 18px;
            font-weight: 600;
          }

          .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
          }

          .form-field {
            display: flex;
            flex-direction: column;
          }

          .form-field.full-width {
            grid-column: 1 / -1;
          }

          .form-field label {
            font-weight: 500;
            margin-bottom: 8px;
            color: var(--fg);
          }

          .form-input, .form-textarea {
            padding: 12px;
            border: 1px solid var(--border);
            border-radius: 8px;
            background: var(--bg);
            color: var(--fg);
            transition: border-color 0.2s;
          }

          .form-input:focus, .form-textarea:focus {
            outline: none;
            border-color: var(--accent);
            box-shadow: 0 0 0 3px var(--accent-bg);
          }

          .form-input.disabled {
            background: var(--bg-alt);
            color: var(--muted);
            cursor: not-allowed;
          }

          .form-field small {
            margin-top: 4px;
            font-size: 12px;
            color: var(--muted);
          }

          .save-btn {
            background: var(--accent);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 12px 24px;
            cursor: pointer;
            transition: all 0.2s;
            font-weight: 600;
          }

          .save-btn:hover:not(:disabled) {
            background: var(--accent-hover);
            transform: translateY(-1px);
          }

          .save-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .ai-performance-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 24px;
          }

          .performance-metric {
            display: flex;
            gap: 16px;
            padding: 20px;
            background: var(--bg-alt);
            border-radius: 12px;
          }

          .metric-icon {
            flex-shrink: 0;
          }

          .metric-content {
            display: flex;
            flex-direction: column;
          }

          .metric-value {
            font-size: 28px;
            font-weight: 700;
            color: var(--accent);
            line-height: 1;
            margin-bottom: 4px;
          }

          .metric-label {
            font-weight: 600;
            margin-bottom: 4px;
          }

          .metric-description {
            font-size: 13px;
            color: var(--muted);
            line-height: 1.4;
          }

          .preference-list {
            space-y: 16px;
          }

          .preference-item {
            margin-bottom: 16px;
          }

          .preference-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
          }

          .preference-name {
            font-weight: 500;
            text-transform: capitalize;
          }

          .confidence-badge {
            background: var(--accent-bg);
            color: var(--accent);
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
          }

          .preference-bar {
            height: 6px;
            background: var(--bg-alt);
            border-radius: 3px;
            overflow: hidden;
            margin-bottom: 4px;
          }

          .preference-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--accent), var(--accent-hover));
            transition: width 0.3s ease;
          }

          .frequency-text {
            font-size: 12px;
            color: var(--muted);
          }

          .color-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 12px;
          }

          .color-preference {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px;
            background: var(--bg-alt);
            border-radius: 8px;
          }

          .color-swatch {
            width: 24px;
            height: 24px;
            border-radius: 4px;
            border: 1px solid var(--border);
            flex-shrink: 0;
          }

          .color-details {
            display: flex;
            flex-direction: column;
          }

          .color-name {
            font-weight: 500;
            font-size: 14px;
            text-transform: capitalize;
          }

          .color-frequency {
            font-size: 11px;
            color: var(--muted);
          }

          .reset-btn {
            background: #ef4444;
            color: white;
            border: none;
            border-radius: 8px;
            padding: 12px 20px;
            cursor: pointer;
            transition: all 0.2s;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .reset-btn:hover {
            background: #dc2626;
          }

          .warning-text {
            margin-top: 12px;
            padding: 12px;
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            font-size: 14px;
            color: #dc2626;
          }

          .notification-options {
            space-y: 16px;
          }

          .notification-option {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px;
            background: var(--bg-alt);
            border-radius: 8px;
            margin-bottom: 12px;
          }

          .option-content {
            display: flex;
            flex-direction: column;
          }

          .option-label {
            font-weight: 500;
            margin-bottom: 2px;
          }

          .option-description {
            font-size: 13px;
            color: var(--muted);
          }

          .toggle-switch {
            position: relative;
            display: inline-block;
            width: 44px;
            height: 24px;
          }

          .toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
          }

          .toggle-slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: var(--bg-alt);
            border: 1px solid var(--border);
            transition: .4s;
            border-radius: 24px;
          }

          .toggle-slider:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 2px;
            bottom: 2px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
          }

          input:checked + .toggle-slider {
            background-color: var(--accent);
            border-color: var(--accent);
          }

          input:checked + .toggle-slider:before {
            transform: translateX(20px);
          }

          .auth-required, .loading-state {
            text-align: center;
            padding: 80px 24px;
          }

          .loading-icon {
            animation: pulse 2s infinite;
          }

          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }

          @media (max-width: 768px) {
            .settings-header {
              flex-direction: column;
              gap: 16px;
            }

            .profile-summary {
              flex-direction: column;
              text-align: center;
            }

            .settings-navigation {
              grid-template-columns: 1fr;
            }

            .ai-performance-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    </Container>
  )
}

export default CollectorSettingsPage
