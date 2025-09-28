// Professional logging service to replace console.log pollution
// Inspired by production-grade logging systems

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, unknown>
  userId?: string
  sessionId?: string
  component?: string
  action?: string
  error?: Error
  stack?: string
}

export interface LoggerConfig {
  level: LogLevel
  enableConsole: boolean
  enableRemote: boolean
  remoteEndpoint?: string
  apiKey?: string
  bufferSize: number
  flushInterval: number
  enablePerformance: boolean
  enableUserTracking: boolean
}

class Logger {
  private config: LoggerConfig
  private buffer: LogEntry[] = []
  private flushTimer: NodeJS.Timeout | null = null
  private sessionId: string
  private userId: string | null = null

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enableRemote: false,
      bufferSize: 100,
      flushInterval: 5000, // 5 seconds
      enablePerformance: true,
      enableUserTracking: true,
      ...config
    }

    this.sessionId = this.generateSessionId()
    this.startFlushTimer()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  setUserId(userId: string | null): void {
    this.userId = userId
  }

  setLogLevel(level: LogLevel): void {
    this.config.level = level
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context)
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context)
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context)
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, { ...context, error: error?.message, stack: error?.stack })
  }

  fatal(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log(LogLevel.FATAL, message, { ...context, error: error?.message, stack: error?.stack })
    this.flush() // Immediately flush fatal errors
  }

  // Specialized logging methods
  userAction(action: string, userId: string, context?: Record<string, unknown>): void {
    this.info(`User action: ${action}`, {
      ...context,
      userId,
      action,
      component: 'user-tracking'
    })
  }

  apiCall(method: string, endpoint: string, status: number, duration: number, context?: Record<string, unknown>): void {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO
    this.log(level, `API ${method} ${endpoint} - ${status}`, {
      ...context,
      method,
      endpoint,
      status,
      duration,
      component: 'api'
    })
  }

  performance(metric: string, value: number, unit: string = 'ms', context?: Record<string, unknown>): void {
    if (!this.config.enablePerformance) return
    
    this.info(`Performance: ${metric}`, {
      ...context,
      metric,
      value,
      unit,
      component: 'performance'
    })
  }

  componentError(component: string, error: Error, context?: Record<string, unknown>): void {
    this.error(`Component error in ${component}`, error, {
      ...context,
      component,
      errorBoundary: true
    })
  }

  authEvent(event: string, userId?: string, context?: Record<string, unknown>): void {
    this.info(`Auth: ${event}`, {
      ...context,
      userId,
      event,
      component: 'auth'
    })
  }

  searchEvent(query: string, resultsCount: number, filters?: Record<string, unknown>): void {
    this.info('Search performed', {
      query: query.substring(0, 100), // Truncate long queries
      resultsCount,
      filters,
      component: 'search'
    })
  }

  artworkInteraction(action: string, artworkId: string, context?: Record<string, unknown>): void {
    this.info(`Artwork ${action}`, {
      ...context,
      artworkId,
      action,
      component: 'artwork'
    })
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (level < this.config.level) return

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      userId: this.userId || undefined,
      sessionId: this.sessionId,
      component: typeof context?.component === 'string' ? context.component : undefined,
      action: typeof context?.action === 'string' ? context.action : undefined
    }

    // Console logging for development
    if (this.config.enableConsole) {
      this.logToConsole(entry)
    }

    // Buffer for remote logging
    if (this.config.enableRemote) {
      this.buffer.push(entry)
      
      if (this.buffer.length >= this.config.bufferSize) {
        this.flush()
      }
    }
  }

  private logToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.split('T')[1].split('.')[0]
    const levelName = LogLevel[entry.level]
    const prefix = `[${timestamp}] [${levelName}]`
    
    const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : ''
    const fullMessage = `${prefix} ${entry.message}${contextStr}`

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(fullMessage)
        break
      case LogLevel.INFO:
        console.info(fullMessage)
        break
      case LogLevel.WARN:
        console.warn(fullMessage)
        break
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(fullMessage)
        if (entry.context?.stack) {
          console.error(entry.context.stack)
        }
        break
    }
  }

  private async flush(): Promise<void> {
    if (this.buffer.length === 0 || !this.config.enableRemote) return

    const entries = [...this.buffer]
    this.buffer = []

    try {
      if (this.config.remoteEndpoint) {
        await fetch(this.config.remoteEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
          },
          body: JSON.stringify({ entries })
        })
      }
    } catch (error) {
      // Fallback to console if remote logging fails
      console.error('Failed to send logs to remote endpoint:', error)
      entries.forEach(entry => this.logToConsole(entry))
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush()
    }, this.config.flushInterval)
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = null
    }
    this.flush() // Final flush
  }
}

// Global logger instance - simplified for immediate functionality
export const logger = new Logger({
  level: LogLevel.INFO,
  enableConsole: true,
  enableRemote: false
})

// Convenience functions for common patterns
export const logUserAction = (action: string, userId: string, context?: Record<string, unknown>) => {
  logger.userAction(action, userId, context)
}

export const logApiCall = (method: string, endpoint: string, status: number, duration: number, context?: Record<string, unknown>) => {
  logger.apiCall(method, endpoint, status, duration, context)
}

export const logError = (message: string, error?: Error, context?: Record<string, unknown>) => {
  logger.error(message, error, context)
}

export const logPerformance = (metric: string, value: number, unit?: string, context?: Record<string, unknown>) => {
  logger.performance(metric, value, unit, context)
}

export const logComponentError = (component: string, error: Error, context?: Record<string, unknown>) => {
  logger.componentError(component, error, context)
}

// Hook for React components
export const useLogger = (component: string) => {
  return {
    debug: (message: string, context?: Record<string, unknown>) => 
      logger.debug(message, { ...context, component }),
    info: (message: string, context?: Record<string, unknown>) => 
      logger.info(message, { ...context, component }),
    warn: (message: string, context?: Record<string, unknown>) => 
      logger.warn(message, { ...context, component }),
    error: (message: string, error?: Error, context?: Record<string, unknown>) => 
      logger.error(message, error, { ...context, component }),
    userAction: (action: string, userId: string, context?: Record<string, unknown>) => 
      logger.userAction(action, userId, { ...context, component }),
    performance: (metric: string, value: number, unit?: string, context?: Record<string, unknown>) => 
      logger.performance(metric, value, unit, { ...context, component })
  }
}

// Performance measurement utilities
export const measureAsync = async <T>(
  name: string,
  fn: () => Promise<T>,
  component?: string
): Promise<T> => {
  const start = performance.now()
  try {
    const result = await fn()
    const duration = performance.now() - start
    logger.performance(name, duration, 'ms', { component })
    return result
  } catch (error) {
    const duration = performance.now() - start
    logger.error(`${name} failed after ${duration}ms`, error as Error, { component })
    throw error
  }
}

export const measureSync = <T>(
  name: string,
  fn: () => T,
  component?: string
): T => {
  const start = performance.now()
  try {
    const result = fn()
    const duration = performance.now() - start
    logger.performance(name, duration, 'ms', { component })
    return result
  } catch (error) {
    const duration = performance.now() - start
    logger.error(`${name} failed after ${duration}ms`, error as Error, { component })
    throw error
  }
}

// Initialize user tracking when auth changes
if (typeof window !== 'undefined') {
  // Listen for auth state changes to update user context
  window.addEventListener('auth-state-change', (event: Event) => {
    const customEvent = event as CustomEvent
    const { user } = customEvent.detail
    logger.setUserId(user?.id || null)
  })
}

export default logger
