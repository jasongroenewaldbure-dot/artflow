import React, { useState, useEffect, useMemo } from 'react'
import { Filter, X, ChevronDown, ChevronUp, Star, Clock, TrendingUp, Save, Trash2, Palette, Ruler, Calendar, DollarSign, Layers, Sparkles } from 'lucide-react'
import { SearchFilters } from '../../services/userPreferences'
import { supabase } from '../../services/supabase'

interface IntelligentFiltersProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  onClose: () => void
  isOpen: boolean
  userId?: string
  searchQuery?: string
  currentResults?: any[]
}

interface FilterOption {
  value: string
  label: string
  count: number
  isActive: boolean
}

interface FilterSection {
  id: string
  title: string
  icon: React.ReactNode
  options: FilterOption[]
  type: 'checkbox' | 'range' | 'select' | 'preset'
  isExpanded: boolean
}

const IntelligentFilters: React.FC<IntelligentFiltersProps> = ({
  filters,
  onFiltersChange,
  onClose,
  isOpen,
  userId,
  searchQuery,
  currentResults = []
}) => {
  const [filterSections, setFilterSections] = useState<FilterSection[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['price', 'medium', 'size']))

  // Calculate available filter options based on current results
  const availableFilters = useMemo(() => {
    if (!currentResults.length) return {}

    const filterCounts: Record<string, Record<string, number>> = {
      mediums: {},
      genres: {},
      styles: {},
      colors: {},
      sizes: {},
      years: {},
      priceRanges: {}
    }

    currentResults.forEach(artwork => {
      // Medium filter
      if (artwork.medium) {
        filterCounts.mediums[artwork.medium] = (filterCounts.mediums[artwork.medium] || 0) + 1
      }

      // Genre filter
      if (artwork.genre) {
        filterCounts.genres[artwork.genre] = (filterCounts.genres[artwork.genre] || 0) + 1
      }

      // Style filter
      if (artwork.style) {
        filterCounts.styles[artwork.style] = (filterCounts.styles[artwork.style] || 0) + 1
      }

      // Color filter
      if (artwork.dominant_colors) {
        const colors = Array.isArray(artwork.dominant_colors) ? artwork.dominant_colors : [artwork.dominant_colors]
        colors.forEach(color => {
          if (color) {
            filterCounts.colors[color] = (filterCounts.colors[color] || 0) + 1
          }
        })
      }

      // Size filter (using centimeters)
      if (artwork.width_cm && artwork.height_cm) {
        const maxDimension = Math.max(artwork.width_cm, artwork.height_cm)
        let sizeCategory = 'extra-large'
        if (maxDimension <= 30) sizeCategory = 'small'
        else if (maxDimension <= 60) sizeCategory = 'medium'
        else if (maxDimension <= 120) sizeCategory = 'large'
        
        filterCounts.sizes[sizeCategory] = (filterCounts.sizes[sizeCategory] || 0) + 1
      }

      // Year filter
      if (artwork.year) {
        const decade = Math.floor(artwork.year / 10) * 10
        const decadeLabel = `${decade}s`
        filterCounts.years[decadeLabel] = (filterCounts.years[decadeLabel] || 0) + 1
      }

      // Price range filter
      if (artwork.price) {
        const price = parseFloat(artwork.price)
        let priceRange = 'over-50000'
        if (price <= 1000) priceRange = 'under-1000'
        else if (price <= 5000) priceRange = '1000-5000'
        else if (price <= 15000) priceRange = '5000-15000'
        else if (price <= 50000) priceRange = '15000-50000'
        
        filterCounts.priceRanges[priceRange] = (filterCounts.priceRanges[priceRange] || 0) + 1
      }
    })

    return filterCounts
  }, [currentResults])

  // Build filter sections dynamically
  useEffect(() => {
    const buildFilterSections = (): FilterSection[] => {
      const sections: FilterSection[] = []

      // Price Range Section
      const priceOptions = Object.entries(availableFilters.priceRanges || {})
        .map(([range, count]) => {
          const labels: Record<string, string> = {
            'under-1000': 'Under R1,000',
            '1000-5000': 'R1,000 - R5,000',
            '5000-15000': 'R5,000 - R15,000',
            '15000-50000': 'R15,000 - R50,000',
            'over-50000': 'Over R50,000'
          }
          return {
            value: range,
            label: labels[range] || range,
            count,
            isActive: false
          }
        })
        .sort((a, b) => a.count - b.count)

      if (priceOptions.length > 0) {
        sections.push({
          id: 'price',
          title: 'Price Range',
          icon: <DollarSign size={16} />,
          options: priceOptions,
          type: 'preset',
          isExpanded: expandedSections.has('price')
        })
      }

      // Medium Section
      const mediumOptions = Object.entries(availableFilters.mediums || {})
        .map(([medium, count]) => ({
          value: medium,
          label: medium.charAt(0).toUpperCase() + medium.slice(1),
          count,
          isActive: filters.mediums?.includes(medium) || false
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8) // Show top 8 mediums

      if (mediumOptions.length > 0) {
        sections.push({
          id: 'medium',
          title: 'Medium',
          icon: <Palette size={16} />,
          options: mediumOptions,
          type: 'checkbox',
          isExpanded: expandedSections.has('medium')
        })
      }

      // Size Section
      const sizeOptions = Object.entries(availableFilters.sizes || {})
        .map(([size, count]) => {
          const labels: Record<string, string> = {
            'small': 'Small (under 30cm)',
            'medium': 'Medium (30-60cm)',
            'large': 'Large (60-120cm)',
            'extra-large': 'Extra Large (120cm+)'
          }
          return {
            value: size,
            label: labels[size] || size,
            count,
            isActive: filters.sizes?.includes(size) || false
          }
        })
        .sort((a, b) => b.count - a.count)

      if (sizeOptions.length > 0) {
        sections.push({
          id: 'size',
          title: 'Size',
          icon: <Ruler size={16} />,
          options: sizeOptions,
          type: 'checkbox',
          isExpanded: expandedSections.has('size')
        })
      }

      // Genre Section
      const genreOptions = Object.entries(availableFilters.genres || {})
        .map(([genre, count]) => ({
          value: genre,
          label: genre.charAt(0).toUpperCase() + genre.slice(1),
          count,
          isActive: filters.genres?.includes(genre) || false
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6) // Show top 6 genres

      if (genreOptions.length > 0) {
        sections.push({
          id: 'genre',
          title: 'Genre',
          icon: <Layers size={16} />,
          options: genreOptions,
          type: 'checkbox',
          isExpanded: expandedSections.has('genre')
        })
      }

      // Style Section
      const styleOptions = Object.entries(availableFilters.styles || {})
        .map(([style, count]) => ({
          value: style,
          label: style.charAt(0).toUpperCase() + style.slice(1),
          count,
          isActive: filters.styles?.includes(style) || false
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6) // Show top 6 styles

      if (styleOptions.length > 0) {
        sections.push({
          id: 'style',
          title: 'Style',
          icon: <Sparkles size={16} />,
          options: styleOptions,
          type: 'checkbox',
          isExpanded: expandedSections.has('style')
        })
      }

      // Color Section
      const colorOptions = Object.entries(availableFilters.colors || {})
        .map(([color, count]) => ({
          value: color,
          label: color.charAt(0).toUpperCase() + color.slice(1),
          count,
          isActive: filters.colors?.includes(color) || false
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8) // Show top 8 colors

      if (colorOptions.length > 0) {
        sections.push({
          id: 'color',
          title: 'Color',
          icon: <Palette size={16} />,
          options: colorOptions,
          type: 'checkbox',
          isExpanded: expandedSections.has('color')
        })
      }

      // Year Section
      const yearOptions = Object.entries(availableFilters.years || {})
        .map(([decade, count]) => ({
          value: decade,
          label: decade,
          count,
          isActive: filters.years?.includes(decade) || false
        }))
        .sort((a, b) => b.value.localeCompare(a.value)) // Sort by decade

      if (yearOptions.length > 0) {
        sections.push({
          id: 'year',
          title: 'Decade',
          icon: <Calendar size={16} />,
          options: yearOptions,
          type: 'checkbox',
          isExpanded: expandedSections.has('year')
        })
      }

      return sections
    }

    setFilterSections(buildFilterSections())
  }, [availableFilters, filters, expandedSections])

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const handleFilterChange = (sectionId: string, optionValue: string, checked: boolean) => {
    const updatedFilters = { ...filters }

    switch (sectionId) {
      case 'medium':
        const currentMediums = updatedFilters.mediums || []
        updatedFilters.mediums = checked
          ? [...currentMediums, optionValue]
          : currentMediums.filter(m => m !== optionValue)
        break

      case 'genre':
        const currentGenres = updatedFilters.genres || []
        updatedFilters.genres = checked
          ? [...currentGenres, optionValue]
          : currentGenres.filter(g => g !== optionValue)
        break

      case 'style':
        const currentStyles = updatedFilters.styles || []
        updatedFilters.styles = checked
          ? [...currentStyles, optionValue]
          : currentStyles.filter(s => s !== optionValue)
        break

      case 'color':
        const currentColors = updatedFilters.colors || []
        updatedFilters.colors = checked
          ? [...currentColors, optionValue]
          : currentColors.filter(c => c !== optionValue)
        break

      case 'size':
        const currentSizes = updatedFilters.sizes || []
        updatedFilters.sizes = checked
          ? [...currentSizes, optionValue]
          : currentSizes.filter(s => s !== optionValue)
        break

      case 'year':
        const currentYears = updatedFilters.years || []
        updatedFilters.years = checked
          ? [...currentYears, optionValue]
          : currentYears.filter(y => y !== optionValue)
        break

      case 'price':
        // Handle price range presets
        const priceRanges: Record<string, { min: number; max: number }> = {
          'under-1000': { min: 0, max: 1000 },
          '1000-5000': { min: 1000, max: 5000 },
          '5000-15000': { min: 5000, max: 15000 },
          '15000-50000': { min: 15000, max: 50000 },
          'over-50000': { min: 50000, max: 1000000 }
        }
        const range = priceRanges[optionValue]
        if (range) {
          updatedFilters.priceRange = range
        }
        break
    }

    onFiltersChange(updatedFilters)
  }

  const clearAllFilters = () => {
    onFiltersChange({})
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.mediums?.length) count += filters.mediums.length
    if (filters.genres?.length) count += filters.genres.length
    if (filters.styles?.length) count += filters.styles.length
    if (filters.colors?.length) count += filters.colors.length
    if (filters.sizes?.length) count += filters.sizes.length
    if (filters.years?.length) count += filters.years.length
    if (filters.priceRange) count += 1
    return count
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'flex-end'
    }}>
      <div style={{
        width: '400px',
        height: '100%',
        backgroundColor: 'var(--card)',
        borderLeft: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: 'var(--space-lg)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <Filter size={20} />
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              margin: 0,
              color: 'var(--fg)'
            }}>
              Smart Filters
            </h2>
            {getActiveFilterCount() > 0 && (
              <span style={{
                backgroundColor: 'var(--primary)',
                color: 'white',
                borderRadius: 'var(--radius-full)',
                padding: '2px 8px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {getActiveFilterCount()}
              </span>
            )}
          </div>
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
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: 'var(--space-lg)' }}>
          {filterSections.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: 'var(--space-2xl)',
              color: 'var(--muted)'
            }}>
              <Filter size={48} style={{ marginBottom: 'var(--space-md)', opacity: 0.5 }} />
              <p>No filters available for current results</p>
            </div>
          ) : (
            filterSections.map(section => (
              <FilterSection
                key={section.id}
                section={section}
                onToggle={() => toggleSection(section.id)}
                onFilterChange={handleFilterChange}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: 'var(--space-lg)',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          gap: 'var(--space-sm)'
        }}>
          <button
            onClick={clearAllFilters}
            style={{
              flex: 1,
              padding: 'var(--space-sm) var(--space-lg)',
              border: '1px solid var(--border)',
              backgroundColor: 'transparent',
              color: 'var(--fg)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  )
}

interface FilterSectionProps {
  section: FilterSection
  onToggle: () => void
  onFilterChange: (sectionId: string, optionValue: string, checked: boolean) => void
}

const FilterSection: React.FC<FilterSectionProps> = ({
  section,
  onToggle,
  onFilterChange
}) => {
  return (
    <div style={{ marginBottom: 'var(--space-lg)' }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'var(--space-sm) 0',
          backgroundColor: 'transparent',
          border: 'none',
          color: 'var(--fg)',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '600'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          {section.icon}
          {section.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <span style={{
            fontSize: '12px',
            color: 'var(--muted)',
            backgroundColor: 'var(--bg-alt)',
            padding: '2px 6px',
            borderRadius: 'var(--radius-sm)'
          }}>
            {section.options.length}
          </span>
          {section.isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>
      
      {section.isExpanded && (
        <div style={{ paddingLeft: 'var(--space-lg)' }}>
          {section.type === 'checkbox' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {section.options.map(option => (
                <label
                  key={option.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    fontSize: '14px',
                    padding: 'var(--space-xs) 0'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <input
                      type="checkbox"
                      checked={option.isActive}
                      onChange={(e) => onFilterChange(section.id, option.value, e.target.checked)}
                      style={{
                        width: '16px',
                        height: '16px',
                        accentColor: 'var(--primary)'
                      }}
                    />
                    <span style={{ color: 'var(--fg)' }}>{option.label}</span>
                  </div>
                  <span style={{
                    fontSize: '12px',
                    color: 'var(--muted)',
                    backgroundColor: 'var(--bg-alt)',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    {option.count}
                  </span>
                </label>
              ))}
            </div>
          )}

          {section.type === 'preset' && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-xs)'
            }}>
              {section.options.map(option => (
                <button
                  key={option.value}
                  onClick={() => onFilterChange(section.id, option.value, true)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'var(--space-sm)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'transparent',
                    color: 'var(--fg)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>{option.label}</span>
                  <span style={{
                    fontSize: '12px',
                    color: 'var(--muted)',
                    backgroundColor: 'var(--bg-alt)',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    {option.count}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default IntelligentFilters
