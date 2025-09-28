import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { 
  Grid, 
  List, 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  Share2, 
  Download, 
  Eye, 
  Heart, 
  ShoppingBag, 
  BarChart3, 
  Calendar, 
  DollarSign, 
  Tag, 
  Star, 
  Archive, 
  Settings, 
  SortAsc, 
  SortDesc,
  ChevronDown,
  MoreVertical,
  Camera,
  Palette,
  Users,
  TrendingUp,
  BookOpen,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Globe,
  MapPin,
  Clock,
  Award,
  Target,
  Zap,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthProvider'
import toast from 'react-hot-toast'

interface Artwork {
  id: string
  title: string
  artist_name: string
  artist_slug: string
  price: number
  currency: string
  medium: string
  genre: string
  dimensions: string
  year_created: number
  primary_image_url: string
  created_at: string
  purchase_date?: string
  purchase_price?: number
  condition: 'excellent' | 'very_good' | 'good' | 'fair' | 'poor'
  provenance: string
  exhibition_history: string[]
  certificates: string[]
  insurance_value: number
  current_estimated_value: number
  appreciation_rate: number
  tags: string[]
  notes: string
  location: string
  is_public: boolean
  is_for_sale: boolean
  is_loaned: boolean
  loan_details?: {
    institution: string
    start_date: string
    end_date: string
    contact: string
  }
}

interface CollectionStats {
  total_artworks: number
  total_investment: number
  current_value: number
  appreciation: number
  appreciation_percentage: number
  average_price: number
  most_valuable: Artwork | null
  recent_acquisitions: number
  artists_count: number
  mediums_count: number
  genres_count: number
  countries_count: number
  years_span: number
  insurance_value: number
  loaned_count: number
  for_sale_count: number
}

interface CollectionFilter {
  search: string
  artist: string
  medium: string
  genre: string
  year_from: number
  year_to: number
  price_from: number
  price_to: number
  condition: string
  tags: string[]
  is_public: boolean | null
  is_for_sale: boolean | null
  is_loaned: boolean | null
  sort_by: 'title' | 'artist' | 'year' | 'price' | 'purchase_date' | 'created_at'
  sort_order: 'asc' | 'desc'
}

const CollectorVault: React.FC = () => {
  const { user } = useAuth()
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [filteredArtworks, setFilteredArtworks] = useState<Artwork[]>([])
  const [stats, setStats] = useState<CollectionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedArtworks, setSelectedArtworks] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<CollectionFilter>({
    search: '',
    artist: '',
    medium: '',
    genre: '',
    year_from: 1900,
    year_to: new Date().getFullYear(),
    price_from: 0,
    price_to: 10000000,
    condition: '',
    tags: [],
    is_public: null,
    is_for_sale: null,
    is_loaned: null,
    sort_by: 'created_at',
    sort_order: 'desc'
  })

  useEffect(() => {
    if (user) {
      loadCollection()
    }
  }, [user])

  useEffect(() => {
    applyFilters()
  }, [artworks, filters])

  const loadCollection = async () => {
    try {
      setLoading(true)
      
      // Load user's collection
      const { data: collection, error } = await supabase
        .from('user_collection')
        .select(`
          *,
          artworks!inner(
            id, title, artist_name, artist_slug, price, currency, medium, genre,
            dimensions, year_created, primary_image_url, created_at
          )
        `)
        .eq('user_id', user?.id)

      if (error) throw error

      // Transform data
      const transformedArtworks: Artwork[] = collection?.map(item => ({
        id: item.artworks.id,
        title: item.artworks.title,
        artist_name: item.artworks.artist_name,
        artist_slug: item.artworks.artist_slug,
        price: item.artworks.price,
        currency: item.artworks.currency,
        medium: item.artworks.medium,
        genre: item.artworks.genre,
        dimensions: item.artworks.dimensions,
        year_created: item.artworks.year_created,
        primary_image_url: item.artworks.primary_image_url,
        created_at: item.artworks.created_at,
        purchase_date: item.purchase_date,
        purchase_price: item.purchase_price,
        condition: item.condition || 'excellent',
        provenance: item.provenance || '',
        exhibition_history: item.exhibition_history || [],
        certificates: item.certificates || [],
        insurance_value: item.insurance_value || 0,
        current_estimated_value: item.current_estimated_value || item.artworks.price,
        appreciation_rate: item.appreciation_rate || 0,
        tags: item.tags || [],
        notes: item.notes || '',
        location: item.location || '',
        is_public: item.is_public || false,
        is_for_sale: item.is_for_sale || false,
        is_loaned: item.is_loaned || false,
        loan_details: item.loan_details
      })) || []

      setArtworks(transformedArtworks)
      calculateStats(transformedArtworks)
    } catch (error) {
      console.error('Error loading collection:', error)
      toast.error('Failed to load collection')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (artworkList: Artwork[]) => {
    const totalInvestment = artworkList.reduce((sum, artwork) => sum + (artwork.purchase_price || artwork.price), 0)
    const currentValue = artworkList.reduce((sum, artwork) => sum + artwork.current_estimated_value, 0)
    const appreciation = currentValue - totalInvestment
    const appreciationPercentage = totalInvestment > 0 ? (appreciation / totalInvestment) * 100 : 0

    const artists = new Set(artworkList.map(a => a.artist_name))
    const mediums = new Set(artworkList.map(a => a.medium))
    const genres = new Set(artworkList.map(a => a.genre))
    const countries = new Set(artworkList.map(a => a.location))

    const years = artworkList.map(a => a.year_created).filter(Boolean)
    const yearsSpan = years.length > 0 ? Math.max(...years) - Math.min(...years) : 0

    const mostValuable = artworkList.reduce((max, artwork) => 
      artwork.current_estimated_value > (max?.current_estimated_value || 0) ? artwork : max, 
      artworkList[0] || null
    )

    const recentAcquisitions = artworkList.filter(artwork => {
      const purchaseDate = new Date(artwork.purchase_date || artwork.created_at)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      return purchaseDate > thirtyDaysAgo
    }).length

    setStats({
      total_artworks: artworkList.length,
      total_investment: totalInvestment,
      current_value: currentValue,
      appreciation,
      appreciation_percentage: appreciationPercentage,
      average_price: artworkList.length > 0 ? totalInvestment / artworkList.length : 0,
      most_valuable: mostValuable,
      recent_acquisitions: recentAcquisitions,
      artists_count: artists.size,
      mediums_count: mediums.size,
      genres_count: genres.size,
      countries_count: countries.size,
      years_span: yearsSpan,
      insurance_value: artworkList.reduce((sum, artwork) => sum + artwork.insurance_value, 0),
      loaned_count: artworkList.filter(a => a.is_loaned).length,
      for_sale_count: artworkList.filter(a => a.is_for_sale).length
    })
  }

  const applyFilters = () => {
    let filtered = [...artworks]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(artwork => 
        artwork.title.toLowerCase().includes(searchLower) ||
        artwork.artist_name.toLowerCase().includes(searchLower) ||
        artwork.medium.toLowerCase().includes(searchLower) ||
        artwork.genre.toLowerCase().includes(searchLower) ||
        artwork.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    // Artist filter
    if (filters.artist) {
      filtered = filtered.filter(artwork => 
        artwork.artist_name.toLowerCase().includes(filters.artist.toLowerCase())
      )
    }

    // Medium filter
    if (filters.medium) {
      filtered = filtered.filter(artwork => artwork.medium === filters.medium)
    }

    // Genre filter
    if (filters.genre) {
      filtered = filtered.filter(artwork => artwork.genre === filters.genre)
    }

    // Year range filter
    filtered = filtered.filter(artwork => 
      artwork.year_created >= filters.year_from && artwork.year_created <= filters.year_to
    )

    // Price range filter
    filtered = filtered.filter(artwork => 
      artwork.current_estimated_value >= filters.price_from && 
      artwork.current_estimated_value <= filters.price_to
    )

    // Condition filter
    if (filters.condition) {
      filtered = filtered.filter(artwork => artwork.condition === filters.condition)
    }

    // Tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(artwork => 
        filters.tags.some(tag => artwork.tags.includes(tag))
      )
    }

    // Public filter
    if (filters.is_public !== null) {
      filtered = filtered.filter(artwork => artwork.is_public === filters.is_public)
    }

    // For sale filter
    if (filters.is_for_sale !== null) {
      filtered = filtered.filter(artwork => artwork.is_for_sale === filters.is_for_sale)
    }

    // Loaned filter
    if (filters.is_loaned !== null) {
      filtered = filtered.filter(artwork => artwork.is_loaned === filters.is_loaned)
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (filters.sort_by) {
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'artist':
          aValue = a.artist_name.toLowerCase()
          bValue = b.artist_name.toLowerCase()
          break
        case 'year':
          aValue = a.year_created
          bValue = b.year_created
          break
        case 'price':
          aValue = a.current_estimated_value
          bValue = b.current_estimated_value
          break
        case 'purchase_date':
          aValue = new Date(a.purchase_date || a.created_at)
          bValue = new Date(b.purchase_date || b.created_at)
          break
        default:
          aValue = new Date(a.created_at)
          bValue = new Date(b.created_at)
      }

      if (filters.sort_order === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredArtworks(filtered)
  }

  const handleFilterChange = (key: keyof CollectionFilter, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      artist: '',
      medium: '',
      genre: '',
      year_from: 1900,
      year_to: new Date().getFullYear(),
      price_from: 0,
      price_to: 10000000,
      condition: '',
      tags: [],
      is_public: null,
      is_for_sale: null,
      is_loaned: null,
      sort_by: 'created_at',
      sort_order: 'desc'
    })
  }

  const toggleArtworkSelection = (artworkId: string) => {
    setSelectedArtworks(prev => 
      prev.includes(artworkId) 
        ? prev.filter(id => id !== artworkId)
        : [...prev, artworkId]
    )
  }

  const selectAllArtworks = () => {
    setSelectedArtworks(filteredArtworks.map(a => a.id))
  }

  const deselectAllArtworks = () => {
    setSelectedArtworks([])
  }

  const getUniqueValues = (key: keyof Artwork) => {
    return [...new Set(artworks.map(artwork => artwork[key]).filter(Boolean))]
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #e5e7eb',
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#6b7280' }}>Loading your collection...</p>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '24px'
    }}>
      <Helmet>
        <title>Collector Vault | ArtFlow</title>
        <meta name="description" content="Manage your art collection with comprehensive tools and insights." />
      </Helmet>

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#111827',
              margin: '0 0 8px 0'
            }}>
              Collector Vault
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              margin: 0
            }}>
              Manage and track your art collection
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              <Filter size={16} />
              Filters
            </button>
            
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {viewMode === 'grid' ? <List size={16} /> : <Grid size={16} />}
              {viewMode === 'grid' ? 'List' : 'Grid'}
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '32px'
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Palette size={20} style={{ color: '#3b82f6' }} />
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', margin: 0 }}>Total Artworks</h3>
              </div>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>
                {stats.total_artworks}
              </p>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <DollarSign size={20} style={{ color: '#10b981' }} />
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', margin: 0 }}>Total Investment</h3>
              </div>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>
                ${stats.total_investment.toLocaleString()}
              </p>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <TrendingUp size={20} style={{ color: stats.appreciation >= 0 ? '#10b981' : '#ef4444' }} />
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', margin: 0 }}>Current Value</h3>
              </div>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>
                ${stats.current_value.toLocaleString()}
              </p>
              <p style={{ 
                fontSize: '12px', 
                color: stats.appreciation >= 0 ? '#10b981' : '#ef4444', 
                margin: '4px 0 0 0' 
              }}>
                {stats.appreciation >= 0 ? '+' : ''}${stats.appreciation.toLocaleString()} ({stats.appreciation_percentage.toFixed(1)}%)
              </p>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Users size={20} style={{ color: '#8b5cf6' }} />
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', margin: 0 }}>Artists</h3>
              </div>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>
                {stats.artists_count}
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '16px'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search artworks..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Artist
                </label>
                <select
                  value={filters.artist}
                  onChange={(e) => handleFilterChange('artist', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">All Artists</option>
                  {getUniqueValues('artist_name').map(artist => (
                    <option key={String(artist)} value={String(artist)}>{String(artist)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Medium
                </label>
                <select
                  value={filters.medium}
                  onChange={(e) => handleFilterChange('medium', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">All Mediums</option>
                  {getUniqueValues('medium').map(medium => (
                    <option key={String(medium)} value={String(medium)}>{String(medium)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Genre
                </label>
                <select
                  value={filters.genre}
                  onChange={(e) => handleFilterChange('genre', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">All Genres</option>
                  {getUniqueValues('genre').map(genre => (
                    <option key={String(genre)} value={String(genre)}>{String(genre)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Year Range
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="number"
                    value={filters.year_from}
                    onChange={(e) => handleFilterChange('year_from', parseInt(e.target.value))}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                  <input
                    type="number"
                    value={filters.year_to}
                    onChange={(e) => handleFilterChange('year_to', parseInt(e.target.value))}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Price Range
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="number"
                    value={filters.price_from}
                    onChange={(e) => handleFilterChange('price_from', parseInt(e.target.value))}
                    placeholder="From"
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                  <input
                    type="number"
                    value={filters.price_to}
                    onChange={(e) => handleFilterChange('price_to', parseInt(e.target.value))}
                    placeholder="To"
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <select
                  value={filters.sort_by}
                  onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="created_at">Date Added</option>
                  <option value="title">Title</option>
                  <option value="artist">Artist</option>
                  <option value="year">Year</option>
                  <option value="price">Price</option>
                  <option value="purchase_date">Purchase Date</option>
                </select>
                
                <button
                  onClick={() => handleFilterChange('sort_order', filters.sort_order === 'asc' ? 'desc' : 'asc')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 12px',
                    backgroundColor: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {filters.sort_order === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
                  {filters.sort_order === 'asc' ? 'Ascending' : 'Descending'}
                </button>
              </div>

              <button
                onClick={clearFilters}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Artworks Grid/List */}
        {filteredArtworks.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <Palette size={48} style={{ color: '#9ca3af', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>
              No artworks found
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 24px 0' }}>
              {artworks.length === 0 
                ? "Start building your collection by adding artworks"
                : "Try adjusting your filters to see more results"
              }
            </p>
            {artworks.length === 0 && (
              <button
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Add Your First Artwork
              </button>
            )}
          </div>
        ) : (
          <div style={{
            display: viewMode === 'grid' ? 'grid' : 'block',
            gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(300px, 1fr))' : 'none',
            gap: '24px'
          }}>
            {filteredArtworks.map((artwork) => (
              <div
                key={artwork.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {/* Image */}
                <div style={{ position: 'relative', aspectRatio: '1', backgroundColor: '#f3f4f6' }}>
                  {artwork.primary_image_url ? (
                    <img
                      src={artwork.primary_image_url}
                      alt={artwork.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      color: '#9ca3af'
                    }}>
                      <ImageIcon size={48} />
                    </div>
                  )}
                  
                  {/* Selection checkbox */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px'
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedArtworks.includes(artwork.id)}
                      onChange={() => toggleArtworkSelection(artwork.id)}
                      style={{
                        width: '20px',
                        height: '20px',
                        cursor: 'pointer'
                      }}
                    />
                  </div>

                  {/* Status badges */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    {artwork.is_loaned && (
                      <span style={{
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        On Loan
                      </span>
                    )}
                    {artwork.is_for_sale && (
                      <span style={{
                        backgroundColor: '#10b981',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        For Sale
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: '16px' }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#111827',
                    margin: '0 0 4px 0',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {artwork.title}
                  </h3>
                  
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: '0 0 8px 0'
                  }}>
                    by {artwork.artist_name}
                  </p>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <div>
                      <p style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#111827',
                        margin: '0 0 2px 0'
                      }}>
                        ${artwork.current_estimated_value.toLocaleString()}
                      </p>
                      {artwork.purchase_price && artwork.purchase_price !== artwork.current_estimated_value && (
                        <p style={{
                          fontSize: '12px',
                          color: artwork.appreciation_rate >= 0 ? '#10b981' : '#ef4444',
                          margin: 0
                        }}>
                          {artwork.appreciation_rate >= 0 ? '+' : ''}{artwork.appreciation_rate.toFixed(1)}%
                        </p>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        style={{
                          padding: '4px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#6b7280'
                        }}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        style={{
                          padding: '4px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#6b7280'
                        }}
                        title="Edit"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        style={{
                          padding: '4px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#6b7280'
                        }}
                        title="More Options"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Tags */}
                  {artwork.tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {artwork.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          style={{
                            backgroundColor: '#f3f4f6',
                            color: '#374151',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                      {artwork.tags.length > 3 && (
                        <span style={{
                          backgroundColor: '#f3f4f6',
                          color: '#6b7280',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          +{artwork.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bulk Actions */}
        {selectedArtworks.length > 0 && (
          <div style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'white',
            padding: '16px 24px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            zIndex: 1000
          }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
              {selectedArtworks.length} selected
            </span>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '8px 12px',
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                <Share2 size={16} />
                Share
              </button>
              
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '8px 12px',
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                <Download size={16} />
                Export
              </button>
              
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '8px 12px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
            
            <button
              onClick={deselectAllArtworks}
              style={{
                padding: '8px 12px',
                backgroundColor: 'transparent',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CollectorVault
