import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Camera, Mic, X, TrendingUp, Sparkles, Image as ImageIcon } from 'lucide-react'
import { intelligentSearch, NaturalLanguageQuery, SearchResult, ImageSearchResult } from '../../services/intelligentSearch'
import { userPreferencesService } from '../../services/userPreferences'

interface IntelligentSearchProps {
  onSearchResults: (results: SearchResult[]) => void
  onImageSearchResults: (results: ImageSearchResult[]) => void
  placeholder?: string
  className?: string
  userId?: string
}

const IntelligentSearch: React.FC<IntelligentSearchProps> = ({
  onSearchResults,
  onImageSearchResults,
  placeholder = "Search with natural language...",
  className = "",
  userId
}) => {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [trendingSearches, setTrendingSearches] = useState<string[]>([])
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isProcessingImage, setIsProcessingImage] = useState(false)
  const [searchMode, setSearchMode] = useState<'text' | 'image' | 'voice'>('text')
  const [personalizedSuggestions, setPersonalizedSuggestions] = useState<string[]>([])
  
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadTrendingSearches()
    loadSearchHistory()
    if (userId) {
      loadPersonalizedSuggestions()
    }
  }, [userId])

  useEffect(() => {
    if (query.length > 2) {
      loadSuggestions(query)
    } else {
      setSuggestions([])
    }
  }, [query])

  const loadTrendingSearches = async () => {
    const trending = await intelligentSearch.getTrendingSearches()
    setTrendingSearches(trending)
  }

  const loadSearchHistory = useCallback(() => {
    // FIX: Conditionally access localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      const history = JSON.parse(localStorage.getItem('artflow_search_history') || '[]')
      setSearchHistory(history)
    }
  }, [])

  const saveSearchHistory = (searchQuery: string) => {
    // FIX: Conditionally access localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      const history = JSON.parse(localStorage.getItem('artflow_search_history') || '[]')
      const newHistory = [searchQuery, ...history.filter((item: string) => item !== searchQuery)].slice(0, 10)
      localStorage.setItem('artflow_search_history', JSON.stringify(newHistory))
      setSearchHistory(newHistory)
    }
  }

  const loadSuggestions = async (searchQuery: string) => {
    const suggestions = await intelligentSearch.getSearchSuggestions(searchQuery)
    setSuggestions(suggestions)
  }

  const loadPersonalizedSuggestions = async () => {
    if (!userId) return
    
    try {
      const personalized = await userPreferencesService.getPersonalizedSuggestions(userId, 8)
      setPersonalizedSuggestions(personalized)
    } catch (error) {
      console.error('Error loading personalized suggestions:', error)
    }
  }

  const handleTextSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setShowSuggestions(false)
    saveSearchHistory(searchQuery)

    try {
      const nlQuery = await intelligentSearch.processNaturalLanguageQuery(searchQuery)
      
      // Record search query for user preferences
      if (userId) {
        await userPreferencesService.recordSearchQuery(userId, searchQuery, {}, 0)
      }
      
      // Use comprehensive search that includes artworks, artists, and catalogues
      const results = await intelligentSearch.searchAll(nlQuery, 20)
      onSearchResults(results)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleImageSearch = async (file: File) => {
    setIsProcessingImage(true)
    setShowImageUpload(false)

    try {
      const results = await intelligentSearch.searchByImage(file)
      onImageSearchResults(results)
    } catch (error) {
      console.error('Image search error:', error)
    } finally {
      setIsProcessingImage(false)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      handleTextSearch(query)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    setShowSuggestions(false)
    handleTextSearch(suggestion)
  }

  const handleVoiceSearch = () => {
    // FIX: Conditionally access webkitSpeechRecognition
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        setSearchMode('voice')
        setIsSearching(true)
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setQuery(transcript)
        handleTextSearch(transcript)
      }

      recognition.onerror = () => {
        setIsSearching(false)
        setSearchMode('text')
      }

      recognition.onend = () => {
        setIsSearching(false)
        setSearchMode('text')
      }

      recognition.start()
    } else {
      console.warn('Web Speech API is not supported in this browser or environment.')
      toast.error('Voice search is not supported in this browser or environment.')
    }
  }

  const clearSearch = () => {
    setQuery('')
    setImageFile(null)
    setImagePreview(null)
    setShowImageUpload(false)
    setSearchMode('text')
    inputRef.current?.focus()
  }

  return (
    <div className={`intelligent-search ${className}`} style={{ position: 'relative', width: '100%' }}>
      <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--card)',
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {/* Search Icon */}
          <div style={{
            padding: 'var(--space-md)',
            color: 'var(--muted)',
            display: 'flex',
            alignItems: 'center'
          }}>
            {searchMode === 'image' ? <ImageIcon size={20} /> : <Search size={20} />}
          </div>

          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder={searchMode === 'image' ? 'Upload an image to search...' : placeholder}
            disabled={searchMode === 'image'}
            style={{
              flex: 1,
              padding: 'var(--space-md) 0',
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              color: 'var(--fg)',
              fontSize: '16px',
              fontFamily: 'inherit'
            }}
          />

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-xs)',
            padding: 'var(--space-sm)'
          }}>

            {/* Image Upload Button */}
            <button
              type="button"
              onClick={() => {
                setSearchMode('image')
                fileInputRef.current?.click()
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                border: 'none',
                backgroundColor: searchMode === 'image' ? 'var(--primary)' : 'transparent',
                color: searchMode === 'image' ? 'white' : 'var(--muted)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Search by image"
            >
              <Camera size={18} />
            </button>

            {/* Voice Search Button */}
            <button
              type="button"
              onClick={handleVoiceSearch}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                border: 'none',
                backgroundColor: searchMode === 'voice' ? 'var(--primary)' : 'transparent',
                color: searchMode === 'voice' ? 'white' : 'var(--muted)',
                borderRadius: 'var(--radius-sm)',
                cursor: isSearching || isProcessingImage ? 'not-allowed' : 'pointer',
                opacity: isSearching || isProcessingImage ? 0.6 : 1,
                transition: 'all 0.2s ease'
              }}
              title="Voice search"
            >
              <Mic size={18} />
            </button>

            {/* Clear Button */}
            {(query || imageFile) && (
              <button
                type="button"
                onClick={clearSearch}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--muted)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                title="Clear search"
              >
                <X size={18} />
              </button>
            )}

            {/* Search Button */}
            <button
              type="submit"
              disabled={isSearching || isProcessingImage}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                border: 'none',
                backgroundColor: 'var(--primary)',
                color: 'white',
                borderRadius: 'var(--radius-sm)',
                cursor: isSearching || isProcessingImage ? 'not-allowed' : 'pointer',
                opacity: isSearching || isProcessingImage ? 0.6 : 1,
                transition: 'all 0.2s ease'
              }}
              title="Search"
            >
              {isSearching || isProcessingImage ? (
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              ) : (
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid white',
                  borderTop: '2px solid transparent',
                  borderRight: '2px solid transparent',
                  borderRadius: '50%',
                  transform: 'rotate(-45deg)'
                }} />
              )}
            </button>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
      </form>

      {/* Image Preview */}
      {imagePreview && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          marginTop: 'var(--space-xs)',
          padding: 'var(--space-lg)',
          zIndex: 1000
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-md)',
            marginBottom: 'var(--space-md)'
          }}>
            <img
              src={imagePreview}
              alt="Preview"
              style={{
                width: '60px',
                height: '60px',
                objectFit: 'cover',
                borderRadius: 'var(--radius-sm)'
              }}
            />
            <div>
              <p style={{ margin: 0, fontWeight: '500', color: 'var(--fg)' }}>
                {imageFile?.name}
              </p>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--muted)' }}>
                Click search to find similar artworks
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <button
              onClick={() => handleImageSearch(imageFile!)}
              disabled={isProcessingImage}
              style={{
                padding: 'var(--space-sm) var(--space-lg)',
                backgroundColor: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: isProcessingImage ? 'not-allowed' : 'pointer',
                opacity: isProcessingImage ? 0.6 : 1,
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {isProcessingImage ? 'Processing...' : 'Search Similar Artworks'}
            </button>
            <button
              onClick={() => {
                setImageFile(null)
                setImagePreview(null)
                setSearchMode('text')
              }}
              style={{
                padding: 'var(--space-sm) var(--space-lg)',
                backgroundColor: 'transparent',
                color: 'var(--fg)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || searchHistory.length > 0 || trendingSearches.length > 0) && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          marginTop: 'var(--space-xs)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 1000,
          maxHeight: '400px',
          overflow: 'auto'
        }}>
          {/* Search History */}
          {searchHistory.length > 0 && (
            <div style={{ padding: 'var(--space-md)' }}>
              <h4 style={{
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--muted)',
                margin: '0 0 var(--space-sm) 0',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Recent Searches
              </h4>
              {searchHistory.slice(0, 3).map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(item)}
                  style={{
                    width: '100%',
                    padding: 'var(--space-sm)',
                    textAlign: 'left',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'var(--fg)',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--border)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div style={{ padding: 'var(--space-md)' }}>
              <h4 style={{
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--muted)',
                margin: '0 0 var(--space-sm) 0',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Suggestions
              </h4>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  style={{
                    width: '100%',
                    padding: 'var(--space-sm)',
                    textAlign: 'left',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'var(--fg)',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--border)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Trending Searches */}
          {trendingSearches.length > 0 && (
            <div style={{ padding: 'var(--space-md)' }}>
              <h4 style={{
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--muted)',
                margin: '0 0 var(--space-sm) 0',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-xs)'
              }}>
                <TrendingUp size={12} />
                Trending
              </h4>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--space-xs)'
              }}>
                {trendingSearches.slice(0, 6).map((trend, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(trend)}
                    style={{
                      padding: 'var(--space-xs) var(--space-sm)',
                      backgroundColor: 'var(--border)',
                      border: 'none',
                      color: 'var(--fg)',
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '12px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--primary)'
                      e.currentTarget.style.color = 'white'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--border)'
                      e.currentTarget.style.color = 'var(--fg)'
                    }}
                  >
                    {trend}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}


      {/* Search Mode Indicator */}
      {searchMode !== 'text' && (
        <div style={{
          position: 'absolute',
          top: '-8px',
          right: '8px',
          backgroundColor: 'var(--primary)',
          color: 'white',
          padding: '2px var(--space-xs)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '10px',
          fontWeight: '500',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          display: 'flex',
          alignItems: 'center',
          gap: '2px'
        }}>
          <Sparkles size={8} />
          {searchMode === 'image' ? 'Image Search' : 'Voice Search'}
        </div>
      )}
    </div>
  )
}

export default IntelligentSearch