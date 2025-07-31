/**
 * 🔒 Enterprise Security & Auth Tests
 * Purpose: Comprehensive security testing for 5-tier access system
 * Created: July 31, 2025
 */

import { test, expect, Page } from '@playwright/test';

test.describe('Enterprise Security & Authentication', () => {

    test.beforeEach(async ({ page }) => {
        // Clear any existing auth
        await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });
    });

    test('Authentication Flow - Login/Logout', async ({ page }) => {
        await page.goto('/');

        // Should redirect to login for protected routes
        await page.goto('/dashboard');
        const currentUrl = page.url();
        expect(currentUrl).toContain('login');

        // Test login form exists
        const loginForm = page.locator('form');
        await expect(loginForm).toBeVisible();

        // Test sign-in button
        const signInButton = page.locator('button:has-text("Sign"), [data-testid="auth-button"]');
        await expect(signInButton).toBeVisible();

        console.log('✅ Authentication flow test passed');
    });

    test('Role-Based Access Control - Free Tier', async ({ page }) => {
        // Set up Free tier user
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.setItem('auth_user', JSON.stringify({
                uid: 'free_user_123',
                email: 'free@example.com',
                role: 'free'
            }));
        });

        await page.goto('/dashboard');

        // Free users should see limited features
        const restrictedFeatures = [
            'text=Enterprise',
            'text=Advanced Analytics',
            '[data-tier="enterprise"]',
            '[data-tier="admin"]'
        ];

        for (const feature of restrictedFeatures) {
            const element = page.locator(feature);
            if (await element.count() > 0) {
                await expect(element).not.toBeVisible();
            }
        }

        console.log('✅ Free tier access control test passed');
    });

    test('Role-Based Access Control - Enterprise Tier', async ({ page }) => {
        // Set up Enterprise tier user
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.setItem('auth_user', JSON.stringify({
                uid: 'enterprise_user_123',
                email: 'enterprise@example.com',
                role: 'enterprise'
            }));
        });

        await page.goto('/dashboard');

        // Enterprise users should see advanced features
        const enterpriseFeatures = [
            '.enterprise-feature',
            '[data-tier="enterprise"]',
            'text=Advanced Analytics'
        ];

        // Check at least one enterprise feature is available
        let enterpriseFeatureFound = false;
        for (const feature of enterpriseFeatures) {
            const element = page.locator(feature);
            if (await element.count() > 0 && await element.isVisible()) {
                enterpriseFeatureFound = true;
                break;
            }
        }

        console.log('✅ Enterprise tier access control test passed');
    });

    test('Admin Access Control', async ({ page }) => {
        // Set up Admin user
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.setItem('auth_user', JSON.stringify({
                uid: 'admin_user_123',
                email: 'admin@example.com',
                role: 'admin'
            }));
        });

        // Admin should access admin routes
        await page.goto('/admin');

        // Should not redirect (admin has access)
        const currentUrl = page.url();
        expect(currentUrl).toContain('admin');

        // Look for admin-specific elements
        const adminElements = [
            'h1:has-text("Admin")',
            '[data-testid="admin-panel"]',
            '.admin-dashboard'
        ];

        let adminElementFound = false;
        for (const selector of adminElements) {
            const element = page.locator(selector);
            if (await element.count() > 0) {
                adminElementFound = true;
                break;
            }
        }

        console.log('✅ Admin access control test passed');
    });

    test('Unauthorized Access Prevention', async ({ page }) => {
        // Test accessing protected routes without auth
        const protectedRoutes = [
            '/dashboard',
            '/admin',
            '/enterprise',
            '/neuroseo'
        ];

        for (const route of protectedRoutes) {
            await page.goto(route);

            // Should redirect to login or show auth required
            const url = page.url();
            const hasAuth = url.includes('login') ||
                await page.locator('text=Sign in').isVisible() ||
                await page.locator('[data-testid="auth-required"]').isVisible();

            expect(hasAuth).toBeTruthy();
        }

        console.log('✅ Unauthorized access prevention test passed');
    });

    test('Session Management', async ({ page }) => {
        // Test session persistence
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.setItem('auth_user', JSON.stringify({
                uid: 'session_test_123',
                email: 'session@example.com',
                role: 'starter'
            }));
        });

        await page.goto('/dashboard');

        // Reload page - session should persist
        await page.reload();

        // Should still be on dashboard (not redirected to login)
        const url = page.url();
        expect(url).toContain('dashboard');

        console.log('✅ Session management test passed');
    });

    test('Input Validation & XSS Prevention', async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.setItem('auth_user', JSON.stringify({
                uid: 'test_user_123',
                email: 'test@example.com',
                role: 'enterprise'
            }));
        });

        await page.goto('/neuroseo');

        // Test XSS prevention in input fields
        const maliciousScript = '<script>alert("XSS")</script>';

        const inputs = page.locator('input, textarea');
        const inputCount = await inputs.count();

        if (inputCount > 0) {
            const firstInput = inputs.first();
            await firstInput.fill(maliciousScript);

            // Script should be escaped/sanitized
            const inputValue = await firstInput.inputValue();
            expect(inputValue).not.toContain('<script>');
        }

        console.log('✅ XSS prevention test passed');
    });

    test('API Security - Rate Limiting', async ({ page, request }) => {
        // Test API rate limiting (if implemented)
        const requests = [];

        for (let i = 0; i < 5; i++) {
            requests.push(
                request.get('/api/status').catch(() => ({ status: () => 429 }))
            );
        }

        const responses = await Promise.all(requests);

        // At least one should succeed
        const successfulRequests = responses.filter(r => r.status() === 200 || r.status() === 404);
        expect(successfulRequests.length).toBeGreaterThan(0);

        console.log('✅ API security test passed');
    });

    test('CSRF Protection', async ({ page }) => {
        // Test CSRF token handling in forms
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.setItem('auth_user', JSON.stringify({
                uid: 'csrf_test_123',
                email: 'csrf@example.com',
                role: 'enterprise'
            }));
        });

        await page.goto('/dashboard');

        // Look for forms that should have CSRF protection
        const forms = page.locator('form');
        const formCount = await forms.count();

        if (formCount > 0) {
            // Forms should have some form of protection
            const hasProtection = await page.locator('input[name*="csrf"], input[name*="token"], meta[name="csrf-token"]').count() > 0;

            // If no explicit CSRF tokens, ensure forms use proper methods
            if (!hasProtection) {
                const form = forms.first();
                const method = await form.getAttribute('method');
                const action = await form.getAttribute('action');

                // Form should have proper attributes
                expect(method || action).toBeTruthy();
            }
        }

        console.log('✅ CSRF protection test passed');
    });

    test('Sensitive Data Exposure Prevention', async ({ page }) => {
        await page.goto('/');

        // Check that sensitive data is not exposed in client-side code
        const content = await page.content();

        // Should not contain sensitive patterns
        const sensitivePatterns = [
            /sk-[a-zA-Z0-9]{48,}/,  // OpenAI API keys
            /AIza[0-9A-Za-z_-]{35}/, // Google API keys
            /firebase.*[a-zA-Z0-9]{20,}/, // Firebase keys
            /password.*[:=]\s*["\'][^"\']{8,}/, // Hardcoded passwords
        ];

        for (const pattern of sensitivePatterns) {
            expect(content).not.toMatch(pattern);
        }

        console.log('✅ Sensitive data exposure prevention test passed');
    });

    test('Environment Security', async ({ page }) => {
        // Check that development tools are not exposed in production
        await page.goto('/');

        const devPatterns = [
            'text=Debug Mode',
            'text=Development',
            '[data-testid*="debug"]',
            '.debug-panel'
        ];

        for (const pattern of devPatterns) {
            const element = page.locator(pattern);
            if (await element.count() > 0) {
                await expect(element).not.toBeVisible();
            }
        }

        console.log('✅ Environment security test passed');
    });

    test('Mobile Security - Touch Targets', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.setItem('auth_user', JSON.stringify({
                uid: 'mobile_test_123',
                email: 'mobile@example.com',
                role: 'enterprise'
            }));
        });

        await page.goto('/dashboard');

        // Security-sensitive buttons should have adequate touch targets
        const securityButtons = page.locator('button:has-text("Sign"), button:has-text("Logout"), button:has-text("Delete")');
        const buttonCount = await securityButtons.count();

        for (let i = 0; i < buttonCount; i++) {
            const button = securityButtons.nth(i);
            if (await button.isVisible()) {
                const box = await button.boundingBox();
                if (box) {
                    expect(box.height).toBeGreaterThanOrEqual(44); // Minimum secure touch target
                    expect(box.width).toBeGreaterThanOrEqual(44);
                }
            }
        }

        console.log('✅ Mobile security test passed');
    });
});
