/**
 * Enhanced Security Test Configuration
 * Optimized for RankPilot security validation with unified test users
 */

import { PlaywrightTestConfig, devices } from '@playwright/test';

const config: PlaywrightTestConfig = {
    testDir: './testing/production',
    timeout: 60000, // Increased timeout for security tests
    expect: {
        timeout: 10000
    },
    fullyParallel: false, // Run security tests sequentially for better stability
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 1,
    workers: 1, // Single worker for security tests to avoid conflicts
    reporter: [
        ['html', { outputFolder: 'test-results/security-html-report' }],
        ['json', { outputFile: 'test-results/security-results.json' }],
        ['list']
    ],
    use: {
        baseURL: process.env.BASE_URL || 'http://localhost:3000',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        actionTimeout: 15000,
        navigationTimeout: 30000
    },
    projects: [
        {
            name: 'security-tests',
            testMatch: /security\.spec\.ts$/,
            use: {
                ...devices['Desktop Chrome'],
                storageState: undefined, // No auth state for security tests
                contextOptions: {
                    // Disable JavaScript for some security tests
                    javaScriptEnabled: true,
                    // Security test specific options
                    ignoreHTTPSErrors: false,
                    acceptDownloads: false
                }
            }
        },
        {
            name: 'security-authenticated',
            testMatch: /security-auth\.spec\.ts$/,
            use: {
                ...devices['Desktop Chrome'],
                // Will use authenticated state
                storageState: 'testing/auth-states/dev-user-auth.json'
            }
        }
    ],
    webServer: process.env.CI ? undefined : {
        command: 'npm run dev',
        port: 3000,
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
        env: {
            NODE_ENV: 'development'
        }
    }
};

export default config;
