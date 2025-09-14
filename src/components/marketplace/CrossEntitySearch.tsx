import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Filter, Grid, List, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import BadgeSystem from './BadgeSystem';
import ScaleBadge from './ScaleBadge';

interface SearchResult {
  id: string;
  type: 'artwork' | 'artist' | 'catalogue' | 'list';
  title: string;
  slug: string;
  image_url?: string;
  artist_name?: string;
  price?: number;
  currency?: string;
  status?: string;
  description?: string;
  relevance_score: number;
  badges?: string[];
}

interface CrossEntitySearchProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const CrossEntitySearch: React.FC<CrossEntitySearchProps> = ({ 
  isOpen, 
  onClose, 
  className = '' 
}) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'artworks' | 'artists' | 'catalogues' | 'lists'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    priceRange: [0, 100000],
    mediums: [] as string[],
    styles: [] as string[],
    colors: [] as string[],
    availability: 'all' as 'all' | 'available' | 'sold'
  });
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Search query
  const { data: searchResults, isLoading } = useQuery<SearchResult[]>({
    queryKey: ['crossEntitySearch', query, activeTab, filters],
    queryFn: async () => {
      if (!query.trim()) return [];

      // Use the new search service instead of database function
      const searchService = (await import('../../services/searchService')).default;
      
      if (activeTab === 'all') {
        return await searchService.searchAll(query, {
          priceMin: filters.priceRange[0],
          priceMax: filters.priceRange[1],
          mediums: filters.mediums,
          styles: filters.styles,
          subjects: filters.colors, // Map colors to subjects for now
          availability: filters.availability
        }, 50);
      } else if (activeTab === 'artworks') {
        return await searchService.searchArtworks(query, {
          priceMin: filters.priceRange[0],
          priceMax: filters.priceRange[1],
          mediums: filters.mediums,
          styles: filters.styles,
          subjects: filters.colors,
          availability: filters.availability
        }, 50);
      } else if (activeTab === 'artists') {
        return await searchService.searchArtists(query, 50);
      } else if (activeTab === 'catalogues') {
        return await searchService.searchCatalogues(query, 50);
      }
      
      return [];
    },
    enabled: query.length >= 2,
    staleTime: 30000
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const clearQuery = () => {
    setQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const getTabCount = (type: string) => {
    if (!searchResults) return 0;
    return searchResults.filter(result => result.type === type).length;
  };

  const getFilteredResults = () => {
    if (!searchResults) return [];
    return searchResults.filter(result => {
      if (activeTab !== 'all' && result.type !== activeTab) return false;
      return true;
    });
  };

  const renderResult = (result: SearchResult) => {
    const isArtwork = result.type === 'artwork';
    const isArtist = result.type === 'artist';
    const isCatalogue = result.type === 'catalogue';
    const isList = result.type === 'list';

    const linkUrl = isArtwork ? `/${result.artist_name}/artwork/${result.slug}` :
                    isArtist ? `/${result.slug}` :
                    isCatalogue ? `/catalogue/${result.slug}` :
                    `/list/${result.slug}`;

    return (
      <Link
        key={`${result.type}_${result.id}`}
        to={linkUrl}
        className={`search-result-item ${viewMode === 'grid' ? 'grid-item' : 'list-item'}`}
        onClick={onClose}
      >
        <div className="result-image">
          {result.image_url ? (
            <img 
              src={result.image_url} 
              alt={result.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-sm">
                {isArtist ? 'Artist' : isCatalogue ? 'Catalogue' : isList ? 'List' : 'Artwork'}
              </span>
            </div>
          )}
          
          {isArtwork && result.badges && (
            <div className="absolute top-2 left-2 flex flex-wrap gap-1">
              {result.badges.map((badge, index) => (
                <BadgeSystem key={index} type={badge as any} />
              ))}
            </div>
          )}
        </div>

        <div className="result-content">
          <div className="result-header">
            <h3 className="result-title">{result.title}</h3>
            <span className="result-type">{result.type}</span>
          </div>

          {isArtwork && result.artist_name && (
            <p className="result-artist">by {result.artist_name}</p>
          )}

          {result.description && (
            <p className="result-description">{result.description}</p>
          )}

          {isArtwork && result.price && (
            <div className="result-price">
              <span className="price-amount">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: result.currency || 'USD'
                }).format(result.price)}
              </span>
              {result.status && (
                <span className={`status-badge status-${result.status}`}>
                  {result.status}
                </span>
              )}
            </div>
          )}

          <div className="result-footer">
            <span className="relevance-score">
              {Math.round(result.relevance_score * 100)}% match
            </span>
            <ArrowRight size={16} className="arrow-icon" />
          </div>
        </div>
      </Link>
    );
  };

  if (!isOpen) return null;

  return (
    <div className={`cross-entity-search-overlay ${className}`} onClick={onClose}>
      <div className="search-modal" onClick={e => e.stopPropagation()}>
        <div className="search-header">
          <div className="search-input-container">
            <Search size={20} className="search-icon" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleQueryChange}
              onKeyDown={handleKeyDown}
              placeholder="Search artworks, artists, catalogues, lists..."
              className="search-input"
            />
            {query && (
              <button onClick={clearQuery} className="clear-button">
                <X size={16} />
              </button>
            )}
          </div>
          
          <div className="search-controls">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`filter-button ${showFilters ? 'active' : ''}`}
            >
              <Filter size={16} />
              Filters
            </button>
            
            <div className="view-toggle">
              <button
                onClick={() => setViewMode('grid')}
                className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="search-tabs">
          <button
            onClick={() => setActiveTab('all')}
            className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
          >
            All ({searchResults?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('artworks')}
            className={`tab-button ${activeTab === 'artworks' ? 'active' : ''}`}
          >
            Artworks ({getTabCount('artwork')})
          </button>
          <button
            onClick={() => setActiveTab('artists')}
            className={`tab-button ${activeTab === 'artists' ? 'active' : ''}`}
          >
            Artists ({getTabCount('artist')})
          </button>
          <button
            onClick={() => setActiveTab('catalogues')}
            className={`tab-button ${activeTab === 'catalogues' ? 'active' : ''}`}
          >
            Catalogues ({getTabCount('catalogue')})
          </button>
          <button
            onClick={() => setActiveTab('lists')}
            className={`tab-button ${activeTab === 'lists' ? 'active' : ''}`}
          >
            Lists ({getTabCount('list')})
          </button>
        </div>

        {showFilters && (
          <div className="search-filters">
            <div className="filter-group">
              <label>Price Range</label>
              <div className="price-range">
                <input
                  type="number"
                  value={filters.priceRange[0]}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    priceRange: [Number(e.target.value), prev.priceRange[1]]
                  }))}
                  placeholder="Min"
                />
                <span>to</span>
                <input
                  type="number"
                  value={filters.priceRange[1]}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    priceRange: [prev.priceRange[0], Number(e.target.value)]
                  }))}
                  placeholder="Max"
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Availability</label>
              <select
                value={filters.availability}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  availability: e.target.value as any
                }))}
              >
                <option value="all">All</option>
                <option value="available">Available</option>
                <option value="sold">Sold</option>
              </select>
            </div>
          </div>
        )}

        <div className="search-results">
          {isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner" />
              <p>Searching...</p>
            </div>
          ) : query.length < 2 ? (
            <div className="empty-state">
              <Search size={48} className="empty-icon" />
              <p>Start typing to search across artworks, artists, catalogues, and lists</p>
            </div>
          ) : getFilteredResults().length === 0 ? (
            <div className="empty-state">
              <p>No results found for "{query}"</p>
              <p className="text-sm text-gray-500">Try different keywords or check your spelling</p>
            </div>
          ) : (
            <div className={`results-container ${viewMode === 'grid' ? 'grid-view' : 'list-view'}`}>
              {getFilteredResults().map(renderResult)}
            </div>
          )}
        </div>

        <div className="search-footer">
          <p className="search-hint">
            Press <kbd>Esc</kbd> to close • <kbd>Enter</kbd> to search
          </p>
        </div>
      </div>
    </div>
  );
};

export default CrossEntitySearch;
