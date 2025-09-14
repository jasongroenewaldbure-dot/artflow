import React, { useState, useEffect } from 'react'
import { Search, Filter, X, ChevronDown, SlidersHorizontal } from 'lucide-react'

interface SearchFilters {
  query: string
  category: 'all' | 'artworks' | 'artists' | 'catalogues'
  priceRange: {
    min: number | null
    max: number | null
  }
  medium: string[]
  genre: string[]
  subject: string[]
  colors: string[]
  size: {
    min: number | null
    max: number | null
  }
  yearRange: {
    min: number | null
    max: number | null
  }
  availability: 'all' | 'available' | 'sold' | 'on-hold'
  sortBy: 'relevance' | 'price-low' | 'price-high' | 'newest' | 'oldest' | 'popular'
  location: string
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void
  onClose?: () => void
  initialFilters?: Partial<SearchFilters>
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  onClose,
  initialFilters = {}
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: 'all',
    priceRange: { min: null, max: null },
    medium: [],
    genre: [],
    subject: [],
    colors: [],
    size: { min: null, max: null },
    yearRange: { min: null, max: null },
    availability: 'all',
    sortBy: 'relevance',
    location: '',
    ...initialFilters
  })

  const [showFilters, setShowFilters] = useState(false)
  const [activeFilterSection, setActiveFilterSection] = useState<string | null>(null)

  const mediumOptions = [
    'Oil on Canvas', 'Acrylic on Canvas', 'Watercolor', 'Mixed Media',
    'Digital Art', 'Photography', 'Sculpture', 'Print', 'Drawing',
    'Collage', 'Installation', 'Performance Art'
  ]

  const genreOptions = [
    'Abstract', 'Realism', 'Impressionism', 'Expressionism', 'Surrealism',
    'Pop Art', 'Contemporary', 'Minimalism', 'Conceptual', 'Street Art',
    'Landscape', 'Portrait', 'Still Life', 'Figurative'
  ]

  const subjectOptions = [
    'Nature', 'Urban', 'Human Figure', 'Animals', 'Architecture',
    'Abstract Forms', 'Emotions', 'Social Issues', 'History', 'Fantasy',
    'Technology', 'Spirituality', 'Politics', 'Culture'
  ]

  const colorOptions = [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#000000', '#FFFFFF', '#808080', '#800000', '#008000', '#000080',
    '#800080', '#808000', '#008080', '#C0C0C0'
  ]

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleArrayFilterChange = (key: 'medium' | 'genre' | 'subject' | 'colors', value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }))
  }

  const handleSearch = () => {
    onSearch(filters)
    if (onClose) onClose()
  }

  const clearFilters = () => {
    setFilters({
      query: '',
      category: 'all',
      priceRange: { min: null, max: null },
      medium: [],
      genre: [],
      subject: [],
      colors: [],
      size: { min: null, max: null },
      yearRange: { min: null, max: null },
      availability: 'all',
      sortBy: 'relevance',
      location: ''
    })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.query) count++
    if (filters.category !== 'all') count++
    if (filters.priceRange.min || filters.priceRange.max) count++
    if (filters.medium.length > 0) count++
    if (filters.genre.length > 0) count++
    if (filters.subject.length > 0) count++
    if (filters.colors.length > 0) count++
    if (filters.size.min || filters.size.max) count++
    if (filters.yearRange.min || filters.yearRange.max) count++
    if (filters.availability !== 'all') count++
    if (filters.sortBy !== 'relevance') count++
    if (filters.location) count++
    return count
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-lg)'
    }}>
      <div style={{
        backgroundColor: 'var(--card)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: 'var(--space-lg)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            margin: 0,
            color: 'var(--fg)'
          }}>
            Advanced Search
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
            <span style={{
              fontSize: '14px',
              color: 'var(--muted)'
            }}>
              {getActiveFiltersCount()} filter{getActiveFiltersCount() !== 1 ? 's' : ''} active
            </span>
            <button
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                border: 'none',
                backgroundColor: 'transparent',
                color: 'var(--muted)',
                cursor: 'pointer',
                borderRadius: 'var(--radius-sm)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--border)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: 'var(--space-lg)'
        }}>
          {/* Search Query */}
          <div style={{ marginBottom: 'var(--space-xl)' }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '500',
              marginBottom: 'var(--space-sm)',
              color: 'var(--fg)'
            }}>
              Search
            </label>
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
                placeholder="Search artworks, artists, catalogues..."
                value={filters.query}
                onChange={(e) => handleFilterChange('query', e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--space-sm) var(--space-sm) var(--space-sm) 40px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '16px',
                  backgroundColor: 'var(--bg)',
                  color: 'var(--fg)',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary)'
                  e.target.style.boxShadow = '0 0 0 2px rgba(110, 31, 255, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border)'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>

          {/* Category */}
          <div style={{ marginBottom: 'var(--space-xl)' }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '500',
              marginBottom: 'var(--space-sm)',
              color: 'var(--fg)'
            }}>
              Category
            </label>
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              {[
                { value: 'all', label: 'All' },
                { value: 'artworks', label: 'Artworks' },
                { value: 'artists', label: 'Artists' },
                { value: 'catalogues', label: 'Catalogues' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange('category', option.value)}
                  style={{
                    padding: 'var(--space-sm) var(--space-md)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: filters.category === option.value ? 'var(--primary)' : 'transparent',
                    color: filters.category === option.value ? 'white' : 'var(--fg)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div style={{ marginBottom: 'var(--space-xl)' }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '500',
              marginBottom: 'var(--space-sm)',
              color: 'var(--fg)'
            }}>
              Price Range
            </label>
            <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
              <input
                type="number"
                placeholder="Min"
                value={filters.priceRange.min || ''}
                onChange={(e) => handleFilterChange('priceRange', {
                  ...filters.priceRange,
                  min: e.target.value ? Number(e.target.value) : null
                })}
                style={{
                  flex: 1,
                  padding: 'var(--space-sm)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '14px',
                  backgroundColor: 'var(--bg)',
                  color: 'var(--fg)',
                  outline: 'none'
                }}
              />
              <span style={{ color: 'var(--muted)' }}>to</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.priceRange.max || ''}
                onChange={(e) => handleFilterChange('priceRange', {
                  ...filters.priceRange,
                  max: e.target.value ? Number(e.target.value) : null
                })}
                style={{
                  flex: 1,
                  padding: 'var(--space-sm)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '14px',
                  backgroundColor: 'var(--bg)',
                  color: 'var(--fg)',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Medium */}
          <div style={{ marginBottom: 'var(--space-xl)' }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '500',
              marginBottom: 'var(--space-sm)',
              color: 'var(--fg)'
            }}>
              Medium
            </label>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--space-xs)'
            }}>
              {mediumOptions.map(medium => (
                <button
                  key={medium}
                  onClick={() => handleArrayFilterChange('medium', medium)}
                  style={{
                    padding: 'var(--space-xs) var(--space-sm)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: filters.medium.includes(medium) ? 'var(--primary)' : 'transparent',
                    color: filters.medium.includes(medium) ? 'white' : 'var(--fg)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}
                >
                  {medium}
                </button>
              ))}
            </div>
          </div>

          {/* Genre */}
          <div style={{ marginBottom: 'var(--space-xl)' }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '500',
              marginBottom: 'var(--space-sm)',
              color: 'var(--fg)'
            }}>
              Genre
            </label>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--space-xs)'
            }}>
              {genreOptions.map(genre => (
                <button
                  key={genre}
                  onClick={() => handleArrayFilterChange('genre', genre)}
                  style={{
                    padding: 'var(--space-xs) var(--space-sm)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: filters.genre.includes(genre) ? 'var(--primary)' : 'transparent',
                    color: filters.genre.includes(genre) ? 'white' : 'var(--fg)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div style={{ marginBottom: 'var(--space-xl)' }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '500',
              marginBottom: 'var(--space-sm)',
              color: 'var(--fg)'
            }}>
              Colors
            </label>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--space-xs)'
            }}>
              {colorOptions.map(color => (
                <button
                  key={color}
                  onClick={() => handleArrayFilterChange('colors', color)}
                  style={{
                    width: '32px',
                    height: '32px',
                    border: '2px solid',
                    borderColor: filters.colors.includes(color) ? 'var(--primary)' : 'var(--border)',
                    borderRadius: '50%',
                    backgroundColor: color,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  title={color}
                >
                  {filters.colors.includes(color) && (
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      ✓
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div style={{ marginBottom: 'var(--space-xl)' }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '500',
              marginBottom: 'var(--space-sm)',
              color: 'var(--fg)'
            }}>
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              style={{
                width: '100%',
                padding: 'var(--space-sm)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '14px',
                backgroundColor: 'var(--bg)',
                color: 'var(--fg)',
                cursor: 'pointer'
              }}
            >
              <option value="relevance">Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: 'var(--space-lg)',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          gap: 'var(--space-md)',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={clearFilters}
            style={{
              padding: 'var(--space-sm) var(--space-lg)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'transparent',
              color: 'var(--fg)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Clear All
          </button>
          <button
            onClick={handleSearch}
            style={{
              padding: 'var(--space-sm) var(--space-lg)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--primary)',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Search
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdvancedSearch
