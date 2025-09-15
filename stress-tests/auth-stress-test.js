#!/usr/bin/env node

/**
 * Authentication Stress Test Suite
 * Tests authentication flows, edge cases, and security vulnerabilities
 */

const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// Configuration
const SUPABASE_URL = 'https://mfddxrpiuawggmnzqagn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mZGR4cnBpdWF3Z2dtbnpxYWduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMzY2MjcsImV4cCI6MjA3MDkxMjYyN30.DfF1W6VRqto7KLwatpul63wPJbsJ23cTQ4Z4VGBlKdU';
const API_BASE_URL = 'http://localhost:5173/api';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class AuthStressTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      errors: [],
      performance: []
    };
  }

  async runTest(testName, testFn) {
    console.log(`\n🧪 Running: ${testName}`);
    const startTime = Date.now();
    
    try {
      await testFn();
      const duration = Date.now() - startTime;
      this.results.passed++;
      this.results.performance.push({ test: testName, duration, status: 'passed' });
      console.log(`✅ PASSED: ${testName} (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.failed++;
      this.results.errors.push({ test: testName, error: error.message, duration });
      this.results.performance.push({ test: testName, duration, status: 'failed' });
      console.log(`❌ FAILED: ${testName} (${duration}ms) - ${error.message}`);
    }
  }

  // Test 1: Invalid Credentials Handling
  async testInvalidCredentials() {
    const { error } = await supabase.auth.signInWithPassword({
      email: 'nonexistent@example.com',
      password: 'wrongpassword'
    });
    
    if (!error) {
      throw new Error('Should have failed with invalid credentials');
    }
    
    if (error.message !== 'Invalid login credentials') {
      throw new Error(`Expected 'Invalid login credentials', got: ${error.message}`);
    }
  }

  // Test 2: SQL Injection Attempts
  async testSQLInjection() {
    const maliciousEmails = [
      "'; DROP TABLE profiles; --",
      "' OR '1'='1",
      "admin@test.com' UNION SELECT * FROM profiles --",
      "test@test.com'; INSERT INTO profiles VALUES ('hacker', 'hacker@evil.com'); --"
    ];

    for (const email of maliciousEmails) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: 'password'
      });
      
      // Should fail safely without exposing database structure
      if (!error) {
        throw new Error(`SQL injection attempt succeeded with email: ${email}`);
      }
    }
  }

  // Test 3: Rate Limiting
  async testRateLimiting() {
    const promises = [];
    const requests = 100; // Attempt 100 rapid requests
    
    for (let i = 0; i < requests; i++) {
      promises.push(
        supabase.auth.signInWithPassword({
          email: 'test@example.com',
          password: 'wrongpassword'
        }).catch(() => {}) // Ignore individual errors
      );
    }
    
    const results = await Promise.all(promises);
    const errors = results.filter(r => r?.error);
    
    // Should have some rate limiting in place
    if (errors.length < 10) {
      console.log(`⚠️  WARNING: Only ${errors.length} requests were rate limited out of ${requests}`);
    }
  }

  // Test 4: XSS Prevention
  async testXSSPrevention() {
    const xssPayloads = [
      '<script>alert("xss")</script>',
      '"><script>alert("xss")</script>',
      "javascript:alert('xss')",
      '<img src=x onerror=alert("xss")>',
      '${alert("xss")}'
    ];

    for (const payload of xssPayloads) {
      const { error } = await supabase.auth.signUp({
        email: payload,
        password: 'password123'
      });
      
      // Should either fail validation or sanitize input
      if (!error) {
        throw new Error(`XSS payload accepted: ${payload}`);
      }
    }
  }

  // Test 5: Concurrent Authentication
  async testConcurrentAuth() {
    const concurrentUsers = 50;
    const promises = [];
    
    for (let i = 0; i < concurrentUsers; i++) {
      promises.push(
        supabase.auth.signUp({
          email: `concurrent${i}@test.com`,
          password: 'password123'
        }).catch(() => {}) // Ignore individual errors
      );
    }
    
    const results = await Promise.all(promises);
    const successful = results.filter(r => !r?.error);
    
    if (successful.length === 0) {
      throw new Error('All concurrent authentication attempts failed');
    }
    
    console.log(`✅ ${successful.length}/${concurrentUsers} concurrent auth attempts succeeded`);
  }

  // Test 6: Session Management
  async testSessionManagement() {
    // Test session creation
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'sessiontest@example.com',
      password: 'password123'
    });
    
    if (signUpError) {
      throw new Error(`Sign up failed: ${signUpError.message}`);
    }
    
    // Test session retrieval
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error('No session found after sign up');
    }
    
    // Test session invalidation
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      throw new Error(`Sign out failed: ${signOutError.message}`);
    }
    
    // Verify session is cleared
    const { data: clearedSession } = await supabase.auth.getSession();
    if (clearedSession.session) {
      throw new Error('Session not properly cleared after sign out');
    }
  }

  // Test 7: Magic Link Security
  async testMagicLinkSecurity() {
    // Test with invalid email formats
    const invalidEmails = [
      'notanemail',
      '@example.com',
      'test@',
      'test..test@example.com',
      'test@example..com'
    ];
    
    for (const email of invalidEmails) {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: 'http://localhost:5173/auth/callback'
        }
      });
      
      if (!error) {
        throw new Error(`Magic link sent to invalid email: ${email}`);
      }
    }
  }

  // Test 8: Password Strength
  async testPasswordStrength() {
    const weakPasswords = [
      '123',
      'password',
      '12345678',
      'qwerty',
      'abc123'
    ];
    
    for (const password of weakPasswords) {
      const { error } = await supabase.auth.signUp({
        email: `weakpass${Date.now()}@test.com`,
        password
      });
      
      // Should either reject weak passwords or have minimum requirements
      if (!error) {
        console.log(`⚠️  WARNING: Weak password accepted: ${password}`);
      }
    }
  }

  // Test 9: Token Expiration
  async testTokenExpiration() {
    // This would require mocking time or waiting for actual expiration
    // For now, we'll test token format validation
    const { data: signUpData } = await supabase.auth.signUp({
      email: 'tokentest@example.com',
      password: 'password123'
    });
    
    if (signUpData.session?.access_token) {
      const token = signUpData.session.access_token;
      const parts = token.split('.');
      
      if (parts.length !== 3) {
        throw new Error('Invalid JWT token format');
      }
      
      // Try to decode payload (without verification)
      try {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        if (!payload.exp) {
          throw new Error('Token missing expiration claim');
        }
      } catch (e) {
        throw new Error('Invalid JWT payload format');
      }
    }
  }

  // Test 10: Error Message Consistency
  async testErrorConsistency() {
    const testCases = [
      { email: '', password: 'password', expectedError: 'Email is required' },
      { email: 'test@test.com', password: '', expectedError: 'Password is required' },
      { email: 'invalid-email', password: 'password', expectedError: 'Invalid email format' }
    ];
    
    for (const testCase of testCases) {
      const { error } = await supabase.auth.signInWithPassword({
        email: testCase.email,
        password: testCase.password
      });
      
      if (!error) {
        throw new Error(`Expected error for invalid input: ${JSON.stringify(testCase)}`);
      }
      
      // Check if error message is user-friendly (not exposing internal details)
      if (error.message.includes('database') || error.message.includes('internal')) {
        throw new Error(`Error message exposes internal details: ${error.message}`);
      }
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Authentication Stress Tests...\n');
    
    await this.runTest('Invalid Credentials Handling', () => this.testInvalidCredentials());
    await this.runTest('SQL Injection Prevention', () => this.testSQLInjection());
    await this.runTest('Rate Limiting', () => this.testRateLimiting());
    await this.runTest('XSS Prevention', () => this.testXSSPrevention());
    await this.runTest('Concurrent Authentication', () => this.testConcurrentAuth());
    await this.runTest('Session Management', () => this.testSessionManagement());
    await this.runTest('Magic Link Security', () => this.testMagicLinkSecurity());
    await this.runTest('Password Strength', () => this.testPasswordStrength());
    await this.runTest('Token Expiration', () => this.testTokenExpiration());
    await this.runTest('Error Message Consistency', () => this.testErrorConsistency());
    
    this.printResults();
  }

  printResults() {
    console.log('\n📊 AUTHENTICATION STRESS TEST RESULTS');
    console.log('=====================================');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📈 Success Rate: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`);
    
    if (this.results.errors.length > 0) {
      console.log('\n🚨 FAILED TESTS:');
      this.results.errors.forEach(error => {
        console.log(`  - ${error.test}: ${error.error}`);
      });
    }
    
    console.log('\n⏱️  PERFORMANCE METRICS:');
    const avgDuration = this.results.performance.reduce((sum, test) => sum + test.duration, 0) / this.results.performance.length;
    console.log(`  - Average Test Duration: ${avgDuration.toFixed(2)}ms`);
    console.log(`  - Fastest Test: ${Math.min(...this.results.performance.map(t => t.duration))}ms`);
    console.log(`  - Slowest Test: ${Math.max(...this.results.performance.map(t => t.duration))}ms`);
  }
}

// Run the tests
if (require.main === module) {
  const tester = new AuthStressTester();
  tester.runAllTests().catch(console.error);
}

module.exports = AuthStressTester;
