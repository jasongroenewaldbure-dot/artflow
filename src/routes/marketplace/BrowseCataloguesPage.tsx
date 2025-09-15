import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import Icon from '@/components/icons/Icon'
import { toast } from 'react-hot-toast'

interface Catalogue {
  id: string
  title: string
  slug: string
  description: string | null
  cover_image_url: string | null
  is_public: boolean
  access_type: 'public' | 'password_protected' | 'private'
  created_at: string
  updated_at: string
  artist: {
    id: string
    slug: string
    name: string
    avatar_url: string | null
  }
  artwork_count: number
  view_count: number
  like_count: number
}

const BrowseCataloguesPage: React.FC = () => {
  const [catalogues, setCatalogues] = useState<Catalogue[]>([])
  const [filteredCatalogues, setFilteredCatalogues] = useState<Catalogue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most_viewed' | 'most_liked' | 'alphabetical'>('newest')
  const [filters, setFilters] = useState({
    accessType: 'all' as 'all' | 'public' | 'password_protected' | 'private',
    dateRange: 'all' as 'all' | 'today' | 'week' | 'month' | 'year'
  })

  useEffect(() => {
    loadCatalogues()
  }, [])

  useEffect(() => {
    filterAndSortCatalogues()
  }, [catalogues, searchQuery, sortBy, filters])

  const loadCatalogues = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('catalogues')
        .select(`
          id, title, slug, description, cover_image_url, is_public, access_type, created_at, updated_at, user_id
        `)
        .eq('is_public', true)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error loading catalogues:', error)
        throw error
      }

      // Get artist data for catalogues
      const catalogueUserIds = [...new Set((data || []).map(catalogue => catalogue.user_id))]
      const { data: catalogueArtists } = await supabase
        .from('profiles')
        .select('id, full_name, slug')
        .in('id', catalogueUserIds)

      const catalogueArtistMap = new Map(catalogueArtists?.map(artist => [artist.id, artist]) || [])

      const cataloguesData = data?.map(catalogue => {
        const artist = catalogueArtistMap.get(catalogue.user_id)
        return {
          ...catalogue,
          artist: {
            id: artist?.id || catalogue.user_id,
            slug: artist?.slug || '',
            name: artist?.full_name || 'Unknown Artist'
          },
          artwork_count: 0, // No catalogue_items table in schema
          view_count: 0, // TODO: Implement view counting
          like_count: 0  // TODO: Implement like counting
        }
      }) || []

      setCatalogues(cataloguesData)
    } catch (err: any) {
      console.error('Error loading catalogues:', err)
      setError(err.message || 'Failed to load catalogues')
      toast.error('Failed to load catalogues')
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortCatalogues = () => {
    let filtered = [...catalogues]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(catalogue =>
        catalogue.title.toLowerCase().includes(query) ||
        catalogue.description?.toLowerCase().includes(query) ||
        catalogue.artist.name.toLowerCase().includes(query)
      )
    }

    // Access type filter
    if (filters.accessType !== 'all') {
      filtered = filtered.filter(catalogue => catalogue.access_type === filters.accessType)
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date()
      const filterDate = new Date()
      
      switch (filters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          filterDate.setDate(now.getDate() - 7)
          break
        case 'month':
          filterDate.setMonth(now.getMonth() - 1)
          break
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1)
          break
      }
      
      filtered = filtered.filter(catalogue => new Date(catalogue.updated_at) >= filterDate)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        case 'oldest':
          return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
        case 'most_viewed':
          return b.view_count - a.view_count
        case 'most_liked':
          return b.like_count - a.like_count
        case 'alphabetical':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

    setFilteredCatalogues(filtered)
  }

  const handleLike = async (catalogueId: string) => {
    try {
      // TODO: Implement like functionality
      toast.success('Added to favorites')
    } catch (err) {
      toast.error('Failed to update favorites')
    }
  }

  const handleShare = async (catalogue: Catalogue) => {
    try {
      const url = `${window.location.origin}/catalogue/${catalogue.artist.slug}/${catalogue.slug}`
      if (navigator.share) {
        await navigator.share({
          title: catalogue.title,
          text: catalogue.description || '',
          url: url
        })
      } else {
        await navigator.clipboard.writeText(url)
        toast.success('Link copied to clipboard!')
      }
    } catch (err) {
      toast.error('Failed to share catalogue')
    }
  }

  if (loading) {
    return (
      <div className="catalogues-loading">
        <div className="catalogues-loading-spinner"></div>
        <p>Loading catalogues...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="catalogues-error">
        <h2>Error Loading Catalogues</h2>
        <p>{error}</p>
        <button onClick={loadCatalogues} className="brush-button primary">
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="catalogues-page">
      <Helmet>
        <title>Browse Catalogues | ArtFlow</title>
        <meta name="description" content="Discover digital art catalogues from talented artists around the world." />
      </Helmet>

      {/* Header */}
      <div className="catalogues-header">
        <div className="catalogues-header-content">
          <div className="catalogues-header-text">
            <h1 className="catalogues-title">Browse Catalogues</h1>
            <p className="catalogues-subtitle">
              Discover digital art catalogues from talented artists around the world
            </p>
          </div>
          
          <div className="catalogues-stats">
            <div className="catalogues-stat">
              <span className="catalogues-stat-number">{filteredCatalogues.length}</span>
              <span className="catalogues-stat-label">Catalogues</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="catalogues-controls">
        <div className="catalogues-search">
          <div className="catalogues-search-input">
            <Icon name="search" size={20} className="catalogues-search-icon" />
            <input
              type="text"
              placeholder="Search catalogues, artists, or descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="catalogues-search-field"
            />
          </div>
        </div>

        <div className="catalogues-controls-right">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`catalogues-filter-button ${showFilters ? 'active' : ''}`}
          >
            <Icon name="sliders-horizontal" size={16} />
            Filters
          </button>

          <div className="catalogues-view-toggle">
            <button
              onClick={() => setViewMode('grid')}
              className={`catalogues-view-button ${viewMode === 'grid' ? 'active' : ''}`}
            >
              <Icon name="grid-3x3" size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`catalogues-view-button ${viewMode === 'list' ? 'active' : ''}`}
            >
              <Icon name="list" size={16} />
            </button>
          </div>

          <div className="catalogues-sort">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="catalogues-sort-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most_viewed">Most Viewed</option>
              <option value="most_liked">Most Liked</option>
              <option value="alphabetical">A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="catalogues-filters-panel">
          <div className="catalogues-filters-content">
            <div className="catalogues-filter-group">
              <label className="catalogues-filter-label">Access Type</label>
              <select
                value={filters.accessType}
                onChange={(e) => setFilters(prev => ({ ...prev, accessType: e.target.value as any }))}
                className="catalogues-filter-select"
              >
                <option value="all">All Access Types</option>
                <option value="public">Public Only</option>
                <option value="password_protected">Password Protected</option>
                <option value="private">Private Only</option>
              </select>
            </div>

            <div className="catalogues-filter-group">
              <label className="catalogues-filter-label">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
                className="catalogues-filter-select"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="catalogues-results">
        {filteredCatalogues.length > 0 ? (
          <div className={`catalogues-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
            {filteredCatalogues.map((catalogue) => (
              <div key={catalogue.id} className="catalogue-card">
                <Link
                  to={`/catalogue/${catalogue.artist.slug}/${catalogue.slug}`}
                  className="catalogue-card-link"
                >
                  <div className="catalogue-card-image">
                    {catalogue.cover_image_url ? (
                      <img
                        src={catalogue.cover_image_url}
                        alt={catalogue.title}
                        className="catalogue-card-img"
                      />
                    ) : (
                      <div className="catalogue-card-placeholder">
                        <Icon name="book-open" size={48} />
                      </div>
                    )}
                    
                    <div className="catalogue-card-overlay">
                      <div className="catalogue-card-actions">
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            handleLike(catalogue.id)
                          }}
                          className="catalogue-card-action"
                        >
                          <Icon name="heart" size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            handleShare(catalogue)
                          }}
                          className="catalogue-card-action"
                        >
                          <Icon name="share-2" size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>

                <div className="catalogue-card-content">
                  <div className="catalogue-card-header">
                    <Link
                      to={`/artist/${catalogue.artist.slug}`}
                      className="catalogue-card-artist"
                    >
                      <img
                        src={catalogue.artist.avatar_url || '/api/placeholder/32/32'}
                        alt={catalogue.artist.name}
                        className="catalogue-card-avatar"
                      />
                      <span className="catalogue-card-artist-name">{catalogue.artist.name}</span>
                    </Link>
                  </div>

                  <Link
                    to={`/catalogue/${catalogue.artist.slug}/${catalogue.slug}`}
                    className="catalogue-card-title-link"
                  >
                    <h3 className="catalogue-card-title">{catalogue.title}</h3>
                  </Link>

                  {catalogue.description && (
                    <p className="catalogue-card-description">
                      {catalogue.description.length > 100
                        ? `${catalogue.description.substring(0, 100)}...`
                        : catalogue.description
                      }
                    </p>
                  )}

                  <div className="catalogue-card-meta">
                    <div className="catalogue-card-stats">
                      <div className="catalogue-card-stat">
                        <Icon name="eye" size={14} />
                        <span>{catalogue.artwork_count} artworks</span>
                      </div>
                      <div className="catalogue-card-stat">
                        <Icon name="calendar" size={14} />
                        <span>{new Date(catalogue.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="catalogue-card-access">
                      <span className={`catalogue-access-badge ${catalogue.access_type}`}>
                        {catalogue.access_type === 'public' ? 'Public' : 
                         catalogue.access_type === 'password_protected' ? 'Password Protected' : 'Private'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="catalogues-empty">
            <Icon name="book-open" size={64} className="catalogues-empty-icon" />
            <h3 className="catalogues-empty-title">No catalogues found</h3>
            <p className="catalogues-empty-description">
              {searchQuery || Object.values(filters).some(f => f !== 'all')
                ? 'Try adjusting your search or filters to find more catalogues.'
                : 'No public catalogues are available yet. Check back later!'
              }
            </p>
            {(searchQuery || Object.values(filters).some(f => f !== 'all')) && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setFilters({ accessType: 'all', dateRange: 'all' })
                }}
                className="brush-button primary"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default BrowseCataloguesPage
