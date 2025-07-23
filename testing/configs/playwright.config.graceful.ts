import { defineConfig, devices } from "@playwright/test";

/**
 * Graceful Test Configuration - Optimized for stability over speed
 * Handles long wait times and resource-constrained environments
 */
export default defineConfig({
  testDir: "../specs/main",
  timeout: 90000, // 90 seconds per test
  globalTimeout: 300000, // 5 minutes total
  
  // Conservative parallel execution
  workers: 1, // Single worker for maximum stability
  fullyParallel: false,
  
  // Enhanced retry strategy
  retries: 3,
  
  // Minimal reporter for performance
  reporter: [
    ["list", { printSteps: true }],
    ["html", { outputFolder: "../reports/graceful-html", open: "never" }],
  ],

  use: {
    baseURL: process.env.TEST_BASE_URL || "https://rankpilot-h3jpc--performance-testing-mw0cwov5.web.app",
    
    // Extended timeouts for slow environments
    actionTimeout: 45000, // 45 seconds
    navigationTimeout: 60000, // 60 seconds
    
    // Minimal resource usage
    trace: "off",
    screenshot: "only-on-failure",
    video: "off",
    
    // Browser optimization for stability
    headless: true,
    channel: "chrome",
    launchOptions: {
      slowMo: 250, // Quarter second delay between actions
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--memory-pressure-off",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding",
      ],
    },
  },

  outputDir: "../results/graceful/",

  // Single project for maximum compatibility
  projects: [
    {
      name: "graceful-chrome",
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
  ],

  // Use existing server - don't start a new one
  // webServer: {
  //   command: "npm run dev-no-turbopack",
  //   port: 3000,
  //   timeout: 120000, // 2 minutes to start
  //   reuseExistingServer: true,
  //   stdout: "pipe",
  //   stderr: "pipe",
  // },

  // Enhanced expect settings
  expect: {
    timeout: 15000, // 15 seconds for assertions
    toHaveScreenshot: { threshold: 0.4 },
    toMatchSnapshot: { threshold: 0.4 },
  },
});
