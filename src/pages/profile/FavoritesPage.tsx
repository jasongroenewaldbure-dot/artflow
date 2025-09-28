import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthProvider'
import Container from "../../brush/components/forms/Container"
import { showErrorToast, showSuccessToast } from '../../utils/errorHandling'
import Icon from "../../brush/Icon"

interface FavoriteArtwork {
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
  favorited_at: string
}

const FavoritesPage: React.FC = () => {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<FavoriteArtwork[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredFavorites, setFilteredFavorites] = useState<FavoriteArtwork[]>([])

  useEffect(() => {
    if (user) {
      loadFavorites()
    }
  }, [user])

  useEffect(() => {
    filterFavorites()
  }, [favorites, searchQuery])

  const loadFavorites = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('user_favorites')
        .select(`
          created_at,
          artworks!inner(
            id, title, primary_image_url, price, currency, medium, year, dimensions, genre,
            profiles!artworks_user_id_fkey(
              display_name, slug, avatar_url
            )
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const processedFavorites: FavoriteArtwork[] = (data || []).map(favorite => {
        const artwork = favorite.artworks?.[0] || favorite.artworks
        return {
          id: artwork?.id || 'unknown',
          title: artwork?.title || 'Untitled',
          artist: {
            name: artwork?.profiles?.[0]?.display_name || 'Unknown Artist',
            slug: artwork?.profiles?.[0]?.slug || '',
            avatar_url: artwork?.profiles?.[0]?.avatar_url
          },
          primary_image_url: artwork?.primary_image_url || '',
          price: artwork?.price || 0,
          currency: artwork?.currency || 'ZAR',
          medium: artwork?.medium || '',
          year: artwork?.year || new Date().getFullYear(),
          dimensions: artwork?.dimensions as string | null,
          genre: artwork?.genre || '',
          favorited_at: favorite.created_at
        }
      })

      setFavorites(processedFavorites)
    } catch (error) {
      console.error('Error loading favorites:', error)
      showErrorToast('Failed to load favorites')
    } finally {
      setLoading(false)
    }
  }

  const filterFavorites = () => {
    if (!searchQuery.trim()) {
      setFilteredFavorites(favorites)
      return
    }

    const filtered = favorites.filter(favorite =>
      favorite.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      favorite.artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      favorite.medium.toLowerCase().includes(searchQuery.toLowerCase()) ||
      favorite.genre.toLowerCase().includes(searchQuery.toLowerCase())
    )

    setFilteredFavorites(filtered)
  }

  const handleRemoveFavorite = async (artworkId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('artwork_id', artworkId)

      if (error) throw error

      setFavorites(prev => prev.filter(fav => fav.id !== artworkId))
      showSuccessToast('Removed from favorites')
    } catch (error) {
      console.error('Error removing favorite:', error)
      showErrorToast('Failed to remove from favorites')
    }
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <Container>
      <Helmet>
        <title>My Favorites | ArtFlow</title>
      </Helmet>

      <div className="py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
            <p className="text-gray-600 mt-2">
              {favorites.length} artwork{favorites.length !== 1 ? 's' : ''} saved
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Icon name="search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search favorites..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

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
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {filteredFavorites.length === 0 && favorites.length > 0 ? (
              <div className="text-center py-12">
                <Icon name="search" size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites found</h3>
                <p className="text-gray-600">Try adjusting your search terms</p>
              </div>
            ) : filteredFavorites.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="heart" size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
                <p className="text-gray-600 mb-6">Start exploring and save artworks you love</p>
                <Link
                  to="/explore"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Icon name="search" size={20} className="mr-2" />
                  Explore Artworks
                </Link>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-gray-600">
                    {filteredFavorites.length} of {favorites.length} favorites
                  </p>
                </div>

                {/* Favorites Grid/List */}
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredFavorites.map((favorite) => (
                      <div key={favorite.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="aspect-square bg-gray-100 relative group">
                          <img
                            src={favorite.primary_image_url || '/placeholder-artwork.jpg'}
                            alt={favorite.title}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => handleRemoveFavorite(favorite.id)}
                            className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                          >
                            <Icon name="heart-filled" size={20} color="#ef4444" />
                          </button>
                        </div>
                        
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 truncate">{favorite.title}</h3>
                          <Link
                            to={`/artist/${favorite.artist.slug}`}
                            className="text-sm text-gray-600 hover:text-blue-600 mt-1 block"
                          >
                            {favorite.artist.name}
                          </Link>
                          <p className="text-sm text-gray-500 mt-1">{favorite.medium} • {favorite.year}</p>
                          <p className="font-semibold text-gray-900 mt-2">
                            {formatPrice(favorite.price, favorite.currency)}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Added {formatDate(favorite.favorited_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredFavorites.map((favorite) => (
                      <div key={favorite.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center space-x-4">
                        <img
                          src={favorite.primary_image_url || '/placeholder-artwork.jpg'}
                          alt={favorite.title}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{favorite.title}</h3>
                          <Link
                            to={`/artist/${favorite.artist.slug}`}
                            className="text-sm text-gray-600 hover:text-blue-600"
                          >
                            {favorite.artist.name}
                          </Link>
                          <p className="text-sm text-gray-500">{favorite.medium} • {favorite.year}</p>
                          <p className="text-xs text-gray-400">
                            Added {formatDate(favorite.favorited_at)}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatPrice(favorite.price, favorite.currency)}
                          </p>
                          <button
                            onClick={() => handleRemoveFavorite(favorite.id)}
                            className="mt-2 p-2 hover:bg-gray-100 rounded-full"
                          >
                            <Icon name="heart-filled" size={20} color="#ef4444" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </Container>
  )
}

export default FavoritesPage
