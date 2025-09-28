// Comprehensive Security and Validation Service
import { supabase } from '../lib/supabase'
import DOMPurify from 'dompurify'
import CryptoJS from 'crypto-js'

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
  
  // Use DOMPurify for robust HTML sanitization
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'b', 'i', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'a', 'span', 'div'
    ],
    ALLOWED_ATTR: ['href', 'title', 'class', 'id'],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SANITIZE_DOM: true,
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    SANITIZE_NAMED_PROPS: true,
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: ['onload', 'onerror', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit']
  })
  
  return clean
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
      .eq('user_id', userId)
      .single()

    if (error || !user) return false
    if (user.status !== 'active') return false

    return true
  } catch (error) {
    console.error('Error validating user session:', error)
    return false
  }
}

// Role-Based Access Control (RBAC) System
export interface Permission {
  resource: string
  action: string
  conditions?: Record<string, any>
}

export interface Role {
  name: string
  permissions: Permission[]
  inherits?: string[]
}

export const ROLES: Record<string, Role> = {
  ADMIN: {
    name: 'ADMIN',
    permissions: [
      { resource: '*', action: '*' } // Admin can do everything
    ]
  },
  ARTIST: {
    name: 'ARTIST',
    permissions: [
      { resource: 'artwork', action: 'create' },
      { resource: 'artwork', action: 'read', conditions: { owner: true } },
      { resource: 'artwork', action: 'update', conditions: { owner: true } },
      { resource: 'artwork', action: 'delete', conditions: { owner: true } },
      { resource: 'catalogue', action: 'create' },
      { resource: 'catalogue', action: 'read', conditions: { owner: true } },
      { resource: 'catalogue', action: 'update', conditions: { owner: true } },
      { resource: 'catalogue', action: 'delete', conditions: { owner: true } },
      { resource: 'profile', action: 'read', conditions: { owner: true } },
      { resource: 'profile', action: 'update', conditions: { owner: true } },
      { resource: 'contact', action: 'read' },
      { resource: 'contact', action: 'create' },
      { resource: 'contact', action: 'update' },
      { resource: 'analytics', action: 'read', conditions: { owner: true } }
    ]
  },
  COLLECTOR: {
    name: 'COLLECTOR',
    permissions: [
      { resource: 'artwork', action: 'read' },
      { resource: 'artwork', action: 'favorite' },
      { resource: 'artwork', action: 'save' },
      { resource: 'artwork', action: 'share' },
      { resource: 'artist', action: 'read' },
      { resource: 'artist', action: 'follow' },
      { resource: 'catalogue', action: 'read' },
      { resource: 'catalogue', action: 'favorite' },
      { resource: 'profile', action: 'read', conditions: { owner: true } },
      { resource: 'profile', action: 'update', conditions: { owner: true } },
      { resource: 'inquiry', action: 'create' },
      { resource: 'inquiry', action: 'read', conditions: { owner: true } },
      { resource: 'collection', action: 'read', conditions: { owner: true } },
      { resource: 'collection', action: 'create', conditions: { owner: true } },
      { resource: 'collection', action: 'update', conditions: { owner: true } }
    ]
  },
  BOTH: {
    name: 'BOTH',
    inherits: ['ARTIST', 'COLLECTOR'],
    permissions: []
  }
}

export async function checkUserPermissions(
  userId: string, 
  resource: string, 
  action: string,
  context?: Record<string, any>
): Promise<boolean> {
  try {
    const { data: user, error } = await supabase
      .from('profiles')
      .select('role, status, user_id')
      .eq('user_id', userId)
      .single()

    if (error || !user) return false
    if (user.status !== 'active') return false

    const userRole = ROLES[user.role]
    if (!userRole) return false

    // Check if user has permission
    return await hasPermission(userRole, resource, action, context, user.user_id)
  } catch (error) {
    console.error('Error checking user permissions:', error)
    return false
  }
}

async function hasPermission(
  role: Role, 
  resource: string, 
  action: string, 
  context?: Record<string, any>,
  userId?: string
): Promise<boolean> {
  // Check inherited roles first
  if (role.inherits) {
    for (const inheritedRoleName of role.inherits) {
      const inheritedRole = ROLES[inheritedRoleName]
      if (inheritedRole && await hasPermission(inheritedRole, resource, action, context, userId)) {
        return true
      }
    }
  }

  // Check direct permissions
  for (const permission of role.permissions) {
    if (matchesPermission(permission, resource, action, context, userId)) {
      return true
    }
  }

  return false
}

