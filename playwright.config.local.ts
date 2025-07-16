import { defineConfig, devices } from "@playwright/test";

/**
 * Local development Playwright config
 * Optimized for testing against local development server
 */
export default defineConfig({
  testDir: "./tests",
  timeout: 60000, // Increased for slow compilation
  workers: 1, // Sequential execution for local development
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  reporter: [["list"], ["html", { open: "never" }]],

  // Global setup to ensure dev server is ready
  globalSetup: require.resolve("./tests/global-setup.ts"),

  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 30000, // Increased for slow compilation
    navigationTimeout: 60000, // Increased for initial page loads
  },

  expect: {
    timeout: 15000, // Increased for slow DOM updates
  },

  // Test execution order - critical for local development
  testMatch: [
    // 1. Basic infrastructure first
    "**/home.spec.ts",
    "**/basic.spec.ts",
    "**/public-pages.spec.ts",

    // 2. Skip tests for unimplemented features
    // Skip: "**/auth/**/*.spec.ts" - auth not implemented
    // Skip: "**/api/**/*.spec.ts" - API endpoints not implemented
    // Skip: "**/accessibility/**/*.spec.ts" - pages not ready

    // 3. Visual tests last (after pages are compiled)
    "**/performance/**/*.spec.ts",
    "**/mobile/**/*.spec.ts",
  ],

  projects: [
    {
      name: "chromium-local",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    timeout: 120000,
    reuseExistingServer: true, // Use existing server if available
  },
});
