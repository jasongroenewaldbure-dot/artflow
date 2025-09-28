// Sophisticated data fetching inspired by Artsy Force
// Implements advanced caching, optimistic updates, and error recovery

import React from 'react'
import { QueryClient, useQuery, useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from './supabase'
import { logger } from '../services/logger'
import type { 
  Artwork, 
  Artist, 
  SearchFilters, 
  SearchResult, 
  PaginatedResponse,
  // ApiResponse 
} from '../types'

// Advanced Query Client Configuration (Artsy-inspired)
export const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: unknown) => {
        // Don't retry on 4xx errors
        const errorWithStatus = error as { status?: number }
        if (errorWithStatus?.status && errorWithStatus.status >= 400 && errorWithStatus.status < 500) {
          return false
        }
        return failureCount < 3
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
      onError: (error: unknown) => {
        logger.error('Mutation failed', error instanceof Error ? error : new Error(String(error)))
      },
    },
  },
})

// Query Keys Factory (Artsy pattern)
export const queryKeys = {
  all: ['artflow'] as const,
  artworks: () => [...queryKeys.all, 'artworks'] as const,
  artwork: (id: string) => [...queryKeys.artworks(), id] as const,
  artworksByArtist: (artistId: string) => [...queryKeys.artworks(), 'artist', artistId] as const,
  
  artists: () => [...queryKeys.all, 'artists'] as const,
  artist: (id: string) => [...queryKeys.artists(), id] as const,
  
  search: () => [...queryKeys.all, 'search'] as const,
  searchResults: (filters: SearchFilters) => [...queryKeys.search(), filters] as const,
  
  user: () => [...queryKeys.all, 'user'] as const,
  userPreferences: (userId: string) => [...queryKeys.user(), 'preferences', userId] as const,
  userFavorites: (userId: string) => [...queryKeys.user(), 'favorites', userId] as const,
}

// Advanced Data Fetchers with Error Handling
class DataFetcher {
  private static instance: DataFetcher
  private cache = new Map<string, { data: unknown; timestamp: number }>()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  static getInstance(): DataFetcher {
    if (!DataFetcher.instance) {
      DataFetcher.instance = new DataFetcher()
    }
    return DataFetcher.instance
  }

  async fetchWithCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = this.CACHE_TTL
  ): Promise<T> {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < ttl) {
      logger.debug('Cache hit', { key })
      return cached.data as T
    }

    try {
      const data = await fetcher()
      this.cache.set(key, { data, timestamp: Date.now() })
      logger.debug('Cache miss - data fetched', { key })
      return data
    } catch (error) {
      logger.error('Data fetch failed', error as Error, { key })
      throw error
    }
  }

  async fetchArtwork(id: string): Promise<Artwork> {
    return this.fetchWithCache(`artwork:${id}`, async () => {
      const { data, error } = await supabase
        .from('artworks')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            display_name,
            username,
            avatar_url,
            role
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Artwork
    })
  }

  async fetchArtworks(filters: SearchFilters = {}): Promise<PaginatedResponse<Artwork>> {
    const cacheKey = `artworks:${JSON.stringify(filters)}`
    
    return this.fetchWithCache(cacheKey, async () => {
      let query = supabase
        .from('artworks')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            display_name,
            username,
            avatar_url,
            role
          )
        `, { count: 'exact' })

      // Apply filters
      if (filters.mediums?.length) {
        query = query.in('medium', filters.mediums)
      }
      
      if (filters.priceRange) {
        query = query
          .gte('price', filters.priceRange.min)
          .lte('price', filters.priceRange.max)
      }

      if (filters.availability?.length) {
        query = query.in('availability', filters.availability)
      }

      if (filters.query) {
        query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`)
      }

      // Sorting
      switch (filters.sortBy) {
        case 'price_asc':
          query = query.order('price', { ascending: true })
          break
        case 'price_desc':
          query = query.order('price', { ascending: false })
          break
        case 'newest':
          query = query.order('created_at', { ascending: false })
          break
        case 'oldest':
          query = query.order('created_at', { ascending: true })
          break
        case 'popular':
          query = query.order('view_count', { ascending: false })
          break
        default:
          query = query.order('created_at', { ascending: false })
      }

      // Pagination
      const page = filters.page || 1
      const limit = filters.limit || 20
      const from = (page - 1) * limit
      const to = from + limit - 1

      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) throw error

      return {
        data: data as Artwork[],
        meta: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
          hasNext: to < (count || 0) - 1,
          hasPrev: page > 1
        }
      }
    })
  }

  async fetchArtist(id: string): Promise<Artist> {
    return this.fetchWithCache(`artist:${id}`, async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          artworks (
            id,
            title,
            primary_image_url,
            price,
            currency,
            created_at
          )
        `)
        .eq('id', id)
        .eq('role', 'artist')
        .single()

      if (error) throw error
      return data as Artist
    })
  }

  async searchArtworks(query: string, filters: SearchFilters = {}): Promise<SearchResult> {
    const searchKey = `search:${query}:${JSON.stringify(filters)}`
    
    return this.fetchWithCache(searchKey, async () => {
      // Advanced search with full-text search and faceting
      const artworksPromise = this.fetchArtworks({ ...filters, query })
      
      const artistsPromise = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'artist')
        .or(`full_name.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(10)

      const [artworksResult, artistsResult] = await Promise.all([
        artworksPromise,
        artistsPromise
      ])

      if (artistsResult.error) throw artistsResult.error

      // Generate facets for filtering
      const facets = await this.generateFacets(filters)

      return {
        artworks: artworksResult.data,
        artists: artistsResult.data as Artist[],
        total: artworksResult.meta.total,
        query,
        filters,
        facets
      }
    })
  }

  private async generateFacets(_filters: SearchFilters) {
    // Get aggregated data for faceting
    const { data: mediumFacets } = await supabase
      .from('artworks')
      .select('medium')
      .neq('medium', null)

    const { data: styleFacets } = await supabase
      .from('artworks')
      .select('style')
      .neq('style', null)

    // Count occurrences
    const mediumCounts = mediumFacets?.reduce((acc: Record<string, number>, item: { medium: string }) => {
      acc[item.medium] = (acc[item.medium] || 0) + 1
      return acc
    }, {}) || {}

    const styleCounts = styleFacets?.reduce((acc: Record<string, number>, item: { style: string }) => {
      acc[item.style] = (acc[item.style] || 0) + 1
      return acc
    }, {}) || {}

    return {
      mediums: Object.entries(mediumCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      styles: Object.entries(styleCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      priceRanges: [
        { range: '0-1000', count: 0 },
        { range: '1000-5000', count: 0 },
        { range: '5000-20000', count: 0 },
        { range: '20000+', count: 0 }
      ]
    }
  }

  clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key)
        }
      }
    } else {
      this.cache.clear()
    }
  }
}

