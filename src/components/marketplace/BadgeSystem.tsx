import React from 'react';
import { TrendingUp, Star, Users, Calendar, Award, Eye, Heart } from 'lucide-react';

interface BadgeProps {
  type: 'new_this_month' | 'editors_pick' | 'rising_star' | 'collector_interest' | 'trending' | 'featured' | 'sold_out' | 'limited_edition';
  value?: number;
  className?: string;
}

const BadgeSystem: React.FC<BadgeProps> = ({ type, value, className = '' }) => {
  const badgeConfig = {
    new_this_month: {
      icon: Calendar,
      text: 'New This Month',
      bgColor: 'bg-green-100 text-green-800',
      borderColor: 'border-green-200'
    },
    editors_pick: {
      icon: Star,
      text: "Editor's Pick",
      bgColor: 'bg-purple-100 text-purple-800',
      borderColor: 'border-purple-200'
    },
    rising_star: {
      icon: TrendingUp,
      text: 'Rising Star',
      bgColor: 'bg-blue-100 text-blue-800',
      borderColor: 'border-blue-200'
    },
    collector_interest: {
      icon: Users,
      text: value ? `${value}% More Collectors Interested` : 'High Interest',
      bgColor: 'bg-orange-100 text-orange-800',
      borderColor: 'border-orange-200'
    },
    trending: {
      icon: TrendingUp,
      text: 'Trending',
      bgColor: 'bg-red-100 text-red-800',
      borderColor: 'border-red-200'
    },
    featured: {
      icon: Award,
      text: 'Featured',
      bgColor: 'bg-yellow-100 text-yellow-800',
      borderColor: 'border-yellow-200'
    },
    sold_out: {
      icon: Eye,
      text: 'Sold Out',
      bgColor: 'bg-gray-100 text-gray-800',
      borderColor: 'border-gray-200'
    },
    limited_edition: {
      icon: Heart,
      text: 'Limited Edition',
      bgColor: 'bg-pink-100 text-pink-800',
      borderColor: 'border-pink-200'
    }
  };

  const config = badgeConfig[type];
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.bgColor} ${config.borderColor} ${className}`}>
      <Icon size={12} />
      <span>{config.text}</span>
    </div>
  );
};

export default BadgeSystem;

// Hook for determining which badges to show
export const useArtworkBadges = (artwork: any) => {
  const badges = [];

  // New this month (created within last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  if (new Date(artwork.created_at) > thirtyDaysAgo) {
    badges.push({ type: 'new_this_month' as const });
  }

  // Rising star (high engagement in last 7 days)
  if (artwork.engagement_score > 0.8) {
    badges.push({ type: 'rising_star' as const });
  }

  // Collector interest (based on views, likes, inquiries)
  const interestScore = calculateInterestScore(artwork);
  if (interestScore > 0.7) {
    badges.push({ 
      type: 'collector_interest' as const, 
      value: Math.round(interestScore * 100) 
    });
  }

  // Trending (high velocity of interactions)
  if (artwork.trending_score > 0.6) {
    badges.push({ type: 'trending' as const });
  }

  // Limited edition
  if (artwork.edition_info?.is_limited_edition) {
    badges.push({ type: 'limited_edition' as const });
  }

  // Sold out
  if (artwork.status === 'sold') {
    badges.push({ type: 'sold_out' as const });
  }

  return badges;
};

// Helper function to calculate interest score
const calculateInterestScore = (artwork: any) => {
  const views = artwork.views_count || 0;
  const likes = artwork.likes_count || 0;
  const inquiries = artwork.inquiries_count || 0;
  const shares = artwork.shares_count || 0;
  
  // Weighted scoring
  const score = (views * 0.1 + likes * 0.3 + inquiries * 0.4 + shares * 0.2) / 100;
  return Math.min(score, 1);
};
