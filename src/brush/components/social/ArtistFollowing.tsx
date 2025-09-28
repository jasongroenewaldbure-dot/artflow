import React from 'react'
import { Card } from '../Card'
import { Typography } from '../Typography'
import { Button } from '../Button'
import { tokens } from '../../palette-tokens'

interface ArtistFollowingProps {
  // userId?: string
  // limit?: number
  onArtistClick?: (artist: unknown) => void
  onUnfollow?: (artistId: string) => void
  // isOwnProfile?: boolean
  className?: string
}

const ArtistFollowing: React.FC<ArtistFollowingProps> = ({
  // userId,
  // limit = 10,
  onArtistClick,
  onUnfollow,
  // isOwnProfile = false,
  className = ''
}) => {
  // Mock data for now
  const artists = [
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: '/api/placeholder/60/60',
      artworkCount: 24,
      followers: 1200,
      isFollowing: true
    },
    {
      id: '2',
      name: 'Michael Chen',
      avatar: '/api/placeholder/60/60', 
      artworkCount: 18,
      followers: 890,
      isFollowing: true
    }
  ]

  return (
    <div className={`artist-following ${className}`}>
      <Typography variant="h6" style={{ marginBottom: tokens.spacing.md }}>
        Following
      </Typography>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.sm }}>
        {artists.map((artist) => (
          <Card
            key={artist.id}
            variant="outlined"
            padding="md"
            style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.md }}
          >
            <img
              src={artist.avatar}
              alt={artist.name}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
            
            <div style={{ flex: 1 }}>
              <Typography 
                variant="body" 
                style={{ marginBottom: tokens.spacing.xs, cursor: 'pointer' }}
                onClick={() => onArtistClick?.(artist)}
              >
                {artist.name}
              </Typography>
              
              <Typography variant="caption" color="secondary">
                {artist.artworkCount} artworks • {artist.followers} followers
              </Typography>
            </div>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onUnfollow?.(artist.id)}
            >
              Unfollow
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default ArtistFollowing
