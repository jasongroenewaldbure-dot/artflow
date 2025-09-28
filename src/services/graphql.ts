// GraphQL client and queries for ArtFlow
import { createClient } from 'graphql-ws'
import { createClient as createUrqlClient, fetchExchange, subscriptionExchange } from 'urql'

// GraphQL endpoint
const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_ENDPOINT || 'ws://localhost:4000/graphql'
const HTTP_ENDPOINT = import.meta.env.VITE_HTTP_ENDPOINT || 'http://localhost:4000/graphql'

// WebSocket client for subscriptions
const wsClient = createClient({
  url: GRAPHQL_ENDPOINT,
  connectionParams: {
    // Add auth headers if needed
  },
})

// URQL client for queries and mutations
export const graphqlClient = createUrqlClient({
  url: HTTP_ENDPOINT,
  exchanges: [
    fetchExchange,
    subscriptionExchange({
      forwardSubscription: (operation) => ({
        subscribe: (sink) => ({
          unsubscribe: wsClient.subscribe({
            ...operation,
            query: operation.query || ''
          }, sink),
        }),
      }),
    }),
  ],
})

// GraphQL Queries
export const QUERIES = {
  // Artwork queries
  GET_ARTWORKS: `
    query GetArtworks($first: Int, $after: String, $filters: ArtworkFilters) {
      artworks(first: $first, after: $after, filters: $filters) {
        edges {
          node {
            id
            title
            description
            medium
            dimensions
            year
            price
            currency
            isForSale
            primaryImageUrl
            artist {
              id
              name
              slug
              avatarUrl
            }
            tags
            createdAt
            updatedAt
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        totalCount
      }
    }
  `,

  GET_ARTWORK: `
    query GetArtwork($id: ID!) {
      artwork(id: $id) {
        id
        title
        description
        medium
        dimensions
        year
        price
        currency
        isForSale
        primaryImageUrl
        images {
          id
          url
          alt
          isPrimary
        }
        artist {
          id
          name
          slug
          bio
          avatarUrl
          nationality
          birthYear
          deathYear
        }
        tags
        createdAt
        updatedAt
      }
    }
  `,

  // Artist queries
  GET_ARTISTS: `
    query GetArtists($first: Int, $after: String, $filters: ArtistFilters) {
      artists(first: $first, after: $after, filters: $filters) {
        edges {
          node {
            id
            name
            slug
            bio
            nationality
            birthYear
            deathYear
            location
            education
            website
            instagram
            avatarUrl
            artworkCount
            isFollowed
            createdAt
            updatedAt
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        totalCount
      }
    }
  `,

  GET_ARTIST: `
    query GetArtist($slug: String!) {
      artist(slug: $slug) {
        id
        name
        slug
        bio
        nationality
        birthYear
        deathYear
        location
        education
        website
        instagram
        avatarUrl
        artworkCount
        isFollowed
        artworks(first: 12) {
          edges {
            node {
              id
              title
              primaryImageUrl
              price
              currency
              isForSale
              year
            }
          }
        }
        createdAt
        updatedAt
      }
    }
  `,

  // User queries
  GET_CURRENT_USER: `
    query GetCurrentUser {
      me {
        id
        email
        name
        role
        bio
        location
        website
        avatarUrl
        createdAt
        updatedAt
      }
    }
  `,

  // Search queries
  SEARCH: `
    query Search($query: String!, $first: Int, $filters: SearchFilters) {
      search(query: $query, first: $first, filters: $filters) {
        artworks {
          id
          title
          primaryImageUrl
          price
          currency
          isForSale
          artist {
            name
            slug
          }
        }
        artists {
          id
          name
          slug
          avatarUrl
          nationality
        }
        totalCount
      }
    }
  `,

  // Favorites queries
  GET_FAVORITES: `
    query GetFavorites {
      favorites {
        id
        artwork {
          id
          title
          primaryImageUrl
          price
          currency
          isForSale
          artist {
            name
            slug
          }
        }
        createdAt
      }
    }
  `,
}

