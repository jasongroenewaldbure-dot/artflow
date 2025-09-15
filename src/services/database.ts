// Comprehensive Database Connection and Error Recovery Service
import { supabase } from '../lib/supabase'
import { logSecurityEvent } from './security'

export interface DatabaseError {
  code: string
  message: string
  details?: string
  hint?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  retryable: boolean
}

export interface QueryOptions {
  retries?: number
  timeout?: number
  fallback?: any
  logErrors?: boolean
}

// Error classification
function classifyError(error: any): DatabaseError {
  const code = error.code || 'UNKNOWN'
  const message = error.message || 'Unknown database error'
  
  // PostgreSQL error codes
  const errorMap: Record<string, Partial<DatabaseError>> = {
    '23505': { // Unique violation
      severity: 'medium',
      retryable: false,
      message: 'This record already exists'
    },
    '23503': { // Foreign key violation
      severity: 'medium',
      retryable: false,
      message: 'Referenced record does not exist'
    },
    '23502': { // Not null violation
      severity: 'medium',
      retryable: false,
      message: 'Required field is missing'
    },
    '42P01': { // Undefined table
      severity: 'critical',
      retryable: false,
      message: 'Database table does not exist'
    },
    '42703': { // Undefined column
      severity: 'critical',
      retryable: false,
      message: 'Database column does not exist'
    },
    '08006': { // Connection failure
      severity: 'high',
      retryable: true,
      message: 'Database connection failed'
    },
    '53300': { // Too many connections
      severity: 'high',
      retryable: true,
      message: 'Too many database connections'
    },
    'PGRST116': { // PostgREST error
      severity: 'medium',
      retryable: true,
      message: 'Database service temporarily unavailable'
    }
  }

  const errorInfo = errorMap[code] || {
    severity: 'medium' as const,
    retryable: true
  }

  return {
    code,
    message: errorInfo.message || message,
    details: error.details,
    hint: error.hint,
    severity: errorInfo.severity || 'medium',
    retryable: errorInfo.retryable || false
  }
}

// Retry mechanism with exponential backoff
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      const dbError = classifyError(error)
      
      if (!dbError.retryable || attempt === maxRetries) {
        throw error
      }

      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

// Enhanced query wrapper with error handling
export async function safeQuery<T>(
  operation: () => Promise<{ data: T | null; error: any }>,
  options: QueryOptions = {}
): Promise<{ data: T | null; error: DatabaseError | null }> {
  const {
    retries = 3,
    timeout = 30000,
    fallback = null,
    logErrors = true
  } = options

  try {
    // Add timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout')), timeout)
    })

    const result = await Promise.race([
      retryWithBackoff(operation, retries),
      timeoutPromise
    ]) as { data: T | null; error: any }

    if (result.error) {
      const dbError = classifyError(result.error)
      
      if (logErrors) {
        await logSecurityEvent(
          null,
          'database_error',
          { error: dbError, operation: operation.toString() },
          dbError.severity
        )
      }

      return { data: fallback, error: dbError }
    }

    return { data: result.data, error: null }
  } catch (error) {
    const dbError = classifyError(error)
    
    if (logErrors) {
      await logSecurityEvent(
        null,
        'database_error',
        { error: dbError, operation: operation.toString() },
        dbError.severity
      )
    }

    return { data: fallback, error: dbError }
  }
}

