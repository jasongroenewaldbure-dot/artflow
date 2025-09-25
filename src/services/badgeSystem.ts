import { supabase } from '../lib/supabase'

export interface Badge {
  id: string
  type: 'emerging' | 'trending' | 'collector_interest' | 'featured' | 'sold_out' | 'limited_edition'
  label: string
  description: string
  color: string
  icon: string
  priority: number
  expiresAt?: string
}

export interface BadgeData {
  artworkId?: string
  artistId?: string
  catalogueId?: string
  badges: Badge[]
  lastUpdated: string
}

// Badge definitions
export const BADGE_DEFINITIONS: Record<string, Omit<Badge, 'id'>> = {
  emerging_artist: {
    type: 'emerging',
    label: 'Emerging',
    description: 'New artist on the platform',
    color: '#10B981', // green
    icon: 'sparkles',
    priority: 1
  },
  trending_artwork: {
    type: 'trending',
    label: 'Trending',
    description: 'High engagement and views',
    color: '#F59E0B', // amber
    icon: 'trending-up',
    priority: 2
  },
  collector_interest: {
    type: 'collector_interest',
    label: 'Collector Interest',
    description: 'High collector engagement',
    color: '#8B5CF6', // purple
    icon: 'heart',
    priority: 3
  },
  featured: {
    type: 'featured',
    label: 'Featured',
    description: 'Curator selected',
    color: '#EF4444', // red
    icon: 'star',
    priority: 4
  },
  sold_out: {
    type: 'sold_out',
    label: 'Sold Out',
    description: 'No longer available',
    color: '#6B7280', // gray
    icon: 'check-circle',
    priority: 5
  },
  limited_edition: {
    type: 'limited_edition',
    label: 'Limited Edition',
    description: 'Limited quantity available',
    color: '#DC2626', // red-600
    icon: 'award',
    priority: 6
  }
}

// Calculate badges for an artwork
export async function calculateArtworkBadges(artworkId: string): Promise<Badge[]> {
  const badges: Badge[] = []
  
  try {
    // Get artwork data
    const { data: artwork, error: artworkError } = await supabase
      .from('artworks')
      .select(`
        *,
        user:profiles!artworks_user_id_fkey(*)
      `)
      .eq('id', artworkId)
      .single()

    if (artworkError || !artwork) return badges

    // Check if sold out
    if (artwork.status === 'sold') {
      badges.push({
        id: 'sold_out',
        ...BADGE_DEFINITIONS.sold_out
      })
    }

    // Check if limited edition (based on edition size)
    if (artwork.edition_size && artwork.edition_size <= 10) {
      badges.push({
        id: 'limited_edition',
        ...BADGE_DEFINITIONS.limited_edition
      })
    }

    // Get engagement metrics
    const { data: metrics } = await supabase
      .from('artwork_metrics')
      .select('view_count, favorite_count, inquiry_count, share_count')
      .eq('artwork_id', artworkId)
      .single()

    if (metrics) {
      // Calculate trending score based on recent activity
      const trendingScore = calculateTrendingScore(metrics)
      
      if (trendingScore > 0.7) {
        badges.push({
          id: 'trending_artwork',
          ...BADGE_DEFINITIONS.trending_artwork
        })
      }

      // Check collector interest
      if (metrics.inquiry_count > 5 || metrics.favorite_count > 10) {
        badges.push({
          id: 'collector_interest',
          ...BADGE_DEFINITIONS.collector_interest
        })
      }
    }

    // Check if artist is emerging (less than 30 days old)
    if (artwork.user) {
      const artistAge = Date.now() - new Date(artwork.user.created_at).getTime()
      const thirtyDays = 30 * 24 * 60 * 60 * 1000
      
      if (artistAge < thirtyDays) {
        badges.push({
          id: 'emerging_artist',
          ...BADGE_DEFINITIONS.emerging_artist
        })
      }
    }

  } catch (error) {
    console.error('Error calculating artwork badges:', error)
  }

  return badges.sort((a, b) => a.priority - b.priority)
}

