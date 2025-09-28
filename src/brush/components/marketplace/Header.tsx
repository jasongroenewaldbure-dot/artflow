import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { User, Bell, Menu, X } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthProvider'
// import BrushIcon from '../../Icon'

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { signOut } = useAuth()

  return (
    <header style={{
      backgroundColor: 'var(--card)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 'var(--z-sticky)'
    }}>
      <div style={{
        maxWidth: 'var(--container-xl)',
        margin: '0 auto',
        padding: '0 var(--space-lg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px'
      }}>
        {/* Logo */}
        <Link 
          to="/u/dashboard" 
          style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--primary)',
            textDecoration: 'none'
          }}
        >
          ArtFlow
        </Link>

        {/* Navigation */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-lg)'
        }}>
          <Link 
            to="/u/dashboard" 
            style={{
              color: 'var(--fg)',
              textDecoration: 'none',
              fontWeight: 'var(--font-weight-medium)'
            }}
          >
            Dashboard
          </Link>
          <Link 
            to="/artworks" 
            style={{
              color: 'var(--fg)',
              textDecoration: 'none',
              fontWeight: 'var(--font-weight-medium)'
            }}
          >
            Artworks
          </Link>
          <Link 
            to="/artists" 
            style={{
              color: 'var(--fg)',
              textDecoration: 'none',
              fontWeight: 'var(--font-weight-medium)'
            }}
          >
            Artists
          </Link>
        </nav>

        {/* User Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-md)'
        }}>
          <button
            style={{
              padding: 'var(--space-sm)',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              borderRadius: 'var(--radius-md)',
              color: 'var(--muted)'
            }}
          >
            <Bell size={20} />
          </button>
          
          <Link
            to="/u/profile"
            style={{
              padding: 'var(--space-sm)',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              borderRadius: 'var(--radius-md)',
              color: 'var(--muted)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <User size={20} />
          </Link>

          <button
            onClick={() => signOut()}
            style={{
              padding: 'var(--space-sm) var(--space-md)',
              backgroundColor: 'var(--danger)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-medium)'
            }}
          >
            Sign Out
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{
            display: 'none',
            // Media queries not supported in inline styles - using responsive design
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-sm)',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div style={{
          backgroundColor: 'var(--card)',
          borderTop: '1px solid var(--border)',
          padding: 'var(--space-lg)'
        }}>
          <nav style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-md)'
          }}>
            <Link to="/u/dashboard">Dashboard</Link>
            <Link to="/artworks">Artworks</Link>
            <Link to="/artists">Artists</Link>
            <Link to="/u/profile">Profile</Link>
            <button onClick={() => signOut()}>Sign Out</button>
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header
