import React from 'react';
import { Ruler, Home, Bed, Monitor } from 'lucide-react';

interface ScaleBadgeProps {
  dimensions: {
    width: number;
    height: number;
    unit: string;
  };
  className?: string;
}

const ScaleBadge: React.FC<ScaleBadgeProps> = ({ dimensions, className = '' }) => {
  // Convert to cm for calculations
  const widthCm = dimensions.unit === 'cm' ? dimensions.width : dimensions.width * 2.54;
  const heightCm = dimensions.unit === 'cm' ? dimensions.height : dimensions.height * 2.54;
  
  // Reference sizes (in cm)
  const couchHeight = 40; // Average couch back height
  const bedHeight = 60; // Average headboard height
  const deskHeight = 75; // Average desk height
  
  const getFitInfo = () => {
    const fits = [];
    
    if (heightCm <= couchHeight) {
      fits.push({ icon: Home, text: 'Fits above couch', color: 'text-green-600' });
    }
    
    if (heightCm <= bedHeight) {
      fits.push({ icon: Bed, text: 'Fits above bed', color: 'text-blue-600' });
    }
    
    if (heightCm <= deskHeight) {
      fits.push({ icon: Monitor, text: 'Fits above desk', color: 'text-purple-600' });
    }
    
    return fits;
  };

  const fits = getFitInfo();
  
  if (fits.length === 0) return null;

  return (
    <div className={`scale-badge ${className}`}>
      <div className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg shadow-sm">
        <Ruler size={16} className="text-gray-600" />
        <div className="text-sm">
          <span className="font-medium text-gray-900">
            {dimensions.width} × {dimensions.height} {dimensions.unit}
          </span>
          <div className="flex items-center gap-2 mt-1">
            {fits.map((fit, index) => {
              const Icon = fit.icon;
              return (
                <div key={index} className="flex items-center gap-1">
                  <Icon size={12} className={fit.color} />
                  <span className="text-xs text-gray-600">{fit.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScaleBadge;
