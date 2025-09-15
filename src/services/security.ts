// Comprehensive Security and Validation Service
import { supabase } from '../lib/supabase'

// Input validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  price: /^\d+(\.\d{1,2})?$/,
  dimensions: /^\d+(\.\d+)?\s*x\s*\d+(\.\d+)?(?:\s*x\s*\d+(\.\d+)?)?$/i
}

// Sanitization functions
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .substring(0, 1000) // Limit length
}

export function sanitizeHtml(html: string): string {
  if (typeof html !== 'string') return ''
  
  // Basic HTML sanitization - in production, use a library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
}

// Validation functions
export function validateEmail(email: string): boolean {
  return VALIDATION_PATTERNS.email.test(email)
}

export function validatePhone(phone: string): boolean {
  return VALIDATION_PATTERNS.phone.test(phone.replace(/\s/g, ''))
}

export function validateUrl(url: string): boolean {
  return VALIDATION_PATTERNS.url.test(url)
}

export function validateSlug(slug: string): boolean {
  return VALIDATION_PATTERNS.slug.test(slug) && slug.length >= 3 && slug.length <= 50
}

export function validateUuid(uuid: string): boolean {
  return VALIDATION_PATTERNS.uuid.test(uuid)
}

export function validatePrice(price: string | number): boolean {
  const priceStr = typeof price === 'number' ? price.toString() : price
  return VALIDATION_PATTERNS.price.test(priceStr) && parseFloat(priceStr) >= 0
}

export function validateDimensions(dimensions: string): boolean {
  return VALIDATION_PATTERNS.dimensions.test(dimensions)
}

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string, 
  maxRequests: number = 100, 
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): boolean {
  const now = Date.now()
  const key = identifier
  const record = rateLimitMap.get(key)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= maxRequests) {
    return false
  }

  record.count++
  return true
}

// CSRF protection
export function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export function validateCSRFToken(token: string, storedToken: string): boolean {
  return token === storedToken && token.length === 64
}

// SQL injection prevention
export function escapeSqlString(str: string): string {
  return str.replace(/'/g, "''").replace(/\\/g, '\\\\')
}

// XSS prevention
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// File upload security
export const ALLOWED_FILE_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  document: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
}

export const MAX_FILE_SIZES = {
  image: 10 * 1024 * 1024, // 10MB
  document: 50 * 1024 * 1024, // 50MB
  avatar: 2 * 1024 * 1024 // 2MB
}

export function validateFileUpload(
  file: File, 
  allowedTypes: string[], 
  maxSize: number
): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided' }
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type' }
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'File too large' }
  }

  // Check for malicious file extensions
  const maliciousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.vbs', '.js', '.jar']
  const fileName = file.name.toLowerCase()
  const hasMaliciousExtension = maliciousExtensions.some(ext => fileName.endsWith(ext))
  
  if (hasMaliciousExtension) {
    return { valid: false, error: 'File type not allowed' }
  }

  return { valid: true }
}

// Authentication security
export async function validateUserSession(userId: string): Promise<boolean> {
  try {
    const { data: user, error } = await supabase
      .from('profiles')
      .select('id, status')
      .eq('id', userId)
      .single()

    if (error || !user) return false
    if (user.status !== 'active') return false

    return true
  } catch (error) {
    console.error('Error validating user session:', error)
    return false
  }
}

export async function checkUserPermissions(
  userId: string, 
  resource: string, 
  action: string
): Promise<boolean> {
  try {
    // Basic permission check - in production, implement proper RBAC
    const { data: user, error } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', userId)
      .single()

    if (error || !user) return false
    if (user.status !== 'active') return false

    // Admin can do everything
    if (user.role === 'ADMIN') return true

    // Artist permissions
    if (user.role === 'ARTIST') {
      const artistActions = ['create_artwork', 'edit_artwork', 'delete_artwork', 'create_catalogue']
      return artistActions.includes(action)
    }

    // Collector permissions
    if (user.role === 'COLLECTOR') {
      const collectorActions = ['view_artwork', 'favorite_artwork', 'create_inquiry']
      return collectorActions.includes(action)
    }

    return false
  } catch (error) {
    console.error('Error checking user permissions:', error)
    return false
  }
}

// Data encryption/decryption (basic implementation)
export function encryptData(data: string, key: string): string {
  // In production, use a proper encryption library like crypto-js
  const encoded = btoa(data + ':' + key)
  return encoded
}

