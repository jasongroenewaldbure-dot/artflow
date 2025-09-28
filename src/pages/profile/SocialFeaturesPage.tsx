import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { 
  Heart, 
  Grid, 
  Search, 
  Users, 
  TrendingUp, 
  Bell, 
  Settings, 
  BookOpen,
  Palette,
  BarChart3,
  MessageSquare,
  FileText,
  Mail,
  Camera,
  Filter,
  Save,
  Share2
} from 'lucide-react'
import UserCollections from '../../brush/components/social/UserCollections'
import ArtistFollowing from '../../brush/components/social/ArtistFollowing'
import VisualSearch from '../../brush/components/search/VisualSearch'
import AdvancedSearch from '../../brush/components/search/AdvancedSearch'

const SocialFeaturesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'collections' | 'following' | 'search' | 'visual' | 'trending' | 'analytics' | 'messages' | 'settings'>('collections')

  const tabs = [
    { id: 'collections', label: 'My Collections', icon: Grid, description: 'Organize your favorite artworks' },
    { id: 'following', label: 'Following', icon: Users, description: 'Artists you follow' },
    { id: 'search', label: 'Advanced Search', icon: Search, description: 'Find artworks with filters' },
    { id: 'visual', label: 'Visual Search', icon: Camera, description: 'Search by image similarity' },
    { id: 'trending', label: 'Trending', icon: TrendingUp, description: 'Discover what\'s popular' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Your activity insights' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, description: 'Connect with artists' },
    { id: 'settings', label: 'Settings', icon: Settings, description: 'Privacy & preferences' }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'collections':
        return <UserCollections isOwnProfile={true} />
      case 'following':
        return <ArtistFollowing />
      case 'search':
        return <AdvancedSearch />
      case 'visual':
        return <VisualSearch />
      case 'trending':
        return <TrendingContent />
      case 'analytics':
        return <AnalyticsContent />
      case 'messages':
        return <MessagesContent />
      case 'settings':
        return <SettingsContent />
      default:
        return <UserCollections isOwnProfile={true} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Social Features | ArtFlow</title>
        <meta name="description" content="Connect with artists, organize collections, and discover new artworks on ArtFlow." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Social Features</h1>
          <p className="text-muted-foreground">
            Connect with artists, organize your collections, and discover new artworks
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-border">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`group inline-flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="hidden sm:block">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}

// Trending Content Component
const TrendingContent: React.FC = () => {
  const [trendingArtists, setTrendingArtists] = useState([])
  const [trendingArtworks, setTrendingArtworks] = useState([])
  const [loading, setLoading] = useState(true)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Trending Now</h2>
          <p className="text-muted-foreground">Discover what's popular in the art world</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp size={16} />
          Updated 2 hours ago
        </div>
      </div>

      {/* Trending Artists */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Trending Artists</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">A{i}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Artist {i}</h4>
                  <p className="text-sm text-muted-foreground">+{Math.floor(Math.random() * 1000)} followers this week</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>🔥 Trending</span>
                <span>•</span>
                <span>{Math.floor(Math.random() * 50)} artworks</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Artworks */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Trending Artworks</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <div className="aspect-square bg-muted">
                <div className="w-full h-full flex items-center justify-center">
                  <Palette size={32} className="text-muted-foreground" />
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-foreground truncate">Artwork {i}</h4>
                <p className="text-sm text-muted-foreground">by Artist {i}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium text-foreground">$1,{i}00</span>
                  <span className="text-xs text-muted-foreground">🔥 Trending</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Analytics Content Component
const AnalyticsContent: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Your Analytics</h2>
        <p className="text-muted-foreground">Insights into your art collection and activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Grid size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Collections</p>
              <p className="text-2xl font-bold text-foreground">12</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Heart size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Artworks Saved</p>
              <p className="text-2xl font-bold text-foreground">47</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Artists Followed</p>
              <p className="text-2xl font-bold text-foreground">8</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Search size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Searches This Month</p>
              <p className="text-2xl font-bold text-foreground">23</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Collection Growth</h3>
          <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
            <BarChart3 size={48} className="text-muted-foreground" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Top Artists</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">A{i}</span>
                  </div>
                  <span className="text-sm text-foreground">Artist {i}</span>
                </div>
                <span className="text-sm text-muted-foreground">{Math.floor(Math.random() * 20)} artworks</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Messages Content Component
const MessagesContent: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Messages</h2>
        <p className="text-muted-foreground">Connect with artists and collectors</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <Search size={20} className="text-muted-foreground" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="flex-1 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">A{i}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground truncate">Artist {i}</h4>
                    <p className="text-sm text-muted-foreground truncate">Thanks for your interest in my work...</p>
                  </div>
                  <div className="text-xs text-muted-foreground">2h</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-lg h-96 flex flex-col">
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">A1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Artist 1</h4>
                  <p className="text-xs text-muted-foreground">Online</p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              <div className="flex justify-end">
                <div className="bg-primary text-primary-foreground rounded-lg p-3 max-w-xs">
                  <p className="text-sm">Hi! I'm interested in your latest artwork. Is it still available?</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-muted text-foreground rounded-lg p-3 max-w-xs">
                  <p className="text-sm">Hello! Yes, it's still available. Would you like to see more details?</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Settings Content Component
const SettingsContent: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-muted-foreground">Manage your privacy and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Privacy Settings */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-foreground">Privacy Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Profile Visibility</h4>
                <p className="text-sm text-muted-foreground">Who can see your profile</p>
              </div>
              <select className="px-3 py-2 border border-border rounded-lg bg-background text-foreground">
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="friends">Friends Only</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Collections Visibility</h4>
                <p className="text-sm text-muted-foreground">Who can see your collections</p>
              </div>
              <select className="px-3 py-2 border border-border rounded-lg bg-background text-foreground">
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="friends">Friends Only</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Following Visibility</h4>
                <p className="text-sm text-muted-foreground">Who can see who you follow</p>
              </div>
              <select className="px-3 py-2 border border-border rounded-lg bg-background text-foreground">
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="friends">Friends Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Email Notifications</h4>
                <p className="text-sm text-muted-foreground">Receive updates via email</p>
              </div>
              <input type="checkbox" className="rounded" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Push Notifications</h4>
                <p className="text-sm text-muted-foreground">Receive push notifications</p>
              </div>
              <input type="checkbox" className="rounded" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Marketing Emails</h4>
                <p className="text-sm text-muted-foreground">Receive promotional content</p>
              </div>
              <input type="checkbox" className="rounded" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Artist Updates</h4>
                <p className="text-sm text-muted-foreground">New artworks from followed artists</p>
              </div>
              <input type="checkbox" className="rounded" defaultChecked />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          Save Settings
        </button>
      </div>
    </div>
  )
}

export default SocialFeaturesPage
