import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Save, Eye, Download, Settings, Palette, Type, Layout, 
  Plus, Trash2, Move, Image as ImageIcon, AlignLeft, 
  AlignCenter, AlignRight, Bold, Italic, Underline
} from 'lucide-react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { supabase } from '../../lib/supabase'
import ArtworkSelector from '../../components/marketplace/ArtworkSelector'
import { useAuth } from '../../contexts/AuthProvider'

interface CatalogueItem {
  id: string
  type: 'artwork' | 'text' | 'image'
  content: any
  order: number
  styles?: {
    fontSize?: number
    fontFamily?: string
    fontWeight?: string
    textAlign?: 'left' | 'center' | 'right'
    color?: string
    backgroundColor?: string
    padding?: number
    margin?: number
  }
}

interface Catalogue {
  id: string
  name: string
  description?: string
  cover_image_url?: string
  is_public: boolean
  access_mode: 'public' | 'password' | 'whitelist' | 'tags'
  password?: string
  whitelist_emails?: string[]
  tags?: string[]
  branding: {
    primaryColor: string
    secondaryColor: string
    fontFamily: string
    layout: 'grid' | 'masonry' | 'list' | 'carousel'
    showPrices: boolean
    showDescriptions: boolean
    showArtistInfo: boolean
  }
  items: CatalogueItem[]
}

const GOOGLE_FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Source Sans Pro',
  'Poppins', 'Nunito', 'Raleway', 'Ubuntu', 'Playfair Display', 'Merriweather',
  'Crimson Text', 'Libre Baskerville', 'PT Serif', 'Crimson Pro', 'Lora',
  'Source Serif Pro', 'Cormorant Garamond', 'EB Garamond'
]

