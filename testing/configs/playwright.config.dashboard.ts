import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "../specs/main",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "html",
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    headless: true,
    actionTimeout: 10000,
  },
  projects: [
    {
      name: "chromium-dashboard",
      use: {
        ...require("@playwright/test").devices["Desktop Chrome"],
      },
      testMatch: ["**/dashboard.spec.ts"],
    },
  ],
  webServer: {
    command: "npm run dev-no-turbopack",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
