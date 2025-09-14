import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { Users, Heart, Eye, Calendar, Filter, Grid, List, ChevronRight, Star, Sparkles } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface CommunityCuration {
  id: string
  title: string
  description: string
  curator: {
    id: string
    name: string
    avatar_url?: string
    role: 'artist' | 'collector'
  }
  items: Array<{
    id: string
    type: 'artwork' | 'artist'
    title: string
    image_url?: string
    artist_name?: string
  }>
  is_public: boolean
  created_at: string
  updated_at: string
  likes_count: number
  views_count: number
}

const CommunityPage: React.FC = () => {
  const [curations, setCurations] = useState<CommunityCuration[]>([])
  const [filteredCurations, setFilteredCurations] = useState<CommunityCuration[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filters, setFilters] = useState({
    sortBy: 'newest',
    curatorType: 'all' as 'all' | 'artist' | 'collector',
    searchQuery: ''
  })

  useEffect(() => {
    loadCommunityCurations()
  }, [])

  useEffect(() => {
    filterCurations()
  }, [curations, filters])

  const loadCommunityCurations = async () => {
    try {
      setLoading(true)
      // This would fetch from a community_curations table or similar
      // For now, we'll create mock data that represents public lists from collectors/artists
      const mockCurations: CommunityCuration[] = [
        {
          id: '1',
          title: 'Emerging Contemporary Artists',
          description: 'A carefully curated selection of emerging contemporary artists whose work shows exceptional promise and innovation.',
          curator: {
            id: '1',
            name: 'Sarah Chen',
            avatar_url: '/api/placeholder/40/40',
            role: 'collector'
          },
          items: [
            { id: '1', type: 'artist', title: 'Maya Rodriguez', image_url: '/api/placeholder/200/200' },
            { id: '2', type: 'artwork', title: 'Abstract No. 7', image_url: '/api/placeholder/200/200', artist_name: 'Alex Kim' },
            { id: '3', type: 'artist', title: 'Elena Volkov', image_url: '/api/placeholder/200/200' }
          ],
          is_public: true,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-20T15:30:00Z',
          likes_count: 42,
          views_count: 128
        },
        {
          id: '2',
          title: 'Minimalist Masterpieces',
          description: 'Exploring the beauty of minimalism in contemporary art, featuring works that embrace simplicity and restraint.',
          curator: {
            id: '2',
            name: 'David Park',
            avatar_url: '/api/placeholder/40/40',
            role: 'artist'
          },
          items: [
            { id: '4', type: 'artwork', title: 'White on White', image_url: '/api/placeholder/200/200', artist_name: 'David Park' },
            { id: '5', type: 'artwork', title: 'Untitled', image_url: '/api/placeholder/200/200', artist_name: 'Lisa Chen' },
            { id: '6', type: 'artwork', title: 'Monochrome Study', image_url: '/api/placeholder/200/200', artist_name: 'James Wilson' }
          ],
          is_public: true,
          created_at: '2024-01-10T14:20:00Z',
          updated_at: '2024-01-18T09:15:00Z',
          likes_count: 28,
          views_count: 95
        },
        {
          id: '3',
          title: 'Digital Art Revolution',
          description: 'Showcasing the cutting-edge of digital art and new media, featuring artists pushing the boundaries of technology.',
          curator: {
            id: '3',
            name: 'Maria Santos',
            avatar_url: '/api/placeholder/40/40',
            role: 'collector'
          },
          items: [
            { id: '7', type: 'artist', title: 'Neo Digital', image_url: '/api/placeholder/200/200' },
            { id: '8', type: 'artwork', title: 'Algorithmic Beauty', image_url: '/api/placeholder/200/200', artist_name: 'Tech Artist' },
            { id: '9', type: 'artwork', title: 'Virtual Reality', image_url: '/api/placeholder/200/200', artist_name: 'VR Creator' }
          ],
          is_public: true,
          created_at: '2024-01-05T16:45:00Z',
          updated_at: '2024-01-22T11:20:00Z',
          likes_count: 67,
          views_count: 203
        }
      ]
      
      setCurations(mockCurations)
    } catch (error) {
      console.error('Error loading community curations:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterCurations = () => {
    let filtered = [...curations]

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(curation =>
        curation.title.toLowerCase().includes(query) ||
        curation.description.toLowerCase().includes(query) ||
        curation.curator.name.toLowerCase().includes(query)
      )
    }

    // Curator type filter
    if (filters.curatorType !== 'all') {
      filtered = filtered.filter(curation => curation.curator.role === filters.curatorType)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'popular':
          return b.likes_count - a.likes_count
        case 'most_viewed':
          return b.views_count - a.views_count
        default:
          return 0
      }
    })

    setFilteredCurations(filtered)
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
        <p style={{ color: 'var(--muted)', fontSize: '16px' }}>Loading community curations...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      <Helmet>
        <title>Community Curations | ArtFlow</title>
        <meta name="description" content="Discover curated collections from artists and collectors in the ArtFlow community." />
      </Helmet>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'var(--space-3xl) var(--space-lg)'
      }}>
        {/* Hero Section - Artsy Style */}
        <div style={{
          textAlign: 'center',
          marginBottom: 'var(--space-4xl)',
          padding: 'var(--space-4xl) 0'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
            backgroundColor: 'var(--primary)',
            color: 'white',
            padding: 'var(--space-xs) var(--space-md)',
            borderRadius: 'var(--radius-full)',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: 'var(--space-lg)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            <Sparkles size={16} />
            Community Curations
          </div>
          
          <h1 style={{
            fontSize: '48px',
            fontWeight: '800',
            margin: '0 0 var(--space-md) 0',
            color: 'var(--fg)',
            lineHeight: '1.1',
            letterSpacing: '-0.02em'
          }}>
            Discover Art Through
            <br />
            <span style={{ color: 'var(--primary)' }}>Community Eyes</span>
          </h1>
          
          <p style={{
            fontSize: '20px',
            color: 'var(--muted)',
            margin: '0 0 var(--space-xl) 0',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: '1.5'
          }}>
            Explore carefully curated collections from artists and collectors who share their passion for exceptional art
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-lg)',
            fontSize: '14px',
            color: 'var(--muted)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)'
              }} />
              <span>Artist Curations</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent)'
              }} />
              <span>Collector Lists</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--warning)'
              }} />
              <span>Editor's Picks</span>
            </div>
          </div>
        </div>

        {/* Filter Bar - Artsy Style */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-2xl)',
          paddingBottom: 'var(--space-lg)',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <Filter size={16} />
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--fg)' }}>
                {filteredCurations.length} Curations
              </span>
            </div>
            
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              {['all', 'artist', 'collector'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilters(prev => ({ ...prev, curatorType: type as any }))}
                  style={{
                    padding: 'var(--space-xs) var(--space-md)',
                    border: 'none',
                    backgroundColor: filters.curatorType === type ? 'var(--primary)' : 'transparent',
                    color: filters.curatorType === type ? 'white' : 'var(--muted)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textTransform: 'capitalize'
                  }}
                >
                  {type === 'all' ? 'All' : type === 'artist' ? 'Artists' : 'Collectors'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  border: '1px solid var(--border)',
                  backgroundColor: viewMode === 'grid' ? 'var(--primary)' : 'transparent',
                  color: viewMode === 'grid' ? 'white' : 'var(--fg)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Grid size={14} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  border: '1px solid var(--border)',
                  backgroundColor: viewMode === 'list' ? 'var(--primary)' : 'transparent',
                  color: viewMode === 'list' ? 'white' : 'var(--fg)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <List size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Curations Grid - Artsy Style */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: viewMode === 'list' 
            ? '1fr' 
            : 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 'var(--space-xl)'
        }}>
          {filteredCurations.map((curation) => (
            <div
              key={curation.id}
              style={{
                backgroundColor: 'var(--card)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                border: '1px solid var(--border)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)'
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)'
                e.currentTarget.style.borderColor = 'var(--primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.borderColor = 'var(--border)'
              }}
            >
              <Link to={`/community/${curation.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                {/* Preview Items - Artsy Style */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '1px',
                  height: '200px',
                  backgroundColor: 'var(--bg)'
                }}>
                  {curation.items.slice(0, 3).map((item, index) => (
                    <div
                      key={item.id}
                      style={{
                        backgroundColor: 'var(--border)',
                        backgroundImage: item.image_url ? `url(${item.image_url})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--muted)',
                        fontSize: '14px',
                        fontWeight: '500',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      {!item.image_url && (
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(135deg, var(--border) 0%, var(--bg) 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <span>{item.title.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {curation.items.length > 3 && (
                    <div style={{
                      backgroundColor: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '600',
                      position: 'relative'
                    }}>
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        +{curation.items.length - 3}
                      </div>
                    </div>
                  )}
                </div>
                
                <div style={{ padding: 'var(--space-lg)' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--space-sm)'
                  }}>
                    <span style={{
                      fontSize: '12px',
                      color: curation.curator.role === 'artist' ? 'var(--primary)' : 'var(--accent)',
                      backgroundColor: curation.curator.role === 'artist' ? 'rgba(110, 31, 255, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      padding: 'var(--space-xs) var(--space-sm)',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {curation.curator.role === 'artist' ? 'Artist Curation' : 'Collector List'}
                    </span>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-sm)',
                      fontSize: '12px',
                      color: 'var(--muted)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                        <Heart size={12} />
                        {curation.likes_count}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                        <Eye size={12} />
                        {curation.views_count}
                      </div>
                    </div>
                  </div>

                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    margin: '0 0 var(--space-sm) 0',
                    color: 'var(--fg)',
                    lineHeight: '1.3',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical' as const,
                    overflow: 'hidden'
                  }}>
                    {curation.title}
                  </h3>
                  
                  <p style={{
                    fontSize: '14px',
                    color: 'var(--muted)',
                    margin: '0 0 var(--space-md) 0',
                    lineHeight: '1.5',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical' as const,
                    overflow: 'hidden'
                  }}>
                    {curation.description}
                  </p>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 'var(--space-sm)',
                    borderTop: '1px solid var(--border)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-sm)'
                    }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--border)',
                        backgroundImage: curation.curator.avatar_url ? `url(${curation.curator.avatar_url})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }} />
                      <div>
                        <div style={{
                          fontSize: '13px',
                          fontWeight: '600',
                          color: 'var(--fg)',
                          lineHeight: '1.2'
                        }}>
                          {curation.curator.name}
                        </div>
                        <div style={{
                          fontSize: '11px',
                          color: 'var(--muted)',
                          textTransform: 'capitalize'
                        }}>
                          {curation.curator.role}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-xs)',
                      color: 'var(--primary)',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      <span>View Curation</span>
                      <ChevronRight size={12} />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {filteredCurations.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: 'var(--space-3xl)',
            color: 'var(--muted)'
          }}>
            <h3 style={{ fontSize: '20px', margin: '0 0 var(--space-md) 0' }}>
              No curations found
            </h3>
            <p style={{ margin: 0 }}>
              Try adjusting your search criteria or check back later for new curations
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CommunityPage