export default function CatalogueBuilderPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [catalogue, setCatalogue] = useState<Catalogue | null>(null)
  const [items, setItems] = useState<CatalogueItem[]>([])
  const [selectedArtworkIds, setSelectedArtworkIds] = useState<string[]>([])
  const [showArtworkSelector, setShowArtworkSelector] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (id && id !== 'new') {
      loadCatalogue()
    } else {
      // New catalogue
      setCatalogue({
        id: '',
        name: 'Untitled Catalogue',
        is_public: true,
        access_mode: 'public',
        branding: {
          primaryColor: '#6F1FFF',
          secondaryColor: '#F3F4F6',
          fontFamily: 'Inter',
          layout: 'grid',
          showPrices: true,
          showDescriptions: true,
          showArtistInfo: true
        },
        items: []
      })
      setItems([])
      setLoading(false)
    }
  }, [id])

  const loadCatalogue = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('catalogues')
        .select(`
          *,
          catalogue_artworks(
            artwork_id,
            artworks(*)
          )
        `)
        .eq('id', id)
        .eq('user_id', user?.id)
        .single()

      if (error) throw error

      setCatalogue(data)
      // Convert catalogue artworks to items
      const catalogueItems: CatalogueItem[] = data.catalogue_artworks?.map((ca: any, index: number) => ({
        id: `artwork-${ca.artwork_id}`,
        type: 'artwork' as const,
        content: ca.artworks,
        order: index
      })) || []
      setItems(catalogueItems)
    } catch (error) {
      console.error('Error loading catalogue:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const newItems = Array.from(items)
    const [reorderedItem] = newItems.splice(result.source.index, 1)
    newItems.splice(result.destination.index, 0, reorderedItem)

    // Update order numbers
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      order: index
    }))

    setItems(updatedItems)
  }

  const addArtworks = () => {
    const newItems: CatalogueItem[] = selectedArtworkIds.map((artworkId, index) => ({
      id: `artwork-${artworkId}`,
      type: 'artwork' as const,
      content: { id: artworkId }, // Will be populated when saved
      order: items.length + index
    }))

    setItems([...items, ...newItems])
    setSelectedArtworkIds([])
    setShowArtworkSelector(false)
  }

  const addTextBlock = () => {
    const newItem: CatalogueItem = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: { text: 'New text block' },
      order: items.length,
      styles: {
        fontSize: 16,
        fontFamily: catalogue?.branding.fontFamily || 'Inter',
        fontWeight: 'normal',
        textAlign: 'left',
        color: '#000000',
        padding: 16
      }
    }
    setItems([...items, newItem])
  }

  const removeItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId))
  }

  const updateItemStyles = (itemId: string, styles: Partial<CatalogueItem['styles']>) => {
    setItems(items.map(item => 
      item.id === itemId 
        ? { ...item, styles: { ...item.styles, ...styles } }
        : item
    ))
  }

  const updateItemContent = (itemId: string, content: any) => {
    setItems(items.map(item => 
      item.id === itemId 
        ? { ...item, content: { ...item.content, ...content } }
        : item
    ))
  }

  const saveCatalogue = async () => {
    if (!catalogue || !user) return

    try {
      setSaving(true)
      
      // Save catalogue
      const catalogueData = {
        name: catalogue.name,
        description: catalogue.description,
        is_public: catalogue.is_public,
        access_mode: catalogue.access_mode,
        password: catalogue.password,
        whitelist_emails: catalogue.whitelist_emails,
        tags: catalogue.tags,
        branding: catalogue.branding,
        user_id: user.id
      }

      let catalogueId = catalogue.id
      if (catalogueId) {
        const { error } = await supabase
          .from('catalogues')
          .update(catalogueData)
          .eq('id', catalogueId)
        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('catalogues')
          .insert(catalogueData)
          .select()
          .single()
        if (error) throw error
        catalogueId = data.id
      }

      // Save catalogue items (artworks only for now)
      const artworkItems = items.filter(item => item.type === 'artwork')
      
      // Clear existing items
      await supabase
        .from('catalogue_artworks')
        .delete()
        .eq('catalogue_id', catalogueId)

      // Insert new items
      if (artworkItems.length > 0) {
        const catalogueArtworks = artworkItems.map(item => ({
          catalogue_id: catalogueId,
          artwork_id: item.content.id,
          order: item.order
        }))

        const { error } = await supabase
          .from('catalogue_artworks')
          .insert(catalogueArtworks)
        if (error) throw error
      }

      navigate(`/dashboard/catalogues/${catalogueId}`)
    } catch (error) {
      console.error('Error saving catalogue:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--border)',
          borderTop: '3px solid var(--primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      <Helmet>
        <title>{catalogue?.name || 'Catalogue Builder'} | ArtFlow</title>
      </Helmet>

      {/* Header */}
      <div style={{
        backgroundColor: 'var(--card)',
        borderBottom: '1px solid var(--border)',
        padding: 'var(--space-lg)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              margin: '0 0 var(--space-xs) 0',
              color: 'var(--fg)'
            }}>
              {catalogue?.name || 'Untitled Catalogue'}
            </h1>
            <p style={{
              fontSize: '14px',
              color: 'var(--muted)',
              margin: 0
            }}>
              {items.length} items • {catalogue?.is_public ? 'Public' : 'Private'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <button
              onClick={() => setPreviewMode(!previewMode)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-xs)',
                padding: 'var(--space-sm) var(--space-md)',
                backgroundColor: previewMode ? 'var(--primary)' : 'transparent',
                color: previewMode ? 'white' : 'var(--fg)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              <Eye size={16} />
              Preview
            </button>

            <button
              onClick={() => setShowSettings(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-xs)',
                padding: 'var(--space-sm) var(--space-md)',
                backgroundColor: 'transparent',
                color: 'var(--fg)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              <Settings size={16} />
              Settings
            </button>

            <button
              onClick={saveCatalogue}
              disabled={saving}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-xs)',
                padding: 'var(--space-sm) var(--space-md)',
                backgroundColor: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                opacity: saving ? 0.6 : 1
              }}
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: 'var(--space-lg)',
        display: 'grid',
        gridTemplateColumns: previewMode ? '1fr' : '300px 1fr',
        gap: 'var(--space-lg)'
      }}>
        {/* Sidebar */}
        {!previewMode && (
          <div style={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-lg)',
            height: 'fit-content'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              margin: '0 0 var(--space-md) 0',
              color: 'var(--fg)'
            }}>
              Add Content
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              <button
                onClick={() => setShowArtworkSelector(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-xs)',
                  padding: 'var(--space-sm)',
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                <ImageIcon size={16} />
                Add Artworks
              </button>

              <button
                onClick={addTextBlock}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-xs)',
                  padding: 'var(--space-sm)',
                  backgroundColor: 'transparent',
                  color: 'var(--fg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                <Type size={16} />
                Add Text Block
              </button>
            </div>

            <div style={{ marginTop: 'var(--space-lg)' }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '600',
                margin: '0 0 var(--space-sm) 0',
                color: 'var(--fg)'
              }}>
                Layout Options
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                {[
                  { key: 'grid', label: 'Grid', icon: Layout },
                  { key: 'masonry', label: 'Masonry', icon: Layout },
                  { key: 'list', label: 'List', icon: AlignLeft },
                  { key: 'carousel', label: 'Carousel', icon: Move }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setCatalogue(prev => prev ? {
                      ...prev,
                      branding: { ...prev.branding, layout: key as any }
                    } : null)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-xs)',
                      padding: 'var(--space-xs) var(--space-sm)',
                      backgroundColor: catalogue?.branding.layout === key ? 'var(--primary)' : 'transparent',
                      color: catalogue?.branding.layout === key ? 'white' : 'var(--fg)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    <Icon size={14} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div style={{
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-lg)',
          minHeight: '600px'
        }}>
          {items.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: 'var(--space-3xl)',
              color: 'var(--muted)'
            }}>
              <Layout size={48} style={{ marginBottom: 'var(--space-lg)', opacity: 0.5 }} />
              <h3 style={{ fontSize: '18px', margin: '0 0 var(--space-sm) 0' }}>
                Start building your catalogue
              </h3>
              <p style={{ margin: 0 }}>
                Add artworks and text blocks to create your visual catalogue
              </p>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="catalogue-items">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: catalogue?.branding.layout === 'list' 
                        ? '1fr' 
                        : catalogue?.branding.layout === 'carousel'
                        ? 'repeat(auto-fit, minmax(200px, 1fr))'
                        : 'repeat(auto-fill, minmax(250px, 1fr))',
                      gap: 'var(--space-md)'
                    }}
                  >
                    {items.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              opacity: snapshot.isDragging ? 0.8 : 1,
                              transform: snapshot.isDragging 
                                ? provided.draggableProps.style?.transform 
                                : 'none'
                            }}
                          >
                            <CatalogueItemComponent
                              item={item}
                              onRemove={() => removeItem(item.id)}
                              onUpdateStyles={(styles) => updateItemStyles(item.id, styles)}
                              onUpdateContent={(content) => updateItemContent(item.id, content)}
                              branding={catalogue?.branding}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      </div>

      {/* Artwork Selector Modal */}
      {showArtworkSelector && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'var(--card)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-lg)',
            maxWidth: '800px',
            maxHeight: '80vh',
            overflow: 'auto',
            width: '90%'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--space-lg)'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                Add Artworks to Catalogue
              </h3>
              <button
                onClick={() => setShowArtworkSelector(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: 'var(--muted)'
                }}
              >
                ×
              </button>
            </div>

            <ArtworkSelector
              catalogueId={catalogue?.id || ''}
              onArtworkAdd={(id) => setSelectedArtworkIds(prev => [...prev, id])}
              onArtworkRemove={(id) => setSelectedArtworkIds(prev => prev.filter(i => i !== id))}
              selectedArtworkIds={selectedArtworkIds}
              userId={user?.id || ''}
            />

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 'var(--space-sm)',
              marginTop: 'var(--space-lg)',
              paddingTop: 'var(--space-lg)',
              borderTop: '1px solid var(--border)'
            }}>
              <button
                onClick={() => setShowArtworkSelector(false)}
                style={{
                  padding: 'var(--space-sm) var(--space-md)',
                  backgroundColor: 'transparent',
                  color: 'var(--fg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={addArtworks}
                disabled={selectedArtworkIds.length === 0}
                style={{
                  padding: 'var(--space-sm) var(--space-md)',
                  backgroundColor: selectedArtworkIds.length === 0 ? 'var(--muted)' : 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: selectedArtworkIds.length === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                Add {selectedArtworkIds.length} Artwork{selectedArtworkIds.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Individual catalogue item component
function CatalogueItemComponent({ 
  item, 
  onRemove, 
  onUpdateStyles, 
  onUpdateContent, 
  branding 
}: {
  item: CatalogueItem
  onRemove: () => void
  onUpdateStyles: (styles: Partial<CatalogueItem['styles']>) => void
  onUpdateContent: (content: any) => void
  branding?: Catalogue['branding']
}) {
  const [isEditing, setIsEditing] = useState(false)

  if (item.type === 'artwork') {
    return (
      <div style={{
        position: 'relative',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        backgroundColor: 'var(--bg)'
      }}>
        <div style={{
          position: 'absolute',
          top: 'var(--space-xs)',
          right: 'var(--space-xs)',
          display: 'flex',
          gap: 'var(--space-xs)',
          zIndex: 1
        }}>
          <button
            onClick={onRemove}
            style={{
              width: '24px',
              height: '24px',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px'
            }}
          >
            <Trash2 size={12} />
          </button>
        </div>

        {item.content.primary_image_url ? (
          <img
            src={item.content.primary_image_url}
            alt={item.content.title}
            style={{
              width: '100%',
              height: '200px',
              objectFit: 'cover'
            }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '200px',
            backgroundColor: 'var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--muted)'
          }}>
            No Image
          </div>
        )}

        <div style={{ padding: 'var(--space-sm)' }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '600',
            margin: '0 0 var(--space-xs) 0',
            color: 'var(--fg)',
            fontFamily: branding?.fontFamily
          }}>
            {item.content.title || 'Untitled'}
          </h4>
          
          {branding?.showPrices && item.content.price && (
            <p style={{
              fontSize: '12px',
              color: branding.primaryColor,
              margin: '0 0 var(--space-xs) 0',
              fontFamily: branding.fontFamily
            }}>
              ${item.content.price.toLocaleString()}
            </p>
          )}

          {branding?.showDescriptions && item.content.description && (
            <p style={{
              fontSize: '11px',
              color: 'var(--muted)',
              margin: 0,
              fontFamily: branding.fontFamily
            }}>
              {item.content.description}
            </p>
          )}
        </div>
      </div>
    )
  }

  if (item.type === 'text') {
    return (
      <div style={{
        position: 'relative',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-sm)',
        backgroundColor: 'var(--bg)',
        minHeight: '100px'
      }}>
        <div style={{
          position: 'absolute',
          top: 'var(--space-xs)',
          right: 'var(--space-xs)',
          display: 'flex',
          gap: 'var(--space-xs)',
          zIndex: 1
        }}>
          <button
            onClick={() => setIsEditing(!isEditing)}
            style={{
              width: '24px',
              height: '24px',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px'
            }}
          >
            <Type size={12} />
          </button>
          <button
            onClick={onRemove}
            style={{
              width: '24px',
              height: '24px',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px'
            }}
          >
            <Trash2 size={12} />
          </button>
        </div>

        {isEditing ? (
          <div>
            <textarea
              value={item.content.text}
              onChange={(e) => onUpdateContent({ text: e.target.value })}
              style={{
                width: '100%',
                minHeight: '60px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: 'var(--space-xs)',
                fontSize: item.styles?.fontSize || 16,
                fontFamily: item.styles?.fontFamily || branding?.fontFamily || 'Inter',
                fontWeight: item.styles?.fontWeight || 'normal',
                textAlign: item.styles?.textAlign || 'left',
                color: item.styles?.color || '#000000',
                backgroundColor: 'var(--card)',
                resize: 'vertical'
              }}
            />
            
            <div style={{
              display: 'flex',
              gap: 'var(--space-xs)',
              marginTop: 'var(--space-xs)'
            }}>
              <select
                value={item.styles?.fontSize || 16}
                onChange={(e) => onUpdateStyles({ fontSize: Number(e.target.value) })}
                style={{
                  padding: '2px 4px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '10px'
                }}
              >
                <option value={12}>12px</option>
                <option value={14}>14px</option>
                <option value={16}>16px</option>
                <option value={18}>18px</option>
                <option value={20}>20px</option>
                <option value={24}>24px</option>
              </select>

              <select
                value={item.styles?.fontFamily || branding?.fontFamily || 'Inter'}
                onChange={(e) => onUpdateStyles({ fontFamily: e.target.value })}
                style={{
                  padding: '2px 4px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '10px'
                }}
              >
                {GOOGLE_FONTS.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>

              <select
                value={item.styles?.textAlign || 'left'}
                onChange={(e) => onUpdateStyles({ textAlign: e.target.value as any })}
                style={{
                  padding: '2px 4px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '10px'
                }}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
        ) : (
          <div
            style={{
              fontSize: item.styles?.fontSize || 16,
              fontFamily: item.styles?.fontFamily || branding?.fontFamily || 'Inter',
              fontWeight: item.styles?.fontWeight || 'normal',
              textAlign: item.styles?.textAlign || 'left',
              color: item.styles?.color || '#000000',
              padding: item.styles?.padding || 0,
              margin: item.styles?.margin || 0,
              minHeight: '60px',
              cursor: 'pointer'
            }}
            onClick={() => setIsEditing(true)}
          >
            {item.content.text}
          </div>
        )}
      </div>
    )
  }

  return null
}