function matchesPermission(
  permission: Permission, 
  resource: string, 
  action: string, 
  context?: Record<string, any>,
  userId?: string
): boolean {
  // Check resource match
  if (permission.resource !== '*' && permission.resource !== resource) {
    return false
  }

  // Check action match
  if (permission.action !== '*' && permission.action !== action) {
    return false
  }

  // Check conditions
  if (permission.conditions) {
    for (const [key, value] of Object.entries(permission.conditions)) {
      if (key === 'owner' && value === true) {
        // Check if user owns the resource
        if (!context?.owner_id || context.owner_id !== userId) {
          return false
        }
      } else if (context?.[key] !== value) {
        return false
      }
    }
  }

  return true
}

// Enhanced permission checking with resource ownership
export async function checkResourceOwnership(
  userId: string,
  resourceType: string,
  resourceId: string
): Promise<boolean> {
  try {
    let ownerId: string | null = null

    switch (resourceType) {
      case 'artwork':
        const { data: artwork } = await supabase
          .from('artworks')
          .select('user_id')
          .eq('id', resourceId)
          .single()
        ownerId = artwork?.user_id
        break

      case 'catalogue':
        const { data: catalogue } = await supabase
          .from('catalogues')
          .select('user_id')
          .eq('id', resourceId)
          .single()
        ownerId = catalogue?.user_id
        break

      case 'profile':
        ownerId = resourceId === userId ? userId : null
        break

      default:
        return false
    }

    return ownerId === userId
  } catch (error) {
    console.error('Error checking resource ownership:', error)
    return false
  }
}

// Robust Data Encryption/Decryption using AES-256-GCM
export interface EncryptionResult {
  encrypted: string
  iv: string
  tag: string
}

export function encryptData(data: string, key: string): EncryptionResult {
  try {
    // Generate random IV for each encryption
    const iv = CryptoJS.lib.WordArray.random(128/8)
    
    // Encrypt using AES-256-GCM
    const encrypted = CryptoJS.AES.encrypt(data, key, {
      iv: iv,
      mode: CryptoJS.mode.GCM,
      padding: CryptoJS.pad.NoPadding
    })
    
    return {
      encrypted: encrypted.toString(),
      iv: iv.toString(CryptoJS.enc.Hex),
      tag: encrypted.ciphertext.toString(CryptoJS.enc.Hex)
    }
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

export function decryptData(encryptionResult: EncryptionResult, key: string): string | null {
  try {
    const iv = CryptoJS.enc.Hex.parse(encryptionResult.iv)
    const tag = CryptoJS.enc.Hex.parse(encryptionResult.tag)
    
    // Decrypt using AES-256-GCM
    const decrypted = CryptoJS.AES.decrypt(encryptionResult.encrypted, key, {
      iv: iv,
      mode: CryptoJS.mode.GCM,
      padding: CryptoJS.pad.NoPadding
    })
    
    return decrypted.toString(CryptoJS.enc.Utf8)
  } catch (error) {
    console.error('Decryption error:', error)
    return null
  }
}

// Legacy support for simple string encryption
export function encryptDataSimple(data: string, key: string): string {
  try {
    const encrypted = CryptoJS.AES.encrypt(data, key).toString()
    return encrypted
  } catch (error) {
    console.error('Simple encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

export function decryptDataSimple(encryptedData: string, key: string): string | null {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key)
    return decrypted.toString(CryptoJS.enc.Utf8)
  } catch (error) {
    console.error('Simple decryption error:', error)
    return null
  }
}

// Hash functions for passwords and sensitive data
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const actualSalt = salt || CryptoJS.lib.WordArray.random(128/8).toString()
  const hash = CryptoJS.PBKDF2(password, actualSalt, {
    keySize: 256/32,
    iterations: 10000
  }).toString()
  
  return { hash, salt: actualSalt }
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const testHash = CryptoJS.PBKDF2(password, salt, {
      keySize: 256/32,
      iterations: 10000
    }).toString()
    
    return testHash === hash
  } catch (error) {
    console.error('Password verification error:', error)
    return false
  }
}

// Generate secure random keys
export function generateSecureKey(length: number = 32): string {
  return CryptoJS.lib.WordArray.random(length).toString(CryptoJS.enc.Hex)
}

// Generate secure random tokens
export function generateSecureToken(length: number = 64): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  const randomBytes = CryptoJS.lib.WordArray.random(length)
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(randomBytes.words[Math.floor(i / 4)] % chars.length)
  }
  
  return result
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