import React from 'react';
import { Shield, Truck, RotateCcw, CreditCard, Award, Clock, CheckCircle } from 'lucide-react';

interface TrustSurfaceProps {
  artwork: any;
  showFullDetails?: boolean;
  className?: string;
}

const TrustSurface: React.FC<TrustSurfaceProps> = ({ 
  artwork, 
  showFullDetails = false, 
  className = '' 
}) => {
  const trustElements = [];

  // COA Badge
  if (artwork.has_certificate_of_authenticity) {
    trustElements.push({
      icon: Award,
      text: 'Certificate of Authenticity',
      description: artwork.certificate_of_authenticity_details || 'Included with purchase',
      color: 'text-green-600'
    });
  }

  // Return Policy
  trustElements.push({
    icon: RotateCcw,
    text: '30-Day Returns',
    description: 'Full refund if not satisfied',
    color: 'text-blue-600'
  });

  // Shipping
  trustElements.push({
    icon: Truck,
    text: 'Free Shipping',
    description: 'Secure packaging included',
    color: 'text-purple-600'
  });

  // Payment Security
  trustElements.push({
    icon: Shield,
    text: 'Secure Payment',
    description: 'Protected by PayFast & Google Pay',
    color: 'text-indigo-600'
  });

  // Processing Time
  trustElements.push({
    icon: Clock,
    text: '2-3 Day Processing',
    description: 'Quick dispatch after payment',
    color: 'text-orange-600'
  });

  // Buyer Protection
  trustElements.push({
    icon: CheckCircle,
    text: 'Buyer Protection',
    description: 'Guaranteed authenticity & condition',
    color: 'text-emerald-600'
  });

  return (
    <div className={`trust-surface ${className}`}>
      <div className="trust-badges grid grid-cols-2 md:grid-cols-3 gap-3">
        {trustElements.map((element, index) => {
          const Icon = element.icon;
          return (
            <div key={index} className="trust-badge flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
              <Icon size={16} className={`mt-0.5 ${element.color}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{element.text}</p>
                {showFullDetails && (
                  <p className="text-xs text-gray-600 mt-1">{element.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {showFullDetails && (
        <div className="buyer-protection mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Buyer Protection Guarantee</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Authenticity guaranteed or full refund</li>
            <li>• Condition as described or return accepted</li>
            <li>• Secure payment processing</li>
            <li>• Professional packaging and insurance</li>
            <li>• Direct communication with artist</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default TrustSurface;
