import React, { useState, useEffect, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSearchParams } from 'react-router-dom'
import ArtworkCard from './ArtworkCard'
import IntelligentFilters from './IntelligentFilters'
import { fetchArtworks, type ArtworkRow } from '@/services/data'
import { SearchFilters } from '@/services/userPreferences'
import { Search, Filter, SortAsc, Grid, List, X, SlidersHorizontal } from 'lucide-react'

interface FilterState {
  priceRange: { min: string; max: string }
  medium: string
  year: { min: string; max: string }
  availability: 'all' | 'for-sale' | 'sold'
  artist: string
  sortBy: 'newest' | 'oldest' | 'price-low' | 'price-high' | 'title' | 'popular'
}

const DiscoverPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [artworks, setArtworks] = useState<ArtworkRow[]>([])
  const [filteredArtworks, setFilteredArtworks] = useState<ArtworkRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [intelligentFilters, setIntelligentFilters] = useState<SearchFilters>({})
  const [filters, setFilters] = useState<FilterState>({
    priceRange: { min: '', max: '' },
    medium: '',
    year: { min: '', max: '' },
    availability: 'all',
    artist: '',
    sortBy: 'newest'
  })

  // Load artworks
  useEffect(() => {
    const loadArtworks = async () => {
      try {
        setLoading(true)
        const data = await fetchArtworks()
        setArtworks(data)
        setFilteredArtworks(data)
      } catch (e: any) {
        setError(e.message || 'Failed to load artworks')
      } finally {
        setLoading(false)
      }
    }

    loadArtworks()
  }, [])

  // Apply filters and search
  const processedArtworks = useMemo(() => {
    let filtered = [...artworks]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(artwork =>
        artwork.title?.toLowerCase().includes(query) ||
        artwork.artist_name?.toLowerCase().includes(query) ||
        artwork.medium?.toLowerCase().includes(query) ||
        artwork.description?.toLowerCase().includes(query)
      )
    }

    // Intelligent filters
    if (intelligentFilters.mediums?.length) {
      filtered = filtered.filter(artwork =>
        artwork.medium && intelligentFilters.mediums.includes(artwork.medium.toLowerCase())
      )
    }

    if (intelligentFilters.genres?.length) {
      filtered = filtered.filter(artwork =>
        artwork.genre && intelligentFilters.genres.includes(artwork.genre.toLowerCase())
      )
    }

    if (intelligentFilters.styles?.length) {
      filtered = filtered.filter(artwork =>
        artwork.style && intelligentFilters.styles.includes(artwork.style.toLowerCase())
      )
    }

    if (intelligentFilters.colors?.length) {
      filtered = filtered.filter(artwork => {
        if (!artwork.dominant_colors) return false
        const colors = Array.isArray(artwork.dominant_colors) ? artwork.dominant_colors : [artwork.dominant_colors]
        return colors.some(color => intelligentFilters.colors?.includes(color.toLowerCase()))
      })
    }

    if (intelligentFilters.sizes?.length) {
      filtered = filtered.filter(artwork => {
        if (!artwork.width_cm || !artwork.height_cm) return false
        const maxDimension = Math.max(artwork.width_cm, artwork.height_cm)
        let sizeCategory = 'extra-large'
        if (maxDimension <= 30) sizeCategory = 'small'
        else if (maxDimension <= 60) sizeCategory = 'medium'
        else if (maxDimension <= 120) sizeCategory = 'large'
        
        return intelligentFilters.sizes?.includes(sizeCategory)
      })
    }

    if (intelligentFilters.years?.length) {
      filtered = filtered.filter(artwork => {
        if (!artwork.year) return false
        const decade = Math.floor(artwork.year / 10) * 10
        const decadeLabel = `${decade}s`
        return intelligentFilters.years?.includes(decadeLabel)
      })
    }

    if (intelligentFilters.priceRange) {
      filtered = filtered.filter(artwork => {
        const price = parseFloat(artwork.price || '0')
        return price >= intelligentFilters.priceRange!.min && price <= intelligentFilters.priceRange!.max
      })
    }

    // Legacy price range filter
    if (filters.priceRange.min || filters.priceRange.max) {
      filtered = filtered.filter(artwork => {
        const price = parseFloat(artwork.price || '0')
        const minPrice = parseFloat(filters.priceRange.min) || 0
        const maxPrice = parseFloat(filters.priceRange.max) || Infinity
        return price >= minPrice && price <= maxPrice
      })
    }

    // Medium filter
    if (filters.medium) {
      filtered = filtered.filter(artwork =>
        artwork.medium?.toLowerCase().includes(filters.medium.toLowerCase())
      )
    }

    // Year range filter
    if (filters.year.min || filters.year.max) {
      filtered = filtered.filter(artwork => {
        const year = artwork.year || 0
        const minYear = parseInt(filters.year.min) || 0
        const maxYear = parseInt(filters.year.max) || Infinity
        return year >= minYear && year <= maxYear
      })
    }

    // Availability filter
    if (filters.availability !== 'all') {
      if (filters.availability === 'for-sale') {
        filtered = filtered.filter(artwork => artwork.is_for_sale)
      } else if (filters.availability === 'sold') {
        filtered = filtered.filter(artwork => !artwork.is_for_sale)
      }
    }

    // Artist filter
    if (filters.artist) {
      filtered = filtered.filter(artwork =>
        artwork.artist_name?.toLowerCase().includes(filters.artist.toLowerCase())
      )
    }

    // Sort
    const sortBy = intelligentFilters.sortBy || filters.sortBy
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
        case 'oldest':
          return new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime()
        case 'price-low':
          return parseFloat(a.price || '0') - parseFloat(b.price || '0')
        case 'price-high':
          return parseFloat(b.price || '0') - parseFloat(a.price || '0')
        case 'title':
          return (a.title || '').localeCompare(b.title || '')
        case 'popular':
          // Sort by view count or likes (if available)
          return (b.view_count || 0) - (a.view_count || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [artworks, searchQuery, filters, intelligentFilters])

  // Update filtered artworks when processed artworks change
  useEffect(() => {
    setFilteredArtworks(processedArtworks)
  }, [processedArtworks])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchParams({ q: searchQuery })
  }

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      priceRange: { min: '', max: '' },
      medium: '',
      year: { min: '', max: '' },
      availability: 'all',
      artist: '',
      sortBy: 'newest'
    })
    setSearchQuery('')
    setSearchParams({})
  }

  const activeFiltersCount = Object.values(filters).filter(value => {
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(v => v !== '')
    }
    return value !== 'all' && value !== 'newest' && value !== ''
  }).length

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-lg)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--border)',
          borderTop: '3px solid var(--primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: 'var(--muted)', fontSize: '16px' }}>Loading artworks...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-lg)',
        padding: 'var(--space-xl)'
      }}>
        <h2 style={{ color: 'var(--danger)', fontSize: '24px', margin: 0 }}>Something went wrong</h2>
        <p style={{ color: 'var(--muted)', fontSize: '16px', textAlign: 'center' }}>{error}</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      <Helmet>
        <title>Discover Artworks | ArtFlow</title>
        <meta name="description" content="Discover and explore artworks from artists around the world." />
      </Helmet>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: 'var(--space-xl) var(--space-lg)'
      }}>
        {/* Header */}
        <div style={{
          marginBottom: 'var(--space-xl)'
        }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: '700',
            margin: '0 0 var(--space-sm) 0',
            color: 'var(--fg)'
          }}>
            Discover Artworks
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'var(--muted)',
            margin: 0
          }}>
            {filteredArtworks.length} artwork{filteredArtworks.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Search and Controls */}
        <div style={{
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-lg)',
          marginBottom: 'var(--space-xl)'
        }}>
          {/* Search Bar */}
          <form onSubmit={handleSearch} style={{
            display: 'flex',
            gap: 'var(--space-md)',
            marginBottom: 'var(--space-lg)'
          }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={20} style={{
                position: 'absolute',
                left: 'var(--space-sm)',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--muted)'
              }} />
              <input
                type="text"
                placeholder="Search artworks, artists, mediums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--space-sm) var(--space-sm) var(--space-sm) 40px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '14px',
                  backgroundColor: 'var(--bg)',
                  color: 'var(--fg)',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary)'
                  e.target.style.boxShadow = '0 0 0 2px rgba(110, 31, 255, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border)'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>
            <button type="submit" className="brush-button primary">
              Search
            </button>
          </form>

          {/* Filters and Controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--space-md)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-md)',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-xs)',
                  padding: 'var(--space-sm) var(--space-md)',
                  backgroundColor: showFilters ? 'var(--primary)' : 'transparent',
                  color: showFilters ? 'white' : 'var(--fg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                <SlidersHorizontal size={16} />
                Filters
                {activeFiltersCount > 0 && (
                  <span style={{
                    backgroundColor: 'var(--danger)',
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: '600',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    minWidth: '16px',
                    textAlign: 'center'
                  }}>
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                style={{
                  padding: 'var(--space-sm) var(--space-md)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg)',
                  color: 'var(--fg)',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="title">Title A-Z</option>
                <option value="popular">Most Popular</option>
              </select>

              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-xs)',
                    padding: 'var(--space-sm) var(--space-md)',
                    backgroundColor: 'transparent',
                    color: 'var(--danger)',
                    border: '1px solid var(--danger)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  <X size={16} />
                  Clear Filters
                </button>
              )}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-xs)'
            }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  border: '1px solid var(--border)',
                  backgroundColor: viewMode === 'grid' ? 'var(--primary)' : 'transparent',
                  color: viewMode === 'grid' ? 'white' : 'var(--fg)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  border: '1px solid var(--border)',
                  backgroundColor: viewMode === 'list' ? 'var(--primary)' : 'transparent',
                  color: viewMode === 'list' ? 'white' : 'var(--fg)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <List size={16} />
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div style={{
              marginTop: 'var(--space-lg)',
              paddingTop: 'var(--space-lg)',
              borderTop: '1px solid var(--border)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-md)'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: 'var(--fg)',
                  marginBottom: 'var(--space-xs)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Price Range
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)'
                }}>
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange.min}
                    onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, min: e.target.value })}
                    style={{
                      flex: 1,
                      padding: 'var(--space-sm)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg)',
                      color: 'var(--fg)',
                      fontSize: '14px'
                    }}
                  />
                  <span style={{ color: 'var(--muted)', fontSize: '14px' }}>to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange.max}
                    onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, max: e.target.value })}
                    style={{
                      flex: 1,
                      padding: 'var(--space-sm)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg)',
                      color: 'var(--fg)',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: 'var(--fg)',
                  marginBottom: 'var(--space-xs)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Medium
                </label>
                <input
                  type="text"
                  placeholder="e.g., Oil on canvas"
                  value={filters.medium}
                  onChange={(e) => handleFilterChange('medium', e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--space-sm)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--fg)',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: 'var(--fg)',
                  marginBottom: 'var(--space-xs)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Year Range
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)'
                }}>
                  <input
                    type="number"
                    placeholder="From"
                    value={filters.year.min}
                    onChange={(e) => handleFilterChange('year', { ...filters.year, min: e.target.value })}
                    style={{
                      flex: 1,
                      padding: 'var(--space-sm)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg)',
                      color: 'var(--fg)',
                      fontSize: '14px'
                    }}
                  />
                  <span style={{ color: 'var(--muted)', fontSize: '14px' }}>to</span>
                  <input
                    type="number"
                    placeholder="To"
                    value={filters.year.max}
                    onChange={(e) => handleFilterChange('year', { ...filters.year, max: e.target.value })}
                    style={{
                      flex: 1,
                      padding: 'var(--space-sm)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg)',
                      color: 'var(--fg)',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: 'var(--fg)',
                  marginBottom: 'var(--space-xs)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Availability
                </label>
                <select
                  value={filters.availability}
                  onChange={(e) => handleFilterChange('availability', e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--space-sm)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--fg)',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">All</option>
                  <option value="for-sale">For Sale</option>
                  <option value="sold">Sold</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: 'var(--fg)',
                  marginBottom: 'var(--space-xs)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Artist
                </label>
                <input
                  type="text"
                  placeholder="Search by artist name"
                  value={filters.artist}
                  onChange={(e) => handleFilterChange('artist', e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--space-sm)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--fg)',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Artworks Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: viewMode === 'list' 
            ? '1fr' 
            : 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 'var(--space-lg)'
        }}>
          {filteredArtworks.map((artwork) => (
            <ArtworkCard
              key={artwork.id}
              artwork={{
                id: artwork.id,
                title: artwork.title || 'Untitled',
                artist: {
                  name: artwork.artist_name || 'Unknown Artist',
                  slug: artwork.artist_slug || artwork.id
                },
                primaryImageUrl: artwork.primary_image_url,
                price: artwork.price,
                currency: artwork.currency,
                dimensions: artwork.dimensions,
                year: artwork.year,
                medium: artwork.medium,
                isForSale: artwork.is_for_sale,
                isAuction: false, // No auction functionality
                isLiked: false
              }}
              onLike={(id) => console.log('Like artwork:', id)}
              onView={(id) => console.log('View artwork:', id)}
              onShare={(id) => console.log('Share artwork:', id)}
              variant={viewMode === 'list' ? 'compact' : 'default'}
            />
          ))}
        </div>

        {filteredArtworks.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: 'var(--space-3xl)',
            color: 'var(--muted)'
          }}>
            <h3 style={{ fontSize: '20px', margin: '0 0 var(--space-md) 0' }}>
              No artworks found
            </h3>
            <p style={{ margin: '0 0 var(--space-lg) 0' }}>
              Try adjusting your search criteria or filters
            </p>
            <button onClick={clearFilters} className="brush-button primary">
              Clear All Filters
            </button>
          </div>
        )}

        {/* Intelligent Filters */}
        <IntelligentFilters
          filters={intelligentFilters}
          onFiltersChange={setIntelligentFilters}
          onClose={() => setShowFilters(false)}
          isOpen={showFilters}
          userId={undefined} // You can pass the actual user ID here
          searchQuery={searchQuery}
          currentResults={processedArtworks}
        />
      </div>
    </div>
  )
}

export default DiscoverPage
