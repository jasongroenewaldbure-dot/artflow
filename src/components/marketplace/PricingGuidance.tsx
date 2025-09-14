import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus, DollarSign, BarChart3, Target, Info, ExternalLink } from 'lucide-react'
import { marketDataService, PricingGuidance, PricingFactors } from '../../services/marketData'
import toast from 'react-hot-toast'

interface PricingGuidanceProps {
  factors: PricingFactors
  onPriceSelect?: (price: number) => void
  className?: string
}

const PricingGuidance: React.FC<PricingGuidanceProps> = ({ 
  factors, 
  onPriceSelect, 
  className = '' 
}) => {
  const [guidance, setGuidance] = useState<PricingGuidance | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null)

  useEffect(() => {
    if (factors.dimensions && factors.medium) {
      loadPricingGuidance()
    }
  }, [factors])

  const loadPricingGuidance = async () => {
    setLoading(true)
    try {
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
    setSelectedPrice(price)
    onPriceSelect?.(price)
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising':
        return <TrendingUp size={16} className="text-green-600" />
      case 'declining':
        return <TrendingDown size={16} className="text-red-600" />
      default:
        return <Minus size={16} className="text-gray-600" />
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

  const getStrategyColor = (strategy: string) => {
    switch (strategy) {
      case 'conservative':
        return 'bg-blue-100 text-blue-800'
      case 'market':
        return 'bg-green-100 text-green-800'
      case 'premium':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className={`p-6 bg-white rounded-lg border border-gray-200 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!guidance) {
    return (
      <div className={`p-6 bg-white rounded-lg border border-gray-200 ${className}`}>
        <div className="text-center text-gray-500">
          <BarChart3 size={48} className="mx-auto mb-4 text-gray-300" />
          <p>No pricing guidance available</p>
          <p className="text-sm">Enter artwork details to get market-based pricing suggestions</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`p-6 bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 size={20} className="text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Market Pricing Guidance</h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStrategyColor(guidance.recommendations.pricing_strategy)}`}>
          {guidance.recommendations.pricing_strategy.charAt(0).toUpperCase() + guidance.recommendations.pricing_strategy.slice(1)} Strategy
        </div>
      </div>

      {/* Suggested Price Range */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Suggested Price Range</h4>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={16} className="text-green-600" />
              <span className="text-2xl font-bold text-gray-900">
                {guidance.suggested_price_range.min.toLocaleString()} - {guidance.suggested_price_range.max.toLocaleString()}
              </span>
              <span className="text-sm text-gray-500">{guidance.suggested_price_range.currency}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePriceSelect(guidance.suggested_price_range.min)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedPrice === guidance.suggested_price_range.min
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Use Min ({guidance.suggested_price_range.min.toLocaleString()})
              </button>
              <button
                onClick={() => handlePriceSelect(guidance.suggested_price_range.max)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedPrice === guidance.suggested_price_range.max
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Use Max ({guidance.suggested_price_range.max.toLocaleString()})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Market Analysis */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Market Analysis</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{guidance.market_analysis.comparable_count}</div>
            <div className="text-xs text-gray-500">Comparable Works</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{guidance.market_analysis.average_price.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Average Price</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{guidance.market_analysis.median_price.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Median Price</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className={`flex items-center justify-center gap-1 text-2xl font-bold ${getTrendColor(guidance.market_analysis.market_trend)}`}>
              {getTrendIcon(guidance.market_analysis.market_trend)}
            </div>
            <div className="text-xs text-gray-500 capitalize">{guidance.market_analysis.market_trend} Market</div>
          </div>
        </div>
      </div>

      {/* Data Sources */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Data Sources</h4>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">AF</span>
            </div>
            <span className="text-sm font-medium">ArtFlow Market</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
            <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <span className="text-sm font-medium">Artsy Data</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
            <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span className="text-sm font-medium">Saatchi Art</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
            <div className="w-6 h-6 bg-orange-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">1</span>
            </div>
            <span className="text-sm font-medium">1stDibs</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
            <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">C</span>
            </div>
            <span className="text-sm font-medium">Christie's</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span className="text-sm font-medium">Sotheby's</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Pricing data aggregated from trusted art market sources and auction houses
        </p>
      </div>

      {/* Recommendations */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Recommendations</h4>
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-2">
            <Target size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-700 mb-2">{guidance.recommendations.reasoning}</p>
              <div className="flex flex-wrap gap-2">
                {guidance.recommendations.factors.map((factor, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparable Artworks */}
      {guidance.comparable_artworks.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Similar Works in Market</h4>
          <div className="space-y-3">
            {guidance.comparable_artworks.slice(0, 5).map((artwork, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">{artwork.title}</div>
                  <div className="text-xs text-gray-500">{artwork.artist} • {artwork.medium} • {artwork.dimensions}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-sm text-gray-900">{artwork.price.toLocaleString()} {guidance.suggested_price_range.currency}</div>
                  <div className="text-xs text-gray-500">{Math.round(artwork.similarity_score)}% match</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-center">
            <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 mx-auto">
              View all comparable works
              <ExternalLink size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-2">
          <Info size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-yellow-800">
            <p className="font-medium mb-1">Pricing Guidance Disclaimer</p>
            <p>
              This pricing guidance is based on market data analysis and should be used as a reference only. 
              Final pricing should consider your unique artistic style, reputation, and market positioning. 
              Market conditions can change rapidly, and individual artwork values may vary significantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PricingGuidance
