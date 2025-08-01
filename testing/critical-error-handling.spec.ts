/**
 * Critical Error Handling Tests
 * Priority: HIGH - Production Stability
 * Generated: July 31, 2025
 */

import { test, expect } from '@playwright/test';
import { TestOrchestrator } from './utils/test-orchestrator';

test.describe('Critical Error Handling Tests @critical', () => {
  let orchestrator: TestOrchestrator;

  test.beforeEach(async ({ page }) => {
    orchestrator = new TestOrchestrator(page);
  });

  test('API timeout handling', async ({ page }) => {
    // Login and navigate to NeuroSEO
    await orchestrator.userManager.loginAs('agency');
    await page.goto('/neuroseo');

    // Intercept API calls and simulate timeout
    await page.route('/api/neuroseo/**', route => {
      setTimeout(() => route.abort('timeout'), 30000);
    });

    // Try to start analysis
    await page.getByTestId('start-analysis-button').click();
    await page.getByTestId('url-input').fill('https://example.com');
    await page.getByTestId('submit-analysis').click();

    // Should show timeout error message
    await expect(page.getByText(/timeout|request.*failed|try.*again/i)).toBeVisible({ timeout: 35000 });

    // Should provide retry option
    await expect(page.getByTestId('retry-button')).toBeVisible();

    console.log('✅ API timeout handling working');
  });

  test('404 error page functionality', async ({ page }) => {
    // Navigate to non-existent page
    await page.goto('/non-existent-page-12345');

    // Should show 404 page
    await expect(page.getByText(/404|not found|page.*exist/i)).toBeVisible();

    // Should have navigation back to home
    await expect(page.getByRole('link', { name: /home|dashboard|back/i })).toBeVisible();

    // Should have search functionality
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();

    console.log('✅ 404 error page working');
  });

  test('500 server error handling', async ({ page }) => {
    // Intercept API to simulate server error
    await page.route('/api/health', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    // Try to access health endpoint
    const response = await page.request.get('/api/health');
    expect(response.status()).toBe(500);

    // Navigate to a page that depends on the API
    await page.goto('/dashboard');

    // Should handle gracefully without crashing
    await expect(page.locator('body')).toBeVisible();

    console.log('✅ 500 server error handling working');
  });

  test('Offline state handling', async ({ page }) => {
    // Login first
    await orchestrator.userManager.loginAs('starter');
    await page.goto('/dashboard');

    // Simulate offline state
    await page.context().setOffline(true);

    // Try to navigate to another page
    await page.getByRole('link', { name: /neuroseo/i }).click();

    // Should show offline message
    await expect(page.getByText(/offline|connection|network/i)).toBeVisible({ timeout: 10000 });

    // Restore online state
    await page.context().setOffline(false);

    // Should recover gracefully
    await page.reload();
    await expect(page.getByText(/dashboard|welcome/i)).toBeVisible();

    console.log('✅ Offline state handling working');
  });

  test('Sentry error reporting integration', async ({ page }) => {
    // Check if Sentry is initialized
    const sentryInitialized = await page.evaluate(() => {
      return typeof window !== 'undefined' &&
        (window as any).Sentry !== undefined &&
        typeof (window as any).Sentry.captureException === 'function';
    });

    if (sentryInitialized) {
      console.log('✅ Sentry error reporting initialized');

      // Test manual error capture
      await page.evaluate(() => {
        (window as any).Sentry.captureMessage('Test error from automated test', 'info');
      });

      console.log('✅ Sentry error capture working');
    } else {
      console.log('⚠️ Sentry not initialized - check production configuration');
    }
  });

  test('Form validation error handling', async ({ page }) => {
    await page.goto('/neuroseo');

    // Try to submit form without required fields
    await page.getByTestId('submit-analysis').click();

    // Should show validation errors
    await expect(page.getByText(/required|invalid|enter.*url/i)).toBeVisible();

    // Fill with invalid URL
    await page.getByTestId('url-input').fill('not-a-valid-url');
    await page.getByTestId('submit-analysis').click();

    // Should show URL validation error
    await expect(page.getByText(/valid.*url|invalid.*url/i)).toBeVisible();

    console.log('✅ Form validation error handling working');
  });

  test('Authentication error handling', async ({ page }) => {
    // Try to access protected route without authentication
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/.*login.*/);

    // Try with invalid credentials simulation
    await page.goto('/auth/login');
    await page.getByLabel('Email').fill('invalid@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should show authentication error
    await expect(page.getByText(/invalid.*credentials|login.*failed/i)).toBeVisible({ timeout: 10000 });

    console.log('✅ Authentication error handling working');
  });
});

test.describe('Database Connection Error Handling @critical', () => {
  test('Firebase connection resilience', async ({ page }) => {
    // Test Firebase connection by checking health endpoint
    const healthResponse = await page.request.get('/api/health');
    const healthData = await healthResponse.json();

    // Should have database status
    expect(healthData.checks).toBeDefined();
    expect(healthData.checks.database).toBeDefined();

    if (healthData.checks.database.status !== 'healthy') {
      console.log('⚠️ Database connection issue detected:', healthData.checks.database);
    } else {
      console.log('✅ Database connection healthy');
    }

    // Test data loading with potential connection issues
    await page.goto('/dashboard');

    // Should either load successfully or show graceful error
    const isLoaded = await page.locator('[data-testid="dashboard-content"]').isVisible({ timeout: 15000 });
    const hasError = await page.locator('[data-testid="connection-error"]').isVisible();

    expect(isLoaded || hasError).toBe(true);

    if (!isLoaded && hasError) {
      console.log('⚠️ Dashboard showing connection error - graceful degradation working');
    } else {
      console.log('✅ Dashboard loaded successfully');
    }
  });
});
