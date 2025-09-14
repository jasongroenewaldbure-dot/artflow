import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthProvider';
import Icon from '../icons/Icon';

const MobileBottomNavBar = () => {
  const { profile } = useAuth();
  const location = useLocation();

  if (!profile) {
    return null; // Don't show bottom nav for non-authenticated users
  }

  const userRole = profile.role;

  // Define navigation items for mobile bottom bar
  const getMobileNavItems = () => {
    const baseItems = [
      {
        to: '/u/dashboard',
        label: 'Dashboard',
        icon: <Icon name="dashboard" size={20} />,
        roles: ['artist', 'collector', 'both']
      }
    ];

    if (userRole === 'artist' || userRole === 'both') {
      return [
        ...baseItems,
        {
          to: '/u/artworks',
          label: 'Artworks',
          icon: <Icon name="image" size={20} />,
          roles: ['artist', 'both']
        },
        {
          to: '/u/sales',
          label: 'Sales',
          icon: <Icon name="search" size={20} />, // Using compass as placeholder for sales icon
          roles: ['artist', 'both']
        },
        {
          to: '/u/analytics',
          label: 'Analytics',
          icon: <Icon name="user" size={20} />, // Using user as placeholder for analytics icon
          roles: ['artist', 'both']
        },
        {
          to: '/u/settings',
          label: 'Settings',
          icon: <Icon name="user" size={20} />,
          roles: ['artist', 'both']
        }
      ];
    } else {
      return [
        ...baseItems,
        {
          to: '/artworks',
          label: 'Discover',
          icon: <Icon name="search" size={20} />,
          roles: ['collector', 'both']
        },
        {
          to: '/u/favorites',
          label: 'Favorites',
          icon: <Icon name="heart" size={20} />,
          roles: ['collector', 'both']
        },
        {
          to: '/u/collection',
          label: 'Collection',
          icon: <Icon name="image" size={20} />,
          roles: ['collector', 'both']
        },
        {
          to: '/u/settings',
          label: 'Settings',
          icon: <Icon name="user" size={20} />,
          roles: ['collector', 'both']
        }
      ];
    }
  };

  const mobileNavItems = getMobileNavItems().filter(item => 
    item.roles.includes(userRole as any)
  );

  // Don't show on certain pages where sidebar is hidden
  const hideSidebarPatterns = [
    /^\/u\/artworks\/wizard/,
    /^\/u\/catalogues\/new/,
    /^\/u\/catalogues\/edit\/.+/,
    /^\/u\/artworks\/new/,
    /^\/u\/artworks\/edit\/.+/,
    /^\/u\/contacts\/new/,
    /^\/u\/contacts\/edit\/.+/,
  ];
  
  const shouldHide = hideSidebarPatterns.some((pattern) => pattern.test(location.pathname));

  if (shouldHide) {
    return null;
  }

  return (
    <nav className="mobile-bottom-nav">
      <div className="mobile-bottom-nav-container">
        {mobileNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => 
              `mobile-bottom-nav-item ${isActive ? 'active' : ''}`
            }
            end
          >
            <span className="mobile-bottom-nav-icon">{item.icon}</span>
            <span className="mobile-bottom-nav-label">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNavBar;
