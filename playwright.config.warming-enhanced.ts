/**
 * Playwright Configuration with Enhanced Page Warming & State Persistence
 * Optimized for AI-heavy RankPilot pages with memory-conscious warming strategy
 */

import { defineConfig, devices } from '@playwright/test';
import path from 'path';

export default defineConfig({
    testDir: './testing/specs/main',
    globalSetup: path.resolve(__dirname, './testing/specs/main/global-setup-warming-enhanced.ts'),
    globalTeardown: path.resolve(__dirname, './testing/specs/main/global-teardown.ts'),

    // Enhanced warming strategy
    fullyParallel: false, // Sequential execution after warming
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 1,
    workers: process.env.CI ? 1 : 1, // Single worker to preserve warming benefits
    timeout: 90000, // Increased for AI-heavy pages
    reporter: [
        ['html', { open: 'never' }],
        ['list'],
        ['json', { outputFile: 'testing/results/warming-enhanced-test-results.json' }]
    ],

    use: {
        baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',

        // Enhanced timeouts for AI-heavy pages
        navigationTimeout: 45000, // Increased for AI compilation
        actionTimeout: 25000, // Increased for heavy components
    },

    projects: [
        {
            name: 'warmed-enhanced',
            use: {
                ...devices['Desktop Chrome'],
                // Enhanced memory configuration for AI-heavy pages
                launchOptions: {
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-web-security',
                        '--memory-pressure-off',
                        '--max_old_space_size=6144', // High memory for AI components
                        '--disable-background-timer-throttling',
                        '--disable-backgrounding-occluded-windows',
                        '--disable-renderer-backgrounding',
                    ],
                },
            },
        },
        {
            name: 'warmed-mobile-enhanced',
            use: {
                ...devices['Pixel 5'],
                launchOptions: {
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--memory-pressure-off',
                        '--max_old_space_size=2048', // Enhanced mobile memory
                        '--disable-background-timer-throttling',
                    ],
                },
            },
        },
    ],

    // Output configuration
    outputDir: 'testing/results/warming-enhanced/',
});
