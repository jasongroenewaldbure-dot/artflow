import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthProvider';
import Icon from '../icons/Icon';

export interface NavItem {
  to: string;
  label: string;
  icon?: React.ReactNode;
  authRequired?: boolean;
  roles?: ('artist' | 'collector' | 'both')[];
  condition?: (profile: any) => boolean;
  actualTo?: string | ((profile: any) => string);
}

export const navConfig: NavItem[] = [
  // Public navigation items
  {
    to: '/',
    label: 'Home',
    authRequired: false,
  },
  {
    to: '/artworks',
    label: 'Explore Art',
    icon: <Icon name="search" size={20} />,
    authRequired: false,
  },
  {
    to: '/artists',
    label: 'Artists',
    icon: <Icon name="users" size={20} />,
    authRequired: false,
  },
  {
    to: '/galleries',
    label: 'Galleries',
    icon: <Icon name="image" size={20} />,
    authRequired: false,
  },

  // Artist-specific navigation
  {
    to: '/u/dashboard',
    label: 'Dashboard',
    icon: <Icon name="dashboard" size={20} />,
    authRequired: true,
    roles: ['artist', 'both'],
  },
  {
    to: '/u/artworks',
    label: 'My Artworks',
    icon: <Icon name="image" size={20} />,
    authRequired: true,
    roles: ['artist', 'both'],
  },
  {
    to: '/u/catalogues',
    label: 'Catalogues',
    icon: <Icon name="catalogue" size={20} />,
    authRequired: true,
    roles: ['artist', 'both'],
  },
  {
    to: '/u/sales',
    label: 'Sales',
    icon: <Icon name="trending-up" size={20} />,
    authRequired: true,
    roles: ['artist', 'both'],
  },
  {
    to: '/u/contacts',
    label: 'Contacts',
    icon: <Icon name="users" size={20} />,
    authRequired: true,
    roles: ['artist', 'both'],
  },
  {
    to: '/u/messages',
    label: 'Messages',
    icon: <Icon name="message" size={20} />,
    authRequired: true,
    roles: ['artist', 'both'],
  },
  {
    to: '/u/analytics',
    label: 'Analytics',
    icon: <Icon name="bar-chart" size={20} />,
    authRequired: true,
    roles: ['artist', 'both'],
  },
  {
    to: '/u/settings',
    label: 'Settings',
    icon: <Icon name="settings" size={20} />,
    authRequired: true,
    roles: ['artist', 'both'],
  },

  // Collector-specific navigation
  {
    to: '/u/dashboard',
    label: 'Dashboard',
    icon: <Icon name="dashboard" size={20} />,
    authRequired: true,
    roles: ['collector', 'both'],
  },
  {
    to: '/artworks',
    label: 'Discover',
    icon: <Icon name="search" size={20} />,
    authRequired: true,
    roles: ['collector', 'both'],
  },
  {
    to: '/u/favorites',
    label: 'Favorites',
    icon: <Icon name="heart" size={20} />,
    authRequired: true,
    roles: ['collector', 'both'],
  },
  {
    to: '/u/collection',
    label: 'My Collection',
    icon: <Icon name="image" size={20} />,
    authRequired: true,
    roles: ['collector', 'both'],
  },
  {
    to: '/u/roadmap',
    label: 'Collection Roadmap',
    icon: <Icon name="map" size={20} />,
    authRequired: true,
    roles: ['collector', 'both'],
  },
  {
    to: '/u/vault',
    label: 'Vault',
    icon: <Icon name="dollar" size={20} />,
    authRequired: true,
    roles: ['collector', 'both'],
  },
  {
    to: '/u/messages',
    label: 'Messages',
    icon: <Icon name="message" size={20} />,
    authRequired: true,
    roles: ['collector', 'both'],
  },
  {
    to: '/u/settings',
    label: 'Settings',
    icon: <Icon name="settings" size={20} />,
    authRequired: true,
    roles: ['collector', 'both'],
  },
];

