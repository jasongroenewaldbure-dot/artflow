import React, { useState } from 'react'
import { Card } from './Card'
import { Typography } from './Typography'
import { Button } from './Button'
import { tokens } from '../palette-tokens'

export interface SerendipityEngineProps {
  onDiscover?: (artworks: unknown[]) => void
  // userId?: string
  limit?: number
  onItemClick?: (item: unknown) => void
  showReasons?: boolean
  className?: string
}

export interface DiscoveredArtwork {
  id: string
  title: string
  artist: {
    name: string
    slug: string
  }
  imageUrl: string
  reason: string
  confidence: number
}

export const SerendipityEngine: React.FC<SerendipityEngineProps> = ({
  onDiscover,
  // userId,
  limit = 5,
  onItemClick,
  showReasons = true,
  className = '',
}) => {
  const [isDiscovering, setIsDiscovering] = useState(false)
  const [lastDiscovery, setLastDiscovery] = useState<DiscoveredArtwork[]>([])

  const discoverArtworks = async () => {
    setIsDiscovering(true)
    
    // Simulate AI-powered discovery
    setTimeout(() => {
      const mockDiscoveries: DiscoveredArtwork[] = [
        {
          id: '1',
          title: 'Unexpected Harmony',
          artist: { name: 'Elena Rodriguez', slug: 'elena-rodriguez' },
          imageUrl: '/api/placeholder/300/300',
          reason: 'Based on your interest in abstract expressionism and color theory',
          confidence: 0.87
        },
        {
          id: '2',
          title: 'Digital Dreams',
          artist: { name: 'Marcus Chen', slug: 'marcus-chen' },
          imageUrl: '/api/placeholder/300/300',
          reason: 'Emerging artist with similar aesthetic to your recent views',
          confidence: 0.73
        },
        {
          id: '3',
          title: 'Urban Poetry',
          artist: { name: 'Sofia Martinez', slug: 'sofia-martinez' },
          imageUrl: '/api/placeholder/300/300',
          reason: 'Street art that complements your contemporary collection',
          confidence: 0.91
        }
      ]
      
      setLastDiscovery(mockDiscoveries.slice(0, limit))
      onDiscover?.(mockDiscoveries.slice(0, limit))
      setIsDiscovering(false)
    }, 2000)
  }

  return (
    <Card variant="elevated" padding="lg" className={className}>
      <Typography variant="h6" style={{ marginBottom: tokens.spacing.md }}>
        Serendipity Engine
      </Typography>
      
      <Typography variant="body" color="secondary" style={{ marginBottom: tokens.spacing.lg }}>
        Discover unexpected artworks that might surprise and delight you, powered by AI.
      </Typography>
      
      <Button
        variant="primary"
        onClick={discoverArtworks}
        loading={isDiscovering}
        style={{ marginBottom: tokens.spacing.lg }}
      >
        {isDiscovering ? 'Discovering...' : 'Discover Artworks'}
      </Button>
      
      {lastDiscovery.length > 0 && (
        <div>
          <Typography variant="h6" style={{ marginBottom: tokens.spacing.md }}>
            Latest Discovery
          </Typography>
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.md }}>
            {lastDiscovery.map((artwork) => (
              <div
                key={artwork.id}
                style={{
                  display: 'flex',
                  gap: tokens.spacing.md,
                  padding: tokens.spacing.md,
                  backgroundColor: tokens.colors.gray5,
                  borderRadius: tokens.borderRadius.md,
                  cursor: 'pointer'
                }}
                onClick={() => onItemClick?.(artwork)}
              >
                <img
                  src={artwork.imageUrl}
                  alt={artwork.title}
                  style={{
                    width: '60px',
                    height: '60px',
                    objectFit: 'cover',
                    borderRadius: tokens.borderRadius.sm,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <Typography variant="body" fontWeight="600">
                    {artwork.title}
                  </Typography>
                  <Typography variant="bodySmall" color="secondary">
                    by {artwork.artist.name}
                  </Typography>
                  {showReasons && (
                    <Typography variant="caption" color="tertiary">
                      {artwork.reason} ({(artwork.confidence * 100).toFixed(0)}% match)
                    </Typography>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

export default SerendipityEngine
