import React from 'react'
import { Card } from '../Card'
import { Typography } from '../Typography'
import { tokens } from '../../palette-tokens'

export interface ArtistCardProps {
  artist: {
    id: string
    name: string
    slug: string
    bio?: string
    avatarUrl?: string
    artworkCount?: number
    location?: string
  }
  onClick?: () => void
  className?: string
}

export const ArtistCard: React.FC<ArtistCardProps> = ({
  artist,
  onClick,
  className = '',
}) => {
  return (
    <Card
      variant="elevated"
      padding="md"
      className={className}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        transition: tokens.transitions.fast,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.md }}>
        {artist.avatarUrl ? (
          <img
            src={artist.avatarUrl}
            alt={artist.name}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: tokens.colors.gray20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h6" color="secondary">
              {artist.name.charAt(0).toUpperCase()}
            </Typography>
          </div>
        )}
        <div style={{ flex: 1 }}>
          <Typography variant="h6" style={{ marginBottom: tokens.spacing.xs }}>
            {artist.name}
          </Typography>
          {artist.bio && (
            <Typography variant="bodySmall" color="secondary" style={{ marginBottom: tokens.spacing.xs }}>
              {artist.bio}
            </Typography>
          )}
          <div style={{ display: 'flex', gap: tokens.spacing.md, alignItems: 'center' }}>
            {artist.artworkCount && (
              <Typography variant="caption" color="tertiary">
                {artist.artworkCount} artworks
              </Typography>
            )}
            {artist.location && (
              <Typography variant="caption" color="tertiary">
                {artist.location}
              </Typography>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

export default ArtistCard
