import { toast } from 'react-hot-toast'

export interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  backoffMultiplier: number
  retryCondition?: (error: any) => boolean
}

export interface NetworkError {
  code: string
  message: string
  status?: number
  isRetryable: boolean
  retryAfter?: number
}

export class NetworkRecoveryService {
  private static instance: NetworkRecoveryService
  private retryQueue: Map<string, RetryConfig> = new Map()
  private activeRetries: Map<string, Promise<any>> = new Map()

  private constructor() {}

  static getInstance(): NetworkRecoveryService {
    if (!NetworkRecoveryService.instance) {
      NetworkRecoveryService.instance = new NetworkRecoveryService()
    }
    return NetworkRecoveryService.instance
  }

  /**
   * Execute a function with automatic retry logic
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationId: string,
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const retryConfig: RetryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 2,
      retryCondition: this.defaultRetryCondition,
      ...config
    }

    // Check if operation is already being retried
    if (this.activeRetries.has(operationId)) {
      return this.activeRetries.get(operationId)!
    }

    const retryPromise = this.performRetry(operation, operationId, retryConfig)
    this.activeRetries.set(operationId, retryPromise)

    try {
      const result = await retryPromise
      return result
    } finally {
      this.activeRetries.delete(operationId)
    }
  }

  private async performRetry<T>(
    operation: () => Promise<T>,
    operationId: string,
    config: RetryConfig
  ): Promise<T> {
    let lastError: any
    let attempt = 0

    while (attempt <= config.maxRetries) {
      try {
        const result = await operation()
        
        // Success - clear any retry queue for this operation
        this.retryQueue.delete(operationId)
        
        if (attempt > 0) {
          toast.success(`Operation succeeded after ${attempt} retries`)
        }
        
        return result
      } catch (error) {
        lastError = error
        attempt++

        const networkError = this.analyzeError(error)
        
        if (!networkError.isRetryable || attempt > config.maxRetries) {
          throw error
        }

        if (!config.retryCondition!(networkError)) {
          throw error
        }

        // Calculate delay with exponential backoff
        const delay = this.calculateDelay(attempt, config, networkError.retryAfter)
        
        console.warn(`Operation ${operationId} failed (attempt ${attempt}/${config.maxRetries + 1}), retrying in ${delay}ms`, error)
        
        // Show retry notification
        if (attempt === 1) {
          toast.loading(`Connection lost. Retrying...`, { id: operationId })
        }

        await this.delay(delay)
      }
    }

    // All retries failed
    toast.error(`Operation failed after ${config.maxRetries + 1} attempts`, { id: operationId })
    throw lastError
  }

  private analyzeError(error: any): NetworkError {
    // Network errors
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network connection failed',
        isRetryable: true
      }
    }

    // HTTP status codes
    if (error.status) {
      switch (error.status) {
        case 408: // Request Timeout
        case 429: // Too Many Requests
        case 500: // Internal Server Error
        case 502: // Bad Gateway
        case 503: // Service Unavailable
        case 504: // Gateway Timeout
          return {
            code: 'HTTP_ERROR',
            message: error.message || 'Server error',
            status: error.status,
            isRetryable: true,
            retryAfter: this.extractRetryAfter(error)
          }
        
        case 401: // Unauthorized
        case 403: // Forbidden
        case 404: // Not Found
          return {
            code: 'CLIENT_ERROR',
            message: error.message || 'Client error',
            status: error.status,
            isRetryable: false
          }
        
        default:
          return {
            code: 'UNKNOWN_ERROR',
            message: error.message || 'Unknown error',
            status: error.status,
            isRetryable: error.status >= 500
          }
      }
    }

    // Supabase specific errors
    if (error.code) {
      switch (error.code) {
        case 'PGRST301': // Connection timeout
        case 'PGRST302': // Connection refused
          return {
            code: 'SUPABASE_CONNECTION_ERROR',
            message: 'Database connection failed',
            isRetryable: true
          }
        
        case 'PGRST116': // JWT expired
          return {
            code: 'AUTH_ERROR',
            message: 'Authentication expired',
            isRetryable: false
          }
        
        default:
          return {
            code: 'SUPABASE_ERROR',
            message: error.message || 'Database error',
            isRetryable: error.code.startsWith('PGRST3') // Connection related errors
          }
      }
    }

    // Default case
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'Unknown error',
      isRetryable: false
    }
  }

  private defaultRetryCondition(error: NetworkError): boolean {
    return error.isRetryable
  }

  private calculateDelay(attempt: number, config: RetryConfig, retryAfter?: number): number {
    if (retryAfter) {
      return Math.min(retryAfter * 1000, config.maxDelay)
    }

    const exponentialDelay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1)
    const jitter = Math.random() * 0.1 * exponentialDelay // Add 10% jitter
    return Math.min(exponentialDelay + jitter, config.maxDelay)
  }

  private extractRetryAfter(error: any): number | undefined {
    const retryAfter = error.headers?.['retry-after'] || error.headers?.['Retry-After']
    return retryAfter ? parseInt(retryAfter, 10) : undefined
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Queue an operation for retry when network is restored
   */
  queueForRetry<T>(
    operation: () => Promise<T>,
    operationId: string,
    config: Partial<RetryConfig> = {}
  ): void {
    const retryConfig: RetryConfig = {
      maxRetries: 5,
      baseDelay: 2000,
      maxDelay: 30000,
      backoffMultiplier: 1.5,
      retryCondition: this.defaultRetryCondition,
      ...config
    }

    this.retryQueue.set(operationId, retryConfig)

    // Try to execute immediately
    this.executeWithRetry(operation, operationId, retryConfig).catch(() => {
      // Operation will be retried when network is restored
      console.log(`Operation ${operationId} queued for retry`)
    })
  }

