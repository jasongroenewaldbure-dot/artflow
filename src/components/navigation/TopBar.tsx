import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthProvider'
import Icon from '../icons/Icon'

interface TopBarProps {
  isSideNavCollapsed: boolean
  onToggleSideNav: () => void
}

export default function TopBar({ isSideNavCollapsed, onToggleSideNav }: TopBarProps) {
  const { user } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <header className="top-bar">
      <div className="top-bar-left">
        <button 
          className="menu-toggle"
          onClick={onToggleSideNav}
          aria-label={isSideNavCollapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          <Icon name="menu" size={20} />
        </button>
        
        <div className="breadcrumb">
          <span>Dashboard</span>
        </div>
      </div>

      <div className="top-bar-right">
        <div className="notification-container">
          <button 
            className="notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            <Icon name="bell" size={20} />
            <span className="notification-badge">3</span>
          </button>
          
          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h3>Notifications</h3>
                <button className="mark-all-read">Mark all read</button>
              </div>
              <div className="notification-list">
                <div className="notification-item unread">
                  <div className="notification-icon">
                    <Icon name="heart" size={16} />
                  </div>
                  <div className="notification-content">
                    <p>Sarah Johnson saved your artwork "Ocean Dreams"</p>
                    <span className="notification-time">2 minutes ago</span>
                  </div>
                </div>
                <div className="notification-item unread">
                  <div className="notification-icon">
                    <Icon name="message" size={16} />
                  </div>
                  <div className="notification-content">
                    <p>New message from Gallery Modern</p>
                    <span className="notification-time">1 hour ago</span>
                  </div>
                </div>
                <div className="notification-item">
                  <div className="notification-icon">
                    <Icon name="dollar" size={16} />
                  </div>
                  <div className="notification-content">
                    <p>Payment received for "Sunset Boulevard"</p>
                    <span className="notification-time">3 hours ago</span>
                  </div>
                </div>
              </div>
              <div className="notification-footer">
                <button className="view-all-notifications">View all notifications</button>
              </div>
            </div>
          )}
        </div>

        <div className="user-menu-container">
          <button 
            className="user-menu-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="user-avatar">
              <Icon name="user" size={20} />
            </div>
            <span className="user-name">{user?.display_name || 'User'}</span>
            <Icon name="chevron-down" size={16} />
          </button>
          
          {showUserMenu && (
            <div className="user-menu-dropdown">
              <div className="user-menu-header">
                <div className="user-info">
                  <div className="user-avatar-large">
                    <Icon name="user" size={24} />
                  </div>
                  <div className="user-details">
                    <span className="user-name-large">{user?.display_name || 'User'}</span>
                    <span className="user-role">{user?.role || 'Collector'}</span>
                  </div>
                </div>
              </div>
              <div className="user-menu-list">
                <a href="/settings" className="user-menu-item">
                  <Icon name="settings" size={16} />
                  <span>Settings</span>
                </a>
                <a href="/help" className="user-menu-item">
                  <Icon name="help" size={16} />
                  <span>Help & Support</span>
                </a>
                <a href="/roadmap" className="user-menu-item">
                  <Icon name="target" size={16} />
                  <span>Collection Roadmap</span>
                </a>
                <hr className="user-menu-divider" />
                <button className="user-menu-item sign-out">
                  <Icon name="arrow-right" size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
