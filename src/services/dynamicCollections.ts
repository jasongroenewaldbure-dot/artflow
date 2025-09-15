import { supabase } from '@/lib/supabase'

export interface Artwork {
  id: string
  title: string
  artist_name: string
  medium: string
  style: string
  primary_image_url?: string
  price?: number
  created_at: string
  tags?: string[]
  color_palette?: string[]
  dimensions?: string
  year?: number
}

export interface DynamicCollection {
  id: string
  name: string
  description: string
  type: 'auto' | 'manual'
  artworks: Artwork[]
  theme: string
  created_at: string
  updated_at: string
  is_auto_generated: boolean
  grouping_criteria: {
    palette?: string[]
    style?: string[]
    medium?: string[]
    price_range?: [number, number]
    artist?: string[]
    time_period?: string
  }
}

export interface CollectionGrouping {
  theme: string
  artworks: Artwork[]
  criteria: {
    palette?: string[]
    style?: string[]
    medium?: string[]
    price_range?: [number, number]
    artist?: string[]
    time_period?: string
  }
  confidence: number
}

class DynamicCollectionsService {
  /**
   * Generate dynamic collections based on user's favorite artworks
   * Uses AI clustering to group artworks by themes, palettes, styles, etc.
   */
  async generateDynamicCollections(userId: string): Promise<DynamicCollection[]> {
    try {
      // Get user's favorite artworks
      const { data: favorites, error: favoritesError } = await supabase
        .from('user_favorites')
        .select(`
          artwork_id,
          artworks (
            id,
            title,
            artist_name,
            medium,
            style,
            primary_image_url,
            price,
            created_at,
            tags,
            color_palette,
            dimensions,
            year
          )
        `)
        .eq('user_id', userId)

      if (favoritesError) throw favoritesError

      const artworks = favorites?.map(fav => fav.artworks).filter(Boolean) as Artwork[] || []

      if (artworks.length === 0) {
        return []
      }

      // Group artworks using AI clustering
      const groupings = await this.clusterArtworks(artworks)

      // Convert groupings to dynamic collections
      const collections: DynamicCollection[] = groupings.map((grouping, index) => ({
        id: `auto-${userId}-${index}-${Date.now()}`,
        name: grouping.theme,
        description: this.generateCollectionDescription(grouping),
        type: 'auto' as const,
        artworks: grouping.artworks,
        theme: grouping.theme,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_auto_generated: true,
        grouping_criteria: grouping.criteria
      }))

      return collections
    } catch (error) {
      console.error('Error generating dynamic collections:', error)
      return []
    }
  }

  /**
   * Cluster artworks using multiple criteria
   */
  private async clusterArtworks(artworks: Artwork[]): Promise<CollectionGrouping[]> {
    const groupings: CollectionGrouping[] = []

    // Group by color palette
    const paletteGroups = this.groupByPalette(artworks)
    groupings.push(...paletteGroups)

    // Group by style
    const styleGroups = this.groupByStyle(artworks)
    groupings.push(...styleGroups)

    // Group by medium
    const mediumGroups = this.groupByMedium(artworks)
    groupings.push(...mediumGroups)

    // Group by price range
    const priceGroups = this.groupByPriceRange(artworks)
    groupings.push(...priceGroups)

    // Group by artist
    const artistGroups = this.groupByArtist(artworks)
    groupings.push(...artistGroups)

    // Group by time period
    const timeGroups = this.groupByTimePeriod(artworks)
    groupings.push(...timeGroups)

    // Filter out groups with too few items and remove duplicates
    return this.deduplicateAndFilter(groupings)
  }

  private groupByPalette(artworks: Artwork[]): CollectionGrouping[] {
    const paletteMap = new Map<string, Artwork[]>()
    
    artworks.forEach(artwork => {
      if (artwork.color_palette && artwork.color_palette.length > 0) {
        const dominantColor = artwork.color_palette[0]
        const paletteFamily = this.getPaletteFamily(dominantColor)
        
        if (!paletteMap.has(paletteFamily)) {
          paletteMap.set(paletteFamily, [])
        }
        paletteMap.get(paletteFamily)!.push(artwork)
      }
    })

    return Array.from(paletteMap.entries())
      .filter(([_, artworks]) => artworks.length >= 2)
      .map(([palette, artworks]) => ({
        theme: `${palette} Palette`,
        artworks,
        criteria: { palette: [palette] },
        confidence: 0.8
      }))
  }

