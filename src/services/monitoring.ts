// Comprehensive Monitoring and Analytics Service
import { supabase } from '../lib/supabase'
import { logSecurityEvent } from './security'

export interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: string
  category: 'performance' | 'error' | 'user' | 'business'
  metadata?: any
}

export interface ErrorReport {
  id: string
  message: string
  stack?: string
  component?: string
  userId?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: string
  resolved: boolean
  metadata?: any
}

export interface UserAnalytics {
  userId: string
  sessionId: string
  events: UserEvent[]
  sessionStart: string
  sessionEnd?: string
  duration?: number
  pageViews: number
  actions: number
}

export interface UserEvent {
  type: string
  timestamp: string
  data: any
  page: string
  component?: string
}

class PerformanceMonitor {
  private static metrics: PerformanceMetric[] = []
  private static maxMetrics = 1000

  // Track Core Web Vitals
  static trackWebVitals() {
    if (typeof window === 'undefined') return

    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        this.recordMetric('lcp', lastEntry.startTime, 'ms', 'performance')
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          const fid = entry.processingStart - entry.startTime
          this.recordMetric('fid', fid, 'ms', 'performance')
        })
      })
      fidObserver.observe({ entryTypes: ['first-input'] })

      // Cumulative Layout Shift (CLS)
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
        this.recordMetric('cls', clsValue, 'score', 'performance')
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })
    }

    // Time to First Byte (TTFB)
    if (performance.navigation) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        const ttfb = navigation.responseStart - navigation.requestStart
        this.recordMetric('ttfb', ttfb, 'ms', 'performance')
      }
    }
  }

  // Track custom metrics
  static recordMetric(name: string, value: number, unit: string, category: 'performance' | 'error' | 'user' | 'business', metadata?: any) {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date().toISOString(),
      category,
      metadata
    }

    this.metrics.push(metric)

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendMetricToAnalytics(metric)
    }
  }

  // Track page load performance
  static trackPageLoad(pageName: string) {
    if (typeof window === 'undefined') return

    const loadTime = performance.now()
    this.recordMetric('page_load_time', loadTime, 'ms', 'performance', { page: pageName })

    // Track resource loading
    const resources = performance.getEntriesByType('resource')
    const totalResourceSize = resources.reduce((total, resource: any) => total + (resource.transferSize || 0), 0)
    this.recordMetric('total_resource_size', totalResourceSize, 'bytes', 'performance', { page: pageName })
  }

  // Track API call performance
  static async trackAPICall<T>(
    apiCall: () => Promise<T>,
    endpoint: string,
    method: string = 'GET'
  ): Promise<T> {
    const startTime = performance.now()
    
    try {
      const result = await apiCall()
      const duration = performance.now() - startTime
      
      this.recordMetric('api_call_duration', duration, 'ms', 'performance', {
        endpoint,
        method,
        success: true
      })
      
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      
      this.recordMetric('api_call_duration', duration, 'ms', 'error', {
        endpoint,
        method,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      throw error
    }
  }

  // Get performance summary
  static getPerformanceSummary(): {
    lcp: number | null
    fid: number | null
    cls: number | null
    ttfb: number | null
    averagePageLoad: number
    totalAPICalls: number
    averageAPICallDuration: number
  } {
    const lcp = this.getLatestMetric('lcp')?.value || null
    const fid = this.getLatestMetric('fid')?.value || null
    const cls = this.getLatestMetric('cls')?.value || null
    const ttfb = this.getLatestMetric('ttfb')?.value || null

    const pageLoadMetrics = this.metrics.filter(m => m.name === 'page_load_time')
    const averagePageLoad = pageLoadMetrics.length > 0
      ? pageLoadMetrics.reduce((sum, m) => sum + m.value, 0) / pageLoadMetrics.length
      : 0

    const apiCallMetrics = this.metrics.filter(m => m.name === 'api_call_duration')
    const totalAPICalls = apiCallMetrics.length
    const averageAPICallDuration = totalAPICalls > 0
      ? apiCallMetrics.reduce((sum, m) => sum + m.value, 0) / totalAPICalls
      : 0

    return {
      lcp,
      fid,
      cls,
      ttfb,
      averagePageLoad,
      totalAPICalls,
      averageAPICallDuration
    }
  }

  private static getLatestMetric(name: string): PerformanceMetric | null {
    const metrics = this.metrics.filter(m => m.name === name)
    return metrics.length > 0 ? metrics[metrics.length - 1] : null
  }

  private static async sendMetricToAnalytics(metric: PerformanceMetric) {
    try {
      await supabase
        .from('performance_metrics')
        .insert({
          name: metric.name,
          value: metric.value,
          unit: metric.unit,
          category: metric.category,
          metadata: metric.metadata,
          timestamp: metric.timestamp
        })
    } catch (error) {
      console.error('Failed to send metric to analytics:', error)
    }
  }
}

class ErrorTracker {
  private static errors: ErrorReport[] = []
  private static maxErrors = 500

  // Track JavaScript errors
  static trackError(error: Error, component?: string, userId?: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') {
    const errorReport: ErrorReport = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: error.message,
      stack: error.stack,
      component,
      userId,
      severity,
      timestamp: new Date().toISOString(),
      resolved: false
    }

    this.errors.push(errorReport)

    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors)
    }

    // Log to security system
    logSecurityEvent(
      userId || null,
      'javascript_error',
      {
        message: error.message,
        component,
        severity
      },
      severity
    )

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendErrorToAnalytics(errorReport)
    }

    console.error('Error tracked:', errorReport)
  }

  // Track React error boundaries
  static trackReactError(error: Error, errorInfo: any, component: string, userId?: string) {
    this.trackError(error, component, userId, 'high')
    
    // Additional React-specific error info
    const errorReport = this.errors[this.errors.length - 1]
    errorReport.metadata = {
      ...errorReport.metadata,
      reactErrorInfo: errorInfo,
      componentStack: errorInfo.componentStack
    }
  }

  // Get error summary
  static getErrorSummary(): {
    totalErrors: number
    errorsBySeverity: Record<string, number>
    errorsByComponent: Record<string, number>
    recentErrors: ErrorReport[]
  } {
    const errorsBySeverity = this.errors.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const errorsByComponent = this.errors.reduce((acc, error) => {
      const component = error.component || 'unknown'
      acc[component] = (acc[component] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const recentErrors = this.errors
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)

    return {
      totalErrors: this.errors.length,
      errorsBySeverity,
      errorsByComponent,
      recentErrors
    }
  }

  private static async sendErrorToAnalytics(errorReport: ErrorReport) {
    try {
      await supabase
        .from('error_reports')
        .insert({
          id: errorReport.id,
          message: errorReport.message,
          stack: errorReport.stack,
          component: errorReport.component,
          user_id: errorReport.userId,
          severity: errorReport.severity,
          metadata: errorReport.metadata,
          timestamp: errorReport.timestamp,
          resolved: errorReport.resolved
        })
    } catch (error) {
      console.error('Failed to send error to analytics:', error)
    }
  }
}

class UserAnalytics {
  private static currentSession: UserAnalytics | null = null
  private static sessions: UserAnalytics[] = []
  private static maxSessions = 100

  // Start user session
  static startSession(userId: string): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    this.currentSession = {
      userId,
      sessionId,
      events: [],
      sessionStart: new Date().toISOString(),
      pageViews: 0,
      actions: 0
    }

    this.trackEvent('session_start', { sessionId })
    return sessionId
  }

  // End user session
  static endSession() {
    if (!this.currentSession) return

    this.currentSession.sessionEnd = new Date().toISOString()
    this.currentSession.duration = new Date(this.currentSession.sessionEnd).getTime() - new Date(this.currentSession.sessionStart).getTime()

    this.sessions.push(this.currentSession)

    // Keep only recent sessions
    if (this.sessions.length > this.maxSessions) {
      this.sessions = this.sessions.slice(-this.maxSessions)
    }

    this.trackEvent('session_end', { duration: this.currentSession.duration })
    this.currentSession = null
  }

  // Track user event
  static trackEvent(type: string, data: any, page?: string, component?: string) {
    if (!this.currentSession) return

    const event: UserEvent = {
      type,
      timestamp: new Date().toISOString(),
      data,
      page: page || window.location.pathname,
      component
    }

    this.currentSession.events.push(event)

    // Update counters
    if (type === 'page_view') {
      this.currentSession.pageViews++
    } else {
      this.currentSession.actions++
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendEventToAnalytics(event)
    }
  }

  // Track page view
  static trackPageView(page: string, metadata?: any) {
    this.trackEvent('page_view', { page, metadata }, page)
  }

  // Track user action
  static trackAction(action: string, data: any, component?: string) {
    this.trackEvent('user_action', { action, data }, undefined, component)
  }

  // Get user analytics summary
  static getUserAnalyticsSummary(): {
    totalSessions: number
    averageSessionDuration: number
    totalPageViews: number
    totalActions: number
    mostVisitedPages: Array<{ page: string; count: number }>
    mostUsedComponents: Array<{ component: string; count: number }>
  } {
    const totalSessions = this.sessions.length
    const averageSessionDuration = totalSessions > 0
      ? this.sessions.reduce((sum, session) => sum + (session.duration || 0), 0) / totalSessions
      : 0

    const totalPageViews = this.sessions.reduce((sum, session) => sum + session.pageViews, 0)
    const totalActions = this.sessions.reduce((sum, session) => sum + session.actions, 0)

    // Count page visits
    const pageCounts: Record<string, number> = {}
    this.sessions.forEach(session => {
      session.events
        .filter(event => event.type === 'page_view')
        .forEach(event => {
          pageCounts[event.page] = (pageCounts[event.page] || 0) + 1
        })
    })

    const mostVisitedPages = Object.entries(pageCounts)
      .map(([page, count]) => ({ page, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Count component usage
    const componentCounts: Record<string, number> = {}
    this.sessions.forEach(session => {
      session.events
        .filter(event => event.component)
        .forEach(event => {
          componentCounts[event.component!] = (componentCounts[event.component!] || 0) + 1
        })
    })

    const mostUsedComponents = Object.entries(componentCounts)
      .map(([component, count]) => ({ component, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return {
      totalSessions,
      averageSessionDuration,
      totalPageViews,
      totalActions,
      mostVisitedPages,
      mostUsedComponents
    }
  }

  private static async sendEventToAnalytics(event: UserEvent) {
    try {
      await supabase
        .from('user_events')
        .insert({
          type: event.type,
          data: event.data,
          page: event.page,
          component: event.component,
          timestamp: event.timestamp
        })
    } catch (error) {
      console.error('Failed to send event to analytics:', error)
    }
  }
}

// Initialize monitoring
export function initializeMonitoring() {
  if (typeof window === 'undefined') return

  // Track performance
  PerformanceMonitor.trackWebVitals()

  // Track global errors
  window.addEventListener('error', (event) => {
    ErrorTracker.trackError(
      new Error(event.message),
      'global',
      undefined,
      'high'
    )
  })

  // Track unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    ErrorTracker.trackError(
      new Error(event.reason),
      'promise',
      undefined,
      'medium'
    )
  })

  // Track page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      UserAnalytics.trackEvent('page_hidden', {})
    } else {
      UserAnalytics.trackEvent('page_visible', {})
    }
  })

  // Track beforeunload
  window.addEventListener('beforeunload', () => {
    UserAnalytics.endSession()
  })

  console.log('Monitoring initialized')
}

// Export monitoring classes
export { PerformanceMonitor, ErrorTracker, UserAnalytics }

// Auto-initialize in browser
if (typeof window !== 'undefined') {
  initializeMonitoring()
}
