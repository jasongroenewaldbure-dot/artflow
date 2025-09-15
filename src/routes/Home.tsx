import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { fetchArtworks, type ArtworkRow } from '@/services/data'

export default function Home() {
  const [items, setItems] = useState<ArtworkRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    ;(async () => {
      try {
        const data = await fetchArtworks()
        setItems(data)
      } catch (e: any) {
        setError(e.message || 'Failed to load')
      } finally {
        setLoading(false)
      }
    })()
  }, [])
  return (
    <div className="home-page-container">
      <Helmet>
        <title>Home | ArtFlow</title>
      </Helmet>
      <h1 className="home-page-title">Discover Art</h1>
      {loading && <div className="home-loading">Loading…</div>}
      {error && <div className="home-error">{error}</div>}
      <div className="home-artworks-grid">
        {items.map((a) => (
          <Link key={a.id} to={`/artwork/${a.id}`} className="home-artwork-card">
            {a.primary_image_url ? (
              <img src={a.primary_image_url} alt={a.title ?? 'Artwork'} className="home-artwork-image" />
            ) : (
              <div className="home-artwork-image-placeholder">No Image</div>
            )}
            <div className="home-artwork-title">{a.title ?? 'Untitled'}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}

