import React, { useState, useRef, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft,
  Save,
  Plus,
  X,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Users,
  Calendar,
  Send,
  Palette,
  BookOpen,
  Image as ImageIcon,
  Edit3,
  Trash2,
  Move,
  Settings,
  Wand2,
  Download,
  Share2,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface CatalogueArtwork {
  id: string
  title: string
  image: string
  price: number
  currency: string
  medium: string
  dimensions: string
  year: number
  description: string
  order: number
}

interface CatalogueFormData {
  title: string
  description: string
  coverImage: string
  theme: 'minimal' | 'classic' | 'modern' | 'gallery'
  visibility: 'public' | 'password' | 'contacts' | 'private'
  password?: string
  selectedContacts: string[]
  scheduledDate?: string
  isScheduled: boolean
  includePrices: boolean
  includeDimensions: boolean
  includeDescriptions: boolean
  customMessage: string
  footerText: string
}

const CatalogueCreate: React.FC = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'content' | 'design' | 'audience' | 'schedule'>('content')
  const [isSaving, setIsSaving] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  
  const [formData, setFormData] = useState<CatalogueFormData>({
    title: '',
    description: '',
    coverImage: '',
    theme: 'minimal',
    visibility: 'public',
    password: '',
    selectedContacts: [],
    scheduledDate: '',
    isScheduled: false,
    includePrices: true,
    includeDimensions: true,
    includeDescriptions: true,
    customMessage: '',
    footerText: ''
  })

  const [artworks, setArtworks] = useState<CatalogueArtwork[]>([
    {
      id: '1',
      title: 'Sunset Dreams',
      image: '/api/placeholder/300/400',
      price: 2500,
      currency: 'USD',
      medium: 'Oil on Canvas',
      dimensions: '60 × 80 cm',
      year: 2024,
      description: 'A vibrant exploration of color and light',
      order: 1
    },
    {
      id: '2',
      title: 'Urban Reflections',
      image: '/api/placeholder/300/400',
      price: 1800,
      currency: 'USD',
      medium: 'Acrylic on Canvas',
      dimensions: '50 × 70 cm',
      year: 2024,
      description: 'Contemporary cityscape with abstract elements',
      order: 2
    },
    {
      id: '3',
      title: 'Ocean Waves',
      image: '/api/placeholder/300/400',
      price: 3200,
      currency: 'USD',
      medium: 'Mixed Media',
      dimensions: '80 × 100 cm',
      year: 2024,
      description: 'Dynamic representation of natural forces',
      order: 3
    }
  ])

  const [availableContacts] = useState([
    { id: '1', name: 'Sarah Johnson', email: 'sarah@example.com' },
    { id: '2', name: 'Michael Chen', email: 'michael@example.com' },
    { id: '3', name: 'Emma Wilson', email: 'emma@example.com' },
    { id: '4', name: 'David Brown', email: 'david@example.com' }
  ])

  const themes = [
    { id: 'minimal', name: 'Minimal', description: 'Clean and simple design' },
    { id: 'classic', name: 'Classic', description: 'Traditional gallery style' },
    { id: 'modern', name: 'Modern', description: 'Contemporary and bold' },
    { id: 'gallery', name: 'Gallery', description: 'Professional exhibition style' }
  ]

  const handleInputChange = (field: keyof CatalogueFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addArtwork = () => {
    const newArtwork: CatalogueArtwork = {
      id: `artwork-${Date.now()}`,
      title: 'New Artwork',
      image: '/api/placeholder/300/400',
      price: 0,
      currency: 'USD',
      medium: '',
      dimensions: '',
      year: new Date().getFullYear(),
      description: '',
      order: artworks.length + 1
    }
    setArtworks(prev => [...prev, newArtwork])
  }

  const removeArtwork = (id: string) => {
    setArtworks(prev => prev.filter(artwork => artwork.id !== id))
  }

  const updateArtwork = (id: string, field: keyof CatalogueArtwork, value: any) => {
    setArtworks(prev => prev.map(artwork => 
      artwork.id === id ? { ...artwork, [field]: value } : artwork
    ))
  }

  const reorderArtworks = (fromIndex: number, toIndex: number) => {
    setArtworks(prev => {
      const newArtworks = [...prev]
      const [movedArtwork] = newArtworks.splice(fromIndex, 1)
      newArtworks.splice(toIndex, 0, movedArtwork)
      return newArtworks.map((artwork, index) => ({ ...artwork, order: index + 1 }))
    })
  }

  const toggleContact = (contactId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedContacts: prev.selectedContacts.includes(contactId)
        ? prev.selectedContacts.filter(id => id !== contactId)
        : [...prev.selectedContacts, contactId]
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      console.log('Saving catalogue:', { formData, artworks })
      await new Promise(resolve => setTimeout(resolve, 2000))
      navigate('/catalogues')
    } catch (error) {
      console.error('Error saving catalogue:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSend = async () => {
    try {
      console.log('Sending catalogue:', { formData, artworks })
      await new Promise(resolve => setTimeout(resolve, 2000))
      navigate('/catalogues')
    } catch (error) {
      console.error('Error sending catalogue:', error)
    }
  }

  const tabs = [
    { id: 'content', label: 'Content', icon: <BookOpen size={16} /> },
    { id: 'design', label: 'Design', icon: <Palette size={16} /> },
    { id: 'audience', label: 'Audience', icon: <Users size={16} /> },
    { id: 'schedule', label: 'Schedule', icon: <Calendar size={16} /> }
  ]

  return (
    <div className="catalogue-create-container">
      <Helmet>
        <title>Create Catalogue | ArtFlow</title>
        <meta name="description" content="Create a beautiful digital catalogue to showcase your artworks." />
      </Helmet>

      <div className="catalogue-create-header">
        <div className="catalogue-create-nav">
          <button 
            onClick={() => navigate('/catalogues')}
            className="catalogue-create-back"
          >
            <ArrowLeft size={18} />
            Back to Catalogues
          </button>
          <h1 className="catalogue-create-title">Create New Catalogue</h1>
        </div>
        <div className="catalogue-create-actions">
          <button 
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="catalogue-create-preview"
          >
            {isPreviewMode ? <Edit3 size={18} /> : <Eye size={18} />}
            {isPreviewMode ? 'Edit' : 'Preview'}
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving || !formData.title || artworks.length === 0}
            className="catalogue-create-save"
          >
            <Save size={18} />
            {isSaving ? 'Saving...' : 'Save Draft'}
          </button>
          <button 
            onClick={handleSend}
            disabled={!formData.title || artworks.length === 0}
            className="catalogue-create-send"
          >
            <Send size={18} />
            Send Catalogue
          </button>
        </div>
      </div>

      <div className="catalogue-create-content">
        {!isPreviewMode ? (
          <>
            {/* Form Tabs */}
            <div className="catalogue-create-tabs">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`catalogue-create-tab ${activeTab === tab.id ? 'catalogue-create-tab--active' : ''}`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Form Content */}
            <div className="catalogue-create-form">
              {activeTab === 'content' && (
                <div className="catalogue-create-tab-content">
                  <div className="catalogue-create-section">
                    <h2 className="catalogue-create-section-title">Catalogue Information</h2>
                    <div className="catalogue-create-field-group">
                      <label className="catalogue-create-label">
                        Title *
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          placeholder="Enter catalogue title"
                          className="catalogue-create-input"
                        />
                      </label>
                    </div>
                    <div className="catalogue-create-field-group">
                      <label className="catalogue-create-label">
                        Description
                        <textarea
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          placeholder="Describe this catalogue..."
                          className="catalogue-create-textarea"
                          rows={3}
                        />
                      </label>
                    </div>
                    <div className="catalogue-create-field-group">
                      <label className="catalogue-create-label">
                        Cover Image
                        <div className="catalogue-create-cover-upload">
                          {formData.coverImage ? (
                            <div className="catalogue-create-cover-preview">
                              <img src={formData.coverImage} alt="Cover" />
                              <button 
                                onClick={() => handleInputChange('coverImage', '')}
                                className="catalogue-create-cover-remove"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="catalogue-create-cover-placeholder">
                              <ImageIcon size={48} />
                              <span>Upload cover image</span>
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="catalogue-create-section">
                    <div className="catalogue-create-section-header">
                      <h2 className="catalogue-create-section-title">Artworks ({artworks.length})</h2>
                      <button onClick={addArtwork} className="catalogue-create-add-artwork">
                        <Plus size={16} />
                        Add Artwork
                      </button>
                    </div>
                    <div className="catalogue-create-artworks">
                      {artworks.map((artwork, index) => (
                        <div key={artwork.id} className="catalogue-create-artwork-item">
                          <div className="catalogue-create-artwork-image">
                            <img src={artwork.image} alt={artwork.title} />
                            <div className="catalogue-create-artwork-order">{artwork.order}</div>
                          </div>
                          <div className="catalogue-create-artwork-details">
                            <input
                              type="text"
                              value={artwork.title}
                              onChange={(e) => updateArtwork(artwork.id, 'title', e.target.value)}
                              className="catalogue-create-input"
                              placeholder="Artwork title"
                            />
                            <div className="catalogue-create-artwork-row">
                              <input
                                type="text"
                                value={artwork.medium}
                                onChange={(e) => updateArtwork(artwork.id, 'medium', e.target.value)}
                                className="catalogue-create-input"
                                placeholder="Medium"
                              />
                              <input
                                type="text"
                                value={artwork.dimensions}
                                onChange={(e) => updateArtwork(artwork.id, 'dimensions', e.target.value)}
                                className="catalogue-create-input"
                                placeholder="Dimensions"
                              />
                            </div>
                            <div className="catalogue-create-artwork-row">
                              <input
                                type="number"
                                value={artwork.price}
                                onChange={(e) => updateArtwork(artwork.id, 'price', parseFloat(e.target.value))}
                                className="catalogue-create-input"
                                placeholder="Price"
                              />
                              <select
                                value={artwork.currency}
                                onChange={(e) => updateArtwork(artwork.id, 'currency', e.target.value)}
                                className="catalogue-create-select"
                              >
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="GBP">GBP</option>
                              </select>
                            </div>
                            <textarea
                              value={artwork.description}
                              onChange={(e) => updateArtwork(artwork.id, 'description', e.target.value)}
                              className="catalogue-create-textarea"
                              placeholder="Description"
                              rows={2}
                            />
                          </div>
                          <div className="catalogue-create-artwork-actions">
                            <button
                              onClick={() => reorderArtworks(index, Math.max(0, index - 1))}
                              disabled={index === 0}
                              className="catalogue-create-reorder-btn"
                            >
                              ↑
                            </button>
                            <button
                              onClick={() => reorderArtworks(index, Math.min(artworks.length - 1, index + 1))}
                              disabled={index === artworks.length - 1}
                              className="catalogue-create-reorder-btn"
                            >
                              ↓
                            </button>
                            <button
                              onClick={() => removeArtwork(artwork.id)}
                              className="catalogue-create-remove-btn"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'design' && (
                <div className="catalogue-create-tab-content">
                  <div className="catalogue-create-section">
                    <h2 className="catalogue-create-section-title">Theme & Layout</h2>
                    <div className="catalogue-create-themes">
                      {themes.map(theme => (
                        <div
                          key={theme.id}
                          className={`catalogue-create-theme ${formData.theme === theme.id ? 'catalogue-create-theme--selected' : ''}`}
                          onClick={() => handleInputChange('theme', theme.id)}
                        >
                          <div className="catalogue-create-theme-preview">
                            <div className={`catalogue-create-theme-preview-${theme.id}`}></div>
                          </div>
                          <div className="catalogue-create-theme-info">
                            <h3>{theme.name}</h3>
                            <p>{theme.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="catalogue-create-section">
                    <h2 className="catalogue-create-section-title">Content Options</h2>
                    <div className="catalogue-create-options">
                      <label className="catalogue-create-option">
                        <input
                          type="checkbox"
                          checked={formData.includePrices}
                          onChange={(e) => handleInputChange('includePrices', e.target.checked)}
                        />
                        <span>Include prices</span>
                      </label>
                      <label className="catalogue-create-option">
                        <input
                          type="checkbox"
                          checked={formData.includeDimensions}
                          onChange={(e) => handleInputChange('includeDimensions', e.target.checked)}
                        />
                        <span>Include dimensions</span>
                      </label>
                      <label className="catalogue-create-option">
                        <input
                          type="checkbox"
                          checked={formData.includeDescriptions}
                          onChange={(e) => handleInputChange('includeDescriptions', e.target.checked)}
                        />
                        <span>Include descriptions</span>
                      </label>
                    </div>
                  </div>

                  <div className="catalogue-create-section">
                    <h2 className="catalogue-create-section-title">Custom Message</h2>
                    <div className="catalogue-create-field-group">
                      <label className="catalogue-create-label">
                        Personal Message
                        <textarea
                          value={formData.customMessage}
                          onChange={(e) => handleInputChange('customMessage', e.target.value)}
                          placeholder="Add a personal message to your catalogue..."
                          className="catalogue-create-textarea"
                          rows={4}
                        />
                      </label>
                    </div>
                    <div className="catalogue-create-field-group">
                      <label className="catalogue-create-label">
                        Footer Text
                        <input
                          type="text"
                          value={formData.footerText}
                          onChange={(e) => handleInputChange('footerText', e.target.value)}
                          placeholder="e.g., © 2024 Your Name. All rights reserved."
                          className="catalogue-create-input"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'audience' && (
                <div className="catalogue-create-tab-content">
                  <div className="catalogue-create-section">
                    <h2 className="catalogue-create-section-title">Visibility Settings</h2>
                    <div className="catalogue-create-visibility-options">
                      <label className="catalogue-create-visibility-option">
                        <input
                          type="radio"
                          name="visibility"
                          value="public"
                          checked={formData.visibility === 'public'}
                          onChange={(e) => handleInputChange('visibility', e.target.value)}
                        />
                        <div className="catalogue-create-visibility-content">
                          <div className="catalogue-create-visibility-title">
                            <Eye size={16} />
                            Public
                          </div>
                          <p>Anyone with the link can view this catalogue</p>
                        </div>
                      </label>
                      <label className="catalogue-create-visibility-option">
                        <input
                          type="radio"
                          name="visibility"
                          value="password"
                          checked={formData.visibility === 'password'}
                          onChange={(e) => handleInputChange('visibility', e.target.value)}
                        />
                        <div className="catalogue-create-visibility-content">
                          <div className="catalogue-create-visibility-title">
                            <Lock size={16} />
                            Password Protected
                          </div>
                          <p>Requires a password to view</p>
                        </div>
                      </label>
                      <label className="catalogue-create-visibility-option">
                        <input
                          type="radio"
                          name="visibility"
                          value="contacts"
                          checked={formData.visibility === 'contacts'}
                          onChange={(e) => handleInputChange('visibility', e.target.value)}
                        />
                        <div className="catalogue-create-visibility-content">
                          <div className="catalogue-create-visibility-title">
                            <Users size={16} />
                            Selected Contacts
                          </div>
                          <p>Only selected contacts can view</p>
                        </div>
                      </label>
                      <label className="catalogue-create-visibility-option">
                        <input
                          type="radio"
                          name="visibility"
                          value="private"
                          checked={formData.visibility === 'private'}
                          onChange={(e) => handleInputChange('visibility', e.target.value)}
                        />
                        <div className="catalogue-create-visibility-content">
                          <div className="catalogue-create-visibility-title">
                            <EyeOff size={16} />
                            Private
                          </div>
                          <p>Only you can view this catalogue</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {formData.visibility === 'password' && (
                    <div className="catalogue-create-section">
                      <h2 className="catalogue-create-section-title">Password</h2>
                      <div className="catalogue-create-field-group">
                        <input
                          type="password"
                          value={formData.password || ''}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          placeholder="Enter password"
                          className="catalogue-create-input"
                        />
                      </div>
                    </div>
                  )}

                  {formData.visibility === 'contacts' && (
                    <div className="catalogue-create-section">
                      <h2 className="catalogue-create-section-title">Select Contacts</h2>
                      <div className="catalogue-create-contacts">
                        {availableContacts.map(contact => (
                          <label key={contact.id} className="catalogue-create-contact">
                            <input
                              type="checkbox"
                              checked={formData.selectedContacts.includes(contact.id)}
                              onChange={() => toggleContact(contact.id)}
                            />
                            <div className="catalogue-create-contact-info">
                              <div className="catalogue-create-contact-name">{contact.name}</div>
                              <div className="catalogue-create-contact-email">{contact.email}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'schedule' && (
                <div className="catalogue-create-tab-content">
                  <div className="catalogue-create-section">
                    <h2 className="catalogue-create-section-title">Send Schedule</h2>
                    <div className="catalogue-create-schedule-options">
                      <label className="catalogue-create-schedule-option">
                        <input
                          type="radio"
                          name="schedule"
                          checked={!formData.isScheduled}
                          onChange={() => handleInputChange('isScheduled', false)}
                        />
                        <div className="catalogue-create-schedule-content">
                          <div className="catalogue-create-schedule-title">
                            <Send size={16} />
                            Send Now
                          </div>
                          <p>Send the catalogue immediately</p>
                        </div>
                      </label>
                      <label className="catalogue-create-schedule-option">
                        <input
                          type="radio"
                          name="schedule"
                          checked={formData.isScheduled}
                          onChange={() => handleInputChange('isScheduled', true)}
                        />
                        <div className="catalogue-create-schedule-content">
                          <div className="catalogue-create-schedule-title">
                            <Calendar size={16} />
                            Schedule Send
                          </div>
                          <p>Send the catalogue at a specific date and time</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {formData.isScheduled && (
                    <div className="catalogue-create-section">
                      <h2 className="catalogue-create-section-title">Schedule Details</h2>
                      <div className="catalogue-create-field-group">
                        <label className="catalogue-create-label">
                          Send Date & Time
                          <input
                            type="datetime-local"
                            value={formData.scheduledDate || ''}
                            onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                            className="catalogue-create-input"
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="catalogue-create-preview">
            <div className="catalogue-preview">
              <div className="catalogue-preview-header">
                <h1 className="catalogue-preview-title">{formData.title || 'Catalogue Title'}</h1>
                {formData.description && (
                  <p className="catalogue-preview-description">{formData.description}</p>
                )}
              </div>
              <div className="catalogue-preview-artworks">
                {artworks.map((artwork, index) => (
                  <div key={artwork.id} className="catalogue-preview-artwork">
                    <div className="catalogue-preview-artwork-image">
                      <img src={artwork.image} alt={artwork.title} />
                    </div>
                    <div className="catalogue-preview-artwork-info">
                      <h3>{artwork.title}</h3>
                      <p>{artwork.medium} • {artwork.year}</p>
                      {formData.includeDimensions && <p>{artwork.dimensions}</p>}
                      {formData.includePrices && <p className="catalogue-preview-price">${artwork.price.toLocaleString()} {artwork.currency}</p>}
                      {formData.includeDescriptions && artwork.description && <p>{artwork.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
              {formData.footerText && (
                <div className="catalogue-preview-footer">
                  <p>{formData.footerText}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CatalogueCreate
