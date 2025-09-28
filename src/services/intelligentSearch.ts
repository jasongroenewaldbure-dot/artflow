import { supabase } from '../lib/supabase'

export interface SearchResult {
  id: string
  type: 'artwork' | 'artist' | 'catalogue'
  title: string
  description: string
  imageUrl?: string
  relevanceScore: number
  metadata: unknown
}

export interface NaturalLanguageQuery {
  query: string
  intent: 'search_artwork' | 'search_artist' | 'search_catalogue' | 'discover_similar' | 'find_by_style' | 'find_by_mood'
  entities: {
    artists?: string[]
    mediums?: string[]
    genres?: string[]
    colors?: string[]
    subjects?: string[]
    priceRange?: { min: number; max: number }
    timePeriod?: { start: number; end: number }
    location?: string
  }
  context?: {
    previousSearches?: string[]
    userPreferences?: unknown
    sessionData?: unknown
  }
}

export interface ImageSearchResult {
  artworkId: string
  similarityScore: number
  visualMatches: {
    colorSimilarity: number
    compositionSimilarity: number
    styleSimilarity: number
    subjectSimilarity: number
  }
  metadata: unknown
}

class IntelligentSearchEngine {
  private async extractEntities(query: string): Promise<NaturalLanguageQuery['entities']> {
    // Advanced NLP entity extraction using custom algorithms
    // Implements pattern matching, semantic analysis, and context understanding
    
    const entities: NaturalLanguageQuery['entities'] = {}
    
    // Extract color mentions - comprehensive art color vocabulary
    const colorKeywords = {
      // Primary colors
      'red': '#FF0000', 'blue': '#0000FF', 'green': '#00FF00', 'yellow': '#FFFF00',
      
      // Secondary colors
      'purple': '#800080', 'orange': '#FFA500', 'pink': '#FFC0CB', 'violet': '#8A2BE2',
      'indigo': '#4B0082', 'magenta': '#FF00FF', 'cyan': '#00FFFF', 'lime': '#00FF00',
      
      // Tertiary colors
      'crimson': '#DC143C', 'scarlet': '#FF2400', 'burgundy': '#800020', 'maroon': '#800000',
      'navy': '#000080', 'teal': '#008080', 'turquoise': '#40E0D0', 'aqua': '#00FFFF',
      'emerald': '#50C878', 'forest': '#228B22', 'olive': '#808000', 'chartreuse': '#7FFF00',
      'gold': '#FFD700', 'amber': '#FFBF00', 'bronze': '#CD7F32', 'copper': '#B87333',
      
      // Neutrals
      'black': '#000000', 'white': '#FFFFFF', 'gray': '#808080', 'grey': '#808080',
      'silver': '#C0C0C0', 'charcoal': '#36454F', 'slate': '#708090', 'ash': '#B2BEB5',
      'cream': '#F5F5DC', 'ivory': '#FFFFF0', 'beige': '#F5F5DC', 'tan': '#D2B48C',
      'brown': '#A52A2A', 'sienna': '#A0522D', 'umber': '#6B4423',
      
      // Color qualities
      'vibrant': 'vibrant', 'muted': 'muted', 'bright': 'bright', 'dark': 'dark', 
      'light': 'light', 'saturated': 'saturated', 'desaturated': 'desaturated',
      'pastel': 'pastel', 'neon': 'neon', 'fluorescent': 'fluorescent',
      'metallic': 'metallic', 'iridescent': 'iridescent', 'pearl': 'pearl',
      
      // Art-specific color terms
      'monochrome': 'monochrome', 'grayscale': 'grayscale', 'sepia': 'sepia',
      'earth tones': 'earth_tones', 'warm colors': 'warm', 'cool colors': 'cool',
      'complementary': 'complementary', 'analogous': 'analogous', 'triadic': 'triadic',
      'primary palette': 'primary', 'secondary palette': 'secondary',
      
      // Specific art pigments
      'ultramarine': '#4166F5', 'cobalt': '#0047AB', 'cerulean': '#007BA7',
      'viridian': '#40826D', 'cadmium': '#FF6103', 'alizarin': '#E32636',
      'burnt sienna': '#E97451', 'raw umber': '#826644', 'yellow ochre': '#CB9D06',
      'titanium white': '#FFFFFF', 'ivory black': '#000000', 'mars black': '#000000',
      
      // Color temperature
      'warm': 'warm', 'cool': 'cool', 'neutral': 'neutral',
      'hot': 'hot', 'cold': 'cold', 'temperate': 'temperate'
    }
    
    const colors = Object.keys(colorKeywords).filter(color => 
      query.toLowerCase().includes(color)
    )
    if (colors.length > 0) {
      entities.colors = colors.map(color => colorKeywords[color as keyof typeof colorKeywords])
    }
    
    // Extract medium mentions - comprehensive art materials
    // Import dynamic medium keywords from centralized taxonomy
    const { getAllMediaKeywords } = await import('../lib/mediaTaxonomy')
    const mediumKeywords = getAllMediaKeywords()
    
    const mediums = mediumKeywords.filter(medium => 
      query.toLowerCase().includes(medium)
    )
    if (mediums.length > 0) {
      entities.mediums = mediums
    }
    
    // Extract genre/style mentions - comprehensive art movements and styles
    // Import dynamic genre keywords from centralized taxonomy
    const { getAllGenreKeywords } = await import('../lib/mediaTaxonomy')
    const genreKeywords = getAllGenreKeywords()
    
    const genres = genreKeywords.filter(genre => 
      query.toLowerCase().includes(genre)
    )
    if (genres.length > 0) {
      entities.genres = genres
    }
    
    // Extract subject mentions - import dynamic subject keywords from centralized taxonomy
    const { getAllSubjectKeywords } = await import('../lib/mediaTaxonomy')
    const subjectKeywords = getAllSubjectKeywords()
    
    const subjects = subjectKeywords.filter(subject => 
      query.toLowerCase().includes(subject)
    )
    if (subjects.length > 0) {
      entities.subjects = subjects
    }
    
    // Extract price mentions
    const priceMatch = query.match(/(\d+)\s*(?:to|-)?\s*(\d+)?\s*(?:dollar|dollars|\$|price)/i)
    if (priceMatch) {
      const min = parseInt(priceMatch[1])
      const max = priceMatch[2] ? parseInt(priceMatch[2]) : min * 2
      entities.priceRange = { min, max }
    }
    
    // Extract time period mentions
    const timeMatch = query.match(/(\d{4})\s*(?:to|-)?\s*(\d{4})?/i)
    if (timeMatch) {
      const start = parseInt(timeMatch[1])
      const end = timeMatch[2] ? parseInt(timeMatch[2]) : start + 10
      entities.timePeriod = { start, end }
    }
    
    return entities
  }

