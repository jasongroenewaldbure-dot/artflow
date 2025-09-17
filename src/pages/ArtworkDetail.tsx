import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { 
  Heart, 
  Share2, 
  Eye, 
  ArrowLeft, 
  Calendar, 
  Ruler, 
  Palette, 
  User, 
  MapPin,
  ExternalLink,
  ChevronRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from "../components/common/LoadingSpinner"
import ErrorMessage from "../components/common/ErrorMessage"
import Container from "../components/common/Container"
import { useAuth } from '@/contexts/AuthProvider'
import toast from 'react-hot-toast'

interface Artist {
  id: string
  full_name: string
  display_name: string
  slug: string
  avatar_url?: string
  bio?: string
  location?: string
  website?: string
  created_at: string
}

interface Artwork {
  id: string
  title: string
  slug: string
  description?: string
  medium?: string
  dimensions?: {
    height: number
    width: number
    depth?: number
    unit: string
  }
  year?: number
  price?: number
  currency?: string
  is_price_negotiable?: boolean
  image_url?: string
  primary_image_url?: string
  additional_images?: string[]
  status: string
  created_at: string
  updated_at: string
  user_id: string
  artist?: Artist
}

const fetchArtworkBySlug = async (slug: string): Promise<Artwork> => {
  const { data, error } = await supabase
    .from('artworks')
    .select(`
      *,
      artist:profiles!artworks_user_id_fkey(
        id,
        full_name,
        display_name,
        slug,
        avatar_url,
        bio,
        location,
        website,
        created_at
      )
    `)
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching artwork by slug:', error)
    throw new Error(error.message)
  }
  if (!data) {
    throw new Error('Artwork not found')
  }
  return data as Artwork
}

const ArtworkDetail: React.FC = () => {
  const { artworkSlug } = useParams<{ artworkSlug: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [showInquiryModal, setShowInquiryModal] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)

  const { data: artwork, isLoading, isError, error } = useQuery({
    queryKey: ['artwork', artworkSlug],
    queryFn: () => fetchArtworkBySlug(artworkSlug!),
    enabled: !!artworkSlug,
    retry: 1,
  })

  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price)
  }

  if (isLoading) {
    return (
      <div className="artwork-detail-page">
        <Container>
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <LoadingSpinner size="lg" text="Loading artwork..." />
          </div>
        </Container>
      </div>
    )
  }

  if (isError || !artwork) {
    return (
      <div className="artwork-detail-page">
        <Container>
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <AlertCircle size={48} style={{ color: 'var(--muted)', marginBottom: '1rem' }} />
            <h1>Artwork Not Found</h1>
            <p>The piece you are looking for does not exist or has been moved.</p>
            {error && (
              <ErrorMessage 
                message={error.message} 
                style={{ marginTop: '1rem' }} 
              />
            )}
            <div style={{ marginTop: '2rem' }}>
              <button 
                onClick={() => navigate(-1)}
                className="btn btn-outline"
                style={{ marginRight: '1rem' }}
              >
                <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} />
                Go Back
              </button>
              <Link to="/artworks" className="btn btn-primary">
                Browse All Artworks
              </Link>
            </div>
          </div>
        </Container>
      </div>
    )
  }

  const artist = artwork.artist

  return (
    <>
      <Helmet>
        <title>{artwork.title} by {artist?.full_name} | ArtFlow</title>
        <meta name="description" content={artwork.description || `View ${artwork.title} by ${artist?.full_name} on ArtFlow`} />
      </Helmet>

      <div className="artwork-detail-page">
        <Container>
          <nav className="artwork-breadcrumb">
            <button 
              onClick={() => navigate(-1)}
              className="breadcrumb-back"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <div className="breadcrumb-path">
              <Link to="/artworks">Artworks</Link>
              <ChevronRight size={14} />
              <span>{artwork.title}</span>
            </div>
          </nav>

          <div className="artwork-layout-grid">
            <div className="artwork-image-column">
              <img 
                src={artwork.primary_image_url || artwork.image_url || 'https://placehold.co/800x800?text=Image+Not+Available'} 
                alt={artwork.title} 
                className="main-artwork-image"
              />
            </div>

            <div className="artwork-info-column">
              <div className="artwork-header">
                {artist && (
                  <Link to={`/artist/${artist.slug}`} className="artist-link">
                    <User size={16} />
                    {artist.full_name}
                  </Link>
                )}
                <h1 className="artwork-title">{artwork.title}</h1>
                {artwork.year && (
                  <div className="artwork-year">
                    <Calendar size={14} />
                    {artwork.year}
                  </div>
                )}
              </div>

              <div className="artwork-price-section">
                <div className="price-container">
                  <span className="artwork-price">
                    {artwork.price ? formatPrice(artwork.price, artwork.currency) : 'Price on Request'}
                    {artwork.is_price_negotiable && (
                      <span className="negotiable-badge">Negotiable</span>
                    )}
                  </span>
                </div>
                
                <div className="artwork-actions">
                  <button 
                    className={`action-btn ${isFavorited ? 'favorited' : ''}`}
                    title="Add to favorites"
                  >
                    <Heart size={18} fill={isFavorited ? 'currentColor' : 'none'} />
                  </button>
                  <button 
                    className="action-btn"
                    title="Share artwork"
                  >
                    <Share2 size={18} />
                  </button>
                  <button 
                    onClick={() => setShowInquiryModal(true)}
                    className="btn btn-primary inquire-btn"
                  >
                    Inquire
                  </button>
                </div>
              </div>

              <div className="artwork-quick-details">
                {artwork.medium && (
                  <div className="detail-item">
                    <Palette size={16} />
                    <span>{artwork.medium}</span>
                  </div>
                )}
                {artist?.location && (
                  <div className="detail-item">
                    <MapPin size={16} />
                    <span>{artist.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {artwork.description && (
            <div className="artwork-details-section">
              <h3>About this Work</h3>
              <p>{artwork.description}</p>
            </div>
          )}

          {artist && (
            <div className="artist-spotlight-section">
              <div className="artist-spotlight">
                {artist.avatar_url && (
                  <img 
                    src={artist.avatar_url} 
                    alt={artist.full_name} 
                    className="artist-avatar"
                  />
                )}
                <div className="artist-info">
                  <h3>About {artist.full_name}</h3>
                  <p className="artist-bio">
                    {artist.bio || 'No biography available.'}
                  </p>
                  <Link to={`/artist/${artist.slug}`} className="btn btn-outline">
                    View Artist Profile
                    <ExternalLink size={14} />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </Container>
      </div>

      {showInquiryModal && (
        <div className="modal-overlay" onClick={() => setShowInquiryModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Inquire about this artwork</h3>
            <p>Contact form would go here...</p>
            <div className="modal-actions">
              <button 
                onClick={() => setShowInquiryModal(false)}
                className="btn btn-outline"
              >
                Close
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

export default ArtworkDetail
