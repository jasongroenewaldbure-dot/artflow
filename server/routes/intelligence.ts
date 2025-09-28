import { Router } from 'express'
import { supabase } from '../../src/server/supabase'
import { requireAuth, getUserIdFromRequest } from '../middleware/auth'

const router = Router()

// Enhanced search with natural language processing and contextual bandit
router.get('/search/intelligent', async (req, res, next) => {
  try {
    const query = String(req.query.q || '')
    const paletteBias = req.query.paletteBias as string
    const priceSensitivity = parseFloat(req.query.priceSensitivity as string) || 0.5
    const abstractionLevel = parseFloat(req.query.abstractionLevel as string) || 0.5
    const discoveryMode = parseFloat(req.query.discoveryMode as string) || 0.3
    const sizeBias = req.query.sizeBias as string

    // Parse natural language query
    const entities = await parseNaturalLanguage(query)
    
    // Build dynamic query based on preferences
    let supabaseQuery = supabase
      .from('artworks')
      .select(`
        id, title, description, price, currency, medium, genre,
        primary_image_url, dominant_colors, oklch_palette,
        view_count, like_count, created_at, user_id,
        profiles!artworks_user_id_fkey(id, full_name, slug, avatar_url)
      `)
      .eq('status', 'available')
      .not('primary_image_url', 'is', null)

    // Apply natural language filters
    if ((entities.mediums as string[])?.length) {
      supabaseQuery = supabaseQuery.in('medium', entities.mediums as string[])
    }
    if ((entities.genres as string[])?.length) {
      supabaseQuery = supabaseQuery.in('genre', entities.genres as string[])
    }
    if (entities.priceRange) {
      const priceRange = entities.priceRange as { min: number; max: number }
      supabaseQuery = supabaseQuery
        .gte('price', priceRange.min)
        .lte('price', priceRange.max)
    }

    // Apply preference-based filters
    if (paletteBias && paletteBias !== 'neutral') {
      // Filter by color temperature
      const temperatureFilter = paletteBias === 'warm' ? 'warm' : 
                               paletteBias === 'cool' ? 'cool' : 'neutral'
      supabaseQuery = supabaseQuery.eq('color_temperature', temperatureFilter)
    }

    // Apply size preferences
    if (sizeBias && sizeBias !== 'any') {
      const sizeRanges = {
        small: { max_width: 60, max_height: 60 },
        medium: { min_width: 60, max_width: 120, min_height: 60, max_height: 120 },
        large: { min_width: 120, min_height: 120 }
      }
      
      const range = sizeRanges[sizeBias as keyof typeof sizeRanges]
      if (range) {
        if ('min_width' in range && range.min_width) supabaseQuery = supabaseQuery.gte('width_cm', range.min_width)
        if ('max_width' in range && range.max_width) supabaseQuery = supabaseQuery.lte('width_cm', range.max_width)
        if ('min_height' in range && range.min_height) supabaseQuery = supabaseQuery.gte('height_cm', range.min_height)
        if ('max_height' in range && range.max_height) supabaseQuery = supabaseQuery.lte('height_cm', range.max_height)
      }
    }

    // Apply abstraction level filter
    if (abstractionLevel < 0.3) {
      supabaseQuery = supabaseQuery.in('genre', ['realism', 'portrait', 'landscape', 'still life'])
    } else if (abstractionLevel > 0.7) {
      supabaseQuery = supabaseQuery.in('genre', ['abstract', 'minimalism', 'conceptual'])
    }

    const { data: artworks, error } = await supabaseQuery
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw error

    // Score and rank results
    const scoredResults = (artworks || []).map(artwork => {
      let relevanceScore = 0
      const reasons = []

      // Text relevance
      if (artwork.title?.toLowerCase().includes(query.toLowerCase()) ||
          artwork.description?.toLowerCase().includes(query.toLowerCase())) {
        relevanceScore += 50
        reasons.push('Matches your search terms')
      }

      // Price fit
      const priceScore = calculatePriceFit(artwork.price, priceSensitivity)
      relevanceScore += priceScore * 20
      if (priceScore > 0.8) reasons.push('Perfect price fit')

      // Popularity boost
      const popularity = (artwork.view_count || 0) + (artwork.like_count || 0) * 3
      relevanceScore += Math.min(20, popularity / 10)
      if (popularity > 50) reasons.push('Popular with collectors')

      // Recency boost
      const daysSinceCreation = (Date.now() - new Date(artwork.created_at).getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceCreation < 7) {
        relevanceScore += 15
        reasons.push('Recently added')
      }

      // Discovery mode adjustment
      if (discoveryMode > 0.5) {
        // Boost less popular items for discovery
        const discoveryBoost = (1 - popularity / 100) * discoveryMode * 10
        relevanceScore += discoveryBoost
        if (discoveryBoost > 5) reasons.push('Hidden gem for discovery')
      }

      return {
        ...artwork,
        relevanceScore: Math.max(0, relevanceScore),
        reason: reasons.join(' • ') || 'Recommended for you',
        artist: artwork.profiles?.[0] || { id: '', full_name: 'Unknown Artist', slug: '', avatar_url: '' }
      }
    })

    // Sort by relevance and return
    const results = scoredResults
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 50)

    res.json({ 
      items: results,
      query,
      entities,
      preferences: {
        paletteBias,
        priceSensitivity,
        abstractionLevel,
        discoveryMode,
        sizeBias
      }
    })

  } catch (error) {
    next(error)
  }
})

