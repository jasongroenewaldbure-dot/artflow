import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useSearchParams } from 'react-router-dom'
import { 
  X, 
  Plus, 
  Minus, 
  RotateCcw, 
  Share2, 
  Download, 
  Heart, 
  ShoppingBag, 
  Eye, 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  MapPin, 
  Palette, 
  Ruler, 
  Award, 
  Star, 
  CheckCircle, 
  AlertCircle, 
  Info,
  ArrowRight,
  ArrowLeft,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download as DownloadIcon,
  Share,
  Bookmark,
  MessageSquare,
  Phone,
  Mail,
  ExternalLink
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthProvider'
import toast from 'react-hot-toast'

interface Artwork {
  id: string
  title: string
  artist_name: string
  artist_slug: string
  price: number
  currency: string
  medium: string
  genre: string
  dimensions: string
  year_created: number
  primary_image_url: string
  description: string
  provenance: string
  condition: string
  exhibition_history: string[]
  literature: string[]
  certificates: string[]
  is_available: boolean
  is_for_sale: boolean
  created_at: string
  updated_at: string
  views_count: number
  likes_count: number
  shares_count: number
  inquiries_count: number
  market_value?: number
  appreciation_rate?: number
  similar_artworks?: Artwork[]
  artist_bio?: string
  artist_exhibitions?: string[]
  artist_awards?: string[]
}

interface ComparisonMetrics {
  price_difference: number
  price_difference_percentage: number
  size_comparison: string
  medium_similarity: number
  genre_similarity: number
  year_difference: number
  market_value_comparison: string
  condition_comparison: string
  provenance_comparison: string
  exhibition_comparison: string
  overall_similarity: number
}

const ArtworkComparison: React.FC = () => {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(false)
  const [comparisonMetrics, setComparisonMetrics] = useState<ComparisonMetrics | null>(null)
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'detailed'>('grid')
  const [showMetrics, setShowMetrics] = useState(true)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    const artworkIds = searchParams.get('ids')?.split(',') || []
    if (artworkIds.length > 0) {
      loadArtworks(artworkIds)
    }
  }, [searchParams])

  useEffect(() => {
    if (artworks.length >= 2) {
      calculateComparisonMetrics()
    }
  }, [artworks])

  const loadArtworks = async (artworkIds: string[]) => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('artworks')
        .select(`
          *,
          profiles!artworks_user_id_fkey(
            name,
            bio,
            slug
          )
        `)
        .in('id', artworkIds)

      if (error) throw error

      const transformedArtworks: Artwork[] = data?.map(artwork => ({
        id: artwork.id,
        title: artwork.title,
        artist_name: artwork.profiles?.name || 'Unknown Artist',
        artist_slug: artwork.profiles?.slug || '',
        price: artwork.price,
        currency: artwork.currency || 'ZAR',
        medium: artwork.medium,
        genre: artwork.genre,
        dimensions: artwork.dimensions,
        year_created: artwork.year_created,
        primary_image_url: artwork.primary_image_url,
        description: artwork.description,
        provenance: artwork.provenance,
        condition: artwork.condition || 'excellent',
        exhibition_history: artwork.exhibition_history || [],
        literature: artwork.literature || [],
        certificates: artwork.certificates || [],
        is_available: artwork.status === 'available',
        is_for_sale: artwork.is_for_sale || false,
        created_at: artwork.created_at,
        updated_at: artwork.updated_at,
        views_count: artwork.views_count || 0,
        likes_count: artwork.likes_count || 0,
        shares_count: artwork.shares_count || 0,
        inquiries_count: artwork.inquiries_count || 0,
        market_value: artwork.market_value,
        appreciation_rate: artwork.appreciation_rate,
        artist_bio: artwork.profiles?.bio,
        artist_exhibitions: [],
        artist_awards: []
      })) || []

      setArtworks(transformedArtworks)
    } catch (error) {
      console.error('Error loading artworks:', error)
      toast.error('Failed to load artworks for comparison')
    } finally {
      setLoading(false)
    }
  }

  const calculateComparisonMetrics = () => {
    if (artworks.length < 2) return

    const [artwork1, artwork2] = artworks

    // Price comparison
    const priceDifference = artwork2.price - artwork1.price
    const priceDifferencePercentage = artwork1.price > 0 ? (priceDifference / artwork1.price) * 100 : 0

    // Size comparison
    const sizeComparison = compareDimensions(artwork1.dimensions, artwork2.dimensions)

    // Medium similarity
    const mediumSimilarity = artwork1.medium === artwork2.medium ? 100 : 0

    // Genre similarity
    const genreSimilarity = artwork1.genre === artwork2.genre ? 100 : 0

    // Year difference
    const yearDifference = Math.abs(artwork1.year_created - artwork2.year_created)

    // Market value comparison
    const marketValueComparison = compareMarketValues(artwork1, artwork2)

    // Condition comparison
    const conditionComparison = compareConditions(artwork1.condition, artwork2.condition)

    // Provenance comparison
    const provenanceComparison = compareProvenance(artwork1.provenance, artwork2.provenance)

    // Exhibition comparison
    const exhibitionComparison = compareExhibitions(artwork1.exhibition_history, artwork2.exhibition_history)

    // Overall similarity score
    const overallSimilarity = calculateOverallSimilarity({
      price: priceDifferencePercentage,
      medium: mediumSimilarity,
      genre: genreSimilarity,
      year: yearDifference,
      condition: conditionComparison,
      provenance: provenanceComparison,
      exhibition: exhibitionComparison
    })

    setComparisonMetrics({
      price_difference: priceDifference,
      price_difference_percentage: priceDifferencePercentage,
      size_comparison: sizeComparison,
      medium_similarity: mediumSimilarity,
      genre_similarity: genreSimilarity,
      year_difference: yearDifference,
      market_value_comparison: marketValueComparison,
      condition_comparison: conditionComparison,
      provenance_comparison: provenanceComparison,
      exhibition_comparison: exhibitionComparison,
      overall_similarity: overallSimilarity
    })
  }

  const compareDimensions = (dim1: string, dim2: string): string => {
    // Parse dimensions (simplified)
    const parseDimensions = (dim: string) => {
      const match = dim.match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/i)
      if (match) {
        return {
          width: parseFloat(match[1]),
          height: parseFloat(match[2])
        }
      }
      return { width: 0, height: 0 }
    }

    const d1 = parseDimensions(dim1)
    const d2 = parseDimensions(dim2)

    if (d1.width === 0 || d2.width === 0) return 'Unable to compare'

    const area1 = d1.width * d1.height
    const area2 = d2.width * d2.height
    const areaDifference = ((area2 - area1) / area1) * 100

    if (Math.abs(areaDifference) < 5) return 'Similar size'
    if (areaDifference > 0) return `${areaDifference.toFixed(1)}% larger`
    return `${Math.abs(areaDifference).toFixed(1)}% smaller`
  }

  const compareMarketValues = (artwork1: Artwork, artwork2: Artwork): string => {
    const value1 = artwork1.market_value || artwork1.price
    const value2 = artwork2.market_value || artwork2.price

    if (!value1 || !value2) return 'Unable to compare'

    const difference = ((value2 - value1) / value1) * 100

    if (Math.abs(difference) < 10) return 'Similar market value'
    if (difference > 0) return `${difference.toFixed(1)}% higher market value`
    return `${Math.abs(difference).toFixed(1)}% lower market value`
  }

  const compareConditions = (condition1: string, condition2: string): string => {
    const conditionOrder = ['poor', 'fair', 'good', 'very_good', 'excellent']
    const index1 = conditionOrder.indexOf(condition1)
    const index2 = conditionOrder.indexOf(condition2)

    if (index1 === index2) return 'Same condition'
    if (index1 > index2) return 'Better condition'
    return 'Worse condition'
  }

  const compareProvenance = (prov1: string, prov2: string): string => {
    if (!prov1 || !prov2) return 'Unable to compare'
    
    const similarity = calculateStringSimilarity(prov1.toLowerCase(), prov2.toLowerCase())
    
    if (similarity > 80) return 'Very similar provenance'
    if (similarity > 60) return 'Somewhat similar provenance'
    if (similarity > 40) return 'Different provenance'
    return 'Completely different provenance'
  }

  const compareExhibitions = (exh1: string[], exh2: string[]): string => {
    if (exh1.length === 0 && exh2.length === 0) return 'No exhibition history'
    if (exh1.length === 0 || exh2.length === 0) return 'Different exhibition history'

    const commonExhibitions = exh1.filter(e => exh2.includes(e))
    const similarity = (commonExhibitions.length / Math.max(exh1.length, exh2.length)) * 100

    if (similarity > 80) return 'Very similar exhibition history'
    if (similarity > 60) return 'Somewhat similar exhibition history'
    if (similarity > 40) return 'Different exhibition history'
    return 'Completely different exhibition history'
  }

  const calculateStringSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1

    if (longer.length === 0) return 100

    const editDistance = levenshteinDistance(longer, shorter)
    return ((longer.length - editDistance) / longer.length) * 100
  }

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        )
      }
    }

    return matrix[str2.length][str1.length]
  }

  const calculateOverallSimilarity = (metrics: any): number => {
    const weights = {
      price: 0.2,
      medium: 0.15,
      genre: 0.15,
      year: 0.1,
      condition: 0.1,
      provenance: 0.15,
      exhibition: 0.15
    }

    let totalScore = 0
    let totalWeight = 0

    Object.entries(weights).forEach(([key, weight]) => {
      if (key === 'year') {
        // For year, closer is better (inverse relationship)
        const yearScore = Math.max(0, 100 - (metrics.year / 10))
        totalScore += yearScore * weight
      } else if (key === 'price') {
        // For price, closer percentage difference is better
        const priceScore = Math.max(0, 100 - Math.abs(metrics.price))
        totalScore += priceScore * weight
      } else {
        totalScore += metrics[key] * weight
      }
      totalWeight += weight
    })

    return totalWeight > 0 ? totalScore / totalWeight : 0
  }

  const addArtworkToComparison = (artworkId: string) => {
    const currentIds = searchParams.get('ids')?.split(',') || []
    if (!currentIds.includes(artworkId)) {
      const newIds = [...currentIds, artworkId]
      setSearchParams({ ids: newIds.join(',') })
    }
  }

  const removeArtworkFromComparison = (artworkId: string) => {
    const currentIds = searchParams.get('ids')?.split(',') || []
    const newIds = currentIds.filter(id => id !== artworkId)
    if (newIds.length > 0) {
      setSearchParams({ ids: newIds.join(',') })
    } else {
      setSearchParams({})
    }
  }

  const resetComparison = () => {
    setSearchParams({})
    setArtworks([])
    setComparisonMetrics(null)
  }

  const shareComparison = () => {
    const url = `${window.location.origin}/compare?ids=${searchParams.get('ids')}`
    navigator.clipboard.writeText(url)
    toast.success('Comparison link copied to clipboard')
  }

  const exportComparison = () => {
    // Generate comparison report
    const report = generateComparisonReport()
    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'artwork-comparison.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const generateComparisonReport = (): string => {
    if (!comparisonMetrics || artworks.length < 2) return ''

    const [artwork1, artwork2] = artworks
    const report = `
ARTWORK COMPARISON REPORT
Generated: ${new Date().toLocaleDateString()}

ARTWORK 1: ${artwork1.title}
Artist: ${artwork1.artist_name}
Price: ${artwork1.currency} ${artwork1.price.toLocaleString()}
Medium: ${artwork1.medium}
Genre: ${artwork1.genre}
Dimensions: ${artwork1.dimensions}
Year: ${artwork1.year_created}
Condition: ${artwork1.condition}

ARTWORK 2: ${artwork2.title}
Artist: ${artwork2.artist_name}
Price: ${artwork2.currency} ${artwork2.price.toLocaleString()}
Medium: ${artwork2.medium}
Genre: ${artwork2.genre}
Dimensions: ${artwork2.dimensions}
Year: ${artwork2.year_created}
Condition: ${artwork2.condition}

COMPARISON METRICS:
Price Difference: ${artwork2.currency} ${comparisonMetrics.price_difference.toLocaleString()} (${comparisonMetrics.price_difference_percentage.toFixed(1)}%)
Size Comparison: ${comparisonMetrics.size_comparison}
Medium Similarity: ${comparisonMetrics.medium_similarity}%
Genre Similarity: ${comparisonMetrics.genre_similarity}%
Year Difference: ${comparisonMetrics.year_difference} years
Market Value: ${comparisonMetrics.market_value_comparison}
Condition: ${comparisonMetrics.condition_comparison}
Provenance: ${comparisonMetrics.provenance_comparison}
Exhibitions: ${comparisonMetrics.exhibition_comparison}
Overall Similarity: ${comparisonMetrics.overall_similarity.toFixed(1)}%
`

    return report
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #e5e7eb',
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#6b7280' }}>Loading artworks for comparison...</p>
      </div>
    )
  }

  if (artworks.length === 0) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '500px',
          padding: '60px 20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <BarChart3 size={48} style={{ color: '#9ca3af', marginBottom: '16px' }} />
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#111827',
            margin: '0 0 8px 0'
          }}>
            Compare Artworks
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            margin: '0 0 24px 0'
          }}>
            Select artworks to compare their details, prices, and characteristics side by side.
          </p>
          <Link
            to="/artworks"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <Plus size={16} />
            Browse Artworks
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '24px'
    }}>
      <Helmet>
        <title>Artwork Comparison | ArtFlow</title>
        <meta name="description" content="Compare artworks side by side with detailed metrics and analysis." />
      </Helmet>

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#111827',
              margin: '0 0 8px 0'
            }}>
              Artwork Comparison
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              margin: 0
            }}>
              Compare {artworks.length} artwork{artworks.length > 1 ? 's' : ''} side by side
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'detailed' : 'grid')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {viewMode === 'grid' ? 'Detailed View' : 'Grid View'}
            </button>

            <button
              onClick={() => setShowMetrics(!showMetrics)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              <BarChart3 size={16} />
              {showMetrics ? 'Hide' : 'Show'} Metrics
            </button>

            <button
              onClick={shareComparison}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              <Share2 size={16} />
              Share
            </button>

            <button
              onClick={exportComparison}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              <Download size={16} />
              Export
            </button>

            <button
              onClick={resetComparison}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              <RotateCcw size={16} />
              Reset
            </button>
          </div>
        </div>

        {/* Comparison Metrics */}
        {showMetrics && comparisonMetrics && (
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            marginBottom: '32px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#111827',
              margin: '0 0 16px 0'
            }}>
              Comparison Analysis
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              <div style={{
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <DollarSign size={16} style={{ color: '#3b82f6' }} />
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', margin: 0 }}>Price Difference</h4>
                </div>
                <p style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: comparisonMetrics.price_difference >= 0 ? '#10b981' : '#ef4444',
                  margin: '0 0 4px 0'
                }}>
                  {comparisonMetrics.price_difference >= 0 ? '+' : ''}${comparisonMetrics.price_difference.toLocaleString()}
                </p>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                  {comparisonMetrics.price_difference_percentage.toFixed(1)}%
                </p>
              </div>

              <div style={{
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Ruler size={16} style={{ color: '#8b5cf6' }} />
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', margin: 0 }}>Size</h4>
                </div>
                <p style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                  {comparisonMetrics.size_comparison}
                </p>
              </div>

              <div style={{
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Palette size={16} style={{ color: '#f59e0b' }} />
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', margin: 0 }}>Medium Similarity</h4>
                </div>
                <p style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                  {comparisonMetrics.medium_similarity}%
                </p>
              </div>

              <div style={{
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Star size={16} style={{ color: '#10b981' }} />
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', margin: 0 }}>Overall Similarity</h4>
                </div>
                <p style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                  {comparisonMetrics.overall_similarity.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Artworks Comparison */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${artworks.length}, 1fr)`,
          gap: '24px'
        }}>
          {artworks.map((artwork, index) => (
            <div
              key={artwork.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              {/* Remove button */}
              <button
                onClick={() => removeArtworkFromComparison(artwork.id)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  zIndex: 10,
                  width: '32px',
                  height: '32px',
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={16} />
              </button>

              {/* Image */}
              <div style={{ position: 'relative', aspectRatio: '1', backgroundColor: '#f3f4f6' }}>
                {artwork.primary_image_url ? (
                  <img
                    src={artwork.primary_image_url}
                    alt={artwork.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                      transition: 'transform 0.3s ease'
                    }}
                  />
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: '#9ca3af'
                  }}>
                    <Palette size={48} />
                  </div>
                )}

                {/* Image controls */}
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  display: 'flex',
                  gap: '8px'
                }}>
                  <button
                    onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <ZoomOut size={16} />
                  </button>
                  <button
                    onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <ZoomIn size={16} />
                  </button>
                  <button
                    onClick={() => setRotation(rotation + 90)}
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <RotateCw size={16} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: '20px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827',
                  margin: '0 0 8px 0',
                  lineHeight: '1.4'
                }}>
                  {artwork.title}
                </h3>

                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: '0 0 12px 0'
                }}>
                  by {artwork.artist_name}
                </p>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <div>
                    <p style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: '#111827',
                      margin: '0 0 4px 0'
                    }}>
                      {artwork.currency} {artwork.price.toLocaleString()}
                    </p>
                    {artwork.market_value && (
                      <p style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        margin: 0
                      }}>
                        Market: {artwork.currency} {artwork.market_value.toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      style={{
                        padding: '8px',
                        backgroundColor: 'transparent',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        color: '#6b7280'
                      }}
                      title="Add to Favorites"
                    >
                      <Heart size={16} />
                    </button>
                    <button
                      style={{
                        padding: '8px',
                        backgroundColor: 'transparent',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        color: '#6b7280'
                      }}
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      style={{
                        padding: '8px',
                        backgroundColor: 'transparent',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        color: '#6b7280'
                      }}
                      title="Contact Artist"
                    >
                      <MessageSquare size={16} />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Medium:</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{artwork.medium}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Genre:</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{artwork.genre}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Dimensions:</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{artwork.dimensions}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Year:</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{artwork.year_created}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Condition:</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{artwork.condition}</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link
                    to={`/artwork/${artwork.id}`}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    <Eye size={16} />
                    View Details
                  </Link>
                  <button
                    style={{
                      padding: '12px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    <ShoppingBag size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add more artworks */}
        {artworks.length < 4 && (
          <div style={{
            marginTop: '32px',
            textAlign: 'center'
          }}>
            <Link
              to="/artworks"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                backgroundColor: 'white',
                color: '#3b82f6',
                textDecoration: 'none',
                borderRadius: '8px',
                border: '2px dashed #d1d5db',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              <Plus size={16} />
              Add More Artworks to Compare
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default ArtworkComparison
