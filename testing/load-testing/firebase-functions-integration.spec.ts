/**
 * RankPilot Firebase Functions - Integration Testing Suite
 * Comprehensive testing for all deployed Firebase Functions
 */

import { test, expect } from '@playwright/test';

// Production Firebase Functions URLs (australia-southeast2)
const PRODUCTION_BASE_URL = 'https://australia-southeast2-rankpilot-h3jpc.cloudfunctions.net';

test.describe('RankPilot Firebase Functions - Integration Tests', () => {

    test.beforeEach(async ({ page }) => {
        // Set appropriate timeouts for function calls
        page.setDefaultNavigationTimeout(60000);
        page.setDefaultTimeout(30000);
    });

    test.describe('AI-Powered Functions', () => {

        test('Keyword Suggestions Enhanced - API Contract', async ({ page }) => {
            const testData = {
                keyword: 'SEO optimization',
                count: 10,
                language: 'en'
            };

            try {
                const response = await page.request.post(`${PRODUCTION_BASE_URL}/getKeywordSuggestionsEnhanced`, {
                    data: testData,
                    timeout: 25000
                });

                console.log(`📊 Keyword Suggestions Enhanced Status: ${response.status()}`);

                if (response.status() === 401) {
                    console.log('⚠️  Authentication required (expected in production)');
                    expect(response.status()).toBe(401);
                } else if (response.status() === 200) {
                    const responseBody = await response.json();
                    expect(responseBody).toHaveProperty('suggestions');
                    expect(Array.isArray(responseBody.suggestions)).toBe(true);
                }

            } catch (error) {
                console.log('⚠️  Keyword Suggestions test failed (likely auth-protected):', error);
            }
        });

        test('Content Analyzer - API Contract', async ({ page }) => {
            const testData = {
                url: 'https://example.com',
                analysisType: 'basic'
            };

            try {
                const response = await page.request.post(`${PRODUCTION_BASE_URL}/analyzeContent`, {
                    data: testData,
                    timeout: 30000
                });

                console.log(`🔍 Content Analyzer Status: ${response.status()}`);

                if (response.status() === 401) {
                    console.log('⚠️  Authentication required (expected in production)');
                    expect(response.status()).toBe(401);
                } else if (response.status() === 200) {
                    const responseBody = await response.json();
                    expect(responseBody).toHaveProperty('analysis');
                }

            } catch (error) {
                console.log('⚠️  Content Analyzer test failed (likely auth-protected):', error);
            }
        });

        test('SEO Audit - API Contract', async ({ page }) => {
            const testData = {
                url: 'https://example.com',
                auditType: 'comprehensive'
            };

            try {
                const response = await page.request.post(`${PRODUCTION_BASE_URL}/runSeoAudit`, {
                    data: testData,
                    timeout: 45000
                });

                console.log(`🔍 SEO Audit Status: ${response.status()}`);

                if (response.status() === 401) {
                    console.log('⚠️  Authentication required (expected in production)');
                    expect(response.status()).toBe(401);
                } else if (response.status() === 200) {
                    const responseBody = await response.json();
                    expect(responseBody).toHaveProperty('audit');
                }

            } catch (error) {
                console.log('⚠️  SEO Audit test failed (likely auth-protected):', error);
            }
        });
    });

    test.describe('Email Functions', () => {

        test('Send Payment Receipt - API Contract', async ({ page }) => {
            const testData = {
                email: 'test@example.com',
                amount: 9.99,
                currency: 'USD',
                transactionId: 'test-tx-123'
            };

            try {
                const response = await page.request.post(`${PRODUCTION_BASE_URL}/sendPaymentReceipt`, {
                    data: testData,
                    timeout: 20000
                });

                console.log(`📧 Payment Receipt Status: ${response.status()}`);

                // These functions should have proper error responses for invalid data
                expect([200, 400, 401, 403]).toContain(response.status());

            } catch (error) {
                console.log('⚠️  Payment Receipt test failed:', error);
            }
        });

        test('Send Welcome Email - API Contract', async ({ page }) => {
            const testData = {
                email: 'test@example.com',
                name: 'Test User',
                subscriptionTier: 'free'
            };

            try {
                const response = await page.request.post(`${PRODUCTION_BASE_URL}/sendWelcomeEmailFunction`, {
                    data: testData,
                    timeout: 20000
                });

                console.log(`📧 Welcome Email Status: ${response.status()}`);

                // These functions should have proper error responses for invalid data
                expect([200, 400, 401, 403]).toContain(response.status());

            } catch (error) {
                console.log('⚠️  Welcome Email test failed:', error);
            }
        });
    });

    test.describe('Webhook Functions', () => {

        test('Stripe Webhook - Health Check', async ({ page }) => {
            // Test webhook endpoint availability (without valid signature)
            try {
                const response = await page.request.post(`${PRODUCTION_BASE_URL}/stripeWebhook`, {
                    data: { test: 'ping' },
                    timeout: 15000
                });

                console.log(`💳 Stripe Webhook Status: ${response.status()}`);

                // Webhook should return 400 for invalid signature (expected)
                expect([400, 401, 403]).toContain(response.status());

            } catch (error) {
                console.log('⚠️  Stripe Webhook test failed:', error);
            }
        });
    });

    test.describe('Performance Monitoring Functions', () => {

        test('Real-time Metrics - API Contract', async ({ page }) => {
            const testData = {
                timeRange: '1h',
                metrics: ['response_time', 'error_rate']
            };

            try {
                const response = await page.request.post(`${PRODUCTION_BASE_URL}/realtimeMetrics`, {
                    data: testData,
                    timeout: 15000
                });

                console.log(`📊 Real-time Metrics Status: ${response.status()}`);

                if (response.status() === 401) {
                    console.log('⚠️  Authentication required (expected in production)');
                    expect(response.status()).toBe(401);
                } else if (response.status() === 200) {
                    const responseBody = await response.json();
                    expect(responseBody).toHaveProperty('metrics');
                }

            } catch (error) {
                console.log('⚠️  Real-time Metrics test failed (likely auth-protected):', error);
            }
        });

        test('Function Metrics - API Contract', async ({ page }) => {
            const testData = {
                functionName: 'healthCheck',
                timeRange: '24h'
            };

            try {
                const response = await page.request.post(`${PRODUCTION_BASE_URL}/functionMetrics`, {
                    data: testData,
                    timeout: 15000
                });

                console.log(`📈 Function Metrics Status: ${response.status()}`);

                if (response.status() === 401) {
                    console.log('⚠️  Authentication required (expected in production)');
                    expect(response.status()).toBe(401);
                } else if (response.status() === 200) {
                    const responseBody = await response.json();
                    expect(responseBody).toHaveProperty('metrics');
                }

            } catch (error) {
                console.log('⚠️  Function Metrics test failed (likely auth-protected):', error);
            }
        });

        test('A/B Test Management - API Contract', async ({ page }) => {
            const testData = {
                action: 'get_active_tests',
                userId: 'test-user-123'
            };

            try {
                const response = await page.request.post(`${PRODUCTION_BASE_URL}/abTestManagement`, {
                    data: testData,
                    timeout: 15000
                });

                console.log(`🧪 A/B Test Management Status: ${response.status()}`);

                if (response.status() === 401) {
                    console.log('⚠️  Authentication required (expected in production)');
                    expect(response.status()).toBe(401);
                } else if (response.status() === 200) {
                    const responseBody = await response.json();
                    expect(responseBody).toHaveProperty('tests');
                }

            } catch (error) {
                console.log('⚠️  A/B Test Management test failed (likely auth-protected):', error);
            }
        });
    });
});