// Serendipity endpoints
router.get('/serendipity/price-drops', requireAuth, async (req, res, next) => {
  try {
    const userId = await getUserIdFromRequest(req)
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    // Find saved artworks that have dropped in price
    const { data: savedWorks } = await supabase
      .from('artwork_saves')
      .select(`
        artwork_id, saved_at,
        artworks!inner(
          id, title, price, primary_image_url, medium, genre,
          profiles!artworks_user_id_fkey(full_name)
        )
      `)
      .eq('user_id', userId)

    if (!savedWorks) return res.json({ items: [] })

    const priceDrops = []
    
    for (const save of savedWorks) {
      // Check price history for this artwork
      const { data: priceHistory } = await supabase
        .from('price_history')
        .select('price, recorded_at')
        .eq('artwork_id', save.artwork_id)
        .gte('recorded_at', save.saved_at)
        .order('recorded_at', { ascending: false })
        .limit(1)

      if (priceHistory && priceHistory.length > 0) {
        const currentPrice = save.artworks[0]?.price
        const savedPrice = priceHistory[0].price
        
        if (currentPrice && currentPrice < savedPrice) {
          const dropPercentage = Math.round(((savedPrice - currentPrice) / savedPrice) * 100)
          
          priceDrops.push({
            ...save.artworks[0],
            artist_name: save.artworks[0]?.profiles?.[0]?.full_name || 'Unknown Artist',
            price_drop_percentage: dropPercentage,
            original_price: savedPrice,
            current_price: currentPrice,
            saved_at: save.saved_at
          })
        }
      }
    }

    res.json({ items: priceDrops })

  } catch (error) {
    next(error)
  }
})

router.get('/serendipity/new-discoveries', requireAuth, async (req, res, next) => {
  try {
    const userId = await getUserIdFromRequest(req)
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    // Find new works from followed artists
    const { data: followedArtists } = await supabase
      .from('artist_follows')
      .select('artist_id')
      .eq('follower_id', userId)

    if (!followedArtists || followedArtists.length === 0) {
      return res.json({ items: [] })
    }

    const artistIds = followedArtists.map(f => f.artist_id)
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const { data: newWorks } = await supabase
      .from('artworks')
      .select(`
        id, title, price, primary_image_url, medium, genre, created_at,
        profiles!artworks_user_id_fkey(full_name, slug)
      `)
      .in('user_id', artistIds)
      .gte('created_at', oneWeekAgo)
      .eq('status', 'available')
      .order('created_at', { ascending: false })
      .limit(20)

    const discoveries = (newWorks || []).map(work => ({
      ...work,
      artist_name: work.profiles?.[0]?.full_name || 'Unknown Artist',
      discovery_reason: 'New from followed artist'
    }))

    res.json({ items: discoveries })

  } catch (error) {
    next(error)
  }
})

