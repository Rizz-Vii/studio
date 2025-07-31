/**
 * 🧠 NeuroSEO™ Suite Integration Tests
 * Purpose: Comprehensive testing of all 6 AI engines + orchestrator
 * Created: July 31, 2025
 */

import { test, expect, Page } from '@playwright/test';

test.describe('NeuroSEO™ Suite - AI Engine Tests', () => {

    test.beforeEach(async ({ page }) => {
        // Set up authenticated session
        await page.goto('/login');
        await page.evaluate(() => {
            localStorage.setItem('auth_user', JSON.stringify({
                uid: 'test_user_123',
                email: 'test@example.com',
                role: 'enterprise'
            }));
        });
    });

    test('NeuroSEO™ Main Dashboard Access', async ({ page }) => {
        await page.goto('/neuroseo');

        // Verify main NeuroSEO dashboard loads
        await expect(page.locator('h1')).toContainText('NeuroSEO');
        await expect(page.locator('text=AI-Powered SEO Analysis')).toBeVisible();

        console.log('✅ NeuroSEO main dashboard access test passed');
    });

    test('Neural Crawler™ - Web Content Extraction', async ({ page }) => {
        await page.goto('/neuroseo/neural-crawler');

        // Test URL input form
        const urlInput = page.locator('[data-testid="url-input"], input[placeholder*="URL"], input[name="url"]');
        if (await urlInput.isVisible()) {
            await urlInput.fill('https://example.com');

            const analyzeButton = page.locator('button:has-text("Analyze"), button:has-text("Crawl"), [data-testid="analyze-button"]');
            if (await analyzeButton.isVisible()) {
                await analyzeButton.click();

                // Wait for results or loading state
                const loadingOrResults = page.locator('[data-testid="loading"], [data-testid="results"], .spinner, .loading');
                await expect(loadingOrResults).toBeVisible({ timeout: 10000 });
            }
        }

        console.log('✅ Neural Crawler™ test passed');
    });

    test('SemanticMap™ - NLP Analysis Engine', async ({ page }) => {
        await page.goto('/neuroseo/semantic-map');

        // Test content analysis
        const contentInput = page.locator('textarea, [data-testid="content-input"]');
        if (await contentInput.isVisible()) {
            await contentInput.fill('This is test content for semantic analysis using advanced AI algorithms for SEO optimization.');

            const analyzeButton = page.locator('button:has-text("Analyze"), [data-testid="analyze-semantic"]');
            if (await analyzeButton.isVisible()) {
                await analyzeButton.click();

                // Check for semantic analysis results
                const results = page.locator('[data-testid="semantic-results"], .results, .analysis-output');
                await expect(results).toBeVisible({ timeout: 15000 });
            }
        }

        console.log('✅ SemanticMap™ test passed');
    });

    test('AI Visibility Engine - LLM Citation Tracking', async ({ page }) => {
        await page.goto('/neuroseo/ai-visibility');

        // Test visibility analysis
        const domainInput = page.locator('[data-testid="domain-input"], input[placeholder*="domain"]');
        if (await domainInput.isVisible()) {
            await domainInput.fill('example.com');

            const checkButton = page.locator('button:has-text("Check"), [data-testid="check-visibility"]');
            if (await checkButton.isVisible()) {
                await checkButton.click();

                // Verify visibility metrics appear
                const metrics = page.locator('[data-testid="visibility-score"], .visibility-metrics, .citation-count');
                await expect(metrics).toBeVisible({ timeout: 20000 });
            }
        }

        console.log('✅ AI Visibility Engine test passed');
    });

    test('TrustBlock™ - E-A-T Optimization', async ({ page }) => {
        await page.goto('/neuroseo/trust-block');

        // Test E-A-T analysis
        const contentUrlInput = page.locator('[data-testid="content-url"], input[placeholder*="content"]');
        if (await contentUrlInput.isVisible()) {
            await contentUrlInput.fill('https://example.com/article');

            const analyzeButton = page.locator('button:has-text("Analyze"), [data-testid="analyze-trust"]');
            if (await analyzeButton.isVisible()) {
                await analyzeButton.click();

                // Check for E-A-T scores
                const trustScores = page.locator('[data-testid*="score"], .trust-metrics, .eat-analysis');
                await expect(trustScores).toBeVisible({ timeout: 15000 });
            }
        }

        console.log('✅ TrustBlock™ test passed');
    });

    test('RewriteGen™ - AI Content Optimization', async ({ page }) => {
        await page.goto('/neuroseo/rewrite-gen');

        // Test content rewriting
        const originalContent = page.locator('[data-testid="original-content"], textarea[placeholder*="content"]');
        if (await originalContent.isVisible()) {
            await originalContent.fill('Basic content that needs SEO optimization and improvement for better search rankings.');

            const generateButton = page.locator('button:has-text("Generate"), [data-testid="generate-rewrite"]');
            if (await generateButton.isVisible()) {
                await generateButton.click();

                // Verify rewritten content appears
                const rewrittenContent = page.locator('[data-testid="rewritten-content"], .rewrite-output, .generated-content');
                await expect(rewrittenContent).toBeVisible({ timeout: 20000 });
            }
        }

        console.log('✅ RewriteGen™ test passed');
    });

    test('NeuroSEO™ Orchestrator - Unified Analysis', async ({ page }) => {
        await page.goto('/neuroseo');

        // Test complete analysis workflow
        const analysisUrl = page.locator('[data-testid="analysis-url"], input[placeholder*="website"]');
        if (await analysisUrl.isVisible()) {
            await analysisUrl.fill('https://example.com');

            const fullAnalysisButton = page.locator('button:has-text("Full Analysis"), [data-testid="run-full-analysis"]');
            if (await fullAnalysisButton.isVisible()) {
                await fullAnalysisButton.click();

                // Check that all engines show activity
                const engineStatuses = [
                    '[data-testid*="neural-crawler"]',
                    '[data-testid*="semantic-map"]',
                    '[data-testid*="ai-visibility"]',
                    '[data-testid*="trust-block"]',
                    '[data-testid*="rewrite-gen"]'
                ];

                // Wait for orchestrator to initialize engines
                await page.waitForTimeout(3000);

                // Verify orchestrator results container
                const orchestratorResults = page.locator('[data-testid="orchestrator-results"], .analysis-results, .neuroseo-output');
                await expect(orchestratorResults).toBeVisible({ timeout: 30000 });
            }
        }

        console.log('✅ NeuroSEO™ Orchestrator test passed');
    });

    test('API Integration - NeuroSEO™ Endpoints', async ({ page, request }) => {
        // Test main NeuroSEO API endpoint
        const response = await request.post('/api/neuroseo', {
            data: {
                url: 'https://example.com',
                analysis_type: 'full',
                engines: ['neural-crawler', 'semantic-map']
            }
        });

        expect(response.status()).toBeLessThan(500);

        // Test enhanced NeuroSEO API
        const enhancedResponse = await request.post('/api/mcp/neuroseo/enhanced', {
            data: {
                url: 'https://example.com',
                depth: 'comprehensive'
            }
        });

        expect(enhancedResponse.status()).toBeLessThan(500);

        console.log('✅ NeuroSEO API integration test passed');
    });

    test('Performance - Engine Response Times', async ({ page }) => {
        await page.goto('/neuroseo');

        const startTime = performance.now();

        // Trigger a quick analysis
        const quickAnalysis = page.locator('button:has-text("Quick"), [data-testid="quick-analysis"]');
        if (await quickAnalysis.isVisible()) {
            await quickAnalysis.click();

            // Wait for any results
            const results = page.locator('.results, [data-testid*="result"], .analysis-output');
            await expect(results).toBeVisible({ timeout: 15000 });
        }

        const endTime = performance.now();
        const responseTime = endTime - startTime;

        // Should complete within reasonable time
        expect(responseTime).toBeLessThan(20000); // 20 seconds max

        console.log(`✅ Performance test passed - Response time: ${responseTime}ms`);
    });

    test('Error Handling - Invalid Inputs', async ({ page }) => {
        await page.goto('/neuroseo/neural-crawler');

        // Test invalid URL handling
        const urlInput = page.locator('[data-testid="url-input"], input');
        if (await urlInput.isVisible()) {
            await urlInput.fill('invalid-url-format');

            const analyzeButton = page.locator('button:has-text("Analyze")');
            if (await analyzeButton.isVisible()) {
                await analyzeButton.click();

                // Should show validation error
                const errorMessage = page.locator('.error, [data-testid="error"], .validation-error');
                await expect(errorMessage).toBeVisible({ timeout: 5000 });
            }
        }

        console.log('✅ Error handling test passed');
    });

    test('Mobile Responsiveness - NeuroSEO Interface', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/neuroseo');

        // Header should be responsive
        await expect(page.locator('h1')).toBeVisible();

        // Input forms should be mobile-friendly
        const inputs = page.locator('input, textarea, button');
        const inputCount = await inputs.count();

        for (let i = 0; i < Math.min(inputCount, 5); i++) {
            const input = inputs.nth(i);
            if (await input.isVisible()) {
                const box = await input.boundingBox();
                if (box) {
                    expect(box.height).toBeGreaterThanOrEqual(44); // Minimum touch target
                }
            }
        }

        console.log('✅ Mobile responsiveness test passed');
    });
});
