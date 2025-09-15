import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  Heart, 
  MessageCircle, 
  Plus,
  Settings,
  Palette,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthProvider';

interface DashboardStats {
  totalArtworks: number;
  totalViews: number;
  totalLikes: number;
  totalMessages: number;
  monthlySales: number;
  monthlyViews: number;
}

export default function ArtistDashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalArtworks: 0,
    totalViews: 0,
    totalLikes: 0,
    totalMessages: 0,
    monthlySales: 0,
    monthlyViews: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading dashboard data
  const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStats({
          totalArtworks: 12,
          totalViews: 1250,
          totalLikes: 89,
          totalMessages: 23,
          monthlySales: 3,
          monthlyViews: 450
        });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const statCards = [
    {
      title: 'Total Artworks',
      value: stats.totalArtworks,
      icon: Palette,
      color: 'var(--primary)',
      change: '+2 this month'
    },
    {
      title: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      color: 'var(--info)',
      change: '+15% this month'
    },
    {
      title: 'Likes Received',
      value: stats.totalLikes,
      icon: Heart,
      color: 'var(--danger)',
      change: '+8 this week'
    },
    {
      title: 'Messages',
      value: stats.totalMessages,
      icon: MessageCircle,
      color: 'var(--warning)',
      change: '+3 new'
    },
    {
      title: 'Monthly Sales',
      value: stats.monthlySales,
      icon: TrendingUp,
      color: 'var(--success)',
      change: '+1 this month'
    },
    {
      title: 'Monthly Views',
      value: stats.monthlyViews.toLocaleString(),
      icon: BarChart3,
      color: 'var(--purple)',
      change: '+12% vs last month'
    }
  ];

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="artist-dashboard">
      <Helmet>
        <title>Artist Dashboard - ArtFlow</title>
        <meta name="description" content="Manage your art portfolio and track your performance" />
      </Helmet>

      <div className="artist-dashboard-container">
          {/* Header */}
        <div className="artist-dashboard-header">
            <div>
            <h1 className="artist-dashboard-title">
              Welcome back, {profile?.display_name || 'Artist'}!
              </h1>
            <p className="artist-dashboard-subtitle">
              Here's how your art is performing
              </p>
            </div>
          <div className="artist-dashboard-actions">
            <button className="artflow-button">
                <Plus size={16} />
                Add Artwork
            </button>
            <button className="artflow-button artflow-button--outline">
              <Settings size={16} />
              Settings
            </button>
          </div>
          </div>

          {/* Stats Grid */}
        <div className="artist-dashboard-stats-grid">
          {statCards.map((stat, index) => (
            <div key={index} className="artist-stat-card">
              <div 
                className="artist-stat-icon"
                style={{ backgroundColor: stat.color + '20' }}
              >
                <stat.icon size={24} style={{ color: stat.color }} />
              </div>
              <div className="artist-stat-content">
                <div className="artist-stat-value">
                  {stat.value}
            </div>
                <div className="artist-stat-title">
                  {stat.title}
              </div>
                <div className="artist-stat-change">
                  {stat.change}
            </div>
              </div>
            </div>
          ))}
              </div>

        {/* Quick Actions */}
        <div className="artist-quick-actions">
          <h2 className="artist-quick-actions-title">
            Quick Actions
          </h2>
          <div className="artist-quick-actions-grid">
            <button className="artist-quick-action-btn">
              <Plus size={16} />
              Upload New Artwork
            </button>
            <button className="artist-quick-action-btn">
              <Calendar size={16} />
              Schedule Exhibition
            </button>
            <button className="artist-quick-action-btn">
              <Users size={16} />
              View Followers
            </button>
            <button className="artist-quick-action-btn">
              <BarChart3 size={16} />
              View Analytics
            </button>
          </div>
              </div>

        {/* Recent Activity */}
        <div className="artist-recent-activity">
          <h2 className="artist-recent-activity-title">
            Recent Activity
          </h2>
          <div className="artist-activity-list">
            <div className="artist-activity-item">
              <div className="artist-activity-indicator artist-activity-indicator--success" />
              <div className="artist-activity-content">
                <div className="artist-activity-text">
                  New artwork "Sunset Dreams" uploaded
                </div>
                <div className="artist-activity-time">
                  2 hours ago
                        </div>
                      </div>
                    </div>
            <div className="artist-activity-item">
              <div className="artist-activity-indicator artist-activity-indicator--info" />
              <div className="artist-activity-content">
                <div className="artist-activity-text">
                  Received 5 new likes on "Ocean Waves"
                </div>
                <div className="artist-activity-time">
                  4 hours ago
                </div>
              </div>
            </div>
            <div className="artist-activity-item">
              <div className="artist-activity-indicator artist-activity-indicator--warning" />
              <div className="artist-activity-content">
                <div className="artist-activity-text">
                  New message from potential buyer
                    </div>
                <div className="artist-activity-time">
                  6 hours ago
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}