#!/usr/bin/env node

// Comprehensive Auth System Stress Test
// Tests the complete signup -> onboarding -> dashboard flow

const { chromium } = require('playwright');

async function runAuthStressTest() {
  console.log('🚀 Starting ArtFlow Auth System Stress Test...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  let testsPassed = 0;
  let testsTotal = 0;
  
  const test = (name, fn) => {
    testsTotal++;
    return fn().then(() => {
      console.log(`✅ ${name}`);
      testsPassed++;
    }).catch(err => {
      console.log(`❌ ${name}: ${err.message}`);
    });
  };

  try {
    // Test 1: Basic Page Loading
    await test('Homepage loads without errors', async () => {
      await page.goto('http://localhost:5173');
      await page.waitForLoadState('networkidle');
      
      // Check for critical errors
      const errors = await page.evaluate(() => {
        const errorElements = document.querySelectorAll('[data-error], .error, .error-boundary');
        return Array.from(errorElements).map(el => el.textContent);
      });
      
      if (errors.length > 0) {
        throw new Error(`Page has errors: ${errors.join(', ')}`);
      }
    });

    // Test 2: Auth Test Page
    await test('Auth test page loads', async () => {
      await page.goto('http://localhost:5173/auth-test');
      await page.waitForSelector('h2:has-text("Auth System Test")', { timeout: 10000 });
    });

    // Test 3: Start Page (Sign Up)
    await test('Start page loads', async () => {
      await page.goto('http://localhost:5173/start');
      await page.waitForLoadState('networkidle');
      
      // Look for sign up form
      const hasSignUpForm = await page.locator('input[type="email"], input[name="email"]').count() > 0;
      if (!hasSignUpForm) {
        throw new Error('No email input found on start page');
      }
    });

    // Test 4: Magic Link Flow (Simulated)
    await test('Magic link can be initiated', async () => {
      await page.goto('http://localhost:5173/auth-test');
      await page.waitForSelector('button:has-text("Test Magic Link")');
      
      // Click magic link button
      await page.click('button:has-text("Test Magic Link")');
      
      // Wait for status update
      await page.waitForTimeout(2000);
      
      const status = await page.textContent('[data-testid="status"], div:has-text("Magic link")');
      if (!status || !status.includes('sent')) {
        throw new Error('Magic link was not sent successfully');
      }
    });

    // Test 5: Auth Callback URL Structure
    await test('Auth callback URL is accessible', async () => {
      // Test with mock auth tokens
      const callbackUrl = 'http://localhost:5173/auth/callback#access_token=test&refresh_token=test&type=magiclink';
      await page.goto(callbackUrl);
      await page.waitForLoadState('networkidle');
      
      // Should not show 404 or crash
      const is404 = await page.locator('h1:has-text("404"), h1:has-text("Not Found")').count() > 0;
      if (is404) {
        throw new Error('Auth callback shows 404 error');
      }
    });

    // Test 6: Onboarding Page
    await test('Onboarding page is accessible', async () => {
      await page.goto('http://localhost:5173/onboarding');
      await page.waitForLoadState('networkidle');
      
      // Should show onboarding content (even if protected)
      const hasOnboardingContent = await page.locator('h1, h2, .onboarding, [data-testid="onboarding"]').count() > 0;
      if (!hasOnboardingContent) {
        throw new Error('Onboarding page has no content');
      }
    });

    // Test 7: Dashboard Protection
    await test('Dashboard is properly protected', async () => {
      await page.goto('http://localhost:5173/u/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Should redirect to auth or show protected message
      const currentUrl = page.url();
      const isProtected = currentUrl.includes('/start') || 
                         currentUrl.includes('/auth') || 
                         await page.locator('text="sign in", text="login", text="authenticate"').count() > 0;
      
      if (!isProtected) {
        throw new Error('Dashboard is not properly protected');
      }
    });

    // Test 8: Artworks Page
    await test('Artworks page loads', async () => {
      await page.goto('http://localhost:5173/artworks');
      await page.waitForLoadState('networkidle');
      
      // Should show artworks or proper loading state
      const hasContent = await page.locator('h1, .artwork, .loading, [data-testid="artworks"]').count() > 0;
      if (!hasContent) {
        throw new Error('Artworks page has no content');
      }
    });

    // Test 9: Navigation Consistency
    await test('Navigation works across pages', async () => {
      await page.goto('http://localhost:5173/artworks');
      
      // Check for navigation elements
      const hasNav = await page.locator('nav, header, [role="navigation"]').count() > 0;
      if (!hasNav) {
        throw new Error('No navigation found on artworks page');
      }
      
      // Check for "Artworks" text (not "Discover")
      const hasArtworksText = await page.locator('text="Artworks"').count() > 0;
      const hasDiscoverText = await page.locator('text="Discover"').count() > 0;
      
      if (hasDiscoverText) {
        throw new Error('Navigation still shows "Discover" instead of "Artworks"');
      }
      
      if (!hasArtworksText) {
        throw new Error('Navigation does not show "Artworks" text');
      }
    });

    // Test 10: Console Errors
    await test('No critical console errors', async () => {
      const errors = [];
      
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      await page.goto('http://localhost:5173/artworks');
      await page.waitForTimeout(3000);
      
      // Filter out non-critical errors
      const criticalErrors = errors.filter(error => 
        !error.includes('DevTools') && 
        !error.includes('extension') &&
        !error.includes('favicon')
      );
      
      if (criticalErrors.length > 0) {
        throw new Error(`Critical console errors: ${criticalErrors.join(', ')}`);
      }
    });

  } catch (error) {
    console.log(`💥 Test suite failed: ${error.message}`);
  } finally {
    await browser.close();
    
    console.log(`\n📊 Test Results: ${testsPassed}/${testsTotal} tests passed`);
    
    if (testsPassed === testsTotal) {
      console.log('🎉 All tests passed! Auth system is working.');
    } else {
      console.log('⚠️  Some tests failed. Auth system needs fixes.');
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  runAuthStressTest().catch(console.error);
}

module.exports = { runAuthStressTest };
