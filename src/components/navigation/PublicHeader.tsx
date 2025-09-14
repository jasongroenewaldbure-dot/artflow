import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Heart, ShoppingBag, Bell, ChevronDown, Home, Search, Users, BookOpen, LogIn, UserPlus } from 'lucide-react'
import AuthStatus from '../AuthStatus'
import IntelligentSearch from '../marketplace/IntelligentSearch'
import DynamicMegaMenu from '../marketplace/DynamicMegaMenu'
import Container from '../ui/Container'
import type { SearchResult, ImageSearchResult } from '../../services/intelligentSearch'
import { useAuth } from '../../contexts/AuthProvider'

const PublicHeader: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [imageSearchResults, setImageSearchResults] = useState<ImageSearchResult[]>([])
  const [activeMegaMenu, setActiveMegaMenu] = useState<'discover' | 'artists' | null>(null)

  const handleSearchResults = (results: SearchResult[]) => {
    setSearchResults(results)
    navigate('/search', { state: { results, type: 'text' } })
  }

  const handleImageSearchResults = (results: ImageSearchResult[]) => {
    setImageSearchResults(results)
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
          <Link
            to="/home"
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

          {/* Navigation */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
            {/* Discover (Artworks) Mega Menu */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => handleMegaMenuToggle('artworks')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-xs)',
                  padding: 'var(--space-sm) var(--space-md)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'var(--fg)',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  borderRadius: 'var(--radius-sm)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-alt)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <Search size={16} />
                Discover
                <ChevronDown size={16} />
              </button>
              <DynamicMegaMenu
                isOpen={activeMegaMenu === 'discover'}
                onClose={() => setActiveMegaMenu(null)}
              />
            </div>

            {/* Artists Mega Menu */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => handleMegaMenuToggle('artists')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-xs)',
                  padding: 'var(--space-sm) var(--space-md)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'var(--fg)',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  borderRadius: 'var(--radius-sm)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-alt)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <Users size={16} />
                Artists
                <ChevronDown size={16} />
              </button>
              <DynamicMegaMenu
                isOpen={activeMegaMenu === 'artists'}
                onClose={() => setActiveMegaMenu(null)}
              />
            </div>

            {/* Catalogues */}
            <Link
              to="/catalogues"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-xs)',
                padding: 'var(--space-sm) var(--space-md)',
                color: 'var(--fg)',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                borderRadius: 'var(--radius-sm)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-alt)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <BookOpen size={16} />
              Catalogues
            </Link>
          </nav>
          
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

export default PublicHeader
