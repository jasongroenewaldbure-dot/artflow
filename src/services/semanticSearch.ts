import { supabase } from '@/lib/supabase'

export interface SemanticSearchResult {
  id: string
  title: string
  artist_name: string
  description: string
  medium: string
  genre: string
  price: number
  currency: string
  primary_image_url: string
  relevance_score: number
  semantic_matches: string[]
  similar_artworks: string[]
  market_context: {
    trend_score: number
    demand_level: 'low' | 'medium' | 'high'
    price_competitiveness: 'below' | 'average' | 'above'
    rarity_score: number
  }
  visual_similarity?: number
  conceptual_similarity?: number
  emotional_resonance?: number
  cultural_context?: string[]
  historical_significance?: number
  contemporary_relevance?: number
}

export interface SearchFilters {
  price_min?: number
  price_max?: number
  medium?: string[]
  genre?: string[]
  artist?: string[]
  year_from?: number
  year_to?: number
  location?: string
  availability?: boolean
  size_min?: number
  size_max?: number
  color_palette?: string[]
  mood?: string[]
  style?: string[]
  technique?: string[]
  subject_matter?: string[]
  cultural_period?: string[]
  movement?: string[]
  rarity?: 'common' | 'uncommon' | 'rare' | 'very_rare'
  condition?: string[]
  provenance?: string[]
  exhibition_history?: boolean
  awards?: boolean
  publications?: boolean
}

export interface SearchContext {
  user_id?: string
  search_history?: string[]
  preferences?: any
  browsing_behavior?: any
  location?: string
  device?: string
  time_of_day?: string
  season?: string
  current_trends?: string[]
  market_conditions?: any
  social_context?: string[]
  emotional_state?: string
  intent?: 'browse' | 'research' | 'purchase' | 'gift' | 'investment'
  budget_range?: { min: number; max: number }
  timeline?: 'immediate' | 'short_term' | 'long_term'
  collection_goals?: string[]
  space_requirements?: any
  lighting_conditions?: string
  existing_collection?: string[]
  complementary_artworks?: string[]
  conflicting_artworks?: string[]
}

class SemanticSearchService {
  private searchCache = new Map<string, SemanticSearchResult[]>()
  private cacheExpiry = 5 * 60 * 1000 // 5 minutes

  async search(
    query: string,
    filters: SearchFilters = {},
    context: SearchContext = {},
    limit: number = 50
  ): Promise<SemanticSearchResult[]> {
    try {
      const cacheKey = this.generateCacheKey(query, filters, context)
      const cached = this.searchCache.get(cacheKey)
      
      if (cached && Date.now() - (cached as any).timestamp < this.cacheExpiry) {
        return cached
      }

      // Parse the search query for semantic understanding
      const semanticQuery = await this.parseSemanticQuery(query)
      
      // Build the search query
      let searchQuery = supabase
        .from('artworks')
        .select(`
          *,
          profiles!artworks_user_id_fkey(
            name,
            bio,
            location,
            specializations
          )
        `)
        .eq('is_public', true)

      // Apply filters
      if (filters.price_min !== undefined) {
        searchQuery = searchQuery.gte('price', filters.price_min)
      }
      if (filters.price_max !== undefined) {
        searchQuery = searchQuery.lte('price', filters.price_max)
      }
      if (filters.medium && filters.medium.length > 0) {
        searchQuery = searchQuery.in('medium', filters.medium)
      }
      if (filters.genre && filters.genre.length > 0) {
        searchQuery = searchQuery.in('genre', filters.genre)
      }
      if (filters.year_from !== undefined) {
        searchQuery = searchQuery.gte('year_created', filters.year_from)
      }
      if (filters.year_to !== undefined) {
        searchQuery = searchQuery.lte('year_created', filters.year_to)
      }
      if (filters.availability !== undefined) {
        searchQuery = searchQuery.eq('is_for_sale', filters.availability)
      }

      const { data: artworks, error } = await searchQuery.limit(limit * 2) // Get more for better semantic matching

      if (error) throw error

      // Perform semantic analysis and ranking
      const semanticResults = await this.performSemanticAnalysis(
        artworks || [],
        semanticQuery,
        filters,
        context
      )

      // Cache the results
      const resultsWithTimestamp = semanticResults as any
      resultsWithTimestamp.timestamp = Date.now()
      this.searchCache.set(cacheKey, resultsWithTimestamp)

      return semanticResults.slice(0, limit)
    } catch (error) {
      console.error('Error in semantic search:', error)
      return []
    }
  }

