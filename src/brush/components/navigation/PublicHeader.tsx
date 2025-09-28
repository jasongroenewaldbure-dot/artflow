import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Menu, X, Mic, Camera } from 'lucide-react'
import { trendingSearchService } from '../../../services/trendingSearch'
// import BrushIcon from '../../Icon'
import './PublicHeader.css'

const PublicHeader: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeMegaMenu, setActiveMegaMenu] = useState<'artworks' | 'artists' | 'catalogues' | 'community' | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isVoiceSearchActive, setIsVoiceSearchActive] = useState(false)
  const [trendingKeywords, setTrendingKeywords] = useState<string[]>([])

  useEffect(() => {
    // Load trending keywords
    const loadTrending = async () => {
      try {
        const keywords = await trendingSearchService.getTrendingKeywords()
        setTrendingKeywords(keywords.slice(0, 6).map(k => k.term))
      } catch {
        // Fallback trending keywords
        setTrendingKeywords(['Abstract Art', 'Contemporary', 'Photography', 'Sculpture', 'Digital Art', 'Emerging Artists'])
      }
    }
    loadTrending()
  }, [])

  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as unknown as { webkitSpeechRecognition: new () => any }).webkitSpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'
      
      recognition.onstart = () => {
        setIsVoiceSearchActive(true)
      }
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setSearchQuery(transcript)
        setIsVoiceSearchActive(false)
        // Trigger search
        window.location.href = `/search?q=${encodeURIComponent(transcript)}`
      }
      
      recognition.onerror = () => {
        setIsVoiceSearchActive(false)
      }
      
      recognition.onend = () => {
        setIsVoiceSearchActive(false)
      }
      
      recognition.start()
    }
  }

  const handleImageSearch = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement
      const file = target.files?.[0]
      if (file) {
        // Handle image search logic here
        console.log('Image search with file:', file)
        // You can implement the image search API call here
      }
    }
    input.click()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  return (
    <header className="public-header">
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="logo">
          ArtFlow
        </Link>

        {/* Main Navigation */}
        <nav className="main-nav">
          {/* Artworks with Mega Menu */}
          <div 
            className="nav-item-with-mega"
            onMouseEnter={() => setActiveMegaMenu('artworks')}
            onMouseLeave={() => setActiveMegaMenu(null)}
          >
            <Link to="/artworks" className="nav-link">
              Artworks
            </Link>
            {activeMegaMenu === 'artworks' && (
              <div className="mega-menu">
                <div className="mega-menu-content">
                  <div className="mega-menu-section">
                    <h3>Browse by Category</h3>
                    <Link to="/artworks?category=painting">Paintings</Link>
                    <Link to="/artworks?category=photography">Photography</Link>
                    <Link to="/artworks?category=sculpture">Sculpture</Link>
                    <Link to="/artworks?category=digital">Digital Art</Link>
                    <Link to="/artworks?category=mixed-media">Mixed Media</Link>
                  </div>
                  <div className="mega-menu-section">
                    <h3>Price Range</h3>
                    <Link to="/artworks?price=under-1000">Under R1,000</Link>
                    <Link to="/artworks?price=1000-5000">R1,000 - R5,000</Link>
                    <Link to="/artworks?price=5000-25000">R5,000 - R25,000</Link>
                    <Link to="/artworks?price=over-25000">Over R25,000</Link>
                  </div>
                  <div className="mega-menu-section">
                    <h3>Trending</h3>
                    <Link to="/artworks?trending=emerging">Emerging Artists</Link>
                    <Link to="/artworks?trending=contemporary">Contemporary</Link>
                    <Link to="/artworks?trending=local">Local Artists</Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Artists with Mega Menu */}
          <div 
            className="nav-item-with-mega"
            onMouseEnter={() => setActiveMegaMenu('artists')}
            onMouseLeave={() => setActiveMegaMenu(null)}
          >
            <Link to="/artists" className="nav-link">
              Artists
            </Link>
            {activeMegaMenu === 'artists' && (
              <div className="mega-menu">
                <div className="mega-menu-content">
                  <div className="mega-menu-section">
                    <h3>Discover Artists</h3>
                    <Link to="/artists?type=emerging">Emerging Artists</Link>
                    <Link to="/artists?type=established">Established Artists</Link>
                    <Link to="/artists?type=local">Local Artists</Link>
                    <Link to="/artists?type=international">International</Link>
                  </div>
                  <div className="mega-menu-section">
                    <h3>By Medium</h3>
                    <Link to="/artists?medium=painting">Painters</Link>
                    <Link to="/artists?medium=photography">Photographers</Link>
                    <Link to="/artists?medium=sculpture">Sculptors</Link>
                    <Link to="/artists?medium=digital">Digital Artists</Link>
                  </div>
                  <div className="mega-menu-section">
                    <h3>Featured</h3>
                    <Link to="/artists?featured=artist-of-month">Artist of the Month</Link>
                    <Link to="/artists?featured=rising-stars">Rising Stars</Link>
                    <Link to="/artists?featured=gallery-picks">Gallery Picks</Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Catalogues with Mega Menu */}
          <div 
            className="nav-item-with-mega"
            onMouseEnter={() => setActiveMegaMenu('catalogues')}
            onMouseLeave={() => setActiveMegaMenu(null)}
          >
            <Link to="/catalogues" className="nav-link">
              Catalogues
            </Link>
            {activeMegaMenu === 'catalogues' && (
              <div className="mega-menu">
                <div className="mega-menu-content">
                  <div className="mega-menu-section">
                    <h3>Curated Collections</h3>
                    <Link to="/catalogues?type=gallery">Gallery Collections</Link>
                    <Link to="/catalogues?type=artist">Artist Catalogues</Link>
                    <Link to="/catalogues?type=thematic">Thematic Collections</Link>
                    <Link to="/catalogues?type=exhibition">Exhibition Catalogues</Link>
                  </div>
                  <div className="mega-menu-section">
                    <h3>Popular Themes</h3>
                    <Link to="/catalogues?theme=contemporary">Contemporary Art</Link>
                    <Link to="/catalogues?theme=abstract">Abstract Art</Link>
                    <Link to="/catalogues?theme=landscape">Landscapes</Link>
                    <Link to="/catalogues?theme=portrait">Portraits</Link>
                  </div>
                  <div className="mega-menu-section">
                    <h3>Create</h3>
                    <Link to="/catalogue/create">Create Catalogue</Link>
                    <Link to="/catalogue/builder">Catalogue Builder</Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Community with Trending Keywords */}
          <div 
            className="nav-item-with-mega"
            onMouseEnter={() => setActiveMegaMenu('community')}
            onMouseLeave={() => setActiveMegaMenu(null)}
          >
            <Link to="/community" className="nav-link">
              Community
            </Link>
            {activeMegaMenu === 'community' && (
              <div className="mega-menu">
                <div className="mega-menu-content">
                  <div className="mega-menu-section">
                    <h3>Trending Keywords</h3>
                    {trendingKeywords.map((keyword, index) => (
                      <Link key={index} to={`/search?q=${encodeURIComponent(keyword)}`}>
                        {keyword}
                      </Link>
                    ))}
                  </div>
                  <div className="mega-menu-section">
                    <h3>Community Features</h3>
                    <Link to="/community/curated-lists">Curated Lists</Link>
                    <Link to="/community/discussions">Discussions</Link>
                    <Link to="/community/events">Events</Link>
                    <Link to="/community/challenges">Art Challenges</Link>
                  </div>
                  <div className="mega-menu-section">
                    <h3>Collections</h3>
                    <Link to="/community/public-collections">Public Collections</Link>
                    <Link to="/community/trending-collections">Trending Collections</Link>
                    <Link to="/community/featured-collectors">Featured Collectors</Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Search Bar with Image and Voice Search */}
        <div className="search-container">
          <form onSubmit={handleSearch} className="search-bar">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search artworks, artists, catalogues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <div className="search-actions">
              <button 
                type="button"
                onClick={handleImageSearch}
                className="search-action-btn"
                title="Search by image"
              >
                <Camera size={18} />
              </button>
              <button 
                type="button"
                onClick={handleVoiceSearch}
                className={`search-action-btn ${isVoiceSearchActive ? 'active' : ''}`}
                title="Voice search"
              >
                <Mic size={18} />
              </button>
            </div>
          </form>
        </div>

        {/* User Actions - Two Buttons */}
        <div className="user-actions">
          <Link to="/start?mode=signin" className="sign-in-btn">
            Sign In
          </Link>
          <Link to="/start?mode=signup" className="get-started-btn">
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="mobile-menu-btn"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <Link to="/artworks" className="mobile-nav-link">Artworks</Link>
          <Link to="/artists" className="mobile-nav-link">Artists</Link>
          <Link to="/catalogues" className="mobile-nav-link">Catalogues</Link>
          <Link to="/community" className="mobile-nav-link">Community</Link>
          <div className="mobile-trending">
            <h4>Trending</h4>
            {trendingKeywords.slice(0, 4).map((keyword, index) => (
              <Link key={index} to={`/search?q=${encodeURIComponent(keyword)}`} className="mobile-trending-link">
                {keyword}
              </Link>
            ))}
          </div>
          <Link to="/start?mode=signin" className="mobile-nav-link">Sign In</Link>
          <Link to="/start?mode=signup" className="mobile-nav-link">Get Started</Link>
        </div>
      )}
    </header>
  )
}

export default PublicHeader