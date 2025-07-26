import { devices, PlaywrightTestConfig } from "@playwright/test";

// Test user configuration for all tiers
export const TEST_USERS = {
  free: {
    email: "abbas_ali_rizvi@hotmail.com",
    password: "123456",
    tier: "free",
    displayName: "Abbas Ali (Free)"
  },
  starter: {
    email: "starter@rankpilot.com", 
    password: "starter123",
    tier: "starter",
    displayName: "Starter User"
  },
  agency: {
    email: "enterprise@rankpilot.com",
    password: "enterprise123", 
    tier: "agency",
    displayName: "Agency User (Enterprise)"
  },
  enterprise: {
    email: "enterprise@rankpilot.com",
    password: "enterprise123",
    tier: "enterprise", 
    displayName: "Enterprise User"
  },
  admin: {
    email: "admin@rankpilot.com",
    password: "admin123",
    tier: "admin",
    displayName: "Admin User"
  }
};

// Helper function to get test user by tier
export function getTestUser(tier: keyof typeof TEST_USERS) {
  return TEST_USERS[tier];
}

// Environment configuration
export const TEST_CONFIG = {
  baseURL: process.env.TEST_BASE_URL || "http://localhost:3000",
  apiBaseURL: process.env.API_BASE_URL || "http://localhost:3000/api",
  isCI: !!process.env.CI,
  isDebug: process.env.DEBUG === "true",
  browser: process.env.BROWSER || "chromium",
  headless: process.env.HEADLESS !== "false",
};

const config: PlaywrightTestConfig = {
  testDir: "../specs/main",
  timeout: 60000,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : 4,
  globalSetup: "../specs/main/global-setup.ts",
  globalTeardown: "../specs/main/global-teardown.ts",
  reporter: [
    ["list"],
    ["html", { outputFolder: "../results/html-report" }],
    ["junit", { outputFile: "../results/junit.xml" }],
    ["json", { outputFile: "../results/test-results.json" }],
  ],
  use: {
    baseURL: TEST_CONFIG.baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure", 
    video: "retain-on-failure",
    actionTimeout: 30000,
    navigationTimeout: 30000,
    // Test-specific context
    extraHTTPHeaders: {
      "X-Test-Environment": "automated-testing",
      "X-Test-Runner": "playwright",
    },
  },
  expect: {
    timeout: 10000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.1,
      threshold: 0.2,
      animations: "disabled",
    },
  },
  outputDir: "../results/test-output",
  snapshotDir: "../snapshots",
  projects: [
    // Standard Chromium testing
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
      },
    },
    // Role-based testing projects
    {
      name: "free-tier",
      testMatch: "**/*free*.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
        storageState: undefined, // Fresh state for each tier
      },
    },
    {
      name: "starter-tier", 
      testMatch: "**/*starter*.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
        storageState: undefined,
      },
    },
    {
      name: "agency-tier",
      testMatch: "**/*agency*.spec.ts", 
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
        storageState: undefined,
      },
    },
    {
      name: "enterprise-tier",
      testMatch: "**/*enterprise*.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
        storageState: undefined,
      },
    },
    {
      name: "admin-tier",
      testMatch: "**/*admin*.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
        storageState: undefined,
      },
    },
  ],
  webServer: {
    command: "npm run dev",
    port: 3000,
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },
};

export default config;
