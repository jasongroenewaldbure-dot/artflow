import { Helmet } from 'react-helmet-async'
import { useSearchParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Search, Filter, SlidersHorizontal } from 'lucide-react'
import { searchArtworks, type ArtworkRow } from '@/services/data'
import AdvancedSearch from '@/components/search/AdvancedSearch'

export default function Search() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const [items, setItems] = useState<ArtworkRow[]>([])
  const [loading, setLoading] = useState(false)
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const data = await searchArtworks(q)
        setItems(data)
      } finally {
        setLoading(false)
      }
    })()
  }, [q])

  const handleAdvancedSearch = (filters: any) => {
    // TODO: Implement advanced search with filters
    console.log('Advanced search filters:', filters)
    setShowAdvancedSearch(false)
  }

  return (
    <div className="search-page-container">
      <Helmet>
        <title>Search | ArtFlow</title>
        <meta name="description" content="Search for artworks, artists, and galleries on ArtFlow" />
      </Helmet>
      
      <h1 className="search-page-title">Search</h1>
      
      {/* Search Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={20} style={{
            position: 'absolute',
            left: 'var(--space-sm)',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--muted)'
          }} />
          <input
            className="search-input"
            style={{ paddingLeft: '40px' }}
            value={q}
            onChange={(e) => setParams({ q: e.target.value })}
            placeholder="Search artists, artworks, galleries…"
          />
        </div>
        
        <button
          onClick={() => setShowAdvancedSearch(true)}
          style={{
            padding: 'var(--space-sm) var(--space-md)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg)',
            color: 'var(--fg)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-xs)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-alt)'
            e.currentTarget.style.borderColor = 'var(--primary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg)'
            e.currentTarget.style.borderColor = 'var(--border)'
          }}
        >
          <SlidersHorizontal size={16} />
          Filters
        </button>
      </div>

      {loading && <div className="search-loading">Loading…</div>}
      
      <div className="search-results-grid">
        {items.map((a) => (
          <Link key={a.id} to={`/artwork/${a.id}`} className="search-result-card">
            {a.primary_image_url ? (
              <img 
                src={a.primary_image_url} 
                alt={a.title ?? 'Artwork'} 
                className="search-result-image"
              />
            ) : (
              <div className="search-result-image" />
            )}
            <div className="search-result-title">{a.title ?? 'Untitled'}</div>
          </Link>
        ))}
      </div>

      {showAdvancedSearch && (
        <AdvancedSearch
          onSearch={handleAdvancedSearch}
          onClose={() => setShowAdvancedSearch(false)}
          initialFilters={{ query: q }}
        />
      )}
    </div>
  )
}

