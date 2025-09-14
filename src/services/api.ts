import { z } from 'zod'
import { cacheManager, cachedFetch } from './performance'
import { rateLimiter, validateData, SecurityError } from './security'

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Request configuration
interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  cache?: boolean
  cacheTTL?: number
  timeout?: number
}

// API Response wrapper
interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  errors?: string[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Error types
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// HTTP Client
class HttpClient {
  private baseURL: string
  private defaultHeaders: Record<string, string>

  constructor(baseURL: string) {
    this.baseURL = baseURL
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      cache = true,
      cacheTTL = CACHE_TTL,
      timeout = 10000
    } = config

    const url = `${this.baseURL}${endpoint}`
    const cacheKey = `api:${method}:${url}:${JSON.stringify(body || {})}`

    // Check cache for GET requests
    if (method === 'GET' && cache) {
      const cached = cacheManager.get(cacheKey)
      if (cached) {
        return cached
      }
    }

    // Rate limiting
    const clientId = this.getClientId()
    if (!rateLimiter.isAllowed(clientId)) {
      throw new ApiError(
        'Rate limit exceeded. Please try again later.',
        429,
        'RATE_LIMIT_EXCEEDED'
      )
    }

    // Create abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        method,
        headers: {
          ...this.defaultHeaders,
          ...headers
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new ApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.code,
          errorData.details
        )
      }

      const data: ApiResponse<T> = await response.json()

      // Cache successful GET requests
      if (method === 'GET' && cache && data.success) {
        cacheManager.set(cacheKey, data, cacheTTL)
      }

      return data
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof ApiError) {
        throw error
      }

      if (error.name === 'AbortError') {
        throw new ApiError(
          'Request timeout. Please try again.',
          408,
          'REQUEST_TIMEOUT'
        )
      }

      throw new ApiError(
        'Network error. Please check your connection.',
        0,
        'NETWORK_ERROR',
        { originalError: error.message }
      )
    }
  }

  private getClientId(): string {
    // In a real app, this would be based on user session or IP
    return 'anonymous'
  }

  async get<T>(endpoint: string, config?: Omit<RequestConfig, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...config, method: 'GET' })
  }

  async post<T>(endpoint: string, body?: any, config?: Omit<RequestConfig, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...config, method: 'POST', body })
  }

  async put<T>(endpoint: string, body?: any, config?: Omit<RequestConfig, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body })
  }

  async patch<T>(endpoint: string, body?: any, config?: Omit<RequestConfig, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body })
  }

  async delete<T>(endpoint: string, config?: Omit<RequestConfig, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' })
  }
}

export const api = new HttpClient(API_BASE_URL)

// Artwork API
export interface ArtworkFilters {
  search?: string
  artist?: string
  medium?: string
  priceMin?: number
  priceMax?: number
  yearMin?: number
  yearMax?: number
  availability?: 'all' | 'for-sale' | 'sold'
  sortBy?: 'newest' | 'oldest' | 'price-low' | 'price-high' | 'title' | 'popular'
  page?: number
  limit?: number
}

export interface Artwork {
  id: string
  title: string
  description?: string
  medium?: string
  dimensions?: string
  year?: number
  price?: string
  currency?: string
  isForSale: boolean
  primaryImageUrl?: string
  artist: {
    id: string
    name: string
    slug: string
    avatarUrl?: string
  }
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export const artworkApi = {
  async getArtworks(filters: ArtworkFilters = {}): Promise<ApiResponse<Artwork[]>> {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })

    return api.get<Artwork[]>(`/artworks?${params.toString()}`)
  },

  async getArtwork(id: string): Promise<ApiResponse<Artwork>> {
    return api.get<Artwork>(`/artworks/${id}`)
  },

  async createArtwork(artwork: Omit<Artwork, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Artwork>> {
    return api.post<Artwork>('/artworks', artwork)
  },

  async updateArtwork(id: string, artwork: Partial<Artwork>): Promise<ApiResponse<Artwork>> {
    return api.put<Artwork>(`/artworks/${id}`, artwork)
  },

  async deleteArtwork(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`/artworks/${id}`)
  },

  async likeArtwork(id: string): Promise<ApiResponse<void>> {
    return api.post<void>(`/artworks/${id}/like`)
  },

  async unlikeArtwork(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`/artworks/${id}/like`)
  }
}

