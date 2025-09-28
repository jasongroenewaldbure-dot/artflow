import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthProvider'
import Container from "../../brush/components/forms/Container"
import { showErrorToast, showSuccessToast } from '../../utils/errorHandling'
import Icon from "../../brush/Icon"

interface Roadmap {
  id?: string
  title: string
  description?: string
  budget_min?: number
  budget_max?: number
  target_mediums?: string[]
  target_styles?: string[]
  target_artist_ids?: string[]
  target_genres?: string[]
  target_colors?: string[]
  target_price_range?: {
    min: number
    max: number
  }
  timeline_months?: number
  is_active: boolean
  progress_percentage?: number
  created_at?: string
  updated_at?: string
}

const CollectionRoadmapPage: React.FC = () => {
  const { user } = useAuth()
  const [roadmap, setRoadmap] = useState<Roadmap>({
    title: '',
    description: '',
    budget_min: undefined,
    budget_max: undefined,
    target_mediums: [],
    target_styles: [],
    target_artist_ids: [],
    target_genres: [],
    target_colors: [],
    target_price_range: { min: 0, max: 100000 },
    timeline_months: 12,
    is_active: true,
    progress_percentage: 0
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [recommendations, setRecommendations] = useState<any[]>([])

  useEffect(() => {
    if (user) {
      loadRoadmap()
    }
  }, [user])

  const loadRoadmap = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('collection_roadmaps')
        .select('*')
        .eq('collector_id', user?.id)
        .eq('is_active', true)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setRoadmap({
          ...data,
          target_mediums: data.target_mediums || [],
          target_styles: data.target_styles || [],
          target_artist_ids: data.target_artist_ids || [],
          target_genres: data.target_genres || [],
          target_colors: data.target_colors || [],
          target_price_range: (data.target_price_range as { min: number; max: number }) || { min: 0, max: 100000 }
        })
      }
    } catch (error) {
      console.error('Error loading roadmap:', error)
      showErrorToast('Failed to load collection roadmap')
    } finally {
      setLoading(false)
    }
  }

  const saveRoadmap = async () => {
    try {
      setSaving(true)
      
      const roadmapData = {
        ...roadmap,
        collector_id: user?.id,
        is_active: true,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('collection_roadmaps')
        .upsert(roadmapData, { onConflict: 'id' })

      if (error) throw error

      showSuccessToast('Collection roadmap saved successfully!')
    } catch (error) {
      console.error('Error saving roadmap:', error)
      showErrorToast('Failed to save collection roadmap')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof Roadmap, value: any) => {
    setRoadmap(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleArrayChange = (field: 'target_mediums' | 'target_styles' | 'target_genres' | 'target_colors', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(Boolean)
    setRoadmap(prev => ({
      ...prev,
      [field]: items
    }))
  }

  const availableMediums = [
    'Oil on Canvas', 'Acrylic on Canvas', 'Watercolor', 'Mixed Media',
    'Digital Art', 'Photography', 'Sculpture', 'Drawing', 'Print',
    'Ceramics', 'Textile', 'Installation', 'Video Art'
  ]

  const availableStyles = [
    'Abstract', 'Realism', 'Contemporary', 'Impressionist', 'Expressionist',
    'Minimalist', 'Pop Art', 'Surrealist', 'Cubist', 'Landscape',
    'Portrait', 'Still Life', 'Conceptual', 'Street Art', 'Digital'
  ]

  const availableGenres = [
    'Fine Art', 'Contemporary Art', 'Modern Art', 'Classical Art',
    'Street Art', 'Digital Art', 'Photography', 'Sculpture',
    'Mixed Media', 'Installation Art', 'Performance Art'
  ]

  const availableColors = [
    'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 'Pink',
    'Black', 'White', 'Gray', 'Brown', 'Gold', 'Silver', 'Multi-color'
  ]

  if (loading) {
    return (
      <Container>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <Helmet>
        <title>Collection Roadmap | ArtFlow</title>
      </Helmet>

      <div className="py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Collection Roadmap</h1>
          <p className="text-gray-600 mt-2">Define your collecting goals to receive personalized recommendations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Roadmap Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Collection Goals</h2>
              
              <form onSubmit={(e) => { e.preventDefault(); saveRoadmap(); }} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Roadmap Title</label>
                  <input
                    type="text"
                    value={roadmap.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 'Emerging South African Painters'"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Collection Thesis</label>
                  <textarea
                    value={roadmap.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your collecting goals and vision..."
                  />
                </div>

                {/* Budget Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">Budget Range (ZAR)</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Minimum</label>
                      <input
                        type="number"
                        value={roadmap.budget_min || ''}
                        onChange={(e) => handleInputChange('budget_min', e.target.value ? parseFloat(e.target.value) : undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Maximum</label>
                      <input
                        type="number"
                        value={roadmap.budget_max || ''}
                        onChange={(e) => handleInputChange('budget_max', e.target.value ? parseFloat(e.target.value) : undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="100000"
                      />
                    </div>
                  </div>
                </div>

                {/* Target Mediums */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Mediums</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {availableMediums.map((medium) => (
                      <label key={medium} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={roadmap.target_mediums?.includes(medium) || false}
                          onChange={(e) => {
                            const currentMediums = roadmap.target_mediums || []
                            if (e.target.checked) {
                              handleInputChange('target_mediums', [...currentMediums, medium])
                            } else {
                              handleInputChange('target_mediums', currentMediums.filter(m => m !== medium))
                            }
                          }}
                          className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{medium}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Target Styles */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Styles</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {availableStyles.map((style) => (
                      <label key={style} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={roadmap.target_styles?.includes(style) || false}
                          onChange={(e) => {
                            const currentStyles = roadmap.target_styles || []
                            if (e.target.checked) {
                              handleInputChange('target_styles', [...currentStyles, style])
                            } else {
                              handleInputChange('target_styles', currentStyles.filter(s => s !== style))
                            }
                          }}
                          className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{style}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Target Genres */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Genres</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {availableGenres.map((genre) => (
                      <label key={genre} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={roadmap.target_genres?.includes(genre) || false}
                          onChange={(e) => {
                            const currentGenres = roadmap.target_genres || []
                            if (e.target.checked) {
                              handleInputChange('target_genres', [...currentGenres, genre])
                            } else {
                              handleInputChange('target_genres', currentGenres.filter(g => g !== genre))
                            }
                          }}
                          className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{genre}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Target Colors */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Colors</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {availableColors.map((color) => (
                      <label key={color} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={roadmap.target_colors?.includes(color) || false}
                          onChange={(e) => {
                            const currentColors = roadmap.target_colors || []
                            if (e.target.checked) {
                              handleInputChange('target_colors', [...currentColors, color])
                            } else {
                              handleInputChange('target_colors', currentColors.filter(c => c !== color))
                            }
                          }}
                          className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{color}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timeline (months)</label>
                  <input
                    type="number"
                    value={roadmap.timeline_months || 12}
                    onChange={(e) => handleInputChange('timeline_months', parseInt(e.target.value) || 12)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    max="60"
                  />
                </div>

                {/* Save Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={saving || !roadmap.title.trim()}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Roadmap'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Recommendations Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
              
              {roadmap.title ? (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900">Based on your roadmap:</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      We'll find artworks matching your criteria and send you personalized recommendations.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Your criteria:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {roadmap.budget_min && roadmap.budget_max && (
                        <li>• Budget: R{roadmap.budget_min.toLocaleString()} - R{roadmap.budget_max.toLocaleString()}</li>
                      )}
                      {roadmap.target_mediums && roadmap.target_mediums.length > 0 && (
                        <li>• Mediums: {roadmap.target_mediums.join(', ')}</li>
                      )}
                      {roadmap.target_styles && roadmap.target_styles.length > 0 && (
                        <li>• Styles: {roadmap.target_styles.join(', ')}</li>
                      )}
                      {roadmap.timeline_months && (
                        <li>• Timeline: {roadmap.timeline_months} months</li>
                      )}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Icon name="target" size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Complete your roadmap to see personalized recommendations</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default CollectionRoadmapPage
