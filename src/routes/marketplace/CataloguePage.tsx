import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { fetchCatalogueBySlugs, fetchArtworkBySlugs } from '@/services/data'
import { parseFriendlyUrl } from '@/utils/slug'
import { Heart, Share2, Eye, Calendar, User, Globe, Lock, Users, Mail } from 'lucide-react'
import toast from 'react-hot-toast'

interface CatalogueItem {
  id: string
  position: number
  artwork: {
    id: string
    title: string
    slug: string
    price: number | null
    primary_image_url: string | null
    status: string
  }
}

interface Catalogue {
  id: string
  title: string
  slug: string
  description: string | null
  cover_image_url: string | null
  is_public: boolean
  access_mode: 'public' | 'password' | 'whitelist' | 'private'
  password: string | null
  created_at: string
  updated_at: string
  artist: {
    id: string
    slug: string
    full_name: string
    avatar_url: string | null
    bio: string | null
  }
  items: CatalogueItem[]
}

const CataloguePage: React.FC = () => {
  const { artistSlug, catalogueSlug, id } = useParams()
  const navigate = useNavigate()
  const [catalogue, setCatalogue] = useState<Catalogue | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    const loadCatalogue = async () => {
      try {
        setLoading(true)
        setError(null)

        let catalogueData: Catalogue

        if (artistSlug && catalogueSlug) {
          // Friendly URL: /artist-slug/catalogue/catalogue-slug
          catalogueData = await fetchCatalogueBySlugs(artistSlug, catalogueSlug)
        } else if (id) {
          // Fallback URL: /catalogue/id
          // For now, we'll need to implement a fallback function
          throw new Error('Fallback URL not implemented yet')
        } else {
          // Redirect to home if no valid parameters
          navigate('/', { replace: true })
          return
        }

        setCatalogue(catalogueData)

        // Check if catalogue requires password
        if (catalogueData.access_mode === 'password' && !catalogueData.is_public) {
          setShowPasswordForm(true)
        }

      } catch (err: any) {
        console.error('Error loading catalogue:', err)
        setError(err.message || 'Failed to load catalogue')
      } finally {
        setLoading(false)
      }
    }

    loadCatalogue()
  }, [artistSlug, catalogueSlug, id, navigate])

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (catalogue && password === catalogue.password) {
      setShowPasswordForm(false)
      toast.success('Access granted!')
    } else {
      toast.error('Incorrect password')
    }
  }

  const handleLike = async () => {
    if (!catalogue) return
    
    try {
      // TODO: Implement like functionality
      setIsLiked(!isLiked)
      toast.success(isLiked ? 'Removed from favorites' : 'Added to favorites')
    } catch (err) {
      toast.error('Failed to update favorites')
    }
  }

  const handleShare = async () => {
    if (!catalogue) return

    try {
      const url = window.location.href
      if (navigator.share) {
        await navigator.share({
          title: catalogue.title,
          text: catalogue.description || '',
          url: url
        })
      } else {
        await navigator.clipboard.writeText(url)
        toast.success('Link copied to clipboard!')
      }
    } catch (err) {
      toast.error('Failed to share catalogue')
    }
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        flexDirection: 'column',
        gap: 'var(--space-lg)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--border)',
          borderTop: '3px solid var(--primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: 'var(--muted)', fontSize: '16px' }}>Loading catalogue...</p>
      </div>
    )
  }

  if (error || !catalogue) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        flexDirection: 'column',
        gap: 'var(--space-lg)'
      }}>
        <h1 style={{ fontSize: '24px', color: 'var(--fg)' }}>Catalogue Not Found</h1>
        <p style={{ color: 'var(--muted)' }}>{error || 'The catalogue you\'re looking for doesn\'t exist.'}</p>
        <Link to="/" className="brush-button primary">
          Return Home
        </Link>
      </div>
    )
  }

  if (showPasswordForm) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        padding: 'var(--space-xl)'
      }}>
        <div style={{
          backgroundColor: 'var(--card)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-2xl)',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center'
        }}>
          <Lock size={48} style={{ color: 'var(--primary)', margin: '0 auto var(--space-lg)' }} />
          <h2 style={{ fontSize: '24px', marginBottom: 'var(--space-md)', color: 'var(--fg)' }}>
            Password Required
          </h2>
          <p style={{ color: 'var(--muted)', marginBottom: 'var(--space-xl)' }}>
            This catalogue is password protected. Please enter the password to view it.
          </p>
          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                padding: 'var(--space-md)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-alt)',
                color: 'var(--fg)',
                fontSize: '16px',
                outline: 'none'
              }}
            />
            <button type="submit" className="brush-button primary">
              Access Catalogue
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      <Helmet>
        <title>{catalogue.title} | {catalogue.artist.full_name} | ArtFlow</title>
        <meta name="description" content={catalogue.description || `Catalogue by ${catalogue.artist.full_name}`} />
        <meta property="og:title" content={catalogue.title} />
        <meta property="og:description" content={catalogue.description || `Catalogue by ${catalogue.artist.full_name}`} />
        <meta property="og:image" content={catalogue.cover_image_url || ''} />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Header */}
      <div style={{
        backgroundColor: 'var(--card)',
        borderBottom: '1px solid var(--border)',
        padding: 'var(--space-xl) 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 var(--space-lg)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
            <Link
              to={`/artist/${catalogue.artist.slug}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)',
                textDecoration: 'none',
                color: 'var(--muted)',
                fontSize: '14px'
              }}
            >
              <User size={16} />
              {catalogue.artist.full_name}
            </Link>
            <span style={{ color: 'var(--border)', fontSize: '14px' }}>/</span>
            <span style={{ color: 'var(--fg)', fontSize: '14px' }}>Catalogue</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <h1 style={{
                fontSize: '32px',
                fontWeight: '700',
                color: 'var(--fg)',
                margin: '0 0 var(--space-md) 0',
                lineHeight: '1.2'
              }}>
                {catalogue.title}
              </h1>
              
              {catalogue.description && (
                <p style={{
                  fontSize: '16px',
                  color: 'var(--muted)',
                  margin: '0 0 var(--space-lg) 0',
                  lineHeight: '1.6'
                }}>
                  {catalogue.description}
                </p>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                  <Eye size={16} style={{ color: 'var(--muted)' }} />
                  <span style={{ fontSize: '14px', color: 'var(--muted)' }}>
                    {catalogue.items.length} artwork{catalogue.items.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                  <Calendar size={16} style={{ color: 'var(--muted)' }} />
                  <span style={{ fontSize: '14px', color: 'var(--muted)' }}>
                    {new Date(catalogue.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                  {catalogue.access_mode === 'public' ? (
                    <Globe size={16} style={{ color: 'var(--success)' }} />
                  ) : (
                    <Lock size={16} style={{ color: 'var(--warning)' }} />
                  )}
                  <span style={{ fontSize: '14px', color: 'var(--muted)' }}>
                    {catalogue.access_mode === 'public' ? 'Public' : 'Private'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <button
                onClick={handleLike}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-xs)',
                  padding: 'var(--space-sm) var(--space-md)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isLiked ? 'var(--primary)' : 'var(--card)',
                  color: isLiked ? 'white' : 'var(--fg)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
                {isLiked ? 'Liked' : 'Like'}
              </button>
              <button
                onClick={handleShare}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-xs)',
                  padding: 'var(--space-sm) var(--space-md)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--card)',
                  color: 'var(--fg)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Share2 size={16} />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Artworks Grid */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'var(--space-2xl) var(--space-lg)'
      }}>
        {catalogue.items.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 'var(--space-xl)'
          }}>
            {catalogue.items
              .sort((a, b) => a.position - b.position)
              .map((item) => (
                <Link
                  key={item.id}
                  to={`/artist/${catalogue.artist.slug}/${item.artwork.slug}`}
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'block'
                  }}
                >
                  <div style={{
                    backgroundColor: 'var(--card)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  >
                    {item.artwork.primary_image_url ? (
                      <div style={{
                        width: '100%',
                        height: '300px',
                        backgroundImage: `url(${item.artwork.primary_image_url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundColor: 'var(--bg-alt)'
                      }} />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '300px',
                        backgroundColor: 'var(--bg-alt)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--muted)'
                      }}>
                        No Image
                      </div>
                    )}
                    
                    <div style={{ padding: 'var(--space-lg)' }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: 'var(--fg)',
                        margin: '0 0 var(--space-sm) 0',
                        lineHeight: '1.3'
                      }}>
                        {item.artwork.title || 'Untitled'}
                      </h3>
                      
                      {item.artwork.price && (
                        <p style={{
                          fontSize: '16px',
                          fontWeight: '500',
                          color: 'var(--primary)',
                          margin: '0 0 var(--space-sm) 0'
                        }}>
                          ${item.artwork.price.toLocaleString()}
                        </p>
                      )}
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-xs)',
                        fontSize: '14px',
                        color: 'var(--muted)'
                      }}>
                        <span style={{
                          padding: '2px 8px',
                          backgroundColor: item.artwork.status === 'available' ? 'var(--success-bg)' : 'var(--warning-bg)',
                          color: item.artwork.status === 'available' ? 'var(--success)' : 'var(--warning)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {item.artwork.status === 'available' ? 'Available' : 'Sold'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: 'var(--space-3xl) 0',
            color: 'var(--muted)'
          }}>
            <h3 style={{ fontSize: '20px', marginBottom: 'var(--space-md)' }}>
              No artworks in this catalogue yet
            </h3>
            <p>Check back later for new additions.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CataloguePage