// Artist API
export interface ArtistFilters {
  search?: string
  nationality?: string
  sortBy?: 'newest' | 'oldest' | 'name' | 'popular'
  page?: number
  limit?: number
}

export interface Artist {
  id: string
  name: string
  slug: string
  bio?: string
  nationality?: string
  birthYear?: number
  deathYear?: number
  location?: string
  education?: string
  website?: string
  instagram?: string
  avatarUrl?: string
  artworkCount: number
  isFollowed?: boolean
  createdAt: string
  updatedAt: string
}

export const artistApi = {
  async getArtists(filters: ArtistFilters = {}): Promise<ApiResponse<Artist[]>> {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })

    return api.get<Artist[]>(`/artists?${params.toString()}`)
  },

  async getArtist(slug: string): Promise<ApiResponse<Artist>> {
    return api.get<Artist>(`/artists/${slug}`)
  },

  async getArtistArtworks(slug: string, filters: ArtworkFilters = {}): Promise<ApiResponse<Artwork[]>> {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })

    return api.get<Artwork[]>(`/artists/${slug}/artworks?${params.toString()}`)
  },

  async followArtist(id: string): Promise<ApiResponse<void>> {
    return api.post<void>(`/artists/${id}/follow`)
  },

  async unfollowArtist(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`/artists/${id}/follow`)
  }
}

// User API
export interface User {
  id: string
  email: string
  name: string
  role: 'COLLECTOR' | 'ARTIST' | 'GALLERY' | 'ADMIN'
  bio?: string
  location?: string
  website?: string
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

export const userApi = {
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return api.get<User>('/user/me')
  },

  async updateProfile(updates: Partial<User>): Promise<ApiResponse<User>> {
    return api.put<User>('/user/me', updates)
  },

  async uploadAvatar(file: File): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData()
    formData.append('avatar', file)

    return api.post<{ url: string }>('/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

// Search API
export interface SearchResult {
  artworks: Artwork[]
  artists: Artist[]
  total: number
  query: string
}

export const searchApi = {
  async search(query: string, filters: ArtworkFilters = {}): Promise<ApiResponse<SearchResult>> {
    const params = new URLSearchParams({ q: query })
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })

    return api.get<SearchResult>(`/search?${params.toString()}`)
  },

  async getSuggestions(query: string): Promise<ApiResponse<string[]>> {
    return api.get<string[]>(`/search/suggestions?q=${encodeURIComponent(query)}`)
  }
}

// Error handling utility
export function handleApiError(error: any): string {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof SecurityError) {
    return 'A security error occurred. Please try again.'
  }

  if (error.name === 'NetworkError' || !navigator.onLine) {
    return 'No internet connection. Please check your network.'
  }

  return 'An unexpected error occurred. Please try again.'
}

// Retry utility
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
      }
    }
  }

  throw lastError!
}

// Batch operations
export class BatchProcessor<T, R> {
  private queue: Array<{ item: T; resolve: (value: R) => void; reject: (error: any) => void }> = []
  private processing = false
  private readonly batchSize: number
  private readonly processor: (items: T[]) => Promise<R[]>

  constructor(processor: (items: T[]) => Promise<R[]>, batchSize: number = 10) {
    this.processor = processor
    this.batchSize = batchSize
  }

  async add(item: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.queue.push({ item, resolve, reject })
      this.process()
    })
  }

  private async process() {
    if (this.processing || this.queue.length === 0) return

    this.processing = true

    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.batchSize)
      const items = batch.map(({ item }) => item)

      try {
        const results = await this.processor(items)
        batch.forEach(({ resolve }, index) => {
          resolve(results[index])
        })
      } catch (error) {
        batch.forEach(({ reject }) => {
          reject(error)
        })
      }
    }

    this.processing = false
  }
}

// Cache invalidation
export function invalidateCache(pattern: string) {
  // In a real implementation, this would use a more sophisticated cache invalidation system
  console.log(`Invalidating cache for pattern: ${pattern}`)
}

// API health check
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await api.get<{ status: string }>('/health')
    return response.success && response.data.status === 'ok'
  } catch {
    return false
  }
}
