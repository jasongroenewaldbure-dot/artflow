import { supabase } from '@/lib/supabase'

export interface TrendingKeyword {
  term: string
  count: number
  category: 'genre' | 'medium' | 'artist' | 'style' | 'subject'
  trend: 'rising' | 'stable' | 'falling'
  searchVolume: number
}

export interface TrendingPhrase {
  phrase: string
  count: number
  category: 'search' | 'discovery' | 'collection'
  trend: 'rising' | 'stable' | 'falling'
  relatedTerms: string[]
}

export interface SearchInsights {
  trendingKeywords: TrendingKeyword[]
  trendingPhrases: TrendingPhrase[]
  popularGenres: { genre: string; count: number }[]
  popularMediums: { medium: string; count: number }[]
  emergingArtists: { name: string; slug: string; artworkCount: number }[]
  seasonalTrends: { term: string; seasonal: boolean; peakMonths: string[] }[]
}

class TrendingSearchService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  private async getCachedData<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key)
    const now = Date.now()

    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data
    }

    const data = await fetcher()
    this.cache.set(key, { data, timestamp: now })
    return data
  }

  async getTrendingKeywords(): Promise<TrendingKeyword[]> {
    return this.getCachedData('trending-keywords', async () => {
      try {
        // Get genre trends
        const { data: genreData } = await supabase
          .from('artworks')
          .select('genre')
          .not('genre', 'is', null)
          .eq('status', 'available')

        // Get medium trends
        const { data: mediumData } = await supabase
          .from('artworks')
          .select('medium')
          .not('medium', 'is', null)
          .eq('status', 'available')

        // Get subject trends
        const { data: subjectData } = await supabase
          .from('artworks')
          .select('subject')
          .not('subject', 'is', null)
          .eq('status', 'available')

        // Process genre trends
        const genreCounts = new Map<string, number>()
        genreData?.forEach(artwork => {
          if (artwork.genre) {
            const genre = artwork.genre.toLowerCase().trim()
            genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1)
          }
        })

        // Process medium trends
        const mediumCounts = new Map<string, number>()
        mediumData?.forEach(artwork => {
          if (artwork.medium) {
            const medium = artwork.medium.toLowerCase().trim()
            mediumCounts.set(medium, (mediumCounts.get(medium) || 0) + 1)
          }
        })

        // Process subject trends
        const subjectCounts = new Map<string, number>()
        subjectData?.forEach(artwork => {
          if (artwork.subject) {
            const subject = artwork.subject.toLowerCase().trim()
            subjectCounts.set(subject, (subjectCounts.get(subject) || 0) + 1)
          }
        })

        const keywords: TrendingKeyword[] = []

        // Add genre keywords
        Array.from(genreCounts.entries())
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .forEach(([genre, count]) => {
            keywords.push({
              term: genre,
              count,
              category: 'genre',
              trend: count > 5 ? 'rising' : 'stable',
              searchVolume: count * 2
            })
          })

        // Add medium keywords
        Array.from(mediumCounts.entries())
          .sort(([, a], [, b]) => b - a)
          .slice(0, 8)
          .forEach(([medium, count]) => {
            keywords.push({
              term: medium,
              count,
              category: 'medium',
              trend: count > 3 ? 'rising' : 'stable',
              searchVolume: count * 1.5
            })
          })

        // Add subject keywords
        Array.from(subjectCounts.entries())
          .sort(([, a], [, b]) => b - a)
          .slice(0, 6)
          .forEach(([subject, count]) => {
            keywords.push({
              term: subject,
              count,
              category: 'subject',
              trend: count > 2 ? 'rising' : 'stable',
              searchVolume: count * 1.2
            })
          })

        return keywords.sort((a, b) => b.searchVolume - a.searchVolume)
      } catch (error) {
        console.error('Error fetching trending keywords:', error)
        return []
      }
    })
  }

  async getTrendingPhrases(): Promise<TrendingPhrase[]> {
    return this.getCachedData('trending-phrases', async () => {
      try {
        // Get recent artworks for phrase analysis
        const { data: artworkData } = await supabase
          .from('artworks')
          .select('title, description, genre, medium, subject')
          .eq('status', 'available')
          .not('title', 'is', null)
          .order('created_at', { ascending: false })
          .limit(100)

        const phrases: TrendingPhrase[] = []
        const phraseCounts = new Map<string, number>()

        // Extract phrases from titles and descriptions
        artworkData?.forEach(artwork => {
          const text = `${artwork.title || ''} ${artwork.description || ''}`.toLowerCase()
          
          // Extract 2-word phrases
          const words = text.split(/\s+/).filter(word => word.length > 2)
          for (let i = 0; i < words.length - 1; i++) {
            const phrase = `${words[i]} ${words[i + 1]}`
            if (phrase.length > 3 && phrase.length < 30) {
              phraseCounts.set(phrase, (phraseCounts.get(phrase) || 0) + 1)
            }
          }

          // Extract 3-word phrases
          for (let i = 0; i < words.length - 2; i++) {
            const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`
            if (phrase.length > 5 && phrase.length < 40) {
              phraseCounts.set(phrase, (phraseCounts.get(phrase) || 0) + 1)
            }
          }
        })

        // Convert to trending phrases
        Array.from(phraseCounts.entries())
          .filter(([, count]) => count > 1)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 15)
          .forEach(([phrase, count]) => {
            phrases.push({
              phrase,
              count,
              category: 'search',
              trend: count > 3 ? 'rising' : 'stable',
              relatedTerms: phrase.split(' ')
            })
          })

        return phrases
      } catch (error) {
        console.error('Error fetching trending phrases:', error)
        return []
      }
    })
  }

  async getSearchInsights(): Promise<SearchInsights> {
    return this.getCachedData('search-insights', async () => {
      try {
        const [trendingKeywords, trendingPhrases] = await Promise.all([
          this.getTrendingKeywords(),
          this.getTrendingPhrases()
        ])

        // Get popular genres
        const { data: genreData } = await supabase
          .from('artworks')
          .select('genre')
          .not('genre', 'is', null)
          .eq('status', 'available')

        const genreCounts = new Map<string, number>()
        genreData?.forEach(artwork => {
          if (artwork.genre) {
            const genre = artwork.genre.toLowerCase().trim()
            genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1)
          }
        })

        const popularGenres = Array.from(genreCounts.entries())
          .map(([genre, count]) => ({ genre, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)

        // Get popular mediums
        const { data: mediumData } = await supabase
          .from('artworks')
          .select('medium')
          .not('medium', 'is', null)
          .eq('status', 'available')

        const mediumCounts = new Map<string, number>()
        mediumData?.forEach(artwork => {
          if (artwork.medium) {
            const medium = artwork.medium.toLowerCase().trim()
            mediumCounts.set(medium, (mediumCounts.get(medium) || 0) + 1)
          }
        })

        const popularMediums = Array.from(mediumCounts.entries())
          .map(([medium, count]) => ({ medium, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)

        // Get emerging artists (artists with recent artworks)
        const { data: artistData } = await supabase
          .from('profiles')
          .select(`
            id, display_name, full_name, slug,
            artworks!artworks_user_id_fkey(id, created_at)
          `)
          .eq('role', 'ARTIST')
          .not('display_name', 'is', null)

        const emergingArtists = artistData
          ?.map(artist => ({
            name: artist.display_name || artist.full_name || 'Unknown Artist',
            slug: artist.slug || '',
            artworkCount: artist.artworks?.length || 0
          }))
          .filter(artist => artist.artworkCount > 0)
          .sort((a, b) => b.artworkCount - a.artworkCount)
          .slice(0, 8) || []

        // Generate real seasonal trends based on actual data
        const seasonalTrends = await this.generateSeasonalTrends()

        return {
          trendingKeywords,
          trendingPhrases,
          popularGenres,
          popularMediums,
          emergingArtists,
          seasonalTrends
        }
      } catch (error) {
        console.error('Error fetching search insights:', error)
        return {
          trendingKeywords: [],
          trendingPhrases: [],
          popularGenres: [],
          popularMediums: [],
          emergingArtists: [],
          seasonalTrends: []
        }
      }
    })
  }

  async searchSuggestions(query: string): Promise<string[]> {
    if (query.length < 2) return []

    try {
      const insights = await this.getSearchInsights()
      const suggestions: string[] = []

      // Add matching keywords
      insights.trendingKeywords
        .filter(keyword => keyword.term.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5)
        .forEach(keyword => suggestions.push(keyword.term))

      // Add matching phrases
      insights.trendingPhrases
        .filter(phrase => phrase.phrase.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 3)
        .forEach(phrase => suggestions.push(phrase.phrase))

      // Add matching genres
      insights.popularGenres
        .filter(genre => genre.genre.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 3)
        .forEach(genre => suggestions.push(genre.genre))

      // Add matching mediums
      insights.popularMediums
        .filter(medium => medium.medium.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 2)
        .forEach(medium => suggestions.push(medium.medium))

      return [...new Set(suggestions)].slice(0, 10)
    } catch (error) {
      console.error('Error generating search suggestions:', error)
      return []
    }
  }

  private async generateSeasonalTrends(): Promise<{ term: string; seasonal: boolean; peakMonths: string[] }[]> {
    try {
      // Get artwork data with creation dates
      const { data: artworkData } = await supabase
        .from('artworks')
        .select('created_at, genre, medium, subject, title, description')
        .eq('status', 'available')
        .not('created_at', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1000)

      if (!artworkData || artworkData.length === 0) {
        return this.getDefaultSeasonalTrends()
      }

      // Analyze seasonal patterns
      const seasonalPatterns = this.analyzeSeasonalPatterns(artworkData)
      
      // Generate seasonal trends based on patterns
      const trends = this.generateTrendsFromPatterns(seasonalPatterns)
      
      return trends.length > 0 ? trends : this.getDefaultSeasonalTrends()
    } catch (error) {
      console.error('Error generating seasonal trends:', error)
      return this.getDefaultSeasonalTrends()
    }
  }

  private analyzeSeasonalPatterns(artworkData: any[]): Map<string, Map<string, number>> {
    const patterns = new Map<string, Map<string, number>>()
    
    // Initialize patterns for common art terms
    const artTerms = ['abstract', 'landscape', 'portrait', 'still life', 'nature', 'urban', 'colorful', 'minimalist', 'expressionist', 'realistic']
    
    artTerms.forEach(term => {
      patterns.set(term, new Map())
      for (let month = 0; month < 12; month++) {
        patterns.get(term)!.set(month.toString(), 0)
      }
    })

    // Analyze each artwork
    artworkData.forEach(artwork => {
      const createdAt = new Date(artwork.created_at)
      const month = createdAt.getMonth()
      
      // Check title and description for seasonal terms
      const text = `${artwork.title || ''} ${artwork.description || ''}`.toLowerCase()
      
      // Check genre, medium, subject
      const genre = artwork.genre?.toLowerCase() || ''
      const medium = artwork.medium?.toLowerCase() || ''
      const subject = artwork.subject?.toLowerCase() || ''
      
      // Analyze seasonal patterns
      this.analyzeTextForSeasonalTerms(text, month, patterns)
      this.analyzeTextForSeasonalTerms(genre, month, patterns)
      this.analyzeTextForSeasonalTerms(medium, month, patterns)
      this.analyzeTextForSeasonalTerms(subject, month, patterns)
    })

    return patterns
  }

  private analyzeTextForSeasonalTerms(text: string, month: number, patterns: Map<string, Map<string, number>>): void {
    const seasonalMappings = {
      'spring': { months: [2, 3, 4], terms: ['spring', 'bloom', 'fresh', 'green', 'renewal', 'growth', 'flowers', 'pastel', 'light', 'bright'] },
      'summer': { months: [5, 6, 7], terms: ['summer', 'sun', 'warm', 'hot', 'beach', 'outdoor', 'vibrant', 'energetic', 'bright', 'colorful'] },
      'autumn': { months: [8, 9, 10], terms: ['autumn', 'fall', 'harvest', 'orange', 'red', 'golden', 'warm', 'cozy', 'rustic', 'earthy'] },
      'winter': { months: [11, 0, 1], terms: ['winter', 'cold', 'snow', 'white', 'dark', 'minimal', 'calm', 'peaceful', 'serene', 'monochrome'] }
    }

    // Check for seasonal terms
    Object.entries(seasonalMappings).forEach(([season, data]) => {
      data.terms.forEach(term => {
        if (text.includes(term)) {
          const currentCount = patterns.get(term)?.get(month.toString()) || 0
          patterns.get(term)?.set(month.toString(), currentCount + 1)
        }
      })
    })

    // Check for general art terms
    const artTermMappings = {
      'abstract': ['abstract', 'non-representational', 'geometric', 'minimalist'],
      'landscape': ['landscape', 'nature', 'outdoor', 'scenery', 'environment'],
      'portrait': ['portrait', 'face', 'person', 'character', 'individual'],
      'still life': ['still life', 'objects', 'composition', 'arrangement'],
      'nature': ['nature', 'organic', 'natural', 'biological', 'environmental'],
      'urban': ['urban', 'city', 'street', 'architecture', 'metropolitan'],
      'colorful': ['colorful', 'vibrant', 'bright', 'colorful', 'rainbow'],
      'minimalist': ['minimalist', 'simple', 'clean', 'reduced', 'essential'],
      'expressionist': ['expressionist', 'emotional', 'intense', 'dramatic'],
      'realistic': ['realistic', 'detailed', 'precise', 'accurate', 'lifelike']
    }

    Object.entries(artTermMappings).forEach(([term, keywords]) => {
      keywords.forEach(keyword => {
        if (text.includes(keyword)) {
          const currentCount = patterns.get(term)?.get(month.toString()) || 0
          patterns.get(term)?.set(month.toString(), currentCount + 1)
        }
      })
    })
  }

  private generateTrendsFromPatterns(patterns: Map<string, Map<string, number>>): { term: string; seasonal: boolean; peakMonths: string[] }[] {
    const trends: { term: string; seasonal: boolean; peakMonths: string[] }[] = []
    
    patterns.forEach((monthData, term) => {
      const monthlyCounts = Array.from(monthData.values())
      const totalCount = monthlyCounts.reduce((sum, count) => sum + count, 0)
      
      if (totalCount < 3) return // Skip terms with too few occurrences
      
      // Calculate variance to determine if it's seasonal
      const avg = totalCount / 12
      const variance = monthlyCounts.reduce((sum, count) => sum + Math.pow(count - avg, 2), 0) / 12
      const isSeasonal = variance > avg * 0.5 // High variance indicates seasonality
      
      if (isSeasonal) {
        // Find peak months (months with count > 1.5 * average)
        const peakMonths: string[] = []
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December']
        
        monthData.forEach((count, month) => {
          if (count > avg * 1.5) {
            peakMonths.push(monthNames[parseInt(month)])
          }
        })
        
        if (peakMonths.length > 0 && peakMonths.length < 8) { // Not too broad
          trends.push({
            term,
            seasonal: true,
            peakMonths
          })
        }
      } else {
        // Non-seasonal trend
        trends.push({
          term,
          seasonal: false,
          peakMonths: []
        })
      }
    })

    // Sort by total count and return top trends
    return trends
      .sort((a, b) => {
        const aTotal = patterns.get(a.term) ? Array.from(patterns.get(a.term)!.values()).reduce((sum, count) => sum + count, 0) : 0
        const bTotal = patterns.get(b.term) ? Array.from(patterns.get(b.term)!.values()).reduce((sum, count) => sum + count, 0) : 0
        return bTotal - aTotal
      })
      .slice(0, 10)
  }

  private getDefaultSeasonalTrends(): { term: string; seasonal: boolean; peakMonths: string[] }[] {
    return [
      { term: 'spring colors', seasonal: true, peakMonths: ['March', 'April', 'May'] },
      { term: 'winter landscapes', seasonal: true, peakMonths: ['December', 'January', 'February'] },
      { term: 'summer abstracts', seasonal: true, peakMonths: ['June', 'July', 'August'] },
      { term: 'autumn portraits', seasonal: true, peakMonths: ['September', 'October', 'November'] },
      { term: 'nature art', seasonal: false, peakMonths: [] },
      { term: 'urban scenes', seasonal: false, peakMonths: [] },
      { term: 'abstract art', seasonal: false, peakMonths: [] },
      { term: 'portrait painting', seasonal: false, peakMonths: [] }
    ]
  }

  clearCache(): void {
    this.cache.clear()
  }
}

export const trendingSearchService = new TrendingSearchService()