// Calculate badges for an artist
export async function calculateArtistBadges(artistId: string): Promise<Badge[]> {
  const badges: Badge[] = []
  
  try {
    // Get artist data
    const { data: artist, error: artistError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', artistId)
      .single()

    if (artistError || !artist) return badges

    // Check if emerging artist
    const artistAge = Date.now() - new Date(artist.created_at).getTime()
    const thirtyDays = 30 * 24 * 60 * 60 * 1000
    
    if (artistAge < thirtyDays) {
      badges.push({
        id: 'emerging_artist',
        ...BADGE_DEFINITIONS.emerging_artist
      })
    }

    // Get artist's artwork metrics
    const { data: artworks } = await supabase
      .from('artworks')
      .select(`
        id,
        artwork_metrics(view_count, favorite_count, inquiry_count)
      `)
      .eq('user_id', artistId)

    if (artworks && artworks.length > 0) {
      // Calculate total engagement
      const totalViews = artworks.reduce((sum, artwork) => 
        sum + (artwork.artwork_metrics?.[0]?.view_count || 0), 0)
      const totalFavorites = artworks.reduce((sum, artwork) => 
        sum + (artwork.artwork_metrics?.[0]?.favorite_count || 0), 0)
      const totalInquiries = artworks.reduce((sum, artwork) => 
        sum + (artwork.artwork_metrics?.[0]?.inquiry_count || 0), 0)

      // Check if trending artist
      if (totalViews > 1000 || totalFavorites > 50) {
        badges.push({
          id: 'trending_artist',
          type: 'trending',
          label: 'Trending Artist',
          description: 'High engagement across artworks',
          color: '#F59E0B',
          icon: 'trending-up',
          priority: 2
        })
      }

      // Check collector interest
      if (totalInquiries > 20 || totalFavorites > 100) {
        badges.push({
          id: 'collector_interest',
          ...BADGE_DEFINITIONS.collector_interest
        })
      }
    }

  } catch (error) {
    console.error('Error calculating artist badges:', error)
  }

  return badges.sort((a, b) => a.priority - b.priority)
}

// Calculate badges for a catalogue
export async function calculateCatalogueBadges(catalogueId: string): Promise<Badge[]> {
  const badges: Badge[] = []
  
  try {
    // Get catalogue data
    const { data: catalogue, error: catalogueError } = await supabase
      .from('catalogues')
      .select('*')
      .eq('id', catalogueId)
      .single()

    if (catalogueError || !catalogue) return badges

    // Get catalogue metrics
    const { data: metrics } = await supabase
      .from('catalogue_metrics')
      .select('view_count, share_count, download_count')
      .eq('catalogue_id', catalogueId)
      .single()

    if (metrics) {
      // Check if trending catalogue
      if (metrics.view_count > 500 || metrics.share_count > 20) {
        badges.push({
          id: 'trending_catalogue',
          type: 'trending',
          label: 'Trending',
          description: 'High engagement and shares',
          color: '#F59E0B',
          icon: 'trending-up',
          priority: 2
        })
      }

      // Check collector interest
      if (metrics.download_count > 50) {
        badges.push({
          id: 'collector_interest',
          ...BADGE_DEFINITIONS.collector_interest
        })
      }
    }

  } catch (error) {
    console.error('Error calculating catalogue badges:', error)
  }

  return badges.sort((a, b) => a.priority - b.priority)
}

// Calculate trending score based on metrics
function calculateTrendingScore(metrics: any): number {
  const weights = {
    view_count: 0.3,
    favorite_count: 0.4,
    inquiry_count: 0.2,
    share_count: 0.1
  }

  const scores = {
    view_count: Math.min(metrics.view_count / 100, 1),
    favorite_count: Math.min(metrics.favorite_count / 20, 1),
    inquiry_count: Math.min(metrics.inquiry_count / 10, 1),
    share_count: Math.min(metrics.share_count / 5, 1)
  }

  return Object.keys(weights).reduce((total, key) => {
    return total + (scores[key as keyof typeof scores] * weights[key as keyof typeof weights])
  }, 0)
}

// Cache badge data
const badgeCache = new Map<string, BadgeData>()

export async function getBadges(
  type: 'artwork' | 'artist' | 'catalogue',
  id: string,
  forceRefresh = false
): Promise<Badge[]> {
  const cacheKey = `${type}_${id}`
  
  // Check cache first
  if (!forceRefresh && badgeCache.has(cacheKey)) {
    const cached = badgeCache.get(cacheKey)!
    const now = Date.now()
    const lastUpdated = new Date(cached.lastUpdated).getTime()
    
    // Cache for 5 minutes
    if (now - lastUpdated < 5 * 60 * 1000) {
      return cached.badges
    }
  }

  // Calculate badges
  let badges: Badge[] = []
  
  switch (type) {
    case 'artwork':
      badges = await calculateArtworkBadges(id)
      break
    case 'artist':
      badges = await calculateArtistBadges(id)
      break
    case 'catalogue':
      badges = await calculateCatalogueBadges(id)
      break
  }

  // Cache the result
  badgeCache.set(cacheKey, {
    [type === 'artwork' ? 'artworkId' : type === 'artist' ? 'artistId' : 'catalogueId']: id,
    badges,
    lastUpdated: new Date().toISOString()
  })

  return badges
}

// Clear badge cache
export function clearBadgeCache(type?: string, id?: string) {
  if (type && id) {
    badgeCache.delete(`${type}_${id}`)
  } else {
    badgeCache.clear()
  }
}

// Get badge by type
export function getBadgeDefinition(type: string): Omit<Badge, 'id'> | null {
  return BADGE_DEFINITIONS[type] || null
}