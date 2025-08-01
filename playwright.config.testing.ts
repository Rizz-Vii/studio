import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./testing/load-testing",
    timeout: 120000, // 2 minutes for testing environment
    workers: process.env.CI ? 1 : 2,
    reporter: [
        ["html", { outputFolder: "test-results/testing-html" }],
        ["junit", { outputFile: "test-results/testing-junit.xml" }],
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
    outputDir: "test-results/testing/",

    projects: [
        {
            name: "testing-chrome",
            use: { ...devices["Desktop Chrome"] },
        },
        {
            name: "testing-firefox",
            use: { ...devices["Desktop Firefox"] },
        },
        {
            name: "testing-mobile",
            use: { ...devices["iPhone 13"] },
        },
    ],

    // Global setup for testing environment
    globalSetup: require.resolve("./testing/load-testing/global-setup-testing.ts"),
    globalTeardown: require.resolve("./testing/load-testing/global-teardown.ts"),
});