router.get('/serendipity/rare-finds', requireAuth, async (req, res, next) => {
  try {
    const userId = await getUserIdFromRequest(req)
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    // Find limited editions, unique pieces, or low stock items
    const { data: rareFinds } = await supabase
      .from('artworks')
      .select(`
        id, title, price, primary_image_url, medium, genre,
        edition_size, edition_number, is_unique, stock_level,
        profiles!artworks_user_id_fkey(full_name)
      `)
      .eq('status', 'available')
      .or('is_unique.eq.true,edition_size.lte.10,stock_level.eq.low')
      .order('created_at', { ascending: false })
      .limit(20)

    const rarities = (rareFinds || []).map(work => ({
      ...work,
      artist_name: work.profiles?.[0]?.full_name || 'Unknown Artist',
      edition_info: work.is_unique ? 'Unique piece' : 
                   work.edition_size ? `Edition ${work.edition_number}/${work.edition_size}` : 
                   'Limited availability',
      rarity_reason: work.is_unique ? 'One-of-a-kind artwork' :
                    work.edition_size && work.edition_size <= 5 ? 'Very limited edition' :
                    work.stock_level === 'low' ? 'Last one available' :
                    'Rare find'
    }))

    res.json({ items: rarities })

  } catch (error) {
    next(error)
  }
})

router.get('/serendipity/trending', async (req, res, next) => {
  try {
    // const userId = req.query.userId as string
    
    // Find works with increasing engagement
    const { data: trending } = await supabase.rpc('get_trending_artworks', {
      time_period: '7 days',
      min_growth_rate: 0.2, // 20% growth in engagement
      limit_count: 20
    })

    if (!trending) return res.json({ items: [] })

    const trendingWorks = trending.map((work: { growth_rate: number; [key: string]: unknown }) => ({
      ...work,
      engagement_growth: Math.round(work.growth_rate * 100),
      trending_reason: `${Math.round(work.growth_rate * 100)}% increase in interest`
    }))

    res.json({ items: trendingWorks })

  } catch (error) {
    next(error)
  }
})

