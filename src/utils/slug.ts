/**
 * Slug utility functions for generating and handling friendly URLs
 */

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

export function generateUniqueSlug(baseText: string, existingSlugs: string[]): string {
  const baseSlug = generateSlug(baseText)
  let slug = baseSlug
  let counter = 1

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

export function generateUniqueSlugWithRandom(baseText: string, existingSlugs: string[]): string {
  const baseSlug = generateSlug(baseText)
  const randomSuffix = Math.floor(10000 + Math.random() * 90000) // 5-digit random number
  let slug = `${baseSlug}-${randomSuffix}`
  let counter = 1

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${randomSuffix}-${counter}`
    counter++
  }

  return slug
}

export function validateSlug(slug: string): boolean {
  // Check if slug contains only valid characters and follows proper format
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  return slugRegex.test(slug) && slug.length >= 1 && slug.length <= 100
}

export function extractSlugFromPath(path: string): string | null {
  const segments = path.split('/').filter(Boolean)
  
  // Handle different URL patterns:
  // /artist-slug
  // /artist-slug/artwork-slug
  // /artist-slug/catalogue-slug
  
  if (segments.length === 1) {
    return segments[0]
  } else if (segments.length === 2) {
    return segments[1] // Return the second segment (artwork or catalogue slug)
  }
  
  return null
}

export function buildArtistUrl(artistSlug: string): string {
  return `/artist/${artistSlug}`
}

export function buildArtworkUrl(artistSlug: string, artworkSlug: string): string {
  return `/artist/${artistSlug}/${artworkSlug}`
}

export function buildCatalogueUrl(artistSlug: string, catalogueSlug: string): string {
  return `/artist/${artistSlug}/catalogue/${catalogueSlug}`
}

export function parseFriendlyUrl(path: string): {
  type: 'artist' | 'artwork' | 'catalogue' | 'unknown'
  artistSlug?: string
  artworkSlug?: string
  catalogueSlug?: string
} {
  const segments = path.split('/').filter(Boolean)
  
  if (segments.length === 1) {
    // /artist-slug
    return {
      type: 'artist',
      artistSlug: segments[0]
    }
  } else if (segments.length === 2) {
    // /artist-slug/artwork-slug
    return {
      type: 'artwork',
      artistSlug: segments[0],
      artworkSlug: segments[1]
    }
  } else if (segments.length === 3 && segments[1] === 'catalogue') {
    // /artist-slug/catalogue/catalogue-slug
    return {
      type: 'catalogue',
      artistSlug: segments[0],
      catalogueSlug: segments[2]
    }
  }
  
  return { type: 'unknown' }
}

export function sanitizeForSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 100) // Limit length
}
