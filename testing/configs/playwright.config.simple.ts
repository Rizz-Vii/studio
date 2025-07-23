import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "../specs/main",
  timeout: 30000,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: process.env.TEST_BASE_URL || "https://rankpilot-h3jpc--performance-testing-mw0cwov5.web.app",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 15000,
    navigationTimeout: 15000,
  },
  outputDir: "../results/",
  snapshotDir: "../snapshots/",
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
});
