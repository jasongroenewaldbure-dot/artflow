import React, { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from "../components/common/LoadingSpinner"
import { 
  Plus, 
  Palette, 
  BookOpen, 
  Users, 
  MessageSquare, 
  Calendar, 
  TrendingUp, 
  Eye, 
  Heart, 
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  BarChart3,
  Target,
  Bell,
  Settings,
  Search
} from 'lucide-react'

type User = { 
  id: string
  email: string
  role: 'artist' | 'collector' | 'both'
  name?: string
  password_set?: boolean
  profile_completed?: boolean
}

interface TodoItem {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  category: 'artwork' | 'catalogue' | 'contact' | 'sale' | 'marketing'
  dueDate?: string
  completed: boolean
  actionUrl: string
}

interface QuickStat {
  title: string
  value: string | number
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: React.ReactNode
}

interface RecentActivity {
  id: string
  type: 'view' | 'inquiry' | 'sale' | 'catalogue' | 'artwork'
  title: string
  description: string
  timestamp: string
  icon: React.ReactNode
}

export default function Dashboard() {
  const [me, setMe] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  const [todos, setTodos] = useState<TodoItem[]>([
    {
      id: '1',
      title: 'Add new artwork to portfolio',
      description: 'Upload and catalog your latest creation',
      priority: 'high',
      category: 'artwork',
      dueDate: '2024-01-15',
      completed: false,
      actionUrl: '/artworks/new'
    },
    {
      id: '2',
      title: 'Follow up with Sarah Johnson',
      description: 'She inquired about "Sunset Dreams" last week',
      priority: 'medium',
      category: 'contact',
      dueDate: '2024-01-12',
      completed: false,
      actionUrl: '/contacts/sarah-johnson'
    },
    {
      id: '3',
      title: 'Create spring collection catalogue',
      description: 'Prepare digital catalogue for upcoming season',
      priority: 'high',
      category: 'catalogue',
      dueDate: '2024-01-20',
      completed: false,
      actionUrl: '/catalogues/new'
    },
    {
      id: '4',
      title: 'Update pricing for older works',
      description: 'Review and adjust prices based on market trends',
      priority: 'low',
      category: 'artwork',
      completed: false,
      actionUrl: '/artworks'
    },
    {
      id: '5',
      title: 'Schedule social media posts',
      description: 'Plan content for this week\'s marketing',
      priority: 'medium',
      category: 'marketing',
      completed: true,
      actionUrl: '/marketing'
    }
  ])

  const [quickStats] = useState<QuickStat[]>([
    {
      title: 'Total Views',
      value: '2,847',
      change: '+12%',
      changeType: 'positive',
      icon: <Eye size={20} />
    },
    {
      title: 'Inquiries',
      value: '23',
      change: '+8%',
      changeType: 'positive',
      icon: <MessageSquare size={20} />
    },
    {
      title: 'Sales This Month',
      value: '$12,450',
      change: '+25%',
      changeType: 'positive',
      icon: <DollarSign size={20} />
    },
    {
      title: 'Portfolio Items',
      value: '47',
      change: '+3',
      changeType: 'positive',
      icon: <Palette size={20} />
    }
  ])

  const [recentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'inquiry',
      title: 'New inquiry for "Ocean Waves"',
      description: 'From collector@example.com',
      timestamp: '2 hours ago',
      icon: <MessageSquare size={16} />
    },
    {
      id: '2',
      type: 'view',
      title: 'Portfolio viewed 15 times',
      description: 'From various visitors',
      timestamp: '4 hours ago',
      icon: <Eye size={16} />
    },
    {
      id: '3',
      type: 'sale',
      title: 'Artwork sold: "Mountain Peak"',
      description: 'Sold for $2,500',
      timestamp: '1 day ago',
      icon: <DollarSign size={16} />
    },
    {
      id: '4',
      type: 'catalogue',
      title: 'Catalogue "Spring Collection" sent',
      description: 'To 25 contacts',
      timestamp: '2 days ago',
      icon: <BookOpen size={16} />
    }
  ])
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError
        if (!user) throw new Error('No user found')

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('display_name, full_name, role, created_at')
          .eq('id', user.id)
          .single()

        if (profileError) {
          // Profile doesn't exist or incomplete
          if (profileError.code === 'PGRST116') {
            setMe(null)
            return
          }
          throw profileError
        }

        // Check if profile is complete
        const isProfileComplete = profile.role && profile.password_set && profile.profile_completed

        setMe({
          id: user.id,
          email: user.email || '',
          role: profile.role || 'collector',
          name: profile.display_name || user.email || 'User',
          password_set: profile.password_set || false,
          profile_completed: isProfileComplete
        })
      } catch (error) {
        console.error('Error fetching user:', error)
        setMe(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'var(--danger)'
      case 'medium': return '#ff9500'
      case 'low': return 'var(--success)'
      default: return 'var(--muted)'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'artwork': return <Palette size={16} />
      case 'catalogue': return <BookOpen size={16} />
      case 'contact': return <Users size={16} />
      case 'sale': return <DollarSign size={16} />
      case 'marketing': return <TrendingUp size={16} />
      default: return <Target size={16} />
    }
  }

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  // Redirect to start if no user
  if (!loading && !me) {
    return <Navigate to="/start" replace />
  }

  // Redirect to onboarding if profile incomplete
  if (!loading && me && (!me.profile_completed || !me.password_set)) {
    return <Navigate to="/onboarding" replace />
  }

  const pendingTodos = todos.filter(todo => !todo.completed)
  const completedTodos = todos.filter(todo => todo.completed)

  return (
    <div className="dashboard-page-container">
      <Helmet>
        <title>Dashboard | ArtFlow</title>
        <meta name="description" content="Your personalized dashboard with smart to-do suggestions and insights." />
      </Helmet>
      
      {loading ? (
        <div className="dashboard-loading">
          <LoadingSpinner size="lg" text="Loading dashboard..." />
        </div>
      ) : me?.role === 'artist' ? (
        <div className="artist-dashboard-container">
          <div className="artist-dashboard-header">
            <div className="artist-dashboard-welcome">
              <h1 className="artist-dashboard-title">Welcome back, Artist!</h1>
              <p className="artist-dashboard-subtitle">
                Here's what's happening with your art business today.
              </p>
            </div>
            <div className="artist-dashboard-actions">
              <Link to="/artworks/new" className="artist-dashboard-button artist-dashboard-button--primary">
                <Plus size={18} />
                Add Artwork
              </Link>
              <Link to="/catalogues/new" className="artist-dashboard-button artist-dashboard-button--secondary">
                <BookOpen size={18} />
                Create Catalogue
              </Link>
            </div>
          </div>

          <div className="artist-dashboard-grid">
            {/* Quick Stats */}
            <div className="artist-dashboard-section">
              <h2 className="artist-dashboard-section-title">Quick Stats</h2>
              <div className="artist-dashboard-stats-grid">
                {quickStats.map((stat, index) => (
                  <div key={index} className="artist-dashboard-stat-card">
                    <div className="artist-dashboard-stat-icon">
                      {stat.icon}
                    </div>
                    <div className="artist-dashboard-stat-content">
                      <div className="artist-dashboard-stat-value">{stat.value}</div>
                      <div className="artist-dashboard-stat-title">{stat.title}</div>
                      <div className={`artist-dashboard-stat-change artist-dashboard-stat-change--${stat.changeType}`}>
                        {stat.change}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart To-Do List */}
            <div className="artist-dashboard-section">
              <div className="artist-dashboard-section-header">
                <h2 className="artist-dashboard-section-title">Smart To-Do List</h2>
                <span className="artist-dashboard-todo-count">
                  {pendingTodos.length} pending
                </span>
              </div>
              
              <div className="artist-dashboard-todos">
                {pendingTodos.map((todo) => (
                  <div key={todo.id} className="artist-dashboard-todo-item">
                    <div className="artist-dashboard-todo-checkbox">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo.id)}
                        className="artist-dashboard-todo-input"
                      />
                    </div>
                    <div className="artist-dashboard-todo-content">
                      <div className="artist-dashboard-todo-header">
                        <h3 className="artist-dashboard-todo-title">{todo.title}</h3>
                        <div className="artist-dashboard-todo-meta">
                          <span 
                            className="artist-dashboard-todo-priority"
                            style={{ color: getPriorityColor(todo.priority) }}
                          >
                            {todo.priority}
                          </span>
                          <span className="artist-dashboard-todo-category">
                            {getCategoryIcon(todo.category)}
                            {todo.category}
                          </span>
                        </div>
                      </div>
                      <p className="artist-dashboard-todo-description">{todo.description}</p>
                      {todo.dueDate && (
                        <div className="artist-dashboard-todo-due">
                          <Clock size={14} />
                          Due {new Date(todo.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <Link 
                      to={todo.actionUrl}
                      className="artist-dashboard-todo-action"
                    >
                      Take Action
                    </Link>
                  </div>
                ))}
              </div>

              {completedTodos.length > 0 && (
                <div className="artist-dashboard-completed-todos">
                  <h3 className="artist-dashboard-completed-title">
                    <CheckCircle size={16} />
                    Completed ({completedTodos.length})
                  </h3>
                  <div className="artist-dashboard-completed-list">
                    {completedTodos.map((todo) => (
                      <div key={todo.id} className="artist-dashboard-completed-item">
                        <CheckCircle size={14} />
                        <span className="artist-dashboard-completed-text">{todo.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="artist-dashboard-section">
              <h2 className="artist-dashboard-section-title">Recent Activity</h2>
              <div className="artist-dashboard-activity-list">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="artist-dashboard-activity-item">
                    <div className="artist-dashboard-activity-icon">
                      {activity.icon}
                    </div>
                    <div className="artist-dashboard-activity-content">
                      <h4 className="artist-dashboard-activity-title">{activity.title}</h4>
                      <p className="artist-dashboard-activity-description">{activity.description}</p>
                      <span className="artist-dashboard-activity-time">{activity.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="artist-dashboard-section">
              <h2 className="artist-dashboard-section-title">Quick Actions</h2>
              <div className="artist-dashboard-quick-actions">
                <Link to="/artworks" className="artist-dashboard-quick-action">
                  <Palette size={24} />
                  <span>Manage Artworks</span>
                </Link>
                <Link to="/catalogues" className="artist-dashboard-quick-action">
                  <BookOpen size={24} />
                  <span>View Catalogues</span>
                </Link>
                <Link to="/contacts" className="artist-dashboard-quick-action">
                  <Users size={24} />
                  <span>Manage Contacts</span>
                </Link>
                <Link to="/messages" className="artist-dashboard-quick-action">
                  <MessageSquare size={24} />
                  <span>View Messages</span>
                </Link>
                <Link to="/calendar" className="artist-dashboard-quick-action">
                  <Calendar size={24} />
                  <span>View Calendar</span>
                </Link>
                <Link to="/analytics" className="artist-dashboard-quick-action">
                  <BarChart3 size={24} />
                  <span>View Analytics</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="collector-dashboard-container">
          <div className="collector-dashboard-header">
            <div className="collector-dashboard-welcome">
              <h1 className="collector-dashboard-title">Welcome back, Collector!</h1>
              <p className="collector-dashboard-subtitle">
                Discover new artworks and manage your collection.
              </p>
            </div>
            <div className="collector-dashboard-actions">
              <Link to="/search" className="collector-dashboard-button collector-dashboard-button--primary">
                <Search size={18} />
                Discover Art
              </Link>
              <Link to="/collection" className="collector-dashboard-button collector-dashboard-button--secondary">
                <Heart size={18} />
                My Collection
              </Link>
            </div>
          </div>

          <div className="collector-dashboard-grid">
            {/* Quick Stats */}
            <div className="collector-dashboard-section">
              <h2 className="collector-dashboard-section-title">Your Collection</h2>
              <div className="collector-dashboard-stats-grid">
                <div className="collector-dashboard-stat-card">
                  <div className="collector-dashboard-stat-icon">
                    <Heart size={20} />
                  </div>
                  <div className="collector-dashboard-stat-content">
                    <div className="collector-dashboard-stat-value">12</div>
                    <div className="collector-dashboard-stat-title">Artworks Owned</div>
                    <div className="collector-dashboard-stat-change collector-dashboard-stat-change--positive">
                      +2 this month
                    </div>
                  </div>
                </div>
                <div className="collector-dashboard-stat-card">
                  <div className="collector-dashboard-stat-icon">
                    <Users size={20} />
                  </div>
                  <div className="collector-dashboard-stat-content">
                    <div className="collector-dashboard-stat-value">8</div>
                    <div className="collector-dashboard-stat-title">Artists Followed</div>
                    <div className="collector-dashboard-stat-change collector-dashboard-stat-change--positive">
                      +1 this week
                    </div>
                  </div>
                </div>
                <div className="collector-dashboard-stat-card">
                  <div className="collector-dashboard-stat-icon">
                    <DollarSign size={20} />
                  </div>
                  <div className="collector-dashboard-stat-content">
                    <div className="collector-dashboard-stat-value">$45,200</div>
                    <div className="collector-dashboard-stat-title">Collection Value</div>
                    <div className="collector-dashboard-stat-change collector-dashboard-stat-change--positive">
                      +12% this year
                    </div>
                  </div>
                </div>
                <div className="collector-dashboard-stat-card">
                  <div className="collector-dashboard-stat-icon">
                    <BookOpen size={20} />
                  </div>
                  <div className="collector-dashboard-stat-content">
                    <div className="collector-dashboard-stat-value">5</div>
                    <div className="collector-dashboard-stat-title">Catalogues Saved</div>
                    <div className="collector-dashboard-stat-change collector-dashboard-stat-change--neutral">
                      No change
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended Artworks */}
            <div className="collector-dashboard-section">
              <h2 className="collector-dashboard-section-title">Recommended for You</h2>
              <div className="collector-dashboard-recommendations">
                <div className="collector-dashboard-recommendation-item">
                  <div className="collector-dashboard-recommendation-image">
                    <img src="/api/placeholder/200/200" alt="Recommended artwork" />
                  </div>
                  <div className="collector-dashboard-recommendation-info">
                    <h3>Abstract Expression</h3>
                    <p>By Sarah Johnson</p>
                    <p className="collector-dashboard-recommendation-price">$2,500</p>
                  </div>
                </div>
                <div className="collector-dashboard-recommendation-item">
                  <div className="collector-dashboard-recommendation-image">
                    <img src="/api/placeholder/200/200" alt="Recommended artwork" />
                  </div>
                  <div className="collector-dashboard-recommendation-info">
                    <h3>Urban Landscape</h3>
                    <p>By Michael Chen</p>
                    <p className="collector-dashboard-recommendation-price">$1,800</p>
                  </div>
                </div>
                <div className="collector-dashboard-recommendation-item">
                  <div className="collector-dashboard-recommendation-image">
                    <img src="/api/placeholder/200/200" alt="Recommended artwork" />
                  </div>
                  <div className="collector-dashboard-recommendation-info">
                    <h3>Ocean Waves</h3>
                    <p>By Emma Wilson</p>
                    <p className="collector-dashboard-recommendation-price">$3,200</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="collector-dashboard-section">
              <h2 className="collector-dashboard-section-title">Recent Activity</h2>
              <div className="collector-dashboard-activity-list">
                <div className="collector-dashboard-activity-item">
                  <div className="collector-dashboard-activity-icon">
                    <Heart size={16} />
                  </div>
                  <div className="collector-dashboard-activity-content">
                    <h4>Added "Sunset Dreams" to favorites</h4>
                    <p>By Sarah Johnson</p>
                    <span className="collector-dashboard-activity-time">2 hours ago</span>
                  </div>
                </div>
                <div className="collector-dashboard-activity-item">
                  <div className="collector-dashboard-activity-icon">
                    <MessageSquare size={16} />
                  </div>
                  <div className="collector-dashboard-activity-content">
                    <h4>Inquiry sent for "Urban Reflections"</h4>
                    <p>Waiting for artist response</p>
                    <span className="collector-dashboard-activity-time">1 day ago</span>
                  </div>
                </div>
                <div className="collector-dashboard-activity-item">
                  <div className="collector-dashboard-activity-icon">
                    <BookOpen size={16} />
                  </div>
                  <div className="collector-dashboard-activity-content">
                    <h4>New catalogue received</h4>
                    <p>"Spring Collection" by Emma Wilson</p>
                    <span className="collector-dashboard-activity-time">3 days ago</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="collector-dashboard-section">
              <h2 className="collector-dashboard-section-title">Quick Actions</h2>
              <div className="collector-dashboard-quick-actions">
                <Link to="/search" className="collector-dashboard-quick-action">
                  <Search size={24} />
                  <span>Discover Art</span>
                </Link>
                <Link to="/collection" className="collector-dashboard-quick-action">
                  <Heart size={24} />
                  <span>My Collection</span>
                </Link>
                <Link to="/favorites" className="collector-dashboard-quick-action">
                  <Star size={24} />
                  <span>Favorites</span>
                </Link>
                <Link to="/artists" className="collector-dashboard-quick-action">
                  <Users size={24} />
                  <span>Followed Artists</span>
                </Link>
                <Link to="/catalogues" className="collector-dashboard-quick-action">
                  <BookOpen size={24} />
                  <span>Saved Catalogues</span>
                </Link>
                <Link to="/inquiries" className="collector-dashboard-quick-action">
                  <MessageSquare size={24} />
                  <span>My Inquiries</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
