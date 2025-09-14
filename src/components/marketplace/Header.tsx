import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Heart, ShoppingBag, Bell, ChevronDown, Home, Search, Users, BookOpen, LogIn, UserPlus } from 'lucide-react'
import AuthStatus from '../AuthStatus'
import IntelligentSearch from './IntelligentSearch'
import MegaMenu from './MegaMenu'
import Container from '../ui/Container'
import type { SearchResult, ImageSearchResult } from '../../services/intelligentSearch'
import { useAuth } from '../../contexts/AuthProvider'

const Header: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  // Removed unused state variables
  const [activeMegaMenu, setActiveMegaMenu] = useState<'artists' | 'artworks' | null>(null)

  const handleSearchResults = (results: SearchResult[]) => {
    navigate('/search', { state: { results, type: 'text' } })
  }

  const handleImageSearchResults = (results: ImageSearchResult[]) => {
    navigate('/search', { state: { results, type: 'image' } })
  }

  const handleMegaMenuToggle = (type: 'artists' | 'artworks') => {
    setActiveMegaMenu(activeMegaMenu === type ? null : type)
  }

  // Check if we're on a public page (not dashboard or user pages)
  const isPublicPage = !location.pathname.startsWith('/dashboard') && 
                      !location.pathname.startsWith('/u/') && 
                      !location.pathname.startsWith('/onboarding')

  return (
    <header style={{
      backgroundColor: 'var(--card)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: 'var(--space-lg) 0'
    }}>
      <Container maxWidth="2xl" padding="lg">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xl)' }}>
          <Link to={user ? "/u/dashboard" : "/"} style={{
            fontSize: '28px',
            fontWeight: '800',
            color: 'var(--primary)',
            textDecoration: 'none',
            letterSpacing: '-0.5px'
          }}>
            ArtFlow
          </Link>

          {/* Navigation - Only show for logged-in users or on public pages */}
          {user ? (
            <nav style={{ display: 'flex', gap: 'var(--space-lg)', position: 'relative' }}>
              {/* Dashboard Link - Always visible for logged-in users */}
              {/* Artists Mega Menu */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => handleMegaMenuToggle('artists')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-xs)',
                    fontSize: '15px',
                    fontWeight: '500',
                    color: location.pathname.startsWith('/artists') ? 'var(--primary)' : 'var(--fg)',
                    textDecoration: 'none',
                    padding: 'var(--space-sm) 0',
                    borderBottom: location.pathname.startsWith('/artists') ? '2px solid var(--primary)' : '2px solid transparent',
                    transition: 'all 0.2s ease',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Users size={16} />
                  Artists
                  <ChevronDown size={14} style={{
                    transform: activeMegaMenu === 'artists' ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }} />
                </button>
                {activeMegaMenu === 'artists' && (
                  <MegaMenu
                    isOpen={activeMegaMenu === 'artists'}
                    onClose={() => setActiveMegaMenu(null)}
                    type="artists"
                  />
                )}
              </div>

              {/* Artworks Mega Menu */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => handleMegaMenuToggle('artworks')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-xs)',
                    fontSize: '15px',
                    fontWeight: '500',
                    color: location.pathname.startsWith('/search') ? 'var(--primary)' : 'var(--fg)',
                    textDecoration: 'none',
                    padding: 'var(--space-sm) 0',
                    borderBottom: location.pathname.startsWith('/search') ? '2px solid var(--primary)' : '2px solid transparent',
                    transition: 'all 0.2s ease',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Search size={16} />
                  Discover
                  <ChevronDown size={14} style={{
                    transform: activeMegaMenu === 'artworks' ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }} />
                </button>
                {activeMegaMenu === 'artworks' && (
                  <MegaMenu
                    isOpen={activeMegaMenu === 'artworks'}
                    onClose={() => setActiveMegaMenu(null)}
                    type="artworks"
                  />
                )}
              </div>
              
              <Link 
                to="/catalogues" 
                style={{
                  fontSize: '15px',
                  fontWeight: '500',
                  color: location.pathname === '/catalogues' ? 'var(--primary)' : 'var(--fg)',
                  textDecoration: 'none',
                  padding: 'var(--space-sm) 0',
                  borderBottom: location.pathname === '/catalogues' ? '2px solid var(--primary)' : '2px solid transparent',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-xs)'
                }}
              >
                <BookOpen size={16} />
                Catalogues
              </Link>
            </nav>
          ) : (
            // Public navigation for logged-out users
            <nav style={{ display: 'flex', gap: 'var(--space-lg)', position: 'relative' }}>
              <Link 
                to="/" 
                style={{
                  fontSize: '15px',
                  fontWeight: '500',
                  color: location.pathname === '/' ? 'var(--primary)' : 'var(--fg)',
                  textDecoration: 'none',
                  padding: 'var(--space-sm) 0',
                  borderBottom: location.pathname === '/' ? '2px solid var(--primary)' : '2px solid transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                Home
              </Link>

              {/* Artists Mega Menu */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => handleMegaMenuToggle('artists')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-xs)',
                    fontSize: '15px',
                    fontWeight: '500',
                    color: location.pathname.startsWith('/artists') ? 'var(--primary)' : 'var(--fg)',
                    textDecoration: 'none',
                    padding: 'var(--space-sm) 0',
                    borderBottom: location.pathname.startsWith('/artists') ? '2px solid var(--primary)' : '2px solid transparent',
                    transition: 'all 0.2s ease',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Users size={16} />
                  Artists
                  <ChevronDown size={14} style={{
                    transform: activeMegaMenu === 'artists' ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }} />
                </button>
                {activeMegaMenu === 'artists' && (
                  <MegaMenu
                    isOpen={activeMegaMenu === 'artists'}
                    onClose={() => setActiveMegaMenu(null)}
                    type="artists"
                  />
                )}
              </div>

              {/* Artworks Mega Menu */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => handleMegaMenuToggle('artworks')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-xs)',
                    fontSize: '15px',
                    fontWeight: '500',
                    color: location.pathname.startsWith('/search') ? 'var(--primary)' : 'var(--fg)',
                    textDecoration: 'none',
                    padding: 'var(--space-sm) 0',
                    borderBottom: location.pathname.startsWith('/search') ? '2px solid var(--primary)' : '2px solid transparent',
                    transition: 'all 0.2s ease',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Search size={16} />
                  Discover
                  <ChevronDown size={14} style={{
                    transform: activeMegaMenu === 'artworks' ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }} />
                </button>
                {activeMegaMenu === 'artworks' && (
                  <MegaMenu
                    isOpen={activeMegaMenu === 'artworks'}
                    onClose={() => setActiveMegaMenu(null)}
                    type="artworks"
                  />
                )}
              </div>
              
              <Link 
                to="/catalogues" 
                style={{
                  fontSize: '15px',
                  fontWeight: '500',
                  color: location.pathname === '/catalogues' ? 'var(--primary)' : 'var(--fg)',
                  textDecoration: 'none',
                  padding: 'var(--space-sm) 0',
                  borderBottom: location.pathname === '/catalogues' ? '2px solid var(--primary)' : '2px solid transparent',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-xs)'
                }}
              >
                <BookOpen size={16} />
                Catalogues
              </Link>
            </nav>
          )}
        </div>
        
        {/* Right side - Search and User Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          {/* Search Bar */}
          <div style={{ width: '400px' }}>
            <IntelligentSearch
              onSearchResults={handleSearchResults}
              onImageSearchResults={handleImageSearchResults}
              placeholder="Search with natural language..."
              userId={user?.id}
            />
          </div>
          
          {/* User Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            {user ? (
              <>
                {/* Dashboard Link for logged-in users on public pages */}
                {isPublicPage && (
                  <Link
                    to="/u/dashboard"
                    style={{
                      padding: 'var(--space-sm) var(--space-md)',
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-xs)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--primary-dark)'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--primary)'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    <Home size={16} />
                    Dashboard
                  </Link>
                )}
                
                {/* Social Features Link */}
                <Link
                  to="/social"
                  style={{
                    padding: 'var(--space-sm) var(--space-md)',
                    backgroundColor: 'transparent',
                    color: 'var(--fg)',
                    textDecoration: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-xs)',
                    border: '1px solid var(--border)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--muted)'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <Users size={16} />
                  Social
                </Link>

                {/* User Action Icons */}
                <Link
                  to="/u/favorites"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--fg)',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--border)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
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
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--fg)',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--border)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
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
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--fg)',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--border)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <Bell size={20} />
                </Link>
                <AuthStatus />
              </>
            ) : (
              <>
                {/* Sign In Button */}
                <Link
                  to="/start"
                  style={{
                    padding: 'var(--space-sm) var(--space-md)',
                    backgroundColor: 'transparent',
                    color: 'var(--fg)',
                    textDecoration: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                    fontWeight: '500',
                    border: '1px solid var(--border)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-xs)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-alt)'
                    e.currentTarget.style.borderColor = 'var(--primary)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.borderColor = 'var(--border)'
                  }}
                >
                  <LogIn size={16} />
                  Sign In
                </Link>
                {/* Sign Up Button */}
                <Link
                  to="/start"
                  style={{
                    padding: 'var(--space-sm) var(--space-md)',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-xs)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--primary-dark)'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--primary)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <UserPlus size={16} />
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
        </div>
      </Container>
    </header>
  )
}

export default Header