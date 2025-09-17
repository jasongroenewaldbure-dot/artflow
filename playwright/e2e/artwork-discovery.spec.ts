// E2E tests for artwork discovery flow - Artsy Force inspired
import { test, expect } from '@playwright/test'

test.describe('Artwork Discovery Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display homepage correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/ArtFlow/)
    
    // Check for key elements
    await expect(page.locator('h1')).toContainText('Discover')
    
    // Check for artwork grid
    const artworkGrid = page.locator('[data-testid="artwork-grid"]')
    await expect(artworkGrid).toBeVisible()
  })

  test('should navigate to artwork detail page', async ({ page }) => {
    // Wait for artworks to load
    await page.waitForSelector('[data-testid="artwork-card"]', { timeout: 10000 })
    
    // Click first artwork
    await page.locator('[data-testid="artwork-card"]').first().click()
    
    // Should navigate to artwork detail
    await expect(page.url()).toMatch(/\/artwork\//)
    
    // Check artwork detail elements
    await expect(page.locator('[data-testid="artwork-title"]')).toBeVisible()
    await expect(page.locator('[data-testid="artwork-price"]')).toBeVisible()
    await expect(page.locator('[data-testid="artwork-artist"]')).toBeVisible()
  })

  test('should perform search functionality', async ({ page }) => {
    // Navigate to discover page
    await page.goto('/discover')
    
    // Find search input
    const searchInput = page.locator('[data-testid="search-input"]')
    await expect(searchInput).toBeVisible()
    
    // Perform search
    await searchInput.fill('abstract blue artworks')
    await searchInput.press('Enter')
    
    // Wait for results
    await page.waitForSelector('[data-testid="search-results"]', { timeout: 5000 })
    
    // Check results are displayed
    const results = page.locator('[data-testid="artwork-card"]')
    await expect(results.first()).toBeVisible()
  })

  test('should handle intelligent explore features', async ({ page }) => {
    await page.goto('/discover')
    
    // Check for AI features
    await expect(page.locator('[data-testid="serendipity-engine"]')).toBeVisible()
    await expect(page.locator('[data-testid="advanced-search"]')).toBeVisible()
    
    // Test live preference controls
    const preferenceSlider = page.locator('[data-testid="price-sensitivity-slider"]')
    if (await preferenceSlider.isVisible()) {
      await preferenceSlider.click()
      // Results should update
      await page.waitForTimeout(1000)
    }
  })

  test('should handle mobile responsive design', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/discover')
    
    // Check mobile layout
    const mobileGrid = page.locator('[data-testid="artwork-grid"]')
    await expect(mobileGrid).toBeVisible()
    
    // Check mobile navigation
    const mobileMenu = page.locator('[data-testid="mobile-menu-toggle"]')
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click()
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()
    }
  })

  test('should handle error states gracefully', async ({ page }) => {
    // Simulate network error
    await page.route('**/api/**', route => {
      route.abort('failed')
    })
    
    await page.goto('/artworks')
    
    // Should show error boundary
    await expect(page.locator('[data-testid="error-boundary"]')).toBeVisible()
    
    // Error boundary should have retry button
    const retryButton = page.locator('[data-testid="error-retry-button"]')
    await expect(retryButton).toBeVisible()
  })

  test('should load artworks with proper performance', async ({ page }) => {
    // Start performance monitoring
    await page.goto('/artworks')
    
    // Measure loading performance
    const startTime = Date.now()
    await page.waitForSelector('[data-testid="artwork-card"]', { timeout: 5000 })
    const loadTime = Date.now() - startTime
    
    // Should load within reasonable time
    expect(loadTime).toBeLessThan(3000)
    
    // Check for lazy loading
    const images = page.locator('img[loading="lazy"]')
    expect(await images.count()).toBeGreaterThan(0)
  })
})