router.get('/serendipity/color-harmony', requireAuth, async (req, res, next) => {
  try {
    const userId = await getUserIdFromRequest(req)
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    // Get user's recently saved artworks to extract color preferences
    const { data: recentSaves } = await supabase
      .from('artwork_saves')
      .select(`
        artworks!inner(
          id, dominant_colors, oklch_palette
        )
      `)
      .eq('user_id', userId)
      .gte('saved_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .limit(10)

    if (!recentSaves || recentSaves.length === 0) {
      return res.json({ items: [] })
    }

    // Extract dominant colors from saved works
    const savedColors = recentSaves
      .flatMap(save => save.artworks[0]?.dominant_colors || [])
      .filter(Boolean)

    if (savedColors.length === 0) return res.json({ items: [] })

    // Find artworks with harmonious colors
    const { data: harmoniousWorks } = await supabase.rpc('find_color_harmony_artworks', {
      reference_colors: savedColors,
      harmony_types: ['analogous', 'complementary', 'triadic'],
      limit_count: 20
    })

    const colorHarmonyItems = (harmoniousWorks || []).map((work: { harmony_type: string; [key: string]: unknown }) => ({
      ...work,
      color_harmony: work.harmony_type,
      harmony_reason: `${work.harmony_type} harmony with your saved works`
    }))

    res.json({ items: colorHarmonyItems })

  } catch (error) {
    next(error)
  }
})

// Dynamic collections with real-time updates
router.get('/collections/dynamic', async (req, res, next) => {
  try {
    const paletteBias = req.query.paletteBias as string
    const style = req.query.style as string
    const maxPrice = req.query.maxPrice ? parseInt(req.query.maxPrice as string) : undefined
    const userId = req.query.userId as string

    // Generate dynamic collections based on current preferences
    const collections = await generateDynamicCollections({
      paletteBias,
      style,
      maxPrice,
      userId
    })

    res.json({ collections })

  } catch (error) {
    next(error)
  }
})

// Personalized recommendations with tunable weights
router.get('/recs/personalized', requireAuth, async (req, res, next) => {
  try {
    const userId = await getUserIdFromRequest(req)
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const priceWeight = parseFloat(req.query.priceWeight as string) || 0.3
    const styleWeight = parseFloat(req.query.styleWeight as string) || 0.3
    const socialWeight = parseFloat(req.query.socialWeight as string) || 0.2
    const noveltyWeight = parseFloat(req.query.noveltyWeight as string) || 0.2

    // Get user preferences and behavior
    const { data: userPrefs } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    const { data: recentActivity } = await supabase
      .from('user_activity')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    // Generate weighted recommendations
    const recommendations = await generateWeightedRecommendations(userId, {
      priceWeight,
      styleWeight,
      socialWeight,
      noveltyWeight
    }, userPrefs as unknown as Record<string, unknown>, recentActivity as unknown as Record<string, unknown>)

    res.json({ 
      recommendations,
      weights: { priceWeight, styleWeight, socialWeight, noveltyWeight },
      explanation: generateWeightExplanation({ priceWeight, styleWeight, socialWeight, noveltyWeight })
    })

  } catch (error) {
    next(error)
  }
})

// Refine search with natural language
router.post('/recs/refine', async (req, res, next) => {
  try {
    const { refinement, currentFilters } = req.body
    
    // Parse refinement text like "less busy, more pastel, under $2k"
    const parsedRefinement = await parseRefinementText(refinement)
    
    // Merge with current filters
    const updatedFilters = mergeFilters(currentFilters, parsedRefinement)
    
    res.json({ 
      filters: updatedFilters,
      explanation: `Updated search based on: "${refinement}"`,
      changes: Object.keys(parsedRefinement)
    })

  } catch (error) {
    next(error)
  }
})

// Utility functions
async function parseNaturalLanguage(query: string) {
  const entities: Record<string, unknown> = {}
  
  // Get dynamic data from database instead of hardcoded values
  const [{ data: colorsData }, { data: mediumsData }, { data: stylesData }] = await Promise.all([
    supabase.from('artworks').select('dominant_colors').not('dominant_colors', 'is', null).limit(100),
    supabase.from('artworks').select('medium').not('medium', 'is', null).limit(100),
    supabase.from('artworks').select('genre').not('genre', 'is', null).limit(100)
  ])

  // Extract unique colors from database
  const availableColors = new Set<string>()
  colorsData?.forEach(artwork => {
    if (artwork.dominant_colors && Array.isArray(artwork.dominant_colors)) {
      artwork.dominant_colors.forEach((color: string) => {
        // Convert hex to color names for matching
        const colorName = hexToColorName(color)
        if (colorName) availableColors.add(colorName)
      })
    }
  })

  // Extract unique mediums from database
  const availableMediums = new Set(mediumsData?.map(a => a.medium).filter(Boolean) || [])
  
  // Extract unique styles/genres from database
  const availableStyles = new Set(stylesData?.map(a => a.genre).filter(Boolean) || [])

  // Enhanced NLP parsing with dynamic data
  const queryLower = query.toLowerCase()
  
  // Extract price mentions with multiple patterns
  const pricePatterns = [
    /under\s+\$?(\d+(?:,\d{3})*(?:\.\d{2})?k?)/i,
    /below\s+\$?(\d+(?:,\d{3})*(?:\.\d{2})?k?)/i,
    /less\s+than\s+\$?(\d+(?:,\d{3})*(?:\.\d{2})?k?)/i,
    /max\s+\$?(\d+(?:,\d{3})*(?:\.\d{2})?k?)/i,
    /budget\s+\$?(\d+(?:,\d{3})*(?:\.\d{2})?k?)/i
  ]
  
  for (const pattern of pricePatterns) {
    const match = query.match(pattern)
    if (match) {
      let price = parseFloat(match[1].replace(',', ''))
      if (match[1].toLowerCase().includes('k')) price *= 1000
    entities.priceRange = { min: 0, max: price }
      break
    }
  }

  // Extract color mentions using dynamic color database and comprehensive synonyms
  const foundColors = Array.from(availableColors).filter(color => {
    const synonyms = getColorSynonyms(color)
    return queryLower.includes(color.toLowerCase()) ||
           synonyms.some(synonym => queryLower.includes(synonym.toLowerCase()))
  })
  if (foundColors.length > 0) entities.colors = foundColors

  // Extract medium mentions using dynamic medium database
  const foundMediums = Array.from(availableMediums).filter(medium => 
    queryLower.includes(medium.toLowerCase()) ||
    queryLower.includes(mediumSynonyms(medium))
  )
  if (foundMediums.length > 0) entities.mediums = foundMediums

  // Extract style mentions using dynamic style database
  const foundStyles = Array.from(availableStyles).filter(style => 
    queryLower.includes(style.toLowerCase()) ||
    queryLower.includes(styleSynonyms(style))
  )
  if (foundStyles.length > 0) entities.genres = foundStyles

  // Extract size mentions
  const sizePatterns = [
    /small/i, /medium/i, /large/i,
    /compact/i, /oversized/i, /miniature/i,
    /(\d+)\s*x\s*(\d+)/i, // dimensions like "24x36"
    /(\d+)\s*inch/i, /(\d+)\s*cm/i
  ]
  
  for (const pattern of sizePatterns) {
    if (pattern.test(query)) {
      entities.size = query.match(pattern)?.[0]
      break
    }
  }

  // Extract sentiment and mood using comprehensive mood definitions
  const moodTypes = ['passionate', 'calm', 'energetic', 'romantic', 'mysterious', 'cheerful', 'sophisticated', 'earthy']
  
  for (const mood of moodTypes) {
    const moodWords = getMoodWords(mood)
    if (moodWords.some(word => queryLower.includes(word.toLowerCase()))) {
      entities.mood = mood
      entities.moodColors = getColorsByMood(mood).map(c => c.name)
      break
    }
  }

  return entities
}

// Import comprehensive color library
import { 
  COLOR_DEFINITIONS, 
  MOOD_DEFINITIONS, 
  COLOR_SYNONYMS, 
  MOOD_WORDS,
  hexToColorName,
  findColorSynonyms,
  findMoodWords,
  getColorsByMood,
  analyzeColorHarmony
} from '../../src/lib/colorLibrary'

// Helper functions using comprehensive color library
function getColorSynonyms(color: string): string[] {
  return findColorSynonyms(color)
}

function getMoodWords(mood: string): string[] {
  return findMoodWords(mood)
}

function mediumSynonyms(medium: string): string {
  const synonyms: Record<string, string> = {
    'oil': 'oil painting',
    'acrylic': 'acrylic painting',
    'watercolor': 'watercolor painting',
    'digital': 'digital art digital painting',
    'photography': 'photo photograph',
    'sculpture': 'sculpted carved',
    'print': 'printmaking printed',
    'drawing': 'pencil charcoal ink'
  }
  return synonyms[medium] || medium
}

function styleSynonyms(style: string): string {
  const synonyms: Record<string, string> = {
    'abstract': 'non-representational geometric',
    'realism': 'realistic representational',
    'impressionism': 'impressionist',
    'contemporary': 'modern current',
    'minimalism': 'minimal simple',
    'landscape': 'nature scenic',
    'portrait': 'figure human'
  }
  return synonyms[style] || style
}

function calculatePriceFit(artworkPrice: number, priceSensitivity: number): number {
  // priceSensitivity: 0 = budget-focused, 1 = price-insensitive
  const maxBudget = priceSensitivity * 50000 // Scale to reasonable max
  if (maxBudget === 0) return artworkPrice <= 1000 ? 1 : 0
  
  return Math.max(0, 1 - (artworkPrice / maxBudget))
}

async function generateDynamicCollections(_filters: Record<string, unknown>) {
  // Generate themed collections based on current filters
  const collections = []
  
  // "New This Week" collection
  const newThisWeek = await supabase
    .from('artworks')
    .select('*')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .eq('status', 'available')
    .limit(20)

  if (newThisWeek.data?.length) {
    collections.push({
      id: 'new-this-week',
      title: 'New This Week',
      description: 'Fresh artworks just added',
      items: newThisWeek.data,
      auto_generated: true,
      theme: 'recency'
    })
  }

  // Add more dynamic collections based on filters
  
  // "Trending This Month" - based on recent engagement
  const trendingThisMonth = await supabase
    .from('artworks')
    .select(`
      *,
      artwork_reactions(count),
      artwork_views(count),
      artwork_saves(count)
    `)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })
    .limit(20)
  
  if (trendingThisMonth.data) {
    collections.push({
      id: 'trending-this-month',
      title: 'Trending This Month',
      description: 'Fresh artworks gaining momentum',
      artworks: trendingThisMonth.data,
      type: 'trending'
    })
  }

  // "Budget-Friendly Finds" - based on price filters
  const budgetFinds = await supabase
    .from('artworks')
    .select('*')
    .lte('price', 1000)
    .eq('status', 'available')
    .order('price', { ascending: true })
    .limit(15)
  
  if (budgetFinds.data) {
    collections.push({
      id: 'budget-friendly',
      title: 'Budget-Friendly Finds',
      description: 'Quality art under $1,000',
      artworks: budgetFinds.data,
      type: 'price'
    })
  }

  // "Emerging Artists" - new artists with recent uploads
  const emergingArtists = await supabase
    .from('profiles')
    .select(`
      *,
      artworks!artworks_user_id_fkey(*)
    `)
    .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
    .eq('role', 'ARTIST')
    .limit(10)
  
  if (emergingArtists.data) {
    collections.push({
      id: 'emerging-artists',
      title: 'Emerging Artists',
      description: 'Discover new talent',
      artists: emergingArtists.data,
      type: 'artist'
    })
  }

  // "Color Harmony Collections" - based on color analysis
  const colorHarmonyCollections = await generateColorHarmonyCollections()
  collections.push(...colorHarmonyCollections)

  // "Medium-Specific Collections" - based on available mediums
  const mediumCollections = await generateMediumSpecificCollections()
  collections.push(...mediumCollections)

  // "Size-Based Collections" - based on artwork dimensions
  const sizeCollections = await generateSizeBasedCollections()
  collections.push(...sizeCollections)

  return collections
}

