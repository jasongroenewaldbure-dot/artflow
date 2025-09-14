import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Bell, Search, Filter, Check, X, Eye, Heart, ShoppingBag, MessageSquare, Calendar, Settings, Trash2, MarkAsRead } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthProvider'
import Container from '../../components/ui/Container'
import { showErrorToast, showSuccessToast } from '../../utils/errorHandling'

interface Notification {
  id: string
  type: 'artwork_liked' | 'artwork_purchased' | 'new_message' | 'price_drop' | 'new_artwork' | 'sale_completed' | 'shipping_update'
  title: string
  message: string
  data: any
  read: boolean
  createdAt: string
  actionUrl?: string
}

const NotificationsPage: React.FC = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all')
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([])

  useEffect(() => {
    if (user) {
      loadNotifications()
    }
  }, [user])

  useEffect(() => {
    filterNotifications()
  }, [notifications, searchQuery, filterType])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      
      // Try to load from database first
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('relation "user_notifications" does not exist')) {
          // Table doesn't exist yet, use mock data
          const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'artwork_liked',
          title: 'Someone liked your artwork',
          message: 'Sarah Johnson liked your artwork "Sunset Dreams"',
          data: { artworkId: 'art1', likerName: 'Sarah Johnson' },
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          actionUrl: '/artwork/sunset-dreams'
        },
        {
          id: '2',
          type: 'price_drop',
          title: 'Price drop alert',
          message: 'The artwork "Ocean Waves" you saved is now 20% off',
          data: { artworkId: 'art2', oldPrice: 5000, newPrice: 4000 },
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          actionUrl: '/artwork/ocean-waves'
        },
        {
          id: '3',
          type: 'new_message',
          title: 'New message from collector',
          message: 'You have a new message about "Mountain View"',
          data: { conversationId: 'conv1', senderName: 'Mike Chen' },
          read: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          actionUrl: '/messages/conv1'
        },
        {
          id: '4',
          type: 'sale_completed',
          title: 'Sale completed',
          message: 'Your artwork "City Lights" has been sold for R8,500',
          data: { artworkId: 'art3', price: 8500 },
          read: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
          actionUrl: '/u/sales'
        }
      ]

      setNotifications(mockNotifications)
      return
    }
    throw error
  }

  // If we get here, we have real data from the database
  const realNotifications: Notification[] = (data || []).map(notif => ({
    id: notif.id,
    type: notif.type as any,
    title: notif.title,
    message: notif.message,
    data: notif.data,
    read: notif.read,
    createdAt: notif.created_at,
    actionUrl: notif.action_url
  }))

  setNotifications(realNotifications)
    } catch (error) {
      console.error('Error loading notifications:', error)
      showErrorToast('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const filterNotifications = () => {
    let filtered = notifications

    // Filter by read status
    if (filterType === 'unread') {
      filtered = filtered.filter(notif => !notif.read)
    } else if (filterType === 'read') {
      filtered = filtered.filter(notif => notif.read)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(notif =>
        notif.title.toLowerCase().includes(query) ||
        notif.message.toLowerCase().includes(query)
      )
    }

    setFilteredNotifications(filtered)
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      )
      showSuccessToast('Marked as read')
    } catch (error) {
      console.error('Error marking notification as read:', error)
      showErrorToast('Failed to mark as read')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      )
      showSuccessToast('All notifications marked as read')
    } catch (error) {
      console.error('Error marking all as read:', error)
      showErrorToast('Failed to mark all as read')
    }
  }

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId))
      showSuccessToast('Notification deleted')
    } catch (error) {
      console.error('Error deleting notification:', error)
      showErrorToast('Failed to delete notification')
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'artwork_liked': return <Heart size={20} />
      case 'artwork_purchased': return <ShoppingBag size={20} />
      case 'new_message': return <MessageSquare size={20} />
      case 'price_drop': return <Bell size={20} />
      case 'new_artwork': return <Eye size={20} />
      case 'sale_completed': return <Check size={20} />
      case 'shipping_update': return <Calendar size={20} />
      default: return <Bell size={20} />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'artwork_liked': return 'var(--success)'
      case 'artwork_purchased': return 'var(--primary)'
      case 'new_message': return 'var(--info)'
      case 'price_drop': return 'var(--warning)'
      case 'new_artwork': return 'var(--info)'
      case 'sale_completed': return 'var(--success)'
      case 'shipping_update': return 'var(--info)'
      default: return 'var(--muted)'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) {
    return (
      <div style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: 'var(--muted)' }}>Loading notifications...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      <Helmet>
        <title>Notifications | ArtFlow</title>
        <meta name="description" content="Your notifications on ArtFlow" />
      </Helmet>

      <Container>
        <div style={{ padding: 'var(--space-xl) 0' }}>
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
                fontWeight: '600', 
                margin: '0 0 var(--space-sm) 0',
                color: 'var(--fg)'
              }}>
                Notifications
                {unreadCount > 0 && (
                  <span style={{
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    fontSize: '14px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    marginLeft: 'var(--space-sm)'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </h1>
              <p style={{ 
                color: 'var(--muted)', 
                margin: 0,
                fontSize: '16px'
              }}>
                {filteredNotifications.length} {filteredNotifications.length === 1 ? 'notification' : 'notifications'}
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-xs)',
                  padding: 'var(--space-sm) var(--space-md)',
                  backgroundColor: 'var(--bg-alt)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--fg)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary)'
                  e.currentTarget.style.color = 'white'
                  e.currentTarget.style.borderColor = 'var(--primary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-alt)'
                  e.currentTarget.style.color = 'var(--fg)'
                  e.currentTarget.style.borderColor = 'var(--border)'
                }}
              >
                <MarkAsRead size={16} />
                Mark all read
              </button>
            )}
          </div>

          {/* Search and Filters */}
          <div style={{ 
            display: 'flex', 
            gap: 'var(--space-md)', 
            marginBottom: 'var(--space-xl)',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '300px' }}>
              <Search 
                size={20} 
                style={{ 
                  position: 'absolute', 
                  left: 'var(--space-md)', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: 'var(--muted)'
                }} 
              />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--space-md) var(--space-md) var(--space-md) 48px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg)',
                  color: 'var(--fg)',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border)'
                }}
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              style={{
                padding: 'var(--space-md)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg)',
                color: 'var(--fg)',
                fontSize: '16px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
            </select>
          </div>

          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: 'var(--space-xxl)',
              color: 'var(--muted)'
            }}>
              <Bell size={48} style={{ marginBottom: 'var(--space-md)', opacity: 0.5 }} />
              <h3 style={{ margin: '0 0 var(--space-sm) 0', fontSize: '20px' }}>
                {searchQuery ? 'No notifications match your search' : 'No notifications yet'}
              </h3>
              <p style={{ margin: 0 }}>
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'You\'ll see notifications about your activity here'
                }
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  style={{
                    backgroundColor: notification.read ? 'var(--bg-alt)' : 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-lg)',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                >
                  {!notification.read && (
                    <div style={{
                      position: 'absolute',
                      top: 'var(--space-md)',
                      right: 'var(--space-md)',
                      width: '8px',
                      height: '8px',
                      backgroundColor: 'var(--primary)',
                      borderRadius: '50%'
                    }} />
                  )}

                  <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start' }}>
                    <div style={{
                      color: getNotificationColor(notification.type),
                      marginTop: '2px'
                    }}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start',
                        marginBottom: 'var(--space-xs)'
                      }}>
                        <h3 style={{ 
                          fontSize: '16px', 
                          fontWeight: '600', 
                          margin: 0,
                          color: 'var(--fg)'
                        }}>
                          {notification.title}
                        </h3>
                        <span style={{ 
                          fontSize: '12px', 
                          color: 'var(--muted)',
                          marginLeft: 'var(--space-sm)'
                        }}>
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                      
                      <p style={{ 
                        color: 'var(--muted)', 
                        margin: '0 0 var(--space-md) 0',
                        fontSize: '14px',
                        lineHeight: '1.5'
                      }}>
                        {notification.message}
                      </p>

                      <div style={{ 
                        display: 'flex', 
                        gap: 'var(--space-sm)',
                        alignItems: 'center'
                      }}>
                        {notification.actionUrl && (
                          <a
                            href={notification.actionUrl}
                            style={{
                              fontSize: '14px',
                              color: 'var(--primary)',
                              textDecoration: 'none',
                              fontWeight: '500'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.textDecoration = 'underline'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.textDecoration = 'none'
                            }}
                          >
                            View Details
                          </a>
                        )}

                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 'var(--space-xs)',
                              padding: 'var(--space-xs) var(--space-sm)',
                              backgroundColor: 'transparent',
                              border: '1px solid var(--border)',
                              borderRadius: 'var(--radius-sm)',
                              color: 'var(--muted)',
                              cursor: 'pointer',
                              fontSize: '12px',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--bg-alt)'
                              e.currentTarget.style.color = 'var(--fg)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent'
                              e.currentTarget.style.color = 'var(--muted)'
                            }}
                          >
                            <Check size={12} />
                            Mark read
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteNotification(notification.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-xs)',
                            padding: 'var(--space-xs) var(--space-sm)',
                            backgroundColor: 'transparent',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--muted)',
                            cursor: 'pointer',
                            fontSize: '12px',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--error)'
                            e.currentTarget.style.color = 'white'
                            e.currentTarget.style.borderColor = 'var(--error)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                            e.currentTarget.style.color = 'var(--muted)'
                            e.currentTarget.style.borderColor = 'var(--border)'
                          }}
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}

export default NotificationsPage
