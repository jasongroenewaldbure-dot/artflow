import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, TrendingUp, Star, Sparkles, Clock, Award, Users, Palette, Camera, Brush } from 'lucide-react'

interface MegaMenuProps {
  isOpen: boolean
  onClose: () => void
  type: 'artists' | 'artworks'
}

interface MenuSection {
  title: string
  items: MenuItem[]
  icon?: React.ReactNode
}

interface MenuItem {
  title: string
  href: string
  description?: string
  badge?: string
  trending?: boolean
}

const MegaMenu: React.FC<MegaMenuProps> = ({ isOpen, onClose, type }) => {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const artistSections: MenuSection[] = [
    {
      title: 'Discover Artists',
      icon: <Users size={16} />,
      items: [
        { title: 'Trending Artists', href: '/artists?filter=trending', description: 'Most popular this week', badge: 'Hot', trending: true },
        { title: 'New Artists', href: '/artists?filter=new', description: 'Recently joined', badge: 'New' },
        { title: 'Rising Stars', href: '/artists?filter=rising', description: 'Emerging talent', badge: 'Rising' },
        { title: 'Featured Artists', href: '/artists?filter=featured', description: 'Curator selections' },
        { title: 'All Artists', href: '/artists', description: 'Browse all artists' },
      ]
    },
    {
      title: 'By Medium',
      icon: <Palette size={16} />,
      items: [
        { title: 'Painting', href: '/artists?medium=painting', description: 'Oil, acrylic, watercolor' },
        { title: 'Photography', href: '/artists?medium=photography', description: 'Digital & film' },
        { title: 'Sculpture', href: '/artists?medium=sculpture', description: '3D works' },
        { title: 'Mixed Media', href: '/artists?medium=mixed-media', description: 'Multi-material' },
        { title: 'Digital Art', href: '/artists?medium=digital', description: 'Digital creations' },
      ]
    },
    {
      title: 'By Style',
      icon: <Brush size={16} />,
      items: [
        { title: 'Abstract', href: '/artists?style=abstract', description: 'Non-representational' },
        { title: 'Contemporary', href: '/artists?style=contemporary', description: 'Modern works' },
        { title: 'Realism', href: '/artists?style=realism', description: 'Representational art' },
        { title: 'Minimalist', href: '/artists?style=minimalist', description: 'Clean & simple' },
        { title: 'Expressionist', href: '/artists?style=expressionist', description: 'Emotional intensity' },
      ]
    },
    {
      title: 'Collections',
      icon: <Award size={16} />,
      items: [
        { title: 'Artist Catalogues', href: '/catalogues', description: 'Curated collections' },
        { title: 'Community Lists', href: '/community', description: 'User collections' },
        { title: 'Editor\'s Picks', href: '/artists?filter=editors-picks', description: 'Staff selections' },
        { title: 'Award Winners', href: '/artists?filter=award-winners', description: 'Prize recipients' },
      ]
    }
  ]

  const artworkSections: MenuSection[] = [
    {
      title: 'Discover Artworks',
      icon: <Camera size={16} />,
      items: [
        { title: 'Trending Works', href: '/search?filter=trending', description: 'Most viewed this week', badge: 'Hot', trending: true },
        { title: 'New This Week', href: '/search?filter=new', description: 'Fresh additions', badge: 'New' },
        { title: 'Under R1,000', href: '/search?price=under-1000', description: 'Affordable finds' },
        { title: 'Under R5,000', href: '/search?price=under-5000', description: 'Mid-range works' },
        { title: 'All Artworks', href: '/search', description: 'Browse everything' },
      ]
    },
    {
      title: 'By Price',
      icon: <TrendingUp size={16} />,
      items: [
        { title: 'Under R500', href: '/search?price=under-500', description: 'Budget-friendly' },
        { title: 'R500 - R2,500', href: '/search?price=500-2500', description: 'Mid-range' },
        { title: 'R2,500 - R10,000', href: '/search?price=2500-10000', description: 'Investment pieces' },
        { title: 'R10,000+', href: '/search?price=over-10000', description: 'Premium works' },
        { title: 'Make Offer', href: '/search?negotiable=true', description: 'Price negotiable' },
      ]
    },
    {
      title: 'By Medium',
      icon: <Palette size={16} />,
      items: [
        { title: 'Paintings', href: '/search?medium=painting', description: 'Oil, acrylic, watercolor' },
        { title: 'Photography', href: '/search?medium=photography', description: 'Digital & film prints' },
        { title: 'Sculptures', href: '/search?medium=sculpture', description: '3D works' },
        { title: 'Prints', href: '/search?medium=prints', description: 'Limited editions' },
        { title: 'Mixed Media', href: '/search?medium=mixed-media', description: 'Multi-material' },
      ]
    },
    {
      title: 'By Size',
      icon: <Award size={16} />,
      items: [
        { title: 'Small (under 40cm)', href: '/search?size=small', description: 'Intimate works' },
        { title: 'Medium (40-100cm)', href: '/search?size=medium', description: 'Standard size' },
        { title: 'Large (100cm+)', href: '/search?size=large', description: 'Statement pieces' },
        { title: 'Extra Large', href: '/search?size=extra-large', description: 'Museum scale' },
        { title: 'Any Size', href: '/search', description: 'All dimensions' },
      ]
    }
  ]

  const sections = type === 'artists' ? artistSections : artworkSections

  if (!isOpen) return null

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: '80px', // Position below header
        left: 0,
        right: 0,
        width: '100vw',
        backgroundColor: 'var(--card)',
        border: '1px solid var(--border)',
        borderTop: 'none',
        borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        zIndex: 1000,
        padding: 'var(--space-2xl)',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}
    >
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 'var(--space-2xl)'
      }}>
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-sm)',
              marginBottom: 'var(--space-lg)',
              paddingBottom: 'var(--space-sm)',
              borderBottom: '1px solid var(--border)'
            }}>
              {section.icon}
              <h3 style={{
                fontSize: '16px',
                fontWeight: '700',
                color: 'var(--fg)',
                margin: 0
              }}>
                {section.title}
              </h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {section.items.map((item, itemIndex) => (
                <Link
                  key={itemIndex}
                  to={item.href}
                  onClick={onClose}
                  style={{
                    display: 'block',
                    padding: 'var(--space-sm)',
                    borderRadius: 'var(--radius-sm)',
                    textDecoration: 'none',
                    color: 'var(--fg)',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-alt)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--space-xs)'
                  }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: 'var(--fg)'
                    }}>
                      {item.title}
                    </span>
                    {item.badge && (
                      <span style={{
                        fontSize: '10px',
                        fontWeight: '600',
                        color: item.trending ? 'var(--primary)' : 'var(--accent)',
                        backgroundColor: item.trending ? 'rgba(110, 31, 255, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        padding: '2px var(--space-xs)',
                        borderRadius: 'var(--radius-sm)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p style={{
                      fontSize: '12px',
                      color: 'var(--muted)',
                      margin: 0,
                      lineHeight: '1.4'
                    }}>
                      {item.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Featured Section */}
      <div style={{
        marginTop: 'var(--space-2xl)',
        paddingTop: 'var(--space-2xl)',
        borderTop: '1px solid var(--border)',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-sm)',
          backgroundColor: 'var(--primary)',
          color: 'white',
          padding: 'var(--space-sm) var(--space-lg)',
          borderRadius: 'var(--radius-full)',
          fontSize: '14px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: 'var(--space-md)'
        }}>
          <Sparkles size={16} />
          {type === 'artists' ? 'Featured Artists' : 'Featured Works'}
        </div>
        <p style={{
          fontSize: '14px',
          color: 'var(--muted)',
          margin: 0
        }}>
          Discover handpicked {type === 'artists' ? 'artists' : 'artworks'} curated by our team
        </p>
      </div>
    </div>
  )
}

export default MegaMenu
