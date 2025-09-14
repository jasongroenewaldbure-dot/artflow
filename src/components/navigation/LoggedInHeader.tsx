import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Search, Bell, Heart, ShoppingBag, User, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthProvider'
import Container from '../ui/Container'
import { showSuccessToast } from '../../utils/errorHandling'

const LoggedInHeader: React.FC = () => {
  const location = useLocation()
  const { user, signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      showSuccessToast('Signed out successfully')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const isActive = (path: string) => {
    return location.pathname.startsWith(path)
  }

  const userMenuItems = [
    { path: '/u/favorites', icon: Heart, label: 'Favorites' },
    { path: '/u/collection', icon: ShoppingBag, label: 'Collection' },
    { path: '/u/notifications', icon: Bell, label: 'Notifications' },
    { path: '/u/settings', icon: Settings, label: 'Settings' }
  ]

  const artistMenuItems = [
    { path: '/my-artworks', icon: User, label: 'My Artworks' },
    { path: '/u/sales', icon: ShoppingBag, label: 'Sales' },
    { path: '/u/settings/artist', icon: Settings, label: 'Artist Settings' }
  ]

  return (
    <header style={{
      backgroundColor: 'var(--card)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: 'var(--space-md) 0'
    }}>
      <Container maxWidth="2xl" padding="lg">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Logo */}
          <Link
            to="/dashboard"
            style={{
              fontSize: '24px',
              fontWeight: '700',
              color: 'var(--fg)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-sm)'
            }}
          >
            ArtFlow
          </Link>

          {/* Desktop Navigation */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'var(--space-lg)'
          }} className="hidden-mobile">
            {/* Search */}
            <div style={{ position: 'relative', width: '300px' }}>
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
                placeholder="Search artworks, artists..."
                style={{
                  width: '100%',
                  padding: 'var(--space-sm) var(--space-sm) var(--space-sm) 40px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg)',
                  color: 'var(--fg)',
                  fontSize: '14px',
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

            {/* User Action Icons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <Link
                to="/u/favorites"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive('/u/favorites') ? 'var(--primary)' : 'var(--fg)',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  backgroundColor: isActive('/u/favorites') ? 'var(--primary-light)' : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (!isActive('/u/favorites')) {
                    e.currentTarget.style.backgroundColor = 'var(--border)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive('/u/favorites')) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                <Heart size={20} />
              </Link>

              <Link
                to="/u/collection"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive('/u/collection') ? 'var(--primary)' : 'var(--fg)',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  backgroundColor: isActive('/u/collection') ? 'var(--primary-light)' : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (!isActive('/u/collection')) {
                    e.currentTarget.style.backgroundColor = 'var(--border)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive('/u/collection')) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                <ShoppingBag size={20} />
              </Link>

              <Link
                to="/u/notifications"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive('/u/notifications') ? 'var(--primary)' : 'var(--fg)',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  backgroundColor: isActive('/u/notifications') ? 'var(--primary-light)' : 'transparent',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!isActive('/u/notifications')) {
                    e.currentTarget.style.backgroundColor = 'var(--border)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive('/u/notifications')) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                <Bell size={20} />
                {/* Notification badge - you can add logic to show unread count */}
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: 'var(--primary)',
                  borderRadius: '50%'
                }} />
              </Link>

              {/* User Menu */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-xs)',
                    padding: 'var(--space-sm)',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--fg)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-alt)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <User size={16} />
                  <span>{user?.email?.split('@')[0] || 'User'}</span>
                </button>

                {isUserMenuOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: 'var(--space-xs)',
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    minWidth: '200px',
                    zIndex: 1000
                  }}>
                    {userMenuItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsUserMenuOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-sm)',
                            padding: 'var(--space-md)',
                            color: 'var(--fg)',
                            textDecoration: 'none',
                            fontSize: '14px',
                            transition: 'background-color 0.2s ease',
                            borderBottom: '1px solid var(--border)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--bg-alt)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }}
                        >
                          <Icon size={16} />
                          {item.label}
                        </Link>
                      )
                    })}
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        handleSignOut()
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-sm)',
                        padding: 'var(--space-md)',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: 'var(--error)',
                        cursor: 'pointer',
                        fontSize: '14px',
                        width: '100%',
                        textAlign: 'left',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-alt)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--fg)',
              cursor: 'pointer'
            }}
            className="mobile-only"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'var(--card)',
            borderBottom: '1px solid var(--border)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            zIndex: 1000
          }}
          className="mobile-only">
            <div style={{ padding: 'var(--space-lg)' }}>
              {/* Search */}
              <div style={{ marginBottom: 'var(--space-lg)' }}>
                <div style={{ position: 'relative' }}>
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
                    placeholder="Search artworks, artists..."
                    style={{
                      width: '100%',
                      padding: 'var(--space-md) var(--space-md) var(--space-md) 48px',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg)',
                      color: 'var(--fg)',
                      fontSize: '16px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Navigation Links */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                {userMenuItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-sm)',
                        padding: 'var(--space-md)',
                        color: isActive(item.path) ? 'var(--primary)' : 'var(--fg)',
                        textDecoration: 'none',
                        fontSize: '16px',
                        fontWeight: isActive(item.path) ? '600' : '400',
                        backgroundColor: isActive(item.path) ? 'var(--primary-light)' : 'transparent',
                        borderRadius: 'var(--radius-md)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Icon size={20} />
                      {item.label}
                    </Link>
                  )
                })}
              </div>

              {/* Sign Out */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  handleSignOut()
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)',
                  padding: 'var(--space-md)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'var(--error)',
                  cursor: 'pointer',
                  fontSize: '16px',
                  width: '100%',
                  textAlign: 'left',
                  marginTop: 'var(--space-md)',
                  borderRadius: 'var(--radius-md)',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-alt)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <LogOut size={20} />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </Container>
    </header>
  )
}

export default LoggedInHeader
