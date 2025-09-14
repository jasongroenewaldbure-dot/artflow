import React, { useState, useEffect } from 'react'
import { Search, Check, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface Artwork {
  id: string
  title: string
  primary_image_url?: string
  price?: number
  status: string
  is_published: boolean
}

interface ArtworkSelectorProps {
  catalogueId: string
  onArtworkAdd: (artworkId: string) => void
  onArtworkRemove: (artworkId: string) => void
  selectedArtworkIds: string[]
  userId: string
}

export default function ArtworkSelector({ 
  catalogueId, 
  onArtworkAdd, 
  onArtworkRemove, 
  selectedArtworkIds, 
  userId 
}: ArtworkSelectorProps) {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [filteredArtworks, setFilteredArtworks] = useState<Artwork[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAvailableArtworks()
  }, [userId])

  useEffect(() => {
    filterArtworks()
  }, [artworks, searchQuery])

  const loadAvailableArtworks = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('artworks')
        .select('id, title, primary_image_url, price, status, is_published')
        .eq('user_id', userId)
        .eq('status', 'available')
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setArtworks(data || [])
    } catch (error) {
      console.error('Error loading artworks:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterArtworks = () => {
    if (!searchQuery) {
      setFilteredArtworks(artworks)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = artworks.filter(artwork =>
      artwork.title.toLowerCase().includes(query)
    )
    setFilteredArtworks(filtered)
  }

  const handleToggleArtwork = (artwork: Artwork) => {
    if (selectedArtworkIds.includes(artwork.id)) {
      onArtworkRemove(artwork.id)
    } else {
      onArtworkAdd(artwork.id)
    }
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 'var(--space-xl)',
        color: 'var(--muted)'
      }}>
        Loading available artworks...
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          margin: '0 0 var(--space-md) 0',
          color: 'var(--fg)'
        }}>
          Add Available Works
        </h3>
        <p style={{
          fontSize: '14px',
          color: 'var(--muted)',
          margin: '0 0 var(--space-md) 0'
        }}>
          Only published and available works can be added to catalogues.
        </p>
        
        <div style={{ position: 'relative' }}>
          <Search size={20} style={{
            position: 'absolute',
            left: 'var(--space-sm)',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--muted)'
          }} />
          <input
            type="text"
            placeholder="Search your available works..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: 'var(--space-sm) var(--space-sm) var(--space-sm) 40px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '14px',
              backgroundColor: 'var(--card)',
              color: 'var(--fg)',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {artworks.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-xl)',
          color: 'var(--muted)'
        }}>
          <p style={{ margin: '0 0 var(--space-md) 0' }}>
            No available works found.
          </p>
          <p style={{ margin: 0, fontSize: '14px' }}>
            Publish some works to add them to catalogues.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 'var(--space-md)',
          maxHeight: '400px',
          overflowY: 'auto',
          padding: 'var(--space-sm)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)'
        }}>
          {filteredArtworks.map((artwork) => {
            const isSelected = selectedArtworkIds.includes(artwork.id)
            return (
              <div
                key={artwork.id}
                onClick={() => handleToggleArtwork(artwork)}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 'var(--space-sm)',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? 'var(--primary)' : 'var(--card)',
                  color: isSelected ? 'white' : 'var(--fg)',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'var(--border)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'var(--card)'
                  }
                }}
              >
                {artwork.primary_image_url ? (
                  <img
                    src={artwork.primary_image_url}
                    alt={artwork.title}
                    style={{
                      width: '100%',
                      height: '120px',
                      objectFit: 'cover',
                      borderRadius: 'var(--radius-xs)',
                      marginBottom: 'var(--space-xs)'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '120px',
                    backgroundColor: 'var(--border)',
                    borderRadius: 'var(--radius-xs)',
                    marginBottom: 'var(--space-xs)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--muted)',
                    fontSize: '12px'
                  }}>
                    No Image
                  </div>
                )}
                
                <div style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  marginBottom: 'var(--space-xs)',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical' as const,
                  overflow: 'hidden'
                }}>
                  {artwork.title}
                </div>
                
                {artwork.price && (
                  <div style={{
                    fontSize: '11px',
                    opacity: 0.8
                  }}>
                    ${artwork.price.toLocaleString()}
                  </div>
                )}

                {isSelected && (
                  <div style={{
                    position: 'absolute',
                    top: 'var(--space-xs)',
                    right: 'var(--space-xs)',
                    backgroundColor: 'white',
                    color: 'var(--primary)',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Check size={12} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {filteredArtworks.length === 0 && searchQuery && (
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-lg)',
          color: 'var(--muted)'
        }}>
          No works found matching "{searchQuery}"
        </div>
      )}
    </div>
  )
}
