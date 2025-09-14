import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Users, Camera, Sparkles, ArrowRight, Loader } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { showErrorToast } from '../../utils/errorHandling'

interface TrendingData {
  artworks: Array<{
    id: string
    title: string
    artist: { name: string; slug: string }
    primaryImageUrl?: string
    price?: number
    currency?: string
    viewsCount?: number
    likesCount?: number
    salesCount?: number
    trendScore?: number
  }>
  artists: Array<{
    id: string
    name: string
    slug: string
    avatarUrl?: string
    artworkCount?: number
    followersCount?: number
    trendScore?: number
  }>
  styles: Array<{
    name: string
    count: number
    trendScore: number
    featuredArtwork?: {
      id: string
      title: string
      primaryImageUrl?: string
      artist: { name: string; slug: string }
    }
  }>
  mediums: Array<{
    name: string
    count: number
    trendScore: number
    featuredArtwork?: {
      id: string
      title: string
      primaryImageUrl?: string
      artist: { name: string; slug: string }
    }
  }>
}

interface DynamicMegaMenuProps {
  isOpen: boolean
  onClose: () => void
  className?: string
}

const DynamicMegaMenu: React.FC<DynamicMegaMenuProps> = ({
  isOpen,
  onClose,
  className = ''
}) => {
  const [trendingData, setTrendingData] = useState<TrendingData | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'artworks' | 'artists' | 'styles' | 'mediums'>('artworks')

  useEffect(() => {
    if (isOpen) {
      loadTrendingData()
    }
  }, [isOpen])

  const loadTrendingData = async () => {
    try {
      setLoading(true)
      
      // Load trending artworks (based on views, likes, sales in last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: artworks, error: artworksError } = await supabase
        .from('artworks')
        .select(`
          id, title, price, currency, primary_image_url, created_at,
          view_count, like_count, sales_count,
          profiles!artworks_user_id_fkey(name, slug)
        `)
        .eq('status', 'available')
        .not('primary_image_url', 'is', null)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('view_count', { ascending: false })
        .limit(12)

      if (artworksError) throw artworksError

      // Load trending artists (based on follower growth, artwork views)
      const { data: artists, error: artistsError } = await supabase
        .from('profiles')
        .select(`
          id, name, slug, avatar_url,
          artworks!artworks_user_id_fkey(id, view_count, like_count)
        `)
        .eq('role', 'artist')
        .not('avatar_url', 'is', null)
        .limit(8)

      if (artistsError) throw artistsError

      // Calculate trend scores and process data
      const processedArtworks = (artworks || []).map(artwork => ({
        id: artwork.id,
        title: artwork.title,
        artist: {
          name: artwork.profiles?.name || 'Unknown Artist',
          slug: artwork.profiles?.slug || ''
        },
        primaryImageUrl: artwork.primary_image_url,
        price: artwork.price,
        currency: artwork.currency,
        viewsCount: artwork.view_count || 0,
        likesCount: artwork.like_count || 0,
        salesCount: artwork.sales_count || 0,
        trendScore: calculateTrendScore(artwork.view_count || 0, artwork.like_count || 0, artwork.sales_count || 0)
      }))

      const processedArtists = (artists || []).map(artist => {
        const totalViews = artist.artworks?.reduce((sum: number, artwork: any) => sum + (artwork.view_count || 0), 0) || 0
        const totalLikes = artist.artworks?.reduce((sum: number, artwork: any) => sum + (artwork.like_count || 0), 0) || 0
        
        return {
          id: artist.id,
          name: artist.name,
          slug: artist.slug,
          avatarUrl: artist.avatar_url,
          artworkCount: artist.artworks?.length || 0,
          followersCount: 0,
          trendScore: calculateTrendScore(totalViews, totalLikes, 0)
        }
      })

      // Calculate trending styles and mediums
      const { data: styleData, error: styleError } = await supabase
        .from('artworks')
        .select('style, primary_image_url, title, profiles!artworks_user_id_fkey(name, slug)')
        .eq('status', 'available')
        .not('style', 'is', null)
        .not('primary_image_url', 'is', null)
        .gte('created_at', thirtyDaysAgo.toISOString())

      if (styleError) throw styleError

      const styleCounts = new Map<string, { count: number; artworks: any[] }>()
      ;(styleData || []).forEach(artwork => {
        const style = artwork.style.toLowerCase()
        if (!styleCounts.has(style)) {
          styleCounts.set(style, { count: 0, artworks: [] })
        }
        const existing = styleCounts.get(style)!
        existing.count++
        if (existing.artworks.length < 1) {
          existing.artworks.push(artwork)
        }
      })

      const trendingStyles = Array.from(styleCounts.entries())
        .map(([name, data]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          count: data.count,
          trendScore: data.count * 0.8, // Simple trend calculation
          featuredArtwork: data.artworks[0] ? {
            id: data.artworks[0].id,
            title: data.artworks[0].title,
            primaryImageUrl: data.artworks[0].primary_image_url,
            artist: {
              name: data.artworks[0].profiles?.name || 'Unknown Artist',
              slug: data.artworks[0].profiles?.slug || ''
            }
          } : undefined
        }))
        .sort((a, b) => b.trendScore - a.trendScore)
        .slice(0, 6)

      // Similar for mediums
      const { data: mediumData, error: mediumError } = await supabase
        .from('artworks')
        .select('medium, primary_image_url, title, profiles!artworks_user_id_fkey(name, slug)')
        .eq('status', 'available')
        .not('medium', 'is', null)
        .not('primary_image_url', 'is', null)
        .gte('created_at', thirtyDaysAgo.toISOString())

      if (mediumError) throw mediumError

      const mediumCounts = new Map<string, { count: number; artworks: any[] }>()
      ;(mediumData || []).forEach(artwork => {
        const medium = artwork.medium.toLowerCase()
        if (!mediumCounts.has(medium)) {
          mediumCounts.set(medium, { count: 0, artworks: [] })
        }
        const existing = mediumCounts.get(medium)!
        existing.count++
        if (existing.artworks.length < 1) {
          existing.artworks.push(artwork)
        }
      })

      const trendingMediums = Array.from(mediumCounts.entries())
        .map(([name, data]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          count: data.count,
          trendScore: data.count * 0.8,
          featuredArtwork: data.artworks[0] ? {
            id: data.artworks[0].id,
            title: data.artworks[0].title,
            primaryImageUrl: data.artworks[0].primary_image_url,
            artist: {
              name: data.artworks[0].profiles?.name || 'Unknown Artist',
              slug: data.artworks[0].profiles?.slug || ''
            }
          } : undefined
        }))
        .sort((a, b) => b.trendScore - a.trendScore)
        .slice(0, 6)

      setTrendingData({
        artworks: processedArtworks,
        artists: processedArtists,
        styles: trendingStyles,
        mediums: trendingMediums
      })

    } catch (error) {
      console.error('Error loading trending data:', error)
      showErrorToast('Failed to load trending content')
    } finally {
      setLoading(false)
    }
  }

  const calculateTrendScore = (views: number, likes: number, sales: number): number => {
    // Weighted calculation: views (1x), likes (2x), sales (5x)
    return (views * 1) + (likes * 2) + (sales * 5)
  }

  const renderArtworkCard = (artwork: any) => (
    <Link
      key={artwork.id}
      to={`/artwork/${artwork.id}`}
      className="mega-menu-artwork-card"
      onClick={onClose}
    >
      <div className="artwork-image">
        {artwork.primaryImageUrl ? (
          <img src={artwork.primaryImageUrl} alt={artwork.title} />
        ) : (
          <div className="placeholder-image" />
        )}
        <div className="trend-badge">
          <TrendingUp size={12} />
          <span>{Math.round(artwork.trendScore)}</span>
        </div>
      </div>
      <div className="artwork-info">
        <h4 className="artwork-title">{artwork.title}</h4>
        <p className="artwork-artist">{artwork.artist.name}</p>
        {artwork.price && (
          <p className="artwork-price">
            R {artwork.price.toLocaleString()}
          </p>
        )}
        <div className="artwork-stats">
          <span>{artwork.viewsCount} views</span>
          <span>{artwork.likesCount} likes</span>
        </div>
      </div>
    </Link>
  )

  const renderArtistCard = (artist: any) => (
    <Link
      key={artist.id}
      to={`/artist/${artist.slug}`}
      className="mega-menu-artist-card"
      onClick={onClose}
    >
      <div className="artist-avatar">
        {artist.avatarUrl ? (
          <img src={artist.avatarUrl} alt={artist.name} />
        ) : (
          <div className="placeholder-avatar" />
        )}
        <div className="trend-badge">
          <TrendingUp size={12} />
          <span>{Math.round(artist.trendScore)}</span>
        </div>
      </div>
      <div className="artist-info">
        <h4 className="artist-name">{artist.name}</h4>
        <p className="artist-stats">
          {artist.artworkCount} artworks • {artist.followersCount} followers
        </p>
      </div>
    </Link>
  )

  const renderCategoryCard = (category: any) => (
    <Link
      key={category.name}
      to={`/search?${activeTab}=${category.name.toLowerCase()}`}
      className="mega-menu-category-card"
      onClick={onClose}
    >
      <div className="category-image">
        {category.featuredArtwork?.primaryImageUrl ? (
          <img src={category.featuredArtwork.primaryImageUrl} alt={category.name} />
        ) : (
          <div className="placeholder-image" />
        )}
        <div className="trend-badge">
          <TrendingUp size={12} />
          <span>{Math.round(category.trendScore)}</span>
        </div>
      </div>
      <div className="category-info">
        <h4 className="category-name">{category.name}</h4>
        <p className="category-count">{category.count} artworks</p>
        {category.featuredArtwork && (
          <p className="featured-artwork">
            Featured: {category.featuredArtwork.title}
          </p>
        )}
      </div>
    </Link>
  )

  if (!isOpen) return null

  return (
    <div className={`dynamic-mega-menu ${className}`}>
      <div className="mega-menu-content">
        <div className="mega-menu-header">
          <div className="mega-menu-tabs">
            <button
              className={`tab ${activeTab === 'artworks' ? 'active' : ''}`}
              onClick={() => setActiveTab('artworks')}
            >
              <Camera size={16} />
              Trending Artworks
            </button>
            <button
              className={`tab ${activeTab === 'artists' ? 'active' : ''}`}
              onClick={() => setActiveTab('artists')}
            >
              <Users size={16} />
              Rising Artists
            </button>
            <button
              className={`tab ${activeTab === 'styles' ? 'active' : ''}`}
              onClick={() => setActiveTab('styles')}
            >
              <Sparkles size={16} />
              Hot Styles
            </button>
            <button
              className={`tab ${activeTab === 'mediums' ? 'active' : ''}`}
              onClick={() => setActiveTab('mediums')}
            >
              <TrendingUp size={16} />
              Popular Mediums
            </button>
          </div>
        </div>

        <div className="mega-menu-body">
          {loading ? (
            <div className="loading-state">
              <Loader size={24} className="spinner" />
              <p>Loading trending content...</p>
            </div>
          ) : trendingData ? (
            <div className="mega-menu-grid">
              {activeTab === 'artworks' && trendingData.artworks.map(renderArtworkCard)}
              {activeTab === 'artists' && trendingData.artists.map(renderArtistCard)}
              {activeTab === 'styles' && trendingData.styles.map(renderCategoryCard)}
              {activeTab === 'mediums' && trendingData.mediums.map(renderCategoryCard)}
            </div>
          ) : (
            <div className="empty-state">
              <p>No trending content available</p>
            </div>
          )}
        </div>

        <div className="mega-menu-footer">
          <Link to="/search" className="view-all-link" onClick={onClose}>
            View All Trending
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default DynamicMegaMenu