export const dataFetcher = DataFetcher.getInstance()

// React Query Hooks (Artsy-inspired patterns)
export const useArtwork = (id: string) => {
  return useQuery({
    queryKey: queryKeys.artwork(id),
    queryFn: () => dataFetcher.fetchArtwork(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes for individual artworks
  })
}

export const useArtworks = (filters: SearchFilters = {}) => {
  return useInfiniteQuery({
    queryKey: queryKeys.searchResults(filters),
    queryFn: ({ pageParam = 1 }) => 
      dataFetcher.fetchArtworks({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) => 
      lastPage.meta.hasNext ? lastPage.meta.page + 1 : undefined,
    initialPageParam: 1,
  })
}

export const useArtist = (id: string) => {
  return useQuery({
    queryKey: queryKeys.artist(id),
    queryFn: () => dataFetcher.fetchArtist(id),
    enabled: !!id,
  })
}

export const useSearch = (query: string, filters: SearchFilters = {}) => {
  return useQuery({
    queryKey: queryKeys.searchResults({ ...filters, query }),
    queryFn: () => dataFetcher.searchArtworks(query, filters),
    enabled: !!query && query.length > 2,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
  })
}

// Optimistic Update Mutations (Artsy pattern)
export const useLikeArtwork = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ artworkId, userId }: { artworkId: string; userId: string }) => {
      const { error } = await supabase
        .from('artwork_likes')
        .upsert({ artwork_id: artworkId, user_id: userId })
      
      if (error) throw error
    },
    onMutate: async ({ artworkId }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: queryKeys.artwork(artworkId) })

      // Snapshot previous value
      const previousArtwork = queryClient.getQueryData(queryKeys.artwork(artworkId))

      // Optimistically update
      queryClient.setQueryData(queryKeys.artwork(artworkId), (old: unknown) => {
        const artwork = old as { like_count?: number; is_liked?: boolean }
        return {
          ...artwork,
          like_count: (artwork?.like_count || 0) + 1,
          is_liked: true
        }
      })

      return { previousArtwork, artworkId }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousArtwork) {
        queryClient.setQueryData(
          queryKeys.artwork(context.artworkId), 
          context.previousArtwork
        )
      }
    },
    onSettled: (data, error, { artworkId }) => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: queryKeys.artwork(artworkId) })
    },
  })
}

export const useSaveArtwork = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ artworkId, userId }: { artworkId: string; userId: string }) => {
      const { error } = await supabase
        .from('user_favorites')
        .upsert({ artwork_id: artworkId, user_id: userId })
      
      if (error) throw error
    },
    onSuccess: (data, { userId }) => {
      // Invalidate user's favorites
      queryClient.invalidateQueries({ queryKey: queryKeys.userFavorites(userId) })
    },
  })
}

// Prefetching utilities (Artsy pattern)
export const prefetchArtwork = (queryClient: QueryClient, id: string) => {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.artwork(id),
    queryFn: () => dataFetcher.fetchArtwork(id),
    staleTime: 10 * 60 * 1000,
  })
}

export const prefetchArtist = (queryClient: QueryClient, id: string) => {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.artist(id),
    queryFn: () => dataFetcher.fetchArtist(id),
    staleTime: 10 * 60 * 1000,
  })
}

// Cache management utilities
export const invalidateArtworkCache = (queryClient: QueryClient, artworkId?: string) => {
  if (artworkId) {
    queryClient.invalidateQueries({ queryKey: queryKeys.artwork(artworkId) })
  } else {
    queryClient.invalidateQueries({ queryKey: queryKeys.artworks() })
  }
}

export const invalidateSearchCache = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.search() })
}

// Performance monitoring
export const useQueryPerformance = (queryKey: readonly unknown[]) => {
  const queryClient = useQueryClient()
  
  React.useEffect(() => {
    const query = queryClient.getQueryCache().find({ queryKey })
    if (query) {
      const startTime = performance.now()
      
      return () => {
        const duration = performance.now() - startTime
        logger.performance(`Query ${queryKey.join(':')}`, duration, 'ms')
      }
    }
    return undefined
  }, [queryKey, queryClient])
}

export default dataFetcher
