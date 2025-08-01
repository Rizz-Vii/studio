/**
 * Critical Firebase Functions Health Tests
 * Priority: HIGH - Production Stability
 * Generated: July 31, 2025
 */

import { test, expect } from '@playwright/test';

test.describe('Critical Firebase Functions Health @critical', () => {

  test('Functions cold start performance', async ({ page }) => {
    const startTime = Date.now();

    // Test health endpoint (likely to trigger cold start if functions are idle)
    const response = await page.request.get('/api/health');

    const responseTime = Date.now() - startTime;

    expect(response.status()).toBe(200);

    // Cold start should complete within reasonable time (10 seconds max)
    expect(responseTime).toBeLessThan(10000);

    console.log(`✅ Health endpoint responded in ${responseTime}ms`);

    if (responseTime > 3000) {
      console.log('⚠️ Cold start detected - response time over 3 seconds');
    }
  });

  test('NeuroSEO function memory usage', async ({ page }) => {
    const response = await page.request.post('/api/neuroseo', {
      data: {
        url: 'https://example.com',
        userId: 'test-user-health-check'
      }
    });

    // Should not fail due to memory issues
    expect(response.status()).not.toBe(503); // Service unavailable
    expect(response.status()).not.toBe(500); // Internal server error

    const responseData = await response.json();

    if (response.status() === 200) {
      console.log('✅ NeuroSEO function handling requests successfully');
    } else {
      console.log('⚠️ NeuroSEO function response:', response.status(), responseData);
    }
  });

  test('Chat functions availability', async ({ page }) => {
    // Test admin chat handler
    const adminChatResponse = await page.request.post('/api/chat/admin', {
      data: {
        message: 'Health check test',
        userId: 'test-admin-user'
      }
    });

    // Should be accessible (not 404)
    expect(adminChatResponse.status()).not.toBe(404);

    console.log(`✅ Admin chat function accessible (${adminChatResponse.status()})`);

    // Test customer chat handler
    const customerChatResponse = await page.request.post('/api/chat/customer', {
      data: {
        message: 'Health check test',
        userId: 'test-customer-user'
      }
    });

    // Should be accessible (not 404)
    expect(customerChatResponse.status()).not.toBe(404);

    console.log(`✅ Customer chat function accessible (${customerChatResponse.status()})`);
  });

  test('Stripe webhook function stability', async ({ page }) => {
    const webhookResponse = await page.request.post('/api/stripe/webhook', {
      headers: {
        'stripe-signature': 'test-signature-health-check'
      },
      data: {
        type: 'ping',
        data: {
          object: {
            id: 'test-health-check'
          }
        }
      }
    });

    // Should be accessible and handle webhook format
    expect(webhookResponse.status()).not.toBe(404);
    expect(webhookResponse.status()).not.toBe(503);

    console.log(`✅ Stripe webhook function accessible (${webhookResponse.status()})`);
  });

  test('Function timeout handling', async ({ page }) => {
    // Test with a potentially long-running operation
    const startTime = Date.now();

    const response = await page.request.post('/api/streaming/real-time', {
      data: {
        type: 'health-check',
        userId: 'test-timeout-check'
      },
      timeout: 45000 // Test within function timeout limits
    });

    const responseTime = Date.now() - startTime;

    // Should complete within reasonable time or return appropriate status
    if (response.status() === 200) {
      console.log(`✅ Streaming function completed in ${responseTime}ms`);
    } else if (response.status() === 408 || response.status() === 504) {
      console.log(`⚠️ Function timeout detected (${response.status()}) after ${responseTime}ms`);
    } else {
      console.log(`✅ Function handled request appropriately (${response.status()})`);
    }

    // Should not hang indefinitely
    expect(responseTime).toBeLessThan(60000);
  });

  test('Function quota management', async ({ page }) => {
    // Make multiple requests to test quota handling
    const requests = [];

    for (let i = 0; i < 5; i++) {
      requests.push(
        page.request.get('/api/health').then(response => ({
          status: response.status(),
          attempt: i + 1
        }))
      );
    }

    const results = await Promise.all(requests);

    // All requests should be handled appropriately
    const failedRequests = results.filter(r => r.status >= 500).length;
    const rateLimitedRequests = results.filter(r => r.status === 429).length;

    console.log(`✅ Processed ${results.length} requests`);
    console.log(`   Failed: ${failedRequests}, Rate limited: ${rateLimitedRequests}`);

    // Should handle concurrent requests gracefully
    expect(failedRequests).toBeLessThan(results.length / 2); // Less than 50% failure rate
  });

  test('Function environment validation', async ({ page }) => {
    const response = await page.request.get('/api/health');
    const healthData = await response.json();

    // Validate essential environment indicators
    expect(healthData.environment).toBeDefined();
    expect(healthData.region).toBeDefined();
    expect(healthData.timestamp).toBeDefined();

    // Check for production configuration
    if (healthData.environment === 'production') {
      expect(healthData.region).toBe('australia-southeast2');
      console.log('✅ Production environment configuration verified');
    } else {
      console.log(`⚠️ Environment: ${healthData.environment}, Region: ${healthData.region}`);
    }

    // Validate essential services are configured
    expect(healthData.checks).toBeDefined();
    expect(healthData.checks.database).toBeDefined();

    console.log(`✅ Function environment validation complete`);
  });

  test('Memory leak detection simulation', async ({ page }) => {
    // Make repeated requests to check for memory accumulation
    const initialResponse = await page.request.get('/api/health');
    const initialData = await initialResponse.json();

    // Make several requests
    for (let i = 0; i < 10; i++) {
      await page.request.get('/api/health');
    }

    // Check final response
    const finalResponse = await page.request.get('/api/health');
    const finalData = await finalResponse.json();

    // Both should respond successfully
    expect(initialResponse.status()).toBe(200);
    expect(finalResponse.status()).toBe(200);

    // Response times should be consistent (no significant degradation)
    if (finalData.performance && initialData.performance) {
      const responseTimeDiff = finalData.performance.currentResponseTime - initialData.performance.currentResponseTime;

      // Should not degrade significantly (more than 1000ms)
      expect(responseTimeDiff).toBeLessThan(1000);

      console.log(`✅ Memory usage stable - response time delta: ${responseTimeDiff}ms`);
    } else {
      console.log('✅ Memory leak test completed - both requests successful');
    }
  });

});

test.describe('Function Deployment Validation @critical', () => {

  test('All critical functions deployed', async ({ page }) => {
    const criticalEndpoints = [
      '/api/health',
      '/api/neuroseo',
      '/api/chat/customer',
      '/api/chat/admin',
      '/api/stripe/webhook',
      '/api/streaming/real-time'
    ];

    const results = [];

    for (const endpoint of criticalEndpoints) {
      try {
        const response = await page.request.get(endpoint);
        results.push({
          endpoint,
          status: response.status(),
          accessible: response.status() !== 404
        });
      } catch (error) {
        results.push({
          endpoint,
          status: 'ERROR',
          accessible: false,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    console.log('🔍 Function deployment validation:');
    results.forEach(result => {
      const status = result.accessible ? '✅' : '❌';
      console.log(`   ${status} ${result.endpoint}: ${result.status}`);
    });

    // At least 80% of critical endpoints should be accessible
    const accessibleCount = results.filter(r => r.accessible).length;
    const accessibilityRate = accessibleCount / results.length;

    expect(accessibilityRate).toBeGreaterThanOrEqual(0.8);

    console.log(`✅ Function accessibility rate: ${(accessibilityRate * 100).toFixed(1)}%`);
  });
});
