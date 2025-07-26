/**
 * Playwright Configuration with Page Warming
 * Optimized for AI-heavy RankPilot pages with pre-warming strategy
 */

import { defineConfig, devices } from '@playwright/test';
import path from 'path';

export default defineConfig({
    testDir: './testing/specs/main',
    globalSetup: path.resolve(__dirname, './testing/specs/main/global-setup-warming.ts'),
    globalTeardown: path.resolve(__dirname, './testing/specs/main/global-teardown.ts'),

    // Optimized for warming strategy
    fullyParallel: false, // Sequential execution after warming
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 1,
    workers: process.env.CI ? 1 : 1, // Single worker to preserve warming benefits
    reporter: [
        ['html', { open: 'never' }],
        ['list'],
        ['json', { outputFile: 'testing/results/warming-test-results.json' }]
    ],

    use: {
        baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',

        // Optimized timeouts for warmed pages
        navigationTimeout: 20000, // Reduced from 45s since pages are pre-warmed
        actionTimeout: 15000, // Reduced from 40s since components are pre-loaded
    },

    projects: [
        {
            name: 'warmed-tests',
            use: {
                ...devices['Desktop Chrome'],
                // Memory optimized for warmed pages
                launchOptions: {
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-web-security',
                        '--memory-pressure-off',
                        '--max_old_space_size=1024', // Reduced since pages are pre-warmed
                    ],
                },
            },
        },
        {
            name: 'warmed-mobile',
            use: {
                ...devices['Pixel 5'],
                launchOptions: {
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--memory-pressure-off',
                        '--max_old_space_size=512', // Mobile with minimal memory
                    ],
                },
            },
        },
    ],

    // Output configuration
    outputDir: 'testing/results/warming/',
});
