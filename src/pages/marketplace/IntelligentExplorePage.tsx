import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import { Sparkles, TrendingUp, Palette, Search, Settings, RefreshCw, Globe, User } from 'lucide-react'
import { useAuth } from '../../contexts/AuthProvider'
import AdvancedSearchInterface from '../../components/common/AdvancedSearchInterface'
import LivePreferenceControls, { LivePreferences } from '../../components/common/LivePreferenceControls'
import SerendipityEngine from '../../components/common/SerendipityEngine'
import Container from '../../components/common/Container'

interface IntelligentExplorePageProps {}

const IntelligentExplorePage: React.FC<IntelligentExplorePageProps> = () => {
  const { user, profile } = useAuth()
  const location = useLocation()
  
  // Determine if this is public or collector mode based on route
  const isPublicMode = location.pathname.includes('/discover') || !user
  const pageTitle = isPublicMode ? 'Discover Art' : 'Your Intelligent Explore'
  const pageSubtitle = isPublicMode 
    ? 'AI-powered art discovery for everyone' 
    : 'Personalized recommendations and serendipitous discoveries'
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [preferences, setPreferences] = useState<LivePreferences>()
  const [activeTab, setActiveTab] = useState<'discover' | 'serendipity' | 'personalized'>('discover')
  const [showAdvancedControls, setShowAdvancedControls] = useState(false)
  const [banditAnalytics, setBanditAnalytics] = useState<any>(null)

  useEffect(() => {
    if (user) {
      loadBanditAnalytics()
    }
  }, [user])

  const loadBanditAnalytics = async () => {
    try {
      const response = await fetch(`/api/bandit/analytics?userId=${user?.id}`)
      const data = await response.json()
      setBanditAnalytics(data)
    } catch (error) {
      console.error('Error loading bandit analytics:', error)
    }
  }

  const handleSearchResults = (results: any[]) => {
    setSearchResults(results)
    setActiveTab('discover')
  }

  const handlePreferencesChange = (newPreferences: LivePreferences) => {
    setPreferences(newPreferences)
    // Trigger real-time search update if there are current results
    if (searchResults.length > 0) {
      // Re-run search with new preferences
      refreshRecommendations()
    }
  }

  const refreshRecommendations = async () => {
    if (!preferences || !user) return
    
    try {
      const response = await fetch('/api/collections/dynamic?' + new URLSearchParams({
        paletteBias: preferences.paletteBias,
        style: preferences.abstractionLevel > 0.7 ? 'abstract' : 'figurative',
        maxPrice: (preferences.priceSensitivity * 50000).toString(),
        userId: user.id
      }))
      
      const data = await response.json()
      setSearchResults(data.collections || [])
    } catch (error) {
      console.error('Error refreshing recommendations:', error)
    }
  }

  const handleSerendipityClick = (item: any) => {
    // Navigate to artwork detail or handle item interaction
    console.log('Serendipity item clicked:', item)
  }

  return (
    <Container>
      <Helmet>
        <title>Intelligent Explore - ArtFlow</title>
        <meta name="description" content="Discover artworks with AI-powered search, personalized recommendations, and serendipitous discoveries" />
      </Helmet>

      <div className="intelligent-explore-page">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <h1>
              <Sparkles size={28} />
              Intelligent Explore
            </h1>
            <p>AI-powered discovery with personalized recommendations and serendipitous finds</p>
          </div>
          
          {user && banditAnalytics && (
            <div className="intelligence-stats">
              <div className="stat">
                <span className="stat-label">Discovery Rate</span>
                <span className="stat-value">
                  {Math.round(banditAnalytics.explorationRate * 100)}%
                </span>
              </div>
              <div className="stat">
                <span className="stat-label">Accuracy</span>
                <span className="stat-value">
                  {Math.round(banditAnalytics.recommendationAccuracy * 100)}%
                </span>
              </div>
              <div className="stat">
                <span className="stat-label">Total Interactions</span>
                <span className="stat-value">
                  {banditAnalytics.totalInteractions}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Advanced Search Interface */}
        <div className="search-section">
          <AdvancedSearchInterface
            onResults={handleSearchResults}
            placeholder="Try: 'Show me calming blue abstracts under $5k for my living room'"
            showPreferences={true}
            showVisualSearch={true}
          />
        </div>

        {/* Navigation Tabs */}
        <div className="explore-tabs">
          <button
            className={`tab ${activeTab === 'discover' ? 'active' : ''}`}
            onClick={() => setActiveTab('discover')}
          >
            <Search size={16} />
            Discover
            {searchResults.length > 0 && (
              <span className="result-count">{searchResults.length}</span>
            )}
          </button>
          
          <button
            className={`tab ${activeTab === 'serendipity' ? 'active' : ''}`}
            onClick={() => setActiveTab('serendipity')}
          >
            <Sparkles size={16} />
            Serendipity
          </button>
          
          <button
            className={`tab ${activeTab === 'personalized' ? 'active' : ''}`}
            onClick={() => setActiveTab('personalized')}
          >
            <TrendingUp size={16} />
            For You
          </button>

          <button
            className={`settings-tab ${showAdvancedControls ? 'active' : ''}`}
            onClick={() => setShowAdvancedControls(!showAdvancedControls)}
          >
            <Settings size={16} />
            AI Controls
          </button>
        </div>

        {/* Advanced Controls */}
        {showAdvancedControls && (
          <div className="advanced-controls">
            <LivePreferenceControls
              onPreferencesChange={handlePreferencesChange}
              initialPreferences={preferences}
            />
            
            {user && (
              <div className="bandit-controls">
                <h4>🎯 Exploration vs Exploitation</h4>
                <p>Control how much the AI explores new options vs sticks to your known preferences</p>
                
                <div className="bandit-stats">
                  <div className="stat-card">
                    <h5>Current Strategy</h5>
                    <div className="strategy-visual">
                      <div 
                        className="exploit-bar"
                        style={{ width: `${(1 - (banditAnalytics?.explorationRate || 0.2)) * 100}%` }}
                      />
                      <div 
                        className="explore-bar"
                        style={{ width: `${(banditAnalytics?.explorationRate || 0.2) * 100}%` }}
                      />
                    </div>
                    <div className="strategy-labels">
                      <span>Exploit ({Math.round((1 - (banditAnalytics?.explorationRate || 0.2)) * 100)}%)</span>
                      <span>Explore ({Math.round((banditAnalytics?.explorationRate || 0.2) * 100)}%)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Content Sections */}
        <div className="explore-content">
          {activeTab === 'discover' && (
            <div className="discover-section">
              {searchResults.length > 0 ? (
                <div className="search-results">
                  <div className="results-header">
                    <h3>Search Results</h3>
                    <button onClick={refreshRecommendations} className="refresh-btn">
                      <RefreshCw size={16} />
                      Refresh with AI
                    </button>
                  </div>
                  
                  <div className="results-grid">
                    {searchResults.map((result, index) => (
                      <div key={result.id} className="result-card">
                        <div className="result-image">
                          <img src={result.imageUrl || result.primary_image_url} alt={result.title} />
                          {result.explorationReason === 'explore' && (
                            <div className="exploration-badge">
                              <Sparkles size={12} />
                              Discovery
                            </div>
                          )}
                        </div>
                        <div className="result-content">
                          <h4>{result.title}</h4>
                          <p className="result-artist">{result.artist?.full_name || result.subtitle}</p>
                          <p className="result-reason">{result.enhancedReason || result.reason}</p>
                          {result.metadata?.price && (
                            <div className="result-price">
                              {new Intl.NumberFormat('en-ZA', {
                                style: 'currency',
                                currency: 'ZAR'
                              }).format(result.metadata.price)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="discover-empty">
                  <Search size={48} color="var(--muted)" />
                  <h3>Intelligent Search Ready</h3>
                  <p>Use natural language to find exactly what you're looking for</p>
                  <div className="example-searches">
                    <h4>Try these examples:</h4>
                    <ul>
                      <li>"Calming blue abstracts under $5k"</li>
                      <li>"Warm minimal works for modern living room"</li>
                      <li>"Something like Rothko but affordable"</li>
                      <li>"Vibrant photography under $2k"</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'serendipity' && (
            <div className="serendipity-section">
              <SerendipityEngine
                userId={user?.id}
                limit={12}
                onItemClick={handleSerendipityClick}
                showReasons={true}
              />
            </div>
          )}

          {activeTab === 'personalized' && (
            <div className="personalized-section">
              <div className="personalized-header">
                <h3>
                  <TrendingUp size={20} />
                  Personalized For You
                </h3>
                <p>AI-curated recommendations based on your unique taste profile</p>
              </div>
              
              {user ? (
                <div className="coming-soon">
                  <Palette size={48} color="var(--muted)" />
                  <h4>Advanced Personalization Coming Soon</h4>
                  <p>We're building your taste profile. Keep interacting with artworks to improve recommendations!</p>
                  
                  {banditAnalytics && (
                    <div className="taste-building">
                      <h5>Your AI Learning Progress:</h5>
                      <div className="progress-stats">
                        <div className="progress-item">
                          <span>Interactions Recorded</span>
                          <strong>{banditAnalytics.totalInteractions}</strong>
                        </div>
                        <div className="progress-item">
                          <span>Recommendation Accuracy</span>
                          <strong>{Math.round(banditAnalytics.recommendationAccuracy * 100)}%</strong>
                        </div>
                        <div className="progress-item">
                          <span>Discovery Rate</span>
                          <strong>{Math.round(banditAnalytics.explorationRate * 100)}%</strong>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="login-prompt">
                  <h4>Sign in for Personalized Recommendations</h4>
                  <p>Get AI-powered suggestions tailored to your unique taste</p>
                </div>
              )}
            </div>
          )}
        </div>

        <style jsx>{`
          .intelligent-explore-page {
            max-width: 1200px;
            margin: 0 auto;
            padding: 24px;
          }

          .page-header {
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

          .intelligence-stats {
            display: flex;
            gap: 24px;
          }

          .stat {
            text-align: center;
          }

          .stat-label {
            display: block;
            font-size: 12px;
            color: var(--muted);
            margin-bottom: 4px;
          }

          .stat-value {
            font-size: 20px;
            font-weight: 600;
            color: var(--accent);
          }

          .search-section {
            margin-bottom: 32px;
          }

          .explore-tabs {
            display: flex;
            gap: 4px;
            background: var(--bg-alt);
            border-radius: 12px;
            padding: 4px;
            margin-bottom: 24px;
          }

          .tab, .settings-tab {
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
            position: relative;
          }

          .tab.active, .settings-tab.active {
            background: var(--card);
            color: var(--fg);
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }

          .result-count {
            background: var(--accent);
            color: white;
            border-radius: 12px;
            padding: 2px 8px;
            font-size: 12px;
            font-weight: 600;
          }

          .settings-tab {
            margin-left: auto;
          }

          .advanced-controls {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
          }

          .bandit-controls h4 {
            margin: 24px 0 8px 0;
            font-size: 16px;
          }

          .bandit-controls p {
            margin: 0 0 16px 0;
            color: var(--muted);
            font-size: 14px;
          }

          .bandit-stats {
            display: grid;
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .stat-card {
            background: var(--bg-alt);
            border-radius: 8px;
            padding: 16px;
          }

          .stat-card h5 {
            margin: 0 0 12px 0;
            font-size: 14px;
            font-weight: 600;
          }

          .strategy-visual {
            display: flex;
            height: 8px;
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 8px;
          }

          .exploit-bar {
            background: var(--accent);
          }

          .explore-bar {
            background: #f59e0b;
          }

          .strategy-labels {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: var(--muted);
          }

          .explore-content {
            min-height: 400px;
          }

          .discover-empty, .coming-soon, .login-prompt {
            text-align: center;
            padding: 48px 24px;
            background: var(--card);
            border-radius: 12px;
            border: 1px solid var(--border);
          }

          .discover-empty h3, .coming-soon h4, .login-prompt h4 {
            margin: 16px 0 8px 0;
            color: var(--fg);
          }

          .discover-empty p, .coming-soon p, .login-prompt p {
            margin: 0 0 24px 0;
            color: var(--muted);
          }

          .example-searches {
            text-align: left;
            max-width: 400px;
            margin: 0 auto;
          }

          .example-searches h4 {
            margin: 0 0 12px 0;
            font-size: 16px;
            color: var(--fg);
          }

          .example-searches ul {
            margin: 0;
            padding-left: 20px;
          }

          .example-searches li {
            margin-bottom: 8px;
            color: var(--muted);
            font-style: italic;
          }

          .results-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
          }

          .results-header h3 {
            margin: 0;
            font-size: 20px;
          }

          .refresh-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            background: var(--accent);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 8px 16px;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 14px;
          }

          .refresh-btn:hover {
            background: var(--accent-hover);
          }

          .results-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 24px;
          }

          .result-card {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 12px;
            overflow: hidden;
            transition: all 0.3s;
            cursor: pointer;
          }

          .result-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
            border-color: var(--accent);
          }

          .result-image {
            position: relative;
            aspect-ratio: 4/3;
            overflow: hidden;
          }

          .result-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .exploration-badge {
            position: absolute;
            top: 8px;
            right: 8px;
            background: #f59e0b;
            color: white;
            border-radius: 16px;
            padding: 4px 8px;
            font-size: 11px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 4px;
          }

          .result-content {
            padding: 16px;
          }

          .result-content h4 {
            margin: 0 0 4px 0;
            font-size: 16px;
            font-weight: 600;
          }

          .result-artist {
            margin: 0 0 8px 0;
            color: var(--muted);
            font-size: 14px;
          }

          .result-reason {
            margin: 0 0 12px 0;
            font-size: 13px;
            color: var(--accent);
            background: var(--accent-bg);
            padding: 6px 10px;
            border-radius: 6px;
          }

          .result-price {
            font-weight: 600;
            color: var(--fg);
          }

          .taste-building {
            background: var(--bg-alt);
            border-radius: 8px;
            padding: 20px;
            margin-top: 24px;
          }

          .taste-building h5 {
            margin: 0 0 16px 0;
            font-size: 16px;
          }

          .progress-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 16px;
          }

          .progress-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .progress-item span {
            font-size: 12px;
            color: var(--muted);
            margin-bottom: 4px;
          }

          .progress-item strong {
            font-size: 18px;
            color: var(--accent);
          }

          @media (max-width: 768px) {
            .page-header {
              flex-direction: column;
              gap: 16px;
            }

            .intelligence-stats {
              align-self: stretch;
            }

            .results-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    </Container>
  )
}

export default IntelligentExplorePage