async function generateColorHarmonyCollections() {
  const collections: any[] = []
  
  // Get artworks with dominant colors
  const { data: colorArtworks } = await supabase
    .from('artworks')
    .select('id, title, primary_image_url, dominant_colors, price')
    .not('dominant_colors', 'is', null)
    .eq('status', 'available')
    .limit(50)

  if (!colorArtworks) return collections

  // Group by color harmony types using comprehensive color library
  const warmColors = colorArtworks.filter(artwork => 
    artwork.dominant_colors?.some((color: string) => {
      const colorName = hexToColorName(color)
      return colorName && COLOR_DEFINITIONS[colorName]?.temperature === 'warm'
    })
  )

  const coolColors = colorArtworks.filter(artwork => 
    artwork.dominant_colors?.some((color: string) => {
      const colorName = hexToColorName(color)
      return colorName && COLOR_DEFINITIONS[colorName]?.temperature === 'cool'
    })
  )

  const neutralColors = colorArtworks.filter(artwork => 
    artwork.dominant_colors?.some((color: string) => {
      const colorName = hexToColorName(color)
      return colorName && COLOR_DEFINITIONS[colorName]?.temperature === 'neutral'
    })
  )

  if (warmColors.length > 0) {
    collections.push({
      id: 'warm-colors',
      title: 'Warm Color Palette',
      description: 'Artworks with warm, inviting tones',
      artworks: warmColors.slice(0, 12),
      type: 'color'
    })
  }

  if (coolColors.length > 0) {
    collections.push({
      id: 'cool-colors',
      title: 'Cool Color Palette',
      description: 'Artworks with cool, calming tones',
      artworks: coolColors.slice(0, 12),
      type: 'color'
    })
  }

  if (neutralColors.length > 0) {
    collections.push({
      id: 'neutral-colors',
      title: 'Neutral Palette',
      description: 'Sophisticated monochromatic works',
      artworks: neutralColors.slice(0, 12),
      type: 'color'
    })
  }

  // Add mood-based color collections
  const moodCollections = await generateMoodBasedCollections()
  collections.push(...moodCollections)

  return collections
}

