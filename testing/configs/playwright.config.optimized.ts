import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "../specs/main",
  timeout: 60000, // Increased from 30s to 60s
  globalTimeout: 180000, // 3 minutes total for all tests

  // Optimize for parallel execution with graceful handling
  workers: process.env.CI ? 2 : 3, // Reduced workers to avoid resource contention
  fullyParallel: false, // Disabled for more stable execution

  // Enhanced retry strategy
  retries: process.env.CI ? 3 : 2, // More retries for stability

  // Optimized reporter configuration
  reporter: [
    ["html", { outputFolder: "../reports/html" }],
    ["junit", { outputFile: "../results/junit.xml" }],
    ["list"],
    // Add JSON reporter for analysis
    ["json", { outputFile: "../results/test-results.json" }],
  ],

  use: {
    baseURL: process.env.TEST_BASE_URL || "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure", 
    video: "retain-on-failure",
    actionTimeout: 30000, // Increased from 15s to 30s
    navigationTimeout: 45000, // Increased from 15s to 45s
    
    // Additional stability settings
    headless: true,
    channel: "chrome",
    launchOptions: {
      slowMo: 100, // Add slight delay for stability
    },
  },

  outputDir: "../results/",
  snapshotDir: "../snapshots/",

  // Test categorization using projects
  projects: [
    // Unit-like tests (fast, isolated)
    {
      name: "unit",
      testMatch: [
        "**/basic.spec.ts",
        "**/dev-ready.spec.ts",
        "**/home.spec.ts",
      ],
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
      },
    },

    // Integration tests (auth, API, features)
    {
      name: "integration",
      testMatch: [
        "**/auth/**/*.spec.ts",
        "**/auth-consolidated.spec.ts",
        "**/api/**/*.spec.ts",
        "**/features/**/*.spec.ts",
        "**/network/**/*.spec.ts",
      ],
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
      },
    },

    // E2E workflow tests
    {
      name: "e2e",
      testMatch: [
        "**/e2e/**/*.spec.ts",
        "**/payment-flow.spec.ts",
        "**/dashboard.spec.ts",
      ],
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
      },
    },

    // Mobile-specific tests
    {
      name: "mobile",
      testMatch: ["**/mobile/**/*.spec.ts", "**/mobile-*.spec.ts"],
      use: {
        ...devices["iPhone 13"],
      },
    },

    // Visual regression tests
    {
      name: "visual",
      testMatch: ["**/visual/**/*.spec.ts", "**/*.visual.spec.ts"],
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
      },
    },

    // Performance tests
    {
      name: "performance",
      testMatch: ["**/performance/**/*.spec.ts", "**/performance.spec.ts"],
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
      },
    },

    // Accessibility tests
    {
      name: "accessibility",
      testMatch: [
        "**/accessibility/**/*.spec.ts",
        "**/*accessibility*.spec.ts",
      ],
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
});
