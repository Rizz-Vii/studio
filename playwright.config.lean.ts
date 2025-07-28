import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright Configuration for Lean Channel Testing
 * Optimized for testing deployed lean branch URLs
 */
export default defineConfig({
    testDir: "./testing",
    timeout: 120000, // 2 minutes for lean channel testing
    workers: process.env.CI ? 1 : 2,

    reporter: [
        ["html", { outputFolder: "test-results/lean-html" }],
        ["junit", { outputFile: "test-results/lean-junit.xml" }],
        ["line"],
        ["github"]
    ],

    use: {
        // Base URL will be overridden by TEST_BASE_URL env var
        baseURL: process.env.TEST_BASE_URL || process.env.LEAN_URL || "https://rankpilot-h3jpc--lean-branch-testing-o2qips67.web.app",
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
        actionTimeout: 30000,
        navigationTimeout: 60000,

        // Lean channel specific settings
        extraHTTPHeaders: {
            "Accept": "application/json, text/plain, */*",
            "Cache-Control": "no-cache"
        }
    },

    expect: {
        timeout: 15000
    },

    projects: [
        {
            name: "lean-critical",
            testMatch: "**/critical-systems.spec.ts",
            use: { ...devices["Desktop Chrome"] },
        },
        {
            name: "lean-mobile",
            testMatch: "**/mobile-nav-consolidated.spec.ts",
            use: { ...devices["iPhone 14"] },
        },
        {
            name: "lean-performance",
            testMatch: "**/*performance*.spec.ts",
            use: { ...devices["Desktop Chrome"] },
        }
    ],

    outputDir: "test-results/lean-output",

    // Lean channel health check
    webServer: process.env.CI ? undefined : {
        command: 'echo "Lean channel testing ready"',
        port: 0,
        reuseExistingServer: true
    }
});