export function decryptData(encryptedData: string, key: string): string | null {
  try {
    const decoded = atob(encryptedData)
    const [data, dataKey] = decoded.split(':')
    return dataKey === key ? data : null
  } catch (error) {
    return null
  }
}

// Audit logging
export async function logSecurityEvent(
  userId: string | null,
  event: string,
  details: any,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
): Promise<void> {
  try {
    await supabase
      .from('security_logs')
      .insert({
        user_id: userId,
        event,
        details,
        severity,
        ip_address: await getClientIP(),
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString()
      })
  } catch (error) {
    console.error('Error logging security event:', error)
  }
}

// Get client IP (basic implementation)
async function getClientIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    return data.ip || 'unknown'
  } catch (error) {
    return 'unknown'
  }
}

// Content Security Policy
export const CSP_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co https://api.ipify.org",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join('; ')
}

// Security headers
export const SECURITY_HEADERS = {
  ...CSP_HEADERS,
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
}

// Input validation middleware
export function validateInput(data: any, schema: Record<string, any>): {
  valid: boolean
  errors: string[]
  sanitizedData: any
} {
  const errors: string[] = []
  const sanitizedData: any = {}

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field]
    
    // Required field check
    if (rules.required && (!value || value.toString().trim() === '')) {
      errors.push(`${field} is required`)
      continue
    }

    // Skip validation if field is empty and not required
    if (!value || value.toString().trim() === '') {
      sanitizedData[field] = rules.default || null
      continue
    }

    // Sanitize input
    const sanitized = sanitizeInput(value.toString())
    sanitizedData[field] = sanitized

    // Type validation
    if (rules.type === 'email' && !validateEmail(sanitized)) {
      errors.push(`${field} must be a valid email address`)
    } else if (rules.type === 'phone' && !validatePhone(sanitized)) {
      errors.push(`${field} must be a valid phone number`)
    } else if (rules.type === 'url' && !validateUrl(sanitized)) {
      errors.push(`${field} must be a valid URL`)
    } else if (rules.type === 'slug' && !validateSlug(sanitized)) {
      errors.push(`${field} must be a valid slug (lowercase, numbers, hyphens only)`)
    } else if (rules.type === 'price' && !validatePrice(sanitized)) {
      errors.push(`${field} must be a valid price`)
    } else if (rules.type === 'dimensions' && !validateDimensions(sanitized)) {
      errors.push(`${field} must be valid dimensions (e.g., "24x36" or "24x36x2")`)
    }

    // Length validation
    if (rules.minLength && sanitized.length < rules.minLength) {
      errors.push(`${field} must be at least ${rules.minLength} characters`)
    }
    if (rules.maxLength && sanitized.length > rules.maxLength) {
      errors.push(`${field} must be no more than ${rules.maxLength} characters`)
    }

    // Numeric validation
    if (rules.type === 'number') {
      const num = parseFloat(sanitized)
      if (isNaN(num)) {
        errors.push(`${field} must be a valid number`)
      } else {
        if (rules.min !== undefined && num < rules.min) {
          errors.push(`${field} must be at least ${rules.min}`)
        }
        if (rules.max !== undefined && num > rules.max) {
          errors.push(`${field} must be no more than ${rules.max}`)
        }
        sanitizedData[field] = num
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitizedData
  }
}

// Common validation schemas
export const VALIDATION_SCHEMAS = {
  artwork: {
    title: { type: 'string', required: true, minLength: 1, maxLength: 200 },
    description: { type: 'string', required: false, maxLength: 2000 },
    price: { type: 'price', required: false, min: 0 },
    medium: { type: 'string', required: false, maxLength: 100 },
    dimensions: { type: 'dimensions', required: false },
    genre: { type: 'string', required: false, maxLength: 50 },
    year: { type: 'number', required: false, min: 1000, max: new Date().getFullYear() + 1 }
  },
  artist: {
    full_name: { type: 'string', required: true, minLength: 1, maxLength: 100 },
    bio: { type: 'string', required: false, maxLength: 2000 },
    location: { type: 'string', required: false, maxLength: 100 },
    website: { type: 'url', required: false },
    instagram: { type: 'string', required: false, maxLength: 50 },
    twitter: { type: 'string', required: false, maxLength: 50 }
  },
  contact: {
    full_name: { type: 'string', required: true, minLength: 1, maxLength: 100 },
    email: { type: 'email', required: true },
    organization: { type: 'string', required: false, maxLength: 100 },
    phone_number: { type: 'phone', required: false },
    notes: { type: 'string', required: false, maxLength: 1000 }
  }
}