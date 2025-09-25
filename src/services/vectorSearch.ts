import { supabase } from '../lib/supabase'

export interface VectorSearchResult {
  id: string
  type: 'artwork' | 'artist' | 'catalogue'
  title: string
  description: string
  imageUrl?: string
  similarity: number
  metadata: any
}

export interface EmbeddingData {
  id: string
  type: 'artwork' | 'artist' | 'catalogue'
  embedding: number[]
  metadata: {
    title: string
    description: string
    medium?: string
    style?: string
    colors?: string[]
    price?: number
    dimensions?: any
    artist_name?: string
    created_at: string
  }
}

class VectorSearchService {
  private embeddingDimensions = 384 // OpenAI text-embedding-3-small dimensions

  // Generate embedding for text content
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      // TODO: Implement real embedding generation using OpenAI's embedding API
      return new Array(this.embeddingDimensions).fill(0)
    } catch (error) {
      console.error('Error generating embedding:', error)
      throw error
    }
  }

  // Normalize vector to unit length
  private normalizeVector(vector: number[]): number[] {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0))
    return vector.map(val => val / magnitude)
  }

  // Calculate cosine similarity between two vectors
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0
    
    let dotProduct = 0
    let normA = 0
    let normB = 0
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  // Generate and store embedding for an artwork
  async generateArtworkEmbedding(artworkId: string): Promise<void> {
    try {
      const { data: artwork, error } = await supabase
        .from('artworks')
        .select(`
          id, title, description, medium, genre, dominant_colors, price, dimensions,
          profiles!artworks_user_id_fkey(full_name)
        `)
        .eq('id', artworkId)
        .single()

      if (error) throw error

      // Create text representation for embedding
      const textContent = [
        artwork.title || '',
        artwork.description || '',
        artwork.medium || '',
        artwork.genre || '',
        artwork.dominant_colors?.join(' ') || '',
        artwork.profiles?.full_name || '',
        `Price: ${artwork.price || 0}`,
        `Dimensions: ${JSON.stringify(artwork.dimensions || {})}`
      ].join(' ')

      const embedding = await this.generateEmbedding(textContent)

      // Store embedding in database
      const { error: updateError } = await supabase
        .from('artworks')
        .update({ embedding })
        .eq('id', artworkId)

      if (updateError) throw updateError
    } catch (error) {
      console.error('Error generating artwork embedding:', error)
      throw error
    }
  }

  // Generate and store embedding for an artist
  async generateArtistEmbedding(artistId: string): Promise<void> {
    try {
      const { data: artist, error } = await supabase
        .from('profiles')
        .select(`
          id, full_name, bio, artist_statement,
          artworks!artworks_user_id_fkey(medium, genre, dominant_colors)
        `)
        .eq('id', artistId)
        .eq('role', 'artist')
        .single()

      if (error) throw error

      // Aggregate artist's work characteristics
      const artworks = artist.artworks || []
      const mediums = [...new Set(artworks.map(a => a.medium).filter(Boolean))]
      const styles = [...new Set(artworks.map(a => a.genre).filter(Boolean))]
      const colors = [...new Set(artworks.flatMap(a => a.dominant_colors || []))]

      const textContent = [
        artist.full_name || '',
        artist.bio || '',
        artist.artist_statement || '',
        `Mediums: ${mediums.join(', ')}`,
        `Styles: ${styles.join(', ')}`,
        `Colors: ${colors.join(', ')}`
      ].join(' ')

      const embedding = await this.generateEmbedding(textContent)

      // Store embedding in a separate table or extend profiles table
      const { error: updateError } = await supabase
        .from('artist_embeddings')
        .upsert({
          artist_id: artistId,
          embedding,
          updated_at: new Date().toISOString()
        })

      if (updateError) throw updateError
    } catch (error) {
      console.error('Error generating artist embedding:', error)
      throw error
    }
  }

  // Find similar artworks using vector similarity
  async findSimilarArtworks(
    artworkId: string, 
    limit: number = 10,
    excludeIds: string[] = []
  ): Promise<VectorSearchResult[]> {
    try {
      // Get the source artwork's embedding
      const { data: sourceArtwork, error } = await supabase
        .from('artworks')
        .select('embedding, title, description, primary_image_url, medium, genre, price, dimensions')
        .eq('id', artworkId)
        .single()

      if (error || !sourceArtwork?.embedding) {
        throw new Error('Source artwork not found or no embedding available')
      }

      // Get all other artworks with embeddings
      const { data: artworks, error: fetchError } = await supabase
        .from('artworks')
        .select(`
          id, title, description, primary_image_url, medium, genre, price, dimensions,
          profiles!artworks_user_id_fkey(full_name)
        `)
        .not('id', 'in', `(${[artworkId, ...excludeIds].join(',')})`)
        .not('embedding', 'is', null)
        .eq('status', 'available')
        .limit(100) // Limit for performance

      if (fetchError) throw fetchError

      // Calculate similarities
      const similarities = artworks.map(artwork => {
        const similarity = this.cosineSimilarity(sourceArtwork.embedding, artwork.embedding)
        return {
          ...artwork,
          similarity
        }
      })

      // Sort by similarity and return top results
      return similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)
        .map(artwork => ({
          id: artwork.id,
          type: 'artwork' as const,
          title: artwork.title || 'Untitled',
          description: artwork.description || '',
          imageUrl: artwork.primary_image_url,
          similarity: artwork.similarity,
          metadata: {
            medium: artwork.medium,
            genre: artwork.genre,
            price: artwork.price,
            dimensions: artwork.dimensions,
            artist_name: artwork.profiles?.full_name
          }
        }))
    } catch (error) {
      console.error('Error finding similar artworks:', error)
      return []
    }
  }

  // Find similar artists using vector similarity
  async findSimilarArtists(
    artistId: string,
    limit: number = 10,
    excludeIds: string[] = []
  ): Promise<VectorSearchResult[]> {
    try {
      // Get the source artist's embedding
      const { data: sourceArtist, error } = await supabase
        .from('artist_embeddings')
        .select('embedding')
        .eq('artist_id', artistId)
        .single()

      if (error || !sourceArtist?.embedding) {
        throw new Error('Source artist not found or no embedding available')
      }

      // Get all other artists with embeddings
      const { data: artists, error: fetchError } = await supabase
        .from('artist_embeddings')
        .select(`
          artist_id, embedding,
          profiles!artist_embeddings_artist_id_fkey(id, full_name, bio, avatar_url)
        `)
        .not('artist_id', 'in', `(${[artistId, ...excludeIds].join(',')})`)

      if (fetchError) throw fetchError

      // Calculate similarities
      const similarities = artists.map(artist => {
        const similarity = this.cosineSimilarity(sourceArtist.embedding, artist.embedding)
        return {
          ...artist,
          similarity
        }
      })

      // Sort by similarity and return top results
      return similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)
        .map(artist => ({
          id: artist.artist_id,
          type: 'artist' as const,
          title: artist.profiles?.full_name || 'Unknown Artist',
          description: artist.profiles?.bio || '',
          imageUrl: artist.profiles?.avatar_url,
          similarity: artist.similarity,
          metadata: {
            artist_id: artist.artist_id,
            bio: artist.profiles?.bio
          }
        }))
    } catch (error) {
      console.error('Error finding similar artists:', error)
      return []
    }
  }

  // Find artworks based on text query using vector similarity
  async searchArtworksByText(
    query: string,
    limit: number = 20,
    filters: {
      medium?: string[]
      style?: string[]
      priceMin?: number
      priceMax?: number
      excludeIds?: string[]
    } = {}
  ): Promise<VectorSearchResult[]> {
    try {
      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbedding(query)

      // Build base query
      let supabaseQuery = supabase
        .from('artworks')
        .select(`
          id, title, description, primary_image_url, medium, genre, price, dimensions, embedding,
          profiles!artworks_user_id_fkey(full_name)
        `)
        .not('embedding', 'is', null)
        .eq('status', 'available')

      // Apply filters
      if (filters.medium?.length) {
        supabaseQuery = supabaseQuery.in('medium', filters.medium)
      }
      if (filters.style?.length) {
        supabaseQuery = supabaseQuery.in('genre', filters.style)
      }
      if (filters.priceMin) {
        supabaseQuery = supabaseQuery.gte('price', filters.priceMin)
      }
      if (filters.priceMax) {
        supabaseQuery = supabaseQuery.lte('price', filters.priceMax)
      }
      if (filters.excludeIds?.length) {
        supabaseQuery = supabaseQuery.not('id', 'in', `(${filters.excludeIds.join(',')})`)
      }

      const { data: artworks, error } = await supabaseQuery.limit(200)

      if (error) throw error

      // Calculate similarities
      const similarities = artworks.map(artwork => {
        const similarity = this.cosineSimilarity(queryEmbedding, artwork.embedding)
        return {
          ...artwork,
          similarity
        }
      })

      // Sort by similarity and return top results
      return similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)
        .map(artwork => ({
          id: artwork.id,
          type: 'artwork' as const,
          title: artwork.title || 'Untitled',
          description: artwork.description || '',
          imageUrl: artwork.primary_image_url,
          similarity: artwork.similarity,
          metadata: {
            medium: artwork.medium,
            genre: artwork.genre,
            price: artwork.price,
            dimensions: artwork.dimensions,
            artist_name: artwork.profiles?.full_name
          }
        }))
    } catch (error) {
      console.error('Error searching artworks by text:', error)
      return []
    }
  }

  // Find "Because you liked X" recommendations
  async findBecauseYouLiked(
    likedArtworkId: string,
    userId: string,
    limit: number = 10
  ): Promise<VectorSearchResult[]> {
    try {
      // Get user's liked artworks to exclude
      const { data: likedArtworks } = await supabase
        .from('artwork_likes')
        .select('artwork_id')
        .eq('collector_id', userId)

      const excludeIds = likedArtworks?.map(l => l.artwork_id) || []

      // Find similar artworks
      const similarArtworks = await this.findSimilarArtworks(
        likedArtworkId,
        limit + excludeIds.length,
        excludeIds
      )

      return similarArtworks.slice(0, limit)
    } catch (error) {
      console.error('Error finding "because you liked" recommendations:', error)
      return []
    }
  }

  // Find tangential discoveries (artworks liked by people who liked similar things)
  async findTangentialDiscoveries(
    userId: string,
    limit: number = 10
  ): Promise<VectorSearchResult[]> {
    try {
      // Get user's liked artworks
      const { data: likedArtworks } = await supabase
        .from('artwork_likes')
        .select('artwork_id')
        .eq('collector_id', userId)

      if (!likedArtworks?.length) return []

      // Find similar artworks to user's likes
      const allSimilar: VectorSearchResult[] = []
      
      for (const liked of likedArtworks.slice(0, 3)) { // Limit to top 3 liked artworks
        const similar = await this.findSimilarArtworks(liked.artwork_id, 5)
        allSimilar.push(...similar)
      }

      // Remove duplicates and user's already liked artworks
      const uniqueSimilar = allSimilar.filter((artwork, index, self) => 
        index === self.findIndex(a => a.id === artwork.id) &&
        !likedArtworks.some(l => l.artwork_id === artwork.id)
      )

      // Sort by similarity and return top results
      return uniqueSimilar
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)
    } catch (error) {
      console.error('Error finding tangential discoveries:', error)
      return []
    }
  }

  // Batch generate embeddings for all artworks
  async generateAllArtworkEmbeddings(): Promise<void> {
    try {
      const { data: artworks, error } = await supabase
        .from('artworks')
        .select('id')
        .eq('status', 'available')
        .is('embedding', null)

      if (error) throw error

      const batchSize = 10
      for (let i = 0; i < artworks.length; i += batchSize) {
        const batch = artworks.slice(i, i + batchSize)
        await Promise.all(
          batch.map(artwork => this.generateArtworkEmbedding(artwork.id))
        )
      }
    } catch (error) {
      console.error('Error generating all artwork embeddings:', error)
    }
  }

  // Batch generate embeddings for all artists
  async generateAllArtistEmbeddings(): Promise<void> {
    try {
      const { data: artists, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'artist')

      if (error) throw error

      const batchSize = 10
      for (let i = 0; i < artists.length; i += batchSize) {
        const batch = artists.slice(i, i + batchSize)
        await Promise.all(
          batch.map(artist => this.generateArtistEmbedding(artist.id))
        )
      }
    } catch (error) {
      console.error('Error generating all artist embeddings:', error)
    }
  }
}

export const vectorSearch = new VectorSearchService()
