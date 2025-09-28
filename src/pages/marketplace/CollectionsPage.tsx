import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { Search, Filter, Grid, List, Plus, Users, Calendar, MapPin } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Catalogue {
  id: string
  name: string
  slug: string
  description: string
  coverImageUrl?: string
  artworkCount: number
  artist: {
    id: string
    name: string
    avatarUrl?: string
    bio?: string
  }
  tags: string[]
  isPublic: boolean
  isFollowed?: boolean
  createdAt: string
  updatedAt: string
}

const CataloguesPage: React.FC = () => {
  const [catalogues, setCatalogues] = useState<Catalogue[]>([])
  const [filteredCatalogues, setFilteredCatalogues] = useState<Catalogue[]>([])
  const [collections, setCollections] = useState<Catalogue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    sortBy: 'newest',
    tags: [] as string[],
    isPublic: 'all' as 'all' | 'public' | 'private'
  })

  useEffect(() => {
    const loadCollections = async () => {
      try {
        setLoading(true)
        // Fetch real collections data from the database
        const { data: collectionsData, error } = await supabase
          .from('catalogues')
          .select(`
            *,
            profiles!catalogues_user_id_fkey(
              id,
              full_name,
              display_name,
              avatar_url
            ),
            artworks!catalogue_artworks(
              id,
              title,
              primary_image_url,
              status
            )
          `)
          .eq('is_public', true)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching collections:', error)
          setError('Failed to load collections')
          return
        }

        const formattedCollections: Catalogue[] = (collectionsData || []).map(catalogue => ({
          id: catalogue.id,
          name: catalogue.name,
          slug: catalogue.slug,
          description: catalogue.description,
          coverImageUrl: catalogue.cover_image_url,
          artworkCount: catalogue.artworks?.filter((artwork: any) => artwork.status === 'available').length || 0,
          artist: {
            id: catalogue.profiles?.id || '',
            name: catalogue.profiles?.full_name || catalogue.profiles?.display_name || 'Unknown Artist',
            avatarUrl: catalogue.profiles?.avatar_url
          },
          tags: catalogue.tags || [],
          isPublic: catalogue.is_public,
          isFollowed: false, // TODO: Check if current user follows this collection
          createdAt: catalogue.created_at,
          updatedAt: catalogue.updated_at
        }))

        setCatalogues(formattedCollections)
        setFilteredCatalogues(formattedCollections)
        setCollections(formattedCollections)
      } catch (e: any) {
        setError(e.message || 'Failed to load collections')
      } finally {
        setLoading(false)
      }
    }

    loadCollections()
  }, [])

  useEffect(() => {
    let filtered = [...catalogues]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(collection =>
        collection.name.toLowerCase().includes(query) ||
        collection.description.toLowerCase().includes(query) ||
        collection.artist.name.toLowerCase().includes(query) ||
        collection.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Tag filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(collection =>
        filters.tags.some(tag => collection.tags.includes(tag))
      )
    }

    // Public/Private filter
    if (filters.isPublic !== 'all') {
      filtered = filtered.filter(collection =>
        filters.isPublic === 'public' ? collection.isPublic : !collection.isPublic
      )
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'name':
          return a.name.localeCompare(b.name)
        case 'artwork-count':
          return b.artworkCount - a.artworkCount
        default:
          return 0
      }
    })

    setFilteredCatalogues(filtered)
  }, [catalogues, searchQuery, filters])

  const handleFollow = (collectionId: string) => {
    setCatalogues(prev => prev.map(collection =>
      collection.id === collectionId
        ? { ...collection, isFollowed: !collection.isFollowed }
        : collection
    ))
  }

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
        <p style={{ color: 'var(--muted)', fontSize: '16px' }}>Loading collections...</p>
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
        <title>Collections | ArtFlow</title>
        <meta name="description" content="Discover curated art collections from artists and curators around the world." />
      </Helmet>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: 'var(--space-xl) var(--space-lg)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-xl)'
        }}>
          <div>
            <h1 style={{
              fontSize: '36px',
              fontWeight: '700',
              margin: '0 0 var(--space-sm) 0',
              color: 'var(--fg)'
            }}>
              Collections
            </h1>
            <p style={{
              fontSize: '18px',
              color: 'var(--muted)',
              margin: 0
            }}>
              {collections.length} curated collection{collections.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link to="/collections/create" className="brush-button primary">
            <Plus size={18} />
            Create Collection
          </Link>
        </div>

        {/* Search and Filters */}
        <div style={{
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-lg)',
          marginBottom: 'var(--space-xl)'
        }}>
          {/* Search Bar */}
          <div style={{
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
                placeholder="Search collections, curators, tags..."
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
          </div>

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
                <Filter size={16} />
                Filters
              </button>

              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
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
                <option value="name">Name A-Z</option>
                <option value="artwork-count">Most Artworks</option>
              </select>
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
        </div>

        {/* Collections Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: viewMode === 'list' 
            ? '1fr' 
            : 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: 'var(--space-lg)'
        }}>
          {collections.map((collection) => (
            <div
              key={collection.id}
              style={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <Link to={`/collection/${collection.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{
                  aspectRatio: '16/9',
                  backgroundColor: 'var(--border)',
                  backgroundImage: collection.coverImageUrl ? `url(${collection.coverImageUrl})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  {!collection.coverImageUrl && (
                    <div style={{
                      fontSize: '48px',
                      color: 'var(--muted)',
                      fontWeight: '600'
                    }}>
                      {collection.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div style={{
                    position: 'absolute',
                    top: 'var(--space-sm)',
                    right: 'var(--space-sm)',
                    display: 'flex',
                    gap: 'var(--space-xs)'
                  }}>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleFollow(collection.id)
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        backgroundColor: collection.isFollowed ? 'var(--primary)' : 'rgba(0, 0, 0, 0.5)',
                        color: 'white',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <Users size={16} />
                    </button>
                  </div>
                </div>
                
                <div style={{ padding: 'var(--space-lg)' }}>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    margin: '0 0 var(--space-xs) 0',
                    color: 'var(--fg)',
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical' as const,
                    overflow: 'hidden'
                  }}>
                    {collection.name}
                  </h3>
                  
                  <p style={{
                    fontSize: '14px',
                    color: 'var(--muted)',
                    margin: '0 0 var(--space-sm) 0',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical' as const,
                    overflow: 'hidden',
                    lineHeight: '1.4'
                  }}>
                    {collection.description}
                  </p>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-sm)',
                    margin: '0 0 var(--space-sm) 0'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-xs)',
                      fontSize: '12px',
                      color: 'var(--muted)'
                    }}>
                      <Users size={12} />
                      {collection.artworkCount} artwork{collection.artworkCount !== 1 ? 's' : ''}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-xs)',
                      fontSize: '12px',
                      color: 'var(--muted)'
                    }}>
                      <Calendar size={12} />
                      {new Date(collection.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-xs)'
                    }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--border)',
                        backgroundImage: collection.artist.avatarUrl ? `url(${collection.artist.avatarUrl})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }} />
                      <span style={{
                        fontSize: '12px',
                        color: 'var(--muted)',
                        fontWeight: '500'
                      }}>
                        by {collection.artist.name}
                      </span>
                    </div>
                    
                    {collection.isFollowed && (
                      <span style={{
                        fontSize: '10px',
                        color: 'var(--primary)',
                        backgroundColor: 'rgba(110, 31, 255, 0.1)',
                        padding: '2px var(--space-xs)',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Following
                      </span>
                    )}
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 'var(--space-xs)',
                    margin: 'var(--space-sm) 0 0 0'
                  }}>
                    {collection.tags.slice(0, 3).map((tag) => (
                      <span key={tag} style={{
                        fontSize: '10px',
                        color: 'var(--muted)',
                        backgroundColor: 'var(--border)',
                        padding: '2px var(--space-xs)',
                        borderRadius: 'var(--radius-sm)',
                        textTransform: 'capitalize'
                      }}>
                        {tag}
                      </span>
                    ))}
                    {collection.tags.length > 3 && (
                      <span style={{
                        fontSize: '10px',
                        color: 'var(--muted)',
                        backgroundColor: 'var(--border)',
                        padding: '2px var(--space-xs)',
                        borderRadius: 'var(--radius-sm)'
                      }}>
                        +{collection.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {collections.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: 'var(--space-3xl)',
            color: 'var(--muted)'
          }}>
            <h3 style={{ fontSize: '20px', margin: '0 0 var(--space-md) 0' }}>
              No collections found
            </h3>
            <p style={{ margin: '0 0 var(--space-lg) 0' }}>
              Try adjusting your search criteria or create a new collection
            </p>
            <Link to="/collections/create" className="brush-button primary">
              <Plus size={18} />
              Create Collection
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CollectionsPage() {
  return <div>Collections Page - Coming Soon</div>
}
