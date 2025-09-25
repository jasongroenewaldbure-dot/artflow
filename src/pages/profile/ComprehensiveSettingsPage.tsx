import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { 
  User, Settings, Palette, Brain, TrendingUp, Heart, Eye, 
  ShoppingBag, Clock, Target, BarChart3, Sparkles, Download,
  Save, Bell, Lock, CreditCard, MapPin, Camera, Mic
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthProvider'
import { supabase } from '../../lib/supabase'
import Container from "../brush/components/forms/Container'
import LivePreferenceControls, { LivePreferences } from '../../components/common/LivePreferenceControls'

interface CollectorLearnings {
  tasteProfile: {
    preferredMediums: Array<{ medium: string; confidence: number; interactions: number }>
    preferredStyles: Array<{ style: string; confidence: number; interactions: number }>
    colorPreferences: Array<{ color: string; oklch: any; frequency: number }>
    priceRange: { min: number; max: number; average: number; confidence: number }
    sizePreferences: { preferred_ratio: string; min_size: number; max_size: number }
    artistAffinities: Array<{ artist_id: string; name: string; affinity_score: number }>
  }
  behavioralInsights: {
    browsingPatterns: {
      peak_hours: string[]
      session_duration_avg: number
      pages_per_session: number
      return_frequency: string
    }
    engagementMetrics: {
      view_to_save_rate: number
      save_to_inquiry_rate: number
      inquiry_to_purchase_rate: number
      total_interactions: number
    }
    decisionMaking: {
      research_depth: 'surface' | 'moderate' | 'deep'
      decision_speed: 'impulsive' | 'quick' | 'considered' | 'deliberate'
      price_sensitivity: number
      social_influence: number
    }
  }
  marketIntelligence: {
    collection_gaps: string[]
    investment_opportunities: Array<{ artist: string; potential: number; reasoning: string }>
    market_timing: Array<{ action: string; timing: string; confidence: number }>
    budget_optimization: Array<{ suggestion: string; potential_savings: number }>
  }
  aiPerformance: {
    recommendation_accuracy: number
    exploration_rate: number
    discovery_success_rate: number
    total_ai_interactions: number
    learning_velocity: number
  }
}

const ComprehensiveSettingsPage: React.FC = () => {
  const { user, profile } = useAuth()
  const [learnings, setLearnings] = useState<CollectorLearnings | null>(null)
  const [preferences, setPreferences] = useState<LivePreferences>()
  const [isLoading, setIsLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<'profile' | 'taste' | 'behavior' | 'ai' | 'privacy'>('profile')
  const [exportData, setExportData] = useState<any>(null)

  useEffect(() => {
    if (user) {
      loadCollectorLearnings()
    }
  }, [user])

  const loadCollectorLearnings = async () => {
    try {
      setIsLoading(true)
      
      // Load comprehensive collector data
      const [
        { data: tasteData },
        { data: behaviorData },
        { data: marketData },
        { data: aiData },
        { data: preferencesData }
      ] = await Promise.all([
        supabase.from('collector_taste_profiles').select('*').eq('user_id', user?.id).single(),
        supabase.from('collector_behavior_analytics').select('*').eq('user_id', user?.id).single(),
        supabase.from('collector_market_intelligence').select('*').eq('user_id', user?.id).single(),
        supabase.from('user_bandit_models').select('*').eq('user_id', user?.id).single(),
        supabase.from('user_preferences').select('*').eq('user_id', user?.id).single()
      ])

      // Process and structure the learnings
      const processedLearnings: CollectorLearnings = {
        tasteProfile: {
          preferredMediums: tasteData?.preferred_mediums || [],
          preferredStyles: tasteData?.preferred_styles || [],
          colorPreferences: tasteData?.color_preferences || [],
          priceRange: tasteData?.price_range || { min: 0, max: 50000, average: 10000, confidence: 0.5 },
          sizePreferences: tasteData?.size_preferences || { preferred_ratio: '4:3', min_size: 30, max_size: 200 },
          artistAffinities: tasteData?.artist_affinities || []
        },
        behavioralInsights: {
          browsingPatterns: behaviorData?.browsing_patterns || {
            peak_hours: ['19:00', '20:00', '21:00'],
            session_duration_avg: 15,
            pages_per_session: 8,
            return_frequency: 'weekly'
          },
          engagementMetrics: behaviorData?.engagement_metrics || {
            view_to_save_rate: 0.15,
            save_to_inquiry_rate: 0.08,
            inquiry_to_purchase_rate: 0.25,
            total_interactions: 0
          },
          decisionMaking: behaviorData?.decision_making || {
            research_depth: 'moderate',
            decision_speed: 'considered',
            price_sensitivity: 0.6,
            social_influence: 0.3
          }
        },
        marketIntelligence: {
          collection_gaps: marketData?.collection_gaps || [],
          investment_opportunities: marketData?.investment_opportunities || [],
          market_timing: marketData?.market_timing || [],
          budget_optimization: marketData?.budget_optimization || []
        },
        aiPerformance: {
          recommendation_accuracy: aiData?.recommendation_accuracy || 0,
          exploration_rate: aiData?.exploration_rate || 0.2,
          discovery_success_rate: aiData?.discovery_success_rate || 0,
          total_ai_interactions: aiData?.total_interactions || 0,
          learning_velocity: aiData?.learning_velocity || 0
        }
      }

      setLearnings(processedLearnings)
      setPreferences(preferencesData?.live_preferences)
      
    } catch (error) {
      console.error('Error loading collector learnings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const exportCollectorData = async () => {
    try {
      const exportData = {
        profile: profile,
        learnings: learnings,
        preferences: preferences,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      }
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `artflow-collector-profile-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Error exporting data:', error)
    }
  }

  const resetAILearning = async () => {
    if (!confirm('This will reset all AI learning about your preferences. Are you sure?')) return
    
    try {
      await supabase.from('user_bandit_models').delete().eq('user_id', user?.id)
      await supabase.from('bandit_interactions').delete().eq('user_id', user?.id)
      await loadCollectorLearnings()
    } catch (error) {
      console.error('Error resetting AI learning:', error)
    }
  }

  if (!user) {
    return (
      <Container>
        <div className="settings-login">
          <User size={48} />
          <h2>Sign In Required</h2>
          <p>Access your personalized settings and AI learnings</p>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <Helmet>
        <title>Collector Intelligence & Settings - ArtFlow</title>
        <meta name="description" content="Your comprehensive collector profile with AI learnings, preferences, and insights" />
      </Helmet>

      <div className="comprehensive-settings">
        {/* Header */}
        <div className="settings-header">
          <div className="header-content">
            <h1>
              <Brain size={28} />
              Collector Intelligence
            </h1>
            <p>Your complete collector profile with AI learnings and insights</p>
          </div>
          
          <div className="header-actions">
            <button onClick={exportCollectorData} className="export-btn">
              <Download size={16} />
              Export Data
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="settings-nav">
          {[
            { key: 'profile', label: 'Profile', icon: User },
            { key: 'taste', label: 'Taste Intelligence', icon: Palette },
            { key: 'behavior', label: 'Behavioral Insights', icon: BarChart3 },
            { key: 'ai', label: 'AI Performance', icon: Brain },
            { key: 'privacy', label: 'Privacy & Data', icon: Lock }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={`nav-item ${activeSection === key ? 'active' : ''}`}
              onClick={() => setActiveSection(key as any)}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Content Sections */}
        <div className="settings-content">
          {activeSection === 'profile' && (
            <div className="profile-section">
              <h2>Collector Profile</h2>
              
              {/* Live Preferences */}
              <div className="section-card">
                <h3>
                  <Settings size={20} />
                  Live AI Preferences
                </h3>
                <p>These controls adjust your recommendations in real-time</p>
                <LivePreferenceControls
                  onPreferencesChange={setPreferences}
                  initialPreferences={preferences}
                />
              </div>

              {/* Basic Profile Info */}
              <div className="section-card">
                <h3>Basic Information</h3>
                <div className="profile-grid">
                  <div className="profile-field">
                    <label>Display Name</label>
                    <input 
                      type="text" 
                      value={profile?.display_name || ''} 
                      className="profile-input"
                    />
                  </div>
                  <div className="profile-field">
                    <label>Location</label>
                    <input 
                      type="text" 
                      value={profile?.location || ''} 
                      className="profile-input"
                    />
                  </div>
                  <div className="profile-field">
                    <label>Collecting Since</label>
                    <input 
                      type="date" 
                      value={profile?.created_at?.split('T')[0] || ''} 
                      className="profile-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'taste' && learnings && (
            <div className="taste-section">
              <h2>
                <Palette size={24} />
                Your Taste Intelligence
              </h2>
              <p>AI-learned insights about your artistic preferences</p>

              {/* Preferred Mediums */}
              <div className="section-card">
                <h3>Medium Preferences</h3>
                <div className="preference-chart">
                  {learnings.tasteProfile.preferredMediums.map((medium, index) => (
                    <div key={index} className="preference-item">
                      <div className="preference-header">
                        <span className="medium-name">{medium.medium}</span>
                        <span className="confidence-score">{Math.round(medium.confidence * 100)}% confidence</span>
                      </div>
                      <div className="preference-bar">
                        <div 
                          className="preference-fill"
                          style={{ width: `${medium.confidence * 100}%` }}
                        />
                      </div>
                      <span className="interaction-count">{medium.interactions} interactions</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Color Preferences */}
              <div className="section-card">
                <h3>Color Intelligence</h3>
                <div className="color-preferences">
                  {learnings.tasteProfile.colorPreferences.map((color, index) => (
                    <div key={index} className="color-item">
                      <div 
                        className="color-swatch"
                        style={{ backgroundColor: color.color }}
                      />
                      <div className="color-info">
                        <span className="color-name">{color.color}</span>
                        <span className="color-frequency">{color.frequency} times</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Intelligence */}
              <div className="section-card">
                <h3>Price Intelligence</h3>
                <div className="price-insights">
                  <div className="price-stat">
                    <label>Preferred Range</label>
                    <span className="price-range">
                      R{learnings.tasteProfile.priceRange.min.toLocaleString()} - 
                      R{learnings.tasteProfile.priceRange.max.toLocaleString()}
                    </span>
                  </div>
                  <div className="price-stat">
                    <label>Average Interest</label>
                    <span className="price-average">
                      R{learnings.tasteProfile.priceRange.average.toLocaleString()}
                    </span>
                  </div>
                  <div className="price-stat">
                    <label>Confidence Level</label>
                    <span className="confidence-level">
                      {Math.round(learnings.tasteProfile.priceRange.confidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Artist Affinities */}
              <div className="section-card">
                <h3>Artist Affinities</h3>
                <div className="artist-affinities">
                  {learnings.tasteProfile.artistAffinities.map((artist, index) => (
                    <div key={index} className="artist-affinity">
                      <div className="artist-info">
                        <span className="artist-name">{artist.name}</span>
                        <span className="affinity-score">
                          {Math.round(artist.affinity_score * 100)}% match
                        </span>
                      </div>
                      <div className="affinity-bar">
                        <div 
                          className="affinity-fill"
                          style={{ width: `${artist.affinity_score * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'behavior' && learnings && (
            <div className="behavior-section">
              <h2>
                <BarChart3 size={24} />
                Behavioral Insights
              </h2>
              <p>Understanding your collecting patterns and decision-making</p>

              {/* Browsing Patterns */}
              <div className="section-card">
                <h3>Browsing Patterns</h3>
                <div className="behavior-grid">
                  <div className="behavior-stat">
                    <Clock size={20} />
                    <div className="stat-content">
                      <span className="stat-label">Peak Hours</span>
                      <span className="stat-value">
                        {learnings.behavioralInsights.browsingPatterns.peak_hours.join(', ')}
                      </span>
                    </div>
                  </div>
                  <div className="behavior-stat">
                    <Eye size={20} />
                    <div className="stat-content">
                      <span className="stat-label">Avg Session</span>
                      <span className="stat-value">
                        {learnings.behavioralInsights.browsingPatterns.session_duration_avg} minutes
                      </span>
                    </div>
                  </div>
                  <div className="behavior-stat">
                    <Target size={20} />
                    <div className="stat-content">
                      <span className="stat-label">Pages/Session</span>
                      <span className="stat-value">
                        {learnings.behavioralInsights.browsingPatterns.pages_per_session}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Engagement Funnel */}
              <div className="section-card">
                <h3>Engagement Funnel</h3>
                <div className="funnel-chart">
                  <div className="funnel-step">
                    <span className="step-label">View → Save</span>
                    <div className="step-bar">
                      <div 
                        className="step-fill"
                        style={{ width: `${learnings.behavioralInsights.engagementMetrics.view_to_save_rate * 100}%` }}
                      />
                    </div>
                    <span className="step-rate">
                      {Math.round(learnings.behavioralInsights.engagementMetrics.view_to_save_rate * 100)}%
                    </span>
                  </div>
                  <div className="funnel-step">
                    <span className="step-label">Save → Inquiry</span>
                    <div className="step-bar">
                      <div 
                        className="step-fill"
                        style={{ width: `${learnings.behavioralInsights.engagementMetrics.save_to_inquiry_rate * 100}%` }}
                      />
                    </div>
                    <span className="step-rate">
                      {Math.round(learnings.behavioralInsights.engagementMetrics.save_to_inquiry_rate * 100)}%
                    </span>
                  </div>
                  <div className="funnel-step">
                    <span className="step-label">Inquiry → Purchase</span>
                    <div className="step-bar">
                      <div 
                        className="step-fill"
                        style={{ width: `${learnings.behavioralInsights.engagementMetrics.inquiry_to_purchase_rate * 100}%` }}
                      />
                    </div>
                    <span className="step-rate">
                      {Math.round(learnings.behavioralInsights.engagementMetrics.inquiry_to_purchase_rate * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Decision Making Profile */}
              <div className="section-card">
                <h3>Decision Making Profile</h3>
                <div className="decision-profile">
                  <div className="decision-trait">
                    <label>Research Depth</label>
                    <span className="trait-value">{learnings.behavioralInsights.decisionMaking.research_depth}</span>
                  </div>
                  <div className="decision-trait">
                    <label>Decision Speed</label>
                    <span className="trait-value">{learnings.behavioralInsights.decisionMaking.decision_speed}</span>
                  </div>
                  <div className="decision-trait">
                    <label>Price Sensitivity</label>
                    <span className="trait-value">
                      {Math.round(learnings.behavioralInsights.decisionMaking.price_sensitivity * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'ai' && learnings && (
            <div className="ai-section">
              <h2>
                <Brain size={24} />
                AI Performance & Learning
              </h2>
              <p>How well our AI understands and serves your preferences</p>

              {/* AI Performance Metrics */}
              <div className="section-card">
                <h3>AI Performance</h3>
                <div className="ai-metrics">
                  <div className="ai-metric">
                    <TrendingUp size={24} color="var(--accent)" />
                    <div className="metric-content">
                      <span className="metric-label">Recommendation Accuracy</span>
                      <span className="metric-value">
                        {Math.round(learnings.aiPerformance.recommendation_accuracy * 100)}%
                      </span>
                      <span className="metric-description">
                        How often our recommendations lead to saves or purchases
                      </span>
                    </div>
                  </div>
                  
                  <div className="ai-metric">
                    <Sparkles size={24} color="#f59e0b" />
                    <div className="metric-content">
                      <span className="metric-label">Discovery Success</span>
                      <span className="metric-value">
                        {Math.round(learnings.aiPerformance.discovery_success_rate * 100)}%
                      </span>
                      <span className="metric-description">
                        Success rate of exploration recommendations
                      </span>
                    </div>
                  </div>
                  
                  <div className="ai-metric">
                    <Target size={24} color="#10b981" />
                    <div className="metric-content">
                      <span className="metric-label">Learning Velocity</span>
                      <span className="metric-value">
                        {Math.round(learnings.aiPerformance.learning_velocity * 100)}%
                      </span>
                      <span className="metric-description">
                        How quickly AI adapts to your changing preferences
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Exploration vs Exploitation */}
              <div className="section-card">
                <h3>AI Strategy Balance</h3>
                <div className="strategy-visualization">
                  <div className="strategy-bar">
                    <div 
                      className="exploit-portion"
                      style={{ width: `${(1 - learnings.aiPerformance.exploration_rate) * 100}%` }}
                    />
                    <div 
                      className="explore-portion"
                      style={{ width: `${learnings.aiPerformance.exploration_rate * 100}%` }}
                    />
                  </div>
                  <div className="strategy-labels">
                    <span className="exploit-label">
                      Exploit: {Math.round((1 - learnings.aiPerformance.exploration_rate) * 100)}%
                      <small>Safe recommendations based on known preferences</small>
                    </span>
                    <span className="explore-label">
                      Explore: {Math.round(learnings.aiPerformance.exploration_rate * 100)}%
                      <small>Discovery recommendations to find new interests</small>
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Controls */}
              <div className="section-card">
                <h3>AI Controls</h3>
                <div className="ai-controls">
                  <button onClick={resetAILearning} className="reset-ai-btn">
                    Reset AI Learning
                  </button>
                  <p className="control-description">
                    This will clear all AI learning and start fresh. Your explicit preferences will be preserved.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'privacy' && (
            <div className="privacy-section">
              <h2>
                <Lock size={24} />
                Privacy & Data Control
              </h2>
              
              <div className="section-card">
                <h3>Data Export & Portability</h3>
                <p>Download all your data in a portable format</p>
                <button onClick={exportCollectorData} className="export-full-btn">
                  <Download size={16} />
                  Export Complete Profile
                </button>
              </div>

              <div className="section-card">
                <h3>Learning Data</h3>
                <div className="data-summary">
                  <div className="data-item">
                    <span>AI Interactions</span>
                    <span>{learnings?.aiPerformance.total_ai_interactions || 0}</span>
                  </div>
                  <div className="data-item">
                    <span>Behavioral Data Points</span>
                    <span>{learnings?.behavioralInsights.engagementMetrics.total_interactions || 0}</span>
                  </div>
                  <div className="data-item">
                    <span>Preference Updates</span>
                    <span>Real-time</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <style jsx>{`
          .comprehensive-settings {
            max-width: 1200px;
            margin: 0 auto;
            padding: 24px;
          }

          .settings-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 32px;
          }

          .header-content h1 {
            display: flex;
            align-items: center;
            gap: 12px;
            margin: 0 0 8px 0;
            font-size: 32px;
            font-weight: 700;
          }

          .header-content p {
            margin: 0;
            color: var(--muted);
            font-size: 16px;
          }

          .export-btn, .export-full-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            background: var(--accent);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 12px 20px;
            cursor: pointer;
            transition: all 0.2s;
            font-weight: 500;
          }

          .export-btn:hover, .export-full-btn:hover {
            background: var(--accent-hover);
            transform: translateY(-1px);
          }

          .settings-nav {
            display: flex;
            gap: 4px;
            background: var(--bg-alt);
            border-radius: 12px;
            padding: 4px;
            margin-bottom: 32px;
            overflow-x: auto;
          }

          .nav-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 20px;
            background: none;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            font-weight: 500;
            color: var(--muted);
            white-space: nowrap;
          }

          .nav-item.active {
            background: var(--card);
            color: var(--fg);
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }

          .settings-content {
            min-height: 600px;
          }

          .section-card {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
          }

          .section-card h3 {
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 0 0 16px 0;
            font-size: 18px;
            font-weight: 600;
          }

          .preference-chart {
            space-y: 16px;
          }

          .preference-item {
            margin-bottom: 16px;
          }

          .preference-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          }

          .medium-name {
            font-weight: 500;
          }

          .confidence-score {
            color: var(--accent);
            font-weight: 600;
            font-size: 14px;
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

          .interaction-count {
            font-size: 12px;
            color: var(--muted);
          }

          .color-preferences {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 16px;
          }

          .color-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            background: var(--bg-alt);
            border-radius: 8px;
          }

          .color-swatch {
            width: 32px;
            height: 32px;
            border-radius: 6px;
            border: 2px solid var(--border);
          }

          .color-info {
            display: flex;
            flex-direction: column;
          }

          .color-name {
            font-weight: 500;
            text-transform: capitalize;
          }

          .color-frequency {
            font-size: 12px;
            color: var(--muted);
          }

          .price-insights {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 24px;
          }

          .price-stat {
            text-align: center;
          }

          .price-stat label {
            display: block;
            font-size: 14px;
            color: var(--muted);
            margin-bottom: 8px;
          }

          .price-range, .price-average {
            font-size: 18px;
            font-weight: 600;
            color: var(--fg);
          }

          .confidence-level {
            font-size: 18px;
            font-weight: 600;
            color: var(--accent);
          }

          .artist-affinities {
            space-y: 12px;
          }

          .artist-affinity {
            margin-bottom: 12px;
          }

          .artist-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          }

          .artist-name {
            font-weight: 500;
          }

          .affinity-score {
            color: var(--accent);
            font-weight: 600;
            font-size: 14px;
          }

          .affinity-bar {
            height: 4px;
            background: var(--bg-alt);
            border-radius: 2px;
            overflow: hidden;
          }

          .affinity-fill {
            height: 100%;
            background: var(--accent);
            transition: width 0.3s ease;
          }

          .behavior-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
          }

          .behavior-stat {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px;
            background: var(--bg-alt);
            border-radius: 8px;
          }

          .stat-content {
            display: flex;
            flex-direction: column;
          }

          .stat-label {
            font-size: 14px;
            color: var(--muted);
            margin-bottom: 4px;
          }

          .stat-value {
            font-size: 16px;
            font-weight: 600;
            color: var(--fg);
          }

          .ai-metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 24px;
          }

          .ai-metric {
            display: flex;
            gap: 16px;
            padding: 20px;
            background: var(--bg-alt);
            border-radius: 12px;
          }

          .metric-content {
            display: flex;
            flex-direction: column;
          }

          .metric-label {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 4px;
          }

          .metric-value {
            font-size: 24px;
            font-weight: 700;
            color: var(--accent);
            margin-bottom: 4px;
          }

          .metric-description {
            font-size: 13px;
            color: var(--muted);
            line-height: 1.4;
          }

          .strategy-visualization {
            margin-top: 16px;
          }

          .strategy-bar {
            height: 12px;
            border-radius: 6px;
            overflow: hidden;
            display: flex;
            margin-bottom: 16px;
          }

          .exploit-portion {
            background: var(--accent);
          }

          .explore-portion {
            background: #f59e0b;
          }

          .strategy-labels {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }

          .exploit-label, .explore-label {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .exploit-label small, .explore-label small {
            color: var(--muted);
            font-size: 12px;
          }

          .reset-ai-btn {
            background: #ef4444;
            color: white;
            border: none;
            border-radius: 8px;
            padding: 12px 20px;
            cursor: pointer;
            transition: all 0.2s;
            font-weight: 500;
          }

          .reset-ai-btn:hover {
            background: #dc2626;
          }

          .control-description {
            margin-top: 12px;
            font-size: 14px;
            color: var(--muted);
          }

          .settings-login {
            text-align: center;
            padding: 80px 24px;
            color: var(--muted);
          }

          .settings-login h2 {
            margin: 16px 0 8px 0;
            color: var(--fg);
          }

          @media (max-width: 768px) {
            .settings-nav {
              overflow-x: scroll;
              scrollbar-width: none;
              -ms-overflow-style: none;
            }
            
            .settings-nav::-webkit-scrollbar {
              display: none;
            }
          }
        `}</style>
      </div>
    </Container>
  )
}

export default ComprehensiveSettingsPage
