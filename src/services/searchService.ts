import { supabase } from '../lib/supabase'
import { handleError } from '../utils/errorHandling'
import { getAllMediaKeywords, getAllColorKeywords, getAllSubjectKeywords } from '../lib/mediaTaxonomy'

export interface SearchResult {
  id: string
  type: 'artwork' | 'artist' | 'catalogue'
  title: string
  description?: string
  imageUrl?: string
  price?: number
  currency?: string
  artistName?: string
  artistSlug?: string
  relevanceScore?: number
  confidence?: number
  metadata?: {
    medium?: string
    style?: string
    subject?: string
    genre?: string
    status?: string
    created_at?: string
    similarity_score?: number
    searchFactors?: SearchFactor[]
    marketTrends?: MarketTrends
    socialProof?: SocialProof
  }
}

export interface SearchFactor {
  type: 'exact_match' | 'partial_match' | 'semantic_match' | 'fuzzy_match' | 'metadata_match'
  field: string
  score: number
  confidence: number
  description: string
}

export interface MarketTrends {
  popularity: number
  demand: 'high' | 'medium' | 'low'
  priceTrend: 'rising' | 'stable' | 'declining'
  marketMomentum: number
}

export interface SocialProof {
  likes: number
  views: number
  saves: number
  shares: number
  engagementRate: number
}

export interface SearchFilters {
  priceMin?: number
  priceMax?: number
  mediums?: string[]
  styles?: string[]
  subjects?: string[]
  availability?: 'all' | 'available' | 'sold'
}

/**
 * Advanced search service with intelligent algorithms and semantic understanding
 */
export class SearchService {
  private static instance: SearchService
  private cache = new Map<string, SearchResult[]>()
  private searchHistory = new Map<string, number>()
  private trendingTerms = new Map<string, number>()
  private mediaKeywords = new Set<string>()
  private colorKeywords = new Set<string>()
  private subjectKeywords = new Set<string>()

