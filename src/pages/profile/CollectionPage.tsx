import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { ShoppingBag, Search, Filter, Grid, List, Share2, Eye, Calendar, MapPin, Palette, Ruler, Download, FileText } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthProvider'
import Container from "../../brush/components/forms/Container"
import ArtworkCard from '../../brush/components/marketplace/ArtworkCard'
import { showErrorToast } from '../../utils/errorHandling'

interface CollectionArtwork {
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
  purchasedAt: string
  status: 'purchased' | 'shipped' | 'delivered'
  invoiceUrl?: string
  coaUrl?: string
}

const CollectionPage: React.FC = () => {
  const { user } = useAuth()
  const [collection, setCollection] = useState<CollectionArtwork[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredCollection, setFilteredCollection] = useState<CollectionArtwork[]>([])
  const [filterStatus, setFilterStatus] = useState<'all' | 'purchased' | 'shipped' | 'delivered'>('all')

  useEffect(() => {
    if (user) {
      loadCollection()
    }
  }, [user])

  useEffect(() => {
    filterCollection()
  }, [collection, searchQuery, filterStatus])

  const loadCollection = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('user_collection')
        .select(`
          status, created_at,
          artworks!inner(
            id, title, price, currency, medium, year, dimensions, primary_image_url, 
            genre, created_at,
            profiles!artworks_user_id_fkey(full_name, slug)
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('relation "user_collection" does not exist')) {
          // Table doesn't exist yet, show empty state
          setCollection([])
          return
        }
        throw error
      }

      const collectionArtworks: CollectionArtwork[] = (data || []).map(item => {
        const artwork = item.artworks?.[0] || item.artworks
        return {
          id: artwork?.id || 'unknown',
          title: artwork?.title || 'Untitled',
          artist: {
            name: artwork?.profiles?.[0]?.full_name || 'Unknown Artist',
            slug: artwork?.profiles?.[0]?.slug || artwork?.id || 'unknown'
          },
          primaryImageUrl: artwork?.primary_image_url || '',
          price: artwork?.price || 0,
          currency: artwork?.currency || 'ZAR',
          medium: artwork?.medium || '',
          year: artwork?.year || new Date().getFullYear(),
          dimensions: artwork?.dimensions || '',
          genre: artwork?.genre || '',
          purchasedAt: item.created_at,
          status: (item.status as 'purchased' | 'shipped' | 'delivered') || 'purchased'
        }
      })

      setCollection(collectionArtworks)
    } catch (error) {
      console.error('Error loading collection:', error)
      showErrorToast('Failed to load collection')
    } finally {
      setLoading(false)
    }
  }

  const filterCollection = () => {
    let filtered = collection

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.artist.name.toLowerCase().includes(query) ||
        item.medium.toLowerCase().includes(query) ||
        item.genre.toLowerCase().includes(query)
      )
    }

    setFilteredCollection(filtered)
  }

  const handleDownloadInvoice = async (artworkId: string) => {
    try {
      // TODO: Implement invoice download
      showErrorToast('Invoice download coming soon')
    } catch (error) {
      console.error('Error downloading invoice:', error)
      showErrorToast('Failed to download invoice')
    }
  }

  const handleDownloadCOA = async (artworkId: string) => {
    try {
      // TODO: Implement COA download
      showErrorToast('COA download coming soon')
    } catch (error) {
      console.error('Error downloading COA:', error)
      showErrorToast('Failed to download COA')
    }
  }

  const handleShareCollection = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My ArtFlow Collection',
        text: `Check out my art collection on ArtFlow`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      showErrorToast('Link copied to clipboard')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'purchased': return 'var(--warning)'
      case 'shipped': return 'var(--info)'
      case 'delivered': return 'var(--success)'
      default: return 'var(--muted)'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'purchased': return 'Purchased'
      case 'shipped': return 'Shipped'
      case 'delivered': return 'Delivered'
      default: return status
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: 'var(--muted)' }}>Loading your collection...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      <Helmet>
        <title>My Collection | ArtFlow</title>
        <meta name="description" content="Your art collection on ArtFlow" />
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
                My Collection
              </h1>
              <p style={{ 
                color: 'var(--muted)', 
                margin: 0,
                fontSize: '16px'
              }}>
                {filteredCollection.length} {filteredCollection.length === 1 ? 'artwork' : 'artworks'} in your collection
              </p>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
              <button
                onClick={handleShareCollection}
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
                placeholder="Search your collection..."
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

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              style={{
                padding: 'var(--space-md)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg)',
                color: 'var(--fg)',
                fontSize: '16px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Status</option>
              <option value="purchased">Purchased</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>

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

          {/* Collection Grid/List */}
          {filteredCollection.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: 'var(--space-xxl)',
              color: 'var(--muted)'
            }}>
              <ShoppingBag size={48} style={{ marginBottom: 'var(--space-md)', opacity: 0.5 }} />
              <h3 style={{ margin: '0 0 var(--space-sm) 0', fontSize: '20px' }}>
                {searchQuery ? 'No artworks match your search' : 'No artworks in your collection yet'}
              </h3>
              <p style={{ margin: '0 0 var(--space-lg) 0' }}>
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Start exploring and purchase artworks you love'
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
              {filteredCollection.map((artwork) => (
                <div key={artwork.id} style={{ position: 'relative' }}>
                  <div style={{
                    backgroundColor: 'var(--bg-alt)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-lg)',
                    border: '1px solid var(--border)',
                    transition: 'all 0.2s ease'
                  }}>
                    <div style={{ marginBottom: 'var(--space-md)' }}>
                      <img
                        src={artwork.primaryImageUrl}
                        alt={artwork.title}
                        style={{
                          width: '100%',
                          height: '200px',
                          objectFit: 'cover',
                          borderRadius: 'var(--radius-md)',
                          marginBottom: 'var(--space-md)'
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: 'var(--space-md)',
                        right: 'var(--space-md)',
                        backgroundColor: getStatusColor(artwork.status),
                        color: 'white',
                        padding: 'var(--space-xs) var(--space-sm)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {getStatusLabel(artwork.status)}
                      </div>
                    </div>

                    <div>
                      <h3 style={{ 
                        fontSize: '18px', 
                        fontWeight: '600', 
                        margin: '0 0 var(--space-xs) 0',
                        color: 'var(--fg)'
                      }}>
                        {artwork.title}
                      </h3>
                      <p style={{ 
                        color: 'var(--muted)', 
                        margin: '0 0 var(--space-sm) 0',
                        fontSize: '14px'
                      }}>
                        by {artwork.artist.name}
                      </p>
                      <p style={{ 
                        fontSize: '16px', 
                        fontWeight: '600', 
                        margin: '0 0 var(--space-md) 0',
                        color: 'var(--fg)'
                      }}>
                        {artwork.currency} {artwork.price.toLocaleString()}
                      </p>

                      <div style={{ 
                        display: 'flex', 
                        gap: 'var(--space-sm)',
                        marginTop: 'var(--space-md)'
                      }}>
                        <button
                          onClick={() => handleDownloadInvoice(artwork.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-xs)',
                            padding: 'var(--space-sm) var(--space-md)',
                            backgroundColor: 'var(--bg)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--fg)',
                            cursor: 'pointer',
                            fontSize: '14px',
                            transition: 'all 0.2s ease',
                            flex: 1
                          }}
                        >
                          <FileText size={14} />
                          Invoice
                        </button>
                        <button
                          onClick={() => handleDownloadCOA(artwork.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-xs)',
                            padding: 'var(--space-sm) var(--space-md)',
                            backgroundColor: 'var(--bg)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--fg)',
                            cursor: 'pointer',
                            fontSize: '14px',
                            transition: 'all 0.2s ease',
                            flex: 1
                          }}
                        >
                          <Download size={14} />
                          COA
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}

export default CollectionPage
