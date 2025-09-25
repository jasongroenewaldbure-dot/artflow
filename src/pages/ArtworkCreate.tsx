import React, { useState, useRef, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { 
  Upload, 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  ArrowLeft,
  Image as ImageIcon,
  Palette,
  Ruler,
  DollarSign,
  Tag,
  FileText,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Camera,
  Wand2,
  RotateCcw,
  Move,
  Crop
} from 'lucide-react'

interface ArtworkImage {
  id: string
  file: File
  preview: string
  isPrimary: boolean
  order: number
}

interface ArtworkFormData {
  title: string
  description: string
  medium: string
  style: string
  dimensions: {
    width: number
    height: number
    depth?: number
    unit: 'cm' | 'in'
  }
  year: number
  price: number
  currency: string
  status: 'available' | 'sold' | 'reserved' | 'private'
  tags: string[]
  location: string
  condition: string
  provenance: string
  exhibitionHistory: string
  awards: string
  isPublic: boolean
  allowInquiries: boolean
}

const ArtworkCreate: React.FC = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [images, setImages] = useState<ArtworkImage[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'pricing' | 'visibility'>('basic')
  const [formData, setFormData] = useState<ArtworkFormData>({
    title: '',
    description: '',
    medium: '',
    style: '',
    dimensions: {
      width: 0,
      height: 0,
      depth: 0,
      unit: 'cm'
    },
    year: new Date().getFullYear(),
    price: 0,
    currency: 'USD',
    status: 'available',
    tags: [],
    location: '',
    condition: 'excellent',
    provenance: '',
    exhibitionHistory: '',
    awards: '',
    isPublic: true,
    allowInquiries: true
  })

  const [newTag, setNewTag] = useState('')

  const handleImageUpload = useCallback((files: FileList) => {
    const newImages: ArtworkImage[] = Array.from(files).map((file, index) => ({
      id: `img-${Date.now()}-${index}`,
      file,
      preview: URL.createObjectURL(file),
      isPrimary: images.length === 0 && index === 0,
      order: images.length + index
    }))

    setImages(prev => [...prev, ...newImages])
  }, [images.length])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleImageUpload(files)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleImageUpload(files)
    }
  }

  const removeImage = (id: string) => {
    setImages(prev => {
      const newImages = prev.filter(img => img.id !== id)
      // If we removed the primary image, make the first remaining image primary
      if (newImages.length > 0 && !newImages.some(img => img.isPrimary)) {
        newImages[0].isPrimary = true
      }
      return newImages
    })
  }

  const setPrimaryImage = (id: string) => {
    setImages(prev => prev.map(img => ({
      ...img,
      isPrimary: img.id === id
    })))
  }

  const reorderImages = (fromIndex: number, toIndex: number) => {
    setImages(prev => {
      const newImages = [...prev]
      const [movedImage] = newImages.splice(fromIndex, 1)
      newImages.splice(toIndex, 0, movedImage)
      return newImages.map((img, index) => ({ ...img, order: index }))
    })
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const handleInputChange = (field: keyof ArtworkFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleDimensionChange = (field: keyof ArtworkFormData['dimensions'], value: any) => {
    setFormData(prev => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [field]: value
      }
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Here you would typically upload images and save artwork data
      console.log('Saving artwork:', { formData, images })
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      navigate('/artworks')
    } catch (error) {
      console.error('Error saving artwork:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: <FileText size={16} /> },
    { id: 'details', label: 'Details', icon: <Palette size={16} /> },
    { id: 'pricing', label: 'Pricing', icon: <DollarSign size={16} /> },
    { id: 'visibility', label: 'Visibility', icon: <Eye size={16} /> }
  ]

  return (
    <div className="artwork-create-container">
      <Helmet>
        <title>Create Artwork | ArtFlow</title>
        <meta name="description" content="Add a new artwork to your portfolio with detailed information and images." />
      </Helmet>

      <div className="artwork-create-header">
        <div className="artwork-create-nav">
          <button 
            onClick={() => navigate('/artworks')}
            className="artwork-create-back"
          >
            <ArrowLeft size={18} />
            Back to Artworks
          </button>
          <h1 className="artwork-create-title">Create New Artwork</h1>
        </div>
        <div className="artwork-create-actions">
          <button 
            onClick={handleSave}
            disabled={isSaving || !formData.title || images.length === 0}
            className="artwork-create-save"
          >
            <Save size={18} />
            {isSaving ? 'Saving...' : 'Save Artwork'}
          </button>
        </div>
      </div>

      <div className="artwork-create-content">
        {/* Image Upload Section */}
        <div className="artwork-create-section">
          <h2 className="artwork-create-section-title">Images</h2>
          
          {images.length === 0 ? (
            <div 
              className="artwork-create-upload-area"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="artwork-create-upload-content">
                <Upload size={48} />
                <h3>Upload Images</h3>
                <p>Drag and drop images here, or click to browse</p>
                <p className="artwork-create-upload-hint">
                  Upload up to 10 high-quality images (JPG, PNG, WebP)
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="artwork-create-file-input"
              />
            </div>
          ) : (
            <div className="artwork-create-images">
              <div className="artwork-create-images-grid">
                {images.map((image, index) => (
                  <div key={image.id} className="artwork-create-image-item">
                    <div className="artwork-create-image-container">
                      <img 
                        src={image.preview} 
                        alt={`Artwork ${index + 1}`}
                        className="artwork-create-image"
                      />
                      {image.isPrimary && (
                        <div className="artwork-create-primary-badge">Primary</div>
                      )}
                      <div className="artwork-create-image-actions">
                        <button
                          onClick={() => setPrimaryImage(image.id)}
                          disabled={image.isPrimary}
                          className="artwork-create-image-action"
                          title="Set as primary"
                        >
                          <div className="star-icon">⭐</div>
                        </button>
                        <button
                          onClick={() => removeImage(image.id)}
                          className="artwork-create-image-action artwork-create-image-action--danger"
                          title="Remove image"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="artwork-create-image-controls">
                      <button
                        onClick={() => reorderImages(index, Math.max(0, index - 1))}
                        disabled={index === 0}
                        className="artwork-create-reorder-btn"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => reorderImages(index, Math.min(images.length - 1, index + 1))}
                        disabled={index === images.length - 1}
                        className="artwork-create-reorder-btn"
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {images.length < 10 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="artwork-create-add-more"
                >
                  <Plus size={18} />
                  Add More Images
                </button>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="artwork-create-file-input"
              />
            </div>
          )}
        </div>

        {/* Form Tabs */}
        <div className="artwork-create-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`artwork-create-tab ${activeTab === tab.id ? 'artwork-create-tab--active' : ''}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Content */}
        <div className="artwork-create-form">
          {activeTab === 'basic' && (
            <div className="artwork-create-tab-content">
              <div className="artwork-create-field-group">
                <label className="artwork-create-label">
                  Title *
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter artwork title"
                    className="artwork-create-input"
                  />
                </label>
              </div>

              <div className="artwork-create-field-group">
                <label className="artwork-create-label">
                  Description
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your artwork, inspiration, techniques used..."
                    className="artwork-create-textarea"
                    rows={4}
                  />
                </label>
              </div>

              <div className="artwork-create-field-row">
                <div className="artwork-create-field-group">
                  <label className="artwork-create-label">
                    Medium *
                    <input
                      type="text"
                      value={formData.medium}
                      onChange={(e) => handleInputChange('medium', e.target.value)}
                      placeholder="e.g., Oil on Canvas"
                      className="artwork-create-input"
                    />
                  </label>
                </div>
                <div className="artwork-create-field-group">
                  <label className="artwork-create-label">
                    Style
                    <input
                      type="text"
                      value={formData.style}
                      onChange={(e) => handleInputChange('style', e.target.value)}
                      placeholder="e.g., Abstract, Realism"
                      className="artwork-create-input"
                    />
                  </label>
                </div>
              </div>

              <div className="artwork-create-field-group">
                <label className="artwork-create-label">
                  Year *
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                    min="1900"
                    max={new Date().getFullYear()}
                    className="artwork-create-input"
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="artwork-create-tab-content">
              <div className="artwork-create-field-group">
                <label className="artwork-create-label">Dimensions</label>
                <div className="artwork-create-dimensions">
                  <div className="artwork-create-dimension-field">
                    <input
                      type="number"
                      value={formData.dimensions.width}
                      onChange={(e) => handleDimensionChange('width', parseFloat(e.target.value))}
                      placeholder="Width"
                      className="artwork-create-input"
                    />
                    <span>×</span>
                    <input
                      type="number"
                      value={formData.dimensions.height}
                      onChange={(e) => handleDimensionChange('height', parseFloat(e.target.value))}
                      placeholder="Height"
                      className="artwork-create-input"
                    />
                    <input
                      type="number"
                      value={formData.dimensions.depth || ''}
                      onChange={(e) => handleDimensionChange('depth', parseFloat(e.target.value))}
                      placeholder="Depth (optional)"
                      className="artwork-create-input"
                    />
                    <select
                      value={formData.dimensions.unit}
                      onChange={(e) => handleDimensionChange('unit', e.target.value)}
                      className="artwork-create-select"
                    >
                      <option value="cm">cm</option>
                      <option value="in">in</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="artwork-create-field-group">
                <label className="artwork-create-label">
                  Condition
                  <select
                    value={formData.condition}
                    onChange={(e) => handleInputChange('condition', e.target.value)}
                    className="artwork-create-select"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="very-good">Very Good</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </label>
              </div>

              <div className="artwork-create-field-group">
                <label className="artwork-create-label">
                  Location
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Where is this artwork located?"
                    className="artwork-create-input"
                  />
                </label>
              </div>

              <div className="artwork-create-field-group">
                <label className="artwork-create-label">
                  Provenance
                  <textarea
                    value={formData.provenance}
                    onChange={(e) => handleInputChange('provenance', e.target.value)}
                    placeholder="History of ownership, previous exhibitions..."
                    className="artwork-create-textarea"
                    rows={3}
                  />
                </label>
              </div>

              <div className="artwork-create-field-group">
                <label className="artwork-create-label">
                  Exhibition History
                  <textarea
                    value={formData.exhibitionHistory}
                    onChange={(e) => handleInputChange('exhibitionHistory', e.target.value)}
                    placeholder="List exhibitions, shows, galleries where this work was displayed..."
                    className="artwork-create-textarea"
                    rows={3}
                  />
                </label>
              </div>

              <div className="artwork-create-field-group">
                <label className="artwork-create-label">
                  Awards & Recognition
                  <textarea
                    value={formData.awards}
                    onChange={(e) => handleInputChange('awards', e.target.value)}
                    placeholder="Any awards, recognition, or special mentions..."
                    className="artwork-create-textarea"
                    rows={2}
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="artwork-create-tab-content">
              <div className="artwork-create-field-row">
                <div className="artwork-create-field-group">
                  <label className="artwork-create-label">
                    Price *
                    <div className="artwork-create-price-input">
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                        placeholder="0.00"
                        className="artwork-create-input"
                      />
                      <select
                        value={formData.currency}
                        onChange={(e) => handleInputChange('currency', e.target.value)}
                        className="artwork-create-select"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="CAD">CAD</option>
                        <option value="AUD">AUD</option>
                      </select>
                    </div>
                  </label>
                </div>
                <div className="artwork-create-field-group">
                  <label className="artwork-create-label">
                    Status
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="artwork-create-select"
                    >
                      <option value="available">Available</option>
                      <option value="sold">Sold</option>
                      <option value="reserved">Reserved</option>
                      <option value="private">Private Collection</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="artwork-create-field-group">
                <label className="artwork-create-label">Tags</label>
                <div className="artwork-create-tags">
                  <div className="artwork-create-tags-input">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="Add a tag and press Enter"
                      className="artwork-create-input"
                    />
                    <button onClick={addTag} className="artwork-create-add-tag">
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="artwork-create-tags-list">
                    {formData.tags.map((tag, index) => (
                      <span key={index} className="artwork-create-tag">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="artwork-create-tag-remove">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'visibility' && (
            <div className="artwork-create-tab-content">
              <div className="artwork-create-field-group">
                <div className="artwork-create-toggle">
                  <label className="artwork-create-toggle-label">
                    <input
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                      className="artwork-create-toggle-input"
                    />
                    <span className="artwork-create-toggle-slider"></span>
                    <div className="artwork-create-toggle-content">
                      <div className="artwork-create-toggle-title">
                        {formData.isPublic ? <Eye size={16} /> : <EyeOff size={16} />}
                        Public Visibility
                      </div>
                      <div className="artwork-create-toggle-description">
                        {formData.isPublic 
                          ? 'This artwork will be visible to the public on your profile'
                          : 'This artwork will only be visible to you'
                        }
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="artwork-create-field-group">
                <div className="artwork-create-toggle">
                  <label className="artwork-create-toggle-label">
                    <input
                      type="checkbox"
                      checked={formData.allowInquiries}
                      onChange={(e) => handleInputChange('allowInquiries', e.target.checked)}
                      className="artwork-create-toggle-input"
                    />
                    <span className="artwork-create-toggle-slider"></span>
                    <div className="artwork-create-toggle-content">
                      <div className="artwork-create-toggle-title">
                        {formData.allowInquiries ? <Unlock size={16} /> : <Lock size={16} />}
                        Allow Inquiries
                      </div>
                      <div className="artwork-create-toggle-description">
                        {formData.allowInquiries 
                          ? 'Collectors can send inquiries about this artwork'
                          : 'No inquiries will be accepted for this artwork'
                        }
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ArtworkCreate
