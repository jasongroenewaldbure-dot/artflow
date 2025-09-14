import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSearchParams } from 'react-router-dom'
import { Grid, SortAsc, Loader } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { showErrorToast } from '../../utils/errorHandling'
import Container from '../../components/ui/Container'
import ArtworkCard from '../../components/marketplace/ArtworkCard'
import IntelligentFilterSystem from '../../components/marketplace/IntelligentFilterSystem'
import { useAuth } from '../../contexts/AuthProvider'

interface Artwork {
  id: string
  title: string
  artist: {
    name: string
    slug: string
  }
  primaryImageUrl?: string
  price?: number
  currency?: string
  dimensions?: {
    width: number
    height: number
    depth?: number
  }
  year?: number
  medium?: string
  style?: string
  genre?: string
  subject?: string
  isForSale?: boolean
  isLiked?: boolean
  likesCount?: number
  viewsCount?: number
  isNew?: boolean
  isTrending?: boolean
  isFeatured?: boolean
  dominantColors?: string[]
  createdAt: string
}

interface FilterState {
  search: string
  mediums: string[]
  styles: string[]
  colors: string[]
  priceRange: [number, number]
  sizes: string[]
  availability: string[]
  artists: string[]
  locations: string[]
  years: [number, number]
  orientations: string[]
  materials: string[]
  sortBy: string
}