  private groupByStyle(artworks: Artwork[]): CollectionGrouping[] {
    const styleMap = new Map<string, Artwork[]>()
    
    artworks.forEach(artwork => {
      if (artwork.style) {
        const style = artwork.style.toLowerCase()
        if (!styleMap.has(style)) {
          styleMap.set(style, [])
        }
        styleMap.get(style)!.push(artwork)
      }
    })

    return Array.from(styleMap.entries())
      .filter(([_, artworks]) => artworks.length >= 2)
      .map(([style, artworks]) => ({
        theme: `${style.charAt(0).toUpperCase() + style.slice(1)} Collection`,
        artworks,
        criteria: { style: [style] },
        confidence: 0.9
      }))
  }

  private groupByMedium(artworks: Artwork[]): CollectionGrouping[] {
    const mediumMap = new Map<string, Artwork[]>()
    
    artworks.forEach(artwork => {
      if (artwork.medium) {
        const medium = artwork.medium.toLowerCase()
        if (!mediumMap.has(medium)) {
          mediumMap.set(medium, [])
        }
        mediumMap.get(medium)!.push(artwork)
      }
    })

    return Array.from(mediumMap.entries())
      .filter(([_, artworks]) => artworks.length >= 2)
      .map(([medium, artworks]) => ({
        theme: `${medium.charAt(0).toUpperCase() + medium.slice(1)} Works`,
        artworks,
        criteria: { medium: [medium] },
        confidence: 0.85
      }))
  }

  private groupByPriceRange(artworks: Artwork[]): CollectionGrouping[] {
    const priceRanges = [
      { name: 'Under $1,000', min: 0, max: 1000 },
      { name: '$1,000 - $5,000', min: 1000, max: 5000 },
      { name: '$5,000 - $10,000', min: 5000, max: 10000 },
      { name: 'Over $10,000', min: 10000, max: Infinity }
    ]

    return priceRanges
      .map(range => {
        const artworksInRange = artworks.filter(artwork => 
          artwork.price && artwork.price >= range.min && artwork.price < range.max
        )
        return {
          theme: range.name,
          artworks: artworksInRange,
          criteria: { price_range: [range.min, range.max] as [number, number] },
          confidence: 0.7
        }
      })
      .filter(group => group.artworks.length >= 2)
  }

  private groupByArtist(artworks: Artwork[]): CollectionGrouping[] {
    const artistMap = new Map<string, Artwork[]>()
    
    artworks.forEach(artwork => {
      if (artwork.artist_name) {
        const artist = artwork.artist_name
        if (!artistMap.has(artist)) {
          artistMap.set(artist, [])
        }
        artistMap.get(artist)!.push(artwork)
      }
    })

    return Array.from(artistMap.entries())
      .filter(([_, artworks]) => artworks.length >= 2)
      .map(([artist, artworks]) => ({
        theme: `Works by ${artist}`,
        artworks,
        criteria: { artist: [artist] },
        confidence: 0.95
      }))
  }

  private groupByTimePeriod(artworks: Artwork[]): CollectionGrouping[] {
    const currentYear = new Date().getFullYear()
    const periods = [
      { name: 'Recent Works', min: currentYear - 2, max: currentYear },
      { name: 'Contemporary', min: currentYear - 10, max: currentYear },
      { name: 'Modern', min: currentYear - 50, max: currentYear - 10 },
      { name: 'Classic', min: 0, max: currentYear - 50 }
    ]

    return periods
      .map(period => {
        const artworksInPeriod = artworks.filter(artwork => 
          artwork.year && artwork.year >= period.min && artwork.year <= period.max
        )
        return {
          theme: period.name,
          artworks: artworksInPeriod,
          criteria: { time_period: period.name },
          confidence: 0.6
        }
      })
      .filter(group => group.artworks.length >= 2)
  }

