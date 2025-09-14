import { supabase } from '../lib/supabase'
import { handleError, showErrorToast } from '../utils/errorHandling'
import { networkRecovery } from './networkRecovery'

export interface Artwork {
  id: string
  title: string
  description?: string
  year?: number
  medium?: string
  dimensions?: {
    width: number
    height: number
    depth?: number
    unit: string
  }
  price?: number
  currency?: string
  primary_image_url?: string
  images?: Array<{
    id: string
    image_url: string
    is_primary: boolean
  }>
  status?: string
  is_for_sale?: boolean
  is_trending?: boolean
  created_at?: string
  updated_at?: string
  artist?: {
    id: string
    name: string
    slug: string
    full_name?: string
    avatar_url?: string
    is_verified?: boolean
  }
}

export interface ArtworkRow {
  id: string
  title: string
  description?: string
  year?: number
  medium?: string
  genre?: string
  style?: string
  subject?: string
  width_cm?: number
  height_cm?: number
  depth_cm?: number
  price?: number
  currency?: string
  primary_image_url?: string
  status?: string
  is_for_sale?: boolean
  is_trending?: boolean
  created_at?: string
  updated_at?: string
  user_id?: string
  artist_name?: string
  artist_slug?: string
  artist_avatar?: string
  artist_verified?: boolean
  view_count?: number
  like_count?: number
  dominant_colors?: string[]
  dimensions?: {
    width: number
    height: number
    depth?: number
  }
  artist?: {
    id: string
    name: string
    slug: string
    full_name?: string
    avatar_url?: string
    is_verified?: boolean
  }
}

export interface Artist {
  id: string
  name: string
  slug: string
  full_name?: string
  avatar_url?: string
  is_verified?: boolean
  bio?: string
  location?: string
  website?: string
  instagram?: string
  twitter?: string
  created_at?: string
  updated_at?: string
}

export interface Catalogue {
  id: string
  title: string
  description?: string
  artist_id?: string
  created_at: string
  updated_at: string
  cover_image_url?: string
  artist?: Artist
}

