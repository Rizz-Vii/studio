import { defineConfig } from "@playwright/test";

export default defineConfig({
  use: {
    baseURL: "https://rankpilot-h3jpc.web.app",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  workers: 1,
  retries: 2,
  reporter: [
    ["html"],
    ["junit", { outputFile: "../results/junit.xml" }],
    ["github"],
  ],
  fullyParallel: false,
  forbidOnly: true,
});
