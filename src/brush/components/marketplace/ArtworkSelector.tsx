import React from 'react'
import { Card } from '../Card'
import { Typography } from '../Typography'
import { Button } from '../Button'
import { tokens } from '../../palette-tokens'

interface Artwork {
  id: string
  title: string
  primaryImageUrl?: string
  artist?: {
    name: string
  }
}

export interface ArtworkSelectorProps {
  artworks: Artwork[]
  selectedArtworks: string[]
  onSelectionChange: (selectedIds: string[]) => void
  onConfirm: () => void
  className?: string
}

export const ArtworkSelector: React.FC<ArtworkSelectorProps> = ({
  artworks,
  selectedArtworks,
  onSelectionChange,
  onConfirm,
  className = '',
}) => {
  const handleToggleArtwork = (artworkId: string) => {
    if (selectedArtworks.includes(artworkId)) {
      onSelectionChange(selectedArtworks.filter(id => id !== artworkId))
    } else {
      onSelectionChange([...selectedArtworks, artworkId])
    }
  }

  const handleSelectAll = () => {
    onSelectionChange(artworks.map(artwork => artwork.id))
  }

  const handleClearAll = () => {
    onSelectionChange([])
  }

  return (
    <Card variant="elevated" padding="lg" className={className}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing.lg }}>
        <Typography variant="h6">
          Select Artworks ({selectedArtworks.length} selected)
        </Typography>
        <div style={{ display: 'flex', gap: tokens.spacing.sm }}>
          <Button variant="secondary" size="sm" onClick={handleSelectAll}>
            Select All
          </Button>
          <Button variant="secondary" size="sm" onClick={handleClearAll}>
            Clear All
          </Button>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
        gap: tokens.spacing.md,
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        {artworks.map((artwork) => (
          <div
            key={artwork.id}
            onClick={() => handleToggleArtwork(artwork.id)}
            style={{
              border: selectedArtworks.includes(artwork.id) 
                ? `2px solid ${tokens.colors.purple100}` 
                : `1px solid ${tokens.colors.border.primary}`,
              borderRadius: tokens.borderRadius.md,
              padding: tokens.spacing.sm,
              cursor: 'pointer',
              transition: tokens.transitions.fast,
              backgroundColor: selectedArtworks.includes(artwork.id) 
                ? tokens.colors.purple10 
                : tokens.colors.white100,
            }}
          >
            {artwork.primaryImageUrl && (
              <img
                src={artwork.primaryImageUrl}
                alt={artwork.title}
                style={{
                  width: '100%',
                  height: '120px',
                  objectFit: 'cover',
                  borderRadius: tokens.borderRadius.sm,
                  marginBottom: tokens.spacing.xs,
                }}
              />
            )}
            <Typography variant="bodySmall" style={{ marginBottom: tokens.spacing.xs }}>
              {artwork.title}
            </Typography>
            <Typography variant="caption" color="secondary">
              {artwork.artist?.name || 'Unknown Artist'}
            </Typography>
          </div>
        ))}
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        gap: tokens.spacing.sm,
        marginTop: tokens.spacing.lg,
        paddingTop: tokens.spacing.md,
        borderTop: `1px solid ${tokens.colors.border.primary}`
      }}>
        <Button variant="primary" onClick={onConfirm}>
          Confirm Selection ({selectedArtworks.length})
        </Button>
      </div>
    </Card>
  )
}

export default ArtworkSelector
