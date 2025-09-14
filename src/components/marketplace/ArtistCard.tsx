import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, Eye, Share2, MapPin, Calendar, Award } from 'lucide-react'

interface ArtistCardProps {
  artist: {
    id: string
    name: string
    slug: string
    bio?: string
    nationality?: string
    birthYear?: number
    deathYear?: number
    avatarUrl?: string
    artworkCount?: number
    isFollowed?: boolean
    location?: string
    education?: string
    awards?: string[]
    exhibitions?: number
  }
  onFollow?: (artistId: string) => void
  onView?: (artistId: string) => void
  onShare?: (artistId: string) => void
  variant?: 'default' | 'compact' | 'featured'
}

const ArtistCard: React.FC<ArtistCardProps> = ({ 
  artist, 
  onFollow, 
  onView,
  onShare,
  variant = 'default'
}) => {
  const handleFollow = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onFollow?.(artist.id)
  }

  const handleView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onView?.(artist.id)
  }

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onShare?.(artist.id)
  }

  const cardStyle = {
    backgroundColor: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    position: 'relative' as const,
    cursor: 'pointer'
  }

  const imageContainerStyle = {
    position: 'relative' as const,
    aspectRatio: variant === 'compact' ? '4/3' : '1',
    overflow: 'hidden',
    backgroundColor: 'var(--border)'
  }

  const overlayStyle = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-sm)',
    opacity: 0,
    transition: 'all 0.3s ease'
  }

  const actionButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(10px)'
  }

  return (
    <div 
      style={cardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
        const overlay = e.currentTarget.querySelector('.artist-overlay') as HTMLElement
        if (overlay) overlay.style.opacity = '1'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
        const overlay = e.currentTarget.querySelector('.artist-overlay') as HTMLElement
        if (overlay) overlay.style.opacity = '0'
      }}
    >
      <Link to={`/artist/${artist.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={imageContainerStyle}>
          {artist.avatarUrl ? (
            <img 
              src={artist.avatarUrl} 
              alt={artist.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.3s ease'
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--border)',
              color: 'var(--muted)',
              fontSize: variant === 'compact' ? '24px' : '48px',
              fontWeight: '600'
            }}>
              {artist.name.charAt(0).toUpperCase()}
            </div>
          )}
          
          <div className="artist-overlay" style={overlayStyle}>
            <button 
              style={actionButtonStyle}
              onClick={handleView}
              title="View artist"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
                e.currentTarget.style.transform = 'scale(1.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              <Eye size={18} />
            </button>
            <button 
              style={{
                ...actionButtonStyle,
                backgroundColor: artist.isFollowed ? 'var(--primary)' : 'rgba(255, 255, 255, 0.1)'
              }}
              onClick={handleFollow}
              title={artist.isFollowed ? 'Unfollow artist' : 'Follow artist'}
              onMouseEnter={(e) => {
                if (!artist.isFollowed) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
                  e.currentTarget.style.transform = 'scale(1.1)'
                }
              }}
              onMouseLeave={(e) => {
                if (!artist.isFollowed) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.transform = 'scale(1)'
                }
              }}
            >
              <Heart size={18} fill={artist.isFollowed ? 'currentColor' : 'none'} />
            </button>
            <button 
              style={actionButtonStyle}
              onClick={handleShare}
              title="Share artist"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
                e.currentTarget.style.transform = 'scale(1.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>
        
        <div style={{ padding: variant === 'compact' ? 'var(--space-md)' : 'var(--space-lg)' }}>
          <h3 style={{
            fontSize: variant === 'compact' ? '16px' : '20px',
            fontWeight: '600',
            margin: '0 0 var(--space-xs) 0',
            lineHeight: '1.3',
            color: 'var(--fg)',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical' as const,
            overflow: 'hidden'
          }}>
            {artist.name}
          </h3>
          
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-xs)',
            margin: '0 0 var(--space-sm) 0'
          }}>
            {artist.nationality && (
              <span style={{
                fontSize: '12px',
                color: 'var(--muted)',
                backgroundColor: 'var(--border)',
                padding: '2px var(--space-xs)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <MapPin size={12} />
                {artist.nationality}
              </span>
            )}
            {artist.birthYear && (
              <span style={{
                fontSize: '12px',
                color: 'var(--muted)',
                backgroundColor: 'var(--border)',
                padding: '2px var(--space-xs)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Calendar size={12} />
                {artist.birthYear}{artist.deathYear ? `–${artist.deathYear}` : '–Present'}
              </span>
            )}
            {artist.awards && artist.awards.length > 0 && (
              <span style={{
                fontSize: '12px',
                color: 'var(--muted)',
                backgroundColor: 'var(--border)',
                padding: '2px var(--space-xs)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Award size={12} />
                {artist.awards.length} award{artist.awards.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          {artist.bio && variant !== 'compact' && (
            <p style={{
              fontSize: '14px',
              color: 'var(--muted)',
              lineHeight: '1.4',
              margin: '0 0 var(--space-sm) 0',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical' as const,
              overflow: 'hidden'
            }}>
              {artist.bio}
            </p>
          )}
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            margin: 'var(--space-sm) 0 0 0'
          }}>
            <div style={{
              display: 'flex',
              gap: 'var(--space-md)',
              fontSize: '12px',
              color: 'var(--muted)'
            }}>
              {artist.artworkCount && (
                <span>
                  {artist.artworkCount} artwork{artist.artworkCount !== 1 ? 's' : ''}
                </span>
              )}
              {artist.exhibitions && (
                <span>
                  {artist.exhibitions} exhibition{artist.exhibitions !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            
            {artist.isFollowed && (
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
        </div>
      </Link>
    </div>
  )
}

export default ArtistCard
