import { useEffect, useState, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { Search, Filter, SortAsc, Users, Eye, Heart } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Container from '@/components/ui/Container'
import IntelligentFilterSystem from '@/components/marketplace/IntelligentFilterSystem'

type Artist = { 
  id: string
  display_name: string | null
  slug: string | null
  avatar_url?: string
  bio?: string
  location?: string
  artwork_count?: number
  followers_count?: number
  is_following?: boolean
  created_at: string
}

interface FilterState {
  search: string
  locations: string[]
  mediums: string[]
  styles: string[]
  sortBy: 'newest' | 'popular' | 'alphabetical' | 'artwork_count'
  showOnly: 'all' | 'verified' | 'featured'
}

export default function Artists() {
  const [items, setItems] = useState<Artist[]>([])
  const [filteredItems, setFilteredItems] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    locations: [],
    mediums: [],
    styles: [],
    sortBy: 'newest',
    showOnly: 'all'
  })

  useEffect(() => {
    loadArtists()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [items, filters])

  const loadArtists = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          display_name,
          slug,
          avatar_url,
          bio,
          location,
          created_at,
          artworks!artworks_user_id_fkey(id)
        `)
        .eq('role', 'artist')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error

      const artistsWithCounts = (data || []).map(artist => ({
        ...artist,
        artwork_count: artist.artworks?.length || 0,
        followers_count: 0, // TODO: Implement followers count
        is_following: false // TODO: Implement following status
      }))

      setItems(artistsWithCounts)
    } catch (error) {
      console.error('Error loading artists:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...items]

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(artist =>
        artist.display_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        artist.bio?.toLowerCase().includes(filters.search.toLowerCase()) ||
        artist.location?.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    // Location filter
    if (filters.locations.length > 0) {
      filtered = filtered.filter(artist =>
        artist.location && filters.locations.includes(artist.location)
      )
    }

    // Sort
    switch (filters.sortBy) {
      case 'alphabetical':
        filtered.sort((a, b) => (a.display_name || '').localeCompare(b.display_name || ''))
        break
      case 'popular':
        filtered.sort((a, b) => (b.followers_count || 0) - (a.followers_count || 0))
        break
      case 'artwork_count':
        filtered.sort((a, b) => (b.artwork_count || 0) - (a.artwork_count || 0))
        break
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
    }

    setFilteredItems(filtered)
  }

  const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  return (
    <div className="artists-page-container">
      <Helmet>
        <title>Artists | ArtFlow</title>
        <meta name="description" content="Discover talented artists on ArtFlow" />
      </Helmet>

      <Container maxWidth="xl" padding="lg">
        <div className="artists-page-header">
          <div className="artists-page-title-section">
            <h1 className="artists-page-title">Artists</h1>
            <p className="artists-page-subtitle">Discover talented artists and their work</p>
          </div>
          <div className="artists-page-actions">
            <button 
              className="artflow-button artflow-button--outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} />
              Filters
            </button>
            <div className="artists-search-container">
              <div className="artflow-input-group">
                <Search size={16} className="artflow-input-icon" />
                <input
                  className="artflow-input artflow-input--outlined"
                  placeholder="Search artists..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange({ search: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="artists-filters-panel">
            <IntelligentFilterSystem
              filters={filters}
              onFiltersChange={handleFilterChange}
              availableOptions={{
                locations: ['New York', 'Los Angeles', 'London', 'Paris', 'Berlin', 'Tokyo'],
                mediums: ['Painting', 'Sculpture', 'Photography', 'Digital Art', 'Mixed Media'],
                styles: ['Abstract', 'Realism', 'Contemporary', 'Minimalist', 'Expressionist']
              }}
            />
          </div>
        )}

        {/* Results Header */}
        <div className="artists-results-header">
          <div className="results-count">
            {loading ? 'Loading...' : `${filteredItems.length} artists found`}
          </div>
          <div className="sort-controls">
            <label>Sort by:</label>
            <select 
              value={filters.sortBy}
              onChange={(e) => handleFilterChange({ sortBy: e.target.value as any })}
              className="artflow-input artflow-input--outlined"
            >
              <option value="newest">Newest</option>
              <option value="popular">Most Popular</option>
              <option value="alphabetical">A-Z</option>
              <option value="artwork_count">Most Artworks</option>
            </select>
          </div>
        </div>

        {/* Artists Grid */}
        {loading ? (
          <div className="artists-loading">
            <div>Loading artists...</div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="artists-empty">
            <Users size={48} />
            <h3>No artists found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="artists-grid">
            {filteredItems.map(artist => (
              <Link 
                key={artist.id} 
                to={`/artist/${artist.slug ?? artist.id}`} 
                className="artist-card"
              >
                <div className="artist-avatar">
                  {artist.avatar_url ? (
                    <img src={artist.avatar_url} alt={artist.display_name || 'Artist'} />
                  ) : (
                    <div className="artist-avatar-placeholder">
                      <Users size={24} />
                    </div>
                  )}
                </div>
                <div className="artist-info">
                  <h3 className="artist-name">{artist.display_name || 'Unnamed artist'}</h3>
                  {artist.location && (
                    <p className="artist-location">{artist.location}</p>
                  )}
                  {artist.bio && (
                    <p className="artist-bio">{artist.bio.substring(0, 100)}...</p>
                  )}
                  <div className="artist-stats">
                    <span className="stat">
                      <Eye size={14} />
                      {artist.artwork_count || 0} artworks
                    </span>
                    <span className="stat">
                      <Heart size={14} />
                      {artist.followers_count || 0} followers
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </div>
  )
}

