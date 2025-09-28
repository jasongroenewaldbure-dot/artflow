import React from 'react'
import { Card } from '../Card'
import { Typography } from '../Typography'
import { tokens } from '../../palette-tokens'

interface UserCollectionsProps {
  // userId?: string
  limit?: number
  onCollectionClick?: (collection: unknown) => void
  isOwnProfile?: boolean
  className?: string
}

const UserCollections: React.FC<UserCollectionsProps> = ({
  // userId,
  // limit = 10,
  onCollectionClick,
  // isOwnProfile = false,
  className = ''
}) => {
  // Mock data for now
  const collections = [
    {
      id: '1',
      name: 'Contemporary Abstracts',
      artworkCount: 12,
      coverImage: '/api/placeholder/300/200',
      lastUpdated: '2024-01-15'
    },
    {
      id: '2', 
      name: 'Emerging Artists',
      artworkCount: 8,
      coverImage: '/api/placeholder/300/200',
      lastUpdated: '2024-01-10'
    }
  ]

  return (
    <div className={`user-collections ${className}`}>
      <Typography variant="h6" style={{ marginBottom: tokens.spacing.md }}>
        Collections
      </Typography>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
        gap: tokens.spacing.md 
      }}>
        {collections.map((collection) => (
          <Card
            key={collection.id}
            variant="elevated"
            padding="md"
            onClick={() => onCollectionClick?.(collection)}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ marginBottom: tokens.spacing.sm }}>
              <img
                src={collection.coverImage}
                alt={collection.name}
                style={{
                  width: '100%',
                  height: '120px',
                  objectFit: 'cover',
                  borderRadius: tokens.borderRadius.sm
                }}
              />
            </div>
            
            <Typography variant="body" style={{ marginBottom: tokens.spacing.xs }}>
              {collection.name}
            </Typography>
            
            <Typography variant="caption" color="secondary">
              {collection.artworkCount} artworks
            </Typography>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default UserCollections
