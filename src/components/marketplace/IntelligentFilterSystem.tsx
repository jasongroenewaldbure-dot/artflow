import React, { useState, useEffect, useMemo } from 'react'
import { Filter, X, ChevronDown, ChevronUp, Search, SlidersHorizontal } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { showErrorToast } from '../../utils/errorHandling'

interface FilterOption {
  value: string
  label: string
  count: number
  isActive: boolean
}

interface FilterCategory {
  id: string
  label: string
  type: 'multi-select' | 'range' | 'search' | 'toggle'
  options: FilterOption[]
  isOpen: boolean
  hasResults: boolean
  totalCount: number
}

interface FilterState {
  search: string
  mediums: string[]
  styles: string[]
  colors: string[]
  priceRange: [number, number]
  sizes: string[]
  availability: string[]
  artists: string[]
  locations: string[]
  years: [number, number]
  orientations: string[]
  materials: string[]
  sortBy: string
}

interface IntelligentFilterSystemProps {
  onFiltersChange: (filters: FilterState) => void
  initialFilters?: Partial<FilterState>
  context?: 'artworks' | 'artists' | 'catalogues'
  className?: string
}

const IntelligentFilterSystem: React.FC<IntelligentFilterSystemProps> = ({
  onFiltersChange,
  initialFilters = {},
  context = 'artworks',
  className = ''
}) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    mediums: [],
    styles: [],
    colors: [],
    priceRange: [0, 100000],
    sizes: [],
    availability: ['available'],
    artists: [],
    locations: [],
    years: [1900, new Date().getFullYear()],
    orientations: [],
    materials: [],
    sortBy: 'relevance',
    ...initialFilters
  })

  const [filterCategories, setFilterCategories] = useState<FilterCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Load available filter options based on current data
  useEffect(() => {
    loadFilterOptions()
  }, [context, filters])

  const loadFilterOptions = async () => {
    try {
      setLoading(true)
      
      // Get current data to determine available filters
      const { data: artworks, error } = await supabase
        .from('artworks')
        .select(`
          id, title, medium, style, genre, subject, 
          price, currency, status, year, created_at,
          width_cm, height_cm, depth_cm,
          dominant_colors,
          profiles!artworks_user_id_fkey(name, location)
        `)
        .eq('status', 'available')
        .not('primary_image_url', 'is', null)

      if (error) throw error

      // Calculate available filter options
      const categories = await calculateFilterCategories(artworks || [])
      setFilterCategories(categories)
    } catch (error) {
      console.error('Error loading filter options:', error)
      showErrorToast('Failed to load filter options')
    } finally {
      setLoading(false)
    }
  }

  const calculateFilterCategories = async (artworks: any[]): Promise<FilterCategory[]> => {
    const categories: FilterCategory[] = []

    // Medium filter
    const mediumCounts = new Map<string, number>()
    artworks.forEach(artwork => {
      if (artwork.medium) {
        const medium = artwork.medium.toLowerCase()
        mediumCounts.set(medium, (mediumCounts.get(medium) || 0) + 1)
      }
    })

    const mediumOptions: FilterOption[] = Array.from(mediumCounts.entries())
      .map(([value, count]) => ({
        value,
        label: value.charAt(0).toUpperCase() + value.slice(1),
        count,
        isActive: filters.mediums.includes(value)
      }))
      .sort((a, b) => b.count - a.count)

    categories.push({
      id: 'mediums',
      label: 'Medium',
      type: 'multi-select',
      options: mediumOptions,
      isOpen: false,
      hasResults: mediumOptions.length > 0,
      totalCount: mediumOptions.reduce((sum, opt) => sum + opt.count, 0)
    })

    // Style filter
    const styleCounts = new Map<string, number>()
    artworks.forEach(artwork => {
      if (artwork.style) {
        const style = artwork.style.toLowerCase()
        styleCounts.set(style, (styleCounts.get(style) || 0) + 1)
      }
    })

    const styleOptions: FilterOption[] = Array.from(styleCounts.entries())
      .map(([value, count]) => ({
        value,
        label: value.charAt(0).toUpperCase() + value.slice(1),
        count,
        isActive: filters.styles.includes(value)
      }))
      .sort((a, b) => b.count - a.count)

    categories.push({
      id: 'styles',
      label: 'Style',
      type: 'multi-select',
      options: styleOptions,
      isOpen: false,
      hasResults: styleOptions.length > 0,
      totalCount: styleOptions.reduce((sum, opt) => sum + opt.count, 0)
    })

    // Color filter
    const colorCounts = new Map<string, number>()
    artworks.forEach(artwork => {
      if (artwork.dominant_colors) {
        const colors = Array.isArray(artwork.dominant_colors) 
          ? artwork.dominant_colors 
          : [artwork.dominant_colors]
        colors.forEach(color => {
          const colorKey = color.toLowerCase()
          colorCounts.set(colorKey, (colorCounts.get(colorKey) || 0) + 1)
        })
      }
    })

    const colorOptions: FilterOption[] = Array.from(colorCounts.entries())
      .map(([value, count]) => ({
        value,
        label: value.charAt(0).toUpperCase() + value.slice(1),
        count,
        isActive: filters.colors.includes(value)
      }))
      .sort((a, b) => b.count - a.count)

    categories.push({
      id: 'colors',
      label: 'Color',
      type: 'multi-select',
      options: colorOptions,
      isOpen: false,
      hasResults: colorOptions.length > 0,
      totalCount: colorOptions.reduce((sum, opt) => sum + opt.count, 0)
    })

    // Size filter
    const sizeCounts = new Map<string, number>()
    artworks.forEach(artwork => {
      const width = artwork.width_cm || 0
      const height = artwork.height_cm || 0
      const maxDim = Math.max(width, height)
      
      let size = 'small'
      if (maxDim > 120) size = 'large'
      else if (maxDim > 50) size = 'medium'
      
      sizeCounts.set(size, (sizeCounts.get(size) || 0) + 1)
    })

    const sizeOptions: FilterOption[] = Array.from(sizeCounts.entries())
      .map(([value, count]) => ({
        value,
        label: value.charAt(0).toUpperCase() + value.slice(1),
        count,
        isActive: filters.sizes.includes(value)
      }))
      .sort((a, b) => b.count - a.count)

    categories.push({
      id: 'sizes',
      label: 'Size',
      type: 'multi-select',
      options: sizeOptions,
      isOpen: false,
      hasResults: sizeOptions.length > 0,
      totalCount: sizeOptions.reduce((sum, opt) => sum + opt.count, 0)
    })

    // Price range
    const prices = artworks
      .map(a => a.price || 0)
      .filter(p => p > 0)
      .sort((a, b) => a - b)

    const minPrice = prices[0] || 0
    const maxPrice = prices[prices.length - 1] || 100000

    categories.push({
      id: 'priceRange',
      label: 'Price Range',
      type: 'range',
      options: [{
        value: `${minPrice}-${maxPrice}`,
        label: `R ${minPrice.toLocaleString()} - R ${maxPrice.toLocaleString()}`,
        count: artworks.length,
        isActive: true
      }],
      isOpen: false,
      hasResults: true,
      totalCount: artworks.length
    })

    // Year range
    const years = artworks
      .map(a => a.year || new Date().getFullYear())
      .filter(y => y > 1900)
      .sort((a, b) => a - b)

    const minYear = years[0] || 1900
    const maxYear = years[years.length - 1] || new Date().getFullYear()

    categories.push({
      id: 'years',
      label: 'Year',
      type: 'range',
      options: [{
        value: `${minYear}-${maxYear}`,
        label: `${minYear} - ${maxYear}`,
        count: artworks.length,
        isActive: true
      }],
      isOpen: false,
      hasResults: true,
      totalCount: artworks.length
    })

    // Sort options
    const sortOptions: FilterOption[] = [
      { value: 'relevance', label: 'Relevance', count: artworks.length, isActive: filters.sortBy === 'relevance' },
      { value: 'newest', label: 'Newest', count: artworks.length, isActive: filters.sortBy === 'newest' },
      { value: 'oldest', label: 'Oldest', count: artworks.length, isActive: filters.sortBy === 'oldest' },
      { value: 'price-low', label: 'Price: Low to High', count: artworks.length, isActive: filters.sortBy === 'price-low' },
      { value: 'price-high', label: 'Price: High to Low', count: artworks.length, isActive: filters.sortBy === 'price-high' },
      { value: 'popular', label: 'Most Popular', count: artworks.length, isActive: filters.sortBy === 'popular' }
    ]

    categories.push({
      id: 'sortBy',
      label: 'Sort By',
      type: 'multi-select',
      options: sortOptions,
      isOpen: false,
      hasResults: true,
      totalCount: artworks.length
    })

    return categories.filter(cat => cat.hasResults)
  }

  const handleFilterChange = (categoryId: string, value: any) => {
    setFilters(prev => {
      const newFilters = { ...prev }
      
      if (categoryId === 'search') {
        newFilters.search = value
      } else if (categoryId === 'priceRange') {
        newFilters.priceRange = value
      } else if (categoryId === 'years') {
        newFilters.years = value
      } else if (categoryId === 'sortBy') {
        newFilters.sortBy = value
      } else {
        // Handle array-based filters
        const currentValues = newFilters[categoryId as keyof FilterState] as string[]
        if (Array.isArray(currentValues)) {
          if (currentValues.includes(value)) {
            newFilters[categoryId as keyof FilterState] = currentValues.filter(v => v !== value) as any
          } else {
            newFilters[categoryId as keyof FilterState] = [...currentValues, value] as any
          }
        }
      }
      
      return newFilters
    })
  }

  const toggleCategory = (categoryId: string) => {
    setFilterCategories(prev => 
      prev.map(cat => 
        cat.id === categoryId 
          ? { ...cat, isOpen: !cat.isOpen }
          : cat
      )
    )
  }

  const clearAllFilters = () => {
    setFilters({
      search: '',
      mediums: [],
      styles: [],
      colors: [],
      priceRange: [0, 100000],
      sizes: [],
      availability: ['available'],
      artists: [],
      locations: [],
      years: [1900, new Date().getFullYear()],
      orientations: [],
      materials: [],
      sortBy: 'relevance'
    })
  }

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(v => 
      Array.isArray(v) ? v.length > 0 : v !== '' && v !== false && v !== 'relevance'
    ).length
  }

  // Notify parent of filter changes
  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const renderFilterCategory = (category: FilterCategory) => {
    if (!category.hasResults) return null

    return (
      <div key={category.id} className="filter-category">
        <button
          onClick={() => toggleCategory(category.id)}
          className="filter-category-header"
        >
          <span className="filter-category-label">
            {category.label}
            <span className="filter-count">({category.totalCount})</span>
          </span>
          {category.isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {category.isOpen && (
          <div className="filter-category-content">
            {category.type === 'multi-select' && (
              <div className="filter-options">
                {category.options.map(option => (
                  <label key={option.value} className="filter-option">
                    <input
                      type="checkbox"
                      checked={option.isActive}
                      onChange={() => handleFilterChange(category.id, option.value)}
                    />
                    <span className="filter-option-label">
                      {option.label}
                      <span className="option-count">({option.count})</span>
                    </span>
                  </label>
                ))}
              </div>
            )}
            
            {category.type === 'range' && (
              <div className="filter-range">
                <div className="range-display">
                  {category.options[0]?.label}
                </div>
                {/* Range slider would go here */}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`intelligent-filter-system ${className}`}>
      <div className="filter-header">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="filter-toggle"
        >
          <SlidersHorizontal size={16} />
          Filters
          {getActiveFilterCount() > 0 && (
            <span className="active-count">{getActiveFilterCount()}</span>
          )}
        </button>
        
        {getActiveFilterCount() > 0 && (
          <button onClick={clearAllFilters} className="clear-filters">
            Clear All
          </button>
        )}
      </div>

      {isOpen && (
        <div className="filter-panel">
          <div className="search-filter">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search artworks..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-categories">
            {loading ? (
              <div className="loading">Loading filters...</div>
            ) : (
              filterCategories.map(renderFilterCategory)
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default IntelligentFilterSystem
