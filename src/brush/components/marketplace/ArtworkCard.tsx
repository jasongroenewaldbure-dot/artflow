import React from 'react'
import { Card } from '../Card'
import { Typography } from '../Typography'
import { tokens } from '../../palette-tokens'

export interface ArtworkCardProps {
  artwork: {
    id: string
    title: string
    artist: {
      name: string
      slug: string
    }
    primaryImageUrl?: string
    price?: number
    currency?: string
    year?: number
    medium?: string
  }
  onClick?: () => void
  className?: string
}

export const ArtworkCard: React.FC<ArtworkCardProps> = ({
  artwork,
  onClick,
  className = '',
}) => {
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price)
  }

  return (
    <Card
      variant="elevated"
      padding="none"
      className={className}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        transition: tokens.transitions.fast,
      }}
    >
      {artwork.primaryImageUrl && (
        <div
          style={{
            width: '100%',
            aspectRatio: '1',
            backgroundImage: `url(${artwork.primaryImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: tokens.colors.gray5,
          }}
        />
      )}
      <div style={{ padding: tokens.spacing.md }}>
        <Typography variant="h6" style={{ marginBottom: tokens.spacing.xs }}>
          {artwork.title}
        </Typography>
        <Typography variant="bodySmall" color="secondary" style={{ marginBottom: tokens.spacing.sm }}>
          {artwork.artist.name}
        </Typography>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {artwork.price && (
            <Typography variant="body" fontWeight="600">
              {formatPrice(artwork.price, artwork.currency || 'USD')}
            </Typography>
          )}
          {artwork.year && (
            <Typography variant="caption" color="secondary">
              {artwork.year}
            </Typography>
          )}
        </div>
        {artwork.medium && (
          <Typography variant="caption" color="tertiary" style={{ marginTop: tokens.spacing.xs }}>
            {artwork.medium}
          </Typography>
        )}
      </div>
    </Card>
  )
}

export default ArtworkCard
