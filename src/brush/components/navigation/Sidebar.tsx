import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Star, Bell, Plus } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthProvider'

interface NavItem {
  id: string
  label: string
  path: string
  icon: React.ReactNode
}

const Sidebar: React.FC = () => {
  const location = useLocation()
  const { user } = useAuth()

  // Determine navigation items based on user role
  const getNavItems = (): NavItem[] => {
    const baseItems: NavItem[] = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/u/dashboard',
        icon: <Star size={16} />
      }
    ]

    // Add role-specific items
    if (user?.role === 'artist' || user?.role === 'both') {
      baseItems.push(
        {
          id: 'artworks',
          label: 'Artworks',
          path: '/u/artworks',
          icon: <Star size={16} />
        },
        {
          id: 'catalogues',
          label: 'Catalogues',
          path: '/u/catalogues',
          icon: <Star size={16} />
        },
        {
          id: 'inbox',
          label: 'Inbox',
          path: '/u/inbox',
          icon: <Star size={16} />
        },
        {
          id: 'sales',
          label: 'Sales',
          path: '/u/sales',
          icon: <Star size={16} />
        },
        {
          id: 'insights',
          label: 'Insights',
          path: '/u/insights',
          icon: <Star size={16} />
        },
        {
          id: 'reports',
          label: 'Reports',
          path: '/u/reports',
          icon: <Star size={16} />
        },
        {
          id: 'contacts',
          label: 'Contacts',
          path: '/u/contacts',
          icon: <Star size={16} />
        }
      )
    } else {
      // Collector navigation
      baseItems.push(
        {
          id: 'explore',
          label: 'Explore',
          path: '/artworks',
          icon: <Star size={16} />
        },
        {
          id: 'favourites',
          label: 'Favourites',
          path: '/u/favourites',
          icon: <Star size={16} />
        },
        {
          id: 'inbox',
          label: 'Inbox',
          path: '/u/inbox',
          icon: <Star size={16} />
        },
        {
          id: 'sales',
          label: 'Sales',
          path: '/u/sales',
          icon: <Star size={16} />
        },
        {
          id: 'vault',
          label: 'Vault',
          path: '/u/vault',
          icon: <Star size={16} />
        }
      )
    }

    return baseItems
  }

  const navItems = getNavItems()

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <div style={{
      width: '240px',
      height: '100vh',
      backgroundColor: '#ffffff',
      borderRight: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 10
    }}>
      {/* Logo/Profile Section */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid #f3f4f6'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Logo placeholder - could be replaced with actual logo */}
          <div style={{
            width: '24px',
            height: '24px',
            backgroundColor: '#6e1fff',
            borderRadius: '4px'
          }} />
        </div>
      </div>

      {/* Navigation Items */}
      <nav style={{
        flex: 1,
        padding: '20px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        {navItems.map((item) => {
          const active = isActive(item.path)
          return (
            <Link
              key={item.id}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 20px',
                textDecoration: 'none',
                color: active ? '#6e1fff' : '#374151',
                backgroundColor: active ? '#f8fafc' : 'transparent',
                borderRight: active ? '3px solid #6e1fff' : '3px solid transparent',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: active ? '#6e1fff' : '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: active ? '#ffffff' : '#6b7280'
              }}>
                {item.icon}
              </div>
              <span style={{
                fontSize: '14px',
                fontWeight: active ? '600' : '500'
              }}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Account Section */}
      <div style={{
        padding: '20px',
        borderTop: '1px solid #f3f4f6'
      }}>
        <Link
          to="/u/account"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 0',
            textDecoration: 'none',
            color: isActive('/u/account') ? '#6e1fff' : '#374151'
          }}
        >
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: isActive('/u/account') ? '#6e1fff' : '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isActive('/u/account') ? '#ffffff' : '#6b7280'
          }}>
            <Star size={16} />
          </div>
          <span style={{
            fontSize: '14px',
            fontWeight: isActive('/u/account') ? '600' : '500'
          }}>
            Account
          </span>
        </Link>
      </div>
    </div>
  )
}

export default Sidebar
