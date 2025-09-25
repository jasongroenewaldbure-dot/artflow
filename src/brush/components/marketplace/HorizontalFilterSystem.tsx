import React, { useState } from 'react'
import Icon from '../../Icon'
import Button from '../Button'

interface FilterOption {
  id: string
  label: string
  count?: number
}

interface HorizontalFilterSystemProps {
  categories?: FilterOption[]
  mediums?: FilterOption[]
  priceRanges?: FilterOption[]
  onFilterChange?: (filters: Record<string, string[]>) => void
  className?: string
}

const HorizontalFilterSystem: React.FC<HorizontalFilterSystemProps> = ({
  categories = [],
  mediums = [],
  priceRanges = [],
  onFilterChange,
  className = ''
}) => {
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
    categories: [],
    mediums: [],
    priceRanges: []
  })

  const handleFilterToggle = (filterType: string, filterId: string) => {
    const newFilters = { ...selectedFilters }
    
    if (newFilters[filterType].includes(filterId)) {
      newFilters[filterType] = newFilters[filterType].filter(id => id !== filterId)
    } else {
      newFilters[filterType] = [...newFilters[filterType], filterId]
    }
    
    setSelectedFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {
      categories: [],
      mediums: [],
      priceRanges: []
    }
    setSelectedFilters(clearedFilters)
    onFilterChange?.(clearedFilters)
  }

  const hasActiveFilters = Object.values(selectedFilters).some(filters => filters.length > 0)

  const renderFilterGroup = (title: string, options: FilterOption[], filterType: string) => (
    <div className="filter-group" style={{ marginRight: 'var(--space-lg)' }}>
      <h4 style={{
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--font-weight-semibold)',
        color: 'var(--muted)',
        marginBottom: 'var(--space-sm)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        {title}
      </h4>
      <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
        {options.map(option => {
          const isSelected = selectedFilters[filterType].includes(option.id)
          return (
            <button
              key={option.id}
              onClick={() => handleFilterToggle(filterType, option.id)}
              style={{
                padding: 'var(--space-xs) var(--space-sm)',
                fontSize: 'var(--text-sm)',
                border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-md)',
                backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg)',
                color: isSelected ? 'white' : 'var(--fg)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-xs)'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = 'var(--primary)'
                  e.currentTarget.style.backgroundColor = 'var(--primary-bg)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.backgroundColor = 'var(--bg)'
                }
              }}
            >
              {option.label}
              {option.count && (
                <span style={{
                  fontSize: 'var(--text-xs)',
                  opacity: 0.7,
                  fontWeight: 'var(--font-weight-medium)'
                }}>
                  ({option.count})
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )

  return (
    <div 
      className={`horizontal-filter-system ${className}`}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--space-lg)',
        padding: 'var(--space-lg)',
        backgroundColor: 'var(--card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        overflowX: 'auto'
      }}
    >
      {categories.length > 0 && renderFilterGroup('Categories', categories, 'categories')}
      {mediums.length > 0 && renderFilterGroup('Mediums', mediums, 'mediums')}
      {priceRanges.length > 0 && renderFilterGroup('Price Range', priceRanges, 'priceRanges')}
      
      {hasActiveFilters && (
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
          >
            <Icon name="x" size={16} style={{ marginRight: 'var(--space-xs)' }} />
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}

export default HorizontalFilterSystem
