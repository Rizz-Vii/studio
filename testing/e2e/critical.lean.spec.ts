/**
 * @file Critical path test for lean channel testing
 * 
 * This test file is specifically designed to run against Firebase preview channels
 * as part of the Development Hyperloop workflow.
 * 
 * It focuses on the most critical user paths to ensure basic functionality works
 * while providing fast feedback for the development loop.
 */

import { test, expect } from '@playwright/test';
import { TestOrchestrator } from '../../testing/utils/test-orchestrator';

// Lean tests are marked with @lean to be picked up by lean channel testing
test.describe('@lean Critical path tests', () => {
  let orchestrator: TestOrchestrator;

  test.beforeEach(async ({ page }) => {
    orchestrator = new TestOrchestrator(page);
    page.setDefaultNavigationTimeout(30000);
    page.setDefaultTimeout(20000);
  });

  test('Homepage loads correctly', async ({ page }) => {
    await page.goto('/');

    // Verify navigation is visible
    await expect(page.locator('nav')).toBeVisible();

    // Verify key elements are present
    await expect(page.getByRole('heading', { name: /RankPilot/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Sign In|Log In/i })).toBeVisible();
  });

  test('Authentication flow', async ({ page }) => {
    // Test user from free tier
    await orchestrator.userManager.loginAs('free');

    // Check if dashboard is accessible
    await page.goto('/dashboard');
    await expect(page.locator('text=Welcome')).toBeVisible();
    await expect(page.locator('text=Dashboard')).toBeVisible();

    // Ensure profile information is visible
    await expect(page.getByRole('button', { name: /account|profile/i })).toBeVisible();
  });

  test('NeuroSEO basic functionality', async ({ page }) => {
    // Login with agency tier user
    await orchestrator.userManager.loginAs('agency');

    // Navigate to NeuroSEO dashboard
    await page.goto('/neuroseo');
    await expect(page.locator('text=NeuroSEO')).toBeVisible();

    // Check that NeuroSEO main components are loaded
    await expect(page.locator('[data-testid="neuroseo-dashboard"]')).toBeVisible();

    // Verify basic UI elements are present
    await expect(page.getByRole('button', { name: /analyze|run/i })).toBeVisible();
  });
});