  private async parseSemanticQuery(query: string): Promise<any> {
    // Extract key concepts, emotions, styles, and intent from the query
    const concepts = await this.extractConcepts(query)
    const emotions = await this.extractEmotions(query)
    const styles = await this.extractStyles(query)
    const intent = await this.extractIntent(query)
    const visualElements = await this.extractVisualElements(query)
    const culturalContext = await this.extractCulturalContext(query)
    const temporalContext = await this.extractTemporalContext(query)

    return {
      original: query,
      concepts,
      emotions,
      styles,
      intent,
      visualElements,
      culturalContext,
      temporalContext,
      keywords: this.extractKeywords(query),
      entities: await this.extractEntities(query),
      sentiment: await this.analyzeSentiment(query),
      complexity: this.analyzeComplexity(query),
      specificity: this.analyzeSpecificity(query)
    }
  }

  private async extractConcepts(query: string): Promise<string[]> {
    // Use AI/NLP to extract key concepts from the query
    const conceptMapping = {
      'abstract': ['abstraction', 'non-representational', 'geometric', 'minimalist'],
      'figurative': ['figurative', 'representational', 'portrait', 'figure', 'human'],
      'landscape': ['landscape', 'nature', 'outdoor', 'scenery', 'environment'],
      'still life': ['still life', 'objects', 'composition', 'arrangement'],
      'portrait': ['portrait', 'face', 'person', 'character', 'individual'],
      'urban': ['urban', 'city', 'street', 'architecture', 'metropolitan'],
      'nature': ['nature', 'organic', 'natural', 'biological', 'environmental'],
      'spiritual': ['spiritual', 'religious', 'sacred', 'divine', 'transcendent'],
      'political': ['political', 'social', 'activist', 'protest', 'revolutionary'],
      'emotional': ['emotional', 'expressive', 'passionate', 'intense', 'feeling'],
      'conceptual': ['conceptual', 'idea', 'concept', 'intellectual', 'theoretical'],
      'surreal': ['surreal', 'dreamlike', 'fantasy', 'unreal', 'imaginative'],
      'realistic': ['realistic', 'photorealistic', 'detailed', 'precise', 'accurate']
    }

    const concepts: string[] = []
    const lowerQuery = query.toLowerCase()

    for (const [concept, keywords] of Object.entries(conceptMapping)) {
      if (keywords.some(keyword => lowerQuery.includes(keyword))) {
        concepts.push(concept)
      }
    }

    return concepts
  }

  private async extractEmotions(query: string): Promise<string[]> {
    const emotionMapping = {
      'joy': ['happy', 'joyful', 'cheerful', 'bright', 'uplifting', 'positive'],
      'sadness': ['sad', 'melancholy', 'somber', 'dark', 'depressing', 'mournful'],
      'anger': ['angry', 'furious', 'intense', 'aggressive', 'violent', 'passionate'],
      'fear': ['scary', 'frightening', 'dark', 'ominous', 'threatening', 'anxious'],
      'love': ['romantic', 'loving', 'tender', 'intimate', 'passionate', 'affectionate'],
      'peace': ['calm', 'peaceful', 'serene', 'tranquil', 'meditative', 'zen'],
      'excitement': ['exciting', 'dynamic', 'energetic', 'vibrant', 'thrilling', 'adventurous'],
      'nostalgia': ['nostalgic', 'vintage', 'retro', 'memories', 'past', 'sentimental'],
      'wonder': ['wonderful', 'amazing', 'awe-inspiring', 'majestic', 'breathtaking', 'inspiring'],
      'mystery': ['mysterious', 'enigmatic', 'puzzling', 'cryptic', 'secretive', 'hidden']
    }

    const emotions: string[] = []
    const lowerQuery = query.toLowerCase()

    for (const [emotion, keywords] of Object.entries(emotionMapping)) {
      if (keywords.some(keyword => lowerQuery.includes(keyword))) {
        emotions.push(emotion)
      }
    }

    return emotions
  }