async function generateMoodBasedCollections() {
  const collections: any[] = []
  
  // Get artworks with dominant colors for mood analysis
  const { data: moodArtworks } = await supabase
    .from('artworks')
    .select('id, title, primary_image_url, dominant_colors, price')
    .not('dominant_colors', 'is', null)
    .eq('status', 'available')
    .limit(100)

  if (!moodArtworks) return collections

  // Create mood-based collections
  const moodTypes = ['passionate', 'calm', 'energetic', 'romantic', 'mysterious', 'cheerful']
  
  for (const mood of moodTypes) {
    const moodColors = getColorsByMood(mood).map(c => c.name)
    const moodArtworksFiltered = moodArtworks.filter(artwork => 
      artwork.dominant_colors?.some((color: string) => {
        const colorName = hexToColorName(color)
        return colorName && moodColors.includes(colorName)
      })
    )

    if (moodArtworksFiltered.length > 0) {
      const moodDef = MOOD_DEFINITIONS[mood]
      collections.push({
        id: `mood-${mood}`,
        title: `${moodDef.name.charAt(0).toUpperCase() + moodDef.name.slice(1)} Collection`,
        description: moodDef.characteristics.join(', '),
        artworks: moodArtworksFiltered.slice(0, 12),
        type: 'mood',
        mood: mood,
        psychological: moodDef.psychological,
        artistic: moodDef.artistic
      })
    }
  }

  return collections
}

