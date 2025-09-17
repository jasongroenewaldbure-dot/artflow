import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, MapPin, BadgeCheck, Heart, Eye, Share2, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from "../../components/common/LoadingSpinner"
import Container from "../../components/common/Container"
import { useAuth } from '@/contexts/AuthProvider'
import toast from 'react-hot-toast'

interface Artist {
  id: string
  full_name: string
  display_name: string
  bio: string
  location: string
  slug: string
  avatar_url: string
  website: string
  created_at: string
}

interface Artwork {
  id: string
  title: string
  image_url: string
  primary_image_url: string
  slug: string
  price: number
  currency: string
  year: number
  medium: string
  dimensions: {
    width: number
    height: number
    unit: string
  }
  status: string
  created_at: string
}

const fetchArtistPortfolio = async (slug: string) => {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, display_name, bio, location, slug, avatar_url, website, created_at')
    .eq('slug', slug)
    .eq('role', 'ARTIST')
    .single()

  if (profileError || !profile) throw new Error('Artist not found')

  const { data: artworks, error: artworksError } = await supabase
    .from('artworks')
    .select(`
      id, 
      title, 
      image_url, 
      primary_image_url,
      slug, 
      price, 
      currency, 
      year,
      medium,
      dimensions,
      status,
      created_at
    `)
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })

  if (artworksError) throw new Error('Could not fetch artworks')

  // Log profile view
  supabase.rpc('log_profile_view', { p_artist_id: profile.id }).then()

  return { profile, artworks: artworks || [] }
}

type ArtworkForModal = {
  id: string
  title: string | null
  image_url: string | null
}