  private async extractStyles(query: string): Promise<string[]> {
    const styleMapping = {
      'impressionist': ['impressionist', 'impressionism', 'brushstrokes', 'light'],
      'expressionist': ['expressionist', 'expressionism', 'emotional', 'distorted'],
      'cubist': ['cubist', 'cubism', 'geometric', 'fragmented'],
      'surrealist': ['surrealist', 'surrealism', 'dreamlike', 'fantasy'],
      'minimalist': ['minimalist', 'minimalism', 'simple', 'clean', 'reduced'],
      'abstract': ['abstract', 'non-representational', 'geometric'],
      'realist': ['realist', 'realism', 'realistic', 'detailed'],
      'contemporary': ['contemporary', 'modern', 'current', 'today'],
      'classical': ['classical', 'traditional', 'academic', 'formal'],
      'pop': ['pop art', 'pop', 'popular', 'commercial', 'mass culture'],
      'street': ['street art', 'graffiti', 'urban', 'underground'],
      'digital': ['digital', 'computer', 'electronic', 'virtual']
    }

    const styles: string[] = []
    const lowerQuery = query.toLowerCase()

    for (const [style, keywords] of Object.entries(styleMapping)) {
      if (keywords.some(keyword => lowerQuery.includes(keyword))) {
        styles.push(style)
      }
    }

    return styles
  }

  private async extractIntent(query: string): Promise<string> {
    const intentKeywords = {
      'browse': ['browse', 'look', 'see', 'explore', 'discover'],
      'research': ['research', 'study', 'learn', 'understand', 'analyze'],
      'purchase': ['buy', 'purchase', 'acquire', 'own', 'collect'],
      'gift': ['gift', 'present', 'give', 'surprise'],
      'investment': ['investment', 'invest', 'value', 'appreciate', 'return']
    }

    const lowerQuery = query.toLowerCase()
    
    for (const [intent, keywords] of Object.entries(intentKeywords)) {
      if (keywords.some(keyword => lowerQuery.includes(keyword))) {
        return intent
      }
    }

    return 'browse'
  }

  private async extractVisualElements(query: string): Promise<string[]> {
    const visualMapping = {
      'color': ['color', 'colour', 'hue', 'tone', 'palette', 'bright', 'dark', 'vibrant'],
      'composition': ['composition', 'layout', 'arrangement', 'balance', 'symmetry'],
      'texture': ['texture', 'rough', 'smooth', 'tactile', 'surface'],
      'line': ['line', 'linear', 'curved', 'straight', 'flowing'],
      'form': ['form', 'shape', 'volume', 'mass', 'structure'],
      'space': ['space', 'negative space', 'depth', 'perspective', 'dimension'],
      'light': ['light', 'lighting', 'shadow', 'illumination', 'brightness'],
      'movement': ['movement', 'motion', 'dynamic', 'static', 'flow']
    }

    const elements: string[] = []
    const lowerQuery = query.toLowerCase()

    for (const [element, keywords] of Object.entries(visualMapping)) {
      if (keywords.some(keyword => lowerQuery.includes(keyword))) {
        elements.push(element)
      }
    }

    return elements
  }

