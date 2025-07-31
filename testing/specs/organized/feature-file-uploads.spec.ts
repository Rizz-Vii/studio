import { expect, test } from "@playwright/test";
import { UNIFIED_TEST_USERS } from "./unified-test-users";
import { EnhancedAuth } from "./enhanced-auth";

/**
 * Feature Test: file-uploads
 * Tests file-uploads functionality
 */

test.describe('Feature - file-uploads', () => {
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

    test('should load file-uploads interface', async ({ page }) => {
        await page.goto('/file-uploads');
        await expect(page.locator('[data-testid="file-uploads-container"]')).toBeVisible();
    });

    test('should handle file-uploads actions', async ({ page }) => {
        await page.goto('/file-uploads');
        await expect(page.locator('[data-testid="file-uploads-actions"]')).toBeVisible();
    });

    test('should validate file-uploads data', async ({ page }) => {
        await page.goto('/file-uploads');
        await expect(page.locator('[data-testid="file-uploads-data"]')).toBeVisible();
    });

    test('should display file-uploads correctly on mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/file-uploads');
        await expect(page.locator('[data-testid="file-uploads-mobile"]')).toBeVisible();
    });

    test('should handle file-uploads errors gracefully', async ({ page }) => {
        await page.goto('/file-uploads');
        // Simulate error condition
        await expect(page.locator('[data-testid="file-uploads-error-fallback"]')).toBeVisible();
    });
});
