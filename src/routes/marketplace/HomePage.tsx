import React from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/autoplay'
import Container from '@/components/ui/Container'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ErrorMessage from '@/components/ui/ErrorMessage'
import Icon from '@/components/icons/Icon'

// Types for the data we'll fetch
interface Artwork {
  id: string
  title: string | null
  slug: string
  price: number | null
  currency: string | null
  primary_image_url: string | null
  created_at: string
  artist: {
    id: string
    name: string
    slug: string
  }
}

interface Catalogue {
  id: string
  title: string | null
  slug: string
  description: string | null
  cover_image_url: string | null
  created_at: string
  artist: {
    id: string
    name: string
    slug: string
  }
}

interface Artist {
  id: string
    name: string
    slug: string
  bio: string | null
  location: string | null
  created_at: string
}

// Constants for fetch limits
const ARTWORK_LIMIT = 10
const CATALOGUE_LIMIT = 8
const ARTIST_LIMIT = 8

// Data fetching functions
const fetchFeaturedArtworks = async (): Promise<Artwork[]> => {
  const { data, error } = await supabase
          .from('artworks')
          .select(`
      id, title, slug, price, currency, primary_image_url, created_at, user_id
          `)
          .eq('status', 'available')
    .not('primary_image_url', 'is', null)
    .order('created_at', { ascending: false })
    .limit(ARTWORK_LIMIT)

  if (error) throw error

  // Get artist data
  const userIds = [...new Set((data || []).map(artwork => artwork.user_id))]
  const { data: artistsData } = await supabase
    .from('profiles')
    .select('id, full_name, slug')
    .in('id', userIds)

  const artistMap = new Map(artistsData?.map(artist => [artist.id, artist]) || [])

  return (data || []).map(artwork => {
    const artist = artistMap.get(artwork.user_id)
    return {
      ...artwork,
            artist: {
        id: artist?.id || artwork.user_id,
        name: artist?.name || 'Unknown Artist',
        slug: artist?.slug || ''
      }
    }
  })
}

const fetchFeaturedCatalogues = async (): Promise<Catalogue[]> => {
  const { data, error } = await supabase
          .from('catalogues')
          .select(`
      id, title, slug, description, cover_image_url, created_at, user_id
          `)
          .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(CATALOGUE_LIMIT)

  if (error) throw error

  // Get artist data
  const userIds = [...new Set((data || []).map(catalogue => catalogue.user_id))]
  const { data: artistsData } = await supabase
    .from('profiles')
    .select('id, full_name, slug')
    .in('id', userIds)

  const artistMap = new Map(artistsData?.map(artist => [artist.id, artist]) || [])

  return (data || []).map(catalogue => {
    const artist = artistMap.get(catalogue.user_id)
    return {
      ...catalogue,
            artist: {
        id: artist?.id || catalogue.user_id,
        name: artist?.name || 'Unknown Artist',
        slug: artist?.slug || ''
      }
    }
  })
}

const fetchFeaturedArtists = async (): Promise<Artist[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, slug, bio, location, created_at')
    .eq('role', 'ARTIST')
    .not('full_name', 'is', null)
    .order('created_at', { ascending: false })
    .limit(ARTIST_LIMIT)

  if (error) throw error

  return data || []
}

// Card Components
const ArtworkCard = ({ item }: { item: Artwork }) => (
  <Link to={`/artwork/${item.id}`} className="artwork-card">
    <div className="artwork-image">
      <img
        src={item.primary_image_url || '/api/placeholder/400/400'}
        alt={item.title || 'Artwork'}
        loading="lazy"
      />
    </div>
    <div className="artwork-info">
      <h4 className="artwork-title">{item.title || 'Untitled'}</h4>
      <p className="artwork-artist">
        <Link to={`/artist/${item.artist.slug}`}>
          {item.artist.name}
        </Link>
      </p>
      {item.price && (
        <p className="artwork-price">
          {item.currency} {item.price.toLocaleString()}
        </p>
      )}
    </div>
  </Link>
)

const CatalogueCard = ({ item }: { item: Catalogue }) => (
  <Link to={`/catalogue/${item.id}`} className="catalogue-card">
    <div className="catalogue-image">
      <img
        src={item.cover_image_url || '/api/placeholder/400/300'}
        alt={item.title || 'Catalogue'}
        loading="lazy"
      />
    </div>
    <div className="catalogue-info">
      <h4 className="catalogue-title">{item.title || 'Untitled Catalogue'}</h4>
      <p className="catalogue-artist">
        <Link to={`/artist/${item.artist.slug}`}>
          {item.artist.name}
        </Link>
      </p>
      {item.description && (
        <p className="catalogue-description">{item.description}</p>
      )}
    </div>
  </Link>
)

const ArtistCard = ({ item }: { item: Artist }) => (
  <Link to={`/artist/${item.slug}`} className="artist-card">
    <div className="artist-avatar">
      <img
        src="/api/placeholder/200/200"
        alt={item.name}
        loading="lazy"
      />
    </div>
    <div className="artist-info">
      <h4 className="artist-name">{item.name}</h4>
      {item.location && (
        <p className="artist-location">{item.location}</p>
      )}
      {item.bio && (
        <p className="artist-bio">{item.bio}</p>
      )}
    </div>
  </Link>
)

