import React, { useState } from 'react'
import { Card } from './Card'
import { Input } from './Input'
import { Button } from './Button'
import { Typography } from './Typography'
import { tokens } from '../palette-tokens'

export interface AdvancedSearchInterfaceProps {
  onSearch?: (filters: SearchFilters) => void
  onResults?: (results: unknown[]) => void
  placeholder?: string
  showPreferences?: boolean
  showVisualSearch?: boolean
  className?: string
}

export interface SearchFilters {
  query?: string
  artists?: string[]
  mediums?: string[]
  genres?: string[]
  priceRange?: {
    min: number
    max: number
  }
  yearRange?: {
    min: number
    max: number
  }
  location?: string
}

export const AdvancedSearchInterface: React.FC<AdvancedSearchInterfaceProps> = ({
  onSearch,
  onResults,
  placeholder = "Search artworks, artists, collections...",
  // showPreferences = true,
  // showVisualSearch = true,
  className = '',
}) => {
  const [filters, setFilters] = useState<SearchFilters>({})

  const handleFilterChange = (key: keyof SearchFilters, value: unknown) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSearch = () => {
    onSearch?.(filters)
    // Mock results for now
    const mockResults = []
    onResults?.(mockResults)
  }

  const handleClear = () => {
    setFilters({})
    onSearch?.({})
  }

  return (
    <Card variant="elevated" padding="lg" className={className}>
      <Typography variant="h5" style={{ marginBottom: tokens.spacing.lg }}>
        Advanced Search
      </Typography>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.md }}>
        <Input
          label="Search Query"
          placeholder={placeholder}
          value={filters.query || ''}
          onChange={(e) => handleFilterChange('query', e.target.value)}
        />
        
        <Input
          label="Location"
          placeholder="Enter location..."
          value={filters.location || ''}
          onChange={(e) => handleFilterChange('location', e.target.value)}
        />
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing.md }}>
          <Input
            label="Min Price"
            type="number"
            placeholder="0"
            value={filters.priceRange?.min || ''}
            onChange={(e) => handleFilterChange('priceRange', {
              ...filters.priceRange,
              min: e.target.value ? Number(e.target.value) : undefined
            })}
          />
          <Input
            label="Max Price"
            type="number"
            placeholder="10000"
            value={filters.priceRange?.max || ''}
            onChange={(e) => handleFilterChange('priceRange', {
              ...filters.priceRange,
              max: e.target.value ? Number(e.target.value) : undefined
            })}
          />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing.md }}>
          <Input
            label="Year From"
            type="number"
            placeholder="1900"
            value={filters.yearRange?.min || ''}
            onChange={(e) => handleFilterChange('yearRange', {
              ...filters.yearRange,
              min: e.target.value ? Number(e.target.value) : undefined
            })}
          />
          <Input
            label="Year To"
            type="number"
            placeholder="2024"
            value={filters.yearRange?.max || ''}
            onChange={(e) => handleFilterChange('yearRange', {
              ...filters.yearRange,
              max: e.target.value ? Number(e.target.value) : undefined
            })}
          />
        </div>
        
        <div style={{ display: 'flex', gap: tokens.spacing.md, marginTop: tokens.spacing.lg }}>
          <Button variant="primary" onClick={handleSearch}>
            Search
          </Button>
          <Button variant="secondary" onClick={handleClear}>
            Clear
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default AdvancedSearchInterface
