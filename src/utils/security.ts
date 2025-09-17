// Browser-compatible crypto utilities
// Note: All crypto functions are implemented using browser-compatible methods

// CSRF Token Management
class CSRFManager {
  private tokens: Map<string, { token: string; expires: number }> = new Map()
  private readonly tokenExpiry = 60 * 60 * 1000 // 1 hour

  generateToken(sessionId: string): string {
    const token = this.generateRandomString(32)
    const expires = Date.now() + this.tokenExpiry
    
    this.tokens.set(sessionId, { token, expires })
    
    // Clean up expired tokens
    this.cleanup()
    
    return token
  }

  validateToken(sessionId: string, token: string): boolean {
    const stored = this.tokens.get(sessionId)
    
    if (!stored) return false
    if (Date.now() > stored.expires) {
      this.tokens.delete(sessionId)
      return false
    }
    
    return stored.token === token
  }

  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [sessionId, data] of this.tokens.entries()) {
      if (now > data.expires) {
        this.tokens.delete(sessionId)
      }
    }
  }
}

export const csrfManager = new CSRFManager()

// Input Sanitization
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000) // Limit length
}

// XSS Protection
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// SQL Injection Protection (for dynamic queries)
export function sanitizeSqlInput(input: string): string {
  return input
    .replace(/['";\\]/g, '') // Remove dangerous SQL characters
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove block comments start
    .replace(/\*\//g, '') // Remove block comments end
    .replace(/union/gi, '') // Remove UNION
    .replace(/select/gi, '') // Remove SELECT
    .replace(/insert/gi, '') // Remove INSERT
    .replace(/update/gi, '') // Remove UPDATE
    .replace(/delete/gi, '') // Remove DELETE
    .replace(/drop/gi, '') // Remove DROP
    .replace(/create/gi, '') // Remove CREATE
    .replace(/alter/gi, '') // Remove ALTER
    .replace(/exec/gi, '') // Remove EXEC
    .replace(/execute/gi, '') // Remove EXECUTE
}

// Session Security
export function generateSessionId(): string {
  return generateRandomString(32)
}

export function generateSecureToken(): string {
  return generateRandomString(32)
}

// Password Hashing (for additional security beyond Supabase)
export function hashPassword(password: string, salt: string): string {
  return hashString(password + salt)
}

// Browser-compatible random string generator
function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Browser-compatible hash function
function hashString(str: string): string {
  let hash = 0
  if (str.length === 0) return hash.toString()
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16)
}

// Device Fingerprinting
export function generateDeviceFingerprint(): string {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillText('Device fingerprint', 2, 2)
  }
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|')
  
  return hashString(fingerprint)
}

// IP Address Validation
export function isValidIP(ip: string): boolean {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip)
}

// Content Security Policy Headers
export function getCSPHeaders(): Record<string, string> {
  return {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'"
    ].join('; '),
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  }
}

// Brute Force Protection
export function detectBruteForce(attempts: number[], windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now()
  const recentAttempts = attempts.filter(time => now - time < windowMs)
  return recentAttempts.length >= 10 // 10 attempts in 15 minutes
}

// Suspicious Activity Detection
export function detectSuspiciousActivity(
  userAgent: string,
  ip: string,
  email: string,
  previousActivity?: any
): boolean {
  // Check for bot-like behavior
  const botPatterns = [
    /bot/i, /crawler/i, /spider/i, /scraper/i, /headless/i,
    /phantom/i, /selenium/i, /webdriver/i, /puppeteer/i
  ]
  
  if (botPatterns.some(pattern => pattern.test(userAgent))) {
    return true
  }
  
  // Check for rapid successive requests (implement based on your needs)
  // This would require tracking request timestamps
  
  return false
}

// Secure Headers for API responses
export function getSecurityHeaders(): Record<string, string> {
  return {
    ...getCSPHeaders(),
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-XSS-Protection': '1; mode=block',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
}
