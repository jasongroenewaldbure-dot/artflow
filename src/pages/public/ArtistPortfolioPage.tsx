import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthProvider'
import Icon from '../../components/icons/Icon'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import ErrorMessage from '../../components/ui/ErrorMessage'

interface Artist {
  id: string
  full_name: string
  slug: string
  bio: string | null
  location: string | null
  website: string | null
  instagram: string | null
  twitter: string | null
  created_at: string
  avatar_url: string | null
  artist_statement: string | null
  exhibitions: any[]
  gallery_representation: any[]
}

interface Artwork {
  id: string
  title: string
  description: string | null
  price: number | null
  currency: string
  primary_image_url: string | null
  genre: string | null
  medium: string | null
  dimensions: any
  created_at: string
  status: string
}

const ArtistPortfolioPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'artworks' | 'about'>('artworks')
  const [artworkStatus, setArtworkStatus] = useState<'available' | 'sold'>('available')
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [email, setEmail] = useState('')
  const [isFollowing, setIsFollowing] = useState(false)
  const [isAlerting, setIsAlerting] = useState(false)

  // Fetch artist data
  const { data: artist, isLoading: artistLoading, error: artistError } = useQuery({
    queryKey: ['artist', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('slug', slug)
        .eq('role', 'ARTIST')
        .single()

      if (error) throw error
      return data as Artist
    },
    enabled: !!slug
  })

  // Fetch artist's artworks
  const { data: artworks, isLoading: artworksLoading, error: artworksError } = useQuery({
    queryKey: ['artist-artworks', artist?.id, artworkStatus],
    queryFn: async () => {
      if (!artist?.id) return []

      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .eq('user_id', artist.id)
        .eq('status', artworkStatus)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Artwork[]
    },
    enabled: !!artist?.id
  })

  const handleFollow = async () => {
    if (!user) {
      setShowEmailModal(true)
      return
    }
    
    try {
      // TODO: Implement follow functionality
      setIsFollowing(!isFollowing)
    } catch (error) {
      console.error('Error following artist:', error)
    }
  }

  const handleCreateAlert = async () => {
    if (!user) {
      setShowEmailModal(true)
      return
    }
    
    try {
      // TODO: Implement alert creation
      setIsAlerting(!isAlerting)
    } catch (error) {
      console.error('Error creating alert:', error)
    }
  }

  const handleAddToList = async () => {
    if (!user) {
      setShowEmailModal(true)
      return
    }
    
    try {
      // TODO: Implement add to list functionality
    } catch (error) {
      console.error('Error adding to list:', error)
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // TODO: Implement email signup for non-logged in users
      console.log('Email signup:', email)
      setShowEmailModal(false)
      setEmail('')
    } catch (error) {
      console.error('Error with email signup:', error)
    }
  }

  if (artistLoading) {
    return <LoadingSpinner />
  }

  if (artistError || !artist) {
    return <ErrorMessage message="Artist not found" />
  }

  return (
    <div className="artist-portfolio-page">
      <Helmet>
        <title>{artist.full_name} - Artist | ArtFlow</title>
        <meta name="description" content={artist.bio || `View artworks by ${artist.full_name}`} />
        <meta property="og:title" content={`${artist.full_name} - Artist | ArtFlow`} />
        <meta property="og:description" content={artist.bio || `View artworks by ${artist.full_name}`} />
        {artist.avatar_url && <meta property="og:image" content={artist.avatar_url} />}
      </Helmet>

      {/* Artist Header */}
      <div className="artist-header">
        <div className="artist-header-content">
          <div className="artist-avatar">
            {artist.avatar_url ? (
              <img src={artist.avatar_url} alt={artist.full_name} />
            ) : (
              <div className="artist-avatar-placeholder">
                <Icon name="user" size={48} />
              </div>
            )}
          </div>
          
          <div className="artist-info">
            <h1 className="artist-name">{artist.full_name}</h1>
            {artist.location && (
              <p className="artist-location">
                <Icon name="map-pin" size={16} />
                {artist.location}
              </p>
            )}
            
            {/* Action Buttons */}
            <div className="artist-actions">
              <button
                onClick={handleFollow}
                className={`action-button ${isFollowing ? 'following' : ''}`}
              >
                <Icon name={isFollowing ? 'user-check' : 'user-plus'} size={16} />
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              
              <button
                onClick={handleCreateAlert}
                className={`action-button ${isAlerting ? 'alerting' : ''}`}
              >
                <Icon name="bell" size={16} />
                {isAlerting ? 'Alert Set' : 'Create Alert'}
              </button>
              
              <button
                onClick={handleAddToList}
                className="action-button"
              >
                <Icon name="plus" size={16} />
                Add to List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Artist Statement */}
      {artist.artist_statement && (
        <div className="artist-statement">
          <h3>Artist Statement</h3>
          <p>{artist.artist_statement}</p>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="artist-tabs">
        <button
          className={`tab-button ${activeTab === 'artworks' ? 'active' : ''}`}
          onClick={() => setActiveTab('artworks')}
        >
          Artworks ({artworks?.length || 0})
        </button>
        <button
          className={`tab-button ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          About
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'artworks' && (
          <div className="artworks-tab">
            {/* Artwork Status Filter */}
            <div className="artwork-status-filter">
              <button
                className={`status-button ${artworkStatus === 'available' ? 'active' : ''}`}
                onClick={() => setArtworkStatus('available')}
              >
                Available Works
              </button>
              <button
                className={`status-button ${artworkStatus === 'sold' ? 'active' : ''}`}
                onClick={() => setArtworkStatus('sold')}
              >
                Sold Works
              </button>
            </div>

            {/* Artworks Grid */}
            {artworksLoading ? (
              <LoadingSpinner />
            ) : artworksError ? (
              <ErrorMessage message="Failed to load artworks" />
            ) : artworks && artworks.length > 0 ? (
              <div className="artworks-grid">
                {artworks.map((artwork) => (
                  <div key={artwork.id} className="artwork-card">
                    <Link to={`/artwork/${artwork.id}`} className="artwork-link">
                      <div className="artwork-image">
                        {artwork.primary_image_url ? (
                          <img src={artwork.primary_image_url} alt={artwork.title} />
                        ) : (
                          <div className="artwork-placeholder">
                            <Icon name="image" size={48} />
                          </div>
                        )}
                        {artwork.status === 'sold' && (
                          <div className="sold-overlay">
                            <span>Sold</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="artwork-info">
                        <h3 className="artwork-title">{artwork.title}</h3>
                        {artwork.genre && (
                          <p className="artwork-genre">{artwork.genre}</p>
                        )}
                        {artwork.medium && (
                          <p className="artwork-medium">{artwork.medium}</p>
                        )}
                        {artwork.price ? (
                          <p className="artwork-price">
                            {artwork.currency} {artwork.price.toLocaleString()}
                          </p>
                        ) : (
                          <p className="artwork-price">Price on request</p>
                        )}
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-artworks">
                <Icon name="image" size={64} />
                <h3>No {artworkStatus} artworks found</h3>
                <p>This artist hasn't uploaded any {artworkStatus} artworks yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="about-tab">
            <div className="about-content">
              {/* Bio */}
              {artist.bio && (
                <div className="bio-section">
                  <h3>Biography</h3>
                  <p>{artist.bio}</p>
                </div>
              )}

              {/* Exhibitions */}
              {artist.exhibitions && artist.exhibitions.length > 0 && (
                <div className="exhibitions-section">
                  <h3>Exhibitions</h3>
                  <div className="exhibitions-list">
                    {artist.exhibitions.map((exhibition, index) => (
                      <div key={index} className="exhibition-item">
                        <h4>{exhibition.title}</h4>
                        <p>{exhibition.venue}</p>
                        <p>{exhibition.date}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gallery Representation */}
              {artist.gallery_representation && artist.gallery_representation.length > 0 && (
                <div className="gallery-section">
                  <h3>Gallery Representation</h3>
                  <div className="galleries-list">
                    {artist.gallery_representation.map((gallery, index) => (
                      <div key={index} className="gallery-item">
                        <h4>{gallery.name}</h4>
                        <p>{gallery.location}</p>
                        {gallery.website && (
                          <a href={gallery.website} target="_blank" rel="noopener noreferrer">
                            Visit Gallery
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Links */}
              <div className="social-section">
                <h3>Connect</h3>
                <div className="social-links">
                  {artist.website && (
                    <a href={artist.website} target="_blank" rel="noopener noreferrer" className="social-link">
                      <Icon name="globe" size={20} />
                      Website
                    </a>
                  )}
                  {artist.instagram && (
                    <a href={`https://instagram.com/${artist.instagram}`} target="_blank" rel="noopener noreferrer" className="social-link">
                      <Icon name="instagram" size={20} />
                      Instagram
                    </a>
                  )}
                  {artist.twitter && (
                    <a href={`https://twitter.com/${artist.twitter}`} target="_blank" rel="noopener noreferrer" className="social-link">
                      <Icon name="twitter" size={20} />
                      Twitter
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="email-modal-overlay">
          <div className="email-modal">
            <h3>Create Account to Follow Artists</h3>
            <p>Enter your email to create an account and start following artists you love.</p>
            <form onSubmit={handleEmailSubmit}>
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div className="modal-actions">
                <button type="button" onClick={() => setShowEmailModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary">
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ArtistPortfolioPage