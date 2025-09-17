import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthProvider'
import Icon from '@/components/icons/Icon'
import { showErrorToast } from '@/utils/errorHandling'
import Container from "../../components/common/Container"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import ErrorMessage from "../../components/common/ErrorMessage"
import HorizontalFilterSystem from '@/components/marketplace/HorizontalFilterSystem'

interface Artwork {
  id: string
  title: string
  price: number | null
  currency: string
  primary_image_url: string | null
  genre: string | null
  medium: string | null
  dimensions: any
  created_at: string
  rarity: string | null
  dominant_colors: string[] | null
  color_groups: string[] | null
  location: string | null
  subject: string | null
  orientation: string | null
  framing_status: string | null
  signature_info: any
  is_price_negotiable: boolean | null
  min_price: number | null
  max_price: number | null
  year: number | null
  condition: string | null
  has_certificate_of_authenticity: boolean | null
  view_count: number | null
  like_count: number | null
  inquiry_count: number | null
  artist: {
    id: string
    slug: string
    name: string
  }
}

interface FilterOptions {
  // Search
  searchQuery: string
  naturalLanguageQuery: string
  
  // Basic filters
  priceRange: string
  priceType: 'fixed' | 'negotiable' | 'all'
  minPrice: number | null
  maxPrice: number | null
  useLearnedBudget: boolean
  
  // Artwork properties
  genre: string
  medium: string
  rarity: string
  condition: string
  orientation: string
  subject: string
  
  // Visual properties
  dominantColors: string[]
  colorGroups: string[]
  
  // Physical properties
  size: string
  sizeType: 'predefined' | 'custom'
  minWidth: number | null
  maxWidth: number | null
  minHeight: number | null
  maxHeight: number | null
  
  // Location and framing
  location: string
  framingStatus: string
  signatureStatus: string
  
  // Authentication and documentation
  hasCoA: boolean | null
  year: number | null
  yearRange: string
  
  // Sorting
  sortBy: string
  sortDirection: 'asc' | 'desc'
  
  // User preferences (if logged in)
  usePersonalizedFilters: boolean
  learnedPreferences: boolean
}

