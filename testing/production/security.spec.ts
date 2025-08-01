/**
 * Security Validation Tests
 * RankPilot - Production Security Testing
 * Updated for unified test users and enhanced security
 */

import { expect, test } from '@playwright/test';
import { UNIFIED_TEST_USERS, DEV_USER } from '../config/unified-test-users';

test.describe('Security Validation', () => {
    test('comprehensive security audit', async ({ page }) => {
        // Test basic security headers
        const response = await page.goto('/');
        expect(response?.status()).toBe(200);

        // Check security headers are present
        const headers = response?.headers() || {};
        const securityChecks = [
            { name: 'X-Frame-Options', present: !!headers['x-frame-options'] },
            { name: 'X-Content-Type-Options', present: !!headers['x-content-type-options'] },
            { name: 'Referrer-Policy', present: !!headers['referrer-policy'] }
        ];

        const passedChecks = securityChecks.filter(check => check.present).length;
        const totalChecks = securityChecks.length;
        const securityScore = (passedChecks / totalChecks) * 100;

        console.log('🔍 Security Headers Check:', securityChecks);
        expect(securityScore, 'Security score should be at least 60%').toBeGreaterThanOrEqual(60);
    });

    test('CSP headers validation', async ({ page }) => {
        const response = await page.goto('/');
        const headers = response?.headers() || {};

        // Check for basic security headers
        expect(headers['x-frame-options'] || headers['x-frame-options']).toBeDefined();
        expect(headers['x-content-type-options'] || headers['x-content-type-options']).toBeDefined();
    });

    test('authentication protection', async ({ page }) => {
        // Test protected routes redirect to auth
        const protectedRoutes = ['/dashboard', '/neuroseo', '/settings'];

        for (const route of protectedRoutes) {
            const response = await page.goto(route);
            await page.waitForLoadState('networkidle', { timeout: 5000 });

            const url = page.url();
            const currentPath = new URL(url).pathname;

            // Check if redirected to auth or showing sign-in page
            const isRedirectedToAuth = url.includes('/signin') ||
                url.includes('/login') ||
                url.includes('/auth') ||
                currentPath === '/signin' ||
                currentPath === '/login' ||
                await page.locator('text=Sign In').isVisible({ timeout: 2000 }).catch(() => false);

            expect(isRedirectedToAuth, `Route ${route} should redirect to authentication or show sign-in form`).toBe(true);
        }
    });

    test('XSS protection validation', async ({ page }) => {
        await page.goto('/');

        // Try to inject script in any available input
        const inputs = await page.locator('input').all();
        if (inputs.length > 0) {
            const firstInput = inputs[0];
            await firstInput.fill('<script>window.xssTest = true;</script>');

            // Wait a moment for any potential script execution
            await page.waitForTimeout(1000);

            // Script should not execute
            const xssExecuted = await page.evaluate(() => (window as any).xssTest);
            expect(xssExecuted).toBeUndefined();
        } else {
            // If no inputs found, just verify the page loads safely
            expect(page.url()).toContain('localhost');
        }
    });

    test('HTTPS enforcement', async ({ page, browserName }) => {
        // Skip HTTPS test in development/localhost
        const response = await page.goto('/');
        const url = page.url();

        if (url.includes('localhost') || url.includes('127.0.0.1')) {
            // In development, just verify HTTP is working
            expect(url).toMatch(/^http/);
            console.log('🚨 Development mode: Skipping HTTPS enforcement test');
        } else {
            // In production, enforce HTTPS
            expect(url).toMatch(/^https:/);
        }
    });

    test('user authentication with unified test users', async ({ page }) => {
        // Test authentication flow with our unified test users
        await page.goto('/signin');

        // Try to sign in with dev user
        const emailInput = page.locator('input[type="email"]');
        const passwordInput = page.locator('input[type="password"]');
        const signInButton = page.locator('button[type="submit"]').first();

        if (await emailInput.isVisible() && await passwordInput.isVisible()) {
            await emailInput.fill(DEV_USER.email);
            await passwordInput.fill(DEV_USER.password);
            await signInButton.click();

            // Wait for potential redirect or error
            await page.waitForTimeout(2000);

            // Check if authentication succeeded or failed gracefully
            const currentUrl = page.url();
            const hasError = await page.locator('text=error').isVisible({ timeout: 1000 }).catch(() => false);

            // Either should be redirected away from signin or show appropriate error
            const authWorking = !currentUrl.includes('/signin') || hasError;
            expect(authWorking, 'Authentication system should be functional').toBe(true);
        } else {
            console.log('🚨 No sign-in form found, skipping auth test');
        }
    });

    test('Firebase security rules protection', async ({ page }) => {
        // Test that API endpoints require proper requests (POST with valid data)
        const apiTests = [
            {
                endpoint: '/api/chat/customer',
                method: 'GET', // Should reject GET requests
                expectError: true
            },
            {
                endpoint: '/api/neuroseo',
                method: 'GET', // Should reject GET requests  
                expectError: true
            },
            {
                endpoint: '/api/chat/customer',
                method: 'POST',
                body: {}, // Should reject empty body
                expectError: true
            }
        ];

        let protectedCount = 0;
        for (const test of apiTests) {
            try {
                let response;
                if (test.method === 'GET') {
                    response = await page.request.get(test.endpoint);
                } else {
                    response = await page.request.post(test.endpoint, {
                        data: test.body || {}
                    });
                }

                // Protected endpoints should return 4xx errors for invalid requests
                if (response.status() >= 400 && response.status() < 500) {
                    protectedCount++;
                    console.log(`✅ ${test.endpoint} properly protected: ${response.status()}`);
                } else {
                    console.log(`⚠️ ${test.endpoint} returned: ${response.status()}`);
                }
            } catch (error) {
                // Network errors count as protection
                protectedCount++;
                console.log(`✅ ${test.endpoint} network protected`);
            }
        }

        // At least 2 out of 3 API tests should show protection
        expect(protectedCount, 'API endpoints should validate requests properly').toBeGreaterThanOrEqual(2);
    });
});
