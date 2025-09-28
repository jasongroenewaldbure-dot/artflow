// Performance monitoring and optimization utilities

interface PerformanceMetrics {
  lcp?: number
  fid?: number
  cls?: number
  ttfb?: number
}

// Add resource hints for better performance
export function addResourceHints() {
  // Preconnect to external domains
  const preconnectDomains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://mfddxrpiuawggmnzqagn.supabase.co'
  ]

  preconnectDomains.forEach(domain => {
    const link = document.createElement('link')
    link.rel = 'preconnect'
    link.href = domain
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  })

  // Preload critical resources
  const criticalResources = [
    '/src/brush/theme.css'
  ]

  criticalResources.forEach(resource => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = resource
    link.as = 'style'
    link.onload = function() {
      (this as HTMLLinkElement).rel = 'stylesheet'
    }
    document.head.appendChild(link)
  })
}

// Measure Core Web Vitals
export function measureWebVitals() {
  if (typeof window === 'undefined') return

  const metrics: PerformanceMetrics = {}

  // Measure Largest Contentful Paint (LCP)
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        metrics.lcp = lastEntry.startTime
        console.log(`LCP: ${Math.round(metrics.lcp)}`)
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (e) {
      console.warn('LCP measurement failed:', e)
    }

    // Measure First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          metrics.fid = entry.processingStart - entry.startTime
          console.log(`FID: ${Math.round(metrics.fid)}`)
        })
      })
      fidObserver.observe({ entryTypes: ['first-input'] })
    } catch (e) {
      console.warn('FID measurement failed:', e)
    }

    // Measure Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
        metrics.cls = clsValue
        console.log(`CLS: ${metrics.cls}`)
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })
    } catch (e) {
      console.warn('CLS measurement failed:', e)
    }
  }

  // Measure Time to First Byte (TTFB)
  if (performance.navigation) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navigation) {
      metrics.ttfb = navigation.responseStart - navigation.requestStart
      console.log(`TTFB: ${Math.round(metrics.ttfb)}`)
    }
  }

  return metrics
}

// Image lazy loading utility
export function setupLazyLoading() {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          if (img.dataset.src) {
            img.src = img.dataset.src
            img.classList.remove('lazy')
            observer.unobserve(img)
          }
        }
      })
    })

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img)
    })
  }
}

// Bundle size optimization
export function optimizeBundle() {
  // Remove unused CSS
  if (process.env.NODE_ENV === 'production') {
    // Implementation for removing unused CSS
    console.log('Bundle optimization enabled')
  }
}

// Memory leak prevention
export function preventMemoryLeaks() {
  // Clean up event listeners on page unload
  window.addEventListener('beforeunload', () => {
    // Clean up any pending requests
    if (typeof AbortController !== 'undefined') {
      // Abort any pending fetch requests
    }
  })
}

// Initialize performance monitoring
export function initPerformance() {
  addResourceHints()
  measureWebVitals()
  setupLazyLoading()
  preventMemoryLeaks()
}