  private async extractCulturalContext(query: string): Promise<string[]> {
    const culturalMapping = {
      'african': ['african', 'africa', 'tribal', 'ethnic', 'indigenous'],
      'european': ['european', 'europe', 'western', 'classical', 'renaissance'],
      'asian': ['asian', 'asia', 'oriental', 'eastern', 'zen', 'buddhist'],
      'american': ['american', 'usa', 'contemporary', 'modern'],
      'latin': ['latin', 'hispanic', 'mexican', 'south american'],
      'middle_eastern': ['middle eastern', 'islamic', 'arabic', 'persian'],
      'indigenous': ['indigenous', 'native', 'aboriginal', 'first nations'],
      'contemporary': ['contemporary', 'modern', 'current', 'today']
    }

    const contexts: string[] = []
    const lowerQuery = query.toLowerCase()

    for (const [context, keywords] of Object.entries(culturalMapping)) {
      if (keywords.some(keyword => lowerQuery.includes(keyword))) {
        contexts.push(context)
      }
    }

    return contexts
  }

  private async extractTemporalContext(query: string): Promise<string[]> {
    const temporalMapping = {
      'ancient': ['ancient', 'antique', 'old', 'historical', 'vintage'],
      'medieval': ['medieval', 'middle ages', 'gothic', 'romanesque'],
      'renaissance': ['renaissance', 'classical', 'baroque', 'rococo'],
      'modern': ['modern', 'contemporary', 'current', 'today'],
      'futuristic': ['futuristic', 'futurist', 'avant-garde', 'cutting-edge']
    }

    const contexts: string[] = []
    const lowerQuery = query.toLowerCase()

    for (const [context, keywords] of Object.entries(temporalMapping)) {
      if (keywords.some(keyword => lowerQuery.includes(keyword))) {
        contexts.push(context)
      }
    }

    return contexts
  }

