interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private attempts: Map<string, RateLimitEntry> = new Map()
  private readonly maxAttempts: number
  private readonly windowMs: number

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) { // 5 attempts per 15 minutes
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const entry = this.attempts.get(identifier)

    if (!entry) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs })
      return true
    }

    // Reset if window has expired
    if (now > entry.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs })
      return true
    }

    // Check if limit exceeded
    if (entry.count >= this.maxAttempts) {
      return false
    }

    // Increment count
    entry.count++
    this.attempts.set(identifier, entry)
    return true
  }

  getRemainingAttempts(identifier: string): number {
    const entry = this.attempts.get(identifier)
    if (!entry) return this.maxAttempts

    const now = Date.now()
    if (now > entry.resetTime) {
      return this.maxAttempts
    }

    return Math.max(0, this.maxAttempts - entry.count)
  }

  getResetTime(identifier: string): number | null {
    const entry = this.attempts.get(identifier)
    if (!entry) return null

    const now = Date.now()
    if (now > entry.resetTime) return null

    return entry.resetTime
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier)
  }

  // Clean up expired entries periodically
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.attempts.entries()) {
      if (now > entry.resetTime) {
        this.attempts.delete(key)
      }
    }
  }
}

// Global rate limiters for different actions
export const authRateLimiter = new RateLimiter(5, 15 * 60 * 1000) // 5 attempts per 15 minutes
export const passwordResetRateLimiter = new RateLimiter(3, 60 * 60 * 1000) // 3 attempts per hour
export const magicLinkRateLimiter = new RateLimiter(3, 60 * 60 * 1000) // 3 attempts per hour

// Clean up expired entries every 5 minutes
setInterval(() => {
  authRateLimiter.cleanup()
  passwordResetRateLimiter.cleanup()
  magicLinkRateLimiter.cleanup()
}, 5 * 60 * 1000)

export function getRateLimitMessage(identifier: string, type: 'auth' | 'password-reset' | 'magic-link' = 'auth'): string {
  const limiter = type === 'auth' ? authRateLimiter : 
                  type === 'password-reset' ? passwordResetRateLimiter : 
                  magicLinkRateLimiter

  const remaining = limiter.getRemainingAttempts(identifier)
  const resetTime = limiter.getResetTime(identifier)

  if (remaining === 0) {
    const resetDate = new Date(resetTime!)
    const timeUntilReset = Math.ceil((resetTime! - Date.now()) / 60000) // minutes
    return `Too many attempts. Please try again in ${timeUntilReset} minutes.`
  }

  return `${remaining} attempts remaining`
}

export function formatTimeUntilReset(resetTime: number): string {
  const now = Date.now()
  const diff = resetTime - now

  if (diff <= 0) return 'now'

  const minutes = Math.ceil(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`
  }
  return `${minutes}m`
}
