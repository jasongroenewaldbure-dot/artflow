import { supabase } from '../lib/supabase'

export interface SearchResult {
  id: string
  type: 'artwork' | 'artist' | 'catalogue'
  title: string
  description: string
  imageUrl?: string
  relevanceScore: number
  metadata: any
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
    userPreferences?: any
    sessionData?: any
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
  metadata: any
}

class IntelligentSearchEngine {
  private async extractEntities(query: string): Promise<NaturalLanguageQuery['entities']> {
    // This would typically use NLP libraries like spaCy or cloud services
    // For now, we'll implement a basic keyword extraction
    
    const entities: NaturalLanguageQuery['entities'] = {}
    
    // Extract color mentions
    const colorKeywords = {
      'red': '#FF0000', 'blue': '#0000FF', 'green': '#00FF00', 'yellow': '#FFFF00',
      'purple': '#800080', 'orange': '#FFA500', 'pink': '#FFC0CB', 'black': '#000000',
      'white': '#FFFFFF', 'gray': '#808080', 'brown': '#A52A2A', 'vibrant': 'vibrant',
      'muted': 'muted', 'bright': 'bright', 'dark': 'dark', 'light': 'light'
    }
    
    const colors = Object.keys(colorKeywords).filter(color => 
      query.toLowerCase().includes(color)
    )
    if (colors.length > 0) {
      entities.colors = colors.map(color => colorKeywords[color as keyof typeof colorKeywords])
    }
    
    // Extract medium mentions
    const mediumKeywords = [
      'oil', 'acrylic', 'watercolor', 'digital', 'photography', 'sculpture',
      'print', 'drawing', 'collage', 'mixed media', 'canvas', 'paper',
      'wood', 'metal', 'ceramic', 'glass'
    ]
    
    const mediums = mediumKeywords.filter(medium => 
      query.toLowerCase().includes(medium)
    )
    if (mediums.length > 0) {
      entities.mediums = mediums
    }
    
    // Extract genre/style mentions
    const genreKeywords = [
      'abstract', 'realism', 'impressionism', 'expressionism', 'surrealism',
      'pop art', 'contemporary', 'minimalism', 'conceptual', 'street art',
      'landscape', 'portrait', 'still life', 'figurative', 'modern', 'classical'
    ]
    
    const genres = genreKeywords.filter(genre => 
      query.toLowerCase().includes(genre)
    )
    if (genres.length > 0) {
      entities.genres = genres
    }
    
    // Extract subject mentions
    const subjectKeywords = [
      'nature', 'urban', 'city', 'human', 'figure', 'animal', 'architecture',
      'building', 'flower', 'tree', 'mountain', 'ocean', 'sky', 'sunset',
      'emotion', 'love', 'sadness', 'joy', 'anger', 'peace', 'war', 'politics'
    ]
    
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

  async processNaturalLanguageQuery(query: string, context?: any): Promise<NaturalLanguageQuery> {
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
          id, title, description, price, genre, medium, style, subject, dominant_colors,
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
      
      if (nlQuery.entities.styles?.length) {
        supabaseQuery = supabaseQuery.in('style', nlQuery.entities.styles)
      }
      
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
          const artistName = artwork.profiles?.name?.toLowerCase() || ''
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
          id, name, bio, avatar_url, created_at,
          artworks!artworks_user_id_fkey(id, title, primary_image_url, price, status)
        `)
        .eq('role', 'artist')

      // Apply text search
      if (nlQuery.query) {
        supabaseQuery = supabaseQuery.or(`name.ilike.%${nlQuery.query}%,bio.ilike.%${nlQuery.query}%`)
      }

      const { data: artists, error } = await supabaseQuery.limit(limit * 2)

      if (error) throw error

      const results = artists.map(artist => {
        let relevanceScore = 0
        
        // Name matching
        if (artist.name?.toLowerCase().includes(nlQuery.query.toLowerCase())) {
          relevanceScore += 50
        }
        
        // Bio matching
        if (artist.bio?.toLowerCase().includes(nlQuery.query.toLowerCase())) {
          relevanceScore += 30
        }
        
        // Artist name in entities
        if (nlQuery.entities.artists?.some(artistName => 
          artist.name?.toLowerCase().includes(artistName.toLowerCase())
        )) {
          relevanceScore += 40
        }

        return {
          id: artist.id,
          type: 'artist' as const,
          title: artist.name || 'Unknown Artist',
          description: artist.bio || '',
          imageUrl: artist.avatar_url,
          relevanceScore: Math.max(0, relevanceScore),
          metadata: {
            bio: artist.bio,
            avatarUrl: artist.avatar_url,
            artworkCount: (artist.artworks || []).filter((a: any) => a.status === 'available').length || 0,
            artworks: (artist.artworks || []).filter((a: any) => a.status === 'available').slice(0, 3) || [],
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
          profiles!catalogues_user_id_fkey(id, name, avatar_url),
          artworks!catalogue_artworks(artwork_id, artworks(id, title, primary_image_url, status))
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
        if (catalogue.profiles?.name?.toLowerCase().includes(nlQuery.query.toLowerCase())) {
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
            artworkCount: (catalogue.artworks || []).filter((a: any) => a.artworks?.status === 'available').length || 0,
            artworks: (catalogue.artworks || []).filter((a: any) => a.artworks?.status === 'available').slice(0, 3) || [],
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
      // This would typically use a computer vision API like Google Vision, AWS Rekognition, or CLIP
      // For now, we'll implement a basic color-based similarity search
      
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

      const results = artworks.map(artwork => {
        const colorSimilarity = this.calculateColorSimilarity(dominantColors, artwork.dominant_colors || [])
        
        return {
          artworkId: artwork.id,
          similarityScore: colorSimilarity * 100,
          visualMatches: {
            colorSimilarity,
            compositionSimilarity: 0.5, // Placeholder - would need actual CV analysis
            styleSimilarity: 0.5, // Placeholder
            subjectSimilarity: 0.5 // Placeholder
          },
          metadata: {
            title: artwork.title,
            imageUrl: artwork.primary_image_url,
            genre: artwork.genre,
            medium: artwork.medium,
            artist: artwork.profiles
          }
        }
      })

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
    // This is a simplified color extraction
    // In production, you'd use a proper image processing library
    return ['#FF0000', '#00FF00', '#0000FF'] // Placeholder
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
        .select('title, genre, medium, profiles(name)')
        .ilike('title', `%${query}%`)
        .eq('status', 'available')
        .limit(10)

      const suggestions = new Set<string>()
      
      artworks?.forEach(artwork => {
        if (artwork.title) suggestions.add(artwork.title)
        if (artwork.genre) suggestions.add(artwork.genre)
        if (artwork.medium) suggestions.add(artwork.medium)
        if (artwork.profiles?.name) suggestions.add(artwork.profiles.name)
      })

      return Array.from(suggestions).slice(0, limit)
    } catch (error) {
      console.error('Error getting search suggestions:', error)
      return []
    }
  }

  async getTrendingSearches(limit: number = 10): Promise<string[]> {
    try {
      // This would typically come from analytics data
      // For now, return some sample trending searches
      return [
        'abstract art',
        'contemporary paintings',
        'digital art',
        'portrait photography',
        'landscape paintings',
        'sculpture',
        'watercolor',
        'mixed media',
        'street art',
        'minimalist'
      ].slice(0, limit)
    } catch (error) {
      console.error('Error getting trending searches:', error)
      return []
    }
  }
}

export const intelligentSearch = new IntelligentSearchEngine()
