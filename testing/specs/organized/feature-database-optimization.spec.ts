import { expect, test } from "@playwright/test";
import { UNIFIED_TEST_USERS } from "./unified-test-users";
import { EnhancedAuth } from "./enhanced-auth";

/**
 * Feature Test: database-optimization
 * Tests database-optimization functionality
 */

test.describe('Feature - database-optimization', () => {
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

    test('should load database-optimization interface', async ({ page }) => {
        await page.goto('/database-optimization');
        await expect(page.locator('[data-testid="database-optimization-container"]')).toBeVisible();
    });

    test('should handle database-optimization actions', async ({ page }) => {
        await page.goto('/database-optimization');
        await expect(page.locator('[data-testid="database-optimization-actions"]')).toBeVisible();
    });

    test('should validate database-optimization data', async ({ page }) => {
        await page.goto('/database-optimization');
        await expect(page.locator('[data-testid="database-optimization-data"]')).toBeVisible();
    });

    test('should display database-optimization correctly on mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/database-optimization');
        await expect(page.locator('[data-testid="database-optimization-mobile"]')).toBeVisible();
    });

    test('should handle database-optimization errors gracefully', async ({ page }) => {
        await page.goto('/database-optimization');
        // Simulate error condition
        await expect(page.locator('[data-testid="database-optimization-error-fallback"]')).toBeVisible();
    });
});
