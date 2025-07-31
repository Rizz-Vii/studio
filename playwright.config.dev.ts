import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./testing/load-testing",
    timeout: 90000, // 1.5 minutes for development
    workers: process.env.CI ? 1 : 2,
    reporter: [
        ["html", { outputFolder: "test-results/dev-html" }],
        ["line"],
    ],
    use: {
        baseURL: "http://localhost:3000",
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
        actionTimeout: 20000,
        navigationTimeout: 30000,
    },
    expect: {
        timeout: 10000,
    },
    outputDir: "test-results/dev/",

    projects: [
        {
            name: "dev-chrome",
            use: { ...devices["Desktop Chrome"] },
        },
        {
            name: "dev-mobile",
            use: { ...devices["iPhone 13"] },
        },
    ],

    // Global setup for development testing
    globalSetup: require.resolve("./testing/load-testing/global-setup-dev.ts"),
    globalTeardown: require.resolve("./testing/load-testing/global-teardown.ts"),
});