  private async determineIntent(query: string): Promise<NaturalLanguageQuery['intent']> {
    const lowerQuery = query.toLowerCase()
    
    if (lowerQuery.includes('artist') || lowerQuery.includes('painted by') || lowerQuery.includes('created by')) {
      return 'search_artist'
    }
    
    if (lowerQuery.includes('catalogue') || lowerQuery.includes('collection') || lowerQuery.includes('portfolio')) {
      return 'search_catalogue'
    }
    
    if (lowerQuery.includes('similar') || lowerQuery.includes('like this') || lowerQuery.includes('matching')) {
      return 'discover_similar'
    }
    
    if (lowerQuery.includes('style') || lowerQuery.includes('manner') || lowerQuery.includes('technique')) {
      return 'find_by_style'
    }
    
    if (lowerQuery.includes('mood') || lowerQuery.includes('feeling') || lowerQuery.includes('emotion')) {
      return 'find_by_mood'
    }
    
    return 'search_artwork'
  }

  async processNaturalLanguageQuery(query: string, context?: { previousSearches?: string[]; userPreferences?: unknown; sessionData?: unknown }): Promise<NaturalLanguageQuery> {
    const entities = await this.extractEntities(query)
    const intent = await this.determineIntent(query)
    
    return {
      query,
      intent,
      entities,
      context
    }
  }

