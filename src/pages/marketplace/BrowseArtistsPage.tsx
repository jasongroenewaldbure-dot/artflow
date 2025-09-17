import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import Icon from '@/components/icons/Icon'
import { showErrorToast } from '@/utils/errorHandling'
import Container from "../../components/common/Container"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import ErrorMessage from "../../components/common/ErrorMessage"
import HorizontalFilterSystem from '@/components/marketplace/HorizontalFilterSystem'

interface Artist {
  id: string
  name: string
  slug: string
  bio: string | null
  location: string | null
  created_at: string
  artwork_count: number
  recent_artworks: any[]
  specialties: string[]
}

interface FilterOptions {
  category: string
  location: string
  sortBy: string
}

const ArtistsPage: React.FC = () => {
  const [artists, setArtists] = useState<Artist[]>([])
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  
  const [filters, setFilters] = useState<FilterOptions>({
    category: searchParams.get('category') || 'all',
    location: searchParams.get('location') || 'all',
    sortBy: searchParams.get('sort') || 'newest'
  })

  const [availableLocations, setAvailableLocations] = useState<string[]>([])
  const [availableSpecialties, setAvailableSpecialties] = useState<string[]>([])

  useEffect(() => {
    loadArtists()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [artists, searchQuery, filters])

  useEffect(() => {
    // Update URL when filters change
    const params = new URLSearchParams()
    if (filters.category !== 'all') params.set('category', filters.category)
    if (filters.location !== 'all') params.set('location', filters.location)
    if (filters.sortBy !== 'newest') params.set('sort', filters.sortBy)
    if (searchQuery) params.set('q', searchQuery)
    
    setSearchParams(params, { replace: true })
  }, [filters, searchQuery, setSearchParams])

  const loadArtists = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, full_name, slug, bio, location, created_at,
          artworks(id, title, genre, medium, created_at)
        `)
        .eq('role', 'ARTIST')
        .not('full_name', 'is', null)
        .order('created_at', { ascending: false })

      if (error) throw error

      const processedArtists: Artist[] = (data || []).map((artist: any) => {
        const artworks = artist.artworks || []
        const recent_artworks = artworks.slice(0, 3)
        const specialties = [...new Set(artworks.map((a: any) => a.genre).filter(Boolean))]
        
        return {
          id: artist.id,
          name: artist.full_name,
          slug: artist.slug,
          bio: artist.bio,
          location: artist.location,
          created_at: artist.created_at,
          artwork_count: artworks.length,
          recent_artworks,
          specialties
        }
      })

      setArtists(processedArtists)
      
      // Extract unique locations and specialties
      const locations = [...new Set(processedArtists.map(a => a.location).filter(Boolean))].sort()
      const allSpecialties = processedArtists.flatMap(a => a.specialties)
      const specialties = [...new Set(allSpecialties)].sort()
      
      setAvailableLocations(locations)
      setAvailableSpecialties(specialties)

    } catch (err: any) {
      console.error('Error loading artists:', err)
      setError(err.message || 'Failed to load artists.')
      showErrorToast(err, { component: 'ArtistsPage', action: 'loadArtists' })
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...artists]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(artist =>
        artist.name.toLowerCase().includes(query) ||
        artist.bio?.toLowerCase().includes(query) ||
        artist.location?.toLowerCase().includes(query) ||
        artist.specialties.some(s => s.toLowerCase().includes(query))
      )
    }

    // Category filter
    if (filters.category !== 'all') {
      switch (filters.category) {
        case 'rising':
          filtered = filtered.filter(artist => {
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
            const recentArtworks = artist.recent_artworks.filter(artwork => 
              new Date(artwork.created_at) > thirtyDaysAgo
            )
            return recentArtworks.length >= 2
          })
          break
        case 'new':
          filtered = filtered.filter(artist => artist.artwork_count <= 3)
          break
        case 'established':
          filtered = filtered.filter(artist => artist.artwork_count >= 10)
          break
        case 'trending':
          filtered = filtered.filter(artist => artist.artwork_count >= 5 && artist.artwork_count < 20)
          break
      }
    }

    // Location filter
    if (filters.location !== 'all') {
      filtered = filtered.filter(artist => artist.location === filters.location)
    }

    // Sort
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        break
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'artworks_high':
        filtered.sort((a, b) => b.artwork_count - a.artwork_count)
        break
      case 'artworks_low':
        filtered.sort((a, b) => a.artwork_count - b.artwork_count)
        break
    }

    setFilteredArtists(filtered)
  }

  const clearFilters = () => {
    setFilters({
      category: 'all',
      location: 'all',
      sortBy: 'newest'
    })
    setSearchQuery('')
  }

  const activeFiltersCount = Object.values(filters).filter(value => value !== 'all').length + (searchQuery ? 1 : 0)

  if (loading) {
    return (
      <div className="artists-page">
        <Container>
          <div className="artists-loading">
            <LoadingSpinner />
            <p>Loading artists...</p>
          </div>
        </Container>
      </div>
    )
  }

  if (error) {
    return (
      <div className="artists-page">
        <Container>
          <ErrorMessage message={error} />
        </Container>
      </div>
    )
  }

  return (
    <div className="artists-page">
      <Helmet>
        <title>Browse Artists - ArtFlow</title>
        <meta name="description" content="Discover talented artists and explore their portfolios. Filter by location, category, and more." />
      </Helmet>

      <Container>
        {/* Header */}
        <div className="artists-header">
          <div className="artists-title">
            <h1>Browse Artists</h1>
            <p className="artists-subtitle">
              {filteredArtists.length} artist{filteredArtists.length !== 1 ? 's' : ''} found
            </p>
          </div>
          
          <div className="artists-controls">
            <div className="search-container">
              <Icon name="search" size={20} />
              <input
                type="text"
                placeholder="Search artists, locations, specialties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            
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
            
            <button
              className={`filter-btn ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Icon name="sliders-horizontal" size={20} />
              Filters
              {activeFiltersCount > 0 && (
                <span className="filter-count">{activeFiltersCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="artists-filters">
            <div className="filters-header">
              <h3>Filters</h3>
              <button onClick={clearFilters} className="clear-filters">
                <Icon name="x" size={16} />
                Clear All
              </button>
            </div>
            
            <div className="filters-grid">
              {/* Category */}
              <div className="filter-group">
                <label>Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="all">All Artists</option>
                  <option value="rising">Rising Artists</option>
                  <option value="new">New Artists</option>
                  <option value="established">Established Artists</option>
                  <option value="trending">Trending Artists</option>
                </select>
              </div>

              {/* Location */}
              <div className="filter-group">
                <label>Location</label>
                <select
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                >
                  <option value="all">All Locations</option>
                  {availableLocations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
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
                  <option value="name">Name A-Z</option>
                  <option value="artworks_high">Most Artworks</option>
                  <option value="artworks_low">Fewest Artworks</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Artists Grid/List */}
        {filteredArtists.length === 0 ? (
          <div className="no-artists">
            <h3>No artists found</h3>
            <p>Try adjusting your filters or search terms.</p>
            <button onClick={clearFilters} className="btn btn-primary">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className={`artists-${viewMode}`}>
            {filteredArtists.map((artist) => (
              <Link
                key={artist.id}
                to={`/artist/${artist.slug}`}
                className="artist-card"
              >
                <div className="artist-header">
                  <div className="artist-avatar">
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">👥</div>
                  </div>
                  <div className="artist-info">
                    <h3 className="artist-name">{artist.name}</h3>
                    {artist.location && (
                      <p className="artist-location">
                        <span className="text-xs">📍</span>
                        {artist.location}
                      </p>
                    )}
                  </div>
                </div>
                
                {artist.bio && (
                  <p className="artist-bio">{artist.bio}</p>
                )}
                
                <div className="artist-stats">
                  <div className="stat">
                    <span className="stat-number">{artist.artwork_count}</span>
                    <span className="stat-label">Artworks</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">{artist.specialties.length}</span>
                    <span className="stat-label">Specialties</span>
                  </div>
                </div>
                
                {artist.specialties.length > 0 && (
                  <div className="artist-specialties">
                    {artist.specialties.slice(0, 3).map((specialty, index) => (
                      <span key={index} className="specialty-tag">
                        {specialty}
                      </span>
                    ))}
                    {artist.specialties.length > 3 && (
                      <span className="specialty-more">
                        +{artist.specialties.length - 3} more
                      </span>
                    )}
                  </div>
                )}
                
                {artist.recent_artworks.length > 0 && (
                  <div className="artist-recent-works">
                    <h4>Recent Works</h4>
                    <div className="recent-works-grid">
                      {artist.recent_artworks.map((artwork, index) => (
                        <div key={index} className="recent-work">
                          <img
                            src="/api/placeholder/60/60"
                            alt={artwork.title || 'Untitled'}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </Container>
    </div>
  )
}

export default ArtistsPage
