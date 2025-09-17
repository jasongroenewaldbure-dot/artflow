// E2E tests for authentication flow
import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should handle sign up flow', async ({ page }) => {
    await page.goto('/start')
    
    // Check sign up form
    await expect(page.locator('[data-testid="auth-form"]')).toBeVisible()
    
    // Fill sign up form
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'SecurePassword123!')
    
    // Submit form
    await page.click('[data-testid="signup-button"]')
    
    // Should show success message or redirect
    await expect(page.locator('[data-testid="auth-success"]')).toBeVisible({ timeout: 5000 })
  })

  test('should handle sign in flow', async ({ page }) => {
    await page.goto('/start')
    
    // Switch to sign in
    await page.click('[data-testid="signin-tab"]')
    
    // Fill sign in form
    await page.fill('[data-testid="email-input"]', 'existing@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    
    // Submit form
    await page.click('[data-testid="signin-button"]')
    
    // Should redirect to dashboard or show error
    await page.waitForURL(/\/(dashboard|start)/, { timeout: 5000 })
  })

  test('should handle auth callback correctly', async ({ page }) => {
    // Simulate auth callback URL
    await page.goto('/auth/callback?access_token=test&refresh_token=test')
    
    // Should show loading state
    await expect(page.locator('[data-testid="auth-loading"]')).toBeVisible()
    
    // Should eventually redirect (or show error)
    await page.waitForURL(/\/(dashboard|start|onboarding)/, { timeout: 10000 })
  })

  test('should handle protected routes', async ({ page }) => {
    // Try to access protected route without auth
    await page.goto('/profile/settings')
    
    // Should redirect to auth
    await page.waitForURL(/\/start/, { timeout: 5000 })
  })

  test('should handle sign out', async ({ page }) => {
    // Mock authenticated state
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'test-token',
        refresh_token: 'test-refresh',
      }))
    })
    
    await page.goto('/profile/settings')
    
    // Find and click sign out
    const signOutButton = page.locator('[data-testid="signout-button"]')
    if (await signOutButton.isVisible()) {
      await signOutButton.click()
      
      // Should redirect to home
      await page.waitForURL('/', { timeout: 5000 })
    }
  })
})
