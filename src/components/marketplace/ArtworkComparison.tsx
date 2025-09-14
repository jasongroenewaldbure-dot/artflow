import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import BadgeSystem from './BadgeSystem';
import ScaleBadge from './ScaleBadge';
import TrustSurface from './TrustSurface';

interface Artwork {
  id: string;
  title: string;
  slug: string;
  artist_name: string;
  artist_slug: string;
  price: number;
  currency: string;
  dimensions: {
    width: number;
    height: number;
    unit: string;
  };
  medium: string;
  year: number;
  status: string;
  image_url: string;
  description?: string;
  dominant_colors?: string[];
  badges?: string[];
  is_price_negotiable?: boolean;
  has_certificate_of_authenticity?: boolean;
  certificate_of_authenticity_details?: string;
}

interface ComparisonReason {
  type: 'similar' | 'different' | 'advantage' | 'disadvantage';
  text: string;
  icon?: React.ReactNode;
}

interface ArtworkComparisonProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const ArtworkComparison: React.FC<ArtworkComparisonProps> = ({ 
  isOpen, 
  onClose, 
  className = '' 
}) => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [comparisonReasons, setComparisonReasons] = useState<ComparisonReason[]>([]);

  useEffect(() => {
    if (artworks.length >= 2) {
      generateComparisonReasons();
    }
  }, [artworks]);

  const addArtwork = (artwork: Artwork) => {
    if (artworks.length >= 3) {
      alert('You can compare up to 3 artworks at once');
      return;
    }
    
    if (artworks.find(a => a.id === artwork.id)) {
      alert('This artwork is already in the comparison');
      return;
    }

    setArtworks(prev => [...prev, artwork]);
  };

  const removeArtwork = (artworkId: string) => {
    setArtworks(prev => prev.filter(a => a.id !== artworkId));
  };

  const generateComparisonReasons = () => {
    const reasons: ComparisonReason[] = [];
    
    if (artworks.length < 2) return;

    // Price comparison
    const prices = artworks.map(a => a.price).sort((a, b) => a - b);
    const priceRange = prices[prices.length - 1] - prices[0];
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

    if (priceRange > avgPrice * 0.5) {
      reasons.push({
        type: 'different',
        text: `Price range: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(prices[0])} - ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(prices[prices.length - 1])}`,
        icon: <AlertCircle size={16} />
      });
    } else {
      reasons.push({
        type: 'similar',
        text: 'Similar price range',
        icon: <CheckCircle size={16} />
      });
    }

    // Size comparison
    const sizes = artworks.map(a => a.dimensions.width * a.dimensions.height);
    const sizeRange = Math.max(...sizes) - Math.min(...sizes);
    const avgSize = sizes.reduce((sum, size) => sum + size, 0) / sizes.length;

    if (sizeRange > avgSize * 0.3) {
      reasons.push({
        type: 'different',
        text: 'Significant size differences',
        icon: <AlertCircle size={16} />
      });
    } else {
      reasons.push({
        type: 'similar',
        text: 'Similar sizes',
        icon: <CheckCircle size={16} />
      });
    }

    // Medium comparison
    const mediums = [...new Set(artworks.map(a => a.medium))];
    if (mediums.length === 1) {
      reasons.push({
        type: 'similar',
        text: `All ${mediums[0]} artworks`,
        icon: <CheckCircle size={16} />
      });
    } else {
      reasons.push({
        type: 'different',
        text: `Mixed mediums: ${mediums.join(', ')}`,
        icon: <AlertCircle size={16} />
      });
    }

    // Availability comparison
    const availableCount = artworks.filter(a => a.status === 'available').length;
    const soldCount = artworks.filter(a => a.status === 'sold').length;

    if (availableCount === artworks.length) {
      reasons.push({
        type: 'advantage',
        text: 'All artworks are available',
        icon: <CheckCircle size={16} />
      });
    } else if (soldCount === artworks.length) {
      reasons.push({
        type: 'disadvantage',
        text: 'All artworks are sold',
        icon: <AlertCircle size={16} />
      });
    } else {
      reasons.push({
        type: 'different',
        text: `${availableCount} available, ${soldCount} sold`,
        icon: <AlertCircle size={16} />
      });
    }

    // COA comparison
    const coaCount = artworks.filter(a => a.has_certificate_of_authenticity).length;
    if (coaCount === artworks.length) {
      reasons.push({
        type: 'advantage',
        text: 'All include Certificate of Authenticity',
        icon: <CheckCircle size={16} />
      });
    } else if (coaCount > 0) {
      reasons.push({
        type: 'different',
        text: `${coaCount}/${artworks.length} include COA`,
        icon: <AlertCircle size={16} />
      });
    }

    setComparisonReasons(reasons);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  };

  const formatDimensions = (dimensions: any) => {
    if (!dimensions) return 'Dimensions not specified';
    return `${dimensions.width} × ${dimensions.height} ${dimensions.unit || 'cm'}`;
  };

  const getReasonColor = (type: string) => {
    switch (type) {
      case 'similar':
      case 'advantage':
        return 'text-green-600 bg-green-100';
      case 'different':
        return 'text-yellow-600 bg-yellow-100';
      case 'disadvantage':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`artwork-comparison-overlay ${className}`} onClick={onClose}>
      <div className="comparison-modal" onClick={e => e.stopPropagation()}>
        <div className="comparison-header">
          <h2 className="comparison-title">Compare Artworks</h2>
          <button onClick={onClose} className="close-button">
            <X size={24} />
          </button>
        </div>

        {artworks.length === 0 ? (
          <div className="empty-comparison">
            <Plus size={48} className="empty-icon" />
            <h3>Add artworks to compare</h3>
            <p>Select up to 3 artworks to see detailed comparisons</p>
          </div>
        ) : (
          <div className="comparison-content">
            {/* Comparison Reasons */}
            {comparisonReasons.length > 0 && (
              <div className="comparison-reasons">
                <h3>Key Differences & Similarities</h3>
                <div className="reasons-grid">
                  {comparisonReasons.map((reason, index) => (
                    <div key={index} className={`reason-chip ${getReasonColor(reason.type)}`}>
                      {reason.icon}
                      <span>{reason.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Artworks Grid */}
            <div className="artworks-grid">
              {artworks.map((artwork, index) => (
                <div key={artwork.id} className="comparison-artwork">
                  <div className="artwork-header">
                    <h4 className="artwork-title">{artwork.title}</h4>
                    <button
                      onClick={() => removeArtwork(artwork.id)}
                      className="remove-button"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="artwork-image">
                    <img src={artwork.image_url} alt={artwork.title} />
                    {artwork.badges && (
                      <div className="artwork-badges">
                        {artwork.badges.map((badge, badgeIndex) => (
                          <BadgeSystem key={badgeIndex} type={badge as any} />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="artwork-details">
                    <div className="detail-row">
                      <span className="detail-label">Artist</span>
                      <Link to={`/${artwork.artist_slug}`} className="detail-value">
                        {artwork.artist_name}
                      </Link>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Price</span>
                      <span className="detail-value price">
                        {formatCurrency(artwork.price, artwork.currency)}
                        {artwork.is_price_negotiable && (
                          <span className="negotiable-badge">Negotiable</span>
                        )}
                      </span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Dimensions</span>
                      <span className="detail-value">
                        {formatDimensions(artwork.dimensions)}
                      </span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Medium</span>
                      <span className="detail-value">{artwork.medium}</span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Year</span>
                      <span className="detail-value">{artwork.year}</span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Status</span>
                      <span className={`status-badge status-${artwork.status}`}>
                        {artwork.status}
                      </span>
                    </div>

                    {artwork.dominant_colors && (
                      <div className="detail-row">
                        <span className="detail-label">Colors</span>
                        <div className="color-swatches">
                          {artwork.dominant_colors.slice(0, 5).map((color, colorIndex) => (
                            <div
                              key={colorIndex}
                              className="color-swatch"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {artwork.has_certificate_of_authenticity && (
                      <div className="detail-row">
                        <span className="detail-label">COA</span>
                        <span className="detail-value coa">
                          ✓ Included
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="artwork-actions">
                    <Link
                      to={`/${artwork.artist_slug}/artwork/${artwork.slug}`}
                      className="view-button"
                    >
                      View Details
                      <ArrowRight size={16} />
                    </Link>
                  </div>

                  {/* Scale Badge */}
                  <ScaleBadge dimensions={artwork.dimensions} className="mt-4" />
                </div>
              ))}

              {/* Add More Slot */}
              {artworks.length < 3 && (
                <div className="add-artwork-slot">
                  <div className="add-artwork-content">
                    <Plus size={32} className="add-icon" />
                    <p>Add artwork to compare</p>
                    <span className="add-hint">Click on any artwork to add it here</span>
                  </div>
                </div>
              )}
            </div>

            {/* Trust Surface for all artworks */}
            {artworks.length > 0 && (
              <div className="comparison-trust">
                <TrustSurface 
                  artwork={artworks[0]} 
                  showFullDetails={true}
                  className="mt-6"
                />
              </div>
            )}
          </div>
        )}

        <div className="comparison-footer">
          <button onClick={onClose} className="close-comparison-button">
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArtworkComparison;
