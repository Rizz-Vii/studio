/**
 * RankPilot SAFE Production Monitoring Suite
 * ⚠️ NO LOAD TESTING ON PRODUCTION - Only Health Monitoring
 * Last Updated: July 31, 2025
 */

import { test, expect } from '@playwright/test';
import { getCurrentTestEnvironment, ProductionMonitor, runSafeTests } from '../config/safe-testing';

// Get current environment configuration
const testEnv = getCurrentTestEnvironment();
const monitor = new ProductionMonitor(testEnv.baseUrl);

console.log(`🔍 Running tests in ${testEnv.name} environment`);
console.log(`📡 Target URL: ${testEnv.baseUrl}`);
console.log(`⚡ Load testing: ${testEnv.loadTestingEnabled ? 'ENABLED' : 'DISABLED'}`);

test.describe('Safe Production Monitoring', () => {
  
  test('Production Health Check', async () => {
    const safetyCheck = await runSafeTests('smoke');
    
    if (safetyCheck.skipped) {
      test.skip(true, safetyCheck.reason);
      return;
    }

    const healthResult = await monitor.healthCheck();
    
    expect(healthResult.status).not.toBe('down');
    expect(healthResult.responseTime).toBeLessThan(5000); // 5 second timeout
    
    console.log(`✅ Health check: ${healthResult.status} (${healthResult.responseTime}ms)`);
  });

  test('Basic Smoke Test', async ({ page }) => {
    const safetyCheck = await runSafeTests('smoke');
    
    if (safetyCheck.skipped) {
      test.skip(true, safetyCheck.reason);
      return;
    }

    // Navigate to homepage (single request)
    await page.goto(testEnv.baseUrl);
    
    // Basic checks
    await expect(page).toHaveTitle(/RankPilot/);
    await expect(page.locator('nav')).toBeVisible();
    
    console.log('✅ Homepage smoke test passed');
    
    // Wait between requests to be respectful
    await page.waitForTimeout(2000);
  });

  test('API Endpoints Health', async ({ request }) => {
    const safetyCheck = await runSafeTests('smoke');
    
    if (safetyCheck.skipped) {
      test.skip(true, safetyCheck.reason);
      return;
    }

    // Test health endpoint (single request)
    const healthResponse = await request.get(`${testEnv.baseUrl}/api/health`);
    expect(healthResponse.status()).toBe(200);
    
    // Wait between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test auth session endpoint (single request)
    const authResponse = await request.get(`${testEnv.baseUrl}/api/auth/session`);
    expect([200, 401].includes(authResponse.status())).toBeTruthy();
    
    console.log('✅ API endpoints health check passed');
  });

  // LOAD TESTING - Only runs in development/preview environments
  test('Load Testing (Safe Environments Only)', async ({ page }) => {
    const safetyCheck = await runSafeTests('load');
    
    if (safetyCheck.skipped) {
      console.log(`⚠️ Skipping load test: ${safetyCheck.reason}`);
      test.skip(true, safetyCheck.reason);
      return;
    }

    console.log(`🚀 Load testing enabled with max ${safetyCheck.maxConcurrent} concurrent requests`);
    
    // Simple load test for non-production environments
    const promises = [];
    const maxConcurrent = Math.min(safetyCheck.maxConcurrent || 5, 10);
    
    for (let i = 0; i < maxConcurrent; i++) {
      promises.push(
        page.goto(`${testEnv.baseUrl}?test=${i}`, { waitUntil: 'networkidle' })
      );
    }
    
    await Promise.all(promises);
    console.log(`✅ Load test completed with ${maxConcurrent} concurrent requests`);
  });

  test('Security Headers Check', async ({ request }) => {
    const safetyCheck = await runSafeTests('security');
    
    if (safetyCheck.skipped) {
      test.skip(true, safetyCheck.reason);
      return;
    }

    const response = await request.get(testEnv.baseUrl);
    const headers = response.headers();
    
    // Check important security headers
    expect(headers['x-content-type-options']).toBeDefined();
    expect(headers['x-frame-options']).toBeDefined();
    
    console.log('✅ Security headers check passed');
  });

  test('Mobile Performance Check', async ({ page }) => {
    const safetyCheck = await runSafeTests('mobile');
    
    if (safetyCheck.skipped) {
      test.skip(true, safetyCheck.reason);
      return;
    }

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const startTime = Date.now();
    await page.goto(testEnv.baseUrl);
    const loadTime = Date.now() - startTime;
    
    // Basic mobile checks
    await expect(page.locator('nav')).toBeVisible();
    expect(loadTime).toBeLessThan(3000); // 3 second mobile load time
    
    console.log(`✅ Mobile performance check: ${loadTime}ms`);
  });
});

test.describe('Production Environment Validation', () => {
  
  test('Environment Configuration', async () => {
    console.log('🔧 Environment Configuration:');
    console.log(`   Name: ${testEnv.name}`);
    console.log(`   URL: ${testEnv.baseUrl}`);
    console.log(`   Load Testing: ${testEnv.loadTestingEnabled ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`   Max Concurrent: ${testEnv.maxConcurrentRequests}`);
    console.log(`   Test Types: ${testEnv.testTypes.join(', ')}`);
    
    // This test always passes - it's just for logging
    expect(testEnv).toBeDefined();
  });

  test('Production Safety Verification', async () => {
    if (testEnv.name === 'Production') {
      console.log('🛡️ Production Safety Checks:');
      console.log('   ✅ Load testing disabled');
      console.log('   ✅ Max 1 concurrent request');
      console.log('   ✅ Only smoke tests enabled');
      
      expect(testEnv.loadTestingEnabled).toBe(false);
      expect(testEnv.maxConcurrentRequests).toBe(1);
      expect(testEnv.testTypes).toEqual(['smoke']);
    } else {
      console.log(`ℹ️ Non-production environment: ${testEnv.name} - Full testing available`);
    }
    
    expect(true).toBe(true); // Always pass
  });
});
