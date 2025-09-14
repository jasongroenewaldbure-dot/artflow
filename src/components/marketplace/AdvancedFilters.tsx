import React, { useState, useEffect } from 'react'
import { Filter, X, ChevronDown, ChevronUp, Star, Clock, TrendingUp, Save, Trash2 } from 'lucide-react'
import { type SearchFilters, type QuickFilter } from '../../services/userPreferences'
import { userPreferencesService } from '../../services/userPreferences'

interface AdvancedFiltersProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  onClose: () => void
  isOpen: boolean
  userId?: string
  searchQuery?: string
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
  onClose,
  isOpen,
  userId,
  searchQuery
}) => {
  const [quickFilters, setQuickFilters] = useState<QuickFilter[]>([])
  const [savedSearches, setSavedSearches] = useState<any[]>([])
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['quick', 'genres', 'price']))
  const [personalizedSuggestions, setPersonalizedSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (userId && isOpen) {
      loadUserData()
    }
  }, [userId, isOpen])

  const loadUserData = async () => {
    if (!userId) return

    setIsLoading(true)
    try {
      const [quickFiltersData, savedSearchesData, suggestions] = await Promise.all([
        userPreferencesService.getQuickFilters(userId),
        userPreferencesService.getSavedSearches(userId),
        userPreferencesService.getPersonalizedSuggestions(userId, 8)
      ])

      setQuickFilters(quickFiltersData)
      setSavedSearches(savedSearchesData)
      setPersonalizedSuggestions(suggestions)
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const handleQuickFilterToggle = (filter: QuickFilter) => {
    const updatedFilters = { ...filters }

    if (filter.type === 'genre') {
      const currentGenres = updatedFilters.genres || []
      if (currentGenres.includes(filter.value as string)) {
        updatedFilters.genres = currentGenres.filter(g => g !== filter.value)
      } else {
        updatedFilters.genres = [...currentGenres, filter.value as string]
      }
    } else if (filter.type === 'medium') {
      const currentMediums = updatedFilters.mediums || []
      if (currentMediums.includes(filter.value as string)) {
        updatedFilters.mediums = currentMediums.filter(m => m !== filter.value)
      } else {
        updatedFilters.mediums = [...currentMediums, filter.value as string]
      }
    } else if (filter.type === 'priceRange') {
      updatedFilters.priceRange = filter.value as { min: number; max: number }
    }

    onFiltersChange(updatedFilters)
  }

  const handleGenreChange = (genre: string, checked: boolean) => {
    const currentGenres = filters.genres || []
    const updatedGenres = checked
      ? [...currentGenres, genre]
      : currentGenres.filter(g => g !== genre)
    
    onFiltersChange({ ...filters, genres: updatedGenres })
  }

  const handleMediumChange = (medium: string, checked: boolean) => {
    const currentMediums = filters.mediums || []
    const updatedMediums = checked
      ? [...currentMediums, medium]
      : currentMediums.filter(m => m !== medium)
    
    onFiltersChange({ ...filters, mediums: updatedMediums })
  }

  const handlePriceRangeChange = (min: number, max: number) => {
    onFiltersChange({ ...filters, priceRange: { min, max } })
  }

  const handleSortChange = (sortBy: string) => {
    onFiltersChange({ ...filters, sortBy: sortBy as any })
  }

  const clearAllFilters = () => {
    onFiltersChange({})
  }

  const saveCurrentSearch = async () => {
    if (!userId || !searchQuery) return

    const name = prompt('Enter a name for this search:')
    if (name) {
      try {
        await userPreferencesService.saveSearch(userId, name, searchQuery, filters)
        await loadUserData() // Reload saved searches
      } catch (error) {
        console.error('Error saving search:', error)
      }
    }
  }

  const loadSavedSearch = (savedSearch: any) => {
    onFiltersChange(savedSearch.filters)
  }

  const deleteSavedSearch = async (searchId: string) => {
    if (!userId) return

    try {
      await userPreferencesService.deleteSavedSearch(userId, searchId)
      await loadUserData() // Reload saved searches
    } catch (error) {
      console.error('Error deleting saved search:', error)
    }
  }

  const genres = [
    'Abstract', 'Contemporary', 'Modern', 'Classical', 'Pop Art', 'Surrealism',
    'Impressionism', 'Expressionism', 'Minimalism', 'Realism', 'Cubism', 'Renaissance'
  ]

  const mediums = [
    'Oil Painting', 'Acrylic', 'Watercolor', 'Digital Art', 'Photography', 'Sculpture',
    'Mixed Media', 'Drawing', 'Print', 'Collage', 'Ceramic', 'Glass'
  ]

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
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            margin: 0,
            color: 'var(--fg)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)'
          }}>
            <Filter size={20} />
            Advanced Filters
          </h2>
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
          {/* Quick Filters */}
          {quickFilters.length > 0 && (
            <FilterSection
              title="Quick Filters"
              icon={<TrendingUp size={16} />}
              isExpanded={expandedSections.has('quick')}
              onToggle={() => toggleSection('quick')}
            >
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--space-xs)'
              }}>
                {quickFilters.map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => handleQuickFilterToggle(filter)}
                    style={{
                      padding: 'var(--space-xs) var(--space-sm)',
                      border: '1px solid var(--border)',
                      backgroundColor: filter.isActive ? 'var(--primary)' : 'transparent',
                      color: filter.isActive ? 'white' : 'var(--fg)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </FilterSection>
          )}

          {/* Saved Searches */}
          {savedSearches.length > 0 && (
            <FilterSection
              title="Saved Searches"
              icon={<Save size={16} />}
              isExpanded={expandedSections.has('saved')}
              onToggle={() => toggleSection('saved')}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                {savedSearches.map(search => (
                  <div
                    key={search.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 'var(--space-sm)',
                      backgroundColor: 'var(--border)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <button
                      onClick={() => loadSavedSearch(search)}
                      style={{
                        flex: 1,
                        textAlign: 'left',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: 'var(--fg)',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      {search.name}
                    </button>
                    <button
                      onClick={() => deleteSavedSearch(search.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '24px',
                        height: '24px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: 'var(--muted)',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </FilterSection>
          )}

          {/* Personalized Suggestions */}
          {personalizedSuggestions.length > 0 && (
            <FilterSection
              title="For You"
              icon={<Star size={16} />}
              isExpanded={expandedSections.has('suggestions')}
              onToggle={() => toggleSection('suggestions')}
            >
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--space-xs)'
              }}>
                {personalizedSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      // This would trigger a search with the suggestion
                      console.log('Search for:', suggestion)
                    }}
                    style={{
                      padding: 'var(--space-xs) var(--space-sm)',
                      border: '1px solid var(--border)',
                      backgroundColor: 'transparent',
                      color: 'var(--fg)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </FilterSection>
          )}

          {/* Genres */}
          <FilterSection
            title="Genres"
            icon={<Filter size={16} />}
            isExpanded={expandedSections.has('genres')}
            onToggle={() => toggleSection('genres')}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {genres.map(genre => (
                <label
                  key={genre}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-sm)',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={filters.genres?.includes(genre.toLowerCase()) || false}
                    onChange={(e) => handleGenreChange(genre.toLowerCase(), e.target.checked)}
                    style={{
                      width: '16px',
                      height: '16px',
                      accentColor: 'var(--primary)'
                    }}
                  />
                  <span style={{ color: 'var(--fg)' }}>{genre}</span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Mediums */}
          <FilterSection
            title="Mediums"
            icon={<Filter size={16} />}
            isExpanded={expandedSections.has('mediums')}
            onToggle={() => toggleSection('mediums')}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {mediums.map(medium => (
                <label
                  key={medium}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-sm)',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={filters.mediums?.includes(medium.toLowerCase()) || false}
                    onChange={(e) => handleMediumChange(medium.toLowerCase(), e.target.checked)}
                    style={{
                      width: '16px',
                      height: '16px',
                      accentColor: 'var(--primary)'
                    }}
                  />
                  <span style={{ color: 'var(--fg)' }}>{medium}</span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Price Range */}
          <FilterSection
            title="Price Range"
            icon={<Filter size={16} />}
            isExpanded={expandedSections.has('price')}
            onToggle={() => toggleSection('price')}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange?.min || ''}
                  onChange={(e) => handlePriceRangeChange(
                    parseInt(e.target.value) || 0,
                    filters.priceRange?.max || 100000
                  )}
                  style={{
                    flex: 1,
                    padding: 'var(--space-sm)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--card)',
                    color: 'var(--fg)',
                    fontSize: '14px'
                  }}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange?.max || ''}
                  onChange={(e) => handlePriceRangeChange(
                    filters.priceRange?.min || 0,
                    parseInt(e.target.value) || 100000
                  )}
                  style={{
                    flex: 1,
                    padding: 'var(--space-sm)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--card)',
                    color: 'var(--fg)',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              {/* Price Range Presets */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--space-xs)'
              }}>
                {[
                  { label: 'Under R100', min: 0, max: 100 },
                  { label: 'R100 - R500', min: 100, max: 500 },
                  { label: 'R500 - R1000', min: 500, max: 1000 },
                  { label: 'R1000 - R5000', min: 1000, max: 5000 },
                  { label: 'Over R5000', min: 5000, max: 100000 }
                ].map(range => (
                  <button
                    key={range.label}
                    onClick={() => handlePriceRangeChange(range.min, range.max)}
                    style={{
                      padding: 'var(--space-xs) var(--space-sm)',
                      border: '1px solid var(--border)',
                      backgroundColor: 'transparent',
                      color: 'var(--fg)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </FilterSection>

          {/* Sort By */}
          <FilterSection
            title="Sort By"
            icon={<Clock size={16} />}
            isExpanded={expandedSections.has('sort')}
            onToggle={() => toggleSection('sort')}
          >
            <select
              value={filters.sortBy || 'relevance'}
              onChange={(e) => handleSortChange(e.target.value)}
              style={{
                width: '100%',
                padding: 'var(--space-sm)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--card)',
                color: 'var(--fg)',
                fontSize: '14px'
              }}
            >
              <option value="relevance">Relevance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Popular</option>
            </select>
          </FilterSection>
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
          {userId && searchQuery && (
            <button
              onClick={saveCurrentSearch}
              style={{
                padding: 'var(--space-sm) var(--space-lg)',
                border: 'none',
                backgroundColor: 'var(--primary)',
                color: 'white',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-xs)'
              }}
            >
              <Save size={16} />
              Save Search
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

interface FilterSectionProps {
  title: string
  icon: React.ReactNode
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
}

const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  icon,
  isExpanded,
  onToggle,
  children
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
          {icon}
          {title}
        </div>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      
      {isExpanded && (
        <div style={{ paddingLeft: 'var(--space-lg)' }}>
          {children}
        </div>
      )}
    </div>
  )
}

export default AdvancedFilters
