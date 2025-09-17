import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  Heart, 
  Share2, 
  DollarSign, 
  Target,
  Globe,
  Smartphone,
  Calendar,
  Zap,
  AlertCircle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'
import { analytics } from '../../services/analytics'

interface ArtistInsightsProps {
  artistId: string
}

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  color?: string
  format?: 'number' | 'currency' | 'percentage'
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  icon, 
  color = 'var(--primary)',
  format = 'number'
}) => {
  const formatValue = (val: string | number) => {
    if (format === 'currency') {
      return `R${Number(val).toLocaleString()}`
    }
    if (format === 'percentage') {
      return `${Number(val).toFixed(1)}%`
    }
    return Number(val).toLocaleString()
  }

  const getChangeIcon = () => {
    if (change === undefined) return null
    if (change > 0) return <ArrowUp size={16} className="text-green-500" />
    if (change < 0) return <ArrowDown size={16} className="text-red-500" />
    return <Minus size={16} className="text-gray-500" />
  }

  const getChangeColor = () => {
    if (change === undefined) return 'var(--muted)'
    if (change > 0) return 'var(--accent)'
    if (change < 0) return 'var(--danger)'
    return 'var(--muted)'
  }

  return (
    <div style={{
      backgroundColor: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-lg)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-sm)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h3 style={{
          fontSize: '14px',
          fontWeight: '500',
          color: 'var(--muted)',
          margin: 0
        }}>
          {title}
        </h3>
        <div style={{ color }}>
          {icon}
        </div>
      </div>
      
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 'var(--space-sm)'
      }}>
        <span style={{
          fontSize: '24px',
          fontWeight: '700',
          color: 'var(--fg)'
        }}>
          {formatValue(value)}
        </span>
        
        {change !== undefined && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            color: getChangeColor(),
            fontSize: '12px',
            fontWeight: '500'
          }}>
            {getChangeIcon()}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  )
}