// Content Carousel Component
const ContentCarousel = ({
  title,
  data,
  isLoading,
  isError,
  error,
  renderCard,
  browseAllLink
}: {
  title: string
  data: any[] | undefined
  isLoading: boolean
  isError: boolean
  error: Error | null
  renderCard: (item: any) => React.ReactNode
  browseAllLink: string
}) => (
  <section className="carousel-section">
    <div className="carousel-header">
      <h2 className="carousel-title">{title}</h2>
        <Link to={browseAllLink} className="browse-all-link">
          Browse All <span className="icon-arrow-right"></span>
        </Link>
    </div>
    
    {isLoading ? (
      <div className="carousel-loading">
        <LoadingSpinner size="lg" />
        <p>Loading {title.toLowerCase()}...</p>
      </div>
    ) : isError ? (
      <ErrorMessage 
        message={`Error loading ${title.toLowerCase()}: ${error?.message || 'Please try again later.'}`}
        onRetry={() => window.location.reload()}
      />
    ) : data && data.length > 0 ? (
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={24}
        slidesPerView={1.5}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        breakpoints={{
          640: { slidesPerView: 2.5, spaceBetween: 24 },
          768: { slidesPerView: 3, spaceBetween: 24 },
          1024: { slidesPerView: 4, spaceBetween: 30 },
          1280: { slidesPerView: 5, spaceBetween: 30 },
        }}
        className="content-swiper"
      >
        {data.map(item => (
          <SwiperSlide key={item.id}>{renderCard(item)}</SwiperSlide>
        ))}
      </Swiper>
    ) : (
      <div className="carousel-empty">
        <span className="icon-info"></span>
        <p>No {title.toLowerCase()} found at the moment. Check back later!</p>
      </div>
    )}
  </section>
)

// Feature Card Component
const FeatureCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode
  title: string
  description: string 
}) => (
  <div className="feature-card">
    <div className="feature-icon">{icon}</div>
    <h3 className="feature-title">{title}</h3>
    <p className="feature-description">{description}</p>
      </div>
    )

// Main HomePage Component
const HomePage: React.FC = () => {
  const { data: featuredArtworks, isLoading: isLoadingArtworks, isError: isErrorArtworks, error: errorArtworks } = useQuery<Artwork[], Error>({
    queryKey: ['featuredArtworks'],
    queryFn: fetchFeaturedArtworks,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const { data: featuredCatalogues, isLoading: isLoadingCatalogues, isError: isErrorCatalogues, error: errorCatalogues } = useQuery<Catalogue[], Error>({
    queryKey: ['featuredCatalogues'],
    queryFn: fetchFeaturedCatalogues,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const { data: featuredArtists, isLoading: isLoadingArtists, isError: isErrorArtists, error: errorArtists } = useQuery<Artist[], Error>({
    queryKey: ['featuredArtists'],
    queryFn: fetchFeaturedArtists,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  return (
    <div className="home-page">
      <Helmet>
        <title>ArtFlow - Discover, Buy, and Sell Art</title>
        <meta name="description" content="The essential platform for artists to manage their inventory, build their brand, and connect with serious collectors." />
      </Helmet>

      <Container>
      {/* Hero Section */}
        <header className="hero-section">
          <h1 className="hero-title">Art, sorted</h1>
          <p className="hero-subtitle">
            The essential platform for artists to manage their inventory, build their brand, and connect with serious collectors.
          </p>
          <div className="hero-actions">
            <Link to="/start" className="btn btn-primary btn-lg">
              Get Started
            </Link>
            <Link to="/artworks" className="btn btn-outline btn-lg">
              Browse Artworks
            </Link>
          </div>
        </header>

      {/* Featured Artworks */}
        <ContentCarousel
          title="Featured Artworks"
          data={featuredArtworks}
          isLoading={isLoadingArtworks}
          isError={isErrorArtworks}
          error={errorArtworks}
          renderCard={item => <ArtworkCard item={item} />}
          browseAllLink="/artworks"
        />

        {/* Featured Catalogues */}
        <ContentCarousel
          title="Featured Catalogues"
          data={featuredCatalogues}
          isLoading={isLoadingCatalogues}
          isError={isErrorCatalogues}
          error={errorCatalogues}
          renderCard={item => <CatalogueCard item={item} />}
          browseAllLink="/catalogues"
        />

      {/* Featured Artists */}
        <ContentCarousel
          title="Featured Artists"
          data={featuredArtists}
          isLoading={isLoadingArtists}
          isError={isErrorArtists}
          error={errorArtists}
          renderCard={item => <ArtistCard item={item} />}
          browseAllLink="/artists"
        />

        {/* Features Section */}
        <section className="features-section">
          <h2 className="features-title">Why Choose ArtFlow?</h2>
          <div className="features-grid">
            <FeatureCard
              icon={<Icon name="palette" size={32} />}
              title="Artist Tools"
              description="Comprehensive inventory management, digital catalogues, and sales tracking tools designed specifically for artists."
            />
            <FeatureCard
              icon={<Icon name="bar-chart" size={32} />}
              title="Analytics & Insights"
              description="Track your sales, understand your audience, and make data-driven decisions about your art business."
            />
            <FeatureCard
              icon={<Icon name="message" size={32} />}
              title="Collector Connections"
              description="Build meaningful relationships with collectors through direct messaging and personalized catalogue sharing."
            />
            <FeatureCard
              icon={<Icon name="shield-check" size={32} />}
              title="Secure & Professional"
              description="Enterprise-grade security with professional presentation tools to showcase your work at its best."
            />
            </div>
        </section>

      {/* CTA Section */}
        <section className="cta-section">
          <h2>Ready to Take Control of Your Art Career?</h2>
          <p>Join a community of professional artists and discerning collectors today.</p>
          <div className="cta-actions">
            <Link to="/start" className="btn btn-primary btn-lg">
              Get Started For Free
            </Link>
            <Link to="/artworks" className="btn btn-outline btn-lg">
              Explore Artworks
            </Link>
        </div>
      </section>
      </Container>
    </div>
  )
}

export default HomePage