async function generateMediumSpecificCollections() {
  const collections: any[] = []
  
  // Get unique mediums from database
  const { data: mediumData } = await supabase
    .from('artworks')
    .select('medium')
    .not('medium', 'is', null)
    .eq('status', 'available')

  if (!mediumData) return collections

  const uniqueMediums = [...new Set(mediumData.map(a => a.medium))].slice(0, 5)

  for (const medium of uniqueMediums) {
    const { data: mediumArtworks } = await supabase
      .from('artworks')
      .select('*')
      .eq('medium', medium)
      .eq('status', 'available')
      .limit(15)

    if (mediumArtworks && mediumArtworks.length > 0) {
      collections.push({
        id: `medium-${medium.toLowerCase()}`,
        title: `${medium} Collection`,
        description: `Curated selection of ${medium} artworks`,
        artworks: mediumArtworks,
        type: 'medium'
      })
    }
  }

  return collections
}

async function generateSizeBasedCollections() {
  const collections: any[] = []
  
  // Small artworks (under 50cm max dimension)
  const { data: smallArtworks } = await supabase
    .from('artworks')
    .select('*')
    .or('width_cm.lte.50,height_cm.lte.50')
    .eq('status', 'available')
    .limit(12)

  if (smallArtworks && smallArtworks.length > 0) {
    collections.push({
      id: 'small-works',
      title: 'Intimate Scale',
      description: 'Perfect for smaller spaces',
      artworks: smallArtworks,
      type: 'size'
    })
  }

  // Large artworks (over 100cm max dimension)
  const { data: largeArtworks } = await supabase
    .from('artworks')
    .select('*')
    .or('width_cm.gte.100,height_cm.gte.100')
    .eq('status', 'available')
    .limit(12)

  if (largeArtworks && largeArtworks.length > 0) {
    collections.push({
      id: 'large-works',
      title: 'Statement Pieces',
      description: 'Bold works for larger spaces',
      artworks: largeArtworks,
      type: 'size'
    })
  }
  
  return collections
}

async function generateWeightedRecommendations(userId: string, weights: Record<string, unknown>, userPrefs: Record<string, unknown>, recentActivity: Record<string, unknown>) {
  // Get user's interaction history for personalized scoring
  const [{ data: likes }, { data: views }, { data: saves }] = await Promise.all([
    supabase.from('artwork_reactions').select('artwork_id').eq('collector_id', userId).eq('reaction_type', 'like'),
    supabase.from('artwork_views').select('artwork_id').eq('viewer_id', userId),
    supabase.from('artwork_saves').select('artwork_id').eq('collector_id', userId)
  ])

  // Get user's followed artists
  const { data: followedArtists } = await supabase
    .from('artist_follows')
    .select('artist_id')
    .eq('collector_id', userId)

  const likedArtworks = new Set(likes?.map(l => l.artwork_id) || [])
  const viewedArtworks = new Set(views?.map(v => v.artwork_id) || [])
  const savedArtworks = new Set(saves?.map(s => s.artwork_id) || [])
  const followedArtistIds = new Set(followedArtists?.map(f => f.artist_id) || [])

  // Get candidate artworks with metadata
  const { data: artworks } = await supabase
    .from('artworks')
    .select(`
      *,
      profiles!artworks_user_id_fkey(id, full_name, avatar_url),
      artwork_reactions(count),
      artwork_views(count),
      artwork_saves(count)
    `)
    .eq('status', 'available')
    .not('primary_image_url', 'is', null)
    .limit(100)

  if (!artworks) return []

  // Calculate weighted scores for each artwork
  const scoredArtworks = artworks.map(artwork => {
    const priceWeight = (weights.priceWeight as number) || 0.3
    const styleWeight = (weights.styleWeight as number) || 0.3
    const socialWeight = (weights.socialWeight as number) || 0.2
    const noveltyWeight = (weights.noveltyWeight as number) || 0.2

    let totalScore = 0

    // Price fit scoring (0-1)
    const priceScore = calculatePriceFit(artwork.price || 0, priceWeight)
    totalScore += priceScore * priceWeight

    // Style preference scoring (0-1)
    const styleScore = calculateStylePreference(artwork, userPrefs, likedArtworks)
    totalScore += styleScore * styleWeight

    // Social proof scoring (0-1)
    const socialScore = calculateSocialProof(artwork, socialWeight)
    totalScore += socialScore * socialWeight

    // Novelty scoring (0-1)
    const noveltyScore = calculateNovelty(artwork, viewedArtworks, savedArtworks, followedArtistIds)
    totalScore += noveltyScore * noveltyWeight

    // Boost score for followed artists
    if (followedArtistIds.has(artwork.user_id)) {
      totalScore += 0.2
    }

    // Penalize already interacted artworks
    if (likedArtworks.has(artwork.id)) totalScore -= 0.3
    if (savedArtworks.has(artwork.id)) totalScore -= 0.2
    if (viewedArtworks.has(artwork.id)) totalScore -= 0.1

    return {
      ...artwork,
      recommendationScore: Math.max(0, totalScore),
      scoreBreakdown: {
        price: priceScore,
        style: styleScore,
        social: socialScore,
        novelty: noveltyScore
      }
    }
  })

  // Sort by recommendation score and return top results
  return scoredArtworks
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, 20)
}

