import React, { useState } from 'react'
import { Card } from '../Card'
import { Button } from '../Button'
import { Input } from '../Input'
import { Typography } from '../Typography'
import { tokens } from '../../palette-tokens'

interface AdvancedSearchProps {
  onSearch?: (filters: Record<string, unknown>) => void
  onResults?: (results: unknown[]) => void
  className?: string
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  // onResults,
  className = ''
}) => {
  const [filters, setFilters] = useState({
    query: '',
    medium: '',
    style: '',
    priceMin: '',
    priceMax: '',
    yearMin: '',
    yearMax: ''
  })

  const handleSearch = () => {
    const searchFilters = {
      ...filters,
      priceMin: filters.priceMin ? parseFloat(filters.priceMin) : undefined,
      priceMax: filters.priceMax ? parseFloat(filters.priceMax) : undefined,
      yearMin: filters.yearMin ? parseInt(filters.yearMin) : undefined,
      yearMax: filters.yearMax ? parseInt(filters.yearMax) : undefined
    }
    onSearch?.(searchFilters)
  }

  return (
    <div className={`advanced-search ${className}`}>
      <Typography variant="h6" style={{ marginBottom: tokens.spacing.md }}>
        Advanced Search
      </Typography>
      
      <Card variant="outlined" padding="lg">
        <div style={{ display: 'grid', gap: tokens.spacing.md }}>
          <Input
            label="Search Query"
            value={filters.query}
            onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
            placeholder="Enter keywords..."
          />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing.sm }}>
            <Input
              label="Medium"
              value={filters.medium}
              onChange={(e) => setFilters(prev => ({ ...prev, medium: e.target.value }))}
              placeholder="e.g., Oil, Acrylic"
            />
            
            <Input
              label="Style"
              value={filters.style}
              onChange={(e) => setFilters(prev => ({ ...prev, style: e.target.value }))}
              placeholder="e.g., Abstract, Realism"
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing.sm }}>
            <Input
              label="Min Price"
              type="number"
              value={filters.priceMin}
              onChange={(e) => setFilters(prev => ({ ...prev, priceMin: e.target.value }))}
              placeholder="0"
            />
            
            <Input
              label="Max Price"
              type="number"
              value={filters.priceMax}
              onChange={(e) => setFilters(prev => ({ ...prev, priceMax: e.target.value }))}
              placeholder="10000"
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing.sm }}>
            <Input
              label="Year From"
              type="number"
              value={filters.yearMin}
              onChange={(e) => setFilters(prev => ({ ...prev, yearMin: e.target.value }))}
              placeholder="1900"
            />
            
            <Input
              label="Year To"
              type="number"
              value={filters.yearMax}
              onChange={(e) => setFilters(prev => ({ ...prev, yearMax: e.target.value }))}
              placeholder="2024"
            />
          </div>
          
          <Button variant="primary" onClick={handleSearch}>
            Search
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default AdvancedSearch
