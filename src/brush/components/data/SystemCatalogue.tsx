import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import BrushIcon from '../../Icon'
import BrushButton from '../Button'
import LoadingSpinner from '../feedback/LoadingSpinner'
import ErrorMessage from '../forms/ErrorMessage'

interface SystemCatalogueProps {
  onArtworkSelect?: (artwork: any) => void
  onClose?: () => void
}

interface Artwork {
  id: string
  title: string
  description?: string
  medium?: string
  year?: number
  price?: number
  currency?: string
  primary_image_url?: string
  artist?: {
    id: string
    name: string
    slug: string
  }
}

const SystemCatalogue: React.FC<SystemCatalogueProps> = ({ onArtworkSelect, onClose }) => {
  const [selectedArtworks, setSelectedArtworks] = useState<string[]>([])
  const [filters, setFilters] = useState({
    medium: '',
    priceRange: '',
    sortBy: 'newest'
  })

  const { data: artworks, isLoading, error } = useQuery({
    queryKey: ['system-catalogue', filters],
    queryFn: async () => {
      let query = supabase
        .from('artworks')
        .select(`
          id, title, description, medium, year, price, currency, primary_image_url,
          profiles!artworks_user_id_fkey(id, display_name, slug)
        `)
        .eq('status', 'available')

      if (filters.medium) {
        query = query.eq('medium', filters.medium)
      }

      if (filters.sortBy === 'newest') {
        query = query.order('created_at', { ascending: false })
      } else if (filters.sortBy === 'price_low') {
        query = query.order('price', { ascending: true })
      } else if (filters.sortBy === 'price_high') {
        query = query.order('price', { ascending: false })
      }

      const { data, error } = await query.limit(50)
      if (error) throw error
      return data || []
    }
  })

  const handleArtworkToggle = (artworkId: string) => {
    setSelectedArtworks(prev => 
      prev.includes(artworkId)
        ? prev.filter(id => id !== artworkId)
        : [...prev, artworkId]
    )
  }

  const handleSelectArtwork = (artwork: Artwork) => {
    if (onArtworkSelect) {
      onArtworkSelect(artwork)
    }
  }

  if (isLoading) {
    return (
      <div style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
        <LoadingSpinner size="lg" text="Loading artworks..." />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: 'var(--space-xl)' }}>
        <ErrorMessage message="Failed to load artworks" />
      </div>
    )
  }

  return (
    <div style={{
      backgroundColor: 'var(--card)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-lg)',
      maxHeight: '80vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'var(--space-lg)',
        paddingBottom: 'var(--space-md)',
        borderBottom: '1px solid var(--border)'
      }}>
        <h2 style={{
          fontSize: 'var(--text-xl)',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--fg)',
          margin: 0
        }}>
          System Catalogue
        </h2>
        {onClose && (
          <BrushButton
            variant="ghost"
            size="sm"
            icon="close"
            onClick={onClose}
          >
              Close
          </BrushButton>
          )}
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-md)',
        marginBottom: 'var(--space-lg)',
        flexWrap: 'wrap'
      }}>
            <select
              value={filters.medium}
          onChange={(e) => setFilters(prev => ({ ...prev, medium: e.target.value }))}
          style={{
            padding: 'var(--space-sm)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--bg)',
            color: 'var(--fg)'
          }}
        >
          <option value="">All Mediums</option>
          <option value="Oil on Canvas">Oil on Canvas</option>
          <option value="Acrylic">Acrylic</option>
          <option value="Watercolor">Watercolor</option>
          <option value="Digital">Digital</option>
          <option value="Photography">Photography</option>
            </select>

            <select
          value={filters.sortBy}
          onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
          style={{
            padding: 'var(--space-sm)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--bg)',
            color: 'var(--fg)'
          }}
        >
          <option value="newest">Newest First</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
            </select>
      </div>

      {/* Artwork Grid */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 'var(--space-md)'
      }}>
        {artworks?.map((artwork) => (
          <div
            key={artwork.id}
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={() => handleSelectArtwork(artwork)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = 'var(--shadow-md)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            {/* Image */}
            <div style={{
              height: '150px',
              backgroundImage: `url(${artwork.primary_image_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }} />
            
            {/* Info */}
            <div style={{ padding: 'var(--space-md)' }}>
              <h3 style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--fg)',
                margin: '0 0 var(--space-xs) 0',
                lineHeight: 1.3
              }}>
                {artwork.title}
              </h3>
              <p style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--muted)',
                margin: '0 0 var(--space-sm) 0'
              }}>
                by {artwork.profiles?.display_name || 'Unknown Artist'}
              </p>
              {artwork.price && (
                <p style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--primary)',
                  margin: 0
                }}>
                  {artwork.currency === 'ZAR' ? 'R' : artwork.currency} {artwork.price.toLocaleString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Count */}
      {selectedArtworks.length > 0 && (
        <div style={{
          marginTop: 'var(--space-lg)',
          padding: 'var(--space-md)',
          backgroundColor: 'var(--bg-alt)',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--fg)',
            margin: 0
          }}>
            {selectedArtworks.length} artwork{selectedArtworks.length !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}
    </div>
  )
}

export default SystemCatalogue
