// Comprehensive Stress Testing Service
import { supabase } from '../lib/supabase'
import { validateInput, VALIDATION_SCHEMAS } from './security'
import { safeQuery } from './database'

export interface StressTestResult {
  testName: string
  passed: boolean
  duration: number
  errors: string[]
  warnings: string[]
  metrics: {
    requestsPerSecond?: number
    averageResponseTime?: number
    memoryUsage?: number
    errorRate?: number
  }
}

export interface StressTestSuite {
  name: string
  tests: StressTestResult[]
  overallPassed: boolean
  totalDuration: number
  summary: {
    totalTests: number
    passedTests: number
    failedTests: number
    averageDuration: number
  }
}

class StressTester {
  private static readonly TIMEOUT = 30000 // 30 seconds
  private static readonly MAX_CONCURRENT = 10

  // Test database connections
  static async testDatabaseConnections(): Promise<StressTestResult> {
    const startTime = Date.now()
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // Test basic connection
      const { error: basicError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)

      if (basicError) {
        errors.push(`Basic connection failed: ${basicError.message}`)
      }

      // Test complex query
      const { error: complexError } = await supabase
        .from('artworks')
        .select(`
          *,
          user:profiles!artworks_user_id_fkey(*),
          artwork_metrics(*)
        `)
        .limit(10)

      if (complexError) {
        errors.push(`Complex query failed: ${complexError.message}`)
      }

      // Test concurrent connections
      const concurrentPromises = Array.from({ length: 5 }, () =>
        supabase.from('profiles').select('id').limit(1)
      )

      const results = await Promise.allSettled(concurrentPromises)
      const failedConcurrent = results.filter(r => r.status === 'rejected').length

      if (failedConcurrent > 0) {
        warnings.push(`${failedConcurrent} concurrent connections failed`)
      }

    } catch (error) {
      errors.push(`Database test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return {
      testName: 'Database Connections',
      passed: errors.length === 0,
      duration: Date.now() - startTime,
      errors,
      warnings,
      metrics: {
        errorRate: errors.length > 0 ? 1 : 0
      }
    }
  }

  // Test form validation
  static async testFormValidation(): Promise<StressTestResult> {
    const startTime = Date.now()
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // Test artwork validation
      const artworkData = {
        title: 'Test Artwork',
        description: 'A test artwork for validation',
        price: '1000.50',
        medium: 'Oil on Canvas',
        dimensions: '24x36',
        genre: 'Contemporary'
      }

      const artworkValidation = validateInput(artworkData, VALIDATION_SCHEMAS.artwork)
      if (!artworkValidation.valid) {
        errors.push(`Artwork validation failed: ${artworkValidation.errors.join(', ')}`)
      }

      // Test artist validation
      const artistData = {
        full_name: 'Test Artist',
        bio: 'A test artist bio',
        location: 'New York, NY',
        website: 'https://testartist.com',
        instagram: '@testartist'
      }

      const artistValidation = validateInput(artistData, VALIDATION_SCHEMAS.artist)
      if (!artistValidation.valid) {
        errors.push(`Artist validation failed: ${artistValidation.errors.join(', ')}`)
      }

      // Test contact validation
      const contactData = {
        full_name: 'Test Collector',
        email: 'test@example.com',
        organization: 'Test Gallery',
        phone_number: '+1234567890'
      }

      const contactValidation = validateInput(contactData, VALIDATION_SCHEMAS.contact)
      if (!contactValidation.valid) {
        errors.push(`Contact validation failed: ${contactValidation.errors.join(', ')}`)
      }

      // Test invalid data
      const invalidData = {
        title: '', // Empty required field
        price: 'invalid', // Invalid price format
        email: 'not-an-email' // Invalid email
      }

      const invalidValidation = validateInput(invalidData, VALIDATION_SCHEMAS.artwork)
      if (invalidValidation.valid) {
        errors.push('Invalid data validation should have failed')
      }

    } catch (error) {
      errors.push(`Form validation test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return {
      testName: 'Form Validation',
      passed: errors.length === 0,
      duration: Date.now() - startTime,
      errors,
      warnings,
      metrics: {}
    }
  }

  // Test API endpoints
  static async testAPIEndpoints(): Promise<StressTestResult> {
    const startTime = Date.now()
    const errors: string[] = []
    const warnings: string[] = []
    let requestsPerSecond = 0

    try {
      const endpoints = [
        { name: 'Artworks', query: () => supabase.from('artworks').select('*').limit(10) },
        { name: 'Artists', query: () => supabase.from('profiles').select('*').limit(10) },
        { name: 'Catalogues', query: () => supabase.from('catalogues').select('*').limit(10) }
      ]

      const testStartTime = Date.now()
      const promises = endpoints.map(async (endpoint) => {
        try {
          const { error } = await endpoint.query()
          if (error) {
            errors.push(`${endpoint.name} endpoint failed: ${error.message}`)
          }
        } catch (error) {
          errors.push(`${endpoint.name} endpoint error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      })

      await Promise.all(promises)
      const testDuration = Date.now() - testStartTime
      requestsPerSecond = (endpoints.length * 1000) / testDuration

    } catch (error) {
      errors.push(`API endpoints test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return {
      testName: 'API Endpoints',
      passed: errors.length === 0,
      duration: Date.now() - startTime,
      errors,
      warnings,
      metrics: {
        requestsPerSecond: Math.round(requestsPerSecond * 100) / 100
      }
    }
  }

  // Test error handling
  static async testErrorHandling(): Promise<StressTestResult> {
    const startTime = Date.now()
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // Test invalid queries
      const invalidQueries = [
        () => supabase.from('nonexistent_table').select('*'),
        () => supabase.from('artworks').select('nonexistent_column'),
        () => supabase.from('artworks').insert({ invalid_field: 'value' })
      ]

      for (const query of invalidQueries) {
        try {
          await query()
          errors.push('Invalid query should have failed')
        } catch (error) {
          // Expected to fail
        }
      }

      // Test safeQuery error handling
      const { data, error } = await safeQuery(
        () => supabase.from('nonexistent_table').select('*'),
        { fallback: null, logErrors: false }
      )

      if (error && data === null) {
        // Expected behavior
      } else {
        errors.push('SafeQuery error handling failed')
      }

    } catch (error) {
      errors.push(`Error handling test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return {
      testName: 'Error Handling',
      passed: errors.length === 0,
      duration: Date.now() - startTime,
      errors,
      warnings,
      metrics: {}
    }
  }

  // Test performance under load
  static async testPerformanceLoad(): Promise<StressTestResult> {
    const startTime = Date.now()
    const errors: string[] = []
    const warnings: string[] = []
    const responseTimes: number[] = []

    try {
      const loadTestPromises = Array.from({ length: 20 }, async (_, index) => {
        const requestStart = Date.now()
        
        try {
          const { error } = await supabase
            .from('artworks')
            .select('id, title, price')
            .limit(5)
            .offset(index * 5)

          const requestDuration = Date.now() - requestStart
          responseTimes.push(requestDuration)

          if (error) {
            errors.push(`Load test request ${index} failed: ${error.message}`)
          }
        } catch (error) {
          errors.push(`Load test request ${index} error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      })

      await Promise.all(loadTestPromises)

      const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      const maxResponseTime = Math.max(...responseTimes)

      if (maxResponseTime > 5000) {
        warnings.push(`Slow response time detected: ${maxResponseTime}ms`)
      }

    } catch (error) {
      errors.push(`Performance load test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return {
      testName: 'Performance Load',
      passed: errors.length === 0,
      duration: Date.now() - startTime,
      errors,
      warnings,
      metrics: {
        averageResponseTime: Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length),
        errorRate: errors.length / 20
      }
    }
  }

  // Test memory usage
  static async testMemoryUsage(): Promise<StressTestResult> {
    const startTime = Date.now()
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // Get initial memory usage
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0

      // Perform memory-intensive operations
      const largeDataPromises = Array.from({ length: 10 }, () =>
        supabase.from('artworks').select('*').limit(100)
      )

      await Promise.all(largeDataPromises)

      // Get final memory usage
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0
      const memoryIncrease = finalMemory - initialMemory

      if (memoryIncrease > 50 * 1024 * 1024) { // 50MB
        warnings.push(`High memory usage detected: ${Math.round(memoryIncrease / 1024 / 1024)}MB`)
      }

    } catch (error) {
      errors.push(`Memory usage test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return {
      testName: 'Memory Usage',
      passed: errors.length === 0,
      duration: Date.now() - startTime,
      errors,
      warnings,
      metrics: {
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 0
      }
    }
  }

  // Run all stress tests
  static async runStressTestSuite(): Promise<StressTestSuite> {
    const suiteStartTime = Date.now()
    const tests: StressTestResult[] = []

    console.log('Starting comprehensive stress test suite...')

    // Run all tests
    const testPromises = [
      this.testDatabaseConnections(),
      this.testFormValidation(),
      this.testAPIEndpoints(),
      this.testErrorHandling(),
      this.testPerformanceLoad(),
      this.testMemoryUsage()
    ]

    const results = await Promise.all(testPromises)
    tests.push(...results)

    const totalDuration = Date.now() - suiteStartTime
    const passedTests = tests.filter(t => t.passed).length
    const failedTests = tests.filter(t => !t.passed).length

    const suite: StressTestSuite = {
      name: 'Comprehensive Stress Test Suite',
      tests,
      overallPassed: failedTests === 0,
      totalDuration,
      summary: {
        totalTests: tests.length,
        passedTests,
        failedTests,
        averageDuration: Math.round(totalDuration / tests.length)
      }
    }

    // Log results
    console.log('Stress test suite completed:', {
      overallPassed: suite.overallPassed,
      totalDuration: `${totalDuration}ms`,
      passedTests,
      failedTests
    })

    // Log failed tests
    tests.filter(t => !t.passed).forEach(test => {
      console.error(`Failed test: ${test.testName}`, {
        errors: test.errors,
        warnings: test.warnings
      })
    })

    return suite
  }
}

// Export stress testing functions
export { StressTester }

// Auto-run stress tests in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Run stress tests after a delay to allow app to initialize
  setTimeout(() => {
    StressTester.runStressTestSuite().then(suite => {
      if (!suite.overallPassed) {
        console.warn('Some stress tests failed. Check the console for details.')
      }
    })
  }, 10000) // 10 seconds delay
}