// Fetch all artworks with network recovery
export const fetchArtworks = async (): Promise<ArtworkRow[]> => {
  return networkRecovery.executeWithRetry(
    async () => {
      const { data, error } = await supabase
        .from('artworks')
        .select(`
          id,
          title,
          description,
          year,
          medium,
          genre,
          style,
          subject,
          width_cm,
          height_cm,
          depth_cm,
          price,
          currency,
          primary_image_url,
          status,
          is_for_sale,
          is_trending,
          created_at,
          updated_at,
          user_id,
          profiles!inner(
            display_name,
            slug,
            avatar_url,
            is_verified
          )
          view_count,
          like_count,
          dominant_colors
        `)
        .eq('status', 'available')
        .not('primary_image_url', 'is', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Transform the data to match ArtworkRow interface
      return (data || []).map((artwork: any) => ({
        ...artwork,
        artist_name: artwork.profiles?.display_name || 'Unknown Artist',
        artist_slug: artwork.profiles?.slug || '',
        artist_avatar: artwork.profiles?.avatar_url || '',
        artist_verified: artwork.profiles?.is_verified || false,
        profiles: undefined // Remove the profiles object
      }))
    },
    'fetchArtworks',
    {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 5000,
      retryCondition: (error) => {
        return error.code === 'PGRST301' || error.code === 'PGRST116'
      }
    }
  )
}

// Fetch single artwork by ID
export const fetchArtwork = async (id: string): Promise<Artwork | null> => {
  try {
    const { data, error } = await supabase
      .from('artworks')
      .select(`
        id,
        title,
        description,
        year,
        medium,
        genre,
        style,
        subject,
        width_cm,
        height_cm,
        depth_cm,
        price,
        currency,
        primary_image_url,
        status,
        is_for_sale,
        is_trending,
        created_at,
        updated_at,
        profiles!artworks_user_id_fkey(
          id,
          full_name,
          slug,
          avatar_url,
          is_verified
        ),
        artwork_images(
          id,
          image_url,
          is_primary
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      year: data.year,
      medium: data.medium,
      dimensions: {
        width: data.width_cm || 0,
        height: data.height_cm || 0,
        depth: data.depth_cm,
        unit: 'cm'
      },
      price: data.price,
      currency: data.currency,
      primary_image_url: data.primary_image_url,
      images: data.artwork_images,
      status: data.status,
      is_for_sale: data.is_for_sale,
      is_trending: data.is_trending,
      created_at: data.created_at,
      updated_at: data.updated_at,
      artist: data.profiles ? (Array.isArray(data.profiles) ? {
        id: (data.profiles[0] as any)?.id || '',
        name: (data.profiles[0] as any)?.display_name || (data.profiles[0] as any)?.name || 'Unknown Artist',
        slug: (data.profiles[0] as any)?.slug || '',
        full_name: (data.profiles[0] as any)?.full_name,
        avatar_url: (data.profiles[0] as any)?.avatar_url,
        is_verified: (data.profiles[0] as any)?.is_verified || false
      } : {
        id: (data.profiles as any).id || '',
        name: (data.profiles as any).display_name || (data.profiles as any).name || 'Unknown Artist',
        slug: (data.profiles as any).slug || '',
        full_name: (data.profiles as any).full_name,
        avatar_url: (data.profiles as any).avatar_url,
        is_verified: (data.profiles as any).is_verified || false
      }) : undefined
    }
  } catch (error) {
    console.error('Error fetching artwork:', error)
    const appError = handleError(error)
    showErrorToast(appError.message)
    throw appError
  }
}

// Search artworks
export const searchArtworks = async (query: string, filters?: any): Promise<ArtworkRow[]> => {
  try {
    let supabaseQuery = supabase
      .from('artworks')
      .select(`
        id,
        title,
        description,
        year,
        medium,
        genre,
        style,
        subject,
        width_cm,
        height_cm,
        depth_cm,
        price,
        currency,
        primary_image_url,
        status,
        is_for_sale,
        is_trending,
        created_at,
        updated_at,
        user_id,
        profiles!inner(
          display_name,
          slug,
          avatar_url,
          is_verified
        )
        view_count,
        like_count,
        dominant_colors
      `)
      .eq('status', 'available')
      .not('primary_image_url', 'is', null)

    if (query) {
      supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%,medium.ilike.%${query}%`)
    }

    if (filters?.medium) {
      supabaseQuery = supabaseQuery.in('medium', filters.medium)
    }

    if (filters?.priceMin) {
      supabaseQuery = supabaseQuery.gte('price', filters.priceMin)
    }

    if (filters?.priceMax) {
      supabaseQuery = supabaseQuery.lte('price', filters.priceMax)
    }

    const { data, error } = await supabaseQuery
      .order('created_at', { ascending: false })

    if (error) throw error
    
    // Transform the data to match ArtworkRow interface
    return (data || []).map((artwork: any) => ({
      ...artwork,
      artist_name: artwork.profiles?.display_name || 'Unknown Artist',
      artist_slug: artwork.profiles?.slug || '',
      artist_avatar: artwork.profiles?.avatar_url || '',
      artist_verified: artwork.profiles?.is_verified || false,
      profiles: undefined // Remove the profiles object
    }))
  } catch (error) {
    console.error('Error searching artworks:', error)
    const appError = handleError(error)
    showErrorToast(appError.message)
    throw appError
  }
}

export const fetchArtistBySlug = async (slug: string): Promise<Artist | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        display_name,
        slug,
        avatar_url,
        bio,
        location,
        website,
        instagram,
        twitter,
        created_at,
        updated_at
      `)
      .eq('slug', slug)
      .eq('role', 'ARTIST')
      .single()

    if (error) throw error

    return data ? {
      id: data.id,
      name: data.display_name || 'Unknown Artist',
      slug: data.slug || '',
      full_name: data.display_name,
      avatar_url: data.avatar_url,
      bio: data.bio,
      location: data.location,
      website: data.website,
      instagram: data.instagram,
      twitter: data.twitter,
      is_verified: false,
      created_at: data.created_at,
      updated_at: data.updated_at
    } : null
  } catch (error) {
    handleError(error, { component: 'fetchArtist', action: 'fetch' })
    return null
  }
}

export const fetchArtworksByUser = async (userId: string, limit: number = 20): Promise<Artwork[]> => {
  try {
    const { data, error } = await supabase
      .from('artworks')
      .select(`
        *,
        profiles!artworks_user_id_fkey (
          id,
          display_name,
          slug,
          avatar_url
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'available')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return (data || []).map(artwork => ({
      id: artwork.id,
      title: artwork.title,
      description: artwork.description,
      year: artwork.year,
      medium: artwork.medium,
      dimensions: artwork.dimensions,
      price: artwork.price,
      currency: artwork.currency,
      primary_image_url: artwork.primary_image_url,
      status: artwork.status,
      is_for_sale: artwork.status === 'available',
      created_at: artwork.created_at,
      updated_at: artwork.updated_at,
      artist: artwork.profiles ? {
        id: artwork.profiles.id,
        name: artwork.profiles.display_name || 'Unknown Artist',
        slug: artwork.profiles.slug || '',
        full_name: artwork.profiles.display_name,
        avatar_url: artwork.profiles.avatar_url
      } : undefined
    }))
  } catch (error) {
    handleError(error, { component: 'fetchArtworks', action: 'fetch' })
    return []
  }
}