const ArtworksPage: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [filteredArtworks, setFilteredArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()

  // Initialize filters from URL params
  const initialFilters: FilterState = {
    search: searchParams.get('search') || '',
    mediums: searchParams.get('mediums')?.split(',') || [],
    styles: searchParams.get('styles')?.split(',') || [],
    colors: searchParams.get('colors')?.split(',') || [],
    priceRange: [
      parseInt(searchParams.get('priceMin') || '0'),
      parseInt(searchParams.get('priceMax') || '100000')
    ],
    sizes: searchParams.get('sizes')?.split(',') || [],
    availability: searchParams.get('availability')?.split(',') || ['available'],
    artists: searchParams.get('artists')?.split(',') || [],
    locations: searchParams.get('locations')?.split(',') || [],
    years: [
      parseInt(searchParams.get('yearMin') || '1900'),
      parseInt(searchParams.get('yearMax') || new Date().getFullYear().toString())
    ],
    orientations: searchParams.get('orientations')?.split(',') || [],
    materials: searchParams.get('materials')?.split(',') || [],
    sortBy: searchParams.get('sortBy') || 'relevance'
  }

  const [filters, setFilters] = useState<FilterState>(initialFilters)

  useEffect(() => {
    loadArtworks()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [artworks, filters])

  const loadArtworks = async () => {
    try {
      setLoading(true)
      setError('')

      const { data, error } = await supabase
        .from('artworks')
        .select(`
          id, title, price, currency, medium, genre, style, subject, year, dimensions, 
          primary_image_url, status, created_at, view_count, like_count,
          dominant_colors, width_cm, height_cm, depth_cm,
          profiles!artworks_user_id_fkey(display_name, slug)
        `)
        .eq('status', 'available')
        .not('primary_image_url', 'is', null)
        .order('created_at', { ascending: false })

      if (error) throw error

      const processedArtworks: Artwork[] = (data || []).map(artwork => ({
        id: artwork.id,
        title: artwork.title,
        artist: {
          name: artwork.profiles?.[0]?.display_name || 'Unknown Artist',
          slug: artwork.profiles?.[0]?.slug || ''
        },
        primaryImageUrl: artwork.primary_image_url,
        price: artwork.price ? artwork.price.toString() : undefined,
        currency: artwork.currency || 'ZAR',
        dimensions: artwork.dimensions ? {
          width: artwork.dimensions.width,
          height: artwork.dimensions.height,
          depth: artwork.dimensions.depth
        } : undefined,
        year: artwork.year,
        medium: artwork.medium,
        style: artwork.style,
        genre: artwork.genre,
        subject: artwork.subject,
        isForSale: artwork.status === 'available',
        isLiked: false, // TODO: Load from user favorites
        likesCount: artwork.like_count || 0,
        viewsCount: artwork.view_count || 0,
        isNew: new Date(artwork.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        isTrending: (artwork.view_count || 0) > 100,
        isFeatured: false, // TODO: Load from featured artworks
        dominantColors: Array.isArray(artwork.dominant_colors) 
          ? artwork.dominant_colors 
          : artwork.dominant_colors ? [artwork.dominant_colors] : [],
        createdAt: artwork.created_at
      }))

      setArtworks(processedArtworks)
    } catch (error) {
      console.error('Error loading artworks:', error)
      setError('Failed to load artworks')
      showErrorToast('Failed to load artworks')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...artworks]

    // Search filter
    if (filters.search) {
      const query = filters.search.toLowerCase()
      filtered = filtered.filter(artwork =>
        artwork.title.toLowerCase().includes(query) ||
        artwork.artist.name.toLowerCase().includes(query) ||
        artwork.medium?.toLowerCase().includes(query) ||
        artwork.style?.toLowerCase().includes(query) ||
        artwork.genre?.toLowerCase().includes(query) ||
        artwork.subject?.toLowerCase().includes(query)
      )
    }

    // Medium filter
    if (filters.mediums.length > 0) {
      filtered = filtered.filter(artwork =>
        artwork.medium && filters.mediums.includes(artwork.medium.toLowerCase())
      )
    }

    // Style filter
    if (filters.styles.length > 0) {
      filtered = filtered.filter(artwork =>
        artwork.style && filters.styles.includes(artwork.style.toLowerCase())
      )
    }

    // Color filter
    if (filters.colors.length > 0) {
      filtered = filtered.filter(artwork =>
        artwork.dominantColors?.some(color => 
          filters.colors.includes(color.toLowerCase())
        )
      )
    }

    // Price filter
    filtered = filtered.filter(artwork => {
      const price = artwork.price || 0
      return price >= filters.priceRange[0] && price <= filters.priceRange[1]
    })

    // Size filter
    if (filters.sizes.length > 0) {
      filtered = filtered.filter(artwork => {
        if (!artwork.dimensions) return false
        const maxDim = Math.max(artwork.dimensions.width, artwork.dimensions.height)
        return filters.sizes.some(size => {
          switch (size) {
            case 'small': return maxDim <= 50
            case 'medium': return maxDim > 50 && maxDim <= 120
            case 'large': return maxDim > 120
            default: return true
          }
        })
      })
    }

    // Year filter
    filtered = filtered.filter(artwork => {
      const year = artwork.year || new Date().getFullYear()
      return year >= filters.years[0] && year <= filters.years[1]
    })

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'price-low':
          return (a.price || 0) - (b.price || 0)
        case 'price-high':
          return (b.price || 0) - (a.price || 0)
        case 'popular':
          return (b.viewsCount || 0) - (a.viewsCount || 0)
        case 'trending':
          return (b.likesCount || 0) - (a.likesCount || 0)
        default:
          return 0
      }
    })

    setFilteredArtworks(filtered)
  }

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    
    // Update URL params
    const params = new URLSearchParams()
    if (newFilters.search) params.set('search', newFilters.search)
    if (newFilters.mediums.length > 0) params.set('mediums', newFilters.mediums.join(','))
    if (newFilters.styles.length > 0) params.set('styles', newFilters.styles.join(','))
    if (newFilters.colors.length > 0) params.set('colors', newFilters.colors.join(','))
    if (newFilters.sizes.length > 0) params.set('sizes', newFilters.sizes.join(','))
    if (newFilters.sortBy !== 'relevance') params.set('sortBy', newFilters.sortBy)
    
    setSearchParams(params)
  }

  const handleLike = async (artworkId: string) => {
    if (!user) return
    
    try {
      // TODO: Implement like functionality
      console.log('Like artwork:', artworkId)
    } catch (error) {
      console.error('Error liking artwork:', error)
    }
  }

  const handleAddToCollection = async (artworkId: string) => {
    if (!user) return
    
    try {
      // TODO: Implement add to collection functionality
      console.log('Add to collection:', artworkId)
    } catch (error) {
      console.error('Error adding to collection:', error)
    }
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        flexDirection: 'column',
        gap: 'var(--space-lg)'
      }}>
        <Loader size={32} className="spinner" />
        <p style={{ color: 'var(--muted)' }}>Loading artworks...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        flexDirection: 'column',
        gap: 'var(--space-lg)'
      }}>
        <p style={{ color: 'var(--destructive)' }}>{error}</p>
        <button
          onClick={loadArtworks}
          style={{
            padding: 'var(--space-sm) var(--space-md)',
            backgroundColor: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Artworks - ArtFlow</title>
        <meta name="description" content="Discover and explore artworks from emerging and established artists" />
      </Helmet>

      <Container maxWidth="2xl" padding="lg">
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            marginBottom: 'var(--space-sm)',
            color: 'var(--text)'
          }}>
            Artworks
          </h1>
          <p style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--space-lg)'
          }}>
            Discover {filteredArtworks.length.toLocaleString()} artworks from emerging and established artists
          </p>

          {/* Filter System */}
          <IntelligentFilterSystem
            onFiltersChange={handleFiltersChange}
            initialFilters={filters}
            context="artworks"
          />
        </div>

        {/* Results */}
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--space-md)'
          }}>
            <p style={{ color: 'var(--text-secondary)' }}>
              Showing {filteredArtworks.length} of {artworks.length} artworks
            </p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <SortAsc size={16} />
              <select
                value={filters.sortBy}
                onChange={(e) => handleFiltersChange({ ...filters, sortBy: e.target.value })}
                style={{
                  padding: 'var(--space-xs) var(--space-sm)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--text)'
                }}
              >
                <option value="relevance">Relevance</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
                <option value="trending">Most Liked</option>
              </select>
            </div>
          </div>

          {filteredArtworks.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: 'var(--space-xl)',
              color: 'var(--text-secondary)'
            }}>
              <Grid size={48} style={{ marginBottom: 'var(--space-md)', opacity: 0.5 }} />
              <h3 style={{ marginBottom: 'var(--space-sm)' }}>No artworks found</h3>
              <p>Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 'var(--space-lg)'
            }}>
              {filteredArtworks.map(artwork => (
                <ArtworkCard
                  key={artwork.id}
                  artwork={artwork}
                  onLike={() => handleLike(artwork.id)}
                  onAddToCollection={() => handleAddToCollection(artwork.id)}
                  showActions={!!user}
                />
              ))}
            </div>
          )}
        </div>
      </Container>
    </>
  )
}

export default ArtworksPage
