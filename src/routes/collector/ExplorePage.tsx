import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthProvider'
import Container from '../../components/ui/Container'
import { showErrorToast, showSuccessToast } from '../../utils/errorHandling'
import Icon from '../../components/icons/Icon'

interface Artwork {
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
  dimensions: any
  genre: string
  is_favorited?: boolean
}

interface FilterState {
  search: string
  medium: string
  genre: string
  priceRange: [number, number]
  yearRange: [number, number]
  sortBy: string
}

const ExplorePage: React.FC = () => {
  const { user } = useAuth()
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    medium: '',
    genre: '',
    priceRange: [0, 100000],
    yearRange: [1900, new Date().getFullYear()],
    sortBy: 'newest'
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadArtworks()
  }, [filters])

  const loadArtworks = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('artworks')
        .select(`
          id, title, primary_image_url, price, currency, medium, year, dimensions, genre, created_at,
          profiles!artworks_user_id_fkey (
            display_name, slug, avatar_url
          )
        `)
        .eq('status', 'available')
        .eq('is_public', true)

      // Apply search filter
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,profiles.display_name.ilike.%${filters.search}%`)
      }

      // Apply medium filter
      if (filters.medium) {
        query = query.eq('medium', filters.medium)
      }

      // Apply genre filter
      if (filters.genre) {
        query = query.eq('genre', filters.genre)
      }

      // Apply price range filter
      query = query
        .gte('price', filters.priceRange[0])
        .lte('price', filters.priceRange[1])

      // Apply year range filter
      query = query
        .gte('year', filters.yearRange[0])
        .lte('year', filters.yearRange[1])

      // Apply sorting
      switch (filters.sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false })
          break
        case 'oldest':
          query = query.order('created_at', { ascending: true })
          break
        case 'price_low':
          query = query.order('price', { ascending: true })
          break
        case 'price_high':
          query = query.order('price', { ascending: false })
          break
        case 'name':
          query = query.order('title', { ascending: true })
          break
      }

      const { data, error } = await query.limit(50)

      if (error) throw error

      const processedArtworks: Artwork[] = (data || []).map(artwork => ({
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
        dimensions: artwork.dimensions,
        genre: artwork.genre || '',
        is_favorited: false
      }))

      setArtworks(processedArtworks)
    } catch (error) {
      console.error('Error loading artworks:', error)
      showErrorToast('Failed to load artworks')
    } finally {
      setLoading(false)
    }
  }

  const handleFavorite = async (artworkId: string, isFavorited: boolean) => {
    if (!user) return

    try {
      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('artwork_id', artworkId)

        if (error) throw error
        showSuccessToast('Removed from favorites')
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            artwork_id: artworkId
          })

        if (error) throw error
        showSuccessToast('Added to favorites')
      }

      // Update local state
      setArtworks(prev => prev.map(artwork => 
        artwork.id === artworkId 
          ? { ...artwork, is_favorited: !isFavorited }
          : artwork
      ))
    } catch (error) {
      console.error('Error updating favorite:', error)
      showErrorToast('Failed to update favorite')
    }
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency
    }).format(price)
  }

  return (
    <Container>
      <Helmet>
        <title>Explore Artworks | ArtFlow</title>
      </Helmet>

      <div className="py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Explore Artworks</h1>
            <p className="text-gray-600 mt-2">Discover amazing artworks from talented artists</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
              >
                <Icon name="grid" size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
              >
                <Icon name="list" size={20} />
              </button>
            </div>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Icon name="settings" size={20} />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Search artworks or artists..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Medium */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Medium</label>
                <select
                  value={filters.medium}
                  onChange={(e) => setFilters(prev => ({ ...prev, medium: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Mediums</option>
                  <option value="Oil on Canvas">Oil on Canvas</option>
                  <option value="Acrylic on Canvas">Acrylic on Canvas</option>
                  <option value="Watercolor">Watercolor</option>
                  <option value="Mixed Media">Mixed Media</option>
                  <option value="Digital">Digital</option>
                  <option value="Photography">Photography</option>
                  <option value="Sculpture">Sculpture</option>
                </select>
              </div>

              {/* Genre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
                <select
                  value={filters.genre}
                  onChange={(e) => setFilters(prev => ({ ...prev, genre: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Genres</option>
                  <option value="Abstract">Abstract</option>
                  <option value="Realism">Realism</option>
                  <option value="Contemporary">Contemporary</option>
                  <option value="Landscape">Landscape</option>
                  <option value="Portrait">Portrait</option>
                  <option value="Still Life">Still Life</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
            </div>

            {/* Price Range */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range: {formatPrice(filters.priceRange[0], 'ZAR')} - {formatPrice(filters.priceRange[1], 'ZAR')}
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0"
                  max="100000"
                  step="1000"
                  value={filters.priceRange[0]}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    priceRange: [parseInt(e.target.value), prev.priceRange[1]] 
                  }))}
                  className="flex-1"
                />
                <input
                  type="range"
                  min="0"
                  max="100000"
                  step="1000"
                  value={filters.priceRange[1]}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    priceRange: [prev.priceRange[0], parseInt(e.target.value)] 
                  }))}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {artworks.length} artwork{artworks.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {/* Artworks Grid/List */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {artworks.map((artwork) => (
                  <div key={artwork.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-square bg-gray-100 relative group">
                      <img
                        src={artwork.primary_image_url || '/placeholder-artwork.jpg'}
                        alt={artwork.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleFavorite(artwork.id, artwork.is_favorited || false)}
                        className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                      >
                        <Icon 
                          name={artwork.is_favorited ? "heart-filled" : "heart"} 
                          size={20} 
                          color={artwork.is_favorited ? "#ef4444" : "#6b7280"}
                        />
                      </button>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 truncate">{artwork.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{artwork.artist.name}</p>
                      <p className="text-sm text-gray-500 mt-1">{artwork.medium} • {artwork.year}</p>
                      <p className="font-semibold text-gray-900 mt-2">
                        {formatPrice(artwork.price, artwork.currency)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {artworks.map((artwork) => (
                  <div key={artwork.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center space-x-4">
                    <img
                      src={artwork.primary_image_url || '/placeholder-artwork.jpg'}
                      alt={artwork.title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{artwork.title}</h3>
                      <p className="text-sm text-gray-600">{artwork.artist.name}</p>
                      <p className="text-sm text-gray-500">{artwork.medium} • {artwork.year}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatPrice(artwork.price, artwork.currency)}
                      </p>
                      <button
                        onClick={() => handleFavorite(artwork.id, artwork.is_favorited || false)}
                        className="mt-2 p-2 hover:bg-gray-100 rounded-full"
                      >
                        <Icon 
                          name={artwork.is_favorited ? "heart-filled" : "heart"} 
                          size={20} 
                          color={artwork.is_favorited ? "#ef4444" : "#6b7280"}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {artworks.length === 0 && (
              <div className="text-center py-12">
                <Icon name="search" size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No artworks found</h3>
                <p className="text-gray-600">Try adjusting your filters or search terms</p>
              </div>
            )}
          </>
        )}
      </div>
    </Container>
  )
}

export default ExplorePage