const ArtworksPage: React.FC = () => {
  const { user } = useAuth()
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [filteredArtworks, setFilteredArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false) // Hidden - using horizontal filter system
  const [searchParams, setSearchParams] = useSearchParams()
  
  const [filters, setFilters] = useState<FilterOptions>({
    // Search
    searchQuery: searchParams.get('search') || '',
    naturalLanguageQuery: '',
    
    // Basic filters
    priceRange: searchParams.get('price_range') || 'all',
    priceType: (searchParams.get('price_type') as 'fixed' | 'negotiable' | 'all') || 'all',
    minPrice: searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')!) : null,
    maxPrice: searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')!) : null,
    useLearnedBudget: searchParams.get('use_learned_budget') === 'true',
    
    // Artwork properties
    genre: searchParams.get('genre') || 'all',
    medium: searchParams.get('medium') || 'all',
    rarity: searchParams.get('rarity') || 'all',
    condition: searchParams.get('condition') || 'all',
    orientation: searchParams.get('orientation') || 'all',
    subject: searchParams.get('subject') || 'all',
    
    // Visual properties
    dominantColors: searchParams.get('colors') ? searchParams.get('colors')!.split(',') : [],
    colorGroups: searchParams.get('color_groups') ? searchParams.get('color_groups')!.split(',') : [],
    
    // Physical properties
    size: searchParams.get('size') || 'all',
    sizeType: (searchParams.get('size_type') as 'predefined' | 'custom') || 'predefined',
    minWidth: searchParams.get('min_width') ? parseFloat(searchParams.get('min_width')!) : null,
    maxWidth: searchParams.get('max_width') ? parseFloat(searchParams.get('max_width')!) : null,
    minHeight: searchParams.get('min_height') ? parseFloat(searchParams.get('min_height')!) : null,
    maxHeight: searchParams.get('max_height') ? parseFloat(searchParams.get('max_height')!) : null,
    
    // Location and framing
    location: searchParams.get('location') || 'all',
    framingStatus: searchParams.get('framing') || 'all',
    signatureStatus: searchParams.get('signature') || 'all',
    
    // Authentication and documentation
    hasCoA: searchParams.get('has_coa') ? searchParams.get('has_coa') === 'true' : null,
    year: searchParams.get('year') ? parseInt(searchParams.get('year')!) : null,
    yearRange: searchParams.get('year_range') || 'all',
    
    // Sorting
    sortBy: searchParams.get('sort') || 'newest',
    sortDirection: (searchParams.get('sort_direction') as 'asc' | 'desc') || 'desc',
    
    // User preferences
    usePersonalizedFilters: searchParams.get('personalized') === 'true',
    learnedPreferences: searchParams.get('learned') === 'true'
  })

  const [availableGenres, setAvailableGenres] = useState<string[]>([])
  const [availableMediums, setAvailableMediums] = useState<string[]>([])
  const [priceRanges, setPriceRanges] = useState<{label: string, min: number, max: number}[]>([])

  useEffect(() => {
    loadArtworks()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [artworks, searchQuery, filters])

  useEffect(() => {
    // Update URL when filters change
    const params = new URLSearchParams()
    if (filters.priceRange !== 'all') params.set('price_range', filters.priceRange)
    if (filters.genre !== 'all') params.set('genre', filters.genre)
    if (filters.medium !== 'all') params.set('medium', filters.medium)
    if (filters.size !== 'all') params.set('size', filters.size)
    if (filters.sortBy !== 'newest') params.set('sort', filters.sortBy)
    if (searchQuery) params.set('q', searchQuery)
    
    setSearchParams(params, { replace: true })
  }, [filters, searchQuery, setSearchParams])

  const loadArtworks = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('artworks')
        .select(`
          id, title, price, currency, primary_image_url, genre, medium, dimensions, created_at, user_id
        `)
        .eq('status', 'available')
        .not('primary_image_url', 'is', null)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Get unique user IDs and fetch artist data
      const userIds = [...new Set((data || []).map(artwork => artwork.user_id))]
      const { data: artistsData } = await supabase
        .from('profiles')
        .select('id, full_name, slug')
        .in('id', userIds)

      const artistMap = new Map(artistsData?.map(artist => [artist.id, artist]) || [])

      const processedArtworks: Artwork[] = (data || []).map((artwork: any) => {
        const artist = artistMap.get(artwork.user_id)
        return {
          id: artwork.id,
          title: artwork.title,
          price: artwork.price,
          currency: artwork.currency,
          primary_image_url: artwork.primary_image_url,
          genre: artwork.genre,
          medium: artwork.medium,
          dimensions: artwork.dimensions,
          created_at: artwork.created_at,
          rarity: null,
          dominant_colors: null,
          color_groups: null,
          location: null,
          subject: null,
          orientation: null,
          framing_status: null,
          signature_info: null,
          is_price_negotiable: null,
          min_price: null,
          max_price: null,
          year: null,
          condition: null,
          has_certificate_of_authenticity: null,
          view_count: null,
          like_count: null,
          inquiry_count: null,
          artist: {
            id: artist?.id || artwork.user_id,
            slug: artist?.slug || '',
            name: artist?.full_name || 'Unknown Artist'
          }
        }
      })

      setArtworks(processedArtworks)
      
      // Extract unique genres and mediums
      const genres = [...new Set(processedArtworks.map(a => a.genre).filter(Boolean))].sort() as string[]
      const mediums = [...new Set(processedArtworks.map(a => a.medium).filter(Boolean))].sort() as string[]
      
      setAvailableGenres(genres)
      setAvailableMediums(mediums)
      
      // Generate price ranges
      const prices = processedArtworks.map(a => a.price).filter(Boolean) as number[]
      
      setPriceRanges([
        { label: 'Under $1,000', min: 0, max: 1000 },
        { label: '$1,000 - $5,000', min: 1000, max: 5000 },
        { label: '$5,000 - $10,000', min: 5000, max: 10000 },
        { label: '$10,000 - $25,000', min: 10000, max: 25000 },
        { label: '$25,000 - $50,000', min: 25000, max: 50000 },
        { label: 'Over $50,000', min: 50000, max: Infinity }
      ])

    } catch (err: any) {
      console.error('Error loading artworks:', err)
      setError(err.message || 'Failed to load artworks.')
      showErrorToast(err, { component: 'ArtworksPage', action: 'loadArtworks' })
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...artworks]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(artwork =>
        artwork.title?.toLowerCase().includes(query) ||
        artwork.artist.name.toLowerCase().includes(query) ||
        artwork.genre?.toLowerCase().includes(query) ||
        artwork.medium?.toLowerCase().includes(query)
      )
    }

    // Price range filter
    if (filters.priceRange !== 'all') {
      const range = priceRanges.find(r => r.label === filters.priceRange)
      if (range) {
        filtered = filtered.filter(artwork => {
          if (!artwork.price) return false
          return artwork.price >= range.min && artwork.price < range.max
        })
      }
    }

    // Genre filter
    if (filters.genre !== 'all') {
      filtered = filtered.filter(artwork => artwork.genre === filters.genre)
    }

    // Medium filter
    if (filters.medium !== 'all') {
      filtered = filtered.filter(artwork => artwork.medium === filters.medium)
    }

    // Size filter
    if (filters.size !== 'all') {
      filtered = filtered.filter(artwork => {
        const sizeCategory = getSizeCategory(artwork.dimensions)
        return sizeCategory === filters.size
      })
    }

    // Sort
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        break
      case 'price_low':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0))
        break
      case 'price_high':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0))
        break
      case 'title':
        filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
        break
    }

    setFilteredArtworks(filtered)
  }

  const getSizeCategory = (dimensions: any) => {
    if (!dimensions || typeof dimensions !== 'object') return 'Unknown'
    const { width, height } = dimensions
    if (!width || !height) return 'Unknown'
    
    const area = width * height
    if (area < 100) return 'Small'
    if (area < 1000) return 'Medium'
    if (area < 5000) return 'Large'
    return 'Extra Large'
  }

  const clearFilters = () => {
    setFilters({
      // Search
      searchQuery: '',
      naturalLanguageQuery: '',
      
      // Basic filters
      priceRange: 'all',
      priceType: 'all',
      minPrice: null,
      maxPrice: null,
      useLearnedBudget: false,
      
      // Artwork properties
      genre: 'all',
      medium: 'all',
      rarity: 'all',
      condition: 'all',
      orientation: 'all',
      subject: 'all',
      
      // Visual properties
      dominantColors: [],
      colorGroups: [],
      
      // Physical properties
      size: 'all',
      sizeType: 'predefined',
      minWidth: null,
      maxWidth: null,
      minHeight: null,
      maxHeight: null,
      
      // Location and framing
      location: 'all',
      framingStatus: 'all',
      signatureStatus: 'all',
      
      // Authentication and documentation
      hasCoA: null,
      year: null,
      yearRange: 'all',
      
      // Sorting
      sortBy: 'newest',
      sortDirection: 'desc',
      
      // User preferences
      usePersonalizedFilters: false,
      learnedPreferences: false
    })
    setSearchQuery('')
  }

  const activeFiltersCount = Object.values(filters).filter(value => value !== 'all').length + (searchQuery ? 1 : 0)

  if (loading) {
    return (
      <div className="artworks-page">
        <Container>
          <div className="artworks-loading">
            <LoadingSpinner />
            <p>Loading artworks...</p>
          </div>
        </Container>
      </div>
    )
  }

  if (error) {
    return (
      <div className="artworks-page">
        <Container>
          <ErrorMessage message={error} />
        </Container>
      </div>
    )
  }

  return (
    <div className="artworks-page">
      <Helmet>
        <title>Browse Artworks - ArtFlow</title>
        <meta name="description" content="Discover and browse artworks from talented artists. Filter by price, genre, medium, and more." />
      </Helmet>

      <Container>
        {/* Header */}
        <div className="artworks-header">
          <div className="artworks-title">
            <h1>Browse Artworks</h1>
          </div>
          
          <div className="artworks-controls">
            <div className="search-container">
              <Icon name="search" size={20} />
              <input
                type="text"
                placeholder="Search artworks, artists, genres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            
            {/* Only show view controls for logged in artists viewing their own artworks */}
            {user && user.role === 'ARTIST' && (
              <div className="view-controls">
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Icon name="grid" size={20} />
                </button>
                <button
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <Icon name="list" size={20} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Horizontal Filter System */}
        <HorizontalFilterSystem
          onFiltersChange={(newFilters) => {
            // Convert the new filter format to the existing format
            setFilters(prev => ({
              ...prev,
              priceRange: newFilters.priceRange,
              medium: newFilters.medium,
              genre: newFilters.genre,
              size: newFilters.size,
              rarity: newFilters.rarity,
              framingStatus: newFilters.framingStatus,
              signatureStatus: newFilters.signatureStatus,
              dominantColors: newFilters.dominantColors,
              subject: newFilters.subject,
              condition: newFilters.condition,
              year: newFilters.year,
              location: newFilters.location,
              hasCoA: newFilters.hasCoA,
              sortBy: newFilters.sortBy
            }))
          }}
          totalCount={artworks.length}
          filteredCount={filteredArtworks.length}
        />

        {/* Legacy Filters - Hidden */}
        {showFilters && (
          <div className="artworks-filters">
            <div className="filters-header">
              <h3>Filters</h3>
              <button onClick={clearFilters} className="clear-filters">
                <Icon name="x" size={16} />
                Clear All
              </button>
            </div>
            
            <div className="filters-grid">
              {/* Price Range */}
              <div className="filter-group">
                <label>Price Range</label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                >
                  <option value="all">All Prices</option>
                  {priceRanges.map((range, index) => (
                    <option key={index} value={range.label}>{range.label}</option>
                  ))}
                </select>
              </div>

              {/* Genre */}
              <div className="filter-group">
                <label>Genre</label>
                <select
                  value={filters.genre}
                  onChange={(e) => setFilters(prev => ({ ...prev, genre: e.target.value }))}
                >
                  <option value="all">All Genres</option>
                  {availableGenres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>

              {/* Medium */}
              <div className="filter-group">
                <label>Medium</label>
                <select
                  value={filters.medium}
                  onChange={(e) => setFilters(prev => ({ ...prev, medium: e.target.value }))}
                >
                  <option value="all">All Mediums</option>
                  {availableMediums.map(medium => (
                    <option key={medium} value={medium}>{medium}</option>
                  ))}
                </select>
              </div>

              {/* Size */}
              <div className="filter-group">
                <label>Size</label>
                <select
                  value={filters.size}
                  onChange={(e) => setFilters(prev => ({ ...prev, size: e.target.value }))}
                >
                  <option value="all">All Sizes</option>
                  <option value="Small">Small</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                  <option value="Extra Large">Extra Large</option>
                </select>
              </div>

              {/* Sort */}
              <div className="filter-group">
                <label>Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="title">Title A-Z</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Artworks Grid/List */}
        {filteredArtworks.length === 0 ? (
          <div className="no-artworks">
            <h3>No artworks found</h3>
            <p>Try adjusting your filters or search terms.</p>
            <button onClick={clearFilters} className="btn btn-primary">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className={`artworks-${viewMode}`}>
            {filteredArtworks.map((artwork) => (
              <Link
                key={artwork.id}
                to={`/artwork/${artwork.id}`}
                className="artwork-card"
              >
                <div className="artwork-image">
                  <img
                    src={artwork.primary_image_url || '/api/placeholder/300/300'}
                    alt={artwork.title || 'Untitled'}
                  />
                </div>
                <div className="artwork-info">
                  <h3 className="artwork-title">{artwork.title || 'Untitled'}</h3>
                  <p className="artwork-artist">
                    <Link to={`/artist/${artwork.artist.slug}`}>
                      {artwork.artist.name}
                    </Link>
                  </p>
                  <div className="artwork-meta">
                    {artwork.genre && (
                      <span className="artwork-genre">{artwork.genre}</span>
                    )}
                    {artwork.medium && (
                      <span className="artwork-medium">{artwork.medium}</span>
                    )}
                  </div>
                  <p className="artwork-price">
                    {artwork.price ? `${artwork.currency} ${artwork.price.toLocaleString()}` : 'Price on request'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </div>
  )
}

export default ArtworksPage