export const fetchCatalogueBySlugs = async (artistSlug: string, catalogueSlug: string): Promise<Catalogue | null> => {
  try {
    const { data, error } = await supabase
      .from('catalogues')
      .select(`
        *,
        profiles!catalogues_user_id_fkey (
          id,
          display_name,
          slug,
          avatar_url
        )
      `)
      .eq('slug', catalogueSlug)
      .eq('profiles.slug', artistSlug)
      .single()

    if (error) throw error

    return data ? {
      id: data.id,
      title: data.title,
      description: data.description,
      cover_image_url: data.cover_image_url,
      created_at: data.created_at,
      updated_at: data.updated_at,
      artist: data.profiles ? (Array.isArray(data.profiles) ? {
        id: (data.profiles[0] as any)?.id || '',
        name: (data.profiles[0] as any)?.display_name || (data.profiles[0] as any)?.name || 'Unknown Artist',
        slug: (data.profiles[0] as any)?.slug || '',
        full_name: (data.profiles[0] as any)?.full_name,
        avatar_url: (data.profiles[0] as any)?.avatar_url,
        is_verified: (data.profiles[0] as any)?.is_verified || false
      } : {
        id: (data.profiles as any).id || '',
        name: (data.profiles as any).display_name || (data.profiles as any).name || 'Unknown Artist',
        slug: (data.profiles as any).slug || '',
        full_name: (data.profiles as any).full_name,
        avatar_url: (data.profiles as any).avatar_url,
        is_verified: (data.profiles as any).is_verified || false
      }) : undefined
    } : null
  } catch (error) {
    handleError(error, { component: 'fetchCatalogue', action: 'fetch' })
    return null
  }
}

export const fetchArtworkBySlugs = async (artistSlug: string, artworkSlug: string): Promise<Artwork | null> => {
  try {
    const { data, error } = await supabase
      .from('artworks')
      .select(`
        *,
        profiles!artworks_user_id_fkey (
          id,
          display_name,
          slug,
          avatar_url
        )
      `)
      .eq('slug', artworkSlug)
      .eq('profiles.slug', artistSlug)
      .single()

    if (error) throw error

    return data ? {
      id: data.id,
      title: data.title,
      description: data.description,
      year: data.year,
      medium: data.medium,
      dimensions: data.dimensions,
      price: data.price,
      currency: data.currency,
      primary_image_url: data.primary_image_url,
      status: data.status,
      is_for_sale: data.status === 'available',
      created_at: data.created_at,
      updated_at: data.updated_at,
      artist: data.profiles ? (Array.isArray(data.profiles) ? {
        id: (data.profiles[0] as any)?.id || '',
        name: (data.profiles[0] as any)?.display_name || (data.profiles[0] as any)?.name || 'Unknown Artist',
        slug: (data.profiles[0] as any)?.slug || '',
        full_name: (data.profiles[0] as any)?.full_name,
        avatar_url: (data.profiles[0] as any)?.avatar_url,
        is_verified: (data.profiles[0] as any)?.is_verified || false
      } : {
        id: (data.profiles as any).id || '',
        name: (data.profiles as any).display_name || (data.profiles as any).name || 'Unknown Artist',
        slug: (data.profiles as any).slug || '',
        full_name: (data.profiles as any).full_name,
        avatar_url: (data.profiles as any).avatar_url,
        is_verified: (data.profiles as any).is_verified || false
      }) : undefined
    } : null
  } catch (error) {
    handleError(error, { component: 'fetchArtwork', action: 'fetch' })
    return null
  }
}