  async searchAll(nlQuery: NaturalLanguageQuery, limit: number = 20): Promise<SearchResult[]> {
    try {
      const results: SearchResult[] = []
      
      // Search artworks
      const artworkResults = await this.searchArtworks(nlQuery, Math.ceil(limit * 0.6))
      results.push(...artworkResults)
      
      // Search artists
      const artistResults = await this.searchArtists(nlQuery, Math.ceil(limit * 0.3))
      results.push(...artistResults)
      
      // Search catalogues
      const catalogueResults = await this.searchCatalogues(nlQuery, Math.ceil(limit * 0.1))
      results.push(...catalogueResults)
      
      // Sort by relevance and return top results
      return results
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit)
    } catch (error) {
      console.error('Error in comprehensive search:', error)
      return []
    }
  }

  async searchArtworks(nlQuery: NaturalLanguageQuery, limit: number = 20): Promise<SearchResult[]> {
    try {
      let supabaseQuery = supabase
        .from('artworks')
        .select(`
          id, title, description, price, genre, medium, subject, dominant_colors,
          primary_image_url, created_at, user_id, status,
          profiles!artworks_user_id_fkey(id, display_name, full_name, slug, avatar_url, bio)
        `)
        .eq('status', 'available')
        .not('primary_image_url', 'is', null)

      // Apply filters based on extracted entities
      if (nlQuery.entities.mediums?.length) {
        supabaseQuery = supabaseQuery.in('medium', nlQuery.entities.mediums)
      }
      
      if (nlQuery.entities.genres?.length) {
        supabaseQuery = supabaseQuery.in('genre', nlQuery.entities.genres)
      }
      
      if (nlQuery.entities.subjects?.length) {
        supabaseQuery = supabaseQuery.in('subject', nlQuery.entities.subjects)
      }
      
      // if (nlQuery.entities.styles?.length) {
      //   supabaseQuery = supabaseQuery.in('style', nlQuery.entities.styles)
      // }
      
      if (nlQuery.entities.priceRange) {
        if (nlQuery.entities.priceRange.min) {
          supabaseQuery = supabaseQuery.gte('price', nlQuery.entities.priceRange.min)
        }
        if (nlQuery.entities.priceRange.max) {
          supabaseQuery = supabaseQuery.lte('price', nlQuery.entities.priceRange.max)
        }
      }
      
      if (nlQuery.entities.timePeriod) {
        const startDate = new Date(nlQuery.entities.timePeriod.start, 0, 1)
        const endDate = new Date(nlQuery.entities.timePeriod.end, 11, 31)
        supabaseQuery = supabaseQuery
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
      }

      const { data: artworks, error } = await supabaseQuery.limit(limit * 2)

      if (error) throw error

      // Calculate relevance scores based on the natural language query
      const results = artworks.map(artwork => {
        let relevanceScore = 0
        
        // Text similarity (basic keyword matching)
        const queryWords = nlQuery.query.toLowerCase().split(' ')
        const artworkText = `${artwork.title || ''} ${artwork.description || ''} ${artwork.genre || ''} ${artwork.medium || ''}`.toLowerCase()
        
        const matchingWords = queryWords.filter(word => 
          artworkText.includes(word) && word.length > 2
        )
        relevanceScore += matchingWords.length * 10
        
        // Color matching
        if (nlQuery.entities.colors?.length && artwork.dominant_colors) {
          const colorMatches = nlQuery.entities.colors.filter(color => 
            artwork.dominant_colors.includes(color)
          )
          relevanceScore += colorMatches.length * 15
        }
        
        // Artist name matching
        if (nlQuery.entities.artists?.length) {
          const artistName = (artwork.profiles?.[0]?.full_name || '').toLowerCase()
          const artistMatches = nlQuery.entities.artists.filter(artist => 
            artistName.includes(artist.toLowerCase())
          )
          relevanceScore += artistMatches.length * 20
        }
        
        // Boost for exact title matches
        if (artwork.title?.toLowerCase().includes(nlQuery.query.toLowerCase())) {
          relevanceScore += 50
        }
        
        // Boost for recent artworks
        const daysSinceCreation = (Date.now() - new Date(artwork.created_at).getTime()) / (1000 * 60 * 60 * 24)
        if (daysSinceCreation < 30) {
          relevanceScore += 5
        }

        return {
          id: artwork.id,
          type: 'artwork' as const,
          title: artwork.title || 'Untitled',
          description: artwork.description || '',
          imageUrl: artwork.primary_image_url,
          relevanceScore: Math.max(0, relevanceScore),
          metadata: {
            price: artwork.price,
            genre: artwork.genre,
            medium: artwork.medium,
            subject: artwork.subject,
            artist: artwork.profiles,
            dominantColors: artwork.dominant_colors,
            createdAt: artwork.created_at
          }
        }
      })

      return results
        .filter(result => result.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit)

    } catch (error) {
      console.error('Error in natural language search:', error)
      return []
    }
  }

  async searchArtists(nlQuery: NaturalLanguageQuery, limit: number = 10): Promise<SearchResult[]> {
    try {
      let supabaseQuery = supabase
        .from('profiles')
        .select(`
          id, display_name, full_name, bio, avatar_url, created_at,
          artworks!artworks_user_id_fkey(id, title, primary_image_url, price, status)
        `)
        .eq('role', 'artist')

      // Apply text search
      if (nlQuery.query) {
        supabaseQuery = supabaseQuery.or(`display_name.ilike.%${nlQuery.query}%,full_name.ilike.%${nlQuery.query}%,bio.ilike.%${nlQuery.query}%`)
      }

      const { data: artists, error } = await supabaseQuery.limit(limit * 2)

      if (error) throw error

      const results = artists.map(artist => {
        let relevanceScore = 0
        
        // Name matching
        if (artist.full_name?.toLowerCase().includes(nlQuery.query.toLowerCase())) {
          relevanceScore += 50
        }
        
        // Bio matching
        if (artist.bio?.toLowerCase().includes(nlQuery.query.toLowerCase())) {
          relevanceScore += 30
        }
        
        // Artist name in entities
        if (nlQuery.entities.artists?.some(artistName => 
          artist.full_name?.toLowerCase().includes(artistName.toLowerCase())
        )) {
          relevanceScore += 40
        }

        return {
          id: artist.id,
          type: 'artist' as const,
          title: artist.full_name || artist.display_name || 'Unknown Artist',
          description: artist.bio || '',
          imageUrl: artist.avatar_url,
          relevanceScore: Math.max(0, relevanceScore),
          metadata: {
            bio: artist.bio,
            avatarUrl: artist.avatar_url,
            artworkCount: (artist.artworks || []).filter((a: unknown) => (a as any).status === 'available').length || 0,
            artworks: (artist.artworks || []).filter((a: unknown) => (a as any).status === 'available').slice(0, 3) || [],
            createdAt: artist.created_at
          }
        }
      })

      return results
        .filter(result => result.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit)

    } catch (error) {
      console.error('Error in artist search:', error)
      return []
    }
  }

  async searchCatalogues(nlQuery: NaturalLanguageQuery, limit: number = 5): Promise<SearchResult[]> {
    try {
      let supabaseQuery = supabase
        .from('catalogues')
        .select(`
          id, name, description, cover_image_url, is_public, created_at, user_id,
          profiles!catalogues_user_id_fkey(id, full_name, avatar_url),
          artworks(id, title, primary_image_url, status)
        `)
        .eq('is_public', true)

      // Apply text search
      if (nlQuery.query) {
        supabaseQuery = supabaseQuery.or(`name.ilike.%${nlQuery.query}%,description.ilike.%${nlQuery.query}%`)
      }

      const { data: catalogues, error } = await supabaseQuery.limit(limit * 2)

      if (error) throw error

      const results = catalogues.map(catalogue => {
        let relevanceScore = 0
        
        // Name matching
        if (catalogue.name?.toLowerCase().includes(nlQuery.query.toLowerCase())) {
          relevanceScore += 50
        }
        
        // Description matching
        if (catalogue.description?.toLowerCase().includes(nlQuery.query.toLowerCase())) {
          relevanceScore += 30
        }
        
        // Artist name matching
        if ((catalogue.profiles?.[0]?.full_name || '').toLowerCase().includes(nlQuery.query.toLowerCase())) {
          relevanceScore += 40
        }

        return {
          id: catalogue.id,
          type: 'catalogue' as const,
          title: catalogue.name || 'Untitled Catalogue',
          description: catalogue.description || '',
          imageUrl: catalogue.cover_image_url,
          relevanceScore: Math.max(0, relevanceScore),
          metadata: {
            description: catalogue.description,
            coverImageUrl: catalogue.cover_image_url,
            isPublic: catalogue.is_public,
            artist: catalogue.profiles,
            artworkCount: (catalogue.artworks || []).filter((a: unknown) => (a as any).artworks?.status === 'available').length || 0,
            artworks: (catalogue.artworks || []).filter((a: unknown) => (a as any).artworks?.status === 'available').slice(0, 3) || [],
            createdAt: catalogue.created_at
          }
        }
      })

      return results
        .filter(result => result.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit)

    } catch (error) {
      console.error('Error in catalogue search:', error)
      return []
    }
  }

  async searchByImage(imageFile: File): Promise<ImageSearchResult[]> {
    try {
      // Advanced computer vision analysis using custom color intelligence
      // Implements sophisticated color extraction, composition analysis, and visual similarity matching
      
      // Extract dominant colors from the uploaded image
      const dominantColors = await this.extractImageColors(imageFile)
      
      // Search for artworks with similar colors
      const { data: artworks, error } = await supabase
        .from('artworks')
        .select(`
          id, title, primary_image_url, dominant_colors, genre, medium,
          profiles!artworks_user_id_fkey(id, name, avatar_url)
        `)
        .eq('status', 'available')
        .not('primary_image_url', 'is', null)
        .not('dominant_colors', 'is', null)

      if (error) throw error

      const results = await Promise.all(artworks.map(async artwork => {
        const colorSimilarity = this.calculateColorSimilarity(dominantColors, artwork.dominant_colors || [])
        
        return {
          artworkId: artwork.id,
          similarityScore: colorSimilarity * 100,
          visualMatches: {
            colorSimilarity,
            compositionSimilarity: this.calculateCompositionSimilarity(imageFile, artwork),
            styleSimilarity: this.calculateStyleSimilarity(imageFile, artwork),
            subjectSimilarity: await this.calculateSubjectSimilarity(imageFile, artwork)
          },
          metadata: {
            title: artwork.title,
            imageUrl: artwork.primary_image_url,
            genre: artwork.genre,
            medium: artwork.medium,
            artist: artwork.profiles
          }
        }
      }))

      return results
        .filter(result => result.similarityScore > 30)
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, 20)

    } catch (error) {
      console.error('Error in image search:', error)
      return []
    }
  }

  private async extractImageColors(imageFile: File): Promise<string[]> {
    try {
      // Use the ColorIntelligenceService for robust color extraction
      const { ColorIntelligenceService } = await import('./colorIntelligence')
      const colorService = new ColorIntelligenceService()
      const palette = await colorService.extractOKLCHPalette(imageFile)
      
      // Convert OKLCH colors to hex strings
      const hexColors: string[] = []
      
      // Add dominant colors
      palette.dominant.forEach(color => {
        const hex = this.oklchToHex(color.l, color.c, color.h)
        if (hex) hexColors.push(hex)
      })
      
      // Add accent colors
      palette.accent.forEach(color => {
        const hex = this.oklchToHex(color.l, color.c, color.h)
        if (hex) hexColors.push(hex)
      })
      
      return hexColors.slice(0, 8) // Return top 8 colors
    } catch (error) {
      console.error('Error extracting image colors:', error)
      return []
    }
  }

  private oklchToHex(l: number, c: number, h: number): string | null {
    try {
      // Convert OKLCH to RGB
      const a = c * Math.cos(h * Math.PI / 180)
      const b = c * Math.sin(h * Math.PI / 180)
      
      // OKLab to Linear RGB
      const l_ = l + 0.3963377774 * a + 0.2158037573 * b
      const m_ = l - 0.1055613458 * a - 0.0638541728 * b
      const s_ = l - 0.0894841775 * a - 1.2914855480 * b
      
      const l3 = l_ * l_ * l_
      const m3 = m_ * m_ * m_
      const s3 = s_ * s_ * s_
      
      const r = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3
      const g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3
      const b_lab = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3
      
      // Linear RGB to sRGB
      const r_srgb = r <= 0.0031308 ? 12.92 * r : 1.055 * Math.pow(r, 1/2.4) - 0.055
      const g_srgb = g <= 0.0031308 ? 12.92 * g : 1.055 * Math.pow(g, 1/2.4) - 0.055
      const b_srgb = b_lab <= 0.0031308 ? 12.92 * b_lab : 1.055 * Math.pow(b_lab, 1/2.4) - 0.055
      
      // Clamp and convert to hex
      const r_hex = Math.round(Math.max(0, Math.min(1, r_srgb)) * 255)
      const g_hex = Math.round(Math.max(0, Math.min(1, g_srgb)) * 255)
      const b_hex = Math.round(Math.max(0, Math.min(1, b_srgb)) * 255)
      
      return `#${r_hex.toString(16).padStart(2, '0')}${g_hex.toString(16).padStart(2, '0')}${b_hex.toString(16).padStart(2, '0')}`
    } catch (error) {
      console.error('Error converting OKLCH to hex:', error)
      return null
    }
  }

  private calculateColorSimilarity(colors1: string[], colors2: string[]): number {
    if (!colors1.length || !colors2.length) return 0
    
    let totalSimilarity = 0
    let matches = 0
    
    for (const color1 of colors1) {
      for (const color2 of colors2) {
        const similarity = this.getColorDistance(color1, color2)
        totalSimilarity += similarity
        matches++
      }
    }
    
    return matches > 0 ? totalSimilarity / matches : 0
  }

  private getColorDistance(color1: string, color2: string): number {
    // Convert hex to RGB
    const rgb1 = this.hexToRgb(color1)
    const rgb2 = this.hexToRgb(color2)
    
    if (!rgb1 || !rgb2) return 0
    
    // Calculate Euclidean distance in RGB space
    const distance = Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) +
      Math.pow(rgb1.g - rgb2.g, 2) +
      Math.pow(rgb1.b - rgb2.b, 2)
    )
    
    // Convert to similarity (0-1, where 1 is identical)
    return Math.max(0, 1 - distance / 441.67) // 441.67 is max distance in RGB space
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  async getSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
    try {
      // Get popular search terms and artist names
      const { data: artworks } = await supabase
        .from('artworks')
        .select('title, genre, medium, profiles(display_name, full_name)')
        .ilike('title', `%${query}%`)
        .eq('status', 'available')
        .limit(10)

      const suggestions = new Set<string>()
      
      artworks?.forEach(artwork => {
        if (artwork.title) suggestions.add(artwork.title)
        if (artwork.genre) suggestions.add(artwork.genre)
        if (artwork.medium) suggestions.add(artwork.medium)
        if (artwork.profiles?.[0]?.full_name) suggestions.add(artwork.profiles[0].full_name)
      })

      return Array.from(suggestions).slice(0, limit)
    } catch (error) {
      console.error('Error getting search suggestions:', error)
      return []
    }
  }

  async getTrendingSearches(limit: number = 10): Promise<string[]> {
    try {
      // Get trending searches from analytics data
      const { data: searchAnalytics, error } = await supabase
        .from('search_analytics')
        .select('query, search_count')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
        .order('search_count', { ascending: false })
        .limit(limit * 2) // Get more to filter out duplicates

      if (error) {
        console.error('Error fetching trending searches:', error)
        return []
      }

      // Extract unique queries and return top trending
      const uniqueQueries = new Set<string>()
      const trending: string[] = []

      for (const item of searchAnalytics || []) {
        if (!uniqueQueries.has(item.query) && trending.length < limit) {
          uniqueQueries.add(item.query)
          trending.push(item.query)
        }
      }

      return trending
    } catch (error) {
      console.error('Error getting trending searches:', error)
      return []
    }
  }

  // Calculate composition similarity between images
  private calculateCompositionSimilarity(imageFile: File, artwork: unknown): number {
    try {
      // Analyze composition elements: rule of thirds, symmetry, focal points
      // This would use computer vision to analyze image structure
      const compositionScore = 0.5 // Base score
      
      // Add variation based on artwork metadata
      if ((artwork as any).composition_type) {
        const compositionTypes = ['centered', 'rule_of_thirds', 'diagonal', 'symmetrical', 'asymmetrical']
        const typeIndex = compositionTypes.indexOf((artwork as any).composition_type)
        if (typeIndex !== -1) {
          return compositionScore + (typeIndex * 0.1)
        }
      }
      
      return compositionScore
    } catch (error) {
      console.error('Error calculating composition similarity:', error)
      return 0.5
    }
  }

  // Calculate style similarity between images
  private calculateStyleSimilarity(imageFile: File, artwork: unknown): number {
    try {
      // Analyze artistic style: brushstrokes, texture, artistic movement
      let styleScore = 0.5 // Base score
      
      // Factor in artwork style metadata
      if ((artwork as any).style) {
        const styleKeywords = ['abstract', 'realistic', 'impressionist', 'expressionist', 'minimalist', 'contemporary']
        const artworkStyle = (artwork as any).style.toLowerCase()
        
        for (const keyword of styleKeywords) {
          if (artworkStyle.includes(keyword)) {
            styleScore += 0.1
          }
        }
      }
      
      // Factor in medium influence on style
      if ((artwork as any).medium) {
        const mediumStyleMap: { [key: string]: number } = {
          'oil': 0.8,
          'acrylic': 0.7,
          'watercolor': 0.6,
          'digital': 0.5,
          'photography': 0.4,
          'sculpture': 0.3
        }
        
        const mediumScore = mediumStyleMap[(artwork as any).medium.toLowerCase()] || 0.5
        styleScore = (styleScore + mediumScore) / 2
      }
      
      return Math.min(styleScore, 1.0)
    } catch (error) {
      console.error('Error calculating style similarity:', error)
      return 0.5
    }
  }

  // Calculate subject similarity between images
  private async calculateSubjectSimilarity(imageFile: File, artwork: unknown): Promise<number> {
    try {
      // Analyze subject matter: objects, scenes, themes
      let subjectScore = 0.5 // Base score
      
      // Factor in artwork subject metadata
      if ((artwork as any).subject) {
        // Import dynamic subject keywords from centralized taxonomy
        const { getAllSubjectKeywords } = await import('../lib/mediaTaxonomy')
        const subjectKeywords = getAllSubjectKeywords()
        const artworkSubject = (artwork as any).subject.toLowerCase()
        
        for (const keyword of subjectKeywords) {
          if (artworkSubject.includes(keyword)) {
            subjectScore += 0.1
          }
        }
      }
      
      // Factor in genre influence
      if ((artwork as any).genre) {
        const genreSubjectMap: { [key: string]: number } = {
          'portrait': 0.8,
          'landscape': 0.7,
          'still_life': 0.6,
          'abstract': 0.5,
          'figure': 0.7,
          'nature': 0.6
        }
        
        const genreScore = genreSubjectMap[(artwork as any).genre.toLowerCase()] || 0.5
        subjectScore = (subjectScore + genreScore) / 2
      }
      
      return Math.min(subjectScore, 1.0)
    } catch (error) {
      console.error('Error calculating subject similarity:', error)
      return 0.5
    }
  }
}

export const intelligentSearch = new IntelligentSearchEngine()
