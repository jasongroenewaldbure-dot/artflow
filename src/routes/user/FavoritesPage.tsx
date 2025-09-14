import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { Heart, Search, Filter, Grid, List, Share2, Eye, Calendar, MapPin, Palette, Ruler } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthProvider'
import Container from '../../components/ui/Container'
import ArtworkCard from '../../components/marketplace/ArtworkCard'
import { showErrorToast } from '../../utils/errorHandling'

interface FavoriteArtwork {
  id: string
  title: string
  artist: {
    name: string
    slug: string
  }
  primaryImageUrl: string
  price: number
  currency: string
  medium: string
  year: number
  dimensions: any
  genre: string
  addedAt: string
  isForSale: boolean
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
            id, title, price, currency, medium, year, dimensions, primary_image_url, 
            genre, status, created_at,
            profiles!artworks_user_id_fkey(full_name, slug)
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('relation "user_favorites" does not exist')) {
          // Table doesn't exist yet, show empty state
          setFavorites([])
          return
        }
        throw error
      }

      const favoriteArtworks: FavoriteArtwork[] = (data || []).map(fav => ({
        id: fav.artworks.id,
        title: fav.artworks.title || 'Untitled',
        artist: {
          name: fav.artworks.profiles?.full_name || 'Unknown Artist',
          slug: fav.artworks.profiles?.slug || fav.artworks.id
        },
        primaryImageUrl: fav.artworks.primary_image_url || '',
        price: fav.artworks.price || 0,
        currency: fav.artworks.currency || 'ZAR',
        medium: fav.artworks.medium || '',
        year: fav.artworks.year || new Date().getFullYear(),
        dimensions: fav.artworks.dimensions,
        genre: fav.artworks.genre || '',
        addedAt: fav.created_at,
        isForSale: fav.artworks.status === 'available'
      }))

      setFavorites(favoriteArtworks)
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

    const query = searchQuery.toLowerCase()
    const filtered = favorites.filter(fav =>
      fav.title.toLowerCase().includes(query) ||
      fav.artist.name.toLowerCase().includes(query) ||
      fav.medium.toLowerCase().includes(query) ||
      fav.genre.toLowerCase().includes(query)
    )
    setFilteredFavorites(filtered)
  }

  const handleRemoveFavorite = async (artworkId: string) => {
    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user?.id)
        .eq('artwork_id', artworkId)

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('relation "user_favorites" does not exist')) {
          // Table doesn't exist yet, just remove from local state
          setFavorites(prev => prev.filter(fav => fav.id !== artworkId))
          return
        }
        throw error
      }

      setFavorites(prev => prev.filter(fav => fav.id !== artworkId))
    } catch (error) {
      console.error('Error removing favorite:', error)
      showErrorToast('Failed to remove favorite')
    }
  }

  const handleShareFavorites = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My ArtFlow Favorites',
        text: `Check out my favorite artworks on ArtFlow`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      showErrorToast('Link copied to clipboard')
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: 'var(--muted)' }}>Loading your favorites...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      <Helmet>
        <title>My Favorites | ArtFlow</title>
        <meta name="description" content="Your favorite artworks on ArtFlow" />
      </Helmet>

      <Container>
        <div style={{ padding: 'var(--space-xl) 0' }}>
          {/* Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 'var(--space-xl)',
            flexWrap: 'wrap',
            gap: 'var(--space-md)'
          }}>
            <div>
              <h1 style={{ 
                fontSize: '32px', 
                fontWeight: '600', 
                margin: '0 0 var(--space-sm) 0',
                color: 'var(--fg)'
              }}>
                My Favorites
              </h1>
              <p style={{ 
                color: 'var(--muted)', 
                margin: 0,
                fontSize: '16px'
              }}>
                {filteredFavorites.length} {filteredFavorites.length === 1 ? 'artwork' : 'artworks'} saved
              </p>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
              <button
                onClick={handleShareFavorites}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-xs)',
                  padding: 'var(--space-sm) var(--space-md)',
                  backgroundColor: 'var(--bg-alt)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--fg)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary)'
                  e.currentTarget.style.color = 'white'
                  e.currentTarget.style.borderColor = 'var(--primary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-alt)'
                  e.currentTarget.style.color = 'var(--fg)'
                  e.currentTarget.style.borderColor = 'var(--border)'
                }}
              >
                <Share2 size={16} />
                Share
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div style={{ 
            display: 'flex', 
            gap: 'var(--space-md)', 
            marginBottom: 'var(--space-xl)',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '300px' }}>
              <Search 
                size={20} 
                style={{ 
                  position: 'absolute', 
                  left: 'var(--space-md)', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: 'var(--muted)'
                }} 
              />
              <input
                type="text"
                placeholder="Search your favorites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--space-md) var(--space-md) var(--space-md) 48px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg)',
                  color: 'var(--fg)',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border)'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: 'var(--space-sm)',
                  backgroundColor: viewMode === 'grid' ? 'var(--primary)' : 'var(--bg-alt)',
                  color: viewMode === 'grid' ? 'white' : 'var(--fg)',
                  border: '1px solid var(--border)',
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
                  padding: 'var(--space-sm)',
                  backgroundColor: viewMode === 'list' ? 'var(--primary)' : 'var(--bg-alt)',
                  color: viewMode === 'list' ? 'white' : 'var(--fg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <List size={16} />
              </button>
            </div>
          </div>

          {/* Favorites Grid/List */}
          {filteredFavorites.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: 'var(--space-xxl)',
              color: 'var(--muted)'
            }}>
              <Heart size={48} style={{ marginBottom: 'var(--space-md)', opacity: 0.5 }} />
              <h3 style={{ margin: '0 0 var(--space-sm) 0', fontSize: '20px' }}>
                {searchQuery ? 'No favorites match your search' : 'No favorites yet'}
              </h3>
              <p style={{ margin: '0 0 var(--space-lg) 0' }}>
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Start exploring and save artworks you love'
                }
              </p>
              {!searchQuery && (
                <Link
                  to="/"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--space-xs)',
                    padding: 'var(--space-md) var(--space-lg)',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '16px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Eye size={16} />
                  Explore Artworks
                </Link>
              )}
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: viewMode === 'grid' 
                ? 'repeat(auto-fill, minmax(280px, 1fr))' 
                : '1fr',
              gap: 'var(--space-lg)'
            }}>
              {filteredFavorites.map((artwork) => (
                <div key={artwork.id} style={{ position: 'relative' }}>
                  <ArtworkCard
                    artwork={artwork}
                    viewMode={viewMode}
                    showRemoveButton={true}
                    onRemove={() => handleRemoveFavorite(artwork.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}

export default FavoritesPage
