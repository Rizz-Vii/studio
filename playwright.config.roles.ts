import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright Configuration for Role-Based Testing
 * Optimized for parallel execution with dedicated workers per user role
 */
export default defineConfig({
  testDir: "./tests",
  
  /* Maximum time one test can run for */
  timeout: 60000,
  
  /* Test timeout expectations */
  expect: {
    timeout: 10000,
  },
  
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1,
  
  /* Opt out of parallel tests on CI for stability */
  workers: process.env.CI ? 2 : 4,
  
  /* Reporter to use */
  reporter: [
    ["html", { outputFolder: "test-results/role-based-report" }],
    ["json", { outputFile: "test-results/role-based-results.json" }],
    ["junit", { outputFile: "test-results/role-based-junit.xml" }],
    process.env.CI ? ["github"] : ["list"]
  ],
  
  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: "http://localhost:3000",
    
    /* Collect trace when retrying the failed test */
    trace: "on-first-retry",
    
    /* Screenshot on failure */
    screenshot: "only-on-failure",
    
    /* Video recording */
    video: "retain-on-failure",
    
    /* Navigation timeout */
    navigationTimeout: 30000,
    
    /* Action timeout */
    actionTimeout: 15000,
  },

  /* Configure projects for major browsers and test types */
  projects: [
    // Role-based testing projects - each gets dedicated workers
    {
      name: "role-based-comprehensive",
      testMatch: "**/role-based-comprehensive.spec.ts",
      use: { 
        ...devices["Desktop Chrome"],
        // Dedicated worker pool for comprehensive tests
        launchOptions: {
          args: ["--disable-web-security", "--disable-features=VizDisplayCompositor"],
        },
      },
      fullyParallel: false, // Sequential within role tests for stability
    },
    
    {
      name: "role-based-optimized",
      testMatch: "**/role-based-optimized.spec.ts", 
      use: {
        ...devices["Desktop Chrome"],
        // Optimized for fast parallel execution
        launchOptions: {
          args: ["--disable-web-security", "--no-sandbox"],
        },
      },
      fullyParallel: true, // Parallel execution for speed
    },

    // Browser-specific role testing
    {
      name: "role-firefox",
      testMatch: "**/role-based-optimized.spec.ts",
      use: { ...devices["Desktop Firefox"] },
      fullyParallel: true,
    },

    {
      name: "role-webkit", 
      testMatch: "**/role-based-optimized.spec.ts",
      use: { ...devices["Desktop Safari"] },
      fullyParallel: true,
    },

    // Mobile role testing
    {
      name: "role-mobile-chrome",
      testMatch: "**/role-based-optimized.spec.ts",
      use: { ...devices["Pixel 5"] },
      fullyParallel: true,
    },

    {
      name: "role-mobile-safari",
      testMatch: "**/role-based-optimized.spec.ts", 
      use: { ...devices["iPhone 12"] },
      fullyParallel: true,
    },
  ],

  /* Folder for test artifacts */
  outputDir: "test-results/role-based-artifacts",

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "npm run dev-no-turbopack",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    stdout: "pipe",
    stderr: "pipe",
  },

  /* Global setup and teardown */
  globalSetup: require.resolve("./tests/utils/global-setup.ts"),
  globalTeardown: require.resolve("./tests/utils/global-teardown.ts"),
});
