import React from 'react'
import { Link, useNavigate } from 'react-router-dom' // Import useNavigate
import { Heart, Eye, Share2, Calendar, Ruler } from 'lucide-react'

interface ArtworkCardProps {
  artwork: {
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
    isAuction?: boolean
    isLiked?: boolean
    auctionEndsAt?: string
    estimatedPrice?: {
      min: number
      max: number
    }
  }
  onLike?: (artworkId: string) => void
  onView?: (artworkId: string) => void
  onShare?: (artworkId: string) => void
  variant?: 'default' | 'compact' | 'featured'
}

const ArtworkCard: React.FC<ArtworkCardProps> = ({ 
  artwork, 
  onLike, 
  onView,
  onShare,
  variant = 'default'
}) => {
  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onLike?.(artwork.id)
  }

  const handleView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onView?.(artwork.id)
  }

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onShare?.(artwork.id)
  }

  // FIX: New handler for clicking the artist name
  const handleArtistClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent the parent <Link> from navigating
    e.stopPropagation(); // Stop event bubbling to parent elements
    navigate(`/artist/${artwork.artist.slug}`); // Programmatically navigate to artist page
  };

  const formatPrice = (price: string, currency: string) => {
    const numPrice = parseFloat(price)
    if (numPrice >= 1000000) {
      return `${currency} ${(numPrice / 1000000).toFixed(1)}M`
    } else if (numPrice >= 1000) {
      return `${currency} ${(numPrice / 1000).toFixed(0)}K`
    }
    return `${currency} ${numPrice.toLocaleString()}`
  }

  const formatAuctionTime = (endsAt: string) => {
    const endDate = new Date(endsAt)
    const now = new Date()
    const diffMs = endDate.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Ended'
    
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays <= 0) return 'Ended'
    if (diffDays === 1) return 'Ends today'
    if (diffDays <= 7) return `Ends in ${diffDays} days`
    return `Ends ${endDate.toLocaleDateString()}`
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
        const overlay = e.currentTarget.querySelector('.artwork-overlay') as HTMLElement
        if (overlay) overlay.style.opacity = '1'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
        const overlay = e.currentTarget.querySelector('.artwork-overlay') as HTMLElement
        if (overlay) overlay.style.opacity = '0'
      }}
    >
      <Link to={`/artwork/${artwork.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={imageContainerStyle}>
          {artwork.primaryImageUrl ? (
            <img 
              src={artwork.primaryImageUrl} 
              alt={artwork.title}
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
              fontSize: '14px'
            }}>
              No Image Available
            </div>
          )}
          
          <div className="artwork-overlay" style={overlayStyle}>
            <button 
              style={actionButtonStyle}
              onClick={handleView}
              title="Quick view"
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
                backgroundColor: artwork.isLiked ? 'var(--danger)' : 'rgba(255, 255, 255, 0.1)'
              }}
              onClick={handleLike}
              title={artwork.isLiked ? 'Remove from favorites' : 'Add to favorites'}
              onMouseEnter={(e) => {
                if (!artwork.isLiked) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
                  e.currentTarget.style.transform = 'scale(1.1)'
                }
              }}
              onMouseLeave={(e) => {
                if (!artwork.isLiked) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.transform = 'scale(1)'
                }
              }}
            >
              <Heart size={18} fill={artwork.isLiked ? 'currentColor' : 'none'} />
            </button>
            <button 
              style={actionButtonStyle}
              onClick={handleShare}
              title="Share artwork"
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
            fontSize: variant === 'compact' ? '16px' : '18px',
            fontWeight: '600',
            margin: '0 0 var(--space-xs) 0',
            lineHeight: '1.3',
            color: 'var(--fg)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as const,
            overflow: 'hidden'
          }}>
            {artwork.title}
          </h3>
          
          <p style={{
            fontSize: '14px',
            color: 'var(--muted)',
            margin: '0 0 var(--space-sm) 0',
            fontWeight: '500'
          }}>
            {/* FIX: Replaced <Link> with <span> and onClick for artist name */}
            <span
              onClick={handleArtistClick}
              style={{
                color: 'var(--muted)',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
                cursor: 'pointer' // Indicate it's clickable
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--muted)'
              }}
            >
              {artwork.artist.name}
            </span>
          </p>
          
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-xs)',
            margin: '0 0 var(--space-sm) 0'
          }}>
            {artwork.year && (
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
                {artwork.year}
              </span>
            )}
            {artwork.dimensions && (
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
                <Ruler size={12} />
                {artwork.dimensions}
              </span>
            )}
            {artwork.medium && (
              <span style={{
                fontSize: '12px',
                color: 'var(--muted)',
                backgroundColor: 'var(--border)',
                padding: '2px var(--space-xs)',
                borderRadius: 'var(--radius-sm)'
              }}>
                {artwork.medium}
              </span>
            )}
          </div>
          
          {artwork.isForSale && artwork.price && (
            <div style={{
              fontSize: variant === 'compact' ? '16px' : '18px',
              fontWeight: '700',
              color: 'var(--fg)',
              margin: 'var(--space-sm) 0 0 0'
            }}>
              {formatPrice(artwork.price, artwork.currency || 'USD')}
              {artwork.isAuction && (
                <span style={{
                  display: 'inline-block',
                  backgroundColor: 'var(--danger)',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: '600',
                  padding: '2px var(--space-xs)',
                  borderRadius: 'var(--radius-sm)',
                  marginLeft: 'var(--space-xs)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Auction
                </span>
              )}
            </div>
          )}
          
          {artwork.isAuction && artwork.auctionEndsAt && (
            <div style={{
              fontSize: '12px',
              color: 'var(--danger)',
              fontWeight: '500',
              margin: 'var(--space-xs) 0 0 0',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Calendar size={12} />
              {formatAuctionTime(artwork.auctionEndsAt)}
            </div>
          )}
          
          {artwork.isAuction && artwork.estimatedPrice && (
            <div style={{
              fontSize: '14px',
              color: 'var(--muted)',
              margin: 'var(--space-xs) 0 0 0'
            }}>
              Est. {artwork.currency} {artwork.estimatedPrice.min.toLocaleString()} - {artwork.estimatedPrice.max.toLocaleString()}
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}

export default ArtworkCard