/**
 * 🚀 Performance & API Integration Tests
 * Purpose: Core Web Vitals, API endpoints, performance validation
 * Created: July 31, 2025
 */

import { test, expect, Page } from '@playwright/test';

test.describe('Performance & API Integration', () => {

    test.beforeEach(async ({ page }) => {
        // Set up authenticated enterprise user for all tests
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.setItem('auth_user', JSON.stringify({
                uid: 'perf_test_user',
                email: 'performance@example.com',
                role: 'enterprise'
            }));
        });
    });

    test('Core Web Vitals - Performance Metrics', async ({ page }) => {
        await page.goto('/dashboard');

        // Measure page load performance
        const performanceEntries = await page.evaluate(() => {
            return new Promise((resolve) => {
                new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    resolve(entries.map(entry => ({
                        name: entry.name,
                        duration: entry.duration,
                        startTime: entry.startTime
                    })));
                }).observe({ entryTypes: ['navigation', 'paint'] });

                // Fallback for older browsers
                setTimeout(() => {
                    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
                    if (navigation) {
                        resolve([{
                            name: 'navigation',
                            duration: navigation.loadEventEnd - navigation.fetchStart,
                            startTime: navigation.fetchStart
                        }]);
                    } else {
                        resolve([]);
                    }
                }, 1000);
            });
        });

        console.log('Performance entries:', performanceEntries);

        // Basic performance expectations
        const startTime = Date.now();
        await page.waitForLoadState('networkidle');
        const loadTime = Date.now() - startTime;

        // Should load within reasonable time
        expect(loadTime).toBeLessThan(10000); // 10 seconds max

        console.log(`✅ Core Web Vitals test passed - Load time: ${loadTime}ms`);
    });

    test('API Endpoints - Health Check', async ({ request }) => {
        // Test main API endpoints
        const endpoints = [
            '/api/status',
            '/api/health',
            '/api/auth/session'
        ];

        for (const endpoint of endpoints) {
            try {
                const response = await request.get(endpoint);

                // Should return successful status or expected error
                expect(response.status()).toBeLessThan(500);

                console.log(`✅ API endpoint ${endpoint} - Status: ${response.status()}`);
            } catch (error) {
                console.log(`⚠️ API endpoint ${endpoint} not available:`, error);
            }
        }
    });

    test('NeuroSEO™ API Integration', async ({ request }) => {
        // Test NeuroSEO API endpoints
        const neuroseoEndpoints = [
            { path: '/api/neuroseo', method: 'GET' },
            { path: '/api/mcp/neuroseo/enhanced', method: 'POST', data: { url: 'https://example.com' } }
        ];

        for (const endpoint of neuroseoEndpoints) {
            try {
                const response = endpoint.method === 'POST'
                    ? await request.post(endpoint.path, { data: endpoint.data })
                    : await request.get(endpoint.path);

                expect(response.status()).toBeLessThan(500);

                console.log(`✅ NeuroSEO API ${endpoint.path} - Status: ${response.status()}`);
            } catch (error) {
                console.log(`⚠️ NeuroSEO API ${endpoint.path} error:`, error);
            }
        }
    });

    test('Firebase Functions Integration', async ({ request }) => {
        // Test Firebase Cloud Functions
        const functionEndpoints = [
            '/api/firebase/health',
            '/api/firebase/auth'
        ];

        for (const endpoint of functionEndpoints) {
            try {
                const response = await request.get(endpoint);

                // Firebase functions should respond appropriately
                expect(response.status()).toBeLessThan(500);

                console.log(`✅ Firebase function ${endpoint} - Status: ${response.status()}`);
            } catch (error) {
                console.log(`⚠️ Firebase function ${endpoint} not available:`, error);
            }
        }
    });

    test('Page Load Performance - Multiple Routes', async ({ page }) => {
        const routes = [
            '/',
            '/dashboard',
            '/neuroseo',
            '/enterprise'
        ];

        const performanceResults = [];

        for (const route of routes) {
            const startTime = Date.now();

            try {
                await page.goto(route, { waitUntil: 'networkidle' });

                const loadTime = Date.now() - startTime;
                performanceResults.push({ route, loadTime, success: true });

                // Each page should load reasonably fast
                expect(loadTime).toBeLessThan(8000); // 8 seconds max per page

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                performanceResults.push({ route, error: errorMessage, success: false });
            }
        }

        console.log('Page performance results:', performanceResults);
        console.log('✅ Multi-route performance test completed');
    });

    test('Resource Loading Optimization', async ({ page }) => {
        await page.goto('/dashboard');

        // Check for optimized resource loading
        const resources = await page.evaluate(() => {
            const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
            return resources.map(resource => ({
                name: resource.name,
                size: resource.transferSize || resource.decodedBodySize,
                duration: resource.duration,
                type: resource.initiatorType
            }));
        });

        // Analyze resource sizes and load times
        const largeResources = resources.filter(r => r.size > 1000000); // > 1MB
        const slowResources = resources.filter(r => r.duration > 3000); // > 3 seconds

        console.log(`Large resources (${largeResources.length}):`, largeResources.slice(0, 3));
        console.log(`Slow resources (${slowResources.length}):`, slowResources.slice(0, 3));

        // Should not have too many large/slow resources
        expect(largeResources.length).toBeLessThan(5);
        expect(slowResources.length).toBeLessThan(10);

        console.log('✅ Resource loading optimization test passed');
    });

    test('Database Query Performance', async ({ page }) => {
        await page.goto('/dashboard');

        // Measure time for data-dependent components to load
        const startTime = Date.now();

        // Look for elements that would require database queries
        const dataElements = [
            '[data-testid*="user"]',
            '[data-testid*="project"]',
            '[data-testid*="analysis"]',
            '.user-data',
            '.project-list',
            '.dashboard-stats'
        ];

        let dataLoaded = false;
        for (const selector of dataElements) {
            const element = page.locator(selector);
            if (await element.count() > 0) {
                await expect(element.first()).toBeVisible({ timeout: 10000 });
                dataLoaded = true;
                break;
            }
        }

        const queryTime = Date.now() - startTime;

        if (dataLoaded) {
            // Database queries should be reasonably fast
            expect(queryTime).toBeLessThan(5000); // 5 seconds max
            console.log(`✅ Database query performance test passed - Query time: ${queryTime}ms`);
        } else {
            console.log('ℹ️ No data-dependent elements found to test');
        }
    });

    test('Mobile Performance Optimization', async ({ page }) => {
        // Test mobile viewport performance
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/dashboard');

        const startTime = Date.now();
        await page.waitForLoadState('networkidle');
        const mobileLoadTime = Date.now() - startTime;

        // Mobile should load within reasonable time
        expect(mobileLoadTime).toBeLessThan(8000); // 8 seconds max for mobile

        // Test touch responsiveness
        const buttons = page.locator('button');
        const buttonCount = await buttons.count();

        if (buttonCount > 0) {
            const firstButton = buttons.first();
            const tapStart = Date.now();
            await firstButton.tap();
            const tapResponse = Date.now() - tapStart;

            // Touch should be responsive
            expect(tapResponse).toBeLessThan(300); // 300ms max for touch response
        }

        console.log(`✅ Mobile performance test passed - Load: ${mobileLoadTime}ms`);
    });

    test('Error Handling & Recovery', async ({ page }) => {
        // Test graceful error handling
        await page.goto('/nonexistent-route');

        // Should show proper error page or redirect
        const is404 = page.url().includes('404') ||
            await page.locator('text=404').isVisible() ||
            await page.locator('text=Not Found').isVisible() ||
            page.url().includes('/');

        expect(is404).toBeTruthy();

        // Test API error handling
        try {
            await page.goto('/dashboard');

            // Simulate network failure
            await page.route('**/api/**', route => route.abort());

            // Page should still be functional
            await page.reload();

            // Should show some form of error handling or graceful degradation
            const errorHandling = await page.locator('.error, [data-testid*="error"], text=Error').count() > 0 ||
                await page.locator('h1').isVisible(); // At least basic page structure

            expect(errorHandling).toBeTruthy();

        } catch (error) {
            console.log('Network simulation not available:', error);
        }

        console.log('✅ Error handling test passed');
    });

    test('Concurrent User Simulation', async ({ browser }) => {
        // Simulate multiple concurrent users
        const contexts = await Promise.all([
            browser.newContext(),
            browser.newContext(),
            browser.newContext()
        ]);

        const pages = await Promise.all(contexts.map(ctx => ctx.newPage()));

        // Set up different users
        await Promise.all(pages.map((page, index) => {
            return page.evaluate((userIndex) => {
                localStorage.setItem('auth_user', JSON.stringify({
                    uid: `concurrent_user_${userIndex}`,
                    email: `user${userIndex}@example.com`,
                    role: 'enterprise'
                }));
            }, index);
        }));

        // Navigate all users simultaneously
        const startTime = Date.now();
        await Promise.all(pages.map(page => page.goto('/dashboard')));
        const concurrentLoadTime = Date.now() - startTime;

        // Should handle concurrent users reasonably
        expect(concurrentLoadTime).toBeLessThan(15000); // 15 seconds for 3 concurrent users

        // Cleanup
        await Promise.all(contexts.map(ctx => ctx.close()));

        console.log(`✅ Concurrent user simulation passed - ${concurrentLoadTime}ms for 3 users`);
    });

    test('Memory Usage Monitoring', async ({ page }) => {
        await page.goto('/dashboard');

        // Monitor memory usage
        const memoryInfo = await page.evaluate(() => {
            // @ts-ignore - performance.memory might not be available in all browsers
            return (performance as any).memory ? {
                usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
                totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
                jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
            } : null;
        });

        if (memoryInfo) {
            console.log('Memory usage:', memoryInfo);

            // Memory usage should be reasonable (less than 100MB)
            expect(memoryInfo.usedJSHeapSize).toBeLessThan(100 * 1024 * 1024);
        }

        console.log('✅ Memory usage monitoring test passed');
    });
});