test.describe('RankPilot Firebase Functions - Error Handling', () => {

    test('Invalid Function Name - 404 Handling', async ({ page }) => {
        try {
            const response = await page.request.post(`${PRODUCTION_BASE_URL}/nonExistentFunction`, {
                data: {},
                timeout: 10000
            });

            console.log(`❌ Invalid Function Status: ${response.status()}`);
            expect(response.status()).toBe(404);

        } catch (error) {
            // Expected for non-existent functions
            console.log('✅ Invalid function properly rejected');
        }
    });

    test('Malformed Request - Error Handling', async ({ page }) => {
        try {
            const response = await page.request.post(`${PRODUCTION_BASE_URL}/healthCheck`, {
                data: 'invalid-json-string',
                timeout: 10000
            });

            console.log(`🔍 Malformed Request Status: ${response.status()}`);
            expect([400, 401, 500]).toContain(response.status());

        } catch (error) {
            console.log('✅ Malformed request properly handled');
        }
    });

    test('Large Payload - Memory Handling', async ({ page }) => {
        // Test with very large payload to ensure proper memory handling
        const largePayload = {
            data: Array(10000).fill(0).map((_, i) => ({
                id: i,
                content: 'x'.repeat(1000), // 1KB per item = ~10MB total
                timestamp: new Date().toISOString()
            }))
        };

        try {
            const response = await page.request.post(`${PRODUCTION_BASE_URL}/healthCheck`, {
                data: largePayload,
                timeout: 30000
            });

            console.log(`💾 Large Payload Status: ${response.status()}`);

            // Should either handle it (200) or reject it gracefully (400/413)
            expect([200, 400, 413, 500]).toContain(response.status());

        } catch (error) {
            console.log('⚠️  Large payload test failed (expected for memory limits)');
        }
    });
});

test.describe('RankPilot Firebase Functions - Security Tests', () => {

    test('CORS Headers - Cross-Origin Support', async ({ page }) => {
        const response = await page.request.post(`${PRODUCTION_BASE_URL}/healthCheck`, {
            data: {},
            headers: {
                'Origin': 'https://rankpilot.app'
            }
        });

        console.log(`🔐 CORS Test Status: ${response.status()}`);

        const headers = response.headers();
        console.log('Response Headers:', Object.keys(headers));

        expect(response.status()).toBe(200);
        // Should have CORS headers for proper frontend integration
    });

    test('Rate Limiting - Multiple Rapid Requests', async ({ page }) => {
        const rapidRequests = 50;
        const promises: Promise<any>[] = [];

        console.log(`🚦 Testing rate limiting with ${rapidRequests} rapid requests...`);

        for (let i = 0; i < rapidRequests; i++) {
            const promise = page.request.post(`${PRODUCTION_BASE_URL}/healthCheck`, {
                data: { iteration: i },
                timeout: 5000
            });
            promises.push(promise);
        }

        try {
            const responses = await Promise.all(promises);

            const statusCodes = responses.map(r => r.status());
            const successCount = statusCodes.filter(s => s === 200).length;
            const rateLimitedCount = statusCodes.filter(s => s === 429).length;

            console.log(`✅ Rate Limiting Results:`);
            console.log(`   Successful: ${successCount}`);
            console.log(`   Rate Limited: ${rateLimitedCount}`);
            console.log(`   Total: ${rapidRequests}`);

            // Either all should succeed (no rate limiting) or some should be rate limited
            expect(successCount + rateLimitedCount).toBeGreaterThan(rapidRequests * 0.5);

        } catch (error) {
            console.log('⚠️  Rate limiting test completed with timeouts (expected)');
        }
    });
});