  private getPaletteFamily(color: string): string {
    // Simple color family classification
    const colorLower = color.toLowerCase()
    if (colorLower.includes('red') || colorLower.includes('pink')) return 'Warm Reds'
    if (colorLower.includes('blue') || colorLower.includes('cyan')) return 'Cool Blues'
    if (colorLower.includes('green') || colorLower.includes('teal')) return 'Natural Greens'
    if (colorLower.includes('yellow') || colorLower.includes('orange')) return 'Bright Yellows'
    if (colorLower.includes('purple') || colorLower.includes('violet')) return 'Rich Purples'
    if (colorLower.includes('black') || colorLower.includes('gray') || colorLower.includes('grey')) return 'Monochrome'
    if (colorLower.includes('white') || colorLower.includes('cream')) return 'Neutral Whites'
    return 'Mixed Colors'
  }

  private generateCollectionDescription(grouping: CollectionGrouping): string {
    const { theme, artworks, criteria } = grouping
    const count = artworks.length
    
    let description = `A curated collection of ${count} ${theme.toLowerCase()}`
    
    if (criteria.palette) {
      description += ` featuring ${criteria.palette.join(', ')} tones`
    }
    if (criteria.style) {
      description += ` in ${criteria.style.join(', ')} style`
    }
    if (criteria.medium) {
      description += ` using ${criteria.medium.join(', ')}`
    }
    if (criteria.price_range) {
      const [min, max] = criteria.price_range
      if (max === Infinity) {
        description += ` priced over $${min.toLocaleString()}`
      } else {
        description += ` priced between $${min.toLocaleString()} - $${max.toLocaleString()}`
      }
    }
    
    return description + '.'
  }

  private deduplicateAndFilter(groupings: CollectionGrouping[]): CollectionGrouping[] {
    // Remove duplicate artworks across groupings
    const seenArtworks = new Set<string>()
    const filteredGroupings: CollectionGrouping[] = []

    // Sort by confidence and artwork count
    const sortedGroupings = groupings.sort((a, b) => {
      if (a.confidence !== b.confidence) {
        return b.confidence - a.confidence
      }
      return b.artworks.length - a.artworks.length
    })

    for (const grouping of sortedGroupings) {
      const uniqueArtworks = grouping.artworks.filter(artwork => !seenArtworks.has(artwork.id))
      
      if (uniqueArtworks.length >= 2) {
        filteredGroupings.push({
          ...grouping,
          artworks: uniqueArtworks
        })
        
        uniqueArtworks.forEach(artwork => seenArtworks.add(artwork.id))
      }
    }

    return filteredGroupings.slice(0, 6) // Limit to 6 collections
  }

  /**
   * Get user's dynamic collections
   */
  async getUserDynamicCollections(userId: string): Promise<DynamicCollection[]> {
    try {
      const { data, error } = await supabase
        .from('dynamic_collections')
        .select('*')
        .eq('user_id', userId)
        .eq('is_auto_generated', true)
        .order('updated_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching dynamic collections:', error)
      return []
    }
  }

  /**
   * Save dynamic collections to database
   */
  async saveDynamicCollections(userId: string, collections: DynamicCollection[]): Promise<void> {
    try {
      const collectionsToSave = collections.map(collection => ({
        ...collection,
        user_id: userId
      }))

      const { error } = await supabase
        .from('dynamic_collections')
        .upsert(collectionsToSave, { onConflict: 'id' })

      if (error) throw error
    } catch (error) {
      console.error('Error saving dynamic collections:', error)
    }
  }

  /**
   * Refresh dynamic collections for a user
   */
  async refreshDynamicCollections(userId: string): Promise<DynamicCollection[]> {
    const collections = await this.generateDynamicCollections(userId)
    await this.saveDynamicCollections(userId, collections)
    return collections
  }
}

export const dynamicCollectionsService = new DynamicCollectionsService()
