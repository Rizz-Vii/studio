/**
 * Production Testing Configuration
 * RankPilot - Production Validation Tests
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './testing/production',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [
        ['html'],
        ['json', { outputFile: 'test-results/production-results.json' }],
        ['line'],
    ],

    use: {
        baseURL: process.env.BASE_URL || 'http://localhost:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        actionTimeout: 10000,
        navigationTimeout: 30000,
    },

    projects: [
        {
            name: 'security-tests',
            testMatch: '**/security.spec.ts',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'load-tests',
            testMatch: '**/load.spec.ts',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'mobile-compatibility',
            testMatch: '**/mobile.spec.ts',
            use: { ...devices['iPhone 12'] },
        },
        {
            name: 'tablet-compatibility',
            testMatch: '**/mobile.spec.ts',
            use: { ...devices['iPad Pro'] },
        },
        {
            name: 'android-compatibility',
            testMatch: '**/mobile.spec.ts',
            use: { ...devices['Galaxy S9+'] },
        },
    ],

    webServer: {
        command: 'npm run build && npm start',
        port: 3000,
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
    },
});
