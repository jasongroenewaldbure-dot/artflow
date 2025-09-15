#!/usr/bin/env node

/**
 * API Stress Test Suite
 * Tests API endpoints, error handling, and performance under load
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'http://localhost:5173/api';

class APIStressTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      errors: [],
      performance: [],
      loadTestResults: []
    };
    this.authToken = null;
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

  // Test 1: API Health Check
  async testAPIHealth() {
    const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 5000 });
    if (response.status !== 200) {
      throw new Error(`Health check failed with status: ${response.status}`);
    }
  }

  // Test 2: Authentication Endpoints
  async testAuthEndpoints() {
    // Test registration
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      role: 'collector'
    });
    
    if (registerResponse.status !== 201) {
      throw new Error(`Registration failed with status: ${registerResponse.status}`);
    }
    
    this.authToken = registerResponse.data.token;
    
    // Test login
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    if (loginResponse.status !== 200) {
      throw new Error(`Login failed with status: ${loginResponse.status}`);
    }
  }

  // Test 3: Protected Endpoints
  async testProtectedEndpoints() {
    if (!this.authToken) {
      throw new Error('No auth token available');
    }
    
    const headers = { Authorization: `Bearer ${this.authToken}` };
    
    // Test /auth/me
    const meResponse = await axios.get(`${API_BASE_URL}/auth/me`, { headers });
    if (meResponse.status !== 200) {
      throw new Error(`GET /auth/me failed with status: ${meResponse.status}`);
    }
    
    // Test updating profile
    const updateResponse = await axios.post(`${API_BASE_URL}/auth/me`, {
      name: 'Updated Name',
      role: 'artist'
    }, { headers });
    
    if (updateResponse.status !== 200) {
      throw new Error(`POST /auth/me failed with status: ${updateResponse.status}`);
    }
  }

  // Test 4: Artwork Endpoints
  async testArtworkEndpoints() {
    if (!this.authToken) {
      throw new Error('No auth token available');
    }
    
    const headers = { Authorization: `Bearer ${this.authToken}` };
    
    // Test GET /artworks
    const artworksResponse = await axios.get(`${API_BASE_URL}/artworks`);
    if (artworksResponse.status !== 200) {
      throw new Error(`GET /artworks failed with status: ${artworksResponse.status}`);
    }
    
    // Test POST /artworks (with mock image)
    const formData = new FormData();
    formData.append('title', 'Test Artwork');
    formData.append('priceCents', '10000');
    
    // Create a small test image
    const testImagePath = path.join(__dirname, 'test-image.png');
    if (!fs.existsSync(testImagePath)) {
      // Create a minimal PNG file for testing
      const pngBuffer = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 pixel
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, // IHDR data
        0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54, // IDAT chunk
        0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // IDAT data
        0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82 // IEND chunk
      ]);
      fs.writeFileSync(testImagePath, pngBuffer);
    }
    
    formData.append('image', fs.createReadStream(testImagePath));
    
    const createResponse = await axios.post(`${API_BASE_URL}/artworks`, formData, {
      headers: { ...headers, ...formData.getHeaders() }
    });
    
    if (createResponse.status !== 201) {
      throw new Error(`POST /artworks failed with status: ${createResponse.status}`);
    }
    
    const artworkId = createResponse.data.artwork.id;
    
    // Test GET /artworks/:id
    const getArtworkResponse = await axios.get(`${API_BASE_URL}/artworks/${artworkId}`);
    if (getArtworkResponse.status !== 200) {
      throw new Error(`GET /artworks/:id failed with status: ${getArtworkResponse.status}`);
    }
  }

  // Test 5: Search Functionality
  async testSearchFunctionality() {
    const searchQueries = [
      'art',
      'painting',
      'sculpture',
      'abstract',
      'modern'
    ];
    
    for (const query of searchQueries) {
      const response = await axios.get(`${API_BASE_URL}/search`, {
        params: { q: query }
      });
      
      if (response.status !== 200) {
        throw new Error(`Search failed for query "${query}" with status: ${response.status}`);
      }
      
      if (!Array.isArray(response.data.items)) {
        throw new Error(`Search response format invalid for query "${query}"`);
      }
    }
  }

  // Test 6: Error Handling
  async testErrorHandling() {
    const errorTests = [
      { url: '/artworks/nonexistent', expectedStatus: 404 },
      { url: '/auth/me', expectedStatus: 401 }, // No auth token
      { url: '/artworks', method: 'POST', expectedStatus: 401 }, // No auth token
    ];
    
    for (const test of errorTests) {
      try {
        const config = { url: `${API_BASE_URL}${test.url}` };
        if (test.method) config.method = test.method;
        
        await axios(config);
        throw new Error(`Expected ${test.expectedStatus} but got 200`);
      } catch (error) {
        if (error.response?.status !== test.expectedStatus) {
          throw new Error(`Expected status ${test.expectedStatus} but got ${error.response?.status}`);
        }
      }
    }
  }

  // Test 7: Input Validation
  async testInputValidation() {
    const invalidInputs = [
      { endpoint: '/auth/register', data: { email: 'invalid-email', password: '123' } },
      { endpoint: '/auth/register', data: { email: '', password: 'password123' } },
      { endpoint: '/auth/register', data: { email: 'test@test.com', password: '' } },
    ];
    
    for (const test of invalidInputs) {
      try {
        await axios.post(`${API_BASE_URL}${test.endpoint}`, test.data);
        throw new Error(`Invalid input accepted: ${JSON.stringify(test.data)}`);
      } catch (error) {
        if (error.response?.status < 400) {
          throw new Error(`Expected validation error but got status: ${error.response?.status}`);
        }
      }
    }
  }

  // Test 8: Load Testing
  async testLoadTesting() {
    const concurrentRequests = 100;
    const promises = [];
    
    console.log(`🚀 Running load test with ${concurrentRequests} concurrent requests...`);
    
    for (let i = 0; i < concurrentRequests; i++) {
      promises.push(
        axios.get(`${API_BASE_URL}/artworks`).catch(error => ({
          error: error.message,
          status: error.response?.status
        }))
      );
    }
    
    const startTime = Date.now();
    const results = await Promise.all(promises);
    const duration = Date.now() - startTime;
    
    const successful = results.filter(r => !r.error);
    const failed = results.filter(r => r.error);
    
    this.results.loadTestResults.push({
      concurrentRequests,
      successful: successful.length,
      failed: failed.length,
      duration,
      requestsPerSecond: (concurrentRequests / duration) * 1000
    });
    
    console.log(`📊 Load Test Results:`);
    console.log(`  - Successful: ${successful.length}/${concurrentRequests}`);
    console.log(`  - Failed: ${failed.length}/${concurrentRequests}`);
    console.log(`  - Duration: ${duration}ms`);
    console.log(`  - RPS: ${((concurrentRequests / duration) * 1000).toFixed(2)}`);
    
    if (failed.length > concurrentRequests * 0.1) { // More than 10% failure rate
      throw new Error(`High failure rate: ${failed.length}/${concurrentRequests} requests failed`);
    }
  }

  // Test 9: Memory Leak Detection
  async testMemoryLeakDetection() {
    const iterations = 50;
    const initialMemory = process.memoryUsage();
    
    for (let i = 0; i < iterations; i++) {
      await axios.get(`${API_BASE_URL}/artworks`);
    }
    
    const finalMemory = process.memoryUsage();
    const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
    
    console.log(`📊 Memory Usage:`);
    console.log(`  - Initial: ${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  - Final: ${(finalMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  - Increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB`);
    
    // Allow for some memory increase but flag significant leaks
    if (memoryIncrease > 50 * 1024 * 1024) { // 50MB
      throw new Error(`Potential memory leak detected: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB increase`);
    }
  }

  // Test 10: Security Headers
  async testSecurityHeaders() {
    const response = await axios.get(API_BASE_URL.replace('/api', ''));
    
    const securityHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection',
      'strict-transport-security',
      'content-security-policy'
    ];
    
    const missingHeaders = securityHeaders.filter(header => !response.headers[header]);
    
    if (missingHeaders.length > 0) {
      console.log(`⚠️  WARNING: Missing security headers: ${missingHeaders.join(', ')}`);
    }
  }

  async runAllTests() {
    console.log('🚀 Starting API Stress Tests...\n');
    
    await this.runTest('API Health Check', () => this.testAPIHealth());
    await this.runTest('Authentication Endpoints', () => this.testAuthEndpoints());
    await this.runTest('Protected Endpoints', () => this.testProtectedEndpoints());
    await this.runTest('Artwork Endpoints', () => this.testArtworkEndpoints());
    await this.runTest('Search Functionality', () => this.testSearchFunctionality());
    await this.runTest('Error Handling', () => this.testErrorHandling());
    await this.runTest('Input Validation', () => this.testInputValidation());
    await this.runTest('Load Testing', () => this.testLoadTesting());
    await this.runTest('Memory Leak Detection', () => this.testMemoryLeakDetection());
    await this.runTest('Security Headers', () => this.testSecurityHeaders());
    
    this.printResults();
  }

  printResults() {
    console.log('\n📊 API STRESS TEST RESULTS');
    console.log('==========================');
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
    
    if (this.results.loadTestResults.length > 0) {
      console.log('\n🚀 LOAD TEST RESULTS:');
      this.results.loadTestResults.forEach(result => {
        console.log(`  - Requests: ${result.concurrentRequests}`);
        console.log(`  - Success Rate: ${((result.successful / result.concurrentRequests) * 100).toFixed(1)}%`);
        console.log(`  - RPS: ${result.requestsPerSecond.toFixed(2)}`);
      });
    }
  }
}

// Run the tests
if (require.main === module) {
  const tester = new APIStressTester();
  tester.runAllTests().catch(console.error);
}

module.exports = APIStressTester;
