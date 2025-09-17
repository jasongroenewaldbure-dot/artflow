import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Filter, 
  Bell, 
  Clock, 
  MapPin, 
  Users, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Eye
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthProvider'

interface CalendarEvent {
  id: string
  title: string
  type: 'fair' | 'meeting' | 'consignment' | 'exhibition' | 'sale' | 'deadline' | 'follow_up' | 'catalogue' | 'contact_reminder'
  start_date: string
  end_date?: string
  time?: string
  location?: string
  description?: string
  status: 'upcoming' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  reminder_days_before: number
  artwork_ids?: string[]
  contact_ids?: string[]
  contact_name?: string
  contact_email?: string
  contact_phone?: string
  catalogue_type?: 'digital' | 'physical' | 'exhibition' | 'fair'
  follow_up_type?: 'email' | 'call' | 'meeting' | 'proposal'
  notes?: string
  created_at: string
  updated_at: string
}

interface SmartReminder {
  id: string
  event_id: string
  title: string
  message: string
  type: 'fair_reminder' | 'consignment_expiry' | 'meeting_prep' | 'deadline_alert' | 'follow_up_reminder' | 'catalogue_reminder' | 'contact_reminder'
  due_date: string
  is_read: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  action_required: boolean
  contact_name?: string
  contact_email?: string
  follow_up_type?: string
  catalogue_type?: string
  created_at: string
}