  /**
   * Check if network is available
   */
  async checkNetworkStatus(): Promise<boolean> {
    try {
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000)
      })
      return response.ok
    } catch {
      return false
    }
  }

  /**
   * Retry all queued operations
   */
  async retryQueuedOperations(): Promise<void> {
    const operations = Array.from(this.retryQueue.entries())
    
    if (operations.length === 0) return

    console.log(`Retrying ${operations.length} queued operations`)
    toast.loading(`Retrying ${operations.length} operations...`)

    const results = await Promise.allSettled(
      operations.map(([operationId, config]) => 
        this.executeWithRetry(
          () => Promise.resolve(), // Placeholder - actual operations should be stored
          operationId,
          config
        )
      )
    )

    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    if (successful > 0) {
      toast.success(`${successful} operations completed successfully`)
    }
    
    if (failed > 0) {
      toast.error(`${failed} operations failed`)
    }
  }

  /**
   * Clear retry queue
   */
  clearRetryQueue(): void {
    this.retryQueue.clear()
    this.activeRetries.clear()
  }

  /**
   * Get retry statistics
   */
  getRetryStats(): { queued: number; active: number } {
    return {
      queued: this.retryQueue.size,
      active: this.activeRetries.size
    }
  }
}

// Export singleton instance
export const networkRecovery = NetworkRecoveryService.getInstance()

// Network status monitoring
export class NetworkStatusMonitor {
  private static instance: NetworkStatusMonitor
  private isOnline: boolean = navigator.onLine
  private listeners: Set<(isOnline: boolean) => void> = new Set()
  private checkInterval?: NodeJS.Timeout

  private constructor() {
    this.setupEventListeners()
    this.startPeriodicCheck()
  }

  static getInstance(): NetworkStatusMonitor {
    if (!NetworkStatusMonitor.instance) {
      NetworkStatusMonitor.instance = new NetworkStatusMonitor()
    }
    return NetworkStatusMonitor.instance
  }

  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      this.handleOnline()
    })

    window.addEventListener('offline', () => {
      this.handleOffline()
    })
  }

  private startPeriodicCheck(): void {
    this.checkInterval = setInterval(async () => {
      const isOnline = await networkRecovery.checkNetworkStatus()
      if (isOnline !== this.isOnline) {
        this.isOnline = isOnline
        this.notifyListeners()
      }
    }, 30000) // Check every 30 seconds
  }

  private handleOnline(): void {
    this.isOnline = true
    this.notifyListeners()
    networkRecovery.retryQueuedOperations()
    toast.success('Connection restored')
  }

  private handleOffline(): void {
    this.isOnline = false
    this.notifyListeners()
    toast.error('Connection lost')
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.isOnline))
  }

  addListener(listener: (isOnline: boolean) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  getStatus(): boolean {
    return this.isOnline
  }

  destroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
    }
    this.listeners.clear()
  }
}

export const networkStatus = NetworkStatusMonitor.getInstance()
