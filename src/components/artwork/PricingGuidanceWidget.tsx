import React, { useState, useEffect } from 'react'
import { DollarSign, BarChart3, TrendingUp, Info, ExternalLink, RefreshCw } from 'lucide-react'
import { marketDataService, PricingGuidance, PricingFactors } from '../../services/marketData'
import toast from 'react-hot-toast'

interface PricingGuidanceWidgetProps {
  dimensions: string
  medium: string
  style?: string
  year?: number
  artistExperienceLevel?: 'emerging' | 'mid-career' | 'established'
  onPriceSelect?: (price: number) => void
  className?: string
}

const PricingGuidanceWidget: React.FC<PricingGuidanceWidgetProps> = ({
  dimensions,
  medium,
  style,
  year,
  artistExperienceLevel,
  onPriceSelect,
  className = ''
}) => {
  const [guidance, setGuidance] = useState<PricingGuidance | null>(null)
  const [loading, setLoading] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (dimensions && medium) {
      loadPricingGuidance()
    }
  }, [dimensions, medium, style, year, artistExperienceLevel])

  const loadPricingGuidance = async () => {
    setLoading(true)
    try {
      const factors: PricingFactors = {
        dimensions,
        medium,
        style,
        year,
        artist_experience_level: artistExperienceLevel
      }
      
      const data = await marketDataService.getPricingGuidance(factors)
      setGuidance(data)
    } catch (error) {
      console.error('Error loading pricing guidance:', error)
      toast.error('Failed to load pricing guidance')
    } finally {
      setLoading(false)
    }
  }

  const handlePriceSelect = (price: number) => {
    onPriceSelect?.(price)
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising':
        return <TrendingUp size={14} className="text-green-600" />
      case 'declining':
        return <TrendingUp size={14} className="text-red-600 rotate-180" />
      default:
        return <div className="w-3 h-0.5 bg-gray-400"></div>
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'rising':
        return 'text-green-600'
      case 'declining':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className={`p-4 bg-gray-50 rounded-lg border ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!guidance || guidance.market_analysis.comparable_count === 0) {
    return (
      <div className={`p-4 bg-gray-50 rounded-lg border ${className}`}>
        <div className="text-center text-gray-500">
          <BarChart3 size={24} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No market data available</p>
          <p className="text-xs">Enter artwork details to get pricing guidance</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`p-4 bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-blue-600" />
          <h4 className="font-medium text-gray-900">Market Pricing Guidance</h4>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadPricingGuidance}
            disabled={loading}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showDetails ? 'Hide' : 'Details'}
          </button>
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign size={16} className="text-green-600" />
          <span className="text-lg font-semibold text-gray-900">
            {guidance.suggested_price_range.min.toLocaleString()} - {guidance.suggested_price_range.max.toLocaleString()}
          </span>
          <span className="text-sm text-gray-500">{guidance.suggested_price_range.currency}</span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => handlePriceSelect(guidance.suggested_price_range.min)}
            className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-md hover:bg-blue-200 transition-colors"
          >
            Use Min
          </button>
          <button
            onClick={() => handlePriceSelect(guidance.suggested_price_range.max)}
            className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-md hover:bg-green-200 transition-colors"
          >
            Use Max
          </button>
        </div>
      </div>

      {/* Market Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className="text-sm font-semibold text-gray-900">{guidance.market_analysis.comparable_count}</div>
          <div className="text-xs text-gray-500">Similar</div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className="text-sm font-semibold text-gray-900">{guidance.market_analysis.average_price.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Avg Price</div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className={`flex items-center justify-center gap-1 text-sm font-semibold ${getTrendColor(guidance.market_analysis.market_trend)}`}>
            {getTrendIcon(guidance.market_analysis.market_trend)}
          </div>
          <div className="text-xs text-gray-500 capitalize">{guidance.market_analysis.market_trend}</div>
        </div>
      </div>

      {/* Data Sources */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-gray-600">Data Sources:</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 rounded text-xs">
            <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">AF</span>
            </div>
            <span>ArtFlow</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded text-xs">
            <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <span>Artsy</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 rounded text-xs">
            <div className="w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span>Saatchi</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 rounded text-xs">
            <div className="w-4 h-4 bg-orange-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">1</span>
            </div>
            <span>1stDibs</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-red-100 rounded text-xs">
            <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">C</span>
            </div>
            <span>Christie's</span>
          </div>
        </div>
      </div>

      {/* Detailed View */}
      {showDetails && (
        <div className="border-t pt-4 space-y-4">
          {/* Recommendations */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Recommendations</h5>
            <p className="text-sm text-gray-600">{guidance.recommendations.reasoning}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {guidance.recommendations.factors.map((factor, index) => (
                <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                  {factor}
                </span>
              ))}
            </div>
          </div>

          {/* Comparable Artworks */}
          {guidance.comparable_artworks.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Similar Works</h5>
              <div className="space-y-2">
                {guidance.comparable_artworks.slice(0, 3).map((artwork, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{artwork.title}</div>
                      <div className="text-xs text-gray-500">{artwork.artist} • {artwork.medium}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{artwork.price.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">{Math.round(artwork.similarity_score)}% match</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
            <div className="flex items-start gap-2">
              <Info size={14} className="text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-yellow-800">
                <p className="font-medium mb-1">Pricing Guidance Disclaimer</p>
                <p>
                  This guidance is based on market data analysis and should be used as a reference only. 
                  Final pricing should consider your unique artistic style and market positioning.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PricingGuidanceWidget