  static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService()
    }
    return SearchService.instance
  }

  constructor() {
    this.initializeKeywords()
  }

  private async initializeKeywords() {
    try {
      this.mediaKeywords = new Set(await getAllMediaKeywords())
      this.colorKeywords = new Set(await getAllColorKeywords())
      this.subjectKeywords = new Set(await getAllSubjectKeywords())
    } catch (error) {
      console.warn('Failed to initialize search keywords:', error)
    }
  }

  /**
   * Perform intelligent semantic search across artworks with advanced algorithms
   */
  async searchArtworks(query: string, filters: SearchFilters = {}, limit: number = 20): Promise<SearchResult[]> {
    if (!query.trim()) return []

    // Track search history for trending analysis
    this.trackSearchQuery(query)

    const cacheKey = `artworks:${query}:${JSON.stringify(filters)}:${limit}`
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    try {
      // Parse query for semantic understanding
      const queryAnalysis = await this.analyzeQuery(query)
      
      // Build intelligent search patterns
      const searchPatterns = this.buildSearchPatterns(query, queryAnalysis)
      
      let supabaseQuery = supabase
        .from('artworks')
        .select(`
          id, title, description, price, currency, medium, style, subject, genre,
          primary_image_url, status, created_at, user_id, dominant_colors, tags,
          profiles!artworks_user_id_fkey(id, display_name, full_name, slug, avatar_url)
        `)
        .or(searchPatterns.join(','))
        .eq('status', filters.availability === 'all' ? undefined : filters.availability || 'available')
        .not('primary_image_url', 'is', null)

      // Apply intelligent filters
      supabaseQuery = this.applyIntelligentFilters(supabaseQuery, filters, queryAnalysis)

      const { data, error } = await supabaseQuery.limit(limit * 2) // Get more for better scoring

      if (error) throw error

      // Advanced scoring and ranking
      const results: SearchResult[] = await Promise.all((data || []).map(async (artwork) => {
        const searchFactors = await this.calculateSearchFactors(query, artwork, queryAnalysis)
        const relevanceScore = this.calculateAdvancedRelevanceScore(query, artwork, searchFactors)
        const confidence = this.calculateConfidence(searchFactors)
        const marketTrends = await this.getMarketTrends(artwork.id)
        const socialProof = await this.getSocialProof(artwork.id)

        return {
          id: artwork.id,
          type: 'artwork' as const,
          title: artwork.title || 'Untitled',
          description: artwork.description,
          imageUrl: artwork.primary_image_url,
          price: artwork.price,
          currency: artwork.currency,
          artistName: artwork.profiles?.[0]?.display_name || artwork.profiles?.[0]?.full_name || 'Unknown Artist',
          artistSlug: artwork.profiles?.[0]?.slug,
          relevanceScore,
          confidence,
          metadata: {
            medium: artwork.medium,
            style: artwork.style,
            subject: artwork.subject,
            genre: artwork.genre,
            status: artwork.status,
            created_at: artwork.created_at,
            searchFactors,
            marketTrends,
            socialProof
          }
        }
      }))

      // Sort by relevance and confidence
      const sortedResults = results
        .sort((a, b) => {
          const scoreA = (a.relevanceScore || 0) * (a.confidence || 0)
          const scoreB = (b.relevanceScore || 0) * (b.confidence || 0)
          return scoreB - scoreA
        })
        .slice(0, limit)

      this.cache.set(cacheKey, sortedResults)
      return sortedResults
    } catch (error) {
      console.error('Error searching artworks:', error)
      return []
    }
  }

  /**
   * Search artists
   */
  async searchArtists(query: string, limit: number = 10): Promise<SearchResult[]> {
    if (!query.trim()) return []

    const cacheKey = `artists:${query}:${limit}`
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    try {
      const searchPattern = `%${query.toLowerCase()}%`
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, full_name, slug, bio, avatar_url, role, location, created_at')
        .or(`display_name.ilike.${searchPattern},full_name.ilike.${searchPattern},bio.ilike.${searchPattern}`)
        .in('role', ['artist', 'both'])
        .limit(limit)

      if (error) throw error

      const results: SearchResult[] = (data || []).map(artist => ({
        id: artist.id,
        type: 'artist' as const,
        title: artist.display_name || artist.full_name || 'Unknown Artist',
        description: artist.bio,
        imageUrl: artist.avatar_url,
        artistName: artist.display_name || artist.full_name || 'Unknown Artist',
        artistSlug: artist.slug,
        metadata: {
          role: artist.role,
          location: artist.location,
          created_at: artist.created_at
        }
      }))

      this.cache.set(cacheKey, results)
      return results
    } catch (error) {
      console.error('Error searching artists:', error)
      return []
    }
  }

  /**
   * Search catalogues
   */
  async searchCatalogues(query: string, limit: number = 10): Promise<SearchResult[]> {
    if (!query.trim()) return []

    const cacheKey = `catalogues:${query}:${limit}`
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    try {
      const searchPattern = `%${query.toLowerCase()}%`
      
      const { data, error } = await supabase
        .from('catalogues')
        .select(`
          id, title, description, cover_image_url, created_at, user_id, is_published,
          profiles!catalogues_user_id_fkey(id, display_name, full_name, slug, avatar_url)
        `)
        .or(`title.ilike.${searchPattern},description.ilike.${searchPattern}`)
        .eq('is_published', true)
        .limit(limit)

      if (error) throw error

      const results: SearchResult[] = (data || []).map(catalogue => ({
        id: catalogue.id,
        type: 'catalogue' as const,
        title: catalogue.title || 'Untitled Catalogue',
        description: catalogue.description,
        imageUrl: catalogue.cover_image_url,
        artistName: catalogue.profiles?.[0]?.display_name || catalogue.profiles?.[0]?.full_name || 'Unknown Artist',
        artistSlug: catalogue.profiles?.[0]?.slug,
        metadata: {
          is_published: catalogue.is_published,
          created_at: catalogue.created_at
        }
      }))

      this.cache.set(cacheKey, results)
      return results
    } catch (error) {
      console.error('Error searching catalogues:', error)
      return []
    }
  }

  /**
   * Perform comprehensive search across all entity types
   */
  async searchAll(query: string, filters: SearchFilters = {}, limit: number = 20): Promise<SearchResult[]> {
    try {
      const [artworks, artists, catalogues] = await Promise.all([
        this.searchArtworks(query, filters, Math.ceil(limit * 0.7)),
        this.searchArtists(query, Math.ceil(limit * 0.2)),
        this.searchCatalogues(query, Math.ceil(limit * 0.1))
      ])

      // Combine and sort by relevance (simple scoring)
      const allResults = [...artworks, ...artists, ...catalogues]
        .sort((a, b) => {
          const scoreA = this.calculateRelevanceScore(query, a)
          const scoreB = this.calculateRelevanceScore(query, b)
          return scoreB - scoreA
        })
        .slice(0, limit)

      return allResults
    } catch (error) {
      console.error('Error in comprehensive search:', error)
      return []
    }
  }

  /**
   * Get intelligent search suggestions based on existing data and user behavior
   */
  async getSearchSuggestions(query: string, limit: number = 10): Promise<string[]> {
    if (!query.trim() || query.length < 2) return []

    try {
      const suggestions = new Map<string, number>()
      const searchPattern = `%${query.toLowerCase()}%`

      // 1. Get trending suggestions based on search history
      const trendingSuggestions = this.getTrendingSuggestions(query)
      trendingSuggestions.forEach(suggestion => {
        suggestions.set(suggestion, (suggestions.get(suggestion) || 0) + 10)
      })

      // 2. Get artwork title suggestions with popularity weighting
      const { data: artworks } = await supabase
        .from('artworks')
        .select('title, artwork_likes(count)')
        .ilike('title', searchPattern)
        .eq('status', 'available')
        .limit(8)

      artworks?.forEach(artwork => {
        if (artwork.title) {
          const popularity = artwork.artwork_likes?.[0]?.count || 0
          suggestions.set(artwork.title, (suggestions.get(artwork.title) || 0) + 5 + popularity)
        }
      })

      // 3. Get artist name suggestions with follower count
      const { data: artists } = await supabase
        .from('profiles')
        .select('display_name, full_name, followers(count)')
        .or(`display_name.ilike.${searchPattern},full_name.ilike.${searchPattern}`)
        .in('role', ['artist', 'both'])
        .limit(6)

      artists?.forEach(artist => {
        const followerCount = artist.followers?.[0]?.count || 0
        if (artist.display_name) {
          suggestions.set(artist.display_name, (suggestions.get(artist.display_name) || 0) + 7 + followerCount)
        }
        if (artist.full_name && artist.full_name !== artist.display_name) {
          suggestions.set(artist.full_name, (suggestions.get(artist.full_name) || 0) + 7 + followerCount)
        }
      })

      // 4. Get medium suggestions with usage frequency
      const { data: mediums } = await supabase
        .from('artworks')
        .select('medium')
        .ilike('medium', searchPattern)
        .not('medium', 'is', null)
        .eq('status', 'available')
        .limit(5)

      const mediumCounts = new Map<string, number>()
      mediums?.forEach(artwork => {
        if (artwork.medium) {
          mediumCounts.set(artwork.medium, (mediumCounts.get(artwork.medium) || 0) + 1)
        }
      })

      mediumCounts.forEach((count, medium) => {
        suggestions.set(medium, (suggestions.get(medium) || 0) + 3 + count)
      })

      // 5. Get style/genre suggestions
      const { data: styles } = await supabase
        .from('artworks')
        .select('style, genre')
        .or(`style.ilike.${searchPattern},genre.ilike.${searchPattern}`)
        .not('style', 'is', null)
        .eq('status', 'available')
        .limit(4)

      styles?.forEach(artwork => {
        if (artwork.style) {
          suggestions.set(artwork.style, (suggestions.get(artwork.style) || 0) + 4)
        }
        if (artwork.genre && artwork.genre !== artwork.style) {
          suggestions.set(artwork.genre, (suggestions.get(artwork.genre) || 0) + 4)
        }
      })

      // 6. Get semantic suggestions from taxonomy
      const semanticSuggestions = this.getSemanticSuggestions(query)
      semanticSuggestions.forEach(suggestion => {
        suggestions.set(suggestion, (suggestions.get(suggestion) || 0) + 6)
      })

      // 7. Get color suggestions
      const colorSuggestions = this.getColorSuggestions(query)
      colorSuggestions.forEach(suggestion => {
        suggestions.set(suggestion, (suggestions.get(suggestion) || 0) + 2)
      })

      // Sort by score and return top suggestions
      return Array.from(suggestions.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([suggestion]) => suggestion)
        .slice(0, limit)
    } catch (error) {
      console.error('Error getting search suggestions:', error)
      return []
    }
  }

  /**
   * Find similar artworks based on an existing artwork
   */
  async findSimilarArtworks(artworkId: string, limit: number = 10): Promise<SearchResult[]> {
    try {
      // First get the target artwork
      const { data: targetArtwork, error: targetError } = await supabase
        .from('artworks')
        .select('medium, style, subject, genre, price, user_id')
        .eq('id', artworkId)
        .single()

      if (targetError || !targetArtwork) return []

      // Find similar artworks
      const { data: similar, error } = await supabase
        .from('artworks')
        .select(`
          id, title, description, price, currency, medium, style, subject, genre,
          primary_image_url, status, created_at, user_id,
          profiles!artworks_user_id_fkey(id, display_name, full_name, slug, avatar_url)
        `)
        .neq('id', artworkId)
        .eq('status', 'available')
        .not('primary_image_url', 'is', null)
        .or(`medium.eq.${targetArtwork.medium},style.eq.${targetArtwork.style},subject.eq.${targetArtwork.subject},genre.eq.${targetArtwork.genre}`)
        .limit(limit * 2)

      if (error) throw error

      // Score and sort by similarity
      const results: SearchResult[] = (similar || [])
        .map(artwork => ({
          id: artwork.id,
          type: 'artwork' as const,
          title: artwork.title || 'Untitled',
          description: artwork.description,
          imageUrl: artwork.primary_image_url,
          price: artwork.price,
          currency: artwork.currency,
        artistName: artwork.profiles?.[0]?.display_name || artwork.profiles?.[0]?.full_name || 'Unknown Artist',
        artistSlug: artwork.profiles?.[0]?.slug,
          metadata: {
            medium: artwork.medium,
            style: artwork.style,
            subject: artwork.subject,
            genre: artwork.genre,
            similarity_score: this.calculateSimilarityScore(targetArtwork, artwork)
          }
        }))
        .sort((a, b) => (b.metadata.similarity_score || 0) - (a.metadata.similarity_score || 0))
        .slice(0, limit)

      return results
    } catch (error) {
      console.error('Error finding similar artworks:', error)
      return []
    }
  }

  /**
   * Calculate advanced relevance score with multiple factors
   */
  private calculateAdvancedRelevanceScore(query: string, artwork: any, searchFactors: SearchFactor[]): number {
    let score = 0
    const queryLower = query.toLowerCase()

    // Base scoring from search factors
    searchFactors.forEach(factor => {
      score += factor.score * factor.confidence
    })

    // Exact match bonuses
    if (artwork.title?.toLowerCase() === queryLower) {
      score += 50 // Exact title match
    } else if (artwork.title?.toLowerCase().startsWith(queryLower)) {
      score += 30 // Title starts with query
    } else if (artwork.title?.toLowerCase().includes(queryLower)) {
      score += 20 // Title contains query
    }

    // Description relevance
    if (artwork.description?.toLowerCase().includes(queryLower)) {
      score += 15
    }

    // Artist name relevance
    if (artwork.profiles?.[0]?.display_name?.toLowerCase().includes(queryLower) ||
        artwork.profiles?.[0]?.full_name?.toLowerCase().includes(queryLower)) {
      score += 25
    }

    // Metadata relevance
    if (artwork.medium?.toLowerCase().includes(queryLower)) score += 10
    if (artwork.style?.toLowerCase().includes(queryLower)) score += 10
    if (artwork.subject?.toLowerCase().includes(queryLower)) score += 10
    if (artwork.genre?.toLowerCase().includes(queryLower)) score += 10

    // Color relevance
    if (artwork.dominant_colors?.some((color: string) => 
      color.toLowerCase().includes(queryLower) || 
      this.colorKeywords.has(color.toLowerCase())
    )) {
      score += 8
    }

    // Tag relevance
    if (artwork.tags?.some((tag: string) => 
      tag.toLowerCase().includes(queryLower)
    )) {
      score += 5
    }

    // Recency bonus
    if (artwork.created_at) {
      const daysSinceCreation = (Date.now() - new Date(artwork.created_at).getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceCreation < 30) score += 5
      else if (daysSinceCreation < 90) score += 3
    }

    return Math.max(0, Math.min(100, score))
  }

  /**
   * Calculate advanced similarity score between artworks with multiple dimensions
   */
  private calculateSimilarityScore(target: any, candidate: any): number {
    let score = 0
    const maxScore = 100

    // 1. Medium similarity (25 points)
    if (candidate.medium === target.medium) {
      score += 25
    } else if (candidate.medium && target.medium) {
      // Check for similar mediums using taxonomy
      const mediumSimilarity = this.calculateMediumSimilarity(target.medium, candidate.medium)
      score += mediumSimilarity * 25
    }

    // 2. Style similarity (20 points)
    if (candidate.style === target.style) {
      score += 20
    } else if (candidate.style && target.style) {
      const styleSimilarity = this.calculateStyleSimilarity(target.style, candidate.style)
      score += styleSimilarity * 20
    }

    // 3. Subject similarity (20 points)
    if (candidate.subject === target.subject) {
      score += 20
    } else if (candidate.subject && target.subject) {
      const subjectSimilarity = this.calculateSubjectSimilarity(target.subject, candidate.subject)
      score += subjectSimilarity * 20
    }

    // 4. Genre similarity (15 points)
    if (candidate.genre === target.genre) {
      score += 15
    } else if (candidate.genre && target.genre) {
      const genreSimilarity = this.calculateGenreSimilarity(target.genre, candidate.genre)
      score += genreSimilarity * 15
    }

    // 5. Price similarity (10 points)
    if (target.price && candidate.price) {
      const priceSimilarity = this.calculatePriceSimilarity(target.price, candidate.price)
      score += priceSimilarity * 10
    }

    // 6. Color similarity (5 points)
    if (target.dominant_colors && candidate.dominant_colors) {
      const colorSimilarity = this.calculateColorSimilarity(target.dominant_colors, candidate.dominant_colors)
      score += colorSimilarity * 5
    }

    // 7. Artist similarity (5 points)
    if (candidate.user_id === target.user_id) {
      score += 5
    }

    return Math.max(0, Math.min(maxScore, score))
  }

  // Helper methods for similarity calculations
  private calculateMediumSimilarity(medium1: string, medium2: string): number {
    if (medium1 === medium2) return 1
    
    // Check if mediums are in the same category
    const medium1Keywords = Array.from(this.mediaKeywords).filter(k => 
      k.toLowerCase().includes(medium1.toLowerCase())
    )
    const medium2Keywords = Array.from(this.mediaKeywords).filter(k => 
      k.toLowerCase().includes(medium2.toLowerCase())
    )
    
    const commonKeywords = medium1Keywords.filter(k => medium2Keywords.includes(k))
    return commonKeywords.length / Math.max(medium1Keywords.length, medium2Keywords.length, 1)
  }

  private calculateStyleSimilarity(style1: string, style2: string): number {
    if (style1 === style2) return 1
    
    // Simple string similarity for now
    const longer = style1.length > style2.length ? style1 : style2
    const shorter = style1.length > style2.length ? style2 : style1
    
    if (longer.length === 0) return 1
    
    const editDistance = this.levenshteinDistance(longer, shorter)
    return (longer.length - editDistance) / longer.length
  }

  private calculateSubjectSimilarity(subject1: string, subject2: string): number {
    if (subject1 === subject2) return 1
    
    // Check if subjects are in the same category
    const subject1Keywords = Array.from(this.subjectKeywords).filter(k => 
      k.toLowerCase().includes(subject1.toLowerCase())
    )
    const subject2Keywords = Array.from(this.subjectKeywords).filter(k => 
      k.toLowerCase().includes(subject2.toLowerCase())
    )
    
    const commonKeywords = subject1Keywords.filter(k => subject2Keywords.includes(k))
    return commonKeywords.length / Math.max(subject1Keywords.length, subject2Keywords.length, 1)
  }

  private calculateGenreSimilarity(genre1: string, genre2: string): number {
    if (genre1 === genre2) return 1
    
    // Simple string similarity
    const longer = genre1.length > genre2.length ? genre1 : genre2
    const shorter = genre1.length > genre2.length ? genre2 : genre1
    
    if (longer.length === 0) return 1
    
    const editDistance = this.levenshteinDistance(longer, shorter)
    return (longer.length - editDistance) / longer.length
  }

  private calculatePriceSimilarity(price1: number, price2: number): number {
    const priceDiff = Math.abs(price1 - price2) / Math.max(price1, price2)
    return Math.max(0, 1 - priceDiff)
  }

  private calculateColorSimilarity(colors1: string[], colors2: string[]): number {
    if (!colors1 || !colors2 || colors1.length === 0 || colors2.length === 0) return 0
    
    const commonColors = colors1.filter(c1 => 
      colors2.some(c2 => c1.toLowerCase() === c2.toLowerCase())
    )
    
    return commonColors.length / Math.max(colors1.length, colors2.length)
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        )
      }
    }
    
    return matrix[str2.length][str1.length]
  }

  // Missing methods that are referenced but not implemented
  private trackSearchQuery(query: string): void {
    const count = this.searchHistory.get(query) || 0
    this.searchHistory.set(query, count + 1)
    
    // Update trending terms
    const words = query.toLowerCase().split(/\s+/)
    words.forEach(word => {
      if (word.length > 2) {
        const count = this.trendingTerms.get(word) || 0
        this.trendingTerms.set(word, count + 1)
      }
    })
  }

  private async analyzeQuery(query: string): Promise<any> {
    return {
      original: query,
      keywords: this.extractKeywords(query),
      concepts: await this.extractConcepts(query),
      emotions: await this.extractEmotions(query),
      styles: await this.extractStyles(query)
    }
  }

  private buildSearchPatterns(query: string, analysis: any): string[] {
    const patterns: string[] = []
    const searchPattern = `%${query.toLowerCase()}%`
    
    patterns.push(`title.ilike.${searchPattern}`)
    patterns.push(`description.ilike.${searchPattern}`)
    patterns.push(`medium.ilike.${searchPattern}`)
    patterns.push(`style.ilike.${searchPattern}`)
    patterns.push(`subject.ilike.${searchPattern}`)
    patterns.push(`genre.ilike.${searchPattern}`)
    
    return patterns
  }

  private applyIntelligentFilters(query: any, filters: SearchFilters, analysis: any): any {
    // Apply filters based on analysis
    if (filters.priceMin !== undefined) {
      query = query.gte('price', filters.priceMin)
    }
    if (filters.priceMax !== undefined) {
      query = query.lte('price', filters.priceMax)
    }
    if (filters.mediums?.length) {
      query = query.in('medium', filters.mediums)
    }
    if (filters.styles?.length) {
      query = query.in('style', filters.styles)
    }
    if (filters.subjects?.length) {
      query = query.in('subject', filters.subjects)
    }
    
    return query
  }

  private async calculateSearchFactors(query: string, artwork: any, analysis: any): Promise<SearchFactor[]> {
    const factors: SearchFactor[] = []
    const queryLower = query.toLowerCase()
    
    // Title match
    if (artwork.title?.toLowerCase().includes(queryLower)) {
      factors.push({
        type: 'exact_match',
        field: 'title',
        score: artwork.title.toLowerCase().startsWith(queryLower) ? 1.0 : 0.8,
        confidence: 0.9,
        description: 'Title matches search query'
      })
    }
    
    // Description match
    if (artwork.description?.toLowerCase().includes(queryLower)) {
      factors.push({
        type: 'partial_match',
        field: 'description',
        score: 0.6,
        confidence: 0.7,
        description: 'Description contains search terms'
      })
    }
    
    // Medium match
    if (artwork.medium?.toLowerCase().includes(queryLower)) {
      factors.push({
        type: 'metadata_match',
        field: 'medium',
        score: 0.5,
        confidence: 0.8,
        description: 'Medium matches search query'
      })
    }
    
    return factors
  }

  private calculateConfidence(factors: SearchFactor[]): number {
    if (factors.length === 0) return 0
    
    const totalScore = factors.reduce((sum, factor) => sum + factor.score * factor.confidence, 0)
    const maxPossibleScore = factors.length
    
    return Math.min(1, totalScore / maxPossibleScore)
  }

  private async getMarketTrends(artworkId: string): Promise<MarketTrends | undefined> {
    try {
      // Get market data for this artwork
      const { data: artwork } = await supabase
        .from('artworks')
        .select('views_count, likes_count, inquiries_count, created_at')
        .eq('id', artworkId)
        .single()
      
      if (!artwork) return undefined
      
      const popularity = (artwork.views_count || 0) + (artwork.likes_count || 0) * 2
      const demand = (artwork.inquiries_count || 0) > 5 ? 'high' : 
                    (artwork.inquiries_count || 0) > 2 ? 'medium' : 'low'
      
      return {
        popularity,
        demand,
        priceTrend: 'stable',
        marketMomentum: popularity / 100
      }
    } catch (error) {
      console.error('Error getting market trends:', error)
      return undefined
    }
  }

  private async getSocialProof(artworkId: string): Promise<SocialProof | undefined> {
    try {
      const { data: artwork } = await supabase
        .from('artworks')
        .select('views_count, likes_count, saves_count, shares_count')
        .eq('id', artworkId)
        .single()
      
      if (!artwork) return undefined
      
      const views = artwork.views_count || 0
      const likes = artwork.likes_count || 0
      const saves = artwork.saves_count || 0
      const shares = artwork.shares_count || 0
      
      return {
        likes,
        views,
        saves,
        shares,
        engagementRate: views > 0 ? (likes + saves + shares) / views : 0
      }
    } catch (error) {
      console.error('Error getting social proof:', error)
      return undefined
    }
  }

  private getTrendingSuggestions(query: string): string[] {
    const suggestions: string[] = []
    const queryLower = query.toLowerCase()
    
    // Get trending terms that match the query
    this.trendingTerms.forEach((count, term) => {
      if (term.includes(queryLower) && count > 2) {
        suggestions.push(term)
      }
    })
    
    return suggestions.slice(0, 5)
  }

  private getSemanticSuggestions(query: string): string[] {
    const suggestions: string[] = []
    const queryLower = query.toLowerCase()
    
    // Generate semantic suggestions based on query
    if (queryLower.includes('abstract')) {
      suggestions.push('geometric abstract', 'color field', 'minimalist')
    }
    if (queryLower.includes('portrait')) {
      suggestions.push('figure study', 'character portrait', 'head study')
    }
    if (queryLower.includes('landscape')) {
      suggestions.push('nature scene', 'outdoor painting', 'scenery')
    }
    
    return suggestions.slice(0, 3)
  }

  private getColorSuggestions(query: string): string[] {
    const suggestions: string[] = []
    const queryLower = query.toLowerCase()
    
    // Color-based suggestions
    const colorTerms = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'black', 'white']
    colorTerms.forEach(color => {
      if (queryLower.includes(color)) {
        suggestions.push(`${color} artwork`, `${color} painting`, `${color} abstract`)
      }
    })
    
    return suggestions.slice(0, 3)
  }

  private async extractConcepts(query: string): Promise<string[]> {
    // Simple concept extraction
    const concepts: string[] = []
    const queryLower = query.toLowerCase()
    
    if (queryLower.includes('abstract')) concepts.push('abstract')
    if (queryLower.includes('realistic')) concepts.push('realistic')
    if (queryLower.includes('landscape')) concepts.push('landscape')
    if (queryLower.includes('portrait')) concepts.push('portrait')
    if (queryLower.includes('nature')) concepts.push('nature')
    
    return concepts
  }

  private async extractEmotions(query: string): Promise<string[]> {
    // Simple emotion extraction
    const emotions: string[] = []
    const queryLower = query.toLowerCase()
    
    if (queryLower.includes('happy') || queryLower.includes('joyful')) emotions.push('joy')
    if (queryLower.includes('sad') || queryLower.includes('melancholy')) emotions.push('sadness')
    if (queryLower.includes('calm') || queryLower.includes('peaceful')) emotions.push('peace')
    if (queryLower.includes('exciting') || queryLower.includes('dynamic')) emotions.push('excitement')
    
    return emotions
  }

  private async extractStyles(query: string): Promise<string[]> {
    // Simple style extraction
    const styles: string[] = []
    const queryLower = query.toLowerCase()
    
    if (queryLower.includes('impressionist')) styles.push('impressionist')
    if (queryLower.includes('expressionist')) styles.push('expressionist')
    if (queryLower.includes('minimalist')) styles.push('minimalist')
    if (queryLower.includes('contemporary')) styles.push('contemporary')
    
    return styles
  }

  /**
   * Clear search cache
   */
  clearCache(): void {
    this.cache.clear()
    this.searchHistory.clear()
    this.trendingTerms.clear()
  }

  private calculateRelevanceScore(query: string, item: any): number {
    const queryLower = query.toLowerCase()
    const title = (item.title || '').toLowerCase()
    const description = (item.description || '').toLowerCase()
    
    // Simple scoring based on title and description matches
    let score = 0
    
    if (title.includes(queryLower)) score += 10
    if (description.includes(queryLower)) score += 5
    
    // Boost score for exact matches
    if (title === queryLower) score += 20
    if (description === queryLower) score += 10
    
    return score
  }

  private extractKeywords(text: string): string[] {
    // Simple keyword extraction
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .filter(word => !this.isStopWord(word))
    
    return [...new Set(words)] // Remove duplicates
  }

  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
    ])
    
    return stopWords.has(word)
  }
}

export default SearchService.getInstance()
