import React, { useState, useEffect } from 'react';
import { TrendingUp, Calculator, DollarSign, Info, CheckCircle } from 'lucide-react';
import { pricingAssistant, PricingSuggestion } from '@/services/pricingAssistant';
import toast from 'react-hot-toast';

interface PricingAssistantProps {
  artwork: any;
  onPriceUpdate?: (price: number) => void;
  className?: string;
}

const PricingAssistant: React.FC<PricingAssistantProps> = ({ 
  artwork, 
  onPriceUpdate,
  className = '' 
}) => {
  const [suggestion, setSuggestion] = useState<PricingSuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (artwork) {
      loadPricingSuggestion();
    }
  }, [artwork]);

  const loadPricingSuggestion = async () => {
    setLoading(true);
    try {
      const suggestion = await pricingAssistant.getPricingSuggestions(artwork);
      setSuggestion(suggestion);
    } catch (error) {
      console.error('Error loading pricing suggestion:', error);
      toast.error('Failed to load pricing suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleApplySuggestion = () => {
    if (suggestion && onPriceUpdate) {
      onPriceUpdate(suggestion.suggestedPrice);
      toast.success('Price updated with AI suggestion');
    }
  };

  if (loading) {
    return (
      <div className={`pricing-assistant ${className}`}>
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
          <Calculator size={16} className="text-blue-600" />
          <span className="text-sm text-blue-800">Analyzing market data...</span>
        </div>
      </div>
    );
  }

  if (!suggestion) return null;

  const confidenceColor = suggestion.confidence > 0.8 ? 'text-green-600' : 
                         suggestion.confidence > 0.6 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className={`pricing-assistant ${className}`}>
      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-600" />
            <h3 className="font-semibold text-gray-900">AI Pricing Assistant</h3>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Suggested Price</p>
              <p className="text-2xl font-bold text-gray-900">
                ${suggestion.suggestedPrice.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Confidence</p>
              <p className={`font-semibold ${confidenceColor}`}>
                {Math.round(suggestion.confidence * 100)}%
              </p>
            </div>
          </div>

          {suggestion.reasoning.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">Why this price:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                {suggestion.reasoning.map((reason, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {showDetails && (
            <div className="mt-4 p-3 bg-white rounded-lg border">
              <h4 className="font-medium text-gray-900 mb-2">Market Analysis</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Similar Artworks</p>
                  <p className="font-semibold">{suggestion.marketData.similarArtworks}</p>
                </div>
                <div>
                  <p className="text-gray-600">Average Price</p>
                  <p className="font-semibold">${suggestion.marketData.averagePrice.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Price Range</p>
                  <p className="font-semibold">
                    ${suggestion.marketData.priceRange.min.toLocaleString()} - 
                    ${suggestion.marketData.priceRange.max.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Market Velocity</p>
                  <p className="font-semibold">
                    {suggestion.marketData.marketVelocity.toFixed(1)} sales/day
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t">
                <h5 className="font-medium text-gray-900 mb-2">Price Factors</h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Size Multiplier</span>
                    <span className="font-medium">{suggestion.factors.sizeMultiplier.toFixed(2)}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Medium Multiplier</span>
                    <span className="font-medium">{suggestion.factors.mediumMultiplier.toFixed(2)}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Artist Multiplier</span>
                    <span className="font-medium">{suggestion.factors.artistMultiplier.toFixed(2)}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Recent Sales</span>
                    <span className="font-medium">{suggestion.factors.recentSalesMultiplier.toFixed(2)}x</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleApplySuggestion}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Apply Suggestion
            </button>
            <button
              onClick={loadPricingSuggestion}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Refresh
            </button>
          </div>

          <div className="flex items-start gap-2 text-xs text-gray-500">
            <Info size={14} className="mt-0.5 flex-shrink-0" />
            <p>
              Pricing suggestions are based on market data and may not reflect the true value of your artwork. 
              Consider your own pricing strategy and market positioning.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingAssistant;
