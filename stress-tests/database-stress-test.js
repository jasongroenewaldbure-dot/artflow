#!/usr/bin/env node

/**
 * Database Stress Test Suite
 * Tests database operations, data integrity, and performance under load
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://mfddxrpiuawggmnzqagn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mZGR4cnBpdWF3Z2dtbnpxYWduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMzY2MjcsImV4cCI6MjA3MDkxMjYyN30.DfF1W6VRqto7KLwatpul63wPJbsJ23cTQ4Z4VGBlKdU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class DatabaseStressTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      errors: [],
      performance: [],
      dataIntegrity: []
    };
    this.testUserId = null;
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

  // Test 1: Database Connection
  async testDatabaseConnection() {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }

  // Test 2: Profile CRUD Operations
  async testProfileCRUD() {
    // Create a test user first
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: `dbtest${Date.now()}@example.com`,
      password: 'password123'
    });
    
    if (authError) {
      throw new Error(`User creation failed: ${authError.message}`);
    }
    
    this.testUserId = authData.user.id;
    
    // Test Profile Creation
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: this.testUserId,
        display_name: 'Test User',
        role: 'collector',
        profile_completed: false,
        onboarding_completed: false,
        password_set: true,
        email_verified: false
      })
      .select()
      .single();
    
    if (profileError) {
      throw new Error(`Profile creation failed: ${profileError.message}`);
    }
    
    // Test Profile Read
    const { data: readProfile, error: readError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', this.testUserId)
      .single();
    
    if (readError) {
      throw new Error(`Profile read failed: ${readError.message}`);
    }
    
    if (readProfile.display_name !== 'Test User') {
      throw new Error('Profile data mismatch on read');
    }
    
    // Test Profile Update
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({ display_name: 'Updated Test User' })
      .eq('user_id', this.testUserId)
      .select()
      .single();
    
    if (updateError) {
      throw new Error(`Profile update failed: ${updateError.message}`);
    }
    
    if (updateData.display_name !== 'Updated Test User') {
      throw new Error('Profile update not reflected');
    }
    
    // Test Profile Delete
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('user_id', this.testUserId);
    
    if (deleteError) {
      throw new Error(`Profile deletion failed: ${deleteError.message}`);
    }
  }

  // Test 3: Data Integrity Constraints
  async testDataIntegrityConstraints() {
    const integrityTests = [
      {
        name: 'Unique Email Constraint',
        test: async () => {
          const email = `integrity${Date.now()}@example.com`;
          
          // Create first profile
          const { error: firstError } = await supabase
            .from('profiles')
            .insert({
              user_id: 'test1',
              email: email,
              display_name: 'User 1'
            });
          
          if (firstError) {
            throw new Error(`First insert failed: ${firstError.message}`);
          }
          
          // Try to create second profile with same email
          const { error: secondError } = await supabase
            .from('profiles')
            .insert({
              user_id: 'test2',
              email: email,
              display_name: 'User 2'
            });
          
          if (!secondError) {
            throw new Error('Duplicate email constraint not enforced');
          }
        }
      },
      {
        name: 'Required Fields Constraint',
        test: async () => {
          const { error } = await supabase
            .from('profiles')
            .insert({
              user_id: 'test3'
              // Missing required fields
            });
          
          if (!error) {
            throw new Error('Required fields constraint not enforced');
          }
        }
      }
    ];
    
    for (const test of integrityTests) {
      try {
        await test.test();
        this.results.dataIntegrity.push({ test: test.name, status: 'passed' });
      } catch (error) {
        this.results.dataIntegrity.push({ test: test.name, status: 'failed', error: error.message });
        throw error;
      }
    }
  }

  // Test 4: Concurrent Database Operations
  async testConcurrentOperations() {
    const concurrentOperations = 50;
    const promises = [];
    
    for (let i = 0; i < concurrentOperations; i++) {
      promises.push(
        supabase
          .from('profiles')
          .select('count')
          .limit(1)
          .then(result => ({ success: !result.error, error: result.error }))
          .catch(error => ({ success: false, error: error.message }))
      );
    }
    
    const results = await Promise.all(promises);
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`📊 Concurrent Operations: ${successful.length}/${concurrentOperations} successful`);
    
    if (failed.length > concurrentOperations * 0.1) { // More than 10% failure rate
      throw new Error(`High failure rate in concurrent operations: ${failed.length}/${concurrentOperations}`);
    }
  }

  // Test 5: Large Dataset Performance
  async testLargeDatasetPerformance() {
    const batchSize = 100;
    const batches = 5;
    
    console.log(`📊 Testing with ${batchSize * batches} records...`);
    
    const startTime = Date.now();
    
    for (let batch = 0; batch < batches; batch++) {
      const records = [];
      for (let i = 0; i < batchSize; i++) {
        records.push({
          user_id: `perftest${batch}_${i}_${Date.now()}`,
          email: `perftest${batch}_${i}_${Date.now()}@example.com`,
          display_name: `Performance Test User ${batch}_${i}`,
          role: 'collector'
        });
      }
      
      const { error } = await supabase
        .from('profiles')
        .insert(records);
      
      if (error) {
        throw new Error(`Batch insert failed: ${error.message}`);
      }
    }
    
    const insertDuration = Date.now() - startTime;
    console.log(`📊 Insert Performance: ${(batchSize * batches / insertDuration * 1000).toFixed(2)} records/second`);
    
    // Test query performance
    const queryStartTime = Date.now();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1000);
    
    const queryDuration = Date.now() - queryStartTime;
    
    if (error) {
      throw new Error(`Query failed: ${error.message}`);
    }
    
    console.log(`📊 Query Performance: ${queryDuration}ms for ${data.length} records`);
    
    // Cleanup test data
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .like('user_id', 'perftest%');
    
    if (deleteError) {
      console.log(`⚠️  Warning: Cleanup failed: ${deleteError.message}`);
    }
  }

  // Test 6: Transaction Handling
  async testTransactionHandling() {
    // Test that operations are atomic
    const testUserId = `transaction${Date.now()}`;
    
    try {
      // This should fail if any part fails
      const { error } = await supabase
        .from('profiles')
        .insert([
          {
            user_id: testUserId,
            email: `transaction${Date.now()}@example.com`,
            display_name: 'Transaction Test'
          },
          {
            user_id: testUserId, // Duplicate user_id should cause failure
            email: `transaction2${Date.now()}@example.com`,
            display_name: 'Transaction Test 2'
          }
        ]);
      
      if (!error) {
        throw new Error('Transaction should have failed due to duplicate user_id');
      }
      
      // Verify no partial data was inserted
      const { data: checkData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', testUserId);
      
      if (checkData && checkData.length > 0) {
        throw new Error('Partial transaction data found - transaction not atomic');
      }
    } catch (error) {
      throw new Error(`Transaction test failed: ${error.message}`);
    }
  }

  // Test 7: Data Validation
  async testDataValidation() {
    const validationTests = [
      {
        name: 'Invalid Email Format',
        data: {
          user_id: 'validation1',
          email: 'invalid-email-format',
          display_name: 'Test User'
        }
      },
      {
        name: 'Invalid Role',
        data: {
          user_id: 'validation2',
          email: 'test@example.com',
          display_name: 'Test User',
          role: 'invalid_role'
        }
      },
      {
        name: 'Null Required Field',
        data: {
          user_id: 'validation3',
          email: null,
          display_name: 'Test User'
        }
      }
    ];
    
    for (const test of validationTests) {
      const { error } = await supabase
        .from('profiles')
        .insert(test.data);
      
      if (!error) {
        throw new Error(`Data validation failed for ${test.name} - invalid data was accepted`);
      }
    }
  }

  // Test 8: Index Performance
  async testIndexPerformance() {
    // Test queries that should use indexes
    const indexedQueries = [
      { field: 'email', value: 'test@example.com' },
      { field: 'role', value: 'collector' },
      { field: 'user_id', value: 'test123' }
    ];
    
    for (const query of indexedQueries) {
      const startTime = Date.now();
      const { error } = await supabase
        .from('profiles')
        .select('*')
        .eq(query.field, query.value)
        .limit(1);
      
      const duration = Date.now() - startTime;
      
      if (error) {
        throw new Error(`Indexed query failed for ${query.field}: ${error.message}`);
      }
      
      if (duration > 1000) { // More than 1 second
        console.log(`⚠️  WARNING: Slow query on ${query.field}: ${duration}ms`);
      }
    }
  }

  // Test 9: Memory Usage Under Load
  async testMemoryUsageUnderLoad() {
    const initialMemory = process.memoryUsage();
    const iterations = 100;
    
    for (let i = 0; i < iterations; i++) {
      await supabase
        .from('profiles')
        .select('*')
        .limit(100);
    }
    
    const finalMemory = process.memoryUsage();
    const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
    
    console.log(`📊 Memory Usage:`);
    console.log(`  - Initial: ${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  - Final: ${(finalMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  - Increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB`);
    
    if (memoryIncrease > 100 * 1024 * 1024) { // 100MB
      throw new Error(`Excessive memory usage: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB increase`);
    }
  }

  // Test 10: Database Connection Pooling
  async testConnectionPooling() {
    const concurrentConnections = 20;
    const promises = [];
    
    for (let i = 0; i < concurrentConnections; i++) {
      promises.push(
        supabase
          .from('profiles')
          .select('count')
          .then(result => ({ success: !result.error, connectionId: i }))
          .catch(error => ({ success: false, connectionId: i, error: error.message }))
      );
    }
    
    const results = await Promise.all(promises);
    const successful = results.filter(r => r.success);
    
    console.log(`📊 Connection Pooling: ${successful.length}/${concurrentConnections} connections successful`);
    
    if (successful.length < concurrentConnections * 0.8) { // Less than 80% success rate
      throw new Error(`Poor connection pooling performance: ${successful.length}/${concurrentConnections} successful`);
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Database Stress Tests...\n');
    
    await this.runTest('Database Connection', () => this.testDatabaseConnection());
    await this.runTest('Profile CRUD Operations', () => this.testProfileCRUD());
    await this.runTest('Data Integrity Constraints', () => this.testDataIntegrityConstraints());
    await this.runTest('Concurrent Database Operations', () => this.testConcurrentOperations());
    await this.runTest('Large Dataset Performance', () => this.testLargeDatasetPerformance());
    await this.runTest('Transaction Handling', () => this.testTransactionHandling());
    await this.runTest('Data Validation', () => this.testDataValidation());
    await this.runTest('Index Performance', () => this.testIndexPerformance());
    await this.runTest('Memory Usage Under Load', () => this.testMemoryUsageUnderLoad());
    await this.runTest('Database Connection Pooling', () => this.testConnectionPooling());
    
    this.printResults();
  }

  printResults() {
    console.log('\n📊 DATABASE STRESS TEST RESULTS');
    console.log('================================');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📈 Success Rate: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`);
    
    if (this.results.errors.length > 0) {
      console.log('\n🚨 FAILED TESTS:');
      this.results.errors.forEach(error => {
        console.log(`  - ${error.test}: ${error.error}`);
      });
    }
    
    if (this.results.dataIntegrity.length > 0) {
      console.log('\n🔒 DATA INTEGRITY TESTS:');
      this.results.dataIntegrity.forEach(test => {
        const status = test.status === 'passed' ? '✅' : '❌';
        console.log(`  ${status} ${test.test}`);
        if (test.error) {
          console.log(`    Error: ${test.error}`);
        }
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
  const tester = new DatabaseStressTester();
  tester.runAllTests().catch(console.error);
}

module.exports = DatabaseStressTester;
