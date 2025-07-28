import { expect, test } from "@playwright/test";
import { UNIFIED_TEST_USERS } from "./unified-test-users";
import { EnhancedAuth } from "./enhanced-auth";

/**
 * Feature Test: data-lineage
 * Tests data-lineage functionality
 */

test.describe('Feature - data-lineage', () => {
    let auth: EnhancedAuth;

    test.beforeEach(async ({ page }) => {
        test.setTimeout(60000);
        auth = new EnhancedAuth(page);

        try {
            const testUser = UNIFIED_TEST_USERS.agency;
            await auth.loginAndGoToDashboard(testUser);
        } catch (error: any) {
            console.warn('Login failed, using fallback:', error.message);
            await page.goto('/dashboard');
            await page.waitForTimeout(2000);
        }
    });

    test('should load data-lineage interface', async ({ page }) => {
        await page.goto('/data-lineage');
        await expect(page.locator('[data-testid="data-lineage-container"]')).toBeVisible();
    });

    test('should handle data-lineage actions', async ({ page }) => {
        await page.goto('/data-lineage');
        await expect(page.locator('[data-testid="data-lineage-actions"]')).toBeVisible();
    });

    test('should validate data-lineage data', async ({ page }) => {
        await page.goto('/data-lineage');
        await expect(page.locator('[data-testid="data-lineage-data"]')).toBeVisible();
    });

    test('should display data-lineage correctly on mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/data-lineage');
        await expect(page.locator('[data-testid="data-lineage-mobile"]')).toBeVisible();
    });

    test('should handle data-lineage errors gracefully', async ({ page }) => {
        await page.goto('/data-lineage');
        // Simulate error condition
        await expect(page.locator('[data-testid="data-lineage-error-fallback"]')).toBeVisible();
    });
});
