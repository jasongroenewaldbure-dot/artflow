import { supabase } from '../lib/supabase'
import { handleError } from '../utils/errorHandling'

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
  metadata?: any
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
 * Simple search service that works without complex database functions
 */
export class SearchService {
  private static instance: SearchService
  private cache = new Map<string, SearchResult[]>()

  static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService()
    }
    return SearchService.instance
  }

  /**
   * Perform a simple text search across artworks
   */
  async searchArtworks(query: string, filters: SearchFilters = {}, limit: number = 20): Promise<SearchResult[]> {
    if (!query.trim()) return []

    const cacheKey = `artworks:${query}:${JSON.stringify(filters)}:${limit}`
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    try {
      const searchPattern = `%${query.toLowerCase()}%`
      
      let supabaseQuery = supabase
        .from('artworks')
        .select(`
          id, title, description, price, currency, medium, style, subject, genre,
          primary_image_url, status, created_at, user_id,
          profiles!artworks_user_id_fkey(id, display_name, full_name, slug, avatar_url)
        `)
        .or(`title.ilike.${searchPattern},description.ilike.${searchPattern},medium.ilike.${searchPattern},style.ilike.${searchPattern},subject.ilike.${searchPattern},genre.ilike.${searchPattern}`)
        .eq('status', filters.availability === 'all' ? undefined : filters.availability || 'available')
        .not('primary_image_url', 'is', null)

      // Apply filters
      if (filters.priceMin !== undefined) {
        supabaseQuery = supabaseQuery.gte('price', filters.priceMin)
      }
      if (filters.priceMax !== undefined) {
        supabaseQuery = supabaseQuery.lte('price', filters.priceMax)
      }
      if (filters.mediums?.length) {
        supabaseQuery = supabaseQuery.in('medium', filters.mediums)
      }
      if (filters.styles?.length) {
        supabaseQuery = supabaseQuery.in('style', filters.styles)
      }
      if (filters.subjects?.length) {
        supabaseQuery = supabaseQuery.in('subject', filters.subjects)
      }

      const { data, error } = await supabaseQuery.limit(limit)

      if (error) throw error

      const results: SearchResult[] = (data || []).map(artwork => ({
        id: artwork.id,
        type: 'artwork' as const,
        title: artwork.title || 'Untitled',
        description: artwork.description,
        imageUrl: artwork.primary_image_url,
        price: artwork.price,
        currency: artwork.currency,
        artistName: artwork.profiles?.display_name || artwork.profiles?.full_name || 'Unknown Artist',
        artistSlug: artwork.profiles?.slug,
        metadata: {
          medium: artwork.medium,
          style: artwork.style,
          subject: artwork.subject,
          genre: artwork.genre,
          status: artwork.status,
          created_at: artwork.created_at
        }
      }))

      this.cache.set(cacheKey, results)
      return results
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
        artistName: catalogue.profiles?.display_name || catalogue.profiles?.full_name || 'Unknown Artist',
        artistSlug: catalogue.profiles?.slug,
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
   * Get search suggestions based on existing data
   */
  async getSearchSuggestions(query: string, limit: number = 10): Promise<string[]> {
    if (!query.trim() || query.length < 2) return []

    try {
      const suggestions = new Set<string>()
      const searchPattern = `%${query.toLowerCase()}%`

      // Get artwork title suggestions
      const { data: artworks } = await supabase
        .from('artworks')
        .select('title')
        .ilike('title', searchPattern)
        .eq('status', 'available')
        .limit(5)

      artworks?.forEach(artwork => {
        if (artwork.title) suggestions.add(artwork.title)
      })

      // Get artist name suggestions
      const { data: artists } = await supabase
        .from('profiles')
        .select('display_name, full_name')
        .or(`display_name.ilike.${searchPattern},full_name.ilike.${searchPattern}`)
        .in('role', ['artist', 'both'])
        .limit(5)

      artists?.forEach(artist => {
        if (artist.display_name) suggestions.add(artist.display_name)
        if (artist.full_name) suggestions.add(artist.full_name)
      })

      // Get medium suggestions
      const { data: mediums } = await supabase
        .from('artworks')
        .select('medium')
        .ilike('medium', searchPattern)
        .not('medium', 'is', null)
        .eq('status', 'available')
        .limit(3)

      mediums?.forEach(artwork => {
        if (artwork.medium) suggestions.add(artwork.medium)
      })

      return Array.from(suggestions).slice(0, limit)
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
          artistName: artwork.profiles?.display_name || artwork.profiles?.full_name || 'Unknown Artist',
          artistSlug: artwork.profiles?.slug,
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
   * Calculate relevance score for search results
   */
  private calculateRelevanceScore(query: string, result: SearchResult): number {
    const queryLower = query.toLowerCase()
    let score = 0

    if (result.title.toLowerCase().includes(queryLower)) {
      score += result.title.toLowerCase().startsWith(queryLower) ? 1.0 : 0.8
    }
    if (result.description?.toLowerCase().includes(queryLower)) {
      score += 0.6
    }
    if (result.artistName?.toLowerCase().includes(queryLower)) {
      score += 0.4
    }
    if (result.metadata?.medium?.toLowerCase().includes(queryLower)) {
      score += 0.3
    }
    if (result.metadata?.style?.toLowerCase().includes(queryLower)) {
      score += 0.3
    }
    if (result.metadata?.subject?.toLowerCase().includes(queryLower)) {
      score += 0.3
    }

    return score
  }

  /**
   * Calculate similarity score between artworks
   */
  private calculateSimilarityScore(target: any, candidate: any): number {
    let score = 0

    if (candidate.medium === target.medium) score += 0.3
    if (candidate.style === target.style) score += 0.25
    if (candidate.subject === target.subject) score += 0.25
    if (candidate.genre === target.genre) score += 0.2

    // Price similarity
    if (target.price && candidate.price) {
      const priceDiff = Math.abs(candidate.price - target.price) / target.price
      if (priceDiff < 0.5) score += 0.1
    }

    return score
  }

  /**
   * Clear search cache
   */
  clearCache(): void {
    this.cache.clear()
  }
}

export default SearchService.getInstance()