const ArtistProfile: React.FC = () => {
  const { profileSlug } = useParams<{ profileSlug: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [inquiryArtwork, setInquiryArtwork] = useState<ArtworkForModal | null>(null)
  const [filter, setFilter] = useState<'All' | 'Available' | 'Sold'>('All')
  const [isFollowing, setIsFollowing] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['artistPortfolio', profileSlug],
    queryFn: () => fetchArtistPortfolio(profileSlug!),
    enabled: !!profileSlug,
  })

  const showBackButton = location.state?.from === '/artists'
  const isOwner = user?.id === data?.profile?.id

  const handleFollow = async () => {
    if (!user) {
      toast.error('Please sign in to follow artists')
      return
    }

    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', data!.profile.id)
        
        if (error) throw error
        setIsFollowing(false)
        toast.success('Unfollowed artist')
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: data!.profile.id
          })
        
        if (error) throw error
        setIsFollowing(true)
        toast.success('Following artist')
      }
    } catch (error: any) {
      console.error('Error updating follow status:', error)
      toast.error('Failed to update follow status')
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${data?.profile.full_name} - Artist Profile`,
        text: `Check out ${data?.profile.full_name}'s amazing artwork`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard')
    }
  }

  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price)
  }

  const formatLocation = (loc: any) => {
    if (!loc) return null
    if (typeof loc === 'string') return loc
    const parts = [loc.city, loc.country].filter(Boolean)
    return parts.join(', ')
  }

  const formatDimensions = (dimensions: any) => {
    if (!dimensions) return ''
    const { width, height, unit } = dimensions
    return `${width} × ${height} ${unit}`
  }

  if (isLoading) {
    return (
      <div className="artist-profile-page">
        <Container>
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <LoadingSpinner size="lg" text="Loading artist portfolio..." />
          </div>
        </Container>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="artist-profile-page">
        <Container>
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <h1>404 - Artist Not Found</h1>
            <p>The artist you are looking for does not exist or has moved.</p>
            <div style={{ marginTop: '2rem' }}>
              <button 
                onClick={() => navigate(-1)}
                className="btn btn-outline"
                style={{ marginRight: '1rem' }}
              >
                <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} />
                Go Back
              </button>
              <Link to="/artists" className="btn btn-primary">
                Browse Artists
              </Link>
            </div>
          </div>
        </Container>
      </div>
    )
  }

  const { profile, artworks } = data
  const locationString = formatLocation(profile.location)

  const filteredArtworks = artworks.filter((art) => {
    if (filter === 'All') return true
    return art.status === filter
  })

  return (
    <>
      <Helmet>
        <title>{profile.full_name} - Artist Profile | ArtFlow</title>
        <meta name="description" content={profile.bio || `View ${profile.full_name}'s artwork portfolio on ArtFlow`} />
        <meta property="og:title" content={`${profile.full_name} - Artist Profile`} />
        <meta property="og:description" content={profile.bio || `View ${profile.full_name}'s artwork portfolio`} />
        <meta property="og:image" content={profile.avatar_url} />
      </Helmet>

      <div className="artist-profile-page">
        <Container>
          {/* Navigation */}
          {showBackButton && (
            <button
              onClick={() => navigate('/artists')}
              className="back-btn"
            >
              <ArrowLeft size={16} />
              All Artists
            </button>
          )}

          {/* Artist Header */}
          <header className="artist-header">
            <div className="artist-avatar-section">
              <img
                src={profile.avatar_url || 'https://placehold.co/128x128'}
                alt={profile.full_name}
                className="artist-avatar-large"
              />
            </div>
            
            <div className="artist-info-section">
              <div className="artist-title">
                <h1 className="artist-name">{profile.full_name}</h1>
                {profile.display_name && profile.display_name !== profile.full_name && (
                  <p className="artist-display-name">"{profile.display_name}"</p>
                )}
                <BadgeCheck className="verified-badge" size={20} />
              </div>

              {locationString && (
                <div className="artist-location">
                  <MapPin size={16} />
                  <span>{locationString}</span>
                </div>
              )}

              {profile.bio && (
                <p className="artist-bio">{profile.bio}</p>
              )}

              <div className="artist-stats">
                <div className="stat">
                  <strong>{artworks.length}</strong>
                  <span>Artworks</span>
                </div>
                <div className="stat">
                  <strong>2.5K</strong>
                  <span>Followers</span>
                </div>
                <div className="stat">
                  <strong>156</strong>
                  <span>Following</span>
                </div>
              </div>

              <div className="artist-actions">
                {!isOwner && (
                  <button 
                    onClick={handleFollow}
                    className={`btn ${isFollowing ? 'btn-outline' : 'btn-primary'}`}
                  >
                    <Heart size={16} fill={isFollowing ? 'currentColor' : 'none'} />
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
                <button onClick={handleShare} className="btn btn-outline">
                  <Share2 size={16} />
                  Share
                </button>
                {profile.website && (
                  <a 
                    href={profile.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                  >
                    <ExternalLink size={16} />
                    Website
                  </a>
                )}
              </div>
            </div>
          </header>

          {/* Filter Controls */}
          <div className="artwork-filters">
            <div className="filter-buttons">
              {['All', 'Available', 'Sold'].map((f) => (
                <button
                  key={f}
                  className={`filter-btn ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f as typeof filter)}
                >
                  {f}
                  <span className="filter-count">
                    ({f === 'All' ? artworks.length : artworks.filter(a => a.status === f).length})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Artwork Grid */}
          <div className="artworks-section">
            {filteredArtworks.length === 0 ? (
              <div className="empty-state">
                <h3>No artworks match this filter</h3>
                <p>Try selecting a different filter or check back later for new works.</p>
              </div>
            ) : (
              <div className="artworks-grid">
                {filteredArtworks.map((art) => (
                  <div key={art.id} className="artwork-card">
                    <Link to={`/artwork/${art.slug}`} className="artwork-link">
                      <div className="artwork-image">
                        <img
                          src={art.primary_image_url || art.image_url || 'https://placehold.co/400x400'}
                          alt={art.title}
                          loading="lazy"
                        />
                        {art.status === 'Sold' && (
                          <div className="sold-badge">Sold</div>
                        )}
                        <div className="artwork-overlay">
                          <div className="artwork-actions">
                            <button className="action-btn">
                              <Heart size={16} />
                            </button>
                            <button className="action-btn">
                              <Eye size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="artwork-info">
                        <h3 className="artwork-title">{art.title}</h3>
                        <p className="artwork-details">
                          {art.medium} • {art.year}
                        </p>
                        {art.dimensions && (
                          <p className="artwork-dimensions">
                            {formatDimensions(art.dimensions)}
                          </p>
                        )}
                        <p className="artwork-price">
                          {art.price > 0 ? formatPrice(art.price, art.currency) : 'Price on Request'}
                        </p>
                      </div>
                    </Link>
                    
                    {!isOwner && art.status === 'Available' && (
                      <div className="artwork-card-actions">
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => setInquiryArtwork(art as ArtworkForModal)}
                        >
                          Inquire
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Container>
      </div>

      {/* Inquiry Modal Placeholder */}
      {inquiryArtwork && (
        <div className="modal-overlay" onClick={() => setInquiryArtwork(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Inquire about {inquiryArtwork.title}</h3>
            <p>Inquiry form would go here...</p>
            <div className="modal-actions">
              <button 
                onClick={() => setInquiryArtwork(null)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button className="btn btn-primary">
                Send Inquiry
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ArtistProfile