const Header = () => {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Filter navigation items based on authentication and role
  const getVisibleNavItems = () => {
    if (!profile) {
      // Public navigation for non-authenticated users
      return navConfig.filter(item => !item.authRequired);
    }

    const userRole = profile.role;
    return navConfig.filter(item => {
      if (!item.authRequired) return true; // Show public items
      if (!item.roles) return false;
      if (!item.roles.includes(userRole as any)) return false;
      if (item.condition && !item.condition(profile)) return false;
      return true;
    });
  };

  const visibleNavItems = getVisibleNavItems();
  const isLoggedIn = !!profile;

  return (
    <>
      <header className="artflow-header">
        <div className="header-container">
          <div className="header-left">
            <Link to="/" className="header-logo">
              <div className="logo-square">AF</div>
              <span className="logo-text">ArtFlow</span>
            </Link>
          </div>

          <div className="header-center">
            <div className="search-container">
              <button 
                className="search-btn"
                onClick={() => setShowSearch(!showSearch)}
                aria-label="Search"
              >
                <Icon name="search" size={20} />
              </button>
              {showSearch && (
                <div className="search-dropdown">
                  <input 
                    type="text" 
                    placeholder="Search artists, artworks, galleries..."
                    className="search-input"
                    autoFocus
                  />
                  <div className="search-suggestions">
                    <div className="suggestion-category">
                      <h4>Artists</h4>
                      <div className="suggestion-item">
                        <Icon name="users" size={16} />
                        <span>Maya Chen</span>
                      </div>
                      <div className="suggestion-item">
                        <Icon name="users" size={16} />
                        <span>David Rodriguez</span>
                      </div>
                    </div>
                    <div className="suggestion-category">
                      <h4>Artworks</h4>
                      <div className="suggestion-item">
                        <Icon name="image" size={16} />
                        <span>Abstract Expressionism</span>
                      </div>
                      <div className="suggestion-item">
                        <Icon name="image" size={16} />
                        <span>Contemporary Photography</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="header-right">
            <nav className="header-nav">
              {visibleNavItems.slice(0, 4).map((item) => (
                <Link
                  key={item.to}
                  to={typeof item.actualTo === 'function' ? item.actualTo(profile) : item.to}
                  className={`header-nav-link ${location.pathname === item.to ? 'active' : ''}`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            
            <div className="header-actions">
              {isLoggedIn ? (
                <>
                  <button className="header-action-btn">
                    <Icon name="heart" size={20} />
                  </button>
                  <div className="user-menu">
                    <button className="user-menu-btn">
                      <div className="user-avatar">
                        <Icon name="user" size={16} />
                      </div>
                      <span className="user-name">{profile.display_name || 'User'}</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button className="header-action-btn">
                    <Icon name="heart" size={20} />
                  </button>
                  <Link to="/start" className="header-action-btn primary">
                    Sign In
                  </Link>
                </>
              )}
            </div>

            <button 
              className="mobile-menu-btn"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              aria-label="Menu"
            >
              {showMobileMenu ? <Icon name="close" size={24} /> : <Icon name="menu" size={24} />}
            </button>
          </div>
        </div>
      </header>

      {showMobileMenu && (
        <div className="mobile-menu">
          <div className="mobile-menu-content">
            <div className="mobile-search">
              <input 
                type="text" 
                placeholder="Search..."
                className="mobile-search-input"
              />
            </div>
            <nav className="mobile-nav">
              {visibleNavItems.map((item) => (
                <Link
                  key={item.to}
                  to={typeof item.actualTo === 'function' ? item.actualTo(profile) : item.to}
                  className="mobile-nav-link"
                  onClick={() => setShowMobileMenu(false)}
                >
                  {item.icon && <span className="mobile-nav-icon">{item.icon}</span>}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
            {isLoggedIn ? (
              <div className="mobile-user-section">
                <div className="mobile-user-info">
                  <div className="user-avatar-large">
                    <ProfileIcon size={24} />
                  </div>
                  <div className="user-details">
                    <span className="user-name-large">{profile.display_name || 'User'}</span>
                    <span className="user-role">{profile.role}</span>
                  </div>
                </div>
                <button className="mobile-sign-out" onClick={signOut}>
                  <Icon name="x" size={20} />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="mobile-auth-section">
                <Link to="/start" className="mobile-sign-in" onClick={() => setShowMobileMenu(false)}>
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