const Calendar: React.FC = () => {
  const { user, profile } = useAuth()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [reminders, setReminders] = useState<SmartReminder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  const [filterType, setFilterType] = useState<string>('all')
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [showReminders, setShowReminders] = useState(false)

  useEffect(() => {
    if (user) {
      loadEvents()
      loadSmartReminders()
    }
  }, [user])

  const loadEvents = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('artist_events')
        .select('*')
        .eq('user_id', user?.id)
        .order('start_date', { ascending: true })

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSmartReminders = async () => {
    try {
      const { data, error } = await supabase
        .from('smart_reminders')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_read', false)
        .order('due_date', { ascending: true })

      if (error) throw error
      setReminders(data || [])
    } catch (error) {
      console.error('Error loading reminders:', error)
    }
  }

  const generateSmartReminders = async () => {
    try {
      const now = new Date()
      const upcomingEvents = events.filter(event => 
        new Date(event.start_date) > now && 
        event.status === 'upcoming'
      )

      const newReminders: Omit<SmartReminder, 'id' | 'created_at'>[] = []

      for (const event of upcomingEvents) {
        const eventDate = new Date(event.start_date)
        const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        // Generate reminders based on event type and days until
        if (event.type === 'fair' && daysUntil <= 7) {
          newReminders.push({
            event_id: event.id,
            title: 'Fair Preparation Reminder',
            message: `Art Fair "${event.title}" is in ${daysUntil} days. Prepare your booth, artwork, and materials.`,
            type: 'fair_reminder',
            due_date: event.start_date,
            is_read: false,
            priority: daysUntil <= 3 ? 'urgent' : daysUntil <= 5 ? 'high' : 'medium',
            action_required: true
          })
        }

        if (event.type === 'consignment' && daysUntil <= 14) {
          newReminders.push({
            event_id: event.id,
            title: 'Consignment Expiry Alert',
            message: `Consignment agreement for "${event.title}" expires in ${daysUntil} days. Review terms and follow up.`,
            type: 'consignment_expiry',
            due_date: event.start_date,
            is_read: false,
            priority: daysUntil <= 7 ? 'urgent' : 'high',
            action_required: true
          })
        }

        if (event.type === 'meeting' && daysUntil <= 2) {
          newReminders.push({
            event_id: event.id,
            title: 'Meeting Preparation',
            message: `Meeting "${event.title}" is in ${daysUntil} days. Prepare agenda and materials.`,
            type: 'meeting_prep',
            due_date: event.start_date,
            is_read: false,
            priority: daysUntil <= 1 ? 'urgent' : 'medium',
            action_required: true
          })
        }

        if (event.type === 'deadline' && daysUntil <= 5) {
          newReminders.push({
            event_id: event.id,
            title: 'Deadline Alert',
            message: `Deadline "${event.title}" is in ${daysUntil} days. Complete required tasks.`,
            type: 'deadline_alert',
            due_date: event.start_date,
            is_read: false,
            priority: daysUntil <= 2 ? 'urgent' : 'high',
            action_required: true
          })
        }

        // New reminder types for follow-ups and contacts
        if (event.type === 'follow_up' && daysUntil <= 3) {
          newReminders.push({
            event_id: event.id,
            title: 'Follow-up Reminder',
            message: `Follow-up with ${event.contact_name || 'contact'} is due in ${daysUntil} days. ${event.follow_up_type === 'email' ? 'Send email' : event.follow_up_type === 'call' ? 'Make phone call' : 'Schedule meeting'}.`,
            type: 'follow_up_reminder',
            due_date: event.start_date,
            is_read: false,
            priority: daysUntil <= 1 ? 'urgent' : 'high',
            action_required: true,
            contact_name: event.contact_name,
            contact_email: event.contact_email,
            follow_up_type: event.follow_up_type
          })
        }

        if (event.type === 'catalogue' && daysUntil <= 5) {
          newReminders.push({
            event_id: event.id,
            title: 'Catalogue Reminder',
            message: `Catalogue "${event.title}" (${event.catalogue_type}) is scheduled to be sent in ${daysUntil} days. Prepare and review content.`,
            type: 'catalogue_reminder',
            due_date: event.start_date,
            is_read: false,
            priority: daysUntil <= 2 ? 'urgent' : 'medium',
            action_required: true,
            catalogue_type: event.catalogue_type
          })
        }

        if (event.type === 'contact_reminder' && daysUntil <= 1) {
          newReminders.push({
            event_id: event.id,
            title: 'Contact Reminder',
            message: `Time to reach out to ${event.contact_name || 'contact'}. ${event.description || 'Follow up on previous conversation.'}`,
            type: 'contact_reminder',
            due_date: event.start_date,
            is_read: false,
            priority: 'high',
            action_required: true,
            contact_name: event.contact_name,
            contact_email: event.contact_email
          })
        }
      }

      if (newReminders.length > 0) {
        const { error } = await supabase
          .from('smart_reminders')
          .insert(newReminders.map(reminder => ({
            ...reminder,
            user_id: user?.id
          })))

        if (error) throw error
        await loadSmartReminders()
      }
    } catch (error) {
      console.error('Error generating smart reminders:', error)
    }
  }

  const markReminderAsRead = async (reminderId: string) => {
    try {
      const { error } = await supabase
        .from('smart_reminders')
        .update({ is_read: true })
        .eq('id', reminderId)

      if (error) throw error
      await loadSmartReminders()
    } catch (error) {
      console.error('Error marking reminder as read:', error)
    }
  }

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'fair': return <MapPin size={16} />
      case 'meeting': return <Users size={16} />
      case 'consignment': return <DollarSign size={16} />
      case 'exhibition': return <Eye size={16} />
      case 'sale': return <DollarSign size={16} />
      case 'deadline': return <Clock size={16} />
      case 'follow_up': return <Bell size={16} />
      case 'catalogue': return <Eye size={16} />
      case 'contact_reminder': return <Users size={16} />
      default: return <CalendarIcon size={16} />
    }
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'fair': return 'var(--blue100)'
      case 'meeting': return 'var(--green100)'
      case 'consignment': return 'var(--yellow100)'
      case 'exhibition': return 'var(--purple100)'
      case 'sale': return 'var(--green100)'
      case 'deadline': return 'var(--red100)'
      case 'follow_up': return 'var(--orange100)'
      case 'catalogue': return 'var(--purple100)'
      case 'contact_reminder': return 'var(--blue100)'
      default: return 'var(--gray100)'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'var(--red100)'
      case 'high': return 'var(--yellow100)'
      case 'medium': return 'var(--blue100)'
      case 'low': return 'var(--gray100)'
      default: return 'var(--gray100)'
    }
  }

  const filteredEvents = events.filter(event => {
    if (filterType === 'all') return true
    return event.type === filterType
  })

  const upcomingEvents = filteredEvents.filter(event => 
    new Date(event.start_date) >= new Date() && event.status === 'upcoming'
  )

  const urgentReminders = reminders.filter(reminder => reminder.priority === 'urgent')

  if (loading) {
    return (
      <div className="calendar-page-container">
        <div className="calendar-loading">
          <div>Loading calendar...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="calendar-page-container">
      <Helmet>
        <title>Calendar - ArtFlow</title>
        <meta name="description" content="Manage your art business calendar with smart reminders" />
      </Helmet>

      <div className="calendar-header">
        <div className="calendar-header-left">
          <h1 className="calendar-title">Calendar</h1>
          <p className="calendar-subtitle">Manage your art business schedule and deadlines</p>
        </div>
        <div className="calendar-header-actions">
          <button 
            className="artflow-button artflow-button--outline"
            onClick={() => setShowAddEvent(true)}
          >
            <Plus size={16} />
            Add Event
          </button>
          <button 
            className="artflow-button artflow-button--outline"
            onClick={() => setShowReminders(!showReminders)}
          >
            <Bell size={16} />
            Reminders ({reminders.length})
          </button>
          <button 
            className="artflow-button artflow-button--outline"
            onClick={generateSmartReminders}
          >
            <Bell size={16} />
            Generate Reminders
          </button>
        </div>
      </div>

      {/* Smart Reminders Panel */}
      {showReminders && (
        <div className="reminders-panel">
          <div className="reminders-header">
            <h3>Smart Reminders</h3>
            <button 
              className="artflow-button artflow-button--ghost"
              onClick={() => setShowReminders(false)}
            >
              <XCircle size={16} />
            </button>
          </div>
          <div className="reminders-list">
            {reminders.length === 0 ? (
              <div className="empty-reminders">
                <Bell size={48} />
                <p>No active reminders</p>
                <p className="text-muted">Smart reminders will appear here for upcoming events</p>
              </div>
            ) : (
              reminders.map(reminder => (
                <div 
                  key={reminder.id} 
                  className={`reminder-item ${reminder.priority}`}
                >
                  <div className="reminder-icon">
                    <Bell size={16} />
                  </div>
                  <div className="reminder-content">
                    <div className="reminder-header">
                      <h4>{reminder.title}</h4>
                      <span 
                        className="priority-badge"
                        style={{ backgroundColor: getPriorityColor(reminder.priority) }}
                      >
                        {reminder.priority}
                      </span>
                    </div>
                    <p className="reminder-message">{reminder.message}</p>
                    <div className="reminder-meta">
                      <span>Due: {new Date(reminder.due_date).toLocaleDateString()}</span>
                      {reminder.action_required && (
                        <span className="action-required">Action Required</span>
                      )}
                    </div>
                  </div>
                  <div className="reminder-actions">
                    <button 
                      className="artflow-button artflow-button--ghost"
                      onClick={() => markReminderAsRead(reminder.id)}
                    >
                      <CheckCircle size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Calendar Filters */}
      <div className="calendar-filters">
        <div className="filter-group">
          <label>Event Type:</label>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="artflow-input artflow-input--outlined"
          >
            <option value="all">All Events</option>
            <option value="fair">Art Fairs</option>
            <option value="meeting">Meetings</option>
            <option value="consignment">Consignments</option>
            <option value="exhibition">Exhibitions</option>
            <option value="sale">Sales</option>
            <option value="deadline">Deadlines</option>
            <option value="follow_up">Follow-ups</option>
            <option value="catalogue">Catalogues</option>
            <option value="contact_reminder">Contact Reminders</option>
          </select>
        </div>
        <div className="filter-group">
          <label>View:</label>
          <div className="view-toggle">
            <button 
              className={`view-btn ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => setViewMode('month')}
            >
              Month
            </button>
            <button 
              className={`view-btn ${viewMode === 'week' ? 'active' : ''}`}
              onClick={() => setViewMode('week')}
            >
              Week
            </button>
            <button 
              className={`view-btn ${viewMode === 'day' ? 'active' : ''}`}
              onClick={() => setViewMode('day')}
            >
              Day
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="quick-actions-grid">
          <button 
            className="quick-action-card"
            onClick={() => setShowAddEvent(true)}
          >
            <Bell size={24} />
            <span>Add Follow-up</span>
            <p>Schedule a follow-up with a contact</p>
          </button>
          <button 
            className="quick-action-card"
            onClick={() => setShowAddEvent(true)}
          >
            <Eye size={24} />
            <span>Schedule Catalogue</span>
            <p>Plan catalogue distribution</p>
          </button>
          <button 
            className="quick-action-card"
            onClick={() => setShowAddEvent(true)}
          >
            <Users size={24} />
            <span>Contact Reminder</span>
            <p>Set a reminder to reach out</p>
          </button>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="upcoming-events">
        <h3>Upcoming Events</h3>
        <div className="events-grid">
          {upcomingEvents.length === 0 ? (
            <div className="empty-events">
              <CalendarIcon size={48} />
              <p>No upcoming events</p>
              <p className="text-muted">Add events to start managing your schedule</p>
            </div>
          ) : (
            upcomingEvents.map(event => (
              <div key={event.id} className="event-card">
                <div className="event-header">
                  <div className="event-type-icon" style={{ color: getEventTypeColor(event.type) }}>
                    {getEventTypeIcon(event.type)}
                  </div>
                  <div className="event-title">{event.title}</div>
                  <span 
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(event.priority) }}
                  >
                    {event.priority}
                  </span>
                </div>
                <div className="event-details">
                  <div className="event-date">
                    <Clock size={14} />
                    {new Date(event.start_date).toLocaleDateString()}
                    {event.time && ` at ${event.time}`}
                  </div>
                  {event.location && (
                    <div className="event-location">
                      <MapPin size={14} />
                      {event.location}
                    </div>
                  )}
                  {event.description && (
                    <p className="event-description">{event.description}</p>
                  )}
                </div>
                <div className="event-actions">
                  <button className="artflow-button artflow-button--ghost">
                    <Edit size={14} />
                  </button>
                  <button className="artflow-button artflow-button--ghost">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Urgent Reminders Alert */}
      {urgentReminders.length > 0 && (
        <div className="urgent-reminders-alert">
          <AlertTriangle size={20} />
          <div>
            <h4>Urgent Reminders</h4>
            <p>You have {urgentReminders.length} urgent reminder(s) requiring immediate attention.</p>
          </div>
          <button 
            className="artflow-button artflow-button--primary"
            onClick={() => setShowReminders(true)}
          >
            View Reminders
          </button>
        </div>
      )}
    </div>
  )
}

export default Calendar
