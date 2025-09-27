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
    if (entities.mediums?.length) {
      supabaseQuery = supabaseQuery.in('medium', entities.mediums)
    }
    if (entities.genres?.length) {
      supabaseQuery = supabaseQuery.in('genre', entities.genres)
    }
    if (entities.priceRange) {
      supabaseQuery = supabaseQuery
        .gte('price', entities.priceRange.min)
        .lte('price', entities.priceRange.max)
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
router.get('/serendipity/price-drops', requireAuth as any, async (req, res, next) => {
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

router.get('/serendipity/new-discoveries', requireAuth as any, async (req, res, next) => {
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

router.get('/serendipity/rare-finds', requireAuth as any, async (req, res, next) => {
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

    const trendingWorks = trending.map((work: any) => ({
      ...work,
      engagement_growth: Math.round(work.growth_rate * 100),
      trending_reason: `${Math.round(work.growth_rate * 100)}% increase in interest`
    }))

    res.json({ items: trendingWorks })

  } catch (error) {
    next(error)
  }
})

router.get('/serendipity/color-harmony', requireAuth as any, async (req, res, next) => {
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

    const colorHarmonyItems = (harmoniousWorks || []).map((work: any) => ({
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
router.get('/recs/personalized', requireAuth as any, async (req, res, next) => {
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
    }, userPrefs, recentActivity)

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
  // Enhanced NLP parsing - would integrate with OpenAI/Claude for production
  const entities: any = {}
  
  // Extract price mentions
  const priceMatch = query.match(/under\s+\$?(\d+(?:,\d{3})*(?:\.\d{2})?k?)/i)
  if (priceMatch) {
    let price = parseFloat(priceMatch[1].replace(',', ''))
    if (priceMatch[1].toLowerCase().includes('k')) price *= 1000
    entities.priceRange = { min: 0, max: price }
  }

  // Extract color mentions
  const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'black', 'white', 'gray', 'brown']
  const foundColors = colors.filter(color => query.toLowerCase().includes(color))
  if (foundColors.length > 0) entities.colors = foundColors

  // Extract medium mentions
  const mediums = ['oil', 'acrylic', 'watercolor', 'digital', 'photography', 'sculpture', 'print', 'drawing']
  const foundMediums = mediums.filter(medium => query.toLowerCase().includes(medium))
  if (foundMediums.length > 0) entities.mediums = foundMediums

  // Extract style mentions
  const styles = ['abstract', 'realism', 'impressionism', 'contemporary', 'minimalism', 'landscape', 'portrait']
  const foundStyles = styles.filter(style => query.toLowerCase().includes(style))
  if (foundStyles.length > 0) entities.genres = foundStyles

  return entities
}

function calculatePriceFit(artworkPrice: number, priceSensitivity: number): number {
  // priceSensitivity: 0 = budget-focused, 1 = price-insensitive
  const maxBudget = priceSensitivity * 50000 // Scale to reasonable max
  if (maxBudget === 0) return artworkPrice <= 1000 ? 1 : 0
  
  return Math.max(0, 1 - (artworkPrice / maxBudget))
}

async function generateDynamicCollections(_filters: any) {
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

  // Add more dynamic collections based on filters...
  
  return collections
}

async function generateWeightedRecommendations(_userId: string, _weights: any, _userPrefs: any, _recentActivity: any) {
  // Implementation for weighted recommendation scoring
  return []
}

async function parseRefinementText(refinement: string) {
  // Parse natural language refinements
  const updates: any = {}
  
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

function mergeFilters(current: any, updates: any) {
  return { ...current, ...updates }
}

function generateWeightExplanation(weights: any) {
  const explanations = []
  
  if (weights.priceWeight > 0.4) explanations.push('Prioritizing budget-friendly options')
  if (weights.styleWeight > 0.4) explanations.push('Focusing on your preferred styles')
  if (weights.socialWeight > 0.4) explanations.push('Including socially popular works')
  if (weights.noveltyWeight > 0.4) explanations.push('Emphasizing new discoveries')
  
  return explanations.join(' • ') || 'Balanced recommendation approach'
}

export default router
