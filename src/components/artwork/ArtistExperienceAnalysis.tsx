import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, TrendingDown, Minus, Award, Users, MapPin, 
  Instagram, Globe, BarChart3, Target, Star, Calendar,
  Gallery, Museum, Trophy, Newspaper, ExternalLink,
  CheckCircle, AlertCircle, Info, Loader
} from 'lucide-react'
import { marketDataService, ArtistExperienceAnalysis } from '../../services/marketData'
import toast from 'react-hot-toast'

interface ArtistExperienceAnalysisProps {
  artistId: string
  className?: string
}

const ArtistExperienceAnalysis: React.FC<ArtistExperienceAnalysisProps> = ({ 
  artistId, 
  className = '' 
}) => {
  const [analysis, setAnalysis] = useState<ArtistExperienceAnalysis | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (artistId) {
      loadAnalysis()
    }
  }, [artistId])

  const loadAnalysis = async () => {
    setLoading(true)
    try {
      const data = await marketDataService.analyzeArtistExperience(artistId)
      setAnalysis(data)
    } catch (error) {
      console.error('Error loading artist analysis:', error)
      toast.error('Failed to load artist analysis')
    } finally {
      setLoading(false)
    }
  }

  const getExperienceColor = (level: string) => {
    switch (level) {
      case 'emerging':
        return 'text-blue-600 bg-blue-100'
      case 'mid-career':
        return 'text-green-600 bg-green-100'
      case 'established':
        return 'text-purple-600 bg-purple-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getExperienceIcon = (level: string) => {
    switch (level) {
      case 'emerging':
        return <Target size={16} />
      case 'mid-career':
        return <TrendingUp size={16} />
      case 'established':
        return <Star size={16} />
      default:
        return <BarChart3 size={16} />
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising':
        return <TrendingUp size={14} className="text-green-600" />
      case 'declining':
        return <TrendingDown size={14} className="text-red-600" />
      default:
        return <Minus size={14} className="text-gray-600" />
    }
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className={`p-6 bg-white rounded-lg border border-gray-200 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className={`p-6 bg-white rounded-lg border border-gray-200 ${className}`}>
        <div className="text-center text-gray-500">
          <BarChart3 size={48} className="mx-auto mb-4 text-gray-300" />
          <p>No artist analysis available</p>
          <p className="text-sm">Unable to analyze artist experience level</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`p-6 bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 size={20} className="text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Artist Experience Analysis</h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getExperienceColor(analysis.experience_level)}`}>
          {getExperienceIcon(analysis.experience_level)}
          {analysis.experience_level.charAt(0).toUpperCase() + analysis.experience_level.slice(1).replace('-', ' ')}
        </div>
      </div>

      {/* Confidence Score */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Analysis Confidence</span>
          <span className={`text-sm font-semibold ${getConfidenceColor(analysis.confidence_score)}`}>
            {analysis.confidence_score}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              analysis.confidence_score >= 80 ? 'bg-green-500' :
              analysis.confidence_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${analysis.confidence_score}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Based on data completeness and consistency
        </p>
      </div>

      {/* Exhibitions Analysis */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Gallery size={16} />
          Exhibition History
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{analysis.factors.exhibitions.count}</div>
            <div className="text-xs text-gray-500">Total Exhibitions</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{analysis.factors.exhibitions.solo_exhibitions}</div>
            <div className="text-xs text-gray-500">Solo Shows</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{analysis.factors.exhibitions.international_exhibitions}</div>
            <div className="text-xs text-gray-500">International</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{analysis.factors.exhibitions.museum_exhibitions}</div>
            <div className="text-xs text-gray-500">Museum Shows</div>
          </div>
        </div>
      </div>

      {/* Sales Performance */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <BarChart3 size={16} />
          Sales Performance
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{analysis.factors.sales.total_sales}</div>
            <div className="text-xs text-gray-500">Total Sales</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {analysis.factors.sales.average_price.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">Avg Price (ZAR)</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {analysis.factors.sales.highest_price.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">Highest Price</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold">
              {getTrendIcon(analysis.factors.sales.price_trend)}
            </div>
            <div className="text-xs text-gray-500 capitalize">{analysis.factors.sales.price_trend} Trend</div>
          </div>
        </div>
        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">Sales Consistency</span>
            <span className="text-sm font-semibold text-blue-900">
              {Math.round(analysis.factors.sales.sales_consistency)}%
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${analysis.factors.sales.sales_consistency}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Recognition & Awards */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Award size={16} />
          Recognition & Awards
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{analysis.factors.recognition.awards_count}</div>
            <div className="text-xs text-gray-500">Awards</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{analysis.factors.recognition.press_mentions}</div>
            <div className="text-xs text-gray-500">Press Mentions</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{analysis.factors.recognition.gallery_representations}</div>
            <div className="text-xs text-gray-500">Gallery Reps</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{analysis.factors.recognition.collector_base_size}</div>
            <div className="text-xs text-gray-500">Collectors</div>
          </div>
        </div>
      </div>

      {/* Social Presence */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Instagram size={16} />
          Social Presence
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {analysis.factors.social_presence.instagram_followers.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">Instagram Followers</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(analysis.factors.social_presence.instagram_engagement)}%
            </div>
            <div className="text-xs text-gray-500">Engagement Rate</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {analysis.factors.social_presence.social_mentions}
            </div>
            <div className="text-xs text-gray-500">Social Mentions</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(analysis.factors.social_presence.online_presence_score)}%
            </div>
            <div className="text-xs text-gray-500">Online Presence</div>
          </div>
        </div>
      </div>

      {/* Market Data */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Target size={16} />
          Market Position
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(analysis.factors.market_data.price_per_sq_cm)}
            </div>
            <div className="text-xs text-gray-500">ZAR per cm²</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(analysis.factors.market_data.market_share * 100) / 100}%
            </div>
            <div className="text-xs text-gray-500">Market Share</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(analysis.factors.market_data.collector_demand)}%
            </div>
            <div className="text-xs text-gray-500">Collector Demand</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(analysis.factors.market_data.gallery_interest)}%
            </div>
            <div className="text-xs text-gray-500">Gallery Interest</div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Target size={16} />
          Recommendations
        </h4>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-2">Pricing Strategy</h5>
            <p className="text-sm text-blue-800 capitalize">
              {analysis.recommendations.pricing_strategy} pricing recommended
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h5 className="font-medium text-green-900 mb-2">Marketing Focus</h5>
            <ul className="text-sm text-green-800 space-y-1">
              {analysis.recommendations.marketing_focus.map((focus, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle size={14} />
                  {focus}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <h5 className="font-medium text-purple-900 mb-2">Growth Opportunities</h5>
            <ul className="text-sm text-purple-800 space-y-1">
              {analysis.recommendations.growth_opportunities.map((opportunity, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Star size={14} />
                  {opportunity}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-2">Market Positioning</h5>
            <p className="text-sm text-gray-700">
              {analysis.recommendations.market_positioning}
            </p>
          </div>
        </div>
      </div>

      {/* Data Sources */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Data Sources</h4>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">AF</span>
            </div>
            <span className="text-sm font-medium">ArtFlow Platform</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
            <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <span className="text-sm font-medium">Artsy Database</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
            <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">E</span>
            </div>
            <span className="text-sm font-medium">Exhibition Records</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
            <div className="w-6 h-6 bg-orange-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span className="text-sm font-medium">Social Media</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
            <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">P</span>
            </div>
            <span className="text-sm font-medium">Press Archives</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Analysis based on comprehensive data from art market sources, exhibition records, and social media presence
        </p>
      </div>
    </div>
  )
}

export default ArtistExperienceAnalysis
