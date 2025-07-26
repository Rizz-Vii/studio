/**
 * @fileoverview Critical path tests for Development Hyperloop testing
 * 
 * These tests are specifically designed to run quickly against lean preview channels.
 * They focus on core functionality validation without comprehensive coverage.
 * 
 * Test files marked with @lean.spec.ts are automatically included in lean testing.
 */

import { test, expect } from '@playwright/test';

/**
 * Critical smoke tests for lean preview channels
 */
test.describe('Critical path tests for preview channels @lean', () => {

    test('Homepage loads successfully @critical', async ({ page }) => {
        await page.goto('/');

        // Wait for critical UI elements
        await expect(page.locator('nav')).toBeVisible();
        await expect(page.locator('footer')).toBeVisible();

        // Verify page title
        await expect(page).toHaveTitle(/RankPilot/);
    });

    test('Authentication page loads @critical', async ({ page }) => {
        await page.goto('/auth/login');

        // Check for auth form elements
        await expect(page.locator('form')).toBeVisible();
        await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    });

    test('Pricing page displays subscription options @critical', async ({ page }) => {
        await page.goto('/pricing');

        // Check for pricing cards
        const pricingCards = page.locator('[data-test-id="pricing-card"]');
        await expect(pricingCards).toHaveCount(4); // Free, Starter, Pro, Enterprise

        // Verify plan names are visible
        await expect(page.getByText(/Free Plan/i)).toBeVisible();
        await expect(page.getByText(/Starter/i)).toBeVisible();
    });

    test('Mobile navigation works @critical', async ({ page }) => {
        // Set viewport to mobile size
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/');

        // Open mobile menu
        const menuButton = page.locator('[data-test-id="mobile-menu-button"]');
        await menuButton.click();

        // Check that mobile navigation appears
        await expect(page.locator('[data-test-id="mobile-nav"]')).toBeVisible();
    });
});

/**
 * Skip slow tests in lean mode
 * These tests demonstrate how to mark tests that should be excluded
 */
test('Database intensive operations @slow', async ({ page }) => {
    test.skip(true, 'Skipped in lean testing mode - too intensive');
});
