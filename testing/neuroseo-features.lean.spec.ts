/**
 * @fileoverview NeuroSEO™ Feature Tests for Lean Channel Testing
 * 
 * These tests validate critical functionality of the NeuroSEO™ Suite
 * in lean preview deployments. They focus on the core user interactions
 * without deep validation of all features.
 */

import { test, expect } from '@playwright/test';

/**
 * NeuroSEO™ Suite Lean Tests
 * These tests validate that the core NeuroSEO™ features are functioning
 */
test.describe('NeuroSEO™ Suite Critical Tests @lean', () => {
    // Authenticate before each test
    test.beforeEach(async ({ page }) => {
        // Simple authentication for lean testing
        // Note: In lean testing, we use test credentials that bypass Firebase Auth
        await page.goto('/auth/login');
        await page.getByLabel('Email').fill('test@rankpilot.dev');
        await page.getByLabel('Password').fill('test-password-lean');
        await page.getByRole('button', { name: /sign in/i }).click();

        // Wait for dashboard to load
        await page.waitForURL('/dashboard');
    });

    test('NeuroSEO™ Dashboard loads correctly @critical', async ({ page }) => {
        await page.goto('/neuroseo');

        // Verify core UI elements
        await expect(page.locator('[data-testid="neuroseo-dashboard-title"]')).toBeVisible();
        await expect(page.locator('[data-testid="start-analysis-button"]')).toBeVisible();
    });

    test('NeuroSEO™ form accepts input @critical', async ({ page }) => {
        await page.goto('/neuroseo/new-analysis');

        // Fill the form with test data
        await page.getByLabel('Website URL').fill('https://example.com');
        await page.getByLabel('Keywords').fill('test keyword, another keyword');
        await page.getByRole('button', { name: /analyze/i }).click();

        // Verify analysis started
        await expect(page.locator('[data-testid="analysis-loading"]')).toBeVisible();
    });

    test('AI Visibility Engine navigation works @critical', async ({ page }) => {
        await page.goto('/neuroseo');

        // Navigate to AI Visibility Engine
        await page.getByRole('link', { name: /ai visibility engine/i }).click();

        // Verify page loaded
        await expect(page).toHaveURL(/\/neuroseo\/ai-visibility/);
        await expect(page.locator('[data-testid="visibility-engine-title"]')).toBeVisible();
    });

    test('Mobile responsiveness of NeuroSEO™ interface @critical', async ({ page }) => {
        // Set viewport to mobile size
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/neuroseo');

        // Verify mobile layout adaptations
        await expect(page.locator('[data-testid="mobile-neuroseo-layout"]')).toBeVisible();

        // Check touch-friendly elements (48px targets)
        const analysisButton = page.locator('[data-testid="start-analysis-button"]');
        const buttonBox = await analysisButton.boundingBox();
        expect(buttonBox).not.toBeNull();
        if (buttonBox) {
            expect(buttonBox.height).toBeGreaterThanOrEqual(48);
        }
    });
});

/**
 * Skip intensive feature tests in lean mode
 */
test('Full NeuroSEO™ analysis pipeline @slow', async ({ page }) => {
    test.skip(true, 'Full analysis pipeline skipped in lean testing - too resource intensive');
});
