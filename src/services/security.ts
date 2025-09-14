import { z } from 'zod'

// Input validation schemas
export const artworkSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  medium: z.string().max(100, 'Medium too long').optional(),
  dimensions: z.string().max(100, 'Dimensions too long').optional(),
  year: z.number().int().min(1000).max(new Date().getFullYear() + 1).optional(),
  price: z.string().regex(/^\d+(\.\d{2})?$/, 'Invalid price format').optional(),
  currency: z.string().length(3, 'Invalid currency code').optional(),
  isForSale: z.boolean().default(false),
  primaryImageUrl: z.string().url('Invalid image URL').optional(),
  artistId: z.string().uuid('Invalid artist ID'),
  tags: z.array(z.string().max(50)).max(10, 'Too many tags').optional()
})

export const artistSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  bio: z.string().max(1000, 'Bio too long').optional(),
  nationality: z.string().max(50, 'Nationality too long').optional(),
  birthYear: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  deathYear: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  location: z.string().max(100, 'Location too long').optional(),
  education: z.string().max(500, 'Education too long').optional(),
  website: z.string().url('Invalid website URL').optional(),
  instagram: z.string().max(50, 'Instagram handle too long').optional(),
  avatarUrl: z.string().url('Invalid avatar URL').optional()
})

export const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  role: z.enum(['COLLECTOR', 'ARTIST', 'GALLERY', 'ADMIN']),
  bio: z.string().max(1000, 'Bio too long').optional(),
  location: z.string().max(100, 'Location too long').optional(),
  website: z.string().url('Invalid website URL').optional()
})

// Rate limiting
class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map()
  private readonly windowMs: number
  private readonly maxRequests: number

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const record = this.requests.get(identifier)

    if (!record || now > record.resetTime) {
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      })
      return true
    }

    if (record.count >= this.maxRequests) {
      return false
    }

    record.count++
    return true
  }

  getRemainingRequests(identifier: string): number {
    const record = this.requests.get(identifier)
    if (!record) return this.maxRequests
    return Math.max(0, this.maxRequests - record.count)
  }

  getResetTime(identifier: string): number {
    const record = this.requests.get(identifier)
    return record?.resetTime || Date.now() + this.windowMs
  }
}

export const rateLimiter = new RateLimiter(60000, 100) // 100 requests per minute
export const strictRateLimiter = new RateLimiter(60000, 10) // 10 requests per minute for sensitive operations

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .slice(0, 1000) // Limit length
}

export function sanitizeHtml(html: string): string {
  // Basic HTML sanitization - in production, use a proper library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
}

// CSRF protection
export function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function validateCSRFToken(token: string, sessionToken: string): boolean {
  return token === sessionToken && token.length > 0
}

// File upload validation
export const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
export const maxFileSize = 10 * 1024 * 1024 // 10MB

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!allowedImageTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' }
  }

  if (file.size > maxFileSize) {
    return { valid: false, error: 'File too large. Maximum size is 10MB.' }
  }

  return { valid: true }
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

// Password validation
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// JWT token validation
export function validateJWTToken(token: string): { valid: boolean; payload?: any; error?: string } {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid token format' }
    }

    const payload = JSON.parse(atob(parts[1]))
    const now = Math.floor(Date.now() / 1000)

    if (payload.exp && payload.exp < now) {
      return { valid: false, error: 'Token expired' }
    }

    if (payload.iat && payload.iat > now) {
      return { valid: false, error: 'Token issued in the future' }
    }

    return { valid: true, payload }
  } catch (error) {
    return { valid: false, error: 'Invalid token' }
  }
}

// API key validation
export function validateAPIKey(apiKey: string): boolean {
  // In production, validate against database
  const validKeys = process.env.VALID_API_KEYS?.split(',') || []
  return validKeys.includes(apiKey)
}

// Request logging for security monitoring
export function logSecurityEvent(event: string, details: any, severity: 'low' | 'medium' | 'high' = 'medium') {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details,
    severity,
    ip: details.ip || 'unknown',
    userAgent: details.userAgent || 'unknown'
  }

  // In production, send to security monitoring service
  console.log(`[SECURITY ${severity.toUpperCase()}]`, logEntry)
}

// Content Security Policy
export const cspDirectives = {
  "default-src": ["'self'"],
  "script-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
  "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  "img-src": ["'self'", "data:", "https:", "blob:"],
  "font-src": ["'self'", "https://fonts.gstatic.com"],
  "connect-src": ["'self'", "https://api.supabase.co"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'none'"]
}

export function getCSPHeader(): string {
  return Object.entries(cspDirectives)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ')
}

// Error handling with security considerations
export class SecurityError extends Error {
  constructor(message: string, public code: string, public statusCode: number = 400) {
    super(message)
    this.name = 'SecurityError'
  }
}

export function handleSecurityError(error: any, context: string): never {
  logSecurityEvent('security_error', {
    error: error.message,
    context,
    stack: error.stack
  }, 'high')

  throw new SecurityError(
    'A security error occurred. Please try again.',
    'SECURITY_ERROR',
    500
  )
}

// Data validation wrapper
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      throw new SecurityError(`Validation failed: ${message}`, 'VALIDATION_ERROR', 400)
    }
    throw error
  }
}

// Request validation middleware
export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return (req: any, res: any, next: any) => {
    try {
      req.validatedData = validateData(schema, req.body)
      next()
    } catch (error) {
      if (error instanceof SecurityError) {
        res.status(error.statusCode).json({ error: error.message })
      } else {
        res.status(500).json({ error: 'Internal server error' })
      }
    }
  }
}
