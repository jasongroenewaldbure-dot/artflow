import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useLocation, Link } from 'react-router-dom'
import { Search, Filter, Grid, List, Camera, Sparkles, TrendingUp } from 'lucide-react'
import FiltersSidebar, { MarketplaceFilters } from '../../components/marketplace/FiltersSidebar'
import { SearchResult, ImageSearchResult } from '../../services/intelligentSearch'
import ArtworkCard from '../../components/marketplace/ArtworkCard'
import ArtistCard from '../../components/marketplace/ArtistCard'

const SearchResultsPage: React.FC = () => {
  const location = useLocation()
  const [results, setResults] = useState<SearchResult[]>([])
  const [imageResults, setImageResults] = useState<ImageSearchResult[]>([])
  const [searchType, setSearchType] = useState<'text' | 'image'>('text')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'artworks' | 'artists' | 'catalogues'>('artworks')
  const [compare, setCompare] = useState<Array<{ id: string; title: string; imageUrl?: string }>>([])
  const [filters, setFilters] = useState<MarketplaceFilters>({ availability: 'all' })

  useEffect(() => {
    if (location.state) {
      const { results: searchResults, type } = location.state as {
        results: SearchResult[] | ImageSearchResult[]
        type: 'text' | 'image'
      }
      
      if (type === 'text') {
        setResults(searchResults as SearchResult[])
        setSearchType('text')
      } else {
        setImageResults(searchResults as ImageSearchResult[])
        setSearchType('image')
      }
    }
  }, [location.state])

  const getSearchSummary = () => {
    if (searchType === 'text') {
      const artworkCount = results.filter(r => r.type === 'artwork').length
      const artistCount = results.filter(r => r.type === 'artist').length
      const catalogueCount = results.filter(r => r.type === 'catalogue').length
      
      return `${results.length} results found (${artworkCount} artworks, ${artistCount} artists, ${catalogueCount} catalogues)`
    } else {
      return `${imageResults.length} similar artworks found`
    }
  }

  const toggleCompare = (item: { id: string; title: string; imageUrl?: string }) => {
    setCompare(prev => {
      const exists = prev.find(p => p.id === item.id)
      if (exists) return prev.filter(p => p.id !== item.id)
      if (prev.length >= 3) return prev // cap at 3
      return [...prev, item]
    })
  }

  const renderArtworkResults = () => {
    const artworks = searchType === 'text' 
      ? results.filter(r => r.type === 'artwork')
      : imageResults.map(img => ({
          id: img.artworkId,
          type: 'artwork' as const,
          title: img.metadata.title,
          description: '',
          imageUrl: img.metadata.imageUrl,
          relevanceScore: img.similarityScore,
          metadata: img.metadata
        }))

    // apply filters
    const filtered = artworks.filter((a: any) => {
      const price = a.metadata.price || 0
      if (filters.priceMin != null && price < filters.priceMin) return false
      if (filters.priceMax != null && price > filters.priceMax) return false
      if (filters.mediums && filters.mediums.length > 0 && a.metadata.medium && !filters.mediums.includes(a.metadata.medium)) return false
      if (filters.availability === 'for_sale' && a.metadata.status && a.metadata.status !== 'for_sale') return false
      if (filters.availability === 'sold' && a.metadata.status && a.metadata.status !== 'sold') return false
      // size buckets (use height_cm/width_cm if present)
      if (filters.size) {
        const w = a.metadata.width_cm || 0
        const h = a.metadata.height_cm || 0
        const maxDim = Math.max(w, h)
        if (filters.size === 'small' && maxDim > 50) return false
        if (filters.size === 'medium' && (maxDim <= 50 || maxDim > 120)) return false
        if (filters.size === 'large' && maxDim < 120) return false
      }
      return true
    })

    if (filtered.length === 0) {
      return (
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-3xl)',
          color: 'var(--muted)'
        }}>
          <Search size={48} style={{ marginBottom: 'var(--space-lg)', opacity: 0.5 }} />
          <h3 style={{ fontSize: '20px', margin: '0 0 var(--space-md) 0' }}>
            No artworks found
          </h3>
          <p style={{ margin: 0 }}>
            Try adjusting your search criteria or use different keywords
          </p>
        </div>
      )
    }

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: viewMode === 'list' 
          ? '1fr' 
          : 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 'var(--space-lg)'
      }}>
        {filtered.map((artwork) => (
          <div key={artwork.id} style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 1 }}>
              <button
                onClick={() => toggleCompare({ id: artwork.id as string, title: artwork.title, imageUrl: artwork.imageUrl })}
                style={{
                  fontSize: '12px',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  backgroundColor: compare.some(i => i.id === artwork.id) ? 'var(--primary)' : 'var(--card)',
                  color: compare.some(i => i.id === artwork.id) ? 'white' : 'var(--fg)',
                  cursor: 'pointer'
                }}
              >
                {compare.some(i => i.id === artwork.id) ? 'Selected' : 'Compare'}
              </button>
            </div>
            <ArtworkCard
              artwork={{
                id: artwork.id,
                title: artwork.title,
                price: artwork.metadata.price,
                primaryImageUrl: artwork.imageUrl,
                artist: artwork.metadata.artist,
                genre: artwork.metadata.genre,
                medium: artwork.metadata.medium,
                dominantColors: artwork.metadata.dominantColors,
                createdAt: artwork.metadata.createdAt
              }}
              viewMode={viewMode}
              showRelevanceScore={true}
              relevanceScore={artwork.relevanceScore}
            />
          </div>
        ))}
      </div>
    )
  }

  const renderArtistResults = () => {
    const artists = results.filter(r => r.type === 'artist')

    if (artists.length === 0) {
      return null
    }

    return (
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '600',
          margin: '0 0 var(--space-lg) 0',
          color: 'var(--fg)'
        }}>
          Artists ({artists.length})
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: 'var(--space-lg)'
        }}>
          {artists.map((artist) => (
            <ArtistCard
              key={artist.id}
              artist={{
                id: artist.id,
                name: artist.title,
                bio: artist.description,
                avatarUrl: artist.metadata.avatarUrl,
                artworkCount: artist.metadata.artworkCount || 0,
                followersCount: artist.metadata.followersCount || 0
              }}
              showRelevanceScore={true}
              relevanceScore={artist.relevanceScore}
            />
          ))}
        </div>
      </div>
    )
  }

  const renderCatalogueResults = () => {
    const catalogues = results.filter(r => r.type === 'catalogue')

    if (catalogues.length === 0) {
      return null
    }

    return (
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '600',
          margin: '0 0 var(--space-lg) 0',
          color: 'var(--fg)'
        }}>
          Catalogues ({catalogues.length})
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 'var(--space-lg)'
        }}>
          {catalogues.map((catalogue) => (
            <Link
              key={catalogue.id}
              to={`/catalogue/${catalogue.id}`}
              style={{
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              <div style={{
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
              {catalogue.imageUrl && (
                <img
                  src={catalogue.imageUrl}
                  alt={catalogue.title}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover'
                  }}
                />
              )}
              <div style={{ padding: 'var(--space-lg)' }}>
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  margin: '0 0 var(--space-sm) 0',
                  color: 'var(--fg)'
                }}>
                  {catalogue.title}
                </h4>
                <p style={{
                  fontSize: '14px',
                  color: 'var(--muted)',
                  margin: '0 0 var(--space-sm) 0'
                }}>
                  by {catalogue.metadata.artist?.name || 'Unknown Artist'}
                </p>
                <p style={{
                  fontSize: '14px',
                  color: 'var(--muted)',
                  margin: '0 0 var(--space-md) 0'
                }}>
                  {catalogue.metadata.artworkCount} artworks
                </p>
                {catalogue.relevanceScore > 0 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      fontSize: '12px',
                      color: 'var(--muted)',
                      backgroundColor: 'var(--border)',
                      padding: '2px var(--space-xs)',
                      borderRadius: 'var(--radius-sm)'
                    }}>
                      {Math.round(catalogue.relevanceScore)}% match
                    </span>
                  </div>
                )}
              </div>
            </div>
            </Link>
          ))}
        </div>
      </div>
    )
  }

  const renderImageSearchResults = () => {
    if (imageResults.length === 0) {
      return (
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-3xl)',
          color: 'var(--muted)'
        }}>
          <Camera size={48} style={{ marginBottom: 'var(--space-lg)', opacity: 0.5 }} />
          <h3 style={{ fontSize: '20px', margin: '0 0 var(--space-md) 0' }}>
            No similar artworks found
          </h3>
          <p style={{ margin: 0 }}>
            Try uploading a different image or use text search instead
          </p>
        </div>
      )
    }

    return (
      <div>
        <div style={{
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-lg)',
          marginBottom: 'var(--space-xl)'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            margin: '0 0 var(--space-md) 0',
            color: 'var(--fg)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)'
          }}>
            <Camera size={20} />
            Visual Similarity Search
          </h3>
          <p style={{
            margin: 0,
            color: 'var(--muted)',
            fontSize: '14px'
          }}>
            Found {imageResults.length} artworks with visual similarities to your uploaded image
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 'var(--space-lg)'
        }}>
          {imageResults.map((result) => (
            <div
              key={result.artworkId}
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
              <Link to={`/artwork/${result.artworkId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{
                  aspectRatio: '16/9',
                  backgroundColor: 'var(--border)',
                  backgroundImage: result.metadata.imageUrl ? `url(${result.metadata.imageUrl})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 'var(--space-sm)',
                    right: 'var(--space-sm)',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    color: 'white',
                    padding: 'var(--space-xs) var(--space-sm)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {Math.round(result.similarityScore)}% match
                  </div>
                </div>
                
                <div style={{ padding: 'var(--space-lg)' }}>
                  <h4 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    margin: '0 0 var(--space-sm) 0',
                    color: 'var(--fg)'
                  }}>
                    {result.metadata.title}
                  </h4>
                  
                  <p style={{
                    fontSize: '14px',
                    color: 'var(--muted)',
                    margin: '0 0 var(--space-md) 0'
                  }}>
                    by {result.metadata.artist?.name || 'Unknown Artist'}
                  </p>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--space-sm)'
                  }}>
                    <span style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: 'var(--primary)'
                    }}>
                      ${result.metadata.price || 'Price on request'}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      color: 'var(--muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {result.metadata.medium}
                    </span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 'var(--space-xs)'
                  }}>
                    <div style={{
                      fontSize: '10px',
                      color: 'var(--muted)',
                      backgroundColor: 'var(--border)',
                      padding: '2px var(--space-xs)',
                      borderRadius: 'var(--radius-sm)'
                    }}>
                      Color: {Math.round(result.visualMatches.colorSimilarity * 100)}%
                    </div>
                    <div style={{
                      fontSize: '10px',
                      color: 'var(--muted)',
                      backgroundColor: 'var(--border)',
                      padding: '2px var(--space-xs)',
                      borderRadius: 'var(--radius-sm)'
                    }}>
                      Style: {Math.round(result.visualMatches.styleSimilarity * 100)}%
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    )
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
        <p style={{ color: 'var(--muted)', fontSize: '16px' }}>Searching...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      <Helmet>
        <title>Search Results | ArtFlow</title>
        <meta name="description" content="Search results for artworks, artists, and catalogues on ArtFlow" />
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
          marginBottom: 'var(--space-xl)',
          flexWrap: 'wrap',
          gap: 'var(--space-md)'
        }}>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              margin: '0 0 var(--space-sm) 0',
              color: 'var(--fg)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-sm)'
            }}>
              {searchType === 'image' ? <Camera size={32} /> : <Search size={32} />}
              Search Results
            </h1>
            <p style={{
              fontSize: '16px',
              color: 'var(--muted)',
              margin: 0
            }}>
              {getSearchSummary()}
            </p>
          </div>

          {searchType === 'text' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-sm)'
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
          )}
        </div>

        {/* Layout: sidebar + content */}
        <div style={{ display: 'grid', gridTemplateColumns: searchType === 'text' ? '280px 1fr' : '1fr', gap: 'var(--space-xl)' }}>
          {searchType === 'text' && (
            <FiltersSidebar value={filters} onChange={setFilters} />
          )}

          <div>
        {/* Tabs */}
        {searchType === 'text' && (
          <div style={{
            display: 'flex',
            gap: 'var(--space-md)',
            borderBottom: '1px solid var(--border)',
            marginBottom: 'var(--space-xl)'
          }}>
            {[
              { key: 'artworks', label: `Artworks (${results.filter(r => r.type === 'artwork').length})` },
              { key: 'artists', label: `Artists (${results.filter(r => r.type === 'artist').length})` },
              { key: 'catalogues', label: `Catalogues (${results.filter(r => r.type === 'catalogue').length})` },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                style={{
                  padding: 'var(--space-sm) 0',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: activeTab === (tab.key as any) ? 'var(--primary)' : 'var(--fg)',
                  borderBottom: activeTab === (tab.key as any) ? '2px solid var(--primary)' : '2px solid transparent',
                  fontWeight: 600
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Results by tab */}
        {searchType === 'text' ? (
          activeTab === 'artworks' ? (
            renderArtworkResults()
          ) : activeTab === 'artists' ? (
            renderArtistResults()
          ) : (
            renderCatalogueResults()
          )
        ) : (
          renderImageSearchResults()
        )}

        {/* Compare tray */}
        {compare.length > 0 && (
          <div style={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'var(--card)',
            borderTop: '1px solid var(--border)',
            boxShadow: '0 -8px 20px rgba(0,0,0,0.2)',
            padding: 'var(--space-md)'
          }}>
            <div style={{
              maxWidth: '1400px',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--space-md)'
            }}>
              <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
                {compare.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.title} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} />
                    )}
                    <span style={{ fontSize: 12, color: 'var(--fg)' }}>{item.title}</span>
                    <button onClick={() => toggleCompare(item)} style={{ border: 'none', background: 'none', color: 'var(--muted)', cursor: 'pointer' }}>✕</button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                <button
                  onClick={() => setCompare([])}
                  style={{
                    padding: '8px 12px',
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    color: 'var(--fg)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer'
                  }}
                >
                  Clear
                </button>
                <Link
                  to={'/compare'}
                  state={{ items: compare }}
                  style={{
                    textDecoration: 'none',
                    padding: '8px 12px',
                    background: 'var(--primary)',
                    color: 'white',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  Compare {compare.length}
                </Link>
              </div>
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchResultsPage
