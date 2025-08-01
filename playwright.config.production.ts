import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./testing/load-testing",
    timeout: 120000, // 2 minutes for production tests
    workers: process.env.CI ? 1 : 2,
    reporter: [
        ["html", { outputFolder: "test-results/production-html" }],
        ["junit", { outputFile: "test-results/production-junit.xml" }],
        ["line"],
    ],
    use: {
        baseURL: "https://rankpilot-h3jpc.web.app",
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
        actionTimeout: 30000,
        navigationTimeout: 60000,
    },
    expect: {
        timeout: 15000,
    },
    outputDir: "test-results/production/",

    projects: [
        {
            name: "production-chrome",
            use: {
                ...devices["Desktop Chrome"],
                launchOptions: {
                    args: [
                        '--disable-setuid-sandbox',
                        '--max_old_space_size=2048', // Safe for production
                        '--memory-pressure-off',
                        '--disable-dev-shm-usage'
                    ],
                    env: {
                        NODE_OPTIONS: '--max-old-space-size=2048',
                    }
                },
            },
        },
        {
            name: "production-firefox",
            use: {
                ...devices["Desktop Firefox"],
                launchOptions: {
                    env: {
                        NODE_OPTIONS: '--max-old-space-size=2048',
                    }
                },
            },
        },
        {
            name: "production-mobile",
            use: {
                ...devices["iPhone 13"],
                // Simplified launch options for WebKit compatibility
            },
        },
    ],

    // Global setup for production testing
    globalSetup: require.resolve("./testing/load-testing/global-setup.ts"),
    globalTeardown: require.resolve("./testing/load-testing/global-teardown.ts"),
});
