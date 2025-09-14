import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthProvider'
import Container from '../../components/ui/Container'
import { showErrorToast } from '../../utils/errorHandling'
import Icon from '../../components/icons/Icon'

interface DashboardStats {
  totalFavorites: number
  totalConversations: number
  totalPurchases: number
  totalSpent: number
}

interface RecentActivity {
  id: string
  type: 'favorite' | 'message' | 'purchase' | 'view'
  title: string
  description: string
  timestamp: string
  artwork?: {
    id: string
    title: string
    primary_image_url: string
    price: number
    currency: string
  }
  artist?: {
    name: string
    slug: string
  }
}

interface RecommendedArtwork {
  id: string
  title: string
  artist: {
    name: string
    slug: string
    avatar_url?: string
  }
  primary_image_url: string
  price: number
  currency: string
  medium: string
  year: number
  genre: string
}

const CollectorDashboard: React.FC = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalFavorites: 0,
    totalConversations: 0,
    totalPurchases: 0,
    totalSpent: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [recommendedArtworks, setRecommendedArtworks] = useState<RecommendedArtwork[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load stats
      await Promise.all([
        loadStats(),
        loadRecentActivity(),
        loadRecommendedArtworks()
      ])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      showErrorToast('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const [favoritesResult, conversationsResult, purchasesResult] = await Promise.all([
        supabase
          .from('user_favorites')
          .select('id', { count: 'exact' })
          .eq('user_id', user?.id),
        
        supabase
          .from('conversations')
          .select('id', { count: 'exact' })
          .eq('inquirer_user_id', user?.id),
        
        supabase
          .from('user_collection')
          .select('id, purchase_price', { count: 'exact' })
          .eq('user_id', user?.id)
      ])

      const totalSpent = purchasesResult.data?.reduce((sum, purchase) => 
        sum + (purchase.purchase_price || 0), 0) || 0

      setStats({
        totalFavorites: favoritesResult.count || 0,
        totalConversations: conversationsResult.count || 0,
        totalPurchases: purchasesResult.count || 0,
        totalSpent
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const loadRecentActivity = async () => {
    try {
      // Load recent favorites
      const { data: favorites } = await supabase
        .from('user_favorites')
        .select(`
          created_at,
          artworks!inner(
            id, title, primary_image_url, price, currency,
            profiles!artworks_user_id_fkey(display_name, slug)
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5)

      // Load recent conversations
      const { data: conversations } = await supabase
        .from('conversations')
        .select(`
          id, last_message_at, last_message_preview,
          artworks!inner(id, title, primary_image_url, price, currency),
          profiles!conversations_artist_id_fkey(display_name, slug)
        `)
        .eq('inquirer_user_id', user?.id)
        .order('last_message_at', { ascending: false })
        .limit(5)

      const activities: RecentActivity[] = []

      // Process favorites
      favorites?.forEach(favorite => {
        activities.push({
          id: `favorite-${favorite.created_at}`,
          type: 'favorite',
          title: 'Added to favorites',
          description: favorite.artworks.title,
          timestamp: favorite.created_at,
          artwork: {
            id: favorite.artworks.id,
            title: favorite.artworks.title,
            primary_image_url: favorite.artworks.primary_image_url,
            price: favorite.artworks.price,
            currency: favorite.artworks.currency
          },
          artist: {
            name: favorite.artworks.profiles?.display_name || 'Unknown',
            slug: favorite.artworks.profiles?.slug || ''
          }
        })
      })

      // Process conversations
      conversations?.forEach(conversation => {
        activities.push({
          id: `conversation-${conversation.id}`,
          type: 'message',
          title: 'New message',
          description: conversation.last_message_preview || 'Started conversation',
          timestamp: conversation.last_message_at,
          artwork: {
            id: conversation.artworks.id,
            title: conversation.artworks.title,
            primary_image_url: conversation.artworks.primary_image_url,
            price: conversation.artworks.price,
            currency: conversation.artworks.currency
          },
          artist: {
            name: conversation.profiles?.display_name || 'Unknown',
            slug: conversation.profiles?.slug || ''
          }
        })
      })

      // Sort by timestamp and take the most recent 10
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setRecentActivity(activities.slice(0, 10))
    } catch (error) {
      console.error('Error loading recent activity:', error)
    }
  }

  const loadRecommendedArtworks = async () => {
    try {
      const { data, error } = await supabase
        .from('artworks')
        .select(`
          id, title, primary_image_url, price, currency, medium, year, genre,
          profiles!artworks_user_id_fkey(display_name, slug, avatar_url)
        `)
        .eq('status', 'available')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(6)

      if (error) throw error

      const artworks: RecommendedArtwork[] = (data || []).map(artwork => ({
        id: artwork.id,
        title: artwork.title || 'Untitled',
        artist: {
          name: artwork.profiles?.display_name || 'Unknown Artist',
          slug: artwork.profiles?.slug || '',
          avatar_url: artwork.profiles?.avatar_url
        },
        primary_image_url: artwork.primary_image_url || '',
        price: artwork.price || 0,
        currency: artwork.currency || 'ZAR',
        medium: artwork.medium || '',
        year: artwork.year || new Date().getFullYear(),
        genre: artwork.genre || ''
      }))

      setRecommendedArtworks(artworks)
    } catch (error) {
      console.error('Error loading recommended artworks:', error)
    }
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency
    }).format(price)
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' })
  }

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
        <title>Dashboard | ArtFlow</title>
      </Helmet>

      <div className="py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-gray-600 mt-2">Here's what's happening in your art collection</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Icon name="heart" size={24} color="#ef4444" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Favorites</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalFavorites}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Icon name="message-square" size={24} color="#3b82f6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Conversations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalConversations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Icon name="shopping-bag" size={24} color="#10b981" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Purchases</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPurchases}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Icon name="dollar-sign" size={24} color="#8b5cf6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(stats.totalSpent, 'ZAR')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                <Link
                  to="/favorites"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  View all
                </Link>
              </div>
            </div>
            
            <div className="p-6">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Icon name="activity" size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {activity.type === 'favorite' ? (
                          <div className="p-2 bg-red-100 rounded-full">
                            <Icon name="heart" size={16} color="#ef4444" />
                          </div>
                        ) : (
                          <div className="p-2 bg-blue-100 rounded-full">
                            <Icon name="message-square" size={16} color="#3b82f6" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                        {activity.artist && (
                          <p className="text-xs text-gray-500">
                            by {activity.artist.name}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recommended Artworks */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recommended for You</h2>
                <Link
                  to="/explore"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Explore more
                </Link>
              </div>
            </div>
            
            <div className="p-6">
              {recommendedArtworks.length === 0 ? (
                <div className="text-center py-8">
                  <Icon name="search" size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No recommendations available</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {recommendedArtworks.map((artwork) => (
                    <div key={artwork.id} className="group cursor-pointer">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
                        <img
                          src={artwork.primary_image_url || '/placeholder-artwork.jpg'}
                          alt={artwork.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 truncate">{artwork.title}</h3>
                      <p className="text-xs text-gray-600 truncate">{artwork.artist.name}</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatPrice(artwork.price, artwork.currency)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/explore"
              className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-2 bg-blue-100 rounded-lg mr-4">
                <Icon name="search" size={24} color="#3b82f6" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Explore Artworks</h3>
                <p className="text-sm text-gray-600">Discover new pieces</p>
              </div>
            </Link>

            <Link
              to="/favorites"
              className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-2 bg-red-100 rounded-lg mr-4">
                <Icon name="heart" size={24} color="#ef4444" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">View Favorites</h3>
                <p className="text-sm text-gray-600">See saved artworks</p>
              </div>
            </Link>

            <Link
              to="/vault"
              className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-2 bg-green-100 rounded-lg mr-4">
                <Icon name="shopping-bag" size={24} color="#10b981" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">My Collection</h3>
                <p className="text-sm text-gray-600">Manage purchases</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default CollectorDashboard
