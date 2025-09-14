import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { ArrowRight, TrendingUp, Users, Camera, Sparkles, Loader, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { handleError, showErrorToast } from '../../utils/errorHandling'
import Container from '../../components/ui/Container'
import ArtworkCard from '../../components/marketplace/ArtworkCard'
import ArtistCard from '../../components/marketplace/ArtistCard'

interface Artist {
  id: string
  name: string
  slug: string
  bio?: string
  avatarUrl?: string
  artworkCount?: number
  location?: string
  followersCount?: number
  isVerified?: boolean
  isFeatured?: boolean
  isTrending?: boolean
  isEmerging?: boolean
  isRising?: boolean
}

interface Catalogue {
  id: string
  title: string
  description?: string
  coverImageUrl?: string
  slug: string
  artist: {
    name: string
    slug: string
  }
  artworkCount?: number
  viewsCount?: number
  likesCount?: number
  isFeatured?: boolean
  isPublic?: boolean
  createdAt?: string
}

interface Artwork {
  id: string
  title: string
  artist: {
    name: string
    slug: string
  }
  primaryImageUrl?: string
  price?: string
  currency?: string
  dimensions?: string
  year?: number
  medium?: string
  isForSale?: boolean
  isLiked?: boolean
  likesCount?: number
  viewsCount?: number
  isNew?: boolean
  isTrending?: boolean
  isFeatured?: boolean
}

const HomePage: React.FC = () => {
  const [featuredArtworks, setFeaturedArtworks] = useState<Artwork[]>([])
  const [trendingArtworks, setTrendingArtworks] = useState<Artwork[]>([])
  const [newArtworks, setNewArtworks] = useState<Artwork[]>([])
  const [featuredArtists, setFeaturedArtists] = useState<Artist[]>([])
  const [featuredCatalogues, setFeaturedCatalogues] = useState<Catalogue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError('')
        
        // Load featured artworks
        const { data: featuredData, error: featuredError } = await supabase
          .from('artworks')
          .select(`
            id, title, price, currency, medium, year, dimensions, primary_image_url, updated_at, status,
            profiles!artworks_user_id_fkey(display_name, slug)
          `)
          .eq('status', 'available')
          .order('updated_at', { ascending: false })
          .limit(8)

        if (featuredError) {
          console.warn('Featured artworks error:', featuredError)
          setFeaturedArtworks([])
        } else {
          setFeaturedArtworks(featuredData?.map(artwork => ({
            id: artwork.id,
            title: artwork.title,
            artist: {
              name: (artwork.profiles as any)?.display_name || 'Unknown Artist',
              slug: (artwork.profiles as any)?.slug || artwork.id
            },
            primaryImageUrl: artwork.primary_image_url,
            price: artwork.price?.toString() || undefined,
            currency: artwork.currency,
            medium: artwork.medium,
            year: artwork.year,
            dimensions: artwork.dimensions,
            isForSale: artwork.status === 'available',
            isFeatured: true
          })) || [])
        }

        // Load trending artworks
        const { data: trendingData, error: trendingError } = await supabase
          .from('artworks')
          .select(`
            id, title, price, currency, medium, year, dimensions, primary_image_url, updated_at, status,
            profiles!artworks_user_id_fkey(display_name, slug)
          `)
          .eq('status', 'available')
          .order('updated_at', { ascending: false })
          .limit(8)

        if (trendingError) {
          console.warn('Trending artworks error:', trendingError)
          setTrendingArtworks([])
        } else {
          setTrendingArtworks(trendingData?.map(artwork => ({
            id: artwork.id,
            title: artwork.title,
            artist: {
              name: (artwork.profiles as any)?.display_name || 'Unknown Artist',
              slug: (artwork.profiles as any)?.slug || artwork.id
            },
            primaryImageUrl: artwork.primary_image_url,
            price: artwork.price?.toString() || undefined,
            currency: artwork.currency,
            medium: artwork.medium,
            year: artwork.year,
            dimensions: artwork.dimensions,
            isForSale: artwork.status === 'available',
            isTrending: true
          })) || [])
        }

        // Load new artworks
        const { data: newData, error: newError } = await supabase
          .from('artworks')
          .select(`
            id, title, price, currency, medium, year, dimensions, primary_image_url, updated_at, status,
            profiles!artworks_user_id_fkey(display_name, slug)
          `)
          .eq('status', 'available')
          .order('updated_at', { ascending: false })
          .limit(8)

        if (newError) {
          console.warn('New artworks error:', newError)
          setNewArtworks([])
        } else {
          setNewArtworks(newData?.map(artwork => ({
            id: artwork.id,
            title: artwork.title,
            artist: {
              name: (artwork.profiles as any)?.display_name || 'Unknown Artist',
              slug: (artwork.profiles as any)?.slug || artwork.id
            },
            primaryImageUrl: artwork.primary_image_url,
            price: artwork.price?.toString() || undefined,
            currency: artwork.currency,
            medium: artwork.medium,
            year: artwork.year,
            dimensions: artwork.dimensions,
            isForSale: artwork.status === 'available',
            isNew: true
          })) || [])
        }

        // Load featured artists
        const { data: artistsData, error: artistsError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'artist')
          .order('updated_at', { ascending: false })
          .limit(6)

        if (artistsError) {
          console.warn('Featured artists error:', artistsError)
          setFeaturedArtists([])
        } else {
          setFeaturedArtists(artistsData?.map(artist => ({
            id: artist.id,
            name: artist.display_name || artist.name,
            slug: artist.slug,
            bio: artist.bio,
            avatarUrl: artist.avatar_url,
            location: artist.location,
            followersCount: 0,
            isVerified: artist.verified || false,
            isFeatured: true
          })) || [])
        }


        // Load featured catalogues
        const { data: cataloguesData, error: cataloguesError } = await supabase
          .from('catalogues')
          .select(`
            id, title, description, cover_image_url, slug, updated_at, is_public,
            profiles!catalogues_user_id_fkey(display_name, slug)
          `)
          .eq('is_public', true)
          .order('updated_at', { ascending: false })
          .limit(6)

        if (cataloguesError) {
          console.warn('Featured catalogues error:', cataloguesError)
          setFeaturedCatalogues([])
        } else {
          setFeaturedCatalogues(cataloguesData?.map(catalogue => ({
            id: catalogue.id,
            title: catalogue.title,
            description: catalogue.description,
            coverImageUrl: catalogue.cover_image_url,
            slug: catalogue.slug,
            artist: {
              name: (catalogue.profiles as any)?.display_name || 'Unknown Artist',
              slug: (catalogue.profiles as any)?.slug || catalogue.id
            },
            isFeatured: true,
            isPublic: catalogue.is_public,
            createdAt: catalogue.updated_at
          })) || [])
        }


      } catch (err: any) {
        const appError = handleError(err, { 
          component: 'HomePage', 
          action: 'loadData' 
        })
        setError(appError.userMessage)
        showErrorToast(err, { 
          component: 'HomePage', 
          action: 'loadData' 
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        flexDirection: 'column',
        gap: 'var(--space-lg)'
      }}>
        <Loader size={40} style={{
          color: 'var(--primary)',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: 'var(--muted)', fontSize: '16px' }}>Loading content...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        flexDirection: 'column',
        gap: 'var(--space-lg)'
      }}>
        <AlertCircle size={40} style={{ color: 'var(--danger)' }} />
        <h2 style={{ color: 'var(--danger)', fontSize: '24px' }}>Something went wrong</h2>
        <p style={{ color: 'var(--muted)', textAlign: 'center' }}>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="artflow-button artflow-button--primary"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      <Helmet>
        <title>ArtFlow - Discover, Buy, and Sell Art</title>
        <meta name="description" content="Discover and collect art from artists around the world. A modern art marketplace platform." />
      </Helmet>

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, var(--bg) 0%, var(--bg-alt) 100%)',
        padding: 'var(--space-4xl) 0',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '0 var(--space-lg)'
        }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '800',
            color: 'var(--fg)',
            margin: '0 0 var(--space-lg) 0',
            letterSpacing: '-1px',
            lineHeight: '1.1'
          }}>
            Discover Extraordinary Art
          </h1>
          <p style={{
            fontSize: '20px',
            color: 'var(--muted)',
            margin: '0 0 var(--space-2xl) 0',
            lineHeight: '1.6'
          }}>
            Connect with artists, explore unique artworks, and build your collection on the world's premier art marketplace.
          </p>
          <div style={{
            display: 'flex',
            gap: 'var(--space-md)',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Link to="/search" className="artflow-button artflow-button--primary">
              <Camera size={18} />
              Browse Artworks
            </Link>
            <Link to="/artists" className="artflow-button">
              <Users size={18} />
              Meet Artists
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Artworks */}
      {featuredArtworks.length > 0 && (
        <section style={{ padding: 'var(--space-4xl) 0' }}>
          <Container maxWidth="2xl" padding="lg">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-2xl)'
            }}>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '700',
                color: 'var(--fg)',
                margin: 0
              }}>
                Featured Artworks
              </h2>
              <Link
                to="/search?filter=featured"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)',
                  color: 'var(--primary)',
                  textDecoration: 'none',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                View All
                <ArrowRight size={16} />
              </Link>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--space-xl)'
            }}>
              {featuredArtworks.map((artwork) => (
                <ArtworkCard key={artwork.id} artwork={artwork} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Featured Artists */}
      {featuredArtists.length > 0 && (
        <section style={{
          padding: 'var(--space-4xl) 0',
          backgroundColor: 'var(--card)'
        }}>
          <Container maxWidth="2xl" padding="lg">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-2xl)'
            }}>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '700',
                color: 'var(--fg)',
                margin: 0
              }}>
                Featured Artists
              </h2>
              <Link
                to="/artists?filter=featured"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)',
                  color: 'var(--primary)',
                  textDecoration: 'none',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                View All
                <ArrowRight size={16} />
              </Link>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-xl)'
            }}>
              {featuredArtists.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Trending Artworks */}
      {trendingArtworks.length > 0 && (
        <section style={{ padding: 'var(--space-4xl) 0' }}>
          <Container maxWidth="2xl" padding="lg">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-2xl)'
            }}>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '700',
                color: 'var(--fg)',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)'
              }}>
                <TrendingUp size={32} />
                Trending Now
              </h2>
              <Link
                to="/search?filter=trending"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)',
                  color: 'var(--primary)',
                  textDecoration: 'none',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                View All
                <ArrowRight size={16} />
              </Link>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--space-xl)'
            }}>
              {trendingArtworks.map((artwork) => (
                <ArtworkCard key={artwork.id} artwork={artwork} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* New This Week */}
      {newArtworks.length > 0 && (
        <section style={{
          padding: 'var(--space-4xl) 0',
          backgroundColor: 'var(--card)'
        }}>
          <Container maxWidth="2xl" padding="lg">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-2xl)'
            }}>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '700',
                color: 'var(--fg)',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)'
              }}>
                <Sparkles size={32} />
                New This Week
              </h2>
              <Link
                to="/search?filter=new"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)',
                  color: 'var(--primary)',
                  textDecoration: 'none',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                View All
                <ArrowRight size={16} />
              </Link>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--space-xl)'
            }}>
              {newArtworks.map((artwork) => (
                <ArtworkCard key={artwork.id} artwork={artwork} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Featured Catalogues */}
      {featuredCatalogues.length > 0 && (
        <section style={{ padding: 'var(--space-4xl) 0' }}>
          <Container maxWidth="2xl" padding="lg">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-2xl)'
            }}>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '700',
                color: 'var(--fg)',
                margin: 0
              }}>
                Featured Catalogues
              </h2>
              <Link
                to="/catalogues?filter=featured"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)',
                  color: 'var(--primary)',
                  textDecoration: 'none',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                View All
                <ArrowRight size={16} />
              </Link>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 'var(--space-xl)'
            }}>
              {featuredCatalogues.map((catalogue) => (
                <div key={catalogue.id} className="artflow-card">
                  <div style={{
                    width: '100%',
                    height: '200px',
                    backgroundColor: 'var(--bg-alt)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--space-md)',
                    backgroundImage: catalogue.coverImageUrl ? `url(${catalogue.coverImageUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }} />
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: 'var(--fg)',
                    margin: '0 0 var(--space-sm) 0'
                  }}>
                    {catalogue.title}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: 'var(--muted)',
                    margin: '0 0 var(--space-sm) 0'
                  }}>
                    by {catalogue.artist.name}
                  </p>
                  {catalogue.description && (
                    <p style={{
                      fontSize: '14px',
                      color: 'var(--fg)',
                      margin: 0,
                      lineHeight: '1.5'
                    }}>
                      {catalogue.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* CTA Section */}
      <section style={{
        padding: 'var(--space-4xl) 0',
        backgroundColor: 'var(--primary)',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '0 var(--space-lg)'
        }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: '700',
            margin: '0 0 var(--space-lg) 0'
          }}>
            Ready to Start Your Art Journey?
          </h2>
          <p style={{
            fontSize: '18px',
            margin: '0 0 var(--space-2xl) 0',
            opacity: 0.9
          }}>
            Join thousands of artists and collectors on the world's most innovative art platform.
          </p>
          <div style={{
            display: 'flex',
            gap: 'var(--space-md)',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Link
              to="/start"
              style={{
                padding: 'var(--space-lg) var(--space-2xl)',
                backgroundColor: 'white',
                color: 'var(--primary)',
                textDecoration: 'none',
                borderRadius: 'var(--radius-lg)',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
            >
              Get Started
            </Link>
            <Link
              to="/search"
              style={{
                padding: 'var(--space-lg) var(--space-2xl)',
                backgroundColor: 'transparent',
                color: 'white',
                textDecoration: 'none',
                borderRadius: 'var(--radius-lg)',
                fontSize: '16px',
                fontWeight: '600',
                border: '2px solid white',
                transition: 'all 0.2s ease'
              }}
            >
              Browse Art
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage