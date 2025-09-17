import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { 
  Search, 
  TrendingUp, 
  Star, 
  Heart, 
  Eye, 
  Calendar, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  Users, 
  Palette,
  Award,
  BookOpen,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from "../../components/common/LoadingSpinner"
import Container from "../../components/common/Container"

interface Artwork {
  id: string
  title: string
  slug: string
  image_url: string
  primary_image_url: string
  price: number
  currency: string
  year: number
  medium: string
  status: string
  created_at: string
  view_count?: number
  like_count?: number
  artist: {
    id: string
    full_name: string
    display_name: string
    slug: string
    avatar_url: string
    location: string
  }
}

interface Artist {
  id: string
  full_name: string
  display_name: string
  slug: string
  avatar_url: string
  bio: string
  location: string
  created_at: string
  artwork_count: number
  followers_count?: number
  is_trending?: boolean
  is_emerging?: boolean
}

interface Catalogue {
  id: string
  title: string
  slug: string
  description: string
  cover_image_url: string
  artwork_count: number
  is_featured?: boolean
  created_at: string
  artist: {
    id: string
    full_name: string
    slug: string
  }
}

interface CommunityList {
  id: string
  title: string
  description: string
  curator: {
    full_name: string
    avatar_url: string
  }
  artwork_count: number
  likes_count: number
  is_public: boolean
}

const HomePage: React.FC = () => {
  const [trendingArtists, setTrendingArtists] = useState<Artist[]>([])
  const [featuredCatalogues, setFeaturedCatalogues] = useState<Catalogue[]>([])
  const [trendingArtworks, setTrendingArtworks] = useState<Artwork[]>([])
  const [curatedPicks, setCuratedPicks] = useState<Artwork[]>([])
  const [emergingArtists, setEmergingArtists] = useState<Artist[]>([])
  const [communityLists, setCommunityLists] = useState<CommunityList[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadHomePageData()
  }, [])

  const loadHomePageData = async () => {
    try {
      setLoading(true)
      
      // Load sections with error handling
      try {
        const artistsData = await loadTrendingArtists()
        setTrendingArtists(artistsData)
      } catch (error) {
        console.error('Failed to load trending artists:', error)
        setTrendingArtists([])
      }

      try {
        const cataloguesData = await loadFeaturedCatalogues()
        setFeaturedCatalogues(cataloguesData)
      } catch (error) {
        console.error('Failed to load featured catalogues:', error)
        setFeaturedCatalogues([])
      }

      try {
        const artworksData = await loadTrendingArtworks()
        setTrendingArtworks(artworksData)
      } catch (error) {
        console.error('Failed to load trending artworks:', error)
        setTrendingArtworks([])
      }

      try {
        const curatedData = await loadCuratedPicks()
        setCuratedPicks(curatedData)
      } catch (error) {
        console.error('Failed to load curated picks:', error)
        setCuratedPicks([])
      }

      try {
        const emergingData = await loadEmergingArtists()
        setEmergingArtists(emergingData)
      } catch (error) {
        console.error('Failed to load emerging artists:', error)
        setEmergingArtists([])
      }

      try {
        const communityData = await loadCommunityLists()
        setCommunityLists(communityData)
      } catch (error) {
        console.error('Failed to load community lists:', error)
        setCommunityLists([])
      }
    } catch (error) {
      console.error('Error loading homepage data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTrendingArtists = async (): Promise<Artist[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        display_name,
        slug,
        avatar_url,
        bio,
        location,
        created_at
      `)
      .eq('role', 'ARTIST')
      .order('created_at', { ascending: false })
      .limit(8)

    if (error) {
      console.error('Error loading trending artists:', error)
      return []
    }

    return (data || []).map(artist => ({
      ...artist,
      artwork_count: Math.floor(Math.random() * 20) + 1, // Simulate artwork count
      is_trending: Math.random() > 0.5 // Simulate trending logic
    }))
  }

  const loadFeaturedCatalogues = async (): Promise<Catalogue[]> => {
    try {
      const { data, error } = await supabase
        .from('catalogues')
        .select(`
          id,
          title,
          slug,
          description,
          cover_image_url,
          created_at,
          artist:profiles!catalogues_user_id_fkey(
            id,
            full_name,
            slug
          )
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(6)

      if (error) {
        console.error('Error loading featured catalogues:', error)
        return []
      }

      return (data || []).map(catalogue => ({
        ...catalogue,
        artwork_count: Math.floor(Math.random() * 20) + 5, // Simulate artwork count
        is_featured: Math.random() > 0.3
      }))
    } catch (error) {
      console.error('Error in loadFeaturedCatalogues:', error)
      return []
    }
  }

  const loadTrendingArtworks = async (): Promise<Artwork[]> => {
    try {
      const { data, error } = await supabase
        .from('artworks')
        .select(`
          id,
          title,
          slug,
          image_url,
          primary_image_url,
          price,
          currency,
          year,
          medium,
          status,
          created_at,
          artist:profiles!artworks_user_id_fkey(
            id,
            full_name,
            display_name,
            slug,
            avatar_url,
            location
          )
        `)
        .eq('status', 'Available')
        .order('created_at', { ascending: false })
        .limit(12)

      if (error) {
        console.error('Error loading trending artworks:', error)
        return []
      }

      return (data || []).map(artwork => ({
        ...artwork,
        view_count: Math.floor(Math.random() * 1000) + 50,
        like_count: Math.floor(Math.random() * 100) + 5
      }))
    } catch (error) {
      console.error('Error in loadTrendingArtworks:', error)
      return []
    }
  }

  const loadCuratedPicks = async (): Promise<Artwork[]> => {
    // For now, load a different set of artworks as curated picks
    const { data, error } = await supabase
      .from('artworks')
      .select(`
        id,
        title,
        slug,
        image_url,
        primary_image_url,
        price,
        currency,
        year,
        medium,
        status,
        created_at,
        artist:profiles!artworks_user_id_fkey(
          id,
          full_name,
          display_name,
          slug,
          avatar_url,
          location
        )
      `)
      .eq('status', 'Available')
      .order('price', { ascending: false })
      .limit(8)

    if (error) throw error
    return data || []
  }

  const loadEmergingArtists = async (): Promise<Artist[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        display_name,
        slug,
        avatar_url,
        bio,
        location,
        created_at
      `)
      .eq('role', 'ARTIST')
      .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()) // Last 90 days
      .order('created_at', { ascending: false })
      .limit(6)

    if (error) throw error

    return (data || []).map(artist => ({
      ...artist,
      artwork_count: Math.floor(Math.random() * 10) + 1,
      is_emerging: true
    }))
  }

  const loadCommunityLists = async (): Promise<CommunityList[]> => {
    // Mock community lists for now
    return [
      {
        id: '1',
        title: 'Abstract Expressionism Favorites',
        description: 'A collection of powerful abstract works',
        curator: {
          full_name: 'Sarah Chen',
          avatar_url: 'https://placehold.co/40x40'
        },
        artwork_count: 15,
        likes_count: 234,
        is_public: true
      },
      {
        id: '2',
        title: 'Emerging South African Artists',
        description: 'Discovering new talent from South Africa',
        curator: {
          full_name: 'Michael Johnson',
          avatar_url: 'https://placehold.co/40x40'
        },
        artwork_count: 22,
        likes_count: 189,
        is_public: true
      },
      {
        id: '3',
        title: 'Minimalist Masterpieces',
        description: 'Less is more - beautiful minimalist art',
        curator: {
          full_name: 'Emma Rodriguez',
          avatar_url: 'https://placehold.co/40x40'
        },
        artwork_count: 18,
        likes_count: 156,
        is_public: true
      }
    ]
  }

  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/artworks?search=${encodeURIComponent(searchQuery)}`
    }
  }

  if (loading) {
    return (
      <div className="home-page">
        <Container>
          <div className="page-loading">
            <LoadingSpinner size="lg" text="Loading amazing art..." />
          </div>
        </Container>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>ArtFlow - Discover Amazing Art</title>
        <meta name="description" content="Discover amazing artworks from talented artists around the world" />
      </Helmet>

      <div className="home-page">
        <Container>
          {/* Hero Section */}
          <div className="hero-section">
            <div className="hero-content">
              <h1 className="hero-title">
                Discover Amazing Art
                <Sparkles className="hero-icon" />
              </h1>
              <p className="hero-subtitle">
                Explore unique artworks from talented artists around the world
              </p>
              
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="hero-search">
                <div className="search-bar">
                  <Search size={20} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search artworks, artists, or collections..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                </div>
                <button type="submit" className="search-btn">
                  <Search size={18} />
                </button>
              </form>
            </div>
          </div>

          {/* Trending Artists Section */}
          <section className="home-section">
            <div className="section-header">
              <h2 className="section-title">
                <TrendingUp size={24} />
                Trending Artists
              </h2>
              <Link to="/artists" className="view-all-btn">
                View All <ArrowRight size={16} />
              </Link>
            </div>
            <div className="artists-carousel">
              {trendingArtists.map((artist) => (
                <div key={artist.id} className="artist-card">
                  <Link to={`/artist/${artist.slug}`}>
                    <div className="artist-avatar">
                      <img 
                        src={artist.avatar_url || 'https://placehold.co/80x80'} 
                        alt={artist.full_name}
                      />
                      {artist.is_trending && (
                        <div className="trending-badge">
                          <TrendingUp size={12} />
                        </div>
                      )}
                    </div>
                    <div className="artist-info">
                      <h3 className="artist-name">{artist.full_name}</h3>
                      <p className="artist-location">{artist.location}</p>
                      <p className="artist-stats">{artist.artwork_count} artworks</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* Featured Catalogues Section */}
          <section className="home-section">
            <div className="section-header">
              <h2 className="section-title">
                <BookOpen size={24} />
                Featured Catalogues
              </h2>
              <Link to="/catalogues" className="view-all-btn">
                View All <ArrowRight size={16} />
              </Link>
            </div>
            <div className="catalogues-carousel">
              {featuredCatalogues.map((catalogue) => (
                <div key={catalogue.id} className="catalogue-card">
                  <Link to={`/catalogue/${catalogue.slug}`}>
                    <div className="catalogue-image">
                      <img 
                        src={catalogue.cover_image_url || 'https://placehold.co/300x200'} 
                        alt={catalogue.title}
                      />
                      {catalogue.is_featured && (
                        <div className="featured-badge">
                          <Star size={12} />
                          Featured
                        </div>
                      )}
                    </div>
                    <div className="catalogue-info">
                      <h3 className="catalogue-title">{catalogue.title}</h3>
                      <p className="catalogue-artist">by {catalogue.artist.full_name}</p>
                      <p className="catalogue-stats">{catalogue.artwork_count} artworks</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* Trending Artworks Section */}
          <section className="home-section">
            <div className="section-header">
              <h2 className="section-title">
                <Eye size={24} />
                Trending Artworks
              </h2>
              <Link to="/artworks?sort=trending" className="view-all-btn">
                View All <ArrowRight size={16} />
              </Link>
            </div>
            <div className="artworks-carousel">
              {trendingArtworks.slice(0, 8).map((artwork) => (
                <div key={artwork.id} className="artwork-card-small">
                  <Link to={`/artwork/${artwork.slug}`}>
                    <div className="artwork-image">
                      <img 
                        src={artwork.primary_image_url || artwork.image_url || 'https://placehold.co/250x250'} 
                        alt={artwork.title}
                      />
                      <div className="artwork-overlay">
                        <div className="artwork-stats">
                          <span><Eye size={12} /> {artwork.view_count}</span>
                          <span><Heart size={12} /> {artwork.like_count}</span>
                        </div>
                      </div>
                    </div>
                    <div className="artwork-info">
                      <h3 className="artwork-title">{artwork.title}</h3>
                      <p className="artwork-artist">{artwork.artist.full_name}</p>
                      <p className="artwork-price">
                        {artwork.price > 0 ? formatPrice(artwork.price, artwork.currency) : 'Price on Request'}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* Curated Picks Section */}
          <section className="home-section">
            <div className="section-header">
              <h2 className="section-title">
                <Award size={24} />
                Curated Picks
              </h2>
              <Link to="/artworks?curated=true" className="view-all-btn">
                View All <ArrowRight size={16} />
              </Link>
            </div>
            <div className="artworks-carousel">
              {curatedPicks.map((artwork) => (
                <div key={artwork.id} className="artwork-card-small">
                  <Link to={`/artwork/${artwork.slug}`}>
                    <div className="artwork-image">
                      <img 
                        src={artwork.primary_image_url || artwork.image_url || 'https://placehold.co/250x250'} 
                        alt={artwork.title}
                      />
                      <div className="curated-badge">
                        <Award size={12} />
                        Curated
                      </div>
                    </div>
                    <div className="artwork-info">
                      <h3 className="artwork-title">{artwork.title}</h3>
                      <p className="artwork-artist">{artwork.artist.full_name}</p>
                      <p className="artwork-price">
                        {artwork.price > 0 ? formatPrice(artwork.price, artwork.currency) : 'Price on Request'}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* Emerging Artists Section */}
          <section className="home-section">
            <div className="section-header">
              <h2 className="section-title">
                <Sparkles size={24} />
                Emerging Artists
              </h2>
              <Link to="/artists?emerging=true" className="view-all-btn">
                View All <ArrowRight size={16} />
              </Link>
            </div>
            <div className="artists-carousel">
              {emergingArtists.map((artist) => (
                <div key={artist.id} className="artist-card">
                  <Link to={`/artist/${artist.slug}`}>
                    <div className="artist-avatar">
                      <img 
                        src={artist.avatar_url || 'https://placehold.co/80x80'} 
                        alt={artist.full_name}
                      />
                      <div className="emerging-badge">
                        <Sparkles size={12} />
                        New
                      </div>
                    </div>
                    <div className="artist-info">
                      <h3 className="artist-name">{artist.full_name}</h3>
                      <p className="artist-location">{artist.location}</p>
                      <p className="artist-stats">{artist.artwork_count} artworks</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* Community Lists Section */}
          <section className="home-section">
            <div className="section-header">
              <h2 className="section-title">
                <Users size={24} />
                Community Lists
              </h2>
              <Link to="/community" className="view-all-btn">
                View All <ArrowRight size={16} />
              </Link>
            </div>
            <div className="community-lists">
              {communityLists.map((list) => (
                <div key={list.id} className="community-list-card">
                  <div className="list-header">
                    <div className="curator-info">
                      <img 
                        src={list.curator.avatar_url} 
                        alt={list.curator.full_name}
                        className="curator-avatar"
                      />
                      <span className="curator-name">{list.curator.full_name}</span>
                    </div>
                    <div className="list-stats">
                      <Heart size={14} /> {list.likes_count}
                    </div>
                  </div>
                  <div className="list-content">
                    <h3 className="list-title">{list.title}</h3>
                    <p className="list-description">{list.description}</p>
                    <p className="list-count">{list.artwork_count} artworks</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </Container>
      </div>
    </>
  )
}

export default HomePage