// GraphQL Mutations
export const MUTATIONS = {
  // Artwork mutations
  CREATE_ARTWORK: `
    mutation CreateArtwork($input: CreateArtworkInput!) {
      createArtwork(input: $input) {
        id
        title
        description
        medium
        dimensions
        year
        price
        currency
        isForSale
        primaryImageUrl
        artist {
          id
          name
          slug
        }
        createdAt
      }
    }
  `,

  UPDATE_ARTWORK: `
    mutation UpdateArtwork($id: ID!, $input: UpdateArtworkInput!) {
      updateArtwork(id: $id, input: $input) {
        id
        title
        description
        medium
        dimensions
        year
        price
        currency
        isForSale
        primaryImageUrl
        updatedAt
      }
    }
  `,

  DELETE_ARTWORK: `
    mutation DeleteArtwork($id: ID!) {
      deleteArtwork(id: $id) {
        success
        message
      }
    }
  `,

  // Like/Unlike artwork
  LIKE_ARTWORK: `
    mutation LikeArtwork($artworkId: ID!) {
      likeArtwork(artworkId: $artworkId) {
        success
        message
      }
    }
  `,

  UNLIKE_ARTWORK: `
    mutation UnlikeArtwork($artworkId: ID!) {
      unlikeArtwork(artworkId: $artworkId) {
        success
        message
      }
    }
  `,

  // Artist mutations
  FOLLOW_ARTIST: `
    mutation FollowArtist($artistId: ID!) {
      followArtist(artistId: $artistId) {
        success
        message
      }
    }
  `,

  UNFOLLOW_ARTIST: `
    mutation UnfollowArtist($artistId: ID!) {
      unfollowArtist(artistId: $artistId) {
        success
        message
      }
    }
  `,

  // User mutations
  UPDATE_PROFILE: `
    mutation UpdateProfile($input: UpdateProfileInput!) {
      updateProfile(input: $input) {
        id
        name
        bio
        location
        website
        avatarUrl
        updatedAt
      }
    }
  `,

  UPLOAD_AVATAR: `
    mutation UploadAvatar($file: Upload!) {
      uploadAvatar(file: $file) {
        url
        success
        message
      }
    }
  `,
}

// GraphQL Subscriptions
export const SUBSCRIPTIONS = {
  // Real-time updates
  ARTWORK_UPDATED: `
    subscription ArtworkUpdated($artworkId: ID!) {
      artworkUpdated(artworkId: $artworkId) {
        id
        title
        price
        isForSale
        updatedAt
      }
    }
  `,

  NEW_ARTWORK: `
    subscription NewArtwork {
      newArtwork {
        id
        title
        primaryImageUrl
        price
        currency
        isForSale
        artist {
          name
          slug
        }
        createdAt
      }
    }
  `,

  USER_NOTIFICATIONS: `
    subscription UserNotifications {
      userNotifications {
        id
        type
        title
        message
        read
        createdAt
      }
    }
  `,
}

// GraphQL Fragments
export const FRAGMENTS = {
  ARTWORK_CARD: `
    fragment ArtworkCard on Artwork {
      id
      title
      primaryImageUrl
      price
      currency
      isForSale
      year
      medium
      artist {
        id
        name
        slug
        avatarUrl
      }
    }
  `,

  ARTIST_CARD: `
    fragment ArtistCard on Artist {
      id
      name
      slug
      avatarUrl
      nationality
      birthYear
      deathYear
      artworkCount
      isFollowed
    }
  `,

  USER_PROFILE: `
    fragment UserProfile on User {
      id
      name
      email
      role
      bio
      location
      website
      avatarUrl
    }
  `,
}

// GraphQL Types
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
}

export interface ArtistFilters {
  search?: string
  nationality?: string
  sortBy?: 'newest' | 'oldest' | 'name' | 'popular'
}

export interface SearchFilters {
  type?: 'all' | 'artworks' | 'artists'
  priceMin?: number
  priceMax?: number
  yearMin?: number
  yearMax?: number
}

export interface CreateArtworkInput {
  title: string
  description?: string
  medium?: string
  dimensions?: string
  year?: number
  price?: string
  currency?: string
  isForSale: boolean
  primaryImageUrl?: string
  tags?: string[]
}

export interface UpdateArtworkInput {
  title?: string
  description?: string
  medium?: string
  dimensions?: string
  year?: number
  price?: string
  currency?: string
  isForSale?: boolean
  primaryImageUrl?: string
  tags?: string[]
}

export interface UpdateProfileInput {
  name?: string
  bio?: string
  location?: string
  website?: string
}

// GraphQL Error handling
export class GraphQLError extends Error {
  code: string
  statusCode: number
  details?: any

  constructor(
    message: string,
    code: string,
    statusCode: number = 400,
    details?: any
  ) {
    super(message)
    this.name = 'GraphQLError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
  }
}

export function handleGraphQLError(error: any): GraphQLError {
  if (error.graphQLErrors && error.graphQLErrors.length > 0) {
    const graphQLError = error.graphQLErrors[0]
    return new GraphQLError(
      graphQLError.message,
      graphQLError.extensions?.code || 'GRAPHQL_ERROR',
      graphQLError.extensions?.statusCode || 400,
      graphQLError.extensions
    )
  }

  if (error.networkError) {
    return new GraphQLError(
      'Network error. Please check your connection.',
      'NETWORK_ERROR',
      0,
      { originalError: error.networkError.message }
    )
  }

  return new GraphQLError(
    'An unexpected error occurred.',
    'UNKNOWN_ERROR',
    500,
    { originalError: error.message }
  )
}