  private extractKeywords(query: string): string[] {
    // Simple keyword extraction - in production, use more sophisticated NLP
    return query.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2)
      .filter(word => !['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'].includes(word))
  }

  private async extractEntities(query: string): Promise<string[]> {
    // Extract named entities like artist names, locations, movements, etc.
    // This would typically use NER (Named Entity Recognition)
    const entities: string[] = []
    
    // Simple pattern matching for now
    const artistPattern = /(?:by|artist|painted by|created by)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi
    const locationPattern = /(?:in|from|at)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi
    const movementPattern = /(impressionism|expressionism|cubism|surrealism|minimalism|pop art|street art)/gi

    let match
    while ((match = artistPattern.exec(query)) !== null) {
      entities.push(match[1])
    }
    while ((match = locationPattern.exec(query)) !== null) {
      entities.push(match[1])
    }
    while ((match = movementPattern.exec(query)) !== null) {
      entities.push(match[1])
    }

    return entities
  }

  private async analyzeSentiment(query: string): Promise<number> {
    // Simple sentiment analysis - in production, use more sophisticated models
    const positiveWords = ['beautiful', 'amazing', 'wonderful', 'stunning', 'gorgeous', 'inspiring', 'love', 'like']
    const negativeWords = ['ugly', 'terrible', 'awful', 'hate', 'dislike', 'boring', 'dull']
    
    const lowerQuery = query.toLowerCase()
    let score = 0
    
    positiveWords.forEach(word => {
      if (lowerQuery.includes(word)) score += 1
    })
    
    negativeWords.forEach(word => {
      if (lowerQuery.includes(word)) score -= 1
    })
    
    return Math.max(-1, Math.min(1, score / 5)) // Normalize to -1 to 1
  }

  private analyzeComplexity(query: string): number {
    // Analyze query complexity based on length, concepts, and specificity
    const words = query.split(/\s+/).length
    const concepts = this.extractConcepts(query).length
    const specificity = this.analyzeSpecificity(query)
    
    return Math.min(1, (words / 20) + (concepts / 10) + specificity)
  }

  private analyzeSpecificity(query: string): number {
    // Analyze how specific the query is
    const specificIndicators = ['exactly', 'precisely', 'specifically', 'only', 'just', 'exact']
    const vagueIndicators = ['something', 'anything', 'some', 'kind of', 'sort of', 'maybe']
    
    const lowerQuery = query.toLowerCase()
    let score = 0
    
    specificIndicators.forEach(indicator => {
      if (lowerQuery.includes(indicator)) score += 0.2
    })
    
    vagueIndicators.forEach(indicator => {
      if (lowerQuery.includes(indicator)) score -= 0.2
    })
    
    return Math.max(0, Math.min(1, 0.5 + score))
  }

  private async performSemanticAnalysis(
    artworks: any[],
    semanticQuery: any,
    filters: SearchFilters,
    context: SearchContext
  ): Promise<SemanticSearchResult[]> {
    const results: SemanticSearchResult[] = []

    for (const artwork of artworks) {
      const relevanceScore = await this.calculateRelevanceScore(artwork, semanticQuery, filters, context)
      
      if (relevanceScore > 0.1) { // Only include results with meaningful relevance
        const semanticMatches = await this.findSemanticMatches(artwork, semanticQuery)
        const similarArtworks = await this.findSimilarArtworks(artwork, artworks)
        const marketContext = await this.analyzeMarketContext(artwork, context)
        
        results.push({
          id: artwork.id,
          title: artwork.title,
          artist_name: artwork.profiles?.name || 'Unknown Artist',
          description: artwork.description,
          medium: artwork.medium,
          genre: artwork.genre,
          price: artwork.price,
          currency: artwork.currency || 'ZAR',
          primary_image_url: artwork.primary_image_url,
          relevance_score: relevanceScore,
          semantic_matches: semanticMatches,
          similar_artworks: similarArtworks,
          market_context: marketContext,
          visual_similarity: await this.calculateVisualSimilarity(artwork, semanticQuery),
          conceptual_similarity: await this.calculateConceptualSimilarity(artwork, semanticQuery),
          emotional_resonance: await this.calculateEmotionalResonance(artwork, semanticQuery),
          cultural_context: await this.extractCulturalContext(artwork.description || ''),
          historical_significance: await this.calculateHistoricalSignificance(artwork),
          contemporary_relevance: await this.calculateContemporaryRelevance(artwork, context)
        })
      }
    }

    // Sort by relevance score
    return results.sort((a, b) => b.relevance_score - a.relevance_score)
  }

  private async calculateRelevanceScore(
    artwork: any,
    semanticQuery: any,
    filters: SearchFilters,
    context: SearchContext
  ): Promise<number> {
    let score = 0
    const weights = {
      title: 0.3,
      description: 0.2,
      medium: 0.15,
      genre: 0.15,
      artist: 0.1,
      concepts: 0.1
    }

    // Title matching
    if (artwork.title) {
      const titleScore = this.calculateTextSimilarity(artwork.title, semanticQuery.original)
      score += titleScore * weights.title
    }

    // Description matching
    if (artwork.description) {
      const descScore = this.calculateTextSimilarity(artwork.description, semanticQuery.original)
      score += descScore * weights.description
    }

    // Medium matching
    if (artwork.medium) {
      const mediumScore = this.calculateTextSimilarity(artwork.medium, semanticQuery.original)
      score += mediumScore * weights.medium
    }

    // Genre matching
    if (artwork.genre) {
      const genreScore = this.calculateTextSimilarity(artwork.genre, semanticQuery.original)
      score += genreScore * weights.genre
    }

    // Artist matching
    if (artwork.profiles?.name) {
      const artistScore = this.calculateTextSimilarity(artwork.profiles.name, semanticQuery.original)
      score += artistScore * weights.artist
    }

    // Concept matching
    const conceptScore = this.calculateConceptMatching(artwork, semanticQuery.concepts)
    score += conceptScore * weights.concepts

    // Apply context-based adjustments
    score = this.applyContextAdjustments(score, artwork, context)

    return Math.min(1, Math.max(0, score))
  }

  private calculateTextSimilarity(text1: string, text2: string): number {
    // Simple text similarity using Jaccard similarity
    const words1 = new Set(text1.toLowerCase().split(/\s+/))
    const words2 = new Set(text2.toLowerCase().split(/\s+/))
    
    const intersection = new Set([...words1].filter(x => words2.has(x)))
    const union = new Set([...words1, ...words2])
    
    return intersection.size / union.size
  }

  private calculateConceptMatching(artwork: any, concepts: string[]): number {
    if (concepts.length === 0) return 0

    const artworkText = `${artwork.title || ''} ${artwork.description || ''} ${artwork.medium || ''} ${artwork.genre || ''}`.toLowerCase()
    
    let matches = 0
    concepts.forEach(concept => {
      if (artworkText.includes(concept.toLowerCase())) {
        matches++
      }
    })

    return matches / concepts.length
  }

  private applyContextAdjustments(score: number, artwork: any, context: SearchContext): number {
    let adjustedScore = score

    // User preference adjustments
    if (context.preferences) {
      // Boost score if artwork matches user preferences
      if (context.preferences.favorite_mediums?.includes(artwork.medium)) {
        adjustedScore *= 1.2
      }
      if (context.preferences.favorite_genres?.includes(artwork.genre)) {
        adjustedScore *= 1.2
      }
    }

    // Budget adjustments
    if (context.budget_range) {
      const price = artwork.price || 0
      if (price >= context.budget_range.min && price <= context.budget_range.max) {
        adjustedScore *= 1.1
      } else if (price > context.budget_range.max) {
        adjustedScore *= 0.8
      }
    }

    // Intent-based adjustments
    if (context.intent === 'investment' && artwork.appreciation_rate > 0) {
      adjustedScore *= 1.3
    }
    if (context.intent === 'gift' && artwork.price <= 1000) {
      adjustedScore *= 1.2
    }

    return adjustedScore
  }

  private async findSemanticMatches(artwork: any, semanticQuery: any): Promise<string[]> {
    const matches: string[] = []
    
    // Check for concept matches
    semanticQuery.concepts.forEach((concept: string) => {
      const artworkText = `${artwork.title || ''} ${artwork.description || ''}`.toLowerCase()
      if (artworkText.includes(concept.toLowerCase())) {
        matches.push(`Concept: ${concept}`)
      }
    })

    // Check for emotion matches
    semanticQuery.emotions.forEach((emotion: string) => {
      const artworkText = `${artwork.title || ''} ${artwork.description || ''}`.toLowerCase()
      if (artworkText.includes(emotion.toLowerCase())) {
        matches.push(`Emotion: ${emotion}`)
      }
    })

    // Check for style matches
    semanticQuery.styles.forEach((style: string) => {
      if (artwork.genre?.toLowerCase().includes(style.toLowerCase()) || 
          artwork.medium?.toLowerCase().includes(style.toLowerCase())) {
        matches.push(`Style: ${style}`)
      }
    })

    return matches
  }

  private async findSimilarArtworks(artwork: any, allArtworks: any[]): Promise<string[]> {
    // Find artworks with similar characteristics
    const similar: string[] = []
    
    allArtworks.forEach(otherArtwork => {
      if (otherArtwork.id === artwork.id) return
      
      let similarity = 0
      
      // Medium similarity
      if (artwork.medium === otherArtwork.medium) similarity += 0.3
      
      // Genre similarity
      if (artwork.genre === otherArtwork.genre) similarity += 0.3
      
      // Price range similarity (within 50% of price)
      if (artwork.price && otherArtwork.price) {
        const priceDiff = Math.abs(artwork.price - otherArtwork.price) / artwork.price
        if (priceDiff < 0.5) similarity += 0.2
      }
      
      // Year similarity (within 10 years)
      if (artwork.year_created && otherArtwork.year_created) {
        const yearDiff = Math.abs(artwork.year_created - otherArtwork.year_created)
        if (yearDiff <= 10) similarity += 0.2
      }
      
      if (similarity > 0.5) {
        similar.push(otherArtwork.id)
      }
    })
    
    return similar.slice(0, 5) // Return top 5 similar artworks
  }

  private async analyzeMarketContext(artwork: any, context: SearchContext): Promise<any> {
    // Analyze market context for the artwork
    const trendScore = await this.calculateTrendScore(artwork)
    const demandLevel = await this.calculateDemandLevel(artwork)
    const priceCompetitiveness = await this.calculatePriceCompetitiveness(artwork)
    const rarityScore = await this.calculateRarityScore(artwork)

    return {
      trend_score: trendScore,
      demand_level: demandLevel,
      price_competitiveness: priceCompetitiveness,
      rarity_score: rarityScore
    }
  }

  private async calculateTrendScore(artwork: any): Promise<number> {
    // Calculate how trendy this artwork is based on views, likes, and recent activity
    const views = artwork.views_count || 0
    const likes = artwork.likes_count || 0
    const inquiries = artwork.inquiries_count || 0
    
    // Simple trend calculation
    const engagement = (likes + inquiries) / Math.max(views, 1)
    const recency = this.calculateRecencyScore(artwork.created_at)
    
    return Math.min(1, (engagement * 0.7) + (recency * 0.3))
  }

  private calculateRecencyScore(createdAt: string): number {
    const now = new Date()
    const created = new Date(createdAt)
    const daysDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
    
    // More recent = higher score, with exponential decay
    return Math.exp(-daysDiff / 30) // 30-day half-life
  }

  private async calculateDemandLevel(artwork: any): Promise<'low' | 'medium' | 'high'> {
    const inquiries = artwork.inquiries_count || 0
    const views = artwork.views_count || 0
    const inquiryRate = views > 0 ? inquiries / views : 0
    
    if (inquiryRate > 0.1) return 'high'
    if (inquiryRate > 0.05) return 'medium'
    return 'low'
  }

  private async calculatePriceCompetitiveness(artwork: any): Promise<'below' | 'average' | 'above'> {
    // This would typically compare against market data
    // For now, use a simple heuristic based on price ranges
    const price = artwork.price || 0
    
    if (price < 1000) return 'below'
    if (price < 10000) return 'average'
    return 'above'
  }

  private async calculateRarityScore(artwork: any): Promise<number> {
    // Calculate rarity based on medium, genre, and other factors
    let score = 0.5 // Base score
    
    // Rare mediums get higher scores
    const rareMediums = ['sculpture', 'installation', 'mixed media', 'digital']
    if (rareMediums.includes(artwork.medium?.toLowerCase())) {
      score += 0.2
    }
    
    // Limited edition or unique works
    if (artwork.edition_info?.is_limited) {
      score += 0.3
    }
    
    return Math.min(1, score)
  }

  private async calculateVisualSimilarity(artwork: any, semanticQuery: any): Promise<number> {
    // This would typically use computer vision to compare images
    // For now, use text-based visual element matching
    const artworkText = `${artwork.title || ''} ${artwork.description || ''}`.toLowerCase()
    const visualElements = semanticQuery.visualElements || []
    
    if (visualElements.length === 0) return 0
    
    let matches = 0
    visualElements.forEach((element: string) => {
      if (artworkText.includes(element.toLowerCase())) {
        matches++
      }
    })
    
    return matches / visualElements.length
  }

  private async calculateConceptualSimilarity(artwork: any, semanticQuery: any): Promise<number> {
    return this.calculateConceptMatching(artwork, semanticQuery.concepts || [])
  }

  private async calculateEmotionalResonance(artwork: any, semanticQuery: any): Promise<number> {
    return this.calculateConceptMatching(artwork, semanticQuery.emotions || [])
  }

  private async calculateHistoricalSignificance(artwork: any): Promise<number> {
    // Calculate historical significance based on various factors
    let score = 0
    
    // Older works are generally more historically significant
    if (artwork.year_created) {
      const age = new Date().getFullYear() - artwork.year_created
      score += Math.min(0.5, age / 100) // Max 0.5 for 100+ year old works
    }
    
    // Exhibition history adds significance
    if (artwork.exhibition_history?.length > 0) {
      score += Math.min(0.3, artwork.exhibition_history.length * 0.1)
    }
    
    // Awards and recognition
    if (artwork.awards?.length > 0) {
      score += Math.min(0.2, artwork.awards.length * 0.1)
    }
    
    return Math.min(1, score)
  }

  private async calculateContemporaryRelevance(artwork: any, context: SearchContext): Promise<number> {
    // Calculate how relevant this artwork is to current trends and context
    let score = 0.5 // Base relevance
    
    // Recent works are more contemporary
    const recency = this.calculateRecencyScore(artwork.created_at)
    score += recency * 0.3
    
    // High engagement indicates contemporary relevance
    const engagement = (artwork.likes_count || 0) + (artwork.inquiries_count || 0)
    if (engagement > 10) score += 0.2
    
    // Match with current trends
    if (context.current_trends) {
      const artworkText = `${artwork.title || ''} ${artwork.description || ''}`.toLowerCase()
      const trendMatches = context.current_trends.filter(trend => 
        artworkText.includes(trend.toLowerCase())
      ).length
      score += (trendMatches / context.current_trends.length) * 0.3
    }
    
    return Math.min(1, score)
  }

  private generateCacheKey(query: string, filters: SearchFilters, context: SearchContext): string {
    return `${query}_${JSON.stringify(filters)}_${JSON.stringify(context)}`
  }

  // Public methods for advanced search features
  async searchByImage(imageUrl: string, filters: SearchFilters = {}, context: SearchContext = {}): Promise<SemanticSearchResult[]> {
    // This would use computer vision to find similar artworks
    // For now, return empty array
    return []
  }

  async searchByMood(mood: string, filters: SearchFilters = {}, context: SearchContext = {}): Promise<SemanticSearchResult[]> {
    return this.search(`artwork that feels ${mood}`, filters, context)
  }

  async searchByColor(color: string, filters: SearchFilters = {}, context: SearchContext = {}): Promise<SemanticSearchResult[]> {
    return this.search(`artwork with ${color} colors`, filters, context)
  }

  async searchByStyle(style: string, filters: SearchFilters = {}, context: SearchContext = {}): Promise<SemanticSearchResult[]> {
    return this.search(`${style} style artwork`, filters, context)
  }

  async getSearchSuggestions(query: string, limit: number = 10): Promise<string[]> {
    // Generate search suggestions based on the query
    const suggestions: string[] = []
    
    // Add concept-based suggestions
    const concepts = await this.extractConcepts(query)
    concepts.forEach(concept => {
      suggestions.push(`${concept} art`)
      suggestions.push(`${concept} painting`)
      suggestions.push(`${concept} sculpture`)
    })
    
    // Add style-based suggestions
    const styles = await this.extractStyles(query)
    styles.forEach(style => {
      suggestions.push(`${style} artwork`)
      suggestions.push(`${style} painting`)
    })
    
    // Add emotion-based suggestions
    const emotions = await this.extractEmotions(query)
    emotions.forEach(emotion => {
      suggestions.push(`${emotion} art`)
      suggestions.push(`artwork that feels ${emotion}`)
    })
    
    return suggestions.slice(0, limit)
  }

  async getTrendingSearches(limit: number = 10): Promise<string[]> {
    // Get trending search terms
    // This would typically come from analytics data
    return [
      'abstract art',
      'contemporary painting',
      'sculpture',
      'digital art',
      'mixed media',
      'portrait',
      'landscape',
      'minimalist',
      'colorful',
      'large artwork'
    ].slice(0, limit)
  }

  clearCache(): void {
    this.searchCache.clear()
  }
}

export const semanticSearchService = new SemanticSearchService()