const ArtistInsights: React.FC<ArtistInsightsProps> = ({ artistId }) => {
  const [insights, setInsights] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [activeTab, setActiveTab] = useState<'overview' | 'traffic' | 'engagement' | 'sales' | 'referrals' | 'content' | 'audience'>('overview')

  useEffect(() => {
    loadInsights()
  }, [artistId, period])

  const loadInsights = async () => {
    try {
      setLoading(true)
      // Mock data for now - replace with actual API call
      const mockInsights = {
        artist_id: artistId,
        period,
        metrics: {
          total_views: 15420,
          unique_viewers: 3240,
          page_views: 18750,
          artwork_views: 12300,
          catalogue_views: 2100,
          profile_views: 4350,
          likes: 890,
          shares: 234,
          saves: 156,
          follows: 78,
          unfollows: 12,
          inquiries: 45,
          conversations: 23,
          total_sales: 8,
          revenue: 45600,
          average_sale_price: 5700,
          conversion_rate: 2.1,
          engagement_rate: 8.5,
          reach: 8900,
          impressions: 25600,
          click_through_rate: 3.2,
          bounce_rate: 42.1,
          session_duration: 180,
          pages_per_session: 2.3,
          follower_growth: 12.5,
          artwork_growth: 8.2,
          revenue_growth: 23.4,
          view_growth: 15.7
        },
        generated_at: new Date().toISOString()
      }
      setInsights(mockInsights)
    } catch (error) {
      console.error('Error loading insights:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 size={16} /> },
    { id: 'traffic', label: 'Traffic', icon: <Eye size={16} /> },
    { id: 'engagement', label: 'Engagement', icon: <Heart size={16} /> },
    { id: 'sales', label: 'Sales', icon: <DollarSign size={16} /> },
    { id: 'referrals', label: 'Referrals', icon: <Share2 size={16} /> },
    { id: 'content', label: 'Content', icon: <Target size={16} /> },
    { id: 'audience', label: 'Audience', icon: <Users size={16} /> }
  ]

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        flexDirection: 'column',
        gap: 'var(--space-lg)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--border)',
          borderTop: '3px solid var(--primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: 'var(--muted)', fontSize: '16px' }}>Loading insights...</p>
      </div>
    )
  }

  if (!insights) {
    return (
      <div style={{
        textAlign: 'center',
        padding: 'var(--space-3xl)',
        color: 'var(--muted)'
      }}>
        <AlertCircle size={48} style={{ marginBottom: 'var(--space-lg)', opacity: 0.5 }} />
        <h3 style={{ fontSize: '20px', margin: '0 0 var(--space-md) 0' }}>
          No insights available
        </h3>
        <p style={{ margin: 0 }}>
          Insights will appear once you start getting traffic to your profile and artworks.
        </p>
      </div>
    )
  }

  const { metrics } = insights

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      <Helmet>
        <title>Artist Insights | ArtFlow</title>
        <meta name="description" content="Comprehensive analytics and insights for your art business" />
      </Helmet>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: 'var(--space-xl) var(--space-lg)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-xl)',
          flexWrap: 'wrap',
          gap: 'var(--space-md)'
        }}>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              margin: '0 0 var(--space-sm) 0',
              color: 'var(--fg)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-sm)'
            }}>
              <BarChart3 size={32} />
              Artist Insights
            </h1>
            <p style={{
              fontSize: '16px',
              color: 'var(--muted)',
              margin: 0
            }}>
              Comprehensive analytics and performance metrics for your art business
            </p>
          </div>

          {/* Period Selector */}
          <div style={{
            display: 'flex',
            gap: 'var(--space-xs)',
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '4px'
          }}>
            {(['7d', '30d', '90d', '1y'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  padding: 'var(--space-sm) var(--space-md)',
                  border: 'none',
                  backgroundColor: period === p ? 'var(--primary)' : 'transparent',
                  color: period === p ? 'white' : 'var(--fg)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
              >
                {p === '7d' ? '7 days' : p === '30d' ? '30 days' : p === '90d' ? '90 days' : '1 year'}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: 'var(--space-xs)',
          marginBottom: 'var(--space-xl)',
          overflowX: 'auto',
          paddingBottom: 'var(--space-sm)'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)',
                padding: 'var(--space-sm) var(--space-lg)',
                border: '1px solid var(--border)',
                backgroundColor: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                color: activeTab === tab.id ? 'white' : 'var(--fg)',
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Key Metrics Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 'var(--space-lg)',
              marginBottom: 'var(--space-xl)'
            }}>
              <MetricCard
                title="Total Views"
                value={metrics.total_views}
                change={metrics.view_growth}
                icon={<Eye size={20} />}
                color="var(--primary)"
              />
              <MetricCard
                title="Unique Viewers"
                value={metrics.unique_viewers}
                icon={<Users size={20} />}
                color="var(--accent)"
              />
              <MetricCard
                title="Total Revenue"
                value={metrics.revenue}
                change={metrics.revenue_growth}
                icon={<DollarSign size={20} />}
                color="var(--accent)"
                format="currency"
              />
              <MetricCard
                title="Conversion Rate"
                value={metrics.conversion_rate}
                icon={<Target size={20} />}
                color="var(--primary)"
                format="percentage"
              />
              <MetricCard
                title="Engagement Rate"
                value={metrics.engagement_rate}
                icon={<Heart size={20} />}
                color="var(--danger)"
                format="percentage"
              />
              <MetricCard
                title="Follower Growth"
                value={metrics.follower_growth}
                icon={<TrendingUp size={20} />}
                color="var(--accent)"
                format="percentage"
              />
            </div>

            {/* Quick Insights */}
            <div style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-xl)',
              marginBottom: 'var(--space-xl)'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                margin: '0 0 var(--space-lg) 0',
                color: 'var(--fg)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)'
              }}>
                <Zap size={20} />
                Quick Insights
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 'var(--space-lg)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-sm)',
                  padding: 'var(--space-md)',
                  backgroundColor: 'var(--border)',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <CheckCircle size={20} style={{ color: 'var(--accent)', marginTop: '2px' }} />
                  <div>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      margin: '0 0 var(--space-xs) 0',
                      color: 'var(--fg)'
                    }}>
                      Top Performing Content
                    </h4>
                    <p style={{
                      fontSize: '14px',
                      color: 'var(--muted)',
                      margin: 0
                    }}>
                      Your abstract paintings are generating 3x more engagement than other mediums
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-sm)',
                  padding: 'var(--space-md)',
                  backgroundColor: 'var(--border)',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <AlertCircle size={20} style={{ color: 'var(--danger)', marginTop: '2px' }} />
                  <div>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      margin: '0 0 var(--space-xs) 0',
                      color: 'var(--fg)'
                    }}>
                      Growth Opportunity
                    </h4>
                    <p style={{
                      fontSize: '14px',
                      color: 'var(--muted)',
                      margin: 0
                    }}>
                      Consider posting more content on weekends - 40% higher engagement
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-sm)',
                  padding: 'var(--space-md)',
                  backgroundColor: 'var(--border)',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <TrendingUp size={20} style={{ color: 'var(--accent)', marginTop: '2px' }} />
                  <div>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      margin: '0 0 var(--space-xs) 0',
                      color: 'var(--fg)'
                    }}>
                      Revenue Trend
                    </h4>
                    <p style={{
                      fontSize: '14px',
                      color: 'var(--muted)',
                      margin: 0
                    }}>
                      Sales are up 23% this month compared to last month
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Traffic Tab */}
        {activeTab === 'traffic' && (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 'var(--space-lg)',
              marginBottom: 'var(--space-xl)'
            }}>
              <MetricCard
                title="Page Views"
                value={metrics.page_views}
                icon={<Eye size={20} />}
                color="var(--primary)"
              />
              <MetricCard
                title="Artwork Views"
                value={metrics.artwork_views}
                icon={<Target size={20} />}
                color="var(--accent)"
              />
              <MetricCard
                title="Profile Views"
                value={metrics.profile_views}
                icon={<Users size={20} />}
                color="var(--primary)"
              />
              <MetricCard
                title="Catalogue Views"
                value={metrics.catalogue_views}
                icon={<BarChart3 size={20} />}
                color="var(--accent)"
              />
            </div>

            {/* Traffic Sources */}
            <div style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-xl)'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                margin: '0 0 var(--space-lg) 0',
                color: 'var(--fg)'
              }}>
                Traffic Sources
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--space-md)'
              }}>
                {[
                  { source: 'Direct', visits: 45, color: 'var(--primary)' },
                  { source: 'Social Media', visits: 30, color: 'var(--accent)' },
                  { source: 'Search Engines', visits: 20, color: 'var(--danger)' },
                  { source: 'Referrals', visits: 5, color: 'var(--muted)' }
                ].map((source, index) => (
                  <div key={index} style={{
                    padding: 'var(--space-md)',
                    backgroundColor: 'var(--border)',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      backgroundColor: source.color,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto var(--space-sm) auto',
                      color: 'white',
                      fontSize: '20px',
                      fontWeight: '700'
                    }}>
                      {source.visits}%
                    </div>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      margin: '0 0 var(--space-xs) 0',
                      color: 'var(--fg)'
                    }}>
                      {source.source}
                    </h4>
                    <p style={{
                      fontSize: '14px',
                      color: 'var(--muted)',
                      margin: 0
                    }}>
                      {source.visits}% of traffic
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Engagement Tab */}
        {activeTab === 'engagement' && (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 'var(--space-lg)',
              marginBottom: 'var(--space-xl)'
            }}>
              <MetricCard
                title="Likes"
                value={metrics.likes}
                icon={<Heart size={20} />}
                color="var(--danger)"
              />
              <MetricCard
                title="Shares"
                value={metrics.shares}
                icon={<Share2 size={20} />}
                color="var(--accent)"
              />
              <MetricCard
                title="Saves"
                value={metrics.saves}
                icon={<Target size={20} />}
                color="var(--primary)"
              />
              <MetricCard
                title="Inquiries"
                value={metrics.inquiries}
                icon={<Users size={20} />}
                color="var(--accent)"
              />
            </div>

            {/* Engagement Rate Chart Placeholder */}
            <div style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-xl)',
              textAlign: 'center'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                margin: '0 0 var(--space-lg) 0',
                color: 'var(--fg)'
              }}>
                Engagement Over Time
              </h3>
              <div style={{
                height: '300px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--muted)'
              }}>
                Chart visualization would go here
              </div>
            </div>
          </div>
        )}

        {/* Sales Tab */}
        {activeTab === 'sales' && (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 'var(--space-lg)',
              marginBottom: 'var(--space-xl)'
            }}>
              <MetricCard
                title="Total Sales"
                value={metrics.total_sales}
                icon={<DollarSign size={20} />}
                color="var(--accent)"
              />
              <MetricCard
                title="Total Revenue"
                value={metrics.revenue}
                change={metrics.revenue_growth}
                icon={<TrendingUp size={20} />}
                color="var(--accent)"
                format="currency"
              />
              <MetricCard
                title="Average Sale Price"
                value={metrics.average_sale_price}
                icon={<Target size={20} />}
                color="var(--primary)"
                format="currency"
              />
              <MetricCard
                title="Conversion Rate"
                value={metrics.conversion_rate}
                icon={<BarChart3 size={20} />}
                color="var(--primary)"
                format="percentage"
              />
            </div>

            {/* Sales Funnel */}
            <div style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-xl)'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                margin: '0 0 var(--space-lg) 0',
                color: 'var(--fg)'
              }}>
                Sales Funnel
              </h3>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-md)'
              }}>
                {[
                  { stage: 'Views', count: metrics.artwork_views, percentage: 100 },
                  { stage: 'Inquiries', count: metrics.inquiries, percentage: (metrics.inquiries / metrics.artwork_views * 100) },
                  { stage: 'Conversations', count: metrics.conversations, percentage: (metrics.conversations / metrics.artwork_views * 100) },
                  { stage: 'Sales', count: metrics.total_sales, percentage: (metrics.total_sales / metrics.artwork_views * 100) }
                ].map((stage, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-md)',
                    padding: 'var(--space-md)',
                    backgroundColor: 'var(--border)',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: 'var(--primary)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: '700'
                    }}>
                      {index + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        margin: '0 0 var(--space-xs) 0',
                        color: 'var(--fg)'
                      }}>
                        {stage.stage}
                      </h4>
                      <p style={{
                        fontSize: '14px',
                        color: 'var(--muted)',
                        margin: 0
                      }}>
                        {stage.count.toLocaleString()} ({stage.percentage.toFixed(1)}%)
                      </p>
                    </div>
                    <div style={{
                      width: '200px',
                      height: '8px',
                      backgroundColor: 'var(--border)',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${stage.percentage}%`,
                        height: '100%',
                        backgroundColor: 'var(--primary)',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Other tabs would be implemented similarly */}
        {activeTab === 'referrals' && (
          <div style={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-xl)',
            textAlign: 'center'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              margin: '0 0 var(--space-lg) 0',
              color: 'var(--fg)'
            }}>
              Referral Analytics
            </h3>
            <p style={{ color: 'var(--muted)' }}>
              Referral tracking and UTM analytics would be displayed here
            </p>
          </div>
        )}

        {activeTab === 'content' && (
          <div style={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-xl)',
            textAlign: 'center'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              margin: '0 0 var(--space-lg) 0',
              color: 'var(--fg)'
            }}>
              Content Performance
            </h3>
            <p style={{ color: 'var(--muted)' }}>
              Individual artwork and catalogue performance metrics would be displayed here
            </p>
          </div>
        )}

        {activeTab === 'audience' && (
          <div style={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-xl)',
            textAlign: 'center'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              margin: '0 0 var(--space-lg) 0',
              color: 'var(--fg)'
            }}>
              Audience Demographics
            </h3>
            <p style={{ color: 'var(--muted)' }}>
              Geographic, demographic, and behavioral audience insights would be displayed here
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ArtistInsights