// Connection health check
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean
  latency: number
  error?: string
}> {
  const startTime = Date.now()
  
  try {
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
      .single()

    const latency = Date.now() - startTime

    if (error) {
      return {
        healthy: false,
        latency,
        error: error.message
      }
    }

    return {
      healthy: true,
      latency
    }
  } catch (error) {
    return {
      healthy: false,
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Connection pool monitoring
class ConnectionPoolMonitor {
  private activeConnections = 0
  private maxConnections = 100
  private connectionQueue: Array<() => void> = []

  async acquireConnection(): Promise<void> {
    return new Promise((resolve) => {
      if (this.activeConnections < this.maxConnections) {
        this.activeConnections++
        resolve()
      } else {
        this.connectionQueue.push(resolve)
      }
    })
  }

  releaseConnection(): void {
    this.activeConnections--
    
    if (this.connectionQueue.length > 0) {
      const next = this.connectionQueue.shift()
      if (next) {
        this.activeConnections++
        next()
      }
    }
  }

  getStats() {
    return {
      active: this.activeConnections,
      max: this.maxConnections,
      queued: this.connectionQueue.length
    }
  }
}

const connectionPool = new ConnectionPoolMonitor()

// Enhanced database operations with connection pooling
export async function withConnection<T>(
  operation: () => Promise<T>
): Promise<T> {
  await connectionPool.acquireConnection()
  
  try {
    return await operation()
  } finally {
    connectionPool.releaseConnection()
  }
}

// Transaction wrapper
export async function withTransaction<T>(
  operations: Array<() => Promise<any>>
): Promise<{ success: boolean; results?: T[]; error?: DatabaseError }> {
  try {
    const results: T[] = []
    
    for (const operation of operations) {
      const result = await withConnection(operation)
      results.push(result)
    }

    return { success: true, results }
  } catch (error) {
    const dbError = classifyError(error)
    
    await logSecurityEvent(
      null,
      'transaction_failed',
      { error: dbError, operations: operations.length },
      dbError.severity
    )

    return { success: false, error: dbError }
  }
}

// Cached queries with TTL
const queryCache = new Map<string, { data: any; expires: number }>()

export async function cachedQuery<T>(
  key: string,
  operation: () => Promise<T>,
  ttlMs: number = 5 * 60 * 1000 // 5 minutes
): Promise<T> {
  const cached = queryCache.get(key)
  
  if (cached && Date.now() < cached.expires) {
    return cached.data
  }

  const result = await operation()
  
  queryCache.set(key, {
    data: result,
    expires: Date.now() + ttlMs
  })

  return result
}

// Clear cache
export function clearCache(pattern?: string): void {
  if (pattern) {
    const regex = new RegExp(pattern)
    for (const key of queryCache.keys()) {
      if (regex.test(key)) {
        queryCache.delete(key)
      }
    }
  } else {
    queryCache.clear()
  }
}

// Batch operations
export async function batchInsert<T>(
  table: string,
  records: T[],
  batchSize: number = 100
): Promise<{ success: boolean; inserted: number; errors: DatabaseError[] }> {
  const errors: DatabaseError[] = []
  let inserted = 0

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize)
    
    try {
      const { error } = await supabase
        .from(table)
        .insert(batch)

      if (error) {
        const dbError = classifyError(error)
        errors.push(dbError)
      } else {
        inserted += batch.length
      }
    } catch (error) {
      const dbError = classifyError(error)
      errors.push(dbError)
    }
  }

  return {
    success: errors.length === 0,
    inserted,
    errors
  }
}

// Database migration helper
export async function runMigration(
  name: string,
  up: () => Promise<void>,
  down: () => Promise<void>
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if migration already ran
    const { data: existing } = await supabase
      .from('migrations')
      .select('id')
      .eq('name', name)
      .single()

    if (existing) {
      return { success: true }
    }

    // Run migration
    await up()

    // Record migration
    await supabase
      .from('migrations')
      .insert({
        name,
        executed_at: new Date().toISOString()
      })

    return { success: true }
  } catch (error) {
    const dbError = classifyError(error)
    
    await logSecurityEvent(
      null,
      'migration_failed',
      { migration: name, error: dbError },
      'critical'
    )

    return { success: false, error: dbError.message }
  }
}

// Database statistics
export async function getDatabaseStats(): Promise<{
  health: Awaited<ReturnType<typeof checkDatabaseHealth>>
  connections: ReturnType<ConnectionPoolMonitor['getStats']>
  cacheSize: number
}> {
  const health = await checkDatabaseHealth()
  const connections = connectionPool.getStats()
  const cacheSize = queryCache.size

  return {
    health,
    connections,
    cacheSize
  }
}

// Auto-recovery mechanisms
export async function enableAutoRecovery(): Promise<void> {
  // Health check every 30 seconds
  setInterval(async () => {
    const health = await checkDatabaseHealth()
    
    if (!health.healthy) {
      console.warn('Database health check failed:', health.error)
      
      // Attempt to clear connection pool
      connectionPool.releaseConnection()
      
      // Clear cache to force fresh queries
      clearCache()
    }
  }, 30000)

  // Connection pool monitoring
  setInterval(() => {
    const stats = connectionPool.getStats()
    
    if (stats.active > stats.max * 0.9) {
      console.warn('High connection usage:', stats)
    }
  }, 60000)
}

// Initialize auto-recovery
if (typeof window !== 'undefined') {
  enableAutoRecovery()
}
