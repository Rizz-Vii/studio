import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright Configuration for Lean Channel Testing - Enterprise Enhanced
 * 
 * Combines production-ready lean testing with enterprise infrastructure capabilities:
 * - Firebase preview channel testing support
 * - Advanced reporting with multiple formats
 * - Mobile and performance testing integration
 * - Enterprise-grade timeout and retry configurations
 */
export default defineConfig({
    testDir: "./testing",
    timeout: 120000, // 2 minutes for lean channel testing
    workers: process.env.CI ? 1 : 4,

    // Enhanced reporting for enterprise environments
    reporter: [
        ["html", { outputFolder: "test-results/lean-html", open: 'never' }],
        ["junit", { outputFile: "test-results/lean-junit.xml" }],
        ["json", { outputFile: "test-results/lean-report.json" }],
        ["line"],
        ["github"]
    ],

    use: {
        // Enhanced base URL support with multiple fallbacks
        baseURL: process.env.TEST_URL || process.env.TEST_BASE_URL || process.env.LEAN_URL || "https://rankpilot-h3jpc--lean-branch-testing-o2qips67.web.app",
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
        actionTimeout: 30000,
        navigationTimeout: 60000,

        // Enterprise lean channel specific settings
        extraHTTPHeaders: {
            "Accept": "application/json, text/plain, */*",
            "Cache-Control": "no-cache"
        }
    },

    expect: {
        timeout: 15000
    },

    // Enterprise testing projects with comprehensive coverage
    projects: [
        {
            name: "lean-critical",
            testMatch: ["**/critical-systems.spec.ts", "**/?(*.)@lean.spec.ts"],
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

    // Enhanced output configuration
    outputDir: "test-results/lean-output",
    preserveOutput: "failures-only",

    // Enterprise stability configuration
    retries: 1,
    globalTimeout: 15 * 60 * 1000, // 15 minutes

    // Skip slow tests in lean mode for faster feedback
    grepInvert: /@slow/,

    // Lean channel health check
    webServer: process.env.CI ? undefined : {
        command: 'echo "Enterprise lean channel testing ready"',
        port: 0,
        reuseExistingServer: true
    }
});
