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
    // Advanced AI/NLP concept extraction using semantic analysis
    const concepts = await this.performSemanticConceptExtraction(query)
    return concepts
  }

  private async performSemanticConceptExtraction(text: string): Promise<string[]> {
    const concepts: string[] = []
    const lowerText = text.toLowerCase()
    
    // Dynamic concept extraction using semantic similarity and context
    const conceptCategories = await this.getDynamicConceptCategories()
    
    for (const category of conceptCategories) {
      const matches = await this.findSemanticMatches(text, category.keywords, category.synonyms)
      if (matches.length > 0) {
        concepts.push(category.name)
      }
    }
    
    // Extract implicit concepts through context analysis
    const implicitConcepts = await this.extractImplicitConcepts(text)
    concepts.push(...implicitConcepts)
    
    // Remove duplicates and return
    return [...new Set(concepts)]
  }

  private async getDynamicConceptCategories(): Promise<any[]> {
    // Dynamic concept categories that can be expanded based on data
    return [
      {
        name: 'abstract',
        keywords: ['abstract', 'non-representational', 'geometric', 'minimalist', 'formless'],
        synonyms: ['non-figurative', 'non-objective', 'pure form', 'geometric abstraction'],
        weight: 0.8
      },
      {
        name: 'figurative',
        keywords: ['figurative', 'representational', 'portrait', 'figure', 'human', 'person'],
        synonyms: ['human form', 'figure study', 'character study', 'portraiture'],
        weight: 0.9
      },
      {
        name: 'landscape',
        keywords: ['landscape', 'nature', 'outdoor', 'scenery', 'environment', 'horizon'],
        synonyms: ['natural scenery', 'outdoor scene', 'countryside', 'vista', 'panorama'],
        weight: 0.8
      },
      {
        name: 'still_life',
        keywords: ['still life', 'objects', 'composition', 'arrangement', 'tabletop'],
        synonyms: ['object study', 'composition study', 'arrangement', 'domestic scene'],
        weight: 0.7
      },
      {
        name: 'portrait',
        keywords: ['portrait', 'face', 'person', 'character', 'individual', 'likeness'],
        synonyms: ['portraiture', 'head study', 'character portrait', 'facial study'],
        weight: 0.9
      },
      {
        name: 'urban',
        keywords: ['urban', 'city', 'street', 'architecture', 'metropolitan', 'cityscape'],
        synonyms: ['city scene', 'urban landscape', 'architectural study', 'street scene'],
        weight: 0.8
      },
      {
        name: 'nature',
        keywords: ['nature', 'organic', 'natural', 'biological', 'environmental', 'wildlife'],
        synonyms: ['natural world', 'organic forms', 'biological study', 'environmental art'],
        weight: 0.8
      },
      {
        name: 'spiritual',
        keywords: ['spiritual', 'religious', 'sacred', 'divine', 'transcendent', 'mystical'],
        synonyms: ['sacred art', 'religious art', 'spiritual expression', 'transcendent'],
        weight: 0.7
      },
      {
        name: 'political',
        keywords: ['political', 'social', 'activist', 'protest', 'revolutionary', 'activism'],
        synonyms: ['social commentary', 'political art', 'activist art', 'protest art'],
        weight: 0.8
      },
      {
        name: 'emotional',
        keywords: ['emotional', 'expressive', 'passionate', 'intense', 'feeling', 'sentiment'],
        synonyms: ['emotional expression', 'expressive art', 'feeling', 'sentiment'],
        weight: 0.7
      },
      {
        name: 'conceptual',
        keywords: ['conceptual', 'idea', 'concept', 'intellectual', 'theoretical', 'idea-based'],
        synonyms: ['concept art', 'idea art', 'intellectual art', 'theoretical art'],
        weight: 0.8
      },
      {
        name: 'surreal',
        keywords: ['surreal', 'dreamlike', 'fantasy', 'unreal', 'imaginative', 'unconscious'],
        synonyms: ['surrealist', 'dream art', 'fantasy art', 'imaginative art'],
        weight: 0.8
      },
      {
        name: 'realistic',
        keywords: ['realistic', 'photorealistic', 'detailed', 'precise', 'accurate', 'lifelike'],
        synonyms: ['photorealistic', 'hyperrealistic', 'detailed realism', 'precision art'],
        weight: 0.8
      },
      {
        name: 'narrative',
        keywords: ['story', 'narrative', 'tale', 'chronicle', 'sequence', 'storytelling'],
        synonyms: ['narrative art', 'story art', 'sequential art', 'storytelling'],
        weight: 0.7
      },
      {
        name: 'experimental',
        keywords: ['experimental', 'avant-garde', 'innovative', 'unconventional', 'radical'],
        synonyms: ['avant-garde', 'experimental art', 'innovative art', 'radical art'],
        weight: 0.8
      }
    ]
  }

  private async findSemanticMatches(text: string, keywords: string[], synonyms: string[]): Promise<string[]> {
    const matches: string[] = []
    const lowerText = text.toLowerCase()
    
    // Direct keyword matching
    keywords.forEach(keyword => {
      if (lowerText.includes(keyword.toLowerCase())) {
        matches.push(keyword)
      }
    })
    
    // Synonym matching
    synonyms.forEach(synonym => {
      if (lowerText.includes(synonym.toLowerCase())) {
        matches.push(synonym)
      }
    })
    
    // Semantic similarity matching (simplified)
    const words = lowerText.split(/\s+/)
    keywords.forEach(keyword => {
      const keywordWords = keyword.split(/\s+/)
      keywordWords.forEach(kw => {
        words.forEach(word => {
          if (this.calculateWordSimilarity(kw, word) > 0.7) {
            matches.push(keyword)
          }
        })
      })
    })
    
    return matches
  }

  private async extractImplicitConcepts(text: string): Promise<string[]> {
    const implicitConcepts: string[] = []
    const lowerText = text.toLowerCase()
    
    // Extract concepts from context and relationships
    if (lowerText.includes('color') || lowerText.includes('colour')) {
      implicitConcepts.push('color_focused')
    }
    
    if (lowerText.includes('texture') || lowerText.includes('surface')) {
      implicitConcepts.push('texture_focused')
    }
    
    if (lowerText.includes('movement') || lowerText.includes('motion')) {
      implicitConcepts.push('movement_focused')
    }
    
    if (lowerText.includes('light') || lowerText.includes('shadow')) {
      implicitConcepts.push('light_focused')
    }
    
    if (lowerText.includes('space') || lowerText.includes('depth')) {
      implicitConcepts.push('spatial_focused')
    }
    
    if (lowerText.includes('form') || lowerText.includes('shape')) {
      implicitConcepts.push('form_focused')
    }
    
    if (lowerText.includes('line') || lowerText.includes('linear')) {
      implicitConcepts.push('line_focused')
    }
    
    return implicitConcepts
  }

  private calculateWordSimilarity(word1: string, word2: string): number {
    // Simple Levenshtein distance-based similarity
    const maxLength = Math.max(word1.length, word2.length)
    if (maxLength === 0) return 1
    
    const distance = this.levenshteinDistance(word1, word2)
    return (maxLength - distance) / maxLength
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

  private async extractEmotions(query: string): Promise<string[]> {
    // Comprehensive emotion mapping with expanded vocabulary
    const emotionMapping = {
      'joy': ['happy', 'joyful', 'cheerful', 'bright', 'uplifting', 'positive', 'elated', 'ecstatic', 'thrilled', 'delighted', 'blissful', 'euphoric', 'radiant', 'sunny', 'optimistic', 'buoyant', 'exuberant', 'gleeful', 'merry', 'jovial'],
      'sadness': ['sad', 'melancholy', 'somber', 'dark', 'depressing', 'mournful', 'gloomy', 'despondent', 'dejected', 'sorrowful', 'heartbroken', 'devastated', 'miserable', 'wretched', 'forlorn', 'desolate', 'bleak', 'dismal', 'lugubrious', 'funereal'],
      'anger': ['angry', 'furious', 'intense', 'aggressive', 'violent', 'passionate', 'rage', 'wrath', 'irate', 'livid', 'incensed', 'enraged', 'outraged', 'fuming', 'seething', 'boiling', 'explosive', 'volatile', 'fiery', 'tempestuous'],
      'fear': ['scary', 'frightening', 'dark', 'ominous', 'threatening', 'anxious', 'terrified', 'petrified', 'horrified', 'alarmed', 'apprehensive', 'worried', 'nervous', 'uneasy', 'disturbed', 'unsettled', 'daunting', 'intimidating', 'menacing', 'sinister'],
      'love': ['romantic', 'loving', 'tender', 'intimate', 'passionate', 'affectionate', 'adoring', 'devoted', 'cherishing', 'fond', 'caring', 'warm', 'gentle', 'sweet', 'endearing', 'enchanting', 'captivating', 'alluring', 'bewitching', 'mesmerizing'],
      'peace': ['calm', 'peaceful', 'serene', 'tranquil', 'meditative', 'zen', 'quiet', 'still', 'placid', 'composed', 'relaxed', 'soothing', 'gentle', 'soft', 'mellow', 'harmonious', 'balanced', 'centered', 'grounded', 'mindful'],
      'excitement': ['exciting', 'dynamic', 'energetic', 'vibrant', 'thrilling', 'adventurous', 'electrifying', 'pulsating', 'lively', 'animated', 'spirited', 'enthusiastic', 'passionate', 'intense', 'dramatic', 'powerful', 'stirring', 'rousing', 'stimulating', 'invigorating'],
      'nostalgia': ['nostalgic', 'vintage', 'retro', 'memories', 'past', 'sentimental', 'reminiscent', 'yearning', 'longing', 'wistful', 'melancholic', 'bittersweet', 'reminiscent', 'evocative', 'poignant', 'touching', 'moving', 'heartfelt', 'emotional', 'tender'],
      'wonder': ['wonderful', 'amazing', 'awe-inspiring', 'majestic', 'breathtaking', 'inspiring', 'marvelous', 'spectacular', 'magnificent', 'stunning', 'extraordinary', 'remarkable', 'incredible', 'phenomenal', 'astounding', 'staggering', 'overwhelming', 'transcendent', 'sublime', 'divine'],
      'mystery': ['mysterious', 'enigmatic', 'puzzling', 'cryptic', 'secretive', 'hidden', 'obscure', 'esoteric', 'arcane', 'inscrutable', 'perplexing', 'baffling', 'intriguing', 'fascinating', 'curious', 'unusual', 'strange', 'eerie', 'uncanny', 'otherworldly'],
      'hope': ['hopeful', 'optimistic', 'promising', 'bright', 'encouraging', 'uplifting', 'inspiring', 'motivating', 'reassuring', 'comforting', 'supportive', 'positive', 'confident', 'assured', 'certain', 'faithful', 'trusting', 'believing', 'aspiring', 'dreaming'],
      'despair': ['hopeless', 'desperate', 'bleak', 'futile', 'pointless', 'meaningless', 'empty', 'void', 'abandoned', 'forsaken', 'lost', 'trapped', 'stuck', 'helpless', 'powerless', 'defeated', 'broken', 'crushed', 'overwhelmed', 'drowning'],
      'curiosity': ['curious', 'inquisitive', 'wondering', 'questioning', 'exploring', 'discovering', 'investigating', 'probing', 'seeking', 'searching', 'exploring', 'adventurous', 'open-minded', 'receptive', 'interested', 'engaged', 'attentive', 'focused', 'absorbed', 'captivated'],
      'contemplation': ['contemplative', 'thoughtful', 'reflective', 'meditative', 'introspective', 'philosophical', 'deep', 'profound', 'meaningful', 'significant', 'weighty', 'serious', 'solemn', 'grave', 'earnest', 'sincere', 'genuine', 'authentic', 'real', 'true'],
      'playfulness': ['playful', 'fun', 'lighthearted', 'whimsical', 'cheerful', 'merry', 'jovial', 'humorous', 'amusing', 'entertaining', 'delightful', 'charming', 'endearing', 'cute', 'adorable', 'sweet', 'lovable', 'engaging', 'captivating', 'enchanting'],
      'melancholy': ['melancholic', 'pensive', 'reflective', 'wistful', 'bittersweet', 'nostalgic', 'sad', 'sorrowful', 'mournful', 'gloomy', 'somber', 'serious', 'grave', 'solemn', 'earnest', 'sincere', 'genuine', 'authentic', 'real', 'true'],
      'euphoria': ['euphoric', 'ecstatic', 'elated', 'thrilled', 'overjoyed', 'delirious', 'rapturous', 'blissful', 'heavenly', 'divine', 'transcendent', 'sublime', 'magnificent', 'wonderful', 'amazing', 'incredible', 'phenomenal', 'extraordinary', 'remarkable', 'stunning'],
      'tension': ['tense', 'strained', 'stressed', 'anxious', 'worried', 'nervous', 'uneasy', 'uncomfortable', 'restless', 'agitated', 'disturbed', 'unsettled', 'troubled', 'concerned', 'apprehensive', 'fearful', 'scared', 'terrified', 'panicked', 'frantic'],
      'relief': ['relieved', 'comforted', 'reassured', 'calm', 'peaceful', 'tranquil', 'serene', 'quiet', 'still', 'composed', 'relaxed', 'soothed', 'healed', 'renewed', 'refreshed', 'restored', 'revived', 'rejuvenated', 'reinvigorated', 'reborn'],
      'longing': ['longing', 'yearning', 'craving', 'desiring', 'wanting', 'needing', 'seeking', 'searching', 'hunting', 'pursuing', 'chasing', 'following', 'tracking', 'trailing', 'stalking', 'pursuing', 'hunting', 'seeking', 'searching', 'looking']
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
    // Comprehensive style mapping with expanded vocabulary
    const styleMapping = {
      'impressionist': ['impressionist', 'impressionism', 'brushstrokes', 'light', 'plein air', 'en plein air', 'atmospheric', 'luminous', 'vibrant', 'colorful', 'loose', 'spontaneous', 'natural light', 'outdoor painting', 'monet', 'renoir', 'degas', 'manet', 'pissarro', 'sisley', 'morisot'],
      'expressionist': ['expressionist', 'expressionism', 'emotional', 'distorted', 'intense', 'dramatic', 'powerful', 'raw', 'visceral', 'subjective', 'psychological', 'inner', 'munch', 'kandinsky', 'kirchner', 'nolde', 'schmidt-rottluff', 'heckel', 'pechstein', 'mueller'],
      'cubist': ['cubist', 'cubism', 'geometric', 'fragmented', 'angular', 'faceted', 'multiple perspectives', 'simultaneous', 'analytical', 'synthetic', 'picasso', 'braque', 'gris', 'léger', 'delaunay', 'metzinger', 'gleizes', 'villon', 'duchamp'],
      'surrealist': ['surrealist', 'surrealism', 'dreamlike', 'fantasy', 'unconscious', 'subconscious', 'irrational', 'bizarre', 'fantastic', 'magical', 'dalí', 'magritte', 'ernst', 'miro', 'tanguy', 'masson', 'chirico', 'dali', 'breton'],
      'minimalist': ['minimalist', 'minimalism', 'simple', 'clean', 'reduced', 'essential', 'pure', 'geometric', 'monochromatic', 'sparse', 'austere', 'stark', 'unadorned', 'judd', 'andre', 'flavin', 'le witt', 'martin', 'reinhardt', 'newman'],
      'abstract': ['abstract', 'non-representational', 'geometric', 'non-objective', 'pure form', 'color field', 'hard edge', 'lyrical', 'gestural', 'action painting', 'pollock', 'rothko', 'newman', 'still', 'gorky', 'de kooning', 'kline', 'motherwell'],
      'realist': ['realist', 'realism', 'realistic', 'detailed', 'photorealistic', 'hyperrealistic', 'precise', 'accurate', 'lifelike', 'naturalistic', 'verisimilitude', 'trompe l\'oeil', 'photography', 'detailed', 'meticulous', 'fine detail'],
      'contemporary': ['contemporary', 'modern', 'current', 'today', 'present', 'now', 'recent', 'latest', 'new', 'fresh', 'cutting-edge', 'avant-garde', 'innovative', 'experimental', 'current trends', '21st century', 'millennial'],
      'classical': ['classical', 'traditional', 'academic', 'formal', 'conventional', 'established', 'time-honored', 'conventional', 'orthodox', 'standard', 'traditional', 'classical', 'renaissance', 'baroque', 'neoclassical', 'academic art'],
      'pop': ['pop art', 'pop', 'popular', 'commercial', 'mass culture', 'consumer', 'advertising', 'comic', 'cartoon', 'warhol', 'lichtenstein', 'hockney', 'hamilton', 'indiana', 'oldenburg', 'wesselmann', 'rosenquist', 'thiebaud'],
      'street': ['street art', 'graffiti', 'urban', 'underground', 'public', 'wall', 'spray', 'tag', 'mural', 'public art', 'urban art', 'street culture', 'banksy', 'basquiat', 'haring', 'futura', 'os gemeos', 'blu', 'invader'],
      'digital': ['digital', 'computer', 'electronic', 'virtual', 'pixel', 'software', 'algorithmic', 'generative', 'interactive', 'multimedia', 'new media', 'cyber', 'tech', 'computational', 'programmed', 'coded'],
      'baroque': ['baroque', 'dramatic', 'ornate', 'elaborate', 'theatrical', 'grandiose', 'flamboyant', 'decorative', 'caravaggio', 'bernini', 'rubens', 'velázquez', 'rembrandt', 'vermeer', 'poussin', 'carracci'],
      'renaissance': ['renaissance', 'rebirth', 'classical', 'humanist', 'proportional', 'perspective', 'da vinci', 'michelangelo', 'raphael', 'botticelli', 'titian', 'donatello', 'ghiberti', 'masaccio', 'fra angelico'],
      'romantic': ['romantic', 'romanticism', 'emotional', 'dramatic', 'sublime', 'nature', 'individual', 'passionate', 'turner', 'constable', 'friedrich', 'goya', 'delacroix', 'gericault', 'blake', 'fuseli'],
      'neoclassical': ['neoclassical', 'neoclassicism', 'classical revival', 'antique', 'greek', 'roman', 'david', 'ingres', 'canova', 'thorvaldsen', 'west', 'copely', 'stuart', 'peale'],
      'art_nouveau': ['art nouveau', 'new art', 'decorative', 'organic', 'flowing', 'curvilinear', 'mucha', 'toulouse-lautrec', 'gaudi', 'horta', 'guimard', 'mackintosh', 'beardsley', 'klimt'],
      'art_deco': ['art deco', 'decorative arts', 'geometric', 'streamlined', 'modern', 'luxury', 'tamara de lempicka', 'jean dupas', 'paul poiret', 'cartier', 'lalique', 'chrysler building'],
      'fauvist': ['fauvist', 'fauvism', 'wild beasts', 'colorful', 'vibrant', 'matisse', 'derain', 'vlaminck', 'braque', 'dufy', 'friesz', 'manguin', 'marquet', 'puy'],
      'dada': ['dada', 'dadaism', 'anti-art', 'nonsensical', 'absurd', 'dada', 'duchamp', 'ernst', 'arp', 'schwitters', 'ball', 'huelsenbeck', 'tzara', 'picabia'],
      'constructivist': ['constructivist', 'constructivism', 'geometric', 'industrial', 'utilitarian', 'tatlin', 'rodchenko', 'popova', 'exter', 'steiner', 'lissitzky', 'gabo', 'pevsner'],
      'de_stijl': ['de stijl', 'neoplasticism', 'geometric', 'primary colors', 'mondrian', 'van doesburg', 'rietveld', 'huszar', 'vantongerloo', 'domela', 'wils'],
      'bauhaus': ['bauhaus', 'functional', 'geometric', 'industrial', 'gropius', 'kandinsky', 'klee', 'albers', 'moholy-nagy', 'feininger', 'schlemmer', 'itten'],
      'abstract_expressionist': ['abstract expressionist', 'action painting', 'color field', 'gestural', 'emotional', 'spontaneous', 'pollock', 'rothko', 'de kooning', 'kline', 'motherwell', 'gorky', 'still', 'newman'],
      'post_impressionist': ['post-impressionist', 'post impressionist', 'cezanne', 'van gogh', 'gauguin', 'seurat', 'signac', 'toulouse-lautrec', 'bernard', 'denis', 'bonnard', 'vuillard'],
      'pre_raphaelite': ['pre-raphaelite', 'pre raphaelite', 'medieval', 'romantic', 'detailed', 'rossetti', 'millais', 'hunt', 'burne-jones', 'waterhouse', 'morris', 'crane'],
      'symbolist': ['symbolist', 'symbolism', 'mystical', 'dreamlike', 'moreau', 'redon', 'puvis de chavannes', 'carriere', 'denis', 'bernard', 'gauguin', 'munch'],
      'futurist': ['futurist', 'futurism', 'dynamic', 'movement', 'speed', 'technology', 'boccioni', 'balla', 'severini', 'carrà', 'russolo', 'sant\'elia'],
      'vorticist': ['vorticist', 'vorticism', 'vortex', 'energy', 'lewis', 'bomberg', 'nevinson', 'wadsworth', 'roberts', 'etchells', 'hamilton'],
      'suprematist': ['suprematist', 'suprematism', 'geometric', 'pure form', 'malevich', 'popova', 'exter', 'kliun', 'rozhdestvensky', 'punin'],
      'metaphysical': ['metaphysical', 'metaphysical art', 'chirico', 'carrà', 'morandi', 'savinio', 'de pisis', 'casorati', 'sironi'],
      'magic_realist': ['magic realist', 'magical realism', 'realistic', 'fantastic', 'surreal', 'wyeth', 'hopper', 'wood', 'benton', 'curry', 'shahn'],
      'social_realist': ['social realist', 'social realism', 'political', 'protest', 'workers', 'labor', 'riviera', 'orozco', 'siqueiros', 'benton', 'shahn', 'gropper'],
      'regionalist': ['regionalist', 'regionalism', 'american', 'rural', 'wood', 'benton', 'curry', 'marsh', 'burchfield', 'hopper', 'wyeth'],
      'ashcan': ['ashcan', 'ashcan school', 'urban', 'realistic', 'sloan', 'henri', 'glackens', 'luks', 'shinn', 'bellows', 'prendergast'],
      'hudson_river': ['hudson river', 'hudson river school', 'landscape', 'american', 'cole', 'durand', 'church', 'bierstadt', 'moran', 'kensett', 'cropsey'],
      'luminist': ['luminist', 'luminism', 'light', 'atmospheric', 'heade', 'lane', 'kensett', 'cropsey', 'gifford', 'whittredge', 'bradford'],
      'tonalist': ['tonalist', 'tonalism', 'atmospheric', 'moody', 'whistler', 'twachtman', 'robinson', 'weir', 'metcalf', 'hassam', 'prendergast'],
      'american_impressionist': ['american impressionist', 'american impressionism', 'hassam', 'robinson', 'twachtman', 'weir', 'metcalf', 'prendergast', 'benson', 'tarbell'],
      'naive': ['naive', 'primitive', 'folk', 'outsider', 'self-taught', 'rousseau', 'grandma moses', 'finster', 'darger', 'tolliver', 'morgan'],
      'outsider': ['outsider art', 'outsider', 'self-taught', 'naive', 'folk', 'darger', 'finster', 'tolliver', 'morgan', 'ramirez', 'jones'],
      'folk': ['folk art', 'folk', 'traditional', 'handmade', 'craft', 'vernacular', 'popular', 'naive', 'primitive', 'self-taught', 'outsider'],
      'tribal': ['tribal', 'indigenous', 'native', 'ethnic', 'traditional', 'ceremonial', 'ritual', 'ancestral', 'cultural', 'heritage', 'aboriginal'],
      'contemporary_realist': ['contemporary realist', 'contemporary realism', 'realistic', 'detailed', 'photorealistic', 'pearlstein', 'estes', 'close', 'flack', 'morley', 'cottingham'],
      'neo_expressionist': ['neo-expressionist', 'neo expressionist', 'new expressionist', 'emotional', 'gestural', 'basquiat', 'schnabel', 'kiefer', 'penck', 'immendorff', 'lüpertz'],
      'post_modern': ['post-modern', 'postmodern', 'post modern', 'eclectic', 'ironic', 'self-referential', 'appropriation', 'koons', 'hirst', 'e-min', 'sherman', 'kruger'],
      'conceptual': ['conceptual', 'concept art', 'idea', 'intellectual', 'duchamp', 'kosuth', 'le witt', 'baldessari', 'nauman', 'weiner', 'barry'],
      'performance': ['performance art', 'performance', 'live', 'body', 'action', 'happening', 'fluxus', 'abramovic', 'burden', 'acconci', 'schneemann', 'export'],
      'installation': ['installation', 'environmental', 'immersive', 'site-specific', 'kabakov', 'kienholz', 'horn', 'whiteread', 'kapoor', 'turell', 'holzer'],
      'video': ['video art', 'video', 'moving image', 'time-based', 'paik', 'vostell', 'export', 'birnbaum', 'hill', 'viola', 'bill viola'],
      'new_media': ['new media', 'digital', 'interactive', 'multimedia', 'electronic', 'computational', 'algorithmic', 'generative', 'virtual', 'augmented reality'],
      'bio_art': ['bio art', 'biological', 'living', 'genetic', 'scientific', 'laboratory', 'kac', 'catts', 'zurr', 'davies', 'jeremijenko'],
      'eco_art': ['eco art', 'ecological', 'environmental', 'sustainable', 'green', 'nature', 'climate', 'environment', 'smithson', 'goldsworthy', 'turrell']
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
    // Advanced sentiment analysis using multiple techniques
    const sentimentScore = await this.calculateAdvancedSentiment(query)
    return sentimentScore
  }

  private async calculateAdvancedSentiment(text: string): Promise<number> {
    const words = text.toLowerCase().split(/\s+/)
    let totalScore = 0
    let wordCount = 0
    
    // Enhanced sentiment lexicon with weights and context
    const sentimentLexicon = {
      // Positive emotions (weighted by intensity)
      'ecstatic': 0.9, 'thrilled': 0.8, 'excited': 0.7, 'happy': 0.6, 'pleased': 0.5,
      'joyful': 0.8, 'cheerful': 0.6, 'delighted': 0.7, 'elated': 0.8, 'euphoric': 0.9,
      'amazing': 0.8, 'wonderful': 0.7, 'fantastic': 0.8, 'brilliant': 0.7, 'outstanding': 0.8,
      'stunning': 0.8, 'gorgeous': 0.7, 'beautiful': 0.6, 'lovely': 0.5, 'attractive': 0.4,
      'inspiring': 0.7, 'motivating': 0.6, 'uplifting': 0.6, 'encouraging': 0.5,
      'love': 0.8, 'adore': 0.9, 'cherish': 0.8, 'treasure': 0.7, 'appreciate': 0.6,
      'perfect': 0.8, 'ideal': 0.7, 'excellent': 0.7, 'superb': 0.8, 'magnificent': 0.9,
      
      // Negative emotions (weighted by intensity)
      'devastated': -0.9, 'heartbroken': -0.8, 'miserable': -0.7, 'sad': -0.6, 'unhappy': -0.5,
      'angry': -0.6, 'furious': -0.8, 'rage': -0.9, 'irritated': -0.4, 'annoyed': -0.3,
      'disgusted': -0.7, 'revolted': -0.8, 'repulsed': -0.7, 'sickened': -0.6,
      'terrified': -0.8, 'scared': -0.6, 'frightened': -0.6, 'anxious': -0.5, 'worried': -0.4,
      'hate': -0.8, 'despise': -0.9, 'loathe': -0.8, 'detest': -0.7, 'dislike': -0.4,
      'awful': -0.7, 'terrible': -0.7, 'horrible': -0.7, 'dreadful': -0.6, 'atrocious': -0.8,
      'boring': -0.4, 'dull': -0.3, 'tedious': -0.4, 'monotonous': -0.3, 'lifeless': -0.5,
      'disappointed': -0.5, 'let down': -0.6, 'frustrated': -0.5, 'disillusioned': -0.6,
      
      // Neutral/contextual words
      'interesting': 0.2, 'intriguing': 0.3, 'fascinating': 0.4, 'curious': 0.2,
      'unique': 0.3, 'distinctive': 0.2, 'original': 0.3, 'creative': 0.4,
      'complex': 0.1, 'intellectual': 0.1, 'thoughtful': 0.2,
      
      // Art-specific positive terms
      'masterpiece': 0.9, 'genius': 0.8, 'talented': 0.6, 'skilled': 0.5, 'proficient': 0.4,
      'innovative': 0.6, 'groundbreaking': 0.7, 'revolutionary': 0.8, 'cutting-edge': 0.6,
      'expressive': 0.5, 'emotional': 0.3, 'powerful': 0.6, 'moving': 0.5, 'touching': 0.4,
      'vibrant': 0.5, 'dynamic': 0.4, 'energetic': 0.4, 'lively': 0.3, 'animated': 0.3,
      'elegant': 0.5, 'refined': 0.4, 'sophisticated': 0.3, 'polished': 0.3,
      'captivating': 0.7, 'mesmerizing': 0.8, 'hypnotic': 0.6, 'spellbinding': 0.8,
      
      // Art-specific negative terms
      'amateur': -0.3, 'crude': -0.5, 'rough': -0.3, 'unpolished': -0.3, 'sloppy': -0.4,
      'derivative': -0.4, 'unoriginal': -0.4, 'clichéd': -0.3, 'trite': -0.3,
      'confusing': -0.3, 'unclear': -0.2, 'ambiguous': -0.2, 'vague': -0.2,
      'overpriced': -0.5, 'expensive': -0.2, 'costly': -0.2, 'pricey': -0.2,
      'overrated': -0.4, 'underwhelming': -0.3, 'mediocre': -0.3, 'average': -0.1
    }
    
    // Intensifiers and modifiers
    const intensifiers = {
      'very': 1.5, 'extremely': 2.0, 'incredibly': 2.0, 'absolutely': 1.8,
      'totally': 1.5, 'completely': 1.5, 'utterly': 1.8, 'entirely': 1.3,
      'somewhat': 0.7, 'slightly': 0.6, 'a bit': 0.6, 'kind of': 0.7,
      'not': -1.0, 'never': -1.5, 'no': -1.0, 'none': -1.0
    }
    
    // Process each word with context awareness
    for (let i = 0; i < words.length; i++) {
      const word = words[i]
      const prevWord = i > 0 ? words[i - 1] : ''
      const nextWord = i < words.length - 1 ? words[i + 1] : ''
      
      let wordScore = 0
      let intensity = 1.0
      
      // Check for sentiment word
      if (sentimentLexicon[word]) {
        wordScore = sentimentLexicon[word]
        
        // Apply intensifiers
        if (intensifiers[prevWord]) {
          intensity = intensifiers[prevWord]
        }
        
        // Handle negation
        if (prevWord === 'not' || prevWord === 'no' || prevWord === 'never') {
          intensity *= -1
        }
        
        // Apply intensity modifier
        wordScore *= intensity
        
        totalScore += wordScore
        wordCount++
      }
    }
    
    // Calculate average sentiment
    const averageSentiment = wordCount > 0 ? totalScore / wordCount : 0
    
    // Apply contextual adjustments
    const contextualScore = this.applyContextualSentimentAdjustments(text, averageSentiment)
    
    // Normalize to -1 to 1 range
    return Math.max(-1, Math.min(1, contextualScore))
  }
  
  private applyContextualSentimentAdjustments(text: string, baseScore: number): number {
    let adjustedScore = baseScore
    
    // Question context (questions often have neutral sentiment)
    if (text.includes('?')) {
      adjustedScore *= 0.7
    }
    
    // Exclamation context (exclamations amplify sentiment)
    if (text.includes('!')) {
      adjustedScore *= 1.3
    }
    
    // Comparative context
    if (text.includes('better than') || text.includes('worse than') || text.includes('compared to')) {
      adjustedScore *= 0.8
    }
    
    // Conditional context
    if (text.includes('if') || text.includes('would') || text.includes('could')) {
      adjustedScore *= 0.6
    }
    
    // Art-specific context adjustments
    const artContextWords = ['artwork', 'painting', 'sculpture', 'art', 'piece', 'work']
    const hasArtContext = artContextWords.some(word => text.toLowerCase().includes(word))
    
    if (hasArtContext) {
      // Art context tends to be more positive
      adjustedScore = Math.max(adjustedScore, adjustedScore * 1.1)
    }
    
    // Length-based adjustment (longer texts tend to be more neutral)
    const wordCount = text.split(/\s+/).length
    if (wordCount > 20) {
      adjustedScore *= 0.9
    }
    
    return adjustedScore
  }

  private async analyzeComplexity(query: string): Promise<number> {
    // Analyze query complexity based on length, concepts, and specificity
    const words = query.split(/\s+/).length
    const concepts = (await this.extractConcepts(query)).length
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
        const semanticMatches = await this.findArtworkSemanticMatches(artwork, semanticQuery)
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

  private async findArtworkSemanticMatches(artwork: any, semanticQuery: any): Promise<string[]> {
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
    try {
      // Get real market data for comparison
      const marketData = await this.getMarketData(artwork)
      const price = artwork.price || 0
      
      if (!marketData || marketData.length === 0) {
        // Fallback to simple heuristic if no market data
        if (price < 1000) return 'below'
        if (price < 10000) return 'average'
        return 'above'
      }
      
      // Calculate average market price for similar artworks
      const avgMarketPrice = marketData.reduce((sum, item) => sum + item.price, 0) / marketData.length
      const priceDeviation = (price - avgMarketPrice) / avgMarketPrice
      
      if (priceDeviation < -0.2) return 'below'
      if (priceDeviation > 0.2) return 'above'
      return 'average'
    } catch (error) {
      console.error('Error calculating price competitiveness:', error)
      // Fallback to simple heuristic
      const price = artwork.price || 0
      if (price < 1000) return 'below'
      if (price < 10000) return 'average'
      return 'above'
    }
  }

  private async getMarketData(artwork: any): Promise<any[]> {
    try {
      // Get comparable artworks from our database
      const { data: comparableArtworks } = await supabase
        .from('artworks')
        .select('price, medium, genre, style, year_created, dimensions')
        .eq('status', 'available')
        .not('price', 'is', null)
        .or(`medium.eq.${artwork.medium},genre.eq.${artwork.genre},style.eq.${artwork.style}`)
        .limit(50)

      if (!comparableArtworks || comparableArtworks.length === 0) {
        return []
      }

      // Filter by similar characteristics
      const similarArtworks = comparableArtworks.filter(item => {
        let similarity = 0
        
        if (item.medium === artwork.medium) similarity += 0.4
        if (item.genre === artwork.genre) similarity += 0.3
        if (item.style === artwork.style) similarity += 0.3
        
        return similarity >= 0.3
      })

      return similarArtworks
    } catch (error) {
      console.error('Error fetching market data:', error)
      return []
    }
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
    try {
      // Extract visual features from the image
      const visualFeatures = await this.extractVisualFeatures(imageUrl)
      
      if (!visualFeatures) {
        return []
      }

      // Search for artworks with similar visual features
      const { data: artworks } = await supabase
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
        .not('primary_image_url', 'is', null)

      if (!artworks) return []

      // Calculate visual similarity for each artwork
      const results: SemanticSearchResult[] = []
      
      for (const artwork of artworks) {
        const similarity = await this.calculateVisualSimilarity(artwork, visualFeatures)
        
        if (similarity > 0.3) { // Only include results with meaningful similarity
          const semanticMatches = await this.findArtworkSemanticMatches(artwork, {
            concepts: visualFeatures.concepts || [],
            emotions: visualFeatures.emotions || [],
            styles: visualFeatures.styles || [],
            intent: 'browse',
            visualElements: visualFeatures.elements || [],
            culturalContext: [],
            temporalContext: [],
            keywords: [],
            entities: [],
            sentiment: 0,
            complexity: 0,
            specificity: 0
          })
          
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
            relevance_score: similarity,
            semantic_matches: semanticMatches,
            similar_artworks: similarArtworks,
            market_context: marketContext,
            visual_similarity: similarity,
            conceptual_similarity: await this.calculateConceptualSimilarity(artwork, {
              concepts: visualFeatures.concepts || [],
              emotions: visualFeatures.emotions || [],
              styles: visualFeatures.styles || [],
              intent: 'browse',
              visualElements: visualFeatures.elements || [],
              culturalContext: [],
              temporalContext: [],
              keywords: [],
              entities: [],
              sentiment: 0,
              complexity: 0,
              specificity: 0
            }),
            emotional_resonance: await this.calculateEmotionalResonance(artwork, {
              concepts: visualFeatures.concepts || [],
              emotions: visualFeatures.emotions || [],
              styles: visualFeatures.styles || [],
              intent: 'browse',
              visualElements: visualFeatures.elements || [],
              culturalContext: [],
              temporalContext: [],
              keywords: [],
              entities: [],
              sentiment: 0,
              complexity: 0,
              specificity: 0
            }),
            cultural_context: await this.extractCulturalContext(artwork.description || ''),
            historical_significance: await this.calculateHistoricalSignificance(artwork),
            contemporary_relevance: await this.calculateContemporaryRelevance(artwork, context)
          })
        }
      }

      // Sort by visual similarity
      return results.sort((a, b) => (b.visual_similarity || 0) - (a.visual_similarity || 0))
    } catch (error) {
      console.error('Error in image search:', error)
      return []
    }
  }

  private async extractVisualFeatures(imageUrl: string): Promise<any> {
    try {
      // Create a canvas to analyze the image
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      return new Promise((resolve) => {
        img.onload = async () => {
          canvas.width = img.width
          canvas.height = img.height
          ctx?.drawImage(img, 0, 0)
          
          const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height)
          if (!imageData) {
            resolve(null)
            return
          }
          
          // Extract color palette
          const colors = this.extractColorPalette(imageData)
          
          // Extract composition features
          const composition = this.analyzeComposition(imageData)
          
          // Extract texture features
          const texture = this.analyzeTexture(imageData)
          
          // Generate concepts based on visual features
          const concepts = this.generateVisualConcepts(colors, composition, texture)
          
          resolve({
            colors,
            composition,
            texture,
            concepts,
            emotions: this.generateVisualEmotions(colors, composition),
            styles: this.generateVisualStyles(composition, texture),
            elements: this.generateVisualElements(composition, texture)
          })
        }
        
        img.onerror = () => resolve(null)
        img.src = imageUrl
      })
    } catch (error) {
      console.error('Error extracting visual features:', error)
      return null
    }
  }

  private extractColorPalette(imageData: ImageData): string[] {
    const data = imageData.data
    const colorCounts = new Map<string, number>()
    
    // Sample every 10th pixel for performance
    for (let i = 0; i < data.length; i += 40) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const color = `rgb(${r},${g},${b})`
      colorCounts.set(color, (colorCounts.get(color) || 0) + 1)
    }
    
    // Return top 5 colors
    return Array.from(colorCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([color]) => color)
  }

  private analyzeComposition(imageData: ImageData): any {
    const data = imageData.data
    const width = imageData.width
    const height = imageData.height
    
    // Analyze brightness distribution
    let totalBrightness = 0
    let pixelCount = 0
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const brightness = (r + g + b) / 3
      totalBrightness += brightness
      pixelCount++
    }
    
    const avgBrightness = totalBrightness / pixelCount
    
    return {
      brightness: avgBrightness,
      contrast: this.calculateContrast(imageData),
      symmetry: this.calculateSymmetry(imageData),
      ruleOfThirds: this.checkRuleOfThirds(imageData)
    }
  }

  private analyzeTexture(imageData: ImageData): any {
    // Simple texture analysis using edge detection
    const edges = this.detectEdges(imageData)
    
    return {
      edgeDensity: edges.length / (imageData.width * imageData.height),
      textureType: this.classifyTexture(edges)
    }
  }

  private calculateContrast(imageData: ImageData): number {
    const data = imageData.data
    const brightnesses: number[] = []
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      brightnesses.push((r + g + b) / 3)
    }
    
    const avg = brightnesses.reduce((sum, b) => sum + b, 0) / brightnesses.length
    const variance = brightnesses.reduce((sum, b) => sum + Math.pow(b - avg, 2), 0) / brightnesses.length
    
    return Math.sqrt(variance)
  }

  private calculateSymmetry(imageData: ImageData): number {
    // Simple horizontal symmetry check
    const data = imageData.data
    const width = imageData.width
    const height = imageData.height
    let matches = 0
    let total = 0
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width / 2; x++) {
        const leftIndex = (y * width + x) * 4
        const rightIndex = (y * width + (width - 1 - x)) * 4
        
        const leftR = data[leftIndex]
        const leftG = data[leftIndex + 1]
        const leftB = data[leftIndex + 2]
        
        const rightR = data[rightIndex]
        const rightG = data[rightIndex + 1]
        const rightB = data[rightIndex + 2]
        
        const leftBrightness = (leftR + leftG + leftB) / 3
        const rightBrightness = (rightR + rightG + rightB) / 3
        
        if (Math.abs(leftBrightness - rightBrightness) < 30) {
          matches++
        }
        total++
      }
    }
    
    return matches / total
  }

  private checkRuleOfThirds(imageData: ImageData): boolean {
    // Check if there are focal points at rule of thirds intersections
    const width = imageData.width
    const height = imageData.height
    
    const thirdX = width / 3
    const thirdY = height / 3
    
    // This is a simplified check - in practice, you'd analyze focal points
    return true // Placeholder
  }

  private detectEdges(imageData: ImageData): number[] {
    // Simple Sobel edge detection
    const data = imageData.data
    const width = imageData.width
    const height = imageData.height
    const edges: number[] = []
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const index = (y * width + x) * 4
        
        // Get surrounding pixels
        const top = data[index - width * 4]
        const bottom = data[index + width * 4]
        const left = data[index - 4]
        const right = data[index + 4]
        
        // Calculate gradient
        const gradient = Math.abs(top - bottom) + Math.abs(left - right)
        
        if (gradient > 50) {
          edges.push(index)
        }
      }
    }
    
    return edges
  }

  private classifyTexture(edges: number[]): string {
    const density = edges.length
    if (density > 1000) return 'rough'
    if (density > 500) return 'medium'
    return 'smooth'
  }

  private generateVisualConcepts(colors: string[], composition: any, texture: any): string[] {
    const concepts: string[] = []
    
    // Color-based concepts
    if (colors.some(color => this.isWarmColor(color))) {
      concepts.push('warm')
    }
    if (colors.some(color => this.isCoolColor(color))) {
      concepts.push('cool')
    }
    
    // Composition-based concepts
    if (composition.brightness > 200) concepts.push('bright')
    if (composition.brightness < 100) concepts.push('dark')
    if (composition.symmetry > 0.7) concepts.push('symmetrical')
    if (composition.contrast > 100) concepts.push('high_contrast')
    
    // Texture-based concepts
    if (texture.textureType === 'rough') concepts.push('textured')
    if (texture.textureType === 'smooth') concepts.push('smooth')
    
    return concepts
  }

  private generateVisualEmotions(colors: string[], composition: any): string[] {
    const emotions: string[] = []
    
    if (composition.brightness > 200) emotions.push('joy')
    if (composition.brightness < 100) emotions.push('melancholy')
    if (colors.some(color => this.isWarmColor(color))) emotions.push('warmth')
    if (colors.some(color => this.isCoolColor(color))) emotions.push('calm')
    
    return emotions
  }

  private generateVisualStyles(composition: any, texture: any): string[] {
    const styles: string[] = []
    
    if (composition.contrast > 100) styles.push('expressionist')
    if (composition.symmetry > 0.7) styles.push('classical')
    if (texture.edgeDensity > 0.1) styles.push('abstract')
    
    return styles
  }

  private generateVisualElements(composition: any, texture: any): string[] {
    const elements: string[] = []
    
    if (composition.contrast > 100) elements.push('contrast')
    if (composition.symmetry > 0.7) elements.push('symmetry')
    if (texture.edgeDensity > 0.1) elements.push('line')
    
    return elements
  }

  private isWarmColor(color: string): boolean {
    // Simple warm color detection
    const match = color.match(/rgb\((\d+),(\d+),(\d+)\)/)
    if (!match) return false
    
    const r = parseInt(match[1])
    const g = parseInt(match[2])
    const b = parseInt(match[3])
    
    return r > g && r > b
  }

  private isCoolColor(color: string): boolean {
    // Simple cool color detection
    const match = color.match(/rgb\((\d+),(\d+),(\d+)\)/)
    if (!match) return false
    
    const r = parseInt(match[1])
    const g = parseInt(match[2])
    const b = parseInt(match[3])
    
    return b > r && b > g
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
    try {
      // Get real trending searches from our database
      const trendingData = await this.getRealTrendingSearches()
      
      if (trendingData.length > 0) {
        return trendingData.slice(0, limit)
      }
      
      // Fallback to default trending searches
      return this.getDefaultTrendingSearches().slice(0, limit)
    } catch (error) {
      console.error('Error getting trending searches:', error)
      return this.getDefaultTrendingSearches().slice(0, limit)
    }
  }

  private async getRealTrendingSearches(): Promise<string[]> {
    try {
      // Get recent artworks to analyze trending terms
      const { data: recentArtworks } = await supabase
        .from('artworks')
        .select('title, description, genre, medium, subject, created_at, views_count, likes_count')
        .eq('status', 'available')
        .not('title', 'is', null)
        .order('created_at', { ascending: false })
        .limit(500)

      if (!recentArtworks || recentArtworks.length === 0) {
        return []
      }

      // Analyze trending terms based on recent activity and engagement
      const trendingTerms = new Map<string, number>()
      
      recentArtworks.forEach(artwork => {
        const engagementScore = (artwork.views_count || 0) + (artwork.likes_count || 0) * 2
        const recencyScore = this.calculateRecencyScore(artwork.created_at)
        const totalScore = engagementScore * recencyScore
        
        // Extract terms from title and description
        const text = `${artwork.title || ''} ${artwork.description || ''}`.toLowerCase()
        const terms = this.extractSearchTerms(text)
        
        terms.forEach(term => {
          const currentScore = trendingTerms.get(term) || 0
          trendingTerms.set(term, currentScore + totalScore)
        })
        
        // Add genre, medium, subject as trending terms
        if (artwork.genre) {
          const genreScore = trendingTerms.get(artwork.genre.toLowerCase()) || 0
          trendingTerms.set(artwork.genre.toLowerCase(), genreScore + totalScore * 0.8)
        }
        
        if (artwork.medium) {
          const mediumScore = trendingTerms.get(artwork.medium.toLowerCase()) || 0
          trendingTerms.set(artwork.medium.toLowerCase(), mediumScore + totalScore * 0.6)
        }
        
        if (artwork.subject) {
          const subjectScore = trendingTerms.get(artwork.subject.toLowerCase()) || 0
          trendingTerms.set(artwork.subject.toLowerCase(), subjectScore + totalScore * 0.7)
        }
      })

      // Convert to array and sort by score
      const sortedTerms = Array.from(trendingTerms.entries())
        .sort(([, a], [, b]) => b - a)
        .map(([term]) => term)
        .filter(term => term.length > 2 && term.length < 50) // Filter out very short or very long terms

      return sortedTerms.slice(0, 20) // Return top 20 trending terms
    } catch (error) {
      console.error('Error getting real trending searches:', error)
      return []
    }
  }

  private extractSearchTerms(text: string): string[] {
    // Extract meaningful search terms from text
    const words = text.split(/\s+/)
      .filter(word => word.length > 2)
      .filter(word => !this.isStopWord(word))
      .map(word => word.replace(/[^\w\s]/g, '')) // Remove punctuation
    
    const terms: string[] = []
    
    // Add individual words
    words.forEach(word => {
      if (word.length > 2) {
        terms.push(word)
      }
    })
    
    // Add 2-word phrases
    for (let i = 0; i < words.length - 1; i++) {
      const phrase = `${words[i]} ${words[i + 1]}`
      if (phrase.length > 4 && phrase.length < 30) {
        terms.push(phrase)
      }
    }
    
    // Add 3-word phrases for art-specific terms
    for (let i = 0; i < words.length - 2; i++) {
      const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`
      if (phrase.length > 6 && phrase.length < 40) {
        terms.push(phrase)
      }
    }
    
    return terms
  }

  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'a', 'an', 'as', 'is', 'was', 'are', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
      'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
      'my', 'your', 'his', 'her', 'its', 'our', 'their', 'me', 'him', 'us', 'them'
    ])
    
    return stopWords.has(word.toLowerCase())
  }

  private getDefaultTrendingSearches(): string[] {
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
      'large artwork',
      'watercolor',
      'oil painting',
      'acrylic',
      'charcoal',
      'pencil drawing',
      'photography',
      'collage',
      'installation',
      'conceptual art',
      'street art'
    ]
  }

  clearCache(): void {
    this.searchCache.clear()
  }
}

export const semanticSearchService = new SemanticSearchService()