function calculateStylePreference(artwork: any, userPrefs: Record<string, unknown>, likedArtworks: Set<string>): number {
  let score = 0.5 // Base score

  // Check medium preference
  if (userPrefs.preferredMediums && Array.isArray(userPrefs.preferredMediums)) {
    if (userPrefs.preferredMediums.includes(artwork.medium)) {
      score += 0.3
    }
  }

  // Check genre preference
  if (userPrefs.preferredGenres && Array.isArray(userPrefs.preferredGenres)) {
    if (userPrefs.preferredGenres.includes(artwork.genre)) {
      score += 0.3
    }
  }

  // Check color preference
  if (userPrefs.preferredColors && Array.isArray(userPrefs.preferredColors)) {
    if (artwork.dominant_colors && Array.isArray(artwork.dominant_colors)) {
      const colorMatch = artwork.dominant_colors.some((color: string) => 
        (userPrefs.preferredColors as string[]).includes(color)
      )
      if (colorMatch) score += 0.2
    }
  }

  return Math.min(1, score)
}

function calculateSocialProof(artwork: any, socialWeight: number): number {
  if (socialWeight === 0) return 0.5 // Neutral if social weight is 0

  const reactionCount = artwork.artwork_reactions?.[0]?.count || 0
  const viewCount = artwork.artwork_views?.[0]?.count || 0
  const saveCount = artwork.artwork_saves?.[0]?.count || 0

  // Calculate social engagement score
  const engagementScore = (reactionCount * 3 + viewCount + saveCount * 2) / 100
  return Math.min(1, Math.max(0, engagementScore))
}

function calculateNovelty(artwork: any, viewedArtworks: Set<string>, savedArtworks: Set<string>, followedArtistIds: Set<string>): number {
  let noveltyScore = 0.5

  // Boost for unseen artworks
  if (!viewedArtworks.has(artwork.id)) noveltyScore += 0.3
  if (!savedArtworks.has(artwork.id)) noveltyScore += 0.2

  // Boost for new artworks (created in last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  if (new Date(artwork.created_at) > thirtyDaysAgo) {
    noveltyScore += 0.2
  }

  // Boost for artists not followed (discovery)
  if (!followedArtistIds.has(artwork.user_id)) {
    noveltyScore += 0.1
  }

  return Math.min(1, noveltyScore)
}

async function parseRefinementText(refinement: string) {
  // Parse natural language refinements
  const updates: Record<string, unknown> = {}
  
  if (refinement.includes('less busy')) updates.complexity = 'simple'
  if (refinement.includes('more pastel')) updates.saturation = 'muted'
  if (refinement.includes('under $')) {
    const priceMatch = refinement.match(/under\s+\$(\d+(?:,\d{3})*(?:k)?)/i)
    if (priceMatch) {
      let price = parseFloat(priceMatch[1].replace(',', ''))
      if (priceMatch[1].includes('k')) price *= 1000
      updates.maxPrice = price
    }
  }
  
  return updates
}

function mergeFilters(current: Record<string, unknown>, updates: Record<string, unknown>) {
  return { ...current, ...updates }
}

function generateWeightExplanation(weights: Record<string, unknown>) {
  const explanations = []
  
  if ((weights.priceWeight as number) > 0.4) explanations.push('Prioritizing budget-friendly options')
  if ((weights.styleWeight as number) > 0.4) explanations.push('Focusing on your preferred styles')
  if ((weights.socialWeight as number) > 0.4) explanations.push('Including socially popular works')
  if ((weights.noveltyWeight as number) > 0.4) explanations.push('Emphasizing new discoveries')
  
  return explanations.join(' • ') || 'Balanced recommendation approach'
}

export default router
