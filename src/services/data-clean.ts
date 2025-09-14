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
          artist_name:profiles!artworks_user_id_fkey(name),
          artist_slug:profiles!artworks_user_id_fkey(slug),
          artist_avatar:profiles!artworks_user_id_fkey(avatar_url),
          artist_verified:profiles!artworks_user_id_fkey(is_verified),
          view_count,
          like_count,
          dominant_colors
        `)
        .eq('status', 'available')
        .not('primary_image_url', 'is', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
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
      artist: data.profiles
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
        artist_name:profiles!artworks_user_id_fkey(name),
        artist_slug:profiles!artworks_user_id_fkey(slug),
        artist_avatar:profiles!artworks_user_id_fkey(avatar_url),
        artist_verified:profiles!artworks_user_id_fkey(is_verified),
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
    return data || []
  } catch (error) {
    console.error('Error searching artworks:', error)
    const appError = handleError(error)
    showErrorToast(appError.message)
    throw appError